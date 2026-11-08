import assert from "node:assert/strict";
import { test } from "node:test";
import { buildPlan, phaseFor, weakness, isTaskDone } from "@/lib/plan";
import type { Attempt } from "@/lib/storage/types";

const att = (partId: Attempt["partId"], marks: number, max: number, day = "2026-11-09"): Attempt => ({ id: partId + marks, exerciseId: "x", partId, createdAt: `${day}T10:00:00`, correctCount: marks, total: max, marks, maxMarks: max, durationSec: 1, timed: false, details: [] });

test("fases según los días que faltan", () => {
  assert.equal(phaseFor(null), "base");
  assert.equal(phaseFor(90), "base");
  assert.equal(phaseFor(40), "refuerzo");
  assert.equal(phaseFor(10), "simulacros");
  assert.equal(phaseFor(2), "descanso");
});

test("weakness pone primero lo más flojo", () => {
  const w = weakness([att("r2", 2, 8), att("r1", 7, 8)]);
  assert.ok(w.indexOf("r2") < w.indexOf("r1"));
});

test("el plan respeta días por semana y el presupuesto", () => {
  const plan = buildPlan({ today: "2026-11-09", minutesPerDay: 45, daysPerWeek: 4, attempts: [] }, 7);
  assert.equal(plan.filter((d) => d.study).length, 4);
  for (const d of plan) assert.ok(d.tasks.reduce((a, t) => a + t.minutes, 0) <= 45, d.day);
  for (const d of plan.filter((x) => x.study)) assert.ok(d.tasks.some((t) => t.kind === "vocab"));
});

test("sin tareas duplicadas el mismo día", () => {
  const plan = buildPlan({ today: "2026-11-09", minutesPerDay: 90, daysPerWeek: 7, attempts: [] }, 7);
  for (const d of plan) {
    const ids = d.tasks.filter((t) => t.partId).map((t) => t.partId);
    assert.equal(new Set(ids).size, ids.length, d.day);
  }
});

test("fase de simulacros: el sábado hay simulacro", () => {
  const plan = buildPlan({ today: "2026-11-09", examDate: "2026-11-25", minutesPerDay: 90, daysPerWeek: 5, attempts: [] }, 7);
  assert.ok(plan.some((d) => d.tasks.some((t) => t.kind === "mock")));
});

test("últimos días: descanso, sesión ligera", () => {
  const plan = buildPlan({ today: "2026-11-09", examDate: "2026-11-11", minutesPerDay: 90, daysPerWeek: 7, attempts: [] }, 3);
  for (const d of plan) assert.ok(d.tasks.reduce((a, t) => a + t.minutes, 0) <= 20);
});

test("tras el examen no hay plan", () => {
  const plan = buildPlan({ today: "2026-11-09", examDate: "2026-11-01", minutesPerDay: 60, daysPerWeek: 7, attempts: [] }, 3);
  assert.ok(plan.every((d) => !d.study));
});

test("isTaskDone detecta práctica del día", () => {
  const a = [att("r3", 5, 8)];
  assert.equal(isTaskDone({ kind: "practice", partId: "r3", minutes: 15, label: "", href: "" }, "2026-11-09", a), true);
  assert.equal(isTaskDone({ kind: "practice", partId: "r4", minutes: 15, label: "", href: "" }, "2026-11-09", a), false);
  assert.equal(isTaskDone({ kind: "vocab", minutes: 10, label: "", href: "" }, "2026-11-09", a), null);
});
