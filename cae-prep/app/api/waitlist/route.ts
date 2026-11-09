import { waitlistSchema } from "@/lib/waitlist";
import { getAdminClient, getServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const maxDuration = 20;

const hits = new Map<string, number[]>();
/** Límite blando por IP: 6 envíos cada 10 minutos (por instancia). */
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** POST /api/waitlist: apuntarse a la lista de espera (público). */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "?";
  if (limited(ip)) return json({ error: "Demasiados intentos. Prueba de nuevo en unos minutos." }, 429);

  const parsed = waitlistSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const consent = parsed.error.issues.some((i) => i.path[0] === "consent");
    return json({ error: consent ? "Marca la casilla para aceptar la política de privacidad." : "Revisa el email y los campos del formulario." }, 400);
  }
  const { website: _trap, ...row } = parsed.data;
  void _trap;

  const admin = getAdminClient();
  if (!admin) return json({ error: "La lista de espera no está disponible en este momento. Inténtalo más tarde." }, 503);

  const { error } = await admin.from("waitlist").insert({ ...row, name: row.name || null, source: row.source || null });
  if (error) {
    if (error.code === "23505") return json({ ok: true, already: true });
    console.error("waitlist insert", error.message);
    return json({ error: "No se ha podido guardar. Inténtalo de nuevo." }, 500);
  }
  return json({ ok: true });
}

/** GET /api/waitlist[?format=csv]: solo para administradores. */
export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return json({ error: "No disponible" }, 404);
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return json({ error: "Inicia sesión" }, 401);
  const { data: me } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (me?.role !== "admin") return json({ error: "Solo para el profesor" }, 403);

  const admin = getAdminClient();
  if (!admin) return json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, 503);
  const { data, error } = await admin.from("waitlist").select("email,name,exam,role,source,created_at").order("created_at", { ascending: false }).limit(5000);
  if (error) return json({ error: "No se pudo leer la lista (¿has ejecutado el schema.sql?)" }, 500);

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [["email", "nombre", "examen", "perfil", "origen", "fecha"].join(","), ...(data ?? []).map((r) => [r.email, r.name, r.exam, r.role, r.source, r.created_at].map(esc).join(","))];
    return new Response(lines.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="lista-espera.csv"', "Cache-Control": "no-store" } });
  }
  return json({ count: data?.length ?? 0, rows: data ?? [] });
}
