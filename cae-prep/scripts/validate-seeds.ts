/** Valida todos los ejercicios del banco inicial con las mismas reglas que la generación con IA. */
import { SEED_EXERCISES } from "../lib/exercises/seeds";
import { checkExercise } from "../lib/checking";
import { isWritingExercise } from "../lib/schemas";
import { validateContent } from "../lib/validation";

let failed = 0;
for (const ex of SEED_EXERCISES) {
  const problems = validateContent(ex.partId, ex.data);
  if (problems.length) {
    failed++;
    console.error(`✗ ${ex.id}`);
    for (const p of problems) console.error(`    - ${p}`);
  } else {
    console.log(`✓ ${ex.id}`);
  }
}

// Comprobación de la corrección: la respuesta correcta de cada ítem debe puntuar.
for (const ex of SEED_EXERCISES) {
  if (isWritingExercise(ex)) continue;
  const answers: Record<number, string> = {};
  if (ex.partId === "r1" || ex.partId === "r5") ex.data.questions.forEach((q) => (answers[q.n] = String(q.correct)));
  if (ex.partId === "r6" || ex.partId === "r8") ex.data.questions.forEach((q) => (answers[q.n] = String(q.correct)));
  if (ex.partId === "r7") ex.data.gaps.forEach((g) => (answers[g.n] = String(g.correct)));
  if (ex.partId === "r2" || ex.partId === "r3") ex.data.gaps.forEach((g) => (answers[g.n] = g.answers[0]));
  if (ex.partId === "r4") ex.data.items.forEach((i) => (answers[i.n] = i.answers[0]));
  const r = checkExercise(ex, answers);
  if (r.correctCount !== r.total) {
    failed++;
    console.error(`✗ ${ex.id}: la corrección no acepta sus propias respuestas (${r.correctCount}/${r.total})`);
  }
}

if (failed) {
  console.error(`\n${failed} problema(s).`);
  process.exit(1);
}
console.log(`\nOK: ${SEED_EXERCISES.length} ejercicios válidos.`);
