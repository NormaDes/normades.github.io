import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { APP_SETTINGS, getModel } from "@/config/app";

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

/**
 * Pide a Claude un JSON y lo valida con `validate` (zod + reglas semánticas, devuelve lista de problemas).
 * Si falla, reintenta UNA vez indicando los errores concretos.
 */
export async function generateValidatedJson<T>(opts: {
  system: string;
  user: string;
  validate: (data: unknown) => { ok: true; value: T } | { ok: false; problems: string[] };
}): Promise<T> {
  const client = getAnthropic();
  const model = getModel();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: opts.user }];
  let lastProblems: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await client.messages.create({
      model,
      max_tokens: APP_SETTINGS.maxOutputTokens,
      system: opts.system,
      messages,
    });

    if (res.stop_reason === "refusal") {
      throw new AiOutputError("El modelo rechazó la petición. Prueba con otro tema.");
    }
    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    try {
      const data = extractJson(text);
      const result = opts.validate(data);
      if (result.ok) return result.value;
      lastProblems = result.problems;
    } catch (e) {
      lastProblems = [e instanceof Error ? e.message : "JSON no válido"];
    }

    messages.push({ role: "assistant", content: text || "{}" });
    messages.push({
      role: "user",
      content: `Your JSON failed validation. Fix ALL of these problems and return the complete corrected JSON object only:\n- ${lastProblems.slice(0, 12).join("\n- ")}`,
    });
  }
  throw new AiOutputError(`La IA no devolvió un ejercicio válido tras reintentar: ${lastProblems.slice(0, 3).join(" | ")}`);
}
