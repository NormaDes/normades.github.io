import { PARTS, getPart, type PaperId, type PartId } from "@/config/exam";
import { localDay } from "@/lib/progress";
import type { Attempt } from "@/lib/storage/types";

export type PlanPhase = "base" | "refuerzo" | "simulacros" | "descanso";
export type TaskKind = "practice" | "vocab" | "errors" | "mock";

export interface PlanTask {
  kind: TaskKind;
  minutes: number;
  label: string;
  href: string;
  partId?: PartId;
  paper?: PaperId;
}

export interface PlanDay {
  day: string; // YYYY-MM-DD
  phase: PlanPhase;
  study: boolean;
  tasks: PlanTask[];
}

export interface PlanOptions {
  today: string;
  examDate?: string;
  minutesPerDay: number;
  daysPerWeek: number;
  attempts: Attempt[];
}

const DAY_MS = 86_400_000;
const at = (day: string) => new Date(`${day}T12:00:00`);
export const daysBetween = (a: string, b: string) => Math.round((at(b).getTime() - at(a).getTime()) / DAY_MS);
const addDay = (day: string, n: number) => localDay(new Date(at(day).getTime() + n * DAY_MS));

export const PHASE_LABEL: Record<PlanPhase, string> = {
  base: "Base",
  refuerzo: "Refuerzo",
  simulacros: "Simulacros y repaso",
  descanso: "Descanso previo",
};

export function phaseFor(daysToExam: number | null): PlanPhase {
  if (daysToExam === null || daysToExam > 60) return "base";
  if (daysToExam > 21) return "refuerzo";
  if (daysToExam > 3) return "simulacros";
  return "descanso";
}

/** Días de la semana (0=domingo) de estudio, repartidos */
const STUDY_DAYS: Record<number, number[]> = {
  1: [6],
  2: [2, 6],
  3: [1, 3, 6],
  4: [1, 2, 4, 6],
  5: [1, 2, 3, 4, 6],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

/** Partes ordenadas de más débil a más fuerte (sin practicar = prioridad alta) */
export function weakness(attempts: Attempt[]): PartId[] {
  const agg = new Map<PartId, { ok: number; total: number }>();
  for (const a of attempts) {
    const c = agg.get(a.partId) ?? { ok: 0, total: 0 };
    agg.set(a.partId, { ok: c.ok + a.marks, total: c.total + a.maxMarks });
  }
  const score = (id: PartId) => {
    const v = agg.get(id);
    return v && v.total ? v.ok / v.total : 0.4; // sin datos: casi tan prioritario como lo flojo
  };
  return PARTS.map((p) => p.id).sort((a, b) => score(a) - score(b));
}

const MOCK_ROTATION: PaperId[] = ["reading", "writing", "listening"];
const PAPER_NAME: Record<string, string> = { reading: "Reading & UoE", writing: "Writing", listening: "Listening" };

function practiceTask(partId: PartId, minutes: number): PlanTask {
  const p = getPart(partId);
  return { kind: "practice", minutes, partId, label: `${p.name}`, href: `/practica/${partId}` };
}

export function buildPlan(opts: PlanOptions, length = 7): PlanDay[] {
  const weak = weakness(opts.attempts);
  const studyDays = STUDY_DAYS[Math.min(7, Math.max(1, opts.daysPerWeek))];
  const out: PlanDay[] = [];
  let studyIndex = 0;

  for (let i = 0; i < length; i++) {
    const day = addDay(opts.today, i);
    const toExam = opts.examDate ? daysBetween(day, opts.examDate) : null;
    const phase = phaseFor(toExam);
    const dow = at(day).getDay();
    const examPassed = toExam !== null && toExam < 0;
    const study = !examPassed && studyDays.includes(dow);
    const tasks: PlanTask[] = [];

    if (study) {
      let budget = opts.minutesPerDay;
      const light = phase === "descanso";
      if (light) budget = Math.min(budget, 20);
      const ordinal = Math.floor(at(day).getTime() / DAY_MS);
      const weekIdx = Math.floor(ordinal / 7);

      // 1) Vocabulario: siempre un bloque corto
      const vocab = Math.min(10, Math.max(5, Math.round(budget * 0.2)));
      tasks.push({ kind: "vocab", minutes: vocab, label: "Repaso de vocabulario", href: "/vocabulario" });
      budget -= vocab;

      if (!light) {
        // 2) Simulacro: en la fase final, el último día de estudio de la semana (sábado)
        if (phase === "simulacros" && dow === 6 && budget >= 40) {
          const paper = MOCK_ROTATION[weekIdx % MOCK_ROTATION.length];
          const mins = paper === "listening" ? 40 : 90;
          tasks.push({ kind: "mock", minutes: Math.min(mins, Math.max(budget, 40)), paper, label: `Simulacro: ${PAPER_NAME[paper]}`, href: `/simulacro/${paper}` });
          budget = 0;
        }
        // 3) Repaso de errores un día por semana (o dos si es la fase final)
        if (budget >= 10 && (dow === 4 || (phase === "simulacros" && dow === 2))) {
          tasks.push({ kind: "errors", minutes: 10, label: "Cuaderno de errores", href: "/errores" });
          budget -= 10;
        }
        // 4) Bloques de práctica por debilidad; Writing/Speaking una vez por semana
        const pool = weak.filter((id) => !(id.startsWith("w") || id.startsWith("s")));
        let k = studyIndex * 2;
        while (budget >= 15) {
          let id: PartId;
          if (dow === 3 && !tasks.some((t) => t.partId?.startsWith("w"))) id = "w2";
          else if (dow === 2 && phase !== "base" && !tasks.some((t) => t.partId?.startsWith("s")) && opts.minutesPerDay >= 45) id = "s2";
          else id = phase === "base" ? pool[(k++ + weekIdx) % pool.length] : pool[(k++) % Math.min(pool.length, 6)];
          const isW = id.startsWith("w");
          const mins = Math.min(budget, isW ? 40 : id.startsWith("l") ? 20 : 15 + (budget >= 40 ? 10 : 0));
          if (tasks.some((t) => t.partId === id)) continue;
          tasks.push(practiceTask(id, mins));
          budget -= mins;
          if (tasks.length > 5) break;
        }
      }
      studyIndex++;
    }
    out.push({ day, phase, study: study && tasks.length > 0, tasks });
  }
  return out;
}

/** ¿Hecha esta tarea ese día? Según los intentos guardados. */
export function isTaskDone(task: PlanTask, day: string, attempts: Attempt[]): boolean | null {
  const today = attempts.filter((a) => localDay(a.createdAt) === day);
  if (task.kind === "practice") return today.some((a) => a.partId === task.partId);
  if (task.kind === "mock") return today.filter((a) => a.timed).length >= 3;
  return null; // vocabulario y errores no dejan intentos: se marcan a mano
}
