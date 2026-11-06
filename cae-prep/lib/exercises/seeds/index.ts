import type { PartId } from "@/config/exam";
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

const SEED_DATE = "2026-11-06T00:00:00.000Z";

function wrap<T extends { id: string; data: unknown }>(partId: PartId, list: T[]): Exercise[] {
  return list.map(
    (s) =>
      ({ id: s.id, partId, data: s.data, source: "seed", createdAt: SEED_DATE, isGeneratedText: true }) as Exercise,
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
];

export function seedsForPart(partId: PartId): Exercise[] {
  return SEED_EXERCISES.filter((e) => e.partId === partId);
}
