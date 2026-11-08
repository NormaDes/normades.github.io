import { decodeId } from "@/lib/articles/text";
import { getArticle } from "@/lib/articles/store";
import { authorize } from "@/lib/server/guard";

/** GET /api/articles/item?id=<base64url> → artículo completo (si la licencia lo permite) o solo extracto */
export async function GET(request: Request) {
  const auth = await authorize(request, { guestOk: true });
  if (!auth.ok) return auth.response;
  const code = new URL(request.url).searchParams.get("id") ?? "";
  const article = code ? await getArticle(decodeId(code)) : null;
  if (!article) return Response.json({ error: "Artículo no encontrado (puede haber caducado la caché).", code: "not_found" }, { status: 404 });
  return Response.json({ article }, { headers: { "Cache-Control": "private, max-age=300" } });
}
