import { authorize } from "@/lib/server/guard";

export const maxDuration = 30;

type Meta = { state: "ok" | "invalid" | "unknown"; title?: string; author?: string };
const cache = new Map<string, { at: number; meta: Meta }>();
const TTL = 7 * 24 * 3_600_000;

async function check(id: string): Promise<Meta> {
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL) return hit.meta;
  const base = process.env.YOUTUBE_OEMBED_BASE || "https://www.youtube.com/oembed";
  let meta: Meta;
  try {
    const res = await fetch(`${base}?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { signal: AbortSignal.timeout(6000), next: { revalidate: 86_400 } });
    if (res.ok) {
      const j = (await res.json()) as { title?: string; author_name?: string };
      meta = { state: "ok", title: j.title, author: j.author_name };
    } else if ([400, 401, 403, 404].includes(res.status)) meta = { state: "invalid" }; // no existe o no se puede incrustar
    else meta = { state: "unknown" };
  } catch {
    meta = { state: "unknown" }; // sin red: no ocultamos nada
  }
  if (meta.state !== "unknown") cache.set(id, { at: Date.now(), meta });
  return meta;
}

/** GET /api/video-meta?ids=a,b,c → estado de cada vídeo de YouTube (ok / invalid / unknown) y su título real */
export async function GET(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) return auth.response;
  const ids = [...new Set((new URL(request.url).searchParams.get("ids") ?? "").split(",").filter((x) => /^[\w-]{11}$/.test(x)))].slice(0, 24);
  const entries = await Promise.all(ids.map(async (id) => [id, await check(id)] as const));
  return Response.json({ videos: Object.fromEntries(entries) }, { headers: { "Cache-Control": "private, max-age=600" } });
}
