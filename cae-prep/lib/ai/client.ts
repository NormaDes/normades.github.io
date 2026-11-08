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

/** Gemini (Google AI Studio, tiene nivel gratuito). API REST, sin SDK. */
async function completeGemini(system: string, turns: Turn[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiConfigError("Falta GEMINI_API_KEY en las variables de entorno del servidor.");
  const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(`${base}/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      generationConfig: { maxOutputTokens: APP_SETTINGS.maxOutputTokens, responseMimeType: "application/json" },
    }),
    signal: AbortSignal.timeout(110_000),
  });
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
    if (res.status === 404) throw new AiOutputError(`Gemini no encuentra el modelo «${model}». Prueba a definir GEMINI_MODEL=gemini-2.0-flash en Vercel.`);
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
