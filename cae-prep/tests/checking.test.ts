import assert from "node:assert/strict";
import { test } from "node:test";
import { checkExercise, containsWholeWord, countWords, isAcceptable, normalizeAnswer } from "../lib/checking";
import { SEED_EXERCISES } from "../lib/exercises/seeds";
import { isSpeakingExercise, isWritingExercise } from "../lib/schemas";
import { validateContent } from "../lib/validation";

test("normalizar: mayúsculas, comillas tipográficas y contracciones", () => {
  assert.equal(normalizeAnswer("  Haven’t   Seen. "), "have not seen");
  assert.equal(normalizeAnswer("wish I'd taken"), "wish i'd taken");
  assert.equal(normalizeAnswer("Can't"), "can not");
});

test("respuestas aceptadas: compara sin importar formato", () => {
  assert.ok(isAcceptable("Haven't seen", ["have not seen"]));
  assert.ok(!isAcceptable("", ["x"]));
  assert.ok(!isAcceptable("have seen", ["have not seen"]));
});

test("recuento de palabras: las contracciones cuentan como dos", () => {
  assert.equal(countWords("haven't seen"), 3);
  assert.equal(countWords("in spite of being"), 4);
  assert.equal(countWords("wish I'd taken"), 4);
});

test("keyword: coincidencia de palabra completa, sin flexionar", () => {
  assert.ok(containsWholeWord("wish I had taken", "wish"));
  assert.ok(!containsWholeWord("wishes he had taken", "wish"));
  assert.ok(!containsWholeWord("blamed Paul", "blame"));
});

test("banco inicial: todos los ejercicios son válidos y se corrigen a sí mismos", () => {
  assert.ok(SEED_EXERCISES.length >= 29);
  for (const ex of SEED_EXERCISES) {
    assert.deepEqual(validateContent(ex.partId, ex.data), [], ex.id);
    if (isWritingExercise(ex) || isSpeakingExercise(ex)) continue;
    const answers: Record<number, string> = {};
    if ("questions" in ex.data && ex.partId !== "l4" && ex.partId !== "l1") ex.data.questions.forEach((q) => (answers[q.n] = String((q as { correct: number }).correct)));
    if (ex.partId === "l1") ex.data.extracts.flatMap((e) => e.questions).forEach((q) => (answers[q.n] = String(q.correct)));
    if (ex.partId === "l4") ex.data.questions.forEach((q) => (answers[q.n] = String(q.correct)));
    if (ex.partId === "r7") ex.data.gaps.forEach((g) => (answers[g.n] = String(g.correct)));
    if (ex.partId === "r2" || ex.partId === "r3") ex.data.gaps.forEach((g) => (answers[g.n] = g.answers[0]));
    if (ex.partId === "r4") ex.data.items.forEach((i) => (answers[i.n] = i.answers[0]));
    if (ex.partId === "l2") ex.data.sentences.forEach((g) => (answers[g.n] = g.answers[0]));
    const r = checkExercise(ex, answers);
    assert.equal(r.correctCount, r.total, ex.id);
  }
});

test("validación: rechaza una transformación con la keyword cambiada o fuera de 3-6 palabras", () => {
  const seed = SEED_EXERCISES.find((e) => e.id === "seed-r4-set-a")!;
  const bad = JSON.parse(JSON.stringify(seed.data));
  bad.items[0].answers = ["in spites of being"]; // keyword alterada
  bad.items[1].answers = ["blamed"]; // 1 palabra
  const problems = validateContent("r4", bad);
  assert.ok(problems.some((p) => p.includes("keyword")));
  assert.ok(problems.some((p) => p.includes("palabras")));
});
