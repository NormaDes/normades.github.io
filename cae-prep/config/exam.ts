/**
 * ÚNICA fuente de verdad de la estructura del examen Cambridge C1 Advanced (CAE).
 * Si Cambridge cambia el formato (partes, tiempos, nº de preguntas, marcas),
 * se edita SOLO este archivo: prompts, esquemas zod, UI y puntuación leen de aquí.
 */

export type PaperId = "reading" | "writing" | "listening" | "speaking";

export type PartId =
  | "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8"
  | "w1" | "w2"
  | "l1" | "l2" | "l3" | "l4"
  | "s1" | "s2" | "s3" | "s4";

export interface PartConfig {
  id: PartId;
  paper: PaperId;
  /** Número de parte dentro del paper (1-based) */
  number: number;
  /** Nombre oficial en inglés */
  name: string;
  /** Descripción corta en español para la interfaz */
  description: string;
  /** Instrucción oficial resumida (en inglés, como en el examen) */
  instructions: string;
  /** Nº de preguntas/huecos/ítems por ejercicio */
  questionCount: number;
  /** Marcas por pregunta en el examen real (para la puntuación estimada) */
  marksPerQuestion: number;
  /** Minutos sugeridos para esta parte (modo práctica con temporizador) */
  suggestedMinutes: number;
  /** Rango de palabras (solo Writing) */
  wordRange?: { min: number; max: number };
  /** Nº de textos / párrafos / secciones entre los que se elige (R6: 4 textos, R7: 7 párrafos, R8: 5 secciones) */
  choices?: number;
}

export interface PaperConfig {
  id: PaperId;
  name: string;
  /** Duración real del paper en minutos (modo simulacro) */
  durationMinutes: number;
  /** Etiqueta en español */
  label: string;
}

export const PAPERS: PaperConfig[] = [
  { id: "reading", name: "Reading & Use of English", label: "Reading & Use of English", durationMinutes: 90 },
  { id: "writing", name: "Writing", label: "Writing", durationMinutes: 90 },
  { id: "listening", name: "Listening", label: "Listening", durationMinutes: 40 },
  { id: "speaking", name: "Speaking", label: "Speaking", durationMinutes: 15 },
];

export const PARTS: PartConfig[] = [
  // ───────── Reading & Use of English ─────────
  {
    id: "r1", paper: "reading", number: 1, name: "Multiple-choice cloze",
    description: "Texto con 8 huecos; elige la palabra correcta entre A, B, C y D (vocabulario, colocaciones, phrasal verbs).",
    instructions: "For questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 8,
  },
  {
    id: "r2", paper: "reading", number: 2, name: "Open cloze",
    description: "Texto con 8 huecos; escribe UNA palabra en cada uno (gramática y expresiones fijas).",
    instructions: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only one word in each gap.",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 8,
  },
  {
    id: "r3", paper: "reading", number: 3, name: "Word formation",
    description: "Texto con 8 huecos; transforma la palabra entre paréntesis (prefijos, sufijos, cambios de categoría).",
    instructions: "For questions 17–24, read the text below. Use the word given in capitals to form a word that fits in the gap.",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 8,
  },
  {
    id: "r4", paper: "reading", number: 4, name: "Key word transformations",
    description: "6 frases: reescribe la segunda con la palabra clave (sin cambiarla) usando de 3 a 6 palabras.",
    instructions: "For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and six words, including the word given.",
    questionCount: 6, marksPerQuestion: 2, suggestedMinutes: 12,
  },
  {
    id: "r5", paper: "reading", number: 5, name: "Multiple choice (long text)",
    description: "Texto largo con 6 preguntas de opción múltiple (A-D).",
    instructions: "For questions 31–36, read the text and choose the answer (A, B, C or D) which you think fits best according to the text.",
    questionCount: 6, marksPerQuestion: 2, suggestedMinutes: 14,
  },
  {
    id: "r6", paper: "reading", number: 6, name: "Cross-text multiple matching",
    description: "Cuatro textos cortos sobre un mismo tema; 4 preguntas de relacionar opiniones.",
    instructions: "For questions 37–40, read the four extracts from articles about the same topic and answer the questions.",
    questionCount: 4, marksPerQuestion: 2, suggestedMinutes: 10, choices: 4,
  },
  {
    id: "r7", paper: "reading", number: 7, name: "Gapped text",
    description: "Texto con 6 párrafos eliminados; colócalos en su sitio (hay uno de sobra).",
    instructions: "For questions 41–46, read the article and choose the correct paragraph for each gap. There is one extra paragraph.",
    questionCount: 6, marksPerQuestion: 2, suggestedMinutes: 12, choices: 7,
  },
  {
    id: "r8", paper: "reading", number: 8, name: "Multiple matching",
    description: "Un texto dividido en secciones; 10 enunciados que hay que localizar.",
    instructions: "For questions 47–56, read the text and match each statement to the correct section.",
    questionCount: 10, marksPerQuestion: 1, suggestedMinutes: 14, choices: 5,
  },

  // ───────── Writing ─────────
  {
    id: "w1", paper: "writing", number: 1, name: "Essay (compulsory)",
    description: "Redacción obligatoria: essay con dos ideas dadas y una propia.",
    instructions: "Write an essay using all the notes and give reasons for your point of view. Write your answer in 220–260 words.",
    questionCount: 1, marksPerQuestion: 20, suggestedMinutes: 45,
    wordRange: { min: 220, max: 260 },
  },
  {
    id: "w2", paper: "writing", number: 2, name: "Letter / proposal / report / review",
    description: "A elegir: carta o email, propuesta, informe o reseña.",
    instructions: "Choose one task and write your answer in 220–260 words.",
    questionCount: 1, marksPerQuestion: 20, suggestedMinutes: 45,
    wordRange: { min: 220, max: 260 },
  },

  // ───────── Listening ─────────
  {
    id: "l1", paper: "listening", number: 1, name: "Three short extracts",
    description: "Tres extractos cortos, dos preguntas de opción múltiple cada uno.",
    instructions: "You will hear three different extracts. For questions 1–6, choose the answer (A, B or C) which fits best according to what you hear.",
    questionCount: 6, marksPerQuestion: 1, suggestedMinutes: 8, choices: 3,
  },
  {
    id: "l2", paper: "listening", number: 2, name: "Sentence completion",
    description: "Monólogo; completa 8 frases con palabras que oyes.",
    instructions: "You will hear a talk. For questions 7–14, complete the sentences with a word or short phrase.",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 8,
  },
  {
    id: "l3", paper: "listening", number: 3, name: "Interview (multiple choice)",
    description: "Entrevista con 6 preguntas de opción múltiple (A-D).",
    instructions: "You will hear an interview. For questions 15–20, choose the answer (A, B, C or D) which fits best.",
    questionCount: 6, marksPerQuestion: 1, suggestedMinutes: 9,
  },
  {
    id: "l4", paper: "listening", number: 4, name: "Multiple matching",
    description: "Cinco hablantes; dos tareas de relacionar (5 + 5).",
    instructions: "You will hear five short extracts. For each task, choose the option (A–H) that matches each speaker.",
    questionCount: 10, marksPerQuestion: 1, suggestedMinutes: 9, choices: 8,
  },

  // ───────── Speaking ─────────
  {
    id: "s1", paper: "speaking", number: 1, name: "Interview",
    description: "Preguntas personales de la examinadora.",
    instructions: "Answer the examiner's questions about yourself and your interests.",
    questionCount: 4, marksPerQuestion: 0, suggestedMinutes: 2,
  },
  {
    id: "s2", paper: "speaking", number: 2, name: "Long turn",
    description: "Comparar dos fotografías durante 1 minuto y comentar la de tu compañero.",
    instructions: "Compare two photographs and answer a question; then react to your partner's turn.",
    questionCount: 1, marksPerQuestion: 0, suggestedMinutes: 4,
  },
  {
    id: "s3", paper: "speaking", number: 3, name: "Collaborative task",
    description: "Conversación con tu compañero a partir de una pregunta y cinco ideas.",
    instructions: "Discuss the question with your partner, then decide together.",
    questionCount: 1, marksPerQuestion: 0, suggestedMinutes: 4,
  },
  {
    id: "s4", paper: "speaking", number: 4, name: "Further discussion",
    description: "Preguntas de discusión más abstractas relacionadas con la Parte 3.",
    instructions: "Answer the examiner's questions and discuss them with your partner.",
    questionCount: 4, marksPerQuestion: 0, suggestedMinutes: 5,
  },
];

/** Reglas de Key Word Transformations (Reading Part 4) */
export const KWT_RULES = {
  minWords: 3,
  maxWords: 6,
  /** En el examen oficial la palabra dada cuenta dentro del límite */
  includesKeyword: true,
  /** Las contracciones (n't, 'll, 've, 're, 'm, 'd) cuentan como dos palabras */
  contractionsCountAsTwo: true,
};

/** Rango de palabras de las Key Word Transformations según el examen (C1: 3-6, B2: 2-5) */
export function kwtRange(exam: ExamId = DEFAULT_EXAM): { min: number; max: number } {
  return exam === "b2-first" ? { min: 2, max: 5 } : { min: KWT_RULES.minWords, max: KWT_RULES.maxWords };
}

/** Reglas de Listening: en el examen cada audio se oye 2 veces */
export const LISTENING_RULES = {
  maxPlays: 2,
};

/** Idioma de las explicaciones de corrección (el contenido del ejercicio siempre en inglés) */
export const EXPLANATION_LANGUAGE: "es" | "en" = "es";

/** Nivel objetivo para la generación */
export const TARGET_LEVEL = "C1 (CEFR) — Cambridge C1 Advanced";

/* ───────── Varios exámenes ─────────
 * Los ejercicios comparten «tipo» (r1…s4) entre exámenes: lo que cambia es la configuración
 * de cada parte (nº de preguntas, marcas, tiempos, instrucciones). Por eso las funciones de
 * consulta aceptan el examen y, si no se indica, usan el C1 Advanced.
 */
export type ExamId = "c1-advanced" | "b2-first";
export const DEFAULT_EXAM: ExamId = "c1-advanced";

export interface ExamConfig {
  id: ExamId;
  name: string;
  level: string;
  papers: PaperConfig[];
  parts: PartConfig[];
  /** Puntuación mínima de aprobado en la escala Cambridge */
  passScore: number;
}

/** B2 First (Cambridge English: First). Los tipos de parte se reutilizan: P6 = «gapped text» (r7), P7 = «multiple matching» (r8). */
const B2_PAPERS: PaperConfig[] = [
  { id: "reading", name: "Reading & Use of English", label: "Reading & Use of English", durationMinutes: 75 },
  { id: "writing", name: "Writing", label: "Writing", durationMinutes: 80 },
  { id: "listening", name: "Listening", label: "Listening", durationMinutes: 40 },
  { id: "speaking", name: "Speaking", label: "Speaking", durationMinutes: 14 },
];

const B2_PARTS: PartConfig[] = [
  { id: "r1", paper: "reading", number: 1, name: "Multiple-choice cloze",
    description: "Texto con 8 huecos; elige la palabra correcta entre A, B, C y D.",
    instructions: "For questions 1–8, read the text below and decide which answer (A, B, C or D) best fits each gap.",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 6 },
  { id: "r2", paper: "reading", number: 2, name: "Open cloze",
    description: "Texto con 8 huecos; escribe UNA palabra en cada uno.",
    instructions: "For questions 9–16, read the text below and think of the word which best fits each gap. Use only one word in each gap.",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 6 },
  { id: "r3", paper: "reading", number: 3, name: "Word formation",
    description: "Texto con 8 huecos; transforma la palabra dada en mayúsculas.",
    instructions: "For questions 17–24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line.",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 7 },
  { id: "r4", paper: "reading", number: 4, name: "Key word transformations",
    description: "6 frases: reescribe la segunda con la palabra clave usando de 2 a 5 palabras.",
    instructions: "For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given.",
    questionCount: 6, marksPerQuestion: 2, suggestedMinutes: 10 },
  { id: "r5", paper: "reading", number: 5, name: "Multiple choice (long text)",
    description: "Texto con 6 preguntas de opción múltiple (A-D).",
    instructions: "For questions 31–36, read the text and choose the answer (A, B, C or D) which you think fits best according to the text.",
    questionCount: 6, marksPerQuestion: 2, suggestedMinutes: 14 },
  { id: "r7", paper: "reading", number: 6, name: "Gapped text",
    description: "Texto con 6 párrafos quitados; colócalos en su sitio (hay uno de sobra).",
    instructions: "For questions 37–42, read the article and choose from the sentences A–G the one which fits each gap. There is one extra sentence which you do not need to use.",
    questionCount: 6, marksPerQuestion: 2, suggestedMinutes: 12, choices: 7 },
  { id: "r8", paper: "reading", number: 7, name: "Multiple matching",
    description: "Varios textos cortos o secciones; relaciona 10 enunciados con el texto correcto.",
    instructions: "For questions 43–52, choose from the sections (A–E). The sections may be chosen more than once.",
    questionCount: 10, marksPerQuestion: 1, suggestedMinutes: 12, choices: 5 },
  { id: "w1", paper: "writing", number: 1, name: "Essay (compulsory)",
    description: "Redacción obligatoria: essay con dos ideas dadas y una propia.",
    instructions: "Write an essay using all the notes and give reasons for your point of view. Write your answer in 140–190 words.",
    questionCount: 1, marksPerQuestion: 20, suggestedMinutes: 40, wordRange: { min: 140, max: 190 } },
  { id: "w2", paper: "writing", number: 2, name: "Article / email / report / review",
    description: "A elegir: artículo, carta o email, informe, reseña o redacción.",
    instructions: "Choose one task and write your answer in 140–190 words.",
    questionCount: 1, marksPerQuestion: 20, suggestedMinutes: 40, wordRange: { min: 140, max: 190 } },
  // Listening y Speaking: estructura oficial; los ejercicios llegarán más adelante
  { id: "l1", paper: "listening", number: 1, name: "Short extracts",
    description: "Ocho extractos cortos; una pregunta de opción múltiple (A-C) cada uno.",
    instructions: "You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).",
    questionCount: 8, marksPerQuestion: 1, suggestedMinutes: 8, choices: 8 },
  { id: "l2", paper: "listening", number: 2, name: "Sentence completion",
    description: "Monólogo; completa 10 frases con palabras que oyes.",
    instructions: "You will hear a talk. For questions 9–18, complete the sentences with a word or short phrase.",
    questionCount: 10, marksPerQuestion: 1, suggestedMinutes: 8 },
  { id: "l4", paper: "listening", number: 3, name: "Multiple matching",
    description: "Cinco hablantes; relaciona a cada uno con una opción (A-H).",
    instructions: "You will hear five different people talking. For questions 19–23, choose from the list (A–H) what each speaker says.",
    questionCount: 5, marksPerQuestion: 1, suggestedMinutes: 7, choices: 8 },
  { id: "l3", paper: "listening", number: 4, name: "Multiple choice",
    description: "Entrevista o conversación con 7 preguntas de opción múltiple (A-C).",
    instructions: "You will hear an interview. For questions 24–30, choose the best answer (A, B or C).",
    questionCount: 7, marksPerQuestion: 1, suggestedMinutes: 9, choices: 3 },
  { id: "s1", paper: "speaking", number: 1, name: "Interview",
    description: "Preguntas personales de la examinadora.",
    instructions: "Answer the examiner's questions about yourself and your interests.",
    questionCount: 4, marksPerQuestion: 0, suggestedMinutes: 2 },
  { id: "s2", paper: "speaking", number: 2, name: "Long turn",
    description: "Comparar dos fotografías durante 1 minuto.",
    instructions: "Compare two photographs and answer a question about them.",
    questionCount: 1, marksPerQuestion: 0, suggestedMinutes: 4 },
  { id: "s3", paper: "speaking", number: 3, name: "Collaborative task",
    description: "Conversación con tu compañero a partir de una pregunta y cinco ideas.",
    instructions: "Discuss the question with your partner, then decide together.",
    questionCount: 1, marksPerQuestion: 0, suggestedMinutes: 4 },
  { id: "s4", paper: "speaking", number: 4, name: "Further discussion",
    description: "Preguntas de discusión relacionadas con la Parte 3.",
    instructions: "Answer the examiner's questions and discuss them with your partner.",
    questionCount: 4, marksPerQuestion: 0, suggestedMinutes: 4 },
];

export const EXAMS: Record<ExamId, ExamConfig> = {
  "c1-advanced": { id: "c1-advanced", name: "C1 Advanced", level: "C1", papers: PAPERS, parts: PARTS, passScore: 180 },
  "b2-first": { id: "b2-first", name: "B2 First", level: "B2", papers: B2_PAPERS, parts: B2_PARTS, passScore: 160 },
};

export const isExamId = (s: unknown): s is ExamId => s === "c1-advanced" || s === "b2-first";
export const examOrDefault = (s: unknown): ExamId => (isExamId(s) ? s : DEFAULT_EXAM);

export function partsOf(exam: ExamId = DEFAULT_EXAM): PartConfig[] {
  return EXAMS[exam].parts;
}
export function papersOf(exam: ExamId = DEFAULT_EXAM): PaperConfig[] {
  return EXAMS[exam].papers;
}

export function getPart(id: PartId, exam: ExamId = DEFAULT_EXAM): PartConfig {
  const p = EXAMS[exam].parts.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown part: ${id} (${exam})`);
  return p;
}

export function isPartId(id: string): id is PartId {
  return PARTS.some((p) => p.id === id);
}

export function hasPart(id: PartId, exam: ExamId = DEFAULT_EXAM): boolean {
  return EXAMS[exam].parts.some((p) => p.id === id);
}

export function partsOfPaper(paper: PaperId, exam: ExamId = DEFAULT_EXAM): PartConfig[] {
  return EXAMS[exam].parts.filter((p) => p.paper === paper);
}

export function partLabel(id: PartId, exam: ExamId = DEFAULT_EXAM): string {
  const p = getPart(id, exam);
  const paper = EXAMS[exam].papers.find((x) => x.id === p.paper)!;
  return `${paper.name} · Parte ${p.number} — ${p.name}`;
}
