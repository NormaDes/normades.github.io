/**
 * Repetición espaciada SM-2 (SuperMemo-2), en su versión simple.
 * Calidad de respuesta q (0-5) a partir de 4 botones: Otra vez, Difícil, Bien, Fácil.
 */
export type Grade = "again" | "hard" | "good" | "easy";

export const GRADE_QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export interface SrsState {
  ease: number; // factor de facilidad (≥ 1,3)
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: string; // ISO
}

export const INITIAL_EASE = 2.5;
const MIN_EASE = 1.3;
const DAY = 86_400_000;

export function newSrs(now: Date = new Date()): SrsState {
  return { ease: INITIAL_EASE, intervalDays: 0, repetitions: 0, lapses: 0, dueAt: now.toISOString() };
}

/** Aplica una respuesta y devuelve el nuevo estado */
export function review(card: SrsState, grade: Grade, now: Date = new Date()): SrsState {
  const q = GRADE_QUALITY[grade];
  const { lapses } = card;
  let { ease, intervalDays, repetitions } = card;

  if (q < 3) {
    // Fallo: se empieza de nuevo y se vuelve a ver en 10 minutos
    return { ease: Math.max(MIN_EASE, ease - 0.2), intervalDays: 0, repetitions: 0, lapses: lapses + 1, dueAt: new Date(now.getTime() + 10 * 60_000).toISOString() };
  }

  if (repetitions === 0) intervalDays = 1;
  else if (repetitions === 1) intervalDays = 6;
  else intervalDays = Math.round(intervalDays * ease);
  if (grade === "hard" && repetitions >= 2) intervalDays = Math.max(1, Math.round(intervalDays * 0.85));
  if (grade === "easy" && repetitions >= 1) intervalDays = Math.round(intervalDays * 1.3);

  ease = Math.max(MIN_EASE, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  repetitions += 1;
  return { ease, intervalDays, repetitions, lapses, dueAt: new Date(now.getTime() + intervalDays * DAY).toISOString() };
}

/** Vista previa del intervalo que daría cada botón (para mostrarlo en pantalla) */
export function previewInterval(card: SrsState, grade: Grade, now: Date = new Date()): string {
  const next = review(card, grade, now);
  if (next.intervalDays === 0) return "10 min";
  if (next.intervalDays < 30) return `${next.intervalDays} d`;
  if (next.intervalDays < 365) return `${Math.round(next.intervalDays / 30)} m`;
  return `${(next.intervalDays / 365).toFixed(1).replace(".", ",")} a`;
}

export const isDue = (card: Pick<SrsState, "dueAt">, now: Date = new Date()) => new Date(card.dueAt).getTime() <= now.getTime();

/** «Aprendida»: intervalo de 3 semanas o más */
export const isLearned = (card: Pick<SrsState, "intervalDays">) => card.intervalDays >= 21;
