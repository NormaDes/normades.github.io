import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerClient } from "@/lib/supabase/server";

export type Authorization = { ok: true; userId: string | null } | { ok: false; response: Response };

function unauthorized(message: string): Authorization {
  return {
    ok: false,
    response: Response.json({ error: message, code: "unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } }),
  };
}

/** ID del usuario con sesión (o null). Solo tiene sentido si Supabase está configurado. */
export async function currentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await getServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Autoriza una petición a las rutas de IA:
 *  - con Supabase configurado: hace falta haber iniciado sesión;
 *  - sin Supabase: se exige APP_ACCESS_CODE si está definido.
 */
export async function authorize(request: Request): Promise<Authorization> {
  if (isSupabaseConfigured()) {
    const userId = await currentUserId();
    return userId ? { ok: true, userId } : unauthorized("Tu sesión ha caducado. Inicia sesión de nuevo.");
  }
  const code = process.env.APP_ACCESS_CODE;
  if (code && request.headers.get("x-access-code") !== code) return unauthorized("Código de acceso incorrecto o ausente.");
  return { ok: true, userId: null };
}
