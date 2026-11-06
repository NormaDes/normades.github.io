import type { PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import { r1Seeds } from "@/lib/exercises/seeds/r1";
import { r2Seeds } from "@/lib/exercises/seeds/r2";
import { r3Seeds } from "@/lib/exercises/seeds/r3";
import { r4Seeds } from "@/lib/exercises/seeds/r4";

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
];

export function seedsForPart(partId: PartId): Exercise[] {
  return SEED_EXERCISES.filter((e) => e.partId === partId);
}
