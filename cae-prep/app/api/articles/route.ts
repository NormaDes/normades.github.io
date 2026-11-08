import { listArticles } from "@/lib/articles/store";
import { TOPICS, type TopicId } from "@/lib/articles/types";
import { authorize } from "@/lib/server/guard";

export const maxDuration = 60;

/** GET /api/articles?topic=tecnologia|…|all → resúmenes de artículos reales (con atribución y licencia) */
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) return auth.response;
  const t = new URL(request.url).searchParams.get("topic") ?? "all";
  const topic = (TOPICS.some((x) => x.id === t) ? t : "all") as TopicId | "all";
  try {
    const { items, status, cached } = await listArticles(topic);
    return Response.json({ items, status, cached }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch (e) {
    console.error("articles error", e);
    return Response.json({ error: "No se han podido cargar los artículos.", code: "upstream_error" }, { status: 502 });
  }
}
