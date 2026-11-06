import { z } from "zod";
import { AiConfigError, AiOutputError } from "@/lib/ai/client";
import { enrichVocab } from "@/lib/ai/vocab";
import { authorize } from "@/lib/server/guard";
import { consumeGeneration, refundGeneration, remainingToday } from "@/lib/server/usage";

export const maxDuration = 60;

const bodySchema = z.object({
  items: z
    .array(z.object({ term: z.string().trim().min(1).max(80), context: z.string().trim().max(400).optional() }))
    .min(1)
    .max(8),
});

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** POST /api/vocab-enrich { items:[{term, context?}] } → { items:[…], remainingToday } (1 uso de IA por lote) */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Petición no válida.", code: "bad_request" }, 400);

  if (!(await consumeGeneration(userId))) {
    return json({ error: "Has alcanzado el límite diario de usos de IA.", code: "daily_limit", remainingToday: 0 }, 429);
  }
  try {
    const items = await enrichVocab(parsed.data.items);
    return json({ items, remainingToday: await remainingToday(userId) });
  } catch (e) {
    await refundGeneration(userId);
    if (e instanceof AiConfigError) return json({ error: e.message, code: "not_configured" }, 503);
    if (e instanceof AiOutputError) return json({ error: e.message, code: "invalid_output" }, 502);
    console.error("vocab-enrich error", e);
    return json({ error: "No se pudo completar el vocabulario. Inténtalo de nuevo.", code: "upstream_error" }, 502);
  }
}
