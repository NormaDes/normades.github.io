import assert from "node:assert/strict";
import { test } from "node:test";
import { bestStreak, computeProgress, currentStreak, localDay, suggestNext } from "../lib/progress";
import type { Attempt } from "../lib/storage/types";

const NOW = new Date("2026-11-06T12:00:00");

function attempt(day: string, partId: Attempt["partId"], ok: number, total: number, skills: Array<[string, boolean]> = []): Attempt {
  return {
    id: Math.random().toString(36),
    exerciseId: "x",
    partId,
    createdAt: new Date(`${day}T10:00:00`).toISOString(),
    correctCount: ok,
    total,
    marks: ok,
    maxMarks: total,
    durationSec: 120,
    timed: false,
    details: skills.map(([skill, correct], i) => ({ n: i + 1, correct, skill })),
  };
}

test("racha: cuenta desde ayer si hoy no has practicado", () => {
  const days = new Set(["2026-11-05", "2026-11-04", "2026-11-03"]);
  assert.equal(currentStreak(days, NOW), 3);
  days.add("2026-11-06");
  assert.equal(currentStreak(days, NOW), 4);
  assert.equal(currentStreak(new Set(["2026-11-01"]), NOW), 0);
});

test("mejor racha: detecta el tramo consecutivo más largo", () => {
  const days = new Set(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-10", "2026-10-11"]);
  assert.equal(bestStreak(days), 3);
  assert.equal(bestStreak(new Set()), 0);
});

test("progreso: precisión por parte, evolución y tipos de error", () => {
  const list = [
    attempt("2026-11-04", "r1", 4, 8, [["collocation", false], ["collocation", false], ["collocation", true]]),
    attempt("2026-11-04", "r1", 6, 8, [["collocation", false]]),
    attempt("2026-11-05", "r2", 8, 8, [["preposition", true], ["preposition", true], ["preposition", true]]),
  ];
  const p = computeProgress(list, NOW);
  assert.equal(p.totalAttempts, 3);
  assert.equal(Math.round(p.accuracy! * 100), 75); // 18/24
  assert.deepEqual(p.parts.map((x) => [x.partId, Math.round(x.accuracy * 100), x.attempts]), [["r1", 63, 2], ["r2", 100, 1]]);
  assert.equal(p.daily.length, 2);
  assert.equal(p.daily[0].exercises, 2);
  // colocaciones: 4 muestras, 3 fallos; preposición: 3 muestras sin fallos
  assert.equal(p.skills[0].skill, "collocation");
  assert.equal(p.skills[0].wrong, 3);
  assert.equal(p.heat.length, 84);
  assert.equal(p.heat.at(-1)!.day, localDay(NOW));
  assert.equal(p.minutes, 6);
});

test("progreso sin datos: no falla y sugiere Reading 1", () => {
  const p = computeProgress([], NOW);
  assert.equal(p.accuracy, null);
  assert.equal(p.suggestion.partId, "r1");
  assert.equal(p.parts.length, 0);
});

test("sugerencia: la parte más floja con al menos 2 intentos", () => {
  const list = [attempt("2026-11-04", "r3", 3, 8), attempt("2026-11-05", "r3", 4, 8), attempt("2026-11-05", "r1", 8, 8), attempt("2026-11-05", "r1", 8, 8)];
  assert.equal(suggestNext(list).partId, "r3");
});
