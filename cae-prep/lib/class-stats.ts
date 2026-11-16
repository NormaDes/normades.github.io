import { PARTS, type PartId } from "@/config/exam";

export interface ClassProfile {
  id: string;
  name: string;
  email?: string;
  joinedAt?: string;
}

export interface ClassAttempt {
  user_id: string;
  part_id: string;
  marks: number;
  max_marks: number;
  created_at: string;
  timed?: boolean;
}

export interface StudentRow {
  id: string;
  name: string;
  email?: string;
  total: number;
  last7: number;
  accuracy: number | null; // 0-1
  weakest: { partId: PartId; accuracy: number } | null;
  lastAt: string | null;
  /** Días desde su última actividad (null si nunca ha practicado) */
  idleDays: number | null;
  status: "activo" | "parado" | "nuevo";
}

export interface ClassSummary {
  students: number;
  active7: number;
  avgAccuracy: number | null;
  totalAttempts: number;
  byPart: Array<{ partId: PartId; accuracy: number; attempts: number }>;
}

const DAY = 86_400_000;
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Resumen por alumno y de toda la clase a partir de los intentos guardados. */
export function buildClassStats(profiles: ClassProfile[], attempts: ClassAttempt[], now: Date = new Date()): { rows: StudentRow[]; summary: ClassSummary } {
  const byUser = new Map<string, ClassAttempt[]>();
  for (const a of attempts) {
    const list = byUser.get(a.user_id) ?? [];
    list.push(a);
    byUser.set(a.user_id, list);
  }

  const rows: StudentRow[] = profiles.map((p) => {
    const mine = byUser.get(p.id) ?? [];
    const max = sum(mine.map((a) => a.max_marks));
    const lastTs = mine.length ? Math.max(...mine.map((a) => new Date(a.created_at).getTime())) : null;
    const idleDays = lastTs === null ? null : Math.floor((now.getTime() - lastTs) / DAY);

    const parts = new Map<string, { m: number; x: number }>();
    for (const a of mine) {
      const c = parts.get(a.part_id) ?? { m: 0, x: 0 };
      parts.set(a.part_id, { m: c.m + a.marks, x: c.x + a.max_marks });
    }
    const weakest = [...parts.entries()]
      .filter(([, v]) => v.x > 0)
      .map(([id, v]) => ({ partId: id as PartId, accuracy: v.m / v.x }))
      .sort((a, b) => a.accuracy - b.accuracy)[0] ?? null;

    return {
      id: p.id,
      name: p.name,
      email: p.email,
      total: mine.length,
      last7: mine.filter((a) => now.getTime() - new Date(a.created_at).getTime() <= 7 * DAY).length,
      accuracy: max > 0 ? sum(mine.map((a) => a.marks)) / max : null,
      weakest,
      lastAt: lastTs === null ? null : new Date(lastTs).toISOString(),
      idleDays,
      status: idleDays === null ? "nuevo" : idleDays <= 7 ? "activo" : "parado",
    };
  });

  // Los que necesitan atención primero: parados (más días), luego nuevos, luego activos
  const order = { parado: 0, nuevo: 1, activo: 2 } as const;
  rows.sort((a, b) => order[a.status] - order[b.status] || (b.idleDays ?? 0) - (a.idleDays ?? 0) || a.name.localeCompare(b.name));

  const ids = new Set(profiles.map((p) => p.id));
  const mineAll = attempts.filter((a) => ids.has(a.user_id));
  const partAgg = new Map<string, { m: number; x: number; n: number }>();
  for (const a of mineAll) {
    const c = partAgg.get(a.part_id) ?? { m: 0, x: 0, n: 0 };
    partAgg.set(a.part_id, { m: c.m + a.marks, x: c.x + a.max_marks, n: c.n + 1 });
  }
  const known = new Set(PARTS.map((p) => p.id as string));
  const byPart = [...partAgg.entries()]
    .filter(([id, v]) => known.has(id) && v.x > 0)
    .map(([id, v]) => ({ partId: id as PartId, accuracy: v.m / v.x, attempts: v.n }))
    .sort((a, b) => a.accuracy - b.accuracy);

  const withAcc = rows.filter((r) => r.accuracy !== null);
  return {
    rows,
    summary: {
      students: profiles.length,
      active7: rows.filter((r) => r.last7 > 0).length,
      avgAccuracy: withAcc.length ? sum(withAcc.map((r) => r.accuracy as number)) / withAcc.length : null,
      totalAttempts: mineAll.length,
      byPart,
    },
  };
}
