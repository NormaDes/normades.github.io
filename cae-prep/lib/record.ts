import type { PartId } from "@/config/exam";
import type { ExerciseResult } from "@/lib/checking";
import type { Mistake, Repository } from "@/lib/storage/types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Guarda el intento de un ejercicio autocorregido y sus fallos:
 * cierra los fallos antiguos que ahora se aciertan y no duplica los que ya estaban pendientes.
 */
export async function recordAutoGraded(
  repo: Repository,
  p: { exerciseId: string; partId: PartId; result: ExerciseResult; durationSec: number; timed: boolean },
): Promise<void> {
  const now = new Date().toISOString();
  const { result: res } = p;
  await repo.saveAttempt({
    id: uid(),
    exerciseId: p.exerciseId,
    partId: p.partId,
    createdAt: now,
    correctCount: res.correctCount,
    total: res.total,
    marks: res.marks,
    maxMarks: res.maxMarks,
    durationSec: p.durationSec,
    timed: p.timed,
    details: res.results.map((r) => ({ n: r.n, correct: r.correct, skill: r.skill })),
  });
  await repo.resolveMistakes(p.exerciseId, res.results.filter((r) => r.correct).map((r) => r.n));
  const pending = new Set((await repo.listMistakes()).filter((m) => !m.resolved && m.exerciseId === p.exerciseId).map((m) => m.n));
  const mistakes: Mistake[] = res.results
    .filter((r) => !r.correct && !pending.has(r.n))
    .map((r) => ({ id: uid(), exerciseId: p.exerciseId, partId: p.partId, n: r.n, skill: r.skill, given: r.given, expected: r.expected, createdAt: now, resolved: false }));
  await repo.addMistakes(mistakes);
}
