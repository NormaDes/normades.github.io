import { PARTS, getPart, type PartId } from "@/config/exam";
import type { Attempt } from "@/lib/storage/types";

/** Día local en formato YYYY-MM-DD */
export function localDay(d: Date | string): string {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export interface PartStat {
  partId: PartId;
  attempts: number;
  accuracy: number; // 0-1
  lastAt: string;
}

export interface DayPoint {
  day: string;
  accuracy: number; // 0-1
  exercises: number;
}

export interface SkillStat {
  skill: string;
  total: number;
  wrong: number;
  errorRate: number; // 0-1
}

export interface Suggestion {
  partId: PartId;
  reason: string;
}

export interface Progress {
  totalAttempts: number;
  accuracy: number | null;
  streak: number;
  bestStreak: number;
  activeDays: number;
  minutes: number;
  parts: PartStat[];
  daily: DayPoint[];
  skills: SkillStat[];
  /** Últimos 84 días (12 semanas), del más antiguo al más reciente */
  heat: Array<{ day: string; count: number }>;
  suggestion: Suggestion;
}

export function currentStreak(days: Set<string>, now: Date): number {
  let streak = 0;
  let d = now;
  // Si hoy aún no has practicado, la racha cuenta desde ayer
  if (!days.has(localDay(d))) d = addDays(d, -1);
  while (days.has(localDay(d))) {
    streak++;
    d = addDays(d, -1);
  }
  return streak;
}

export function bestStreak(days: Set<string>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const d = new Date(`${key}T12:00:00`);
    run = prev && localDay(addDays(prev, 1)) === key ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/** Qué practicar hoy: la parte más floja (≥2 intentos) o, si no, la primera sin tocar */
export function suggestNext(attempts: Attempt[]): Suggestion {
  const byPart = new Map<PartId, { ok: number; total: number; n: number }>();
  for (const a of attempts) {
    const cur = byPart.get(a.partId) ?? { ok: 0, total: 0, n: 0 };
    byPart.set(a.partId, { ok: cur.ok + a.correctCount, total: cur.total + a.total, n: cur.n + 1 });
  }
  const weak = [...byPart.entries()]
    .filter(([, v]) => v.n >= 2 && v.total > 0)
    .map(([id, v]) => ({ id, acc: v.ok / v.total }))
    .sort((a, b) => a.acc - b.acc)[0];
  if (weak && weak.acc < 0.85) {
    return { partId: weak.id, reason: `Tu acierto aquí es del ${Math.round(weak.acc * 100)} %: es donde más puedes subir.` };
  }
  const untouched = PARTS.find((p) => !byPart.has(p.id));
  if (untouched && attempts.length) return { partId: untouched.id, reason: "Aún no has practicado esta parte del examen." };
  return { partId: "r1", reason: "Un buen punto de partida: vocabulario y colocaciones en contexto." };
}

export function computeProgress(attempts: Attempt[], now: Date = new Date()): Progress {
  const days = new Set(attempts.map((a) => localDay(a.createdAt)));
  const correct = attempts.reduce((s, a) => s + a.correctCount, 0);
  const total = attempts.reduce((s, a) => s + a.total, 0);

  // Por parte (en el orden del examen)
  const parts: PartStat[] = [];
  for (const p of PARTS) {
    const list = attempts.filter((a) => a.partId === p.id);
    if (!list.length) continue;
    const c = list.reduce((s, a) => s + a.correctCount, 0);
    const t = list.reduce((s, a) => s + a.total, 0);
    parts.push({ partId: p.id, attempts: list.length, accuracy: t ? c / t : 0, lastAt: list.map((a) => a.createdAt).sort().at(-1)! });
  }

  // Evolución diaria (media de los ejercicios de cada día)
  const perDay = new Map<string, { ok: number; total: number; n: number }>();
  for (const a of attempts) {
    const k = localDay(a.createdAt);
    const cur = perDay.get(k) ?? { ok: 0, total: 0, n: 0 };
    perDay.set(k, { ok: cur.ok + a.correctCount, total: cur.total + a.total, n: cur.n + 1 });
  }
  const daily: DayPoint[] = [...perDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day, accuracy: v.total ? v.ok / v.total : 0, exercises: v.n }));

  // Puntos débiles por tipo de error
  const skillMap = new Map<string, { total: number; wrong: number }>();
  for (const a of attempts) {
    for (const d of a.details) {
      const cur = skillMap.get(d.skill) ?? { total: 0, wrong: 0 };
      skillMap.set(d.skill, { total: cur.total + 1, wrong: cur.wrong + (d.correct ? 0 : 1) });
    }
  }
  const skills: SkillStat[] = [...skillMap.entries()]
    .filter(([, v]) => v.total >= 3)
    .map(([skill, v]) => ({ skill, total: v.total, wrong: v.wrong, errorRate: v.wrong / v.total }))
    .sort((a, b) => b.errorRate - a.errorRate || b.total - a.total);

  // Actividad: 12 semanas
  const perDayCount = new Map<string, number>();
  for (const a of attempts) {
    const k = localDay(a.createdAt);
    perDayCount.set(k, (perDayCount.get(k) ?? 0) + 1);
  }
  const heat = Array.from({ length: 84 }, (_, i) => {
    const day = localDay(addDays(now, i - 83));
    return { day, count: perDayCount.get(day) ?? 0 };
  });

  const minutes = Math.round(attempts.reduce((s, a) => s + (a.durationSec || 0), 0) / 60);

  return {
    totalAttempts: attempts.length,
    accuracy: total ? correct / total : null,
    streak: currentStreak(days, now),
    bestStreak: bestStreak(days),
    activeDays: days.size,
    minutes,
    parts,
    daily,
    skills,
    heat,
    suggestion: suggestNext(attempts),
  };
}

/** Etiqueta corta de una parte: «Reading 1», «Writing 2»… */
export function partShort(id: PartId): string {
  const p = getPart(id);
  const paper = { reading: "Reading", writing: "Writing", listening: "Listening", speaking: "Speaking" }[p.paper];
  return `${paper} ${p.number}`;
}

const SKILL_ES: Record<string, string> = {
  collocation: "Colocaciones",
  "phrasal verb": "Phrasal verbs",
  "fixed phrase": "Expresiones fijas",
  "linking word": "Conectores",
  "dependent preposition": "Preposiciones dependientes",
  "meaning/register": "Significado y registro",
  "verb pattern": "Patrones verbales",
  "adjective pattern": "Patrones con adjetivo",
  preposition: "Preposiciones",
  "auxiliary verb": "Verbos auxiliares",
  "relative pronoun": "Pronombres relativos",
  quantifier: "Cuantificadores",
  comparison: "Comparaciones",
  inversion: "Inversión",
  "modal verb": "Verbos modales",
  "modal deduction": "Deducción con modales",
  passive: "Pasiva",
  "passive/reporting": "Pasiva y estilo indirecto",
  "reporting structure": "Estilo indirecto",
  "conditional/wish": "Condicionales y wish",
  "gerund/infinitive": "Gerundio e infinitivo",
  "fixed expression": "Expresiones fijas",
  tenses: "Tiempos verbales",
  "relative clause": "Oraciones de relativo",
  "noun formation": "Formación de sustantivos",
  "adjective formation": "Formación de adjetivos",
  "adverb formation": "Formación de adverbios",
  "verb formation": "Formación de verbos",
  "negative prefix": "Prefijos negativos",
  "plural/singular": "Singular y plural",
  attitude: "Actitud y opinión",
  detail: "Detalle",
  inference: "Inferencia",
  purpose: "Propósito",
  reference: "Referencia",
  tone: "Tono",
  "meaning in context": "Significado en contexto",
  paraphrase: "Paráfrasis",
  gist: "Idea general",
  "lexical chain": "Cadenas léxicas",
  contrast: "Contraste",
  "time sequence": "Secuencia temporal",
  "contrast of opinions": "Contraste de opiniones",
  "shared opinion": "Opiniones compartidas",
  Content: "Writing · Contenido",
  "Communicative Achievement": "Writing · Logro comunicativo",
  Organisation: "Writing · Organización",
  Language: "Writing · Lenguaje",
  Grammar: "Speaking · Gramática",
  Vocabulary: "Speaking · Vocabulario",
  Fluency: "Speaking · Fluidez",
  Coherence: "Speaking · Coherencia",
};

export function skillLabel(skill: string): string {
  return SKILL_ES[skill] ?? skill.charAt(0).toUpperCase() + skill.slice(1);
}
