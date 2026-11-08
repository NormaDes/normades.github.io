import assert from "node:assert/strict";
import { test } from "node:test";
import { levelOf, mockParts, scaleScore, summarizeMock } from "../lib/mock";

test("escala: 60 % ≈ 180 (aprobado C1), 100 % = 230, 0 % = 80", () => {
  assert.equal(scaleScore(0.6), 180);
  assert.equal(scaleScore(1), 230);
  assert.equal(scaleScore(0), 80);
  assert.ok(scaleScore(0.5) < 180 && scaleScore(0.5) > 150);
  assert.equal(scaleScore(2), 230); // se recorta
});

test("nivel orientativo por tramos de la escala", () => {
  assert.deepEqual([230, 200, 199, 180, 179, 160, 140, 120].map(levelOf), ["C2", "C2", "C1", "C1", "B2", "B2", "B1", "<B1"]);
});

test("resumen: suma marcas evaluadas y avisa si falta alguna parte", () => {
  const full = summarizeMock([
    { partId: "r1", marks: 8, maxMarks: 8, assessed: true },
    { partId: "r2", marks: 4, maxMarks: 8, assessed: true },
  ]);
  assert.equal(full.raw, 12);
  assert.equal(full.max, 16);
  assert.equal(full.pct, 0.75);
  assert.equal(full.assessedAll, true);
  const partial = summarizeMock([
    { partId: "w1", marks: 0, maxMarks: 20, assessed: false },
    { partId: "w2", marks: 14, maxMarks: 20, assessed: true },
  ]);
  assert.equal(partial.max, 20); // solo cuenta lo evaluado
  assert.equal(partial.assessedAll, false);
});

test("las partes de cada paper salen de la config del examen", () => {
  assert.equal(mockParts("reading").length, 8);
  assert.equal(mockParts("writing").length, 2);
  assert.equal(mockParts("listening").length, 4);
});
