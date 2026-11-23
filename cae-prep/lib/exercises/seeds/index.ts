import { DEFAULT_EXAM, type ExamId, type PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import { r1Seeds } from "@/lib/exercises/seeds/r1";
import { r2Seeds } from "@/lib/exercises/seeds/r2";
import { r3Seeds } from "@/lib/exercises/seeds/r3";
import { r4Seeds } from "@/lib/exercises/seeds/r4";
import { r5Seeds } from "@/lib/exercises/seeds/r5";
import { r6Seeds } from "@/lib/exercises/seeds/r6";
import { r7Seeds } from "@/lib/exercises/seeds/r7";
import { r8Seeds } from "@/lib/exercises/seeds/r8";
import { w1Seeds, w2Seeds } from "@/lib/exercises/seeds/writing";
import { l1Seeds, l2Seeds, l3Seeds, l4Seeds } from "@/lib/exercises/seeds/listening";
import { s1Seeds, s2Seeds, s3Seeds, s4Seeds } from "@/lib/exercises/seeds/speaking";
import { b2r1Seeds, b2r2Seeds, b2r3Seeds, b2r4Seeds } from "@/lib/exercises/seeds/b2-reading-a";
import { b2t1r1, b2t1r2, b2t1r3, b2t1r4 } from "@/lib/exercises/seeds/b2-import-t1";
import { b2r5Seeds, b2r7Seeds, b2r8Seeds, b2w1Seeds, b2w2Seeds } from "@/lib/exercises/seeds/b2-reading-b";

const SEED_DATE = "2026-11-06T00:00:00.000Z";

function wrap<T extends { id: string; data: unknown }>(partId: PartId, list: T[], exam?: ExamId): Exercise[] {
  return list.map(
    (s) =>
      ({ id: s.id, partId, data: s.data, source: "seed", createdAt: SEED_DATE, isGeneratedText: true, ...(exam ? { exam } : {}) }) as Exercise,
  );
}

/** Banco inicial incluido en el código (se amplía con ejercicios generados por IA y cacheados) */
export const SEED_EXERCISES: Exercise[] = [
  ...wrap("r1", r1Seeds),
  ...wrap("r2", r2Seeds),
  ...wrap("r3", r3Seeds),
  ...wrap("r4", r4Seeds),
  ...wrap("r5", r5Seeds),
  ...wrap("r6", r6Seeds),
  ...wrap("r7", r7Seeds),
  ...wrap("r8", r8Seeds),
  ...wrap("w1", w1Seeds),
  ...wrap("w2", w2Seeds),
  ...wrap("l1", l1Seeds),
  ...wrap("l2", l2Seeds),
  ...wrap("l3", l3Seeds),
  ...wrap("l4", l4Seeds),
  ...wrap("s1", s1Seeds),
  ...wrap("s2", s2Seeds),
  ...wrap("s3", s3Seeds),
  ...wrap("s4", s4Seeds),
  // B2 First
  ...wrap("r1", [...b2r1Seeds, ...b2t1r1], "b2-first"),
  ...wrap("r2", [...b2r2Seeds, ...b2t1r2], "b2-first"),
  ...wrap("r3", [...b2r3Seeds, ...b2t1r3], "b2-first"),
  ...wrap("r4", [...b2r4Seeds, ...b2t1r4], "b2-first"),
  ...wrap("r5", b2r5Seeds, "b2-first"),
  ...wrap("r7", b2r7Seeds, "b2-first"),
  ...wrap("r8", b2r8Seeds, "b2-first"),
  ...wrap("w1", b2w1Seeds, "b2-first"),
  ...wrap("w2", b2w2Seeds, "b2-first"),
];

export function seedsForPart(partId: PartId, exam: ExamId = DEFAULT_EXAM): Exercise[] {
  return SEED_EXERCISES.filter((e) => e.partId === partId && (e.exam ?? DEFAULT_EXAM) === exam);
}
