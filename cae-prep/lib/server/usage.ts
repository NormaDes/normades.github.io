import "server-only";
import { getDailyLimit } from "@/config/app";

/**
 * Contador diario de generaciones en memoria (por instancia del servidor).
 * En Vercel (serverless) es una protección "best effort"; en la Fase 4 se moverá a
 * Supabase (tabla generation_usage) para que sea exacto y por usuario.
 */
const counters = new Map<string, number>();

const dayKey = () => new Date().toISOString().slice(0, 10);

export function remainingToday(): number {
  return Math.max(0, getDailyLimit() - (counters.get(dayKey()) ?? 0));
}

export function consumeGeneration(): boolean {
  if (remainingToday() <= 0) return false;
  const k = dayKey();
  counters.set(k, (counters.get(k) ?? 0) + 1);
  // Limpieza de días antiguos
  for (const key of counters.keys()) if (key !== k) counters.delete(key);
  return true;
}

/** Devuelve el cupo si la generación falla (no cobramos los intentos fallidos) */
export function refundGeneration(): void {
  const k = dayKey();
  counters.set(k, Math.max(0, (counters.get(k) ?? 1) - 1));
}
