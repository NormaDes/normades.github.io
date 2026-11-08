import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { APP_SETTINGS, getModel } from "@/config/app";
import { aiConfigured, aiProvider } from "@/lib/ai/provider";

let _client: Anthropic | null = null;

/** Cliente de Anthropic: SOLO servidor. La clave viene de ANTHROPIC_API_KEY. */
export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiConfigError("Falta ANTHROPIC_API_KEY en las variables de entorno del servidor.");
  }
  if (!_client) _client = new Anthropic();
  return _client;
}

export class AiConfigError extends Error {}
export class AiOutputError extends Error {}

/** Extrae el primer objeto JSON de un texto (tolera ```json … ``` y texto alrededor). */
export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) throw new Error("No se encontró un objeto JSON en la respuesta.");
  return JSON.parse(candidate.slice(start, end + 1));
}

type Turn = { role: "user" | "assistant"; content: string };

async function completeAnthropic(system: string, turns: Turn[]): Promise<string> {
  const res = await getAnthropic().messages.create({
    model: getModel(),
    max_tokens: APP_SETTINGS.maxOutputTokens,
    system,
    messages: turns,
  });
  if (res.stop_reason === "refusal") throw new AiOutputError("El modelo rechazó la petición. Prueba con otro tema.");
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

/** Modelo de Gemini descubierto en la cuenta (se guarda mientras el servidor siga vivo). */
let discoveredGeminiModel: string | null = null;

/** Pregunta a Google qué modelos «flash» puede usar esta clave y elige el más reciente. */
async function discoverGeminiModel(base: string, key: string): Promise<string | null> {
  try {
    const res = await fetch(`${base}/v1beta/models?pageSize=200`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const data = (await res.json()) as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
    const names = (data.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => (m.name ?? "").replace(/^models\//, ""))
      .filter((n) => /^gemini-[\d.]+-flash(-\d+)?$/.test(n) || /^gemini-flash-latest$/.test(n));
    const version = (n: string) => Number((n.match(/gemini-([\d.]+)-flash/) ?? [])[1] ?? 0);
    names.sort((a, b) => version(b) - version(a));
    return names.find((n) => /-flash(-\d+)?$/.test(n) && !/latest/.test(n)) ?? names[0] ?? null;
  } catch {
    return null;
  }
}

async function geminiRequest(base: string, key: string, model: string, system: string, turns: Turn[]): Promise<Response> {
  return fetch(`${base}/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      generationConfig: { maxOutputTokens: APP_SETTINGS.maxOutputTokens, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(110_000),
  });
}

/** Gemini (Google AI Studio, tiene nivel gratuito). API REST, sin SDK. */
async function completeGemini(system: string, turns: Turn[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiConfigError("Falta GEMINI_API_KEY en las variables de entorno del servidor.");
  const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
  let model = process.env.GEMINI_MODEL || discoveredGeminiModel || "gemini-flash-latest";
  let res = await geminiRequest(base, key, model, system, turns);

  // Modelo inexistente para esta clave: se busca uno disponible y se reintenta una vez
  if (res.status === 404) {
    const found = await discoverGeminiModel(base, key);
    if (found && found !== model) {
      console.warn(`[gemini] «${model}» no existe; uso «${found}»`);
      model = found;
      discoveredGeminiModel = found;
      res = await geminiRequest(base, key, model, system, turns);
    }
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    let detail = "";
    try {
      detail = (JSON.parse(raw) as { error?: { message?: string } }).error?.message ?? "";
    } catch {
      detail = raw.slice(0, 200);
    }
    console.error(`[gemini] ${res.status} (${model}): ${detail}`);
    if (res.status === 429) throw new AiOutputError("Se ha alcanzado el límite gratuito de Gemini. Espera un minuto o inténtalo mañana.");
    if (res.status === 400 && /api key/i.test(detail)) throw new AiOutputError("La clave de Gemini no es válida. Revisa GEMINI_API_KEY en Vercel y vuelve a desplegar.");
    if (res.status === 403) throw new AiOutputError(`Gemini ha rechazado la petición (403): ${detail.slice(0, 160) || "clave sin permisos o región no permitida"}.`);
    if (res.status === 404) throw new AiOutputError(`Gemini no encuentra el modelo «${model}» ni ningún otro «flash» para tu clave. Crea una clave nueva en aistudio.google.com (proyecto nuevo) y cámbiala en Vercel.`);
    throw new AiOutputError(`Gemini respondió con error ${res.status}${detail ? `: ${detail.slice(0, 160)}` : ""}.`);
  }
  const data = (await res.json()) as { candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>; promptFeedback?: { blockReason?: string } };
  const cand = data.candidates?.[0];
  if (!cand) throw new AiOutputError("El modelo rechazó la petición. Prueba con otro tema.");
  return (cand.content?.parts ?? []).map((p) => p.text ?? "").join("\n");
}

/**
 * Pide al modelo un JSON y lo valida con `validate` (zod + reglas semánticas, devuelve lista de problemas).
 * Si falla, reintenta UNA vez indicando los errores concretos.
 */
export async function generateValidatedJson<T>(opts: {
  system: string;
  user: string;
  validate: (data: unknown) => { ok: true; value: T } | { ok: false; problems: string[] };
}): Promise<T> {
  if (!aiConfigured()) throw new AiConfigError("No hay ninguna clave de IA configurada (ANTHROPIC_API_KEY o GEMINI_API_KEY).");
  const complete = aiProvider() === "gemini" ? completeGemini : completeAnthropic;
  const turns: Turn[] = [{ role: "user", content: opts.user }];
  let lastProblems: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await complete(opts.system, turns);
    try {
      const data = extractJson(text);
      const result = opts.validate(data);
      if (result.ok) return result.value;
      lastProblems = result.problems;
    } catch (e) {
      lastProblems = [e instanceof Error ? e.message : "JSON no válido"];
    }

    turns.push({ role: "assistant", content: text || "{}" });
    turns.push({
      role: "user",
      content: `Your JSON failed validation. Fix ALL of these problems and return the complete corrected JSON object only:\n- ${lastProblems.slice(0, 12).join("\n- ")}`,
    });
  }
  throw new AiOutputError(`La IA no devolvió un ejercicio válido tras reintentar: ${lastProblems.slice(0, 3).join(" | ")}`);
}
