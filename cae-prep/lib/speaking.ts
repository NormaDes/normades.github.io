import { z } from "zod";

/** Criterios de feedback de Speaking que se pueden evaluar a partir de la transcripción */
export const SPEAKING_CRITERIA = [
  { key: "grammar", label: "Grammar", es: "Gramática" },
  { key: "vocabulary", label: "Vocabulary", es: "Vocabulario" },
  { key: "fluency", label: "Fluency", es: "Fluidez" },
  { key: "coherence", label: "Coherence", es: "Coherencia y desarrollo" },
] as const;

export type SpeakingCriterionKey = (typeof SPEAKING_CRITERIA)[number]["key"];

const score = z.number().min(0).max(5);
const comment = z.string().min(10);

export const speakingEvaluationSchema = z.object({
  scores: z.object({ grammar: score, vocabulary: score, fluency: score, coherence: score }),
  comments: z.object({ grammar: comment, vocabulary: comment, fluency: comment, coherence: comment }),
  errors: z
    .array(
      z.object({
        quote: z.string().min(1).max(200),
        correction: z.string().max(300),
        explanation: z.string().min(3),
      }),
    )
    .max(15),
  /** Mejoras de vocabulario: palabra/frase básica del alumno → alternativa C1 */
  upgrades: z.array(z.object({ original: z.string().min(1).max(120), better: z.string().min(1).max(160) })).max(8),
  strengths: z.array(z.string().min(3)).min(1).max(5),
  priorities: z.array(z.string().min(3)).min(1).max(5),
  /** Respuesta modelo en inglés para la tarea principal */
  modelAnswer: z.string().min(60),
});

export type SpeakingEvaluation = z.infer<typeof speakingEvaluationSchema>;

export interface SpokenAnswer {
  prompt: string;
  transcript: string;
  durationSec: number;
}

export interface SpeakingSubmission {
  id: string;
  exerciseId: string;
  partId: "s1" | "s2" | "s3" | "s4";
  title: string;
  answers: SpokenAnswer[];
  createdAt: string;
  evaluation: SpeakingEvaluation;
}

export const wordsOf = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function speakingTotal(e: SpeakingEvaluation): number {
  return SPEAKING_CRITERIA.reduce((a, c) => a + e.scores[c.key], 0);
}
