import assert from "node:assert/strict";
import { test } from "node:test";
import { EXAMS, getPart, hasPart, kwtRange, partsOfPaper } from "../config/exam";
import { SEED_EXERCISES, seedsForPart } from "../lib/exercises/seeds";
import { checkExercise } from "../lib/checking";
import { isImplemented } from "../lib/schemas";
import { validateContent } from "../lib/validation";

test("B2 First: estructura oficial (7 partes de Reading, 2 de Writing, tiempos)", () => {
  assert.equal(EXAMS["b2-first"].papers.find((p) => p.id === "reading")!.durationMinutes, 75);
  assert.equal(EXAMS["b2-first"].papers.find((p) => p.id === "writing")!.durationMinutes, 80);
  assert.equal(partsOfPaper("reading", "b2-first").length, 7);
  assert.equal(partsOfPaper("writing", "b2-first").length, 2);
  assert.equal(getPart("r7", "b2-first").number, 6); // «gapped text» es la parte 6 en B2
  assert.equal(getPart("w1", "b2-first").wordRange?.max, 190);
  assert.deepEqual(kwtRange("b2-first"), { min: 2, max: 5 });
});

test("C1 no cambia al añadir B2", () => {
  assert.equal(getPart("r7").number, 7);
  assert.equal(getPart("w1").wordRange?.max, 260);
  assert.equal(hasPart("r6"), true);
  assert.equal(hasPart("r6", "b2-first"), false);
  assert.deepEqual(kwtRange(), { min: 3, max: 6 });
});

test("B2: todos los ejercicios del banco son válidos y se corrigen con sus propias respuestas", () => {
  const b2 = SEED_EXERCISES.filter((e) => e.exam === "b2-first");
  assert.ok(b2.length >= 9);
  for (const ex of b2) {
    assert.deepEqual(validateContent(ex.partId, ex.data, "b2-first"), [], ex.id);
    assert.equal(isImplemented(ex.partId, "b2-first"), true);
  }
});

test("el banco no mezcla exámenes", () => {
  const c1 = seedsForPart("r1").map((e) => e.id);
  const b2 = seedsForPart("r1", "b2-first").map((e) => e.id);
  assert.ok(c1.length > 0 && b2.length > 0);
  assert.ok(c1.every((id) => !id.startsWith("b2-")));
  assert.ok(b2.every((id) => id.startsWith("b2-")));
});

test("B2: la corrección usa las marcas de B2 (Key word = 2 marcas, 2-5 palabras)", () => {
  const ex = seedsForPart("r4", "b2-first")[0];
  assert.equal(ex.partId, "r4");
  if (ex.partId !== "r4") return;
  const answers: Record<number, string> = {};
  for (const i of ex.data.items) answers[i.n] = i.answers[0];
  const r = checkExercise(ex, answers);
  assert.equal(r.correctCount, r.total);
  assert.equal(r.marks, 12);
});
