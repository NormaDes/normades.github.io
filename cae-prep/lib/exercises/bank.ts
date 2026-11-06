import type { PartId } from "@/config/exam";
import { seedsForPart } from "@/lib/exercises/seeds";
import type { Exercise } from "@/lib/schemas";
import type { Repository } from "@/lib/storage";

export interface BankPick {
  exercise: Exercise;
  /** true si el usuario aún no lo había hecho */
  fresh: boolean;
}

export async function bankFor(repo: Repository, partId: PartId): Promise<Exercise[]> {
  return [...seedsForPart(partId), ...(await repo.listExercises(partId))];
}

/** Elige un ejercicio del banco: primero uno no visto; si no quedan, el hecho hace más tiempo. */
export async function pickFromBank(repo: Repository, partId: PartId): Promise<BankPick | null> {
  const all = await bankFor(repo, partId);
  if (!all.length) return null;
  const attempts = await repo.listAttempts(partId);
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

export async function countUnseen(repo: Repository, partId: PartId): Promise<{ unseen: number; total: number }> {
  const all = await bankFor(repo, partId);
  const seen = new Set((await repo.listAttempts(partId)).map((a) => a.exerciseId));
  return { unseen: all.filter((e) => !seen.has(e.id)).length, total: all.length };
}
