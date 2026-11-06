import assert from "node:assert/strict";
import { test } from "node:test";
import { INITIAL_EASE, isDue, isLearned, newSrs, previewInterval, review } from "../lib/sm2";

const NOW = new Date("2026-11-06T10:00:00Z");
const days = (iso: string) => Math.round((new Date(iso).getTime() - NOW.getTime()) / 86_400_000);

test("tarjeta nueva: toca hoy y empieza con facilidad 2,5", () => {
  const c = newSrs(NOW);
  assert.equal(c.ease, INITIAL_EASE);
  assert.ok(isDue(c, NOW));
});

test("«Bien» repetido: 1 día, 6 días y luego crece con la facilidad", () => {
  let c = newSrs(NOW);
  c = review(c, "good", NOW);
  assert.equal(c.intervalDays, 1);
  assert.equal(days(c.dueAt), 1);
  c = review(c, "good", NOW);
  assert.equal(c.intervalDays, 6);
  c = review(c, "good", NOW);
  assert.equal(c.intervalDays, 15); // 6 × 2,5
  assert.equal(c.repetitions, 3);
  assert.ok(!isLearned(newSrs(NOW)));
  assert.ok(isLearned(review(c, "good", NOW)));
});

test("«Otra vez»: reinicia, suma un lapso, baja la facilidad y vuelve en 10 min", () => {
  let c = review(review(newSrs(NOW), "good", NOW), "good", NOW);
  c = review(c, "again", NOW);
  assert.equal(c.repetitions, 0);
  assert.equal(c.intervalDays, 0);
  assert.equal(c.lapses, 1);
  assert.ok(c.ease < INITIAL_EASE);
  assert.ok(!isDue(c, NOW));
  assert.ok(isDue(c, new Date(NOW.getTime() + 11 * 60_000)));
});

test("la facilidad nunca baja de 1,3", () => {
  let c = newSrs(NOW);
  for (let i = 0; i < 30; i++) c = review(c, "again", NOW);
  assert.equal(c.ease, 1.3);
});

test("«Fácil» espacia más que «Bien»; «Difícil» menos", () => {
  const base = review(review(newSrs(NOW), "good", NOW), "good", NOW);
  const good = review(base, "good", NOW).intervalDays;
  assert.ok(review(base, "easy", NOW).intervalDays > good);
  assert.ok(review(base, "hard", NOW).intervalDays < good);
});

test("vista previa de intervalos", () => {
  const c = newSrs(NOW);
  assert.equal(previewInterval(c, "again", NOW), "10 min");
  assert.equal(previewInterval(c, "good", NOW), "1 d");
});
