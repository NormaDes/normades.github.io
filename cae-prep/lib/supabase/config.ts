/**
 * Solo el origen (https://XXXX.supabase.co): si alguien pega la URL con una ruta
 * (/rest/v1/, /auth/v1…), Supabase responde «Invalid path specified in request URL».
 */
export function normalizeSupabaseUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin;
  } catch {
    return value;
  }
}

/** Supabase está "configurado" si existen la URL y la clave pública (NEXT_PUBLIC_*, disponibles en cliente y servidor). */
export const SUPABASE_URL = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
