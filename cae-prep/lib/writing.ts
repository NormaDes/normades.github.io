import { z } from "zod";

/** Criterios oficiales de Writing en Cambridge C1 Advanced (0-5 cada uno, total 20) */
export const CRITERIA = [
  { key: "content", label: "Content", es: "Contenido" },
  { key: "communicativeAchievement", label: "Communicative Achievement", es: "Logro comunicativo" },
  { key: "organisation", label: "Organisation", es: "Organización" },
  { key: "language", label: "Language", es: "Lenguaje" },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];

const score = z.number().min(0).max(5);
const comment = z.string().min(10);

export const ERROR_TYPES = ["grammar", "vocabulary", "spelling", "punctuation", "register", "cohesion", "task"] as const;

export const evaluationSchema = z.object({
  scores: z.object({
    content: score,
    communicativeAchievement: score,
    organisation: score,
    language: score,
  }),
  comments: z.object({
    content: comment,
    communicativeAchievement: comment,
    organisation: comment,
    language: comment,
  }),
  errors: z
    .array(
      z.object({
        /** Fragmento EXACTO del texto del alumno */
        quote: z.string().min(1).max(200),
        type: z.enum(ERROR_TYPES),
        correction: z.string().max(300),
        explanation: z.string().min(3),
      }),
    )
    .max(20),
  strengths: z.array(z.string().min(3)).min(1).max(5),
  priorities: z.array(z.string().min(3)).min(1).max(5),
  /** Versión mejorada en inglés, manteniendo las ideas del alumno */
  improvedVersion: z.string().min(100),
});

export type WritingEvaluation = z.infer<typeof evaluationSchema>;

export interface WritingSubmission {
  id: string;
  exerciseId: string;
  partId: "w1" | "w2";
  taskType: string;
  taskTitle: string;
  text: string;
  wordCount: number;
  createdAt: string;
  durationSec: number;
  evaluation: WritingEvaluation;
}

export function countTextWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export const roundHalf = (n: number) => Math.round(n * 2) / 2;

export function totalScore(e: WritingEvaluation): number {
  return CRITERIA.reduce((a, c) => a + e.scores[c.key], 0);
}

/** Orientación (no oficial) según la media de los 4 criterios */
export function bandHint(total: number): { label: string; tone: "ok" | "warn" | "bad" } {
  const avg = total / 4;
  if (avg >= 4.5) return { label: "Nivel muy sólido, con rasgos de C2", tone: "ok" };
  if (avg >= 3.5) return { label: "C1 consolidado", tone: "ok" };
  if (avg >= 3) return { label: "C1 aprobado (justo)", tone: "warn" };
  if (avg >= 2.5) return { label: "Entre B2+ y C1: te falta poco", tone: "warn" };
  return { label: "Por debajo del nivel C1 en este texto", tone: "bad" };
}
