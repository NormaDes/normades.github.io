import { z } from "zod";
import { getPart, type PartId } from "@/config/exam";

/**
 * Esquemas zod del contenido de cada ejercicio. El nº de preguntas sale de config/exam.ts.
 * Convención de huecos en los textos: {{1}}, {{2}}, …
 */

const skill = z.string().min(2).max(60); // etiqueta del tipo de error: "collocation", "phrasal verb", "linking word"…
const answers = z.array(z.string().min(1)).min(1).max(8);

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
  return z.object({
    title: z.string().min(2),
    topic: z.string().min(2),
    text: z.string().min(200),
    questions: z.array(clozeMcQuestion).length(count),
  });
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
  return z.object({
    title: z.string().min(2),
    topic: z.string().min(2),
    text: z.string().min(200),
    gaps: z.array(openGap).length(count),
  });
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
  return z.object({
    title: z.string().min(2),
    topic: z.string().min(2),
    text: z.string().min(200),
    gaps: z.array(wordFormationGap).length(count),
  });
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
  return z.object({
    title: z.string().min(2),
    topic: z.string().min(2),
    items: z.array(kwtItem).length(count),
  });
}

export type ClozeMcContent = z.infer<ReturnType<typeof clozeMcSchema>>;
export type OpenClozeContent = z.infer<ReturnType<typeof openClozeSchema>>;
export type WordFormationContent = z.infer<ReturnType<typeof wordFormationSchema>>;
export type KwtContent = z.infer<ReturnType<typeof kwtSchema>>;

export type ExerciseContent =
  | { partId: "r1"; data: ClozeMcContent }
  | { partId: "r2"; data: OpenClozeContent }
  | { partId: "r3"; data: WordFormationContent }
  | { partId: "r4"; data: KwtContent };

export type ExerciseSource = "seed" | "ai";

export type Exercise = ExerciseContent & {
  id: string;
  source: ExerciseSource;
  createdAt: string;
  /** Los textos de práctica por parte NO son artículos reales: se muestran como "texto generado" */
  isGeneratedText: true;
};

/** Partes con generador implementado (se amplía en cada fase) */
export const IMPLEMENTED_PARTS: PartId[] = ["r1", "r2", "r3", "r4"];

export function isImplemented(id: PartId): boolean {
  return IMPLEMENTED_PARTS.includes(id);
}

export function schemaForPart(partId: PartId) {
  const count = getPart(partId).questionCount;
  switch (partId) {
    case "r1": return clozeMcSchema(count);
    case "r2": return openClozeSchema(count);
    case "r3": return wordFormationSchema(count);
    case "r4": return kwtSchema(count);
    default: throw new Error(`No schema for part ${partId} yet`);
  }
}
