import assert from "node:assert/strict";
import { test } from "node:test";
import { sourceFidelityProblems, verbatimRatio } from "../lib/ai/material";
import { validatePack } from "../lib/lesson-pack";
import type { ExerciseContent } from "../lib/schemas";

const SOURCE = "Remote work has changed the way people think about the office. Many employees now say they are more productive at home. However, managers worry about losing the spontaneous conversations that happen in corridors.";

test("fidelidad: frases literales puntúan 1, inventadas bajan", () => {
  assert.equal(verbatimRatio("Many employees now say they are more productive at home.", SOURCE), 1);
  assert.equal(verbatimRatio("The moon is made of green cheese and nobody can prove otherwise today.", SOURCE), 0);
  const mixed = "Many employees now say they are more productive at home. The moon is made of green cheese and nobody can prove otherwise today.";
  assert.equal(verbatimRatio(mixed, SOURCE), 0.5);
});

test("R5 basado en texto real: rechaza un texto inventado y acepta uno fiel", () => {
  const mk = (text: string): ExerciseContent => ({ partId: "r5", data: { title: "t", topic: "t", text, questions: [] } } as unknown as ExerciseContent);
  assert.ok(sourceFidelityProblems(mk("A completely invented paragraph about something that the original text never mentioned at all."), SOURCE).length > 0);
  assert.deepEqual(sourceFidelityProblems(mk("Remote work has changed the way people think about the office. Many employees now say they are more productive at home."), SOURCE), []);
});

test("paquete de clase: exige hueco en colocaciones y «your own idea»", () => {
  const ok = {
    summary: "x".repeat(160),
    comprehension: Array.from({ length: 5 }, (_, i) => ({ stem: `Question number ${i}?`, options: ["a1", "b1", "c1", "d1"], correct: 0, explanation: "porque sí", evidence: "quote" })),
    vocabulary: Array.from({ length: 8 }, (_, i) => ({ term: `word${i}`, pos: "noun", definition: "a simple definition", example: "An example sentence here.", collocations: ["one thing", "two things"], translation: "palabra" })),
    collocations: Array.from({ length: 5 }, () => ({ sentence: "They ____ a decision yesterday.", options: ["made", "did", "took", "had"], correct: 0, explanation: "colocación" })),
    essay: { question: "Your class has attended a talk about remote work. You made the notes below.", points: ["flexibility", "isolation", "your own idea"] },
  };
  assert.deepEqual(validatePack(ok), []);
  const bad = JSON.parse(JSON.stringify(ok));
  bad.collocations[0].sentence = "No gap here at all in this sentence.";
  bad.essay.points[2] = "something else";
  const problems = validatePack(bad);
  assert.ok(problems.some((p) => p.includes("hueco")));
  assert.ok(problems.some((p) => p.includes("own idea")));
});
