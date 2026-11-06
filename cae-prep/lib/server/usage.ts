import "server-only";
import { getDailyLimit } from "@/config/app";
import { getAdminClient } from "@/lib/supabase/server";

/**
 * Cupo diario de usos de IA.
 *  - Con usuario y SUPABASE_SERVICE_ROLE_KEY: se cuenta por usuario en la tabla generation_usage (exacto).
 *  - Si no: contador en memoria de la instancia (aproximado en Vercel).
 */
const memory = new Map<string, number>();
const today = () => new Date().toISOString().slice(0, 10);
const memKey = (userId: string | null) => `${userId ?? "anon"}|${today()}`;

async function dbCount(userId: string): Promise<number | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  const { data, error } = await admin.from("generation_usage").select("count").eq("user_id", userId).eq("day", today()).maybeSingle();
  if (error) return null;
  return (data?.count as number | undefined) ?? 0;
}

async function dbSet(userId: string, count: number): Promise<boolean> {
  const admin = getAdminClient();
  if (!admin) return false;
  const { error } = await admin.from("generation_usage").upsert({ user_id: userId, day: today(), count }, { onConflict: "user_id,day" });
  return !error;
}

async function used(userId: string | null): Promise<number> {
  if (userId) {
    const c = await dbCount(userId);
    if (c !== null) return c;
  }
  return memory.get(memKey(userId)) ?? 0;
}

export async function remainingToday(userId: string | null): Promise<number> {
  return Math.max(0, getDailyLimit() - (await used(userId)));
}

export async function consumeGeneration(userId: string | null): Promise<boolean> {
  const current = await used(userId);
  if (current >= getDailyLimit()) return false;
  if (!(userId && (await dbSet(userId, current + 1)))) memory.set(memKey(userId), current + 1);
  return true;
}

/** Devuelve el cupo si la generación falla (no cobramos los intentos fallidos) */
export async function refundGeneration(userId: string | null): Promise<void> {
  const current = await used(userId);
  const next = Math.max(0, current - 1);
  if (!(userId && (await dbSet(userId, next)))) memory.set(memKey(userId), next);
}
