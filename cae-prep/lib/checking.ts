import { KWT_RULES, getPart } from "@/config/exam";
import { letterOf, type AutoGradedExercise } from "@/lib/schemas";

/** Respuestas del usuario: número de pregunta → texto (o índice de opción como string en Part 1) */
export type UserAnswers = Record<number, string>;

export interface QuestionResult {
  n: number;
  correct: boolean;
  given: string;
  /** Texto de la respuesta correcta mostrado al usuario */
  expected: string;
  skill: string;
  marks: number;
  maxMarks: number;
}

export interface ExerciseResult {
  results: QuestionResult[];
  correctCount: number;
  total: number;
  marks: number;
  maxMarks: number;
}

const CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bwon't\b/g, "will not"],
  [/\bcan't\b/g, "can not"],
  [/\bcannot\b/g, "can not"],
  [/\bshan't\b/g, "shall not"],
  [/n't\b/g, " not"],
  [/'ll\b/g, " will"],
  [/'ve\b/g, " have"],
  [/'re\b/g, " are"],
  [/'m\b/g, " am"],
];

/** Normaliza para comparar: minúsculas, comillas tipográficas, puntuación final, contracciones expandidas */
export function normalizeAnswer(s: string): string {
  let t = s
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;:!?]+$/g, "");
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  return t.replace(/\s+/g, " ").trim();
}

export function isAcceptable(given: string, accepted: string[]): boolean {
  const g = normalizeAnswer(given);
  if (!g) return false;
  return accepted.some((a) => normalizeAnswer(a) === g);
}

/**
 * Cuenta palabras como el examen: las contracciones cuentan como dos.
 * ("haven't seen" = 3 palabras; "wish I'd taken" = 4)
 */
export function countWords(s: string): number {
  const tokens = s.trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const tok of tokens) {
    const t = tok.replace(/[‘’]/g, "'");
    count += 1;
    if (KWT_RULES.contractionsCountAsTwo && /(n't|'ll|'ve|'re|'m|'d)$/i.test(t)) count += 1;
  }
  return count;
}

export function containsWholeWord(haystack: string, word: string): boolean {
  const esc = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}'])${esc}($|[^\\p{L}'])`, "iu").test(haystack);
}

export function checkExercise(exercise: AutoGradedExercise, answers: UserAnswers): ExerciseResult {
  const part = getPart(exercise.partId);
  const results: QuestionResult[] = [];

  switch (exercise.partId) {
    case "r1":
    case "r5": {
      for (const q of exercise.data.questions) {
        const given = answers[q.n] ?? "";
        const ok = given !== "" && Number(given) === q.correct;
        results.push({
          n: q.n,
          correct: ok,
          given: given === "" ? "" : q.options[Number(given)] ?? "",
          expected: q.options[q.correct],
          skill: q.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    // R6 / R8: la respuesta es una letra (texto o sección); R7: letra del párrafo
    case "r6":
    case "r8": {
      for (const q of exercise.data.questions) {
        const given = answers[q.n] ?? "";
        const ok = given !== "" && Number(given) === q.correct;
        results.push({
          n: q.n,
          correct: ok,
          given: given === "" ? "" : letterOf(Number(given)),
          expected: letterOf(q.correct),
          skill: q.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    case "r7": {
      for (const g of exercise.data.gaps) {
        const given = answers[g.n] ?? "";
        const ok = given !== "" && Number(given) === g.correct;
        results.push({
          n: g.n,
          correct: ok,
          given: given === "" ? "" : letterOf(Number(given)),
          expected: letterOf(g.correct),
          skill: g.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    // Listening 1: preguntas dentro de extractos (A-C)
    case "l1": {
      for (const q of exercise.data.extracts.flatMap((e) => e.questions)) {
        const given = answers[q.n] ?? "";
        const ok = given !== "" && Number(given) === q.correct;
        results.push({
          n: q.n,
          correct: ok,
          given: given === "" ? "" : q.options[Number(given)] ?? "",
          expected: q.options[q.correct],
          skill: q.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    case "l3": {
      for (const q of exercise.data.questions) {
        const given = answers[q.n] ?? "";
        const ok = given !== "" && Number(given) === q.correct;
        results.push({
          n: q.n,
          correct: ok,
          given: given === "" ? "" : q.options[Number(given)] ?? "",
          expected: q.options[q.correct],
          skill: q.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    case "l4": {
      for (const q of exercise.data.questions) {
        const given = answers[q.n] ?? "";
        const ok = given !== "" && Number(given) === q.correct;
        results.push({
          n: q.n,
          correct: ok,
          given: given === "" ? "" : letterOf(Number(given)),
          expected: letterOf(q.correct),
          skill: q.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    case "l2": {
      for (const g of exercise.data.sentences) {
        const given = answers[g.n] ?? "";
        const ok = isAcceptable(given, g.answers);
        results.push({
          n: g.n,
          correct: ok,
          given,
          expected: g.answers.join(" / "),
          skill: g.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    case "r2":
    case "r3": {
      for (const g of exercise.data.gaps) {
        const given = answers[g.n] ?? "";
        const ok = isAcceptable(given, g.answers);
        results.push({
          n: g.n,
          correct: ok,
          given,
          expected: g.answers.join(" / "),
          skill: g.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
    case "r4": {
      for (const it of exercise.data.items) {
        const given = answers[it.n] ?? "";
        const ok = isAcceptable(given, it.answers);
        results.push({
          n: it.n,
          correct: ok,
          given,
          expected: it.answers.join(" / "),
          skill: it.skill,
          marks: ok ? part.marksPerQuestion : 0,
          maxMarks: part.marksPerQuestion,
        });
      }
      break;
    }
  }

  return {
    results,
    correctCount: results.filter((r) => r.correct).length,
    total: results.length,
    marks: results.reduce((a, r) => a + r.marks, 0),
    maxMarks: results.reduce((a, r) => a + r.maxMarks, 0),
  };
}
