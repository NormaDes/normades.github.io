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

/* ───────── Gemini (Google AI Studio, con nivel gratuito) ───────── */

const GEMINI_RETRYABLE = new Set([429, 500, 502, 503, 504]);
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.0-flash"];

let modelCache: { at: number; list: string[] } | null = null;
/** Modelos donde el ajuste «sin razonamiento» dio error 400: no se vuelve a enviar */
const noThinkingConfig = new Set<string>();

const flashVersion = (n: string) => Number((n.match(/gemini-([\d.]+)-flash/) ?? [])[1] ?? 99);

/** Modelos «flash» que esta clave puede usar, del mejor al más ligero. Se guarda 10 minutos. */
async function geminiModels(base: string, key: string): Promise<string[]> {
  const pinned = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : [];
  if (modelCache && Date.now() - modelCache.at < 600_000) return [...pinned, ...modelCache.list];
  let list: string[] = [];
  try {
    const res = await fetch(`${base}/v1beta/models?pageSize=200`, { headers: { "x-goog-api-key": key }, signal: AbortSignal.timeout(10_000) });
    if (res.ok) {
      const data = (await res.json()) as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
      const names = (data.models ?? [])
        .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m) => (m.name ?? "").replace(/^models\//, ""))
        .filter((n) => /^gemini-[\d.]+-flash(-lite)?(-\d+)?$/.test(n));
      const full = names.filter((n) => !/lite/.test(n)).sort((x, y) => flashVersion(y) - flashVersion(x));
      const lite = names.filter((n) => /lite/.test(n)).sort((x, y) => flashVersion(y) - flashVersion(x));
      list = [...full, ...lite];
    }
  } catch {
    // sin lista: se usan los alias
  }
  if (!list.length) list = FALLBACK_MODELS;
  modelCache = { at: Date.now(), list };
  return [...pinned, ...list];
}

function geminiRequest(base: string, key: string, model: string, system: string, turns: Turn[]): Promise<Response> {
  const generationConfig: Record<string, unknown> = { maxOutputTokens: APP_SETTINGS.maxOutputTokens, responseMimeType: "application/json" };
  // Sin «razonamiento» interno: respuestas mucho más rápidas para generar ejercicios
  if (!noThinkingConfig.has(model)) generationConfig.thinkingConfig = { thinkingBudget: 0 };
  return fetch(`${base}/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
      generationConfig,
    }),
    signal: AbortSignal.timeout(55_000),
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function errorDetail(res: Response): Promise<string> {
  const raw = await res.text().catch(() => "");
  try {
    return (JSON.parse(raw) as { error?: { message?: string } }).error?.message ?? raw.slice(0, 200);
  } catch {
    return raw.slice(0, 200);
  }
}

async function completeGemini(system: string, turns: Turn[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiConfigError("Falta GEMINI_API_KEY en las variables de entorno del servidor.");
  const base = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
  const models = (await geminiModels(base, key)).slice(0, 4);

  let last = { status: 0, detail: "", model: models[0] ?? "" };
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      let res: Response;
      try {
        res = await geminiRequest(base, key, model, system, turns);
      } catch (e) {
        last = { status: 0, detail: e instanceof Error ? e.message : "sin respuesta", model };
        break; // tiempo agotado o red: pasa al siguiente modelo
      }

      if (res.ok) {
        const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
        const cand = data.candidates?.[0];
        if (!cand) throw new AiOutputError("El modelo rechazó la petición. Prueba con otro tema.");
        return (cand.content?.parts ?? []).map((p) => p.text ?? "").join("\n");
      }

      const detail = await errorDetail(res);
      last = { status: res.status, detail, model };
      console.error(`[gemini] ${res.status} (${model}): ${detail}`);

      if (res.status === 400 && /thinking/i.test(detail) && !noThinkingConfig.has(model)) {
        noThinkingConfig.add(model);
        attempt--; // repite el mismo modelo sin el ajuste
        continue;
      }
      if (res.status === 400 && /api key/i.test(detail)) throw new AiOutputError("La clave de Gemini no es válida. Revisa GEMINI_API_KEY en Vercel y vuelve a desplegar.");
      if (res.status === 403) throw new AiOutputError(`Gemini ha rechazado la petición (403): ${detail.slice(0, 160) || "clave sin permisos o región no permitida"}.`);
      if (res.status === 404) break; // modelo inexistente: siguiente
      if (GEMINI_RETRYABLE.has(res.status)) {
        if (attempt === 0) await sleep(1200); // un reintento rápido con el mismo modelo
        continue;
      }
      throw new AiOutputError(`Gemini respondió con error ${res.status}${detail ? `: ${detail.slice(0, 160)}` : ""}.`);
    }
  }

  if (last.status === 429) throw new AiOutputError("Se ha alcanzado el límite gratuito de Gemini. Espera un minuto o inténtalo mañana.");
  if (last.status === 404) throw new AiOutputError("Gemini no encuentra ningún modelo «flash» para tu clave. Crea una clave nueva en aistudio.google.com (proyecto nuevo) y cámbiala en Vercel.");
  if (GEMINI_RETRYABLE.has(last.status) || last.status === 0) throw new AiOutputError("Gemini está saturado en este momento. Inténtalo de nuevo en un minuto.");
  throw new AiOutputError(`Gemini respondió con error ${last.status}: ${last.detail.slice(0, 160)}.`);
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
