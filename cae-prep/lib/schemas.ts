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

// ── Listening ──
/** Fragmento de guion: lo lee la voz del navegador (o se ignora si hay audio real) */
export const segment = z.object({
  speaker: z.string().min(1).max(30),
  gender: z.enum(["f", "m"]),
  text: z.string().min(2),
  /** Pausa antes de este fragmento, en ms (p. ej. entre extractos) */
  pauseBefore: z.number().int().min(0).max(5000).optional(),
});
export type Segment = z.infer<typeof segment>;

/** URL o ruta de un archivo de audio real (si existe, se usa en lugar de la voz del navegador) */
const audio = z.string().min(1).max(500).optional();

const mc3Question = z.object({
  n: z.number().int().min(1),
  stem: z.string().min(8),
  options: z.array(z.string().min(1)).length(3),
  correct: z.number().int().min(0).max(2),
  explanations: z.array(z.string().min(3)).length(3),
  evidence: z.string().min(3),
  skill,
});

export function listeningExtractsSchema(count: number, extracts: number) {
  return z.object({
    ...base,
    extracts: z
      .array(
        z.object({
          context: z.string().min(10), // "You hear two colleagues talking about…"
          audio,
          segments: z.array(segment).min(1),
          questions: z.array(mc3Question).length(count / extracts),
        }),
      )
      .length(extracts),
  });
}

export const sentenceItem = z.object({
  n: z.number().int().min(1),
  before: z.string(),
  after: z.string(),
  answers, // una palabra o frase corta (máx. 3 palabras)
  explanation: z.string().min(3),
  evidence: z.string().min(3),
  skill,
});

export function listeningSentenceSchema(count: number) {
  return z.object({
    ...base,
    intro: z.string().min(10),
    audio,
    segments: z.array(segment).min(1),
    sentences: z.array(sentenceItem).length(count),
  });
}

export function listeningInterviewSchema(count: number) {
  return z.object({
    ...base,
    intro: z.string().min(10),
    audio,
    segments: z.array(segment).min(2),
    questions: z.array(mcTextQuestion).length(count),
  });
}

export const matchTask = z.object({ stem: z.string().min(8), options: z.array(z.string().min(2)) });

export const listeningMatchQuestion = z.object({
  n: z.number().int().min(1),
  task: z.number().int().min(1).max(2),
  speaker: z.number().int().min(1).max(10),
  correct: z.number().int().min(0).max(9),
  explanation: z.string().min(3),
  evidence: z.string().min(3),
  skill,
});

export function listeningMatchSchema(count: number, options: number) {
  return z.object({
    ...base,
    speakers: z.array(z.object({ audio, segments: z.array(segment).min(1) })).length(count / 2),
    tasks: z.array(matchTask.extend({ options: z.array(z.string().min(2)).length(options) })).length(2),
    questions: z.array(listeningMatchQuestion).length(count),
  });
}

// ── Speaking ──
export function speakingQuestionsSchema(min: number, max: number) {
  return z.object({ ...base, questions: z.array(z.string().min(8)).min(min).max(max) });
}

export function speakingLongTurnSchema() {
  return z.object({
    ...base,
    instruction: z.string().min(20),
    /** Descripción de las dos fotos (o URL de imagen real en `image`) */
    photos: z.array(z.object({ description: z.string().min(10), image: z.string().max(500).optional() })).length(2),
    partnerQuestion: z.string().min(8),
  });
}

export function speakingCollabSchema() {
  return z.object({
    ...base,
    question: z.string().min(20),
    options: z.array(z.string().min(2)).length(5),
    decisionQuestion: z.string().min(8),
  });
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

export type ListeningExtractsContent = z.infer<ReturnType<typeof listeningExtractsSchema>>;
export type ListeningSentenceContent = z.infer<ReturnType<typeof listeningSentenceSchema>>;
export type ListeningInterviewContent = z.infer<ReturnType<typeof listeningInterviewSchema>>;
export type ListeningMatchContent = z.infer<ReturnType<typeof listeningMatchSchema>>;
export type SpeakingQuestionsContent = z.infer<ReturnType<typeof speakingQuestionsSchema>>;
export type SpeakingLongTurnContent = z.infer<ReturnType<typeof speakingLongTurnSchema>>;
export type SpeakingCollabContent = z.infer<ReturnType<typeof speakingCollabSchema>>;

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
  | { partId: "w2"; data: WritingChoiceContent }
  | { partId: "l1"; data: ListeningExtractsContent }
  | { partId: "l2"; data: ListeningSentenceContent }
  | { partId: "l3"; data: ListeningInterviewContent }
  | { partId: "l4"; data: ListeningMatchContent }
  | { partId: "s1"; data: SpeakingQuestionsContent }
  | { partId: "s2"; data: SpeakingLongTurnContent }
  | { partId: "s3"; data: SpeakingCollabContent }
  | { partId: "s4"; data: SpeakingQuestionsContent };

export type ExerciseSource = "seed" | "ai" | "teacher";

export const SOURCE_LABEL: Record<ExerciseSource, string> = {
  seed: "Banco inicial",
  ai: "Generado con IA",
  teacher: "Material de clase",
};

export type Exercise = ExerciseContent & {
  id: string;
  source: ExerciseSource;
  createdAt: string;
  /** Los textos de práctica por parte NO son artículos reales: se muestran como "texto generado" */
  isGeneratedText: true;
};

/** Ejercicios que se corrigen automáticamente (Reading y Listening) */
export type ReadingExercise = Extract<Exercise, { partId: "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8" }>;
export type ListeningExercise = Extract<Exercise, { partId: "l1" | "l2" | "l3" | "l4" }>;
export type AutoGradedExercise = ReadingExercise | ListeningExercise;
export type WritingExercise = Extract<Exercise, { partId: "w1" | "w2" }>;
export type SpeakingExercise = Extract<Exercise, { partId: "s1" | "s2" | "s3" | "s4" }>;

export const isWritingExercise = (e: Exercise): e is WritingExercise => e.partId === "w1" || e.partId === "w2";
export const isSpeakingExercise = (e: Exercise): e is SpeakingExercise => e.partId.startsWith("s");
export const isListeningExercise = (e: Exercise): e is ListeningExercise => e.partId.startsWith("l");

/** Partes con generador implementado (se amplía en cada fase) */
export const IMPLEMENTED_PARTS: PartId[] = [
  "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8",
  "w1", "w2",
  "l1", "l2", "l3", "l4",
  "s1", "s2", "s3", "s4",
];

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
    case "l1": return listeningExtractsSchema(count, choices);
    case "l2": return listeningSentenceSchema(count);
    case "l3": return listeningInterviewSchema(count);
    case "l4": return listeningMatchSchema(count, choices);
    case "s1": return speakingQuestionsSchema(4, 8);
    case "s2": return speakingLongTurnSchema();
    case "s3": return speakingCollabSchema();
    case "s4": return speakingQuestionsSchema(3, 6);
    default: throw new Error(`No schema for part ${partId} yet`);
  }
}

export const letterOf = (i: number) => String.fromCharCode(65 + i);
