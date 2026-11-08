import { z } from "zod";
import { AiConfigError, AiOutputError } from "@/lib/ai/client";
import { MAX_SOURCE_CHARS, MIN_WORDS_FOR, exerciseFromSource, lessonPackFromSource } from "@/lib/ai/material";
import { getArticle } from "@/lib/articles/store";
import { countWords, decodeId } from "@/lib/articles/text";
import { SOURCE_INFO } from "@/lib/articles/types";
import type { ExerciseOrigin } from "@/lib/schemas";
import { authorize } from "@/lib/server/guard";
import { consumeGeneration, refundGeneration, remainingToday } from "@/lib/server/usage";

export const maxDuration = 120;

const bodySchema = z
  .object({
    mode: z.enum(["r5", "r7", "r8", "pack"]),
    /** Artículo de la biblioteca (id en base64url): el servidor usa su texto */
    articleId: z.string().max(600).optional(),
    /** O un texto pegado (artículo de otra web, transcripción de un vídeo…) */
    text: z.string().max(MAX_SOURCE_CHARS * 2).optional(),
    title: z.string().trim().max(200).optional(),
    url: z.string().url().max(600).optional(),
    /** «video» = transcripción de un vídeo/podcast; por defecto, texto pegado de un artículo */
    kind: z.enum(["article", "video"]).optional(),
  })
  .refine((b) => b.articleId || b.text, { message: "Falta el texto." });

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Recorta al límite sin partir un párrafo por la mitad */
function clip(text: string): string {
  if (text.length <= MAX_SOURCE_CHARS) return text;
  const cut = text.slice(0, MAX_SOURCE_CHARS);
  const i = cut.lastIndexOf("\n\n");
  return (i > MAX_SOURCE_CHARS * 0.6 ? cut.slice(0, i) : cut).trim();
}

/**
 * POST /api/material-exercise
 * Convierte un texto real en un ejercicio de Reading (5, 7 u 8) o en un paquete de clase (resumen, comprensión,
 * vocabulario, colocaciones y essay). Gasta 1 uso de IA. El texto pegado NO se guarda en el servidor.
 */
export async function POST(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) return auth.response;
  const userId = auth.userId;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Petición no válida.", code: "bad_request" }, 400);
  const b = parsed.data;

  let text: string;
  let title: string;
  let origin: ExerciseOrigin;

  if (b.articleId) {
    const article = await getArticle(decodeId(b.articleId));
    if (!article) return json({ error: "Artículo no encontrado. Vuelve a abrirlo desde la biblioteca.", code: "not_found" }, 404);
    if (!article.fullTextAllowed || !article.body) {
      return json({ error: "Esta fuente solo permite mostrar un extracto. Pega el texto del artículo para usarlo en tus ejercicios.", code: "excerpt_only" }, 422);
    }
    text = article.body;
    title = article.title;
    origin = { title: article.title, url: article.url, author: article.author, sourceName: SOURCE_INFO[article.source].name, license: article.license };
  } else {
    text = (b.text ?? "").replace(/\r/g, "").trim();
    title = b.title || "Texto pegado";
    origin = {
      title,
      url: b.url,
      sourceName: b.kind === "video" ? "Transcripción de un vídeo o podcast" : "Texto pegado por el alumno",
      license: "Uso personal",
      ephemeral: true,
    };
  }

  text = clip(text);
  const words = countWords(text);
  if (words < 150) return json({ error: "El texto es demasiado corto: necesito al menos unas 150 palabras.", code: "too_short" }, 400);
  const need = MIN_WORDS_FOR[b.mode];
  if (words < need) return json({ error: `Este texto tiene ${words} palabras y para ese ejercicio hacen falta al menos ${need}. Prueba con «Resumen + vocabulario + essay» o con un texto más largo.`, code: "too_short_for_part" }, 400);

  if (!(await consumeGeneration(userId))) {
    return json({ error: "Has alcanzado el límite diario de usos de IA.", code: "daily_limit", remainingToday: 0 }, 429);
  }

  try {
    if (b.mode === "pack") {
      const pack = await lessonPackFromSource({ text, title });
      return json({ pack, origin, remainingToday: await remainingToday(userId) });
    }
    const exercise = await exerciseFromSource(b.mode, { text, title }, origin);
    return json({ exercise, remainingToday: await remainingToday(userId) });
  } catch (e) {
    await refundGeneration(userId);
    if (e instanceof AiConfigError) return json({ error: e.message, code: "not_configured" }, 503);
    if (e instanceof AiOutputError) return json({ error: e.message, code: "invalid_output" }, 502);
    console.error("material-exercise error", e);
    return json({ error: "No se pudo generar el ejercicio. Inténtalo de nuevo.", code: "upstream_error" }, 502);
  }
}
