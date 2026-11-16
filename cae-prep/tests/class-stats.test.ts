import assert from "node:assert/strict";
import { test } from "node:test";
import { buildClassStats } from "../lib/class-stats";

const now = new Date("2026-11-16T12:00:00Z");
const at = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86_400_000).toISOString();
const att = (user: string, part: string, marks: number, max: number, daysAgo: number) => ({ user_id: user, part_id: part, marks, max_marks: max, created_at: at(daysAgo) });

const profiles = [
  { id: "a", name: "Ana" },
  { id: "b", name: "Beñat" },
  { id: "c", name: "Carla" },
];
const attempts = [att("a", "r1", 6, 8, 1), att("a", "r2", 2, 8, 2), att("a", "r1", 8, 8, 0), att("b", "l1", 3, 6, 20)];

test("clase: estado, precisión y parte más floja por alumno", () => {
  const { rows } = buildClassStats(profiles, attempts, now);
  const ana = rows.find((r) => r.id === "a")!;
  assert.equal(ana.total, 3);
  assert.equal(ana.status, "activo");
  assert.equal(ana.last7, 3);
  assert.ok(Math.abs((ana.accuracy ?? 0) - 16 / 24) < 1e-9);
  assert.equal(ana.weakest?.partId, "r2");
  const beñat = rows.find((r) => r.id === "b")!;
  assert.equal(beñat.status, "parado");
  assert.equal(beñat.idleDays, 20);
  assert.equal(rows.find((r) => r.id === "c")!.status, "nuevo");
});

test("clase: ordena primero a quien necesita atención", () => {
  const { rows } = buildClassStats(profiles, attempts, now);
  assert.deepEqual(rows.map((r) => r.name), ["Beñat", "Carla", "Ana"]);
});

test("clase: resumen global y partes de más floja a más fuerte", () => {
  const { summary } = buildClassStats(profiles, attempts, now);
  assert.equal(summary.students, 3);
  assert.equal(summary.active7, 1);
  assert.equal(summary.totalAttempts, 4);
  assert.equal(summary.byPart[0].partId, "r2");
});

test("clase: sin intentos no inventa datos", () => {
  const { rows, summary } = buildClassStats(profiles, [], now);
  assert.ok(rows.every((r) => r.accuracy === null && r.status === "nuevo"));
  assert.equal(summary.avgAccuracy, null);
});
