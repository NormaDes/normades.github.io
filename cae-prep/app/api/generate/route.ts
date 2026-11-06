import { z } from "zod";
import { PARTS, type PartId } from "@/config/exam";
import { AiConfigError, AiOutputError } from "@/lib/ai/client";
import { generateExercise } from "@/lib/ai/generate";
import { IMPLEMENTED_PARTS } from "@/lib/schemas";
import { consumeGeneration, refundGeneration, remainingToday } from "@/lib/server/usage";

export const maxDuration = 120;

const bodySchema = z.object({
  partId: z.enum(PARTS.map((p) => p.id) as [PartId, ...PartId[]]),
  topic: z.string().trim().max(80).optional(),
});

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/** POST /api/generate  { partId, topic? }  →  { exercise, remainingToday } */
export async function POST(request: Request) {
  // Código de acceso opcional: protege tu saldo de Anthropic si la app es pública.
  const accessCode = process.env.APP_ACCESS_CODE;
  if (accessCode && request.headers.get("x-access-code") !== accessCode) {
    return json({ error: "Código de acceso incorrecto o ausente.", code: "unauthorized" }, 401);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Petición no válida.", code: "bad_request" }, 400);
  const { partId, topic } = parsed.data;

  if (!IMPLEMENTED_PARTS.includes(partId)) {
    return json({ error: "Esta parte todavía no está disponible.", code: "not_implemented" }, 501);
  }

  if (!consumeGeneration()) {
    return json(
      { error: "Has alcanzado el límite diario de ejercicios generados con IA.", code: "daily_limit", remainingToday: 0 },
      429,
    );
  }

  try {
    const exercise = await generateExercise(partId, topic || undefined);
    return json({ exercise, remainingToday: remainingToday() });
  } catch (e) {
    refundGeneration();
    if (e instanceof AiConfigError) return json({ error: e.message, code: "not_configured" }, 503);
    if (e instanceof AiOutputError) return json({ error: e.message, code: "invalid_output" }, 502);
    console.error("generate error", e);
    return json({ error: "Error al generar el ejercicio. Inténtalo de nuevo.", code: "upstream_error" }, 502);
  }
}

/** GET /api/generate → estado (¿IA configurada? ¿cuántas generaciones quedan hoy?) */
export async function GET() {
  return json({
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    accessCodeRequired: Boolean(process.env.APP_ACCESS_CODE),
    remainingToday: remainingToday(),
  });
}
