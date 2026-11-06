import { z } from "zod";
import { getPart } from "@/config/exam";
import { AiConfigError, AiOutputError } from "@/lib/ai/client";
import { evaluateSpeaking } from "@/lib/ai/evaluate-speaking";
import { consumeGeneration, refundGeneration, remainingToday } from "@/lib/server/usage";
import { wordsOf } from "@/lib/speaking";

export const maxDuration = 120;

const bodySchema = z.object({
  partId: z.enum(["s1", "s2", "s3", "s4"]),
  answers: z
    .array(
      z.object({
        prompt: z.string().trim().min(5).max(1500),
        transcript: z.string().trim().max(5000),
        durationSec: z.number().min(0).max(900),
      }),
    )
    .min(1)
    .max(8),
});

const MIN_TOTAL_WORDS = 15;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** POST /api/speaking  { partId, answers:[{prompt, transcript, durationSec}] }  →  { evaluation, remainingToday } */
export async function POST(request: Request) {
  const accessCode = process.env.APP_ACCESS_CODE;
  if (accessCode && request.headers.get("x-access-code") !== accessCode) {
    return json({ error: "Código de acceso incorrecto o ausente.", code: "unauthorized" }, 401);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Petición no válida.", code: "bad_request" }, 400);
  const { partId, answers } = parsed.data;

  if (answers.reduce((a, x) => a + wordsOf(x.transcript), 0) < MIN_TOTAL_WORDS) {
    return json({ error: `Habla o escribe al menos ${MIN_TOTAL_WORDS} palabras en total para poder evaluarlo.`, code: "too_short" }, 400);
  }

  if (!consumeGeneration()) {
    return json({ error: "Has alcanzado el límite diario de usos de IA.", code: "daily_limit", remainingToday: 0 }, 429);
  }

  try {
    const evaluation = await evaluateSpeaking({ partName: `Part ${getPart(partId).number} — ${getPart(partId).name}`, answers });
    return json({ evaluation, remainingToday: remainingToday() });
  } catch (e) {
    refundGeneration();
    if (e instanceof AiConfigError) return json({ error: e.message, code: "not_configured" }, 503);
    if (e instanceof AiOutputError) return json({ error: e.message, code: "invalid_output" }, 502);
    console.error("speaking error", e);
    return json({ error: "Error al evaluar tu respuesta. Inténtalo de nuevo.", code: "upstream_error" }, 502);
  }
}
