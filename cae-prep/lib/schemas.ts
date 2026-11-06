import { z } from "zod";
import { getPart, type PartId } from "@/config/exam";

/**
 * Esquemas zod del contenido de cada ejercicio. El nº de preguntas (y de textos/párrafos/secciones)
 * sale de config/exam.ts. Convención de huecos en los textos: {{1}}, {{2}}, …
 */

const skill = z.string().min(2).max(60); // etiqueta del tipo de error: "collocation", "phrasal verb", "inference"…
const answers = z.array(z.string().min(1)).min(1).max(8);
const base = { title: z.string().min(2), topic: z.string().min(2) };

// ── Reading Part 1 — Multiple-choice cloze ──
export const clozeMcQuestion = z.object({
  n: z.number().int().min(1),
  options: z.array(z.string().min(1)).length(4),
  /** Índice 0-3 de la opción correcta */
  correct: z.number().int().min(0).max(3),
  /** Una explicación por opción (por qué es correcta / por qué falla), en el mismo orden que options */
  explanations: z.array(z.string().min(3)).length(4),
  /** Fragmento literal del texto que justifica la respuesta */
  evidence: z.string().min(3),
  skill,
});

export function clozeMcSchema(count: number) {
  return z.object({ ...base, text: z.string().min(200), questions: z.array(clozeMcQuestion).length(count) });
}

// ── Reading Part 2 — Open cloze ──
export const openGap = z.object({
  n: z.number().int().min(1),
  answers, // respuestas aceptadas (una palabra cada una)
  explanation: z.string().min(3),
  evidence: z.string().min(3),
  skill,
});

export function openClozeSchema(count: number) {
  return z.object({ ...base, text: z.string().min(200), gaps: z.array(openGap).length(count) });
}

// ── Reading Part 3 — Word formation ──
export const wordFormationGap = z.object({
  n: z.number().int().min(1),
  base: z.string().min(2), // palabra en mayúsculas junto al hueco
  answers,
  explanation: z.string().min(3),
  evidence: z.string().min(3),
  skill,
});

export function wordFormationSchema(count: number) {
  return z.object({ ...base, text: z.string().min(200), gaps: z.array(wordFormationGap).length(count) });
}

// ── Reading Part 4 — Key word transformations ──
export const kwtItem = z.object({
  n: z.number().int().min(1),
  first: z.string().min(8), // frase original
  keyword: z.string().min(2), // en MAYÚSCULAS, una palabra
  before: z.string(), // texto de la segunda frase antes del hueco
  after: z.string(), // texto de la segunda frase después del hueco
  answers, // contenido del hueco, incluida la keyword (3-6 palabras)
  explanation: z.string().min(3),
  skill,
});

export function kwtSchema(count: number) {
  return z.object({ ...base, items: z.array(kwtItem).length(count) });
}

// ── Reading Part 5 — Multiple choice (long text) ──
export const mcTextQuestion = z.object({
  n: z.number().int().min(1),
  stem: z.string().min(8),
  options: z.array(z.string().min(1)).length(4),
  correct: z.number().int().min(0).max(3),
  explanations: z.array(z.string().min(3)).length(4),
  evidence: z.string().min(3),
  skill,
});

export function mcTextSchema(count: number) {
  return z.object({ ...base, text: z.string().min(1200), questions: z.array(mcTextQuestion).length(count) });
}

// ── Reading Part 6 — Cross-text multiple matching ──
export const labelledText = z.object({
  label: z.string().min(1).max(3), // "A", "B"…
  author: z.string().min(2).max(60), // autor ficticio del extracto
  text: z.string().min(250),
});

export const matchQuestion = z.object({
  n: z.number().int().min(1),
  stem: z.string().min(8),
  /** Índice (0-based) del texto/sección correctos */
  correct: z.number().int().min(0).max(9),
  explanation: z.string().min(3),
  evidence: z.string().min(3),
  skill,
});

export function crossTextSchema(count: number, texts: number) {
  return z.object({
    ...base,
    intro: z.string().min(10), // frase de contexto ("Four writers give their views on…")
    texts: z.array(labelledText).length(texts),
    questions: z.array(matchQuestion).length(count),
  });
}

// ── Reading Part 7 — Gapped text ──
export const gappedParagraph = z.object({ letter: z.string().min(1).max(2), text: z.string().min(40) });

export const gappedGap = z.object({
  n: z.number().int().min(1),
  /** Índice (0-based) del párrafo correcto */
  correct: z.number().int().min(0).max(9),
  explanation: z.string().min(3),
  evidence: z.string().min(3),
  skill,
});

export function gappedTextSchema(count: number, paragraphs: number) {
  return z.object({
    ...base,
    text: z.string().min(800),
    paragraphs: z.array(gappedParagraph).length(paragraphs),
    gaps: z.array(gappedGap).length(count),
  });
}

// ── Reading Part 8 — Multiple matching ──
export const section = z.object({
  label: z.string().min(1).max(3),
  heading: z.string().min(2).max(80),
  text: z.string().min(250),
});

export function multiMatchSchema(count: number, sections: number) {
  return z.object({
    ...base,
    intro: z.string().min(10),
    sections: z.array(section).length(sections),
    questions: z.array(matchQuestion).length(count),
  });
}

// ── Writing Part 1 — Essay ──
export function essaySchema() {
  return z.object({
    ...base,
    /** Contexto: "Your class has attended a panel discussion on…" */
    question: z.string().min(30),
    /** Tres puntos: dos dados + "your own idea" */
    points: z.array(z.string().min(2)).length(3),
  });
}

// ── Writing Part 2 — Letter/email, proposal, report, review ──
export const WRITING_TASK_TYPES = ["letter", "email", "proposal", "report", "review"] as const;
export type WritingTaskType = (typeof WRITING_TASK_TYPES)[number];

export const writingTask = z.object({
  type: z.enum(WRITING_TASK_TYPES),
  situation: z.string().min(40),
  requirements: z.array(z.string().min(3)).min(2).max(5),
});

export function writingChoiceSchema() {
  return z.object({ ...base, tasks: z.array(writingTask).length(3) });
}

export type ClozeMcContent = z.infer<ReturnType<typeof clozeMcSchema>>;
export type OpenClozeContent = z.infer<ReturnType<typeof openClozeSchema>>;
export type WordFormationContent = z.infer<ReturnType<typeof wordFormationSchema>>;
export type KwtContent = z.infer<ReturnType<typeof kwtSchema>>;
export type McTextContent = z.infer<ReturnType<typeof mcTextSchema>>;
export type CrossTextContent = z.infer<ReturnType<typeof crossTextSchema>>;
export type GappedTextContent = z.infer<ReturnType<typeof gappedTextSchema>>;
export type MultiMatchContent = z.infer<ReturnType<typeof multiMatchSchema>>;
export type EssayContent = z.infer<ReturnType<typeof essaySchema>>;
export type WritingChoiceContent = z.infer<ReturnType<typeof writingChoiceSchema>>;

export type ExerciseContent =
  | { partId: "r1"; data: ClozeMcContent }
  | { partId: "r2"; data: OpenClozeContent }
  | { partId: "r3"; data: WordFormationContent }
  | { partId: "r4"; data: KwtContent }
  | { partId: "r5"; data: McTextContent }
  | { partId: "r6"; data: CrossTextContent }
  | { partId: "r7"; data: GappedTextContent }
  | { partId: "r8"; data: MultiMatchContent }
  | { partId: "w1"; data: EssayContent }
  | { partId: "w2"; data: WritingChoiceContent };

export type ExerciseSource = "seed" | "ai";

export type Exercise = ExerciseContent & {
  id: string;
  source: ExerciseSource;
  createdAt: string;
  /** Los textos de práctica por parte NO son artículos reales: se muestran como "texto generado" */
  isGeneratedText: true;
};

/** Ejercicios que se corrigen automáticamente (todo menos Writing) */
export type AutoGradedExercise = Exclude<Exercise, { partId: "w1" | "w2" }>;
export type WritingExercise = Extract<Exercise, { partId: "w1" | "w2" }>;

export const isWritingExercise = (e: Exercise): e is WritingExercise => e.partId === "w1" || e.partId === "w2";

/** Partes con generador implementado (se amplía en cada fase) */
export const IMPLEMENTED_PARTS: PartId[] = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "w1", "w2"];

export function isImplemented(id: PartId): boolean {
  return IMPLEMENTED_PARTS.includes(id);
}

export function schemaForPart(partId: PartId) {
  const part = getPart(partId);
  const count = part.questionCount;
  const choices = part.choices ?? 0;
  switch (partId) {
    case "r1": return clozeMcSchema(count);
    case "r2": return openClozeSchema(count);
    case "r3": return wordFormationSchema(count);
    case "r4": return kwtSchema(count);
    case "r5": return mcTextSchema(count);
    case "r6": return crossTextSchema(count, choices);
    case "r7": return gappedTextSchema(count, choices);
    case "r8": return multiMatchSchema(count, choices);
    case "w1": return essaySchema();
    case "w2": return writingChoiceSchema();
    default: throw new Error(`No schema for part ${partId} yet`);
  }
}

export const letterOf = (i: number) => String.fromCharCode(65 + i);
