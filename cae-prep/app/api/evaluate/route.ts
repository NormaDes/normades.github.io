import { z } from "zod";
import { AiConfigError, AiOutputError } from "@/lib/ai/client";
import { evaluateWriting } from "@/lib/ai/evaluate";
import { authorize } from "@/lib/server/guard";
import { consumeGeneration, refundGeneration, remainingToday } from "@/lib/server/usage";
import { countTextWords } from "@/lib/writing";

export const maxDuration = 120;

const bodySchema = z.object({
  taskType: z.string().trim().min(2).max(30),
  task: z.string().trim().min(20).max(2500),
  text: z.string().trim().min(50).max(6000),
});

const MIN_WORDS = 40;
const MAX_WORDS = 600;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** POST /api/evaluate  { taskType, task, text }  →  { evaluation, remainingToday } */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Petición no válida.", code: "bad_request" }, 400);
  const { taskType, task, text } = parsed.data;

  const words = countTextWords(text);
  if (words < MIN_WORDS) return json({ error: `Escribe al menos ${MIN_WORDS} palabras para poder evaluarlo.`, code: "too_short" }, 400);
  if (words > MAX_WORDS) return json({ error: `El texto supera las ${MAX_WORDS} palabras.`, code: "too_long" }, 400);

  if (!(await consumeGeneration(userId))) {
    return json({ error: "Has alcanzado el límite diario de usos de IA.", code: "daily_limit", remainingToday: 0 }, 429);
  }

  try {
    const evaluation = await evaluateWriting({ taskType, task, text, wordCount: words });
    return json({ evaluation, remainingToday: await remainingToday(userId) });
  } catch (e) {
    await refundGeneration(userId);
    if (e instanceof AiConfigError) return json({ error: e.message, code: "not_configured" }, 503);
    if (e instanceof AiOutputError) return json({ error: e.message, code: "invalid_output" }, 502);
    console.error("evaluate error", e);
    return json({ error: "Error al evaluar el texto. Inténtalo de nuevo.", code: "upstream_error" }, 502);
  }
}
