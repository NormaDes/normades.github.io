import { buildClassStats, type ClassAttempt } from "@/lib/class-stats";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAdminClient, getServerClient } from "@/lib/supabase/server";

export const maxDuration = 30;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** GET /api/class: progreso de toda la clase. Solo administradores. */
export async function GET() {
  if (!isSupabaseConfigured()) return json({ error: "Las cuentas no están configuradas." }, 404);
  const supabase = await getServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return json({ error: "Inicia sesión." }, 401);
  const { data: me } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (me?.role !== "admin") return json({ error: "Solo para el profesor." }, 403);

  const admin = getAdminClient();
  if (!admin) return json({ error: "Falta SUPABASE_SERVICE_ROLE_KEY en Vercel." }, 503);

  const since = new Date(Date.now() - 120 * 86_400_000).toISOString();
  const [profiles, attempts, users] = await Promise.all([
    admin.from("profiles").select("id,display_name,role,created_at").limit(2000),
    admin.from("attempts").select("user_id,part_id,marks,max_marks,created_at,timed").gte("created_at", since).order("created_at", { ascending: false }).limit(30000),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  if (profiles.error || attempts.error) return json({ error: "No se pudo leer la clase (¿has ejecutado el schema.sql?)." }, 500);

  const emails = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? undefined]));
  const students = (profiles.data ?? [])
    .filter((p) => p.role !== "admin")
    .map((p) => ({ id: p.id as string, name: (p.display_name as string | null) || emails.get(p.id as string)?.split("@")[0] || "Alumno", email: emails.get(p.id as string), joinedAt: p.created_at as string }));

  return json(buildClassStats(students, (attempts.data ?? []) as ClassAttempt[]));
}
