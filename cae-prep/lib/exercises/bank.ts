import { DEFAULT_EXAM, type ExamId, type PartId } from "@/config/exam";
import { seedsForPart } from "@/lib/exercises/seeds";
import type { Exercise } from "@/lib/schemas";
import type { Repository } from "@/lib/storage";

export interface BankPick {
  exercise: Exercise;
  /** true si el usuario aún no lo había hecho */
  fresh: boolean;
}

const sameExam = (e: { exam?: ExamId }, exam: ExamId) => (e.exam ?? DEFAULT_EXAM) === exam;

export async function bankFor(repo: Repository, partId: PartId, exam: ExamId = DEFAULT_EXAM): Promise<Exercise[]> {
  return [...seedsForPart(partId, exam), ...(await repo.listExercises(partId)).filter((e) => sameExam(e, exam))];
}

/** Elige un ejercicio del banco: primero uno no visto; si no quedan, el hecho hace más tiempo. */
export async function pickFromBank(repo: Repository, partId: PartId, exam: ExamId = DEFAULT_EXAM): Promise<BankPick | null> {
  const all = await bankFor(repo, partId, exam);
  if (!all.length) return null;
  const attempts = (await repo.listAttempts(partId)).filter((a) => sameExam(a, exam));
  const lastSeen = new Map<string, string>();
  for (const a of attempts) {
    const prev = lastSeen.get(a.exerciseId);
    if (!prev || a.createdAt > prev) lastSeen.set(a.exerciseId, a.createdAt);
  }
  const unseen = all.filter((e) => !lastSeen.has(e.id));
  if (unseen.length) {
    return { exercise: unseen[Math.floor(Math.random() * unseen.length)], fresh: true };
  }
  const oldest = [...all].sort((a, b) => (lastSeen.get(a.id) ?? "").localeCompare(lastSeen.get(b.id) ?? ""))[0];
  return { exercise: oldest, fresh: false };
}

export async function countUnseen(repo: Repository, partId: PartId, exam: ExamId = DEFAULT_EXAM): Promise<{ unseen: number; total: number }> {
  const all = await bankFor(repo, partId, exam);
  const seen = new Set((await repo.listAttempts(partId)).filter((a) => sameExam(a, exam)).map((a) => a.exerciseId));
  return { unseen: all.filter((e) => !seen.has(e.id)).length, total: all.length };
}
