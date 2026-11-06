import type { PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import type { SpeakingSubmission } from "@/lib/speaking";
import type { WritingSubmission } from "@/lib/writing";

/** Resultado de una pregunta dentro de un intento */
export interface AttemptDetail {
  n: number;
  correct: boolean;
  skill: string;
}

export interface Attempt {
  id: string;
  exerciseId: string;
  partId: PartId;
  createdAt: string;
  correctCount: number;
  total: number;
  marks: number;
  maxMarks: number;
  durationSec: number;
  timed: boolean;
  details: AttemptDetail[];
}

/** Pregunta fallada, guardada para el cuaderno de errores */
export interface Mistake {
  id: string;
  exerciseId: string;
  partId: PartId;
  n: number;
  skill: string;
  given: string;
  expected: string;
  createdAt: string;
  resolved: boolean;
}

/**
 * Capa de datos abstracta. Hoy: localStorage (LocalRepository).
 * Para migrar a Supabase basta con implementar esta interfaz (ver supabase/schema.sql)
 * y cambiar el export de lib/storage/index.ts.
 */
export interface Repository {
  saveAttempt(a: Attempt): Promise<void>;
  listAttempts(partId?: PartId): Promise<Attempt[]>;

  addMistakes(m: Mistake[]): Promise<void>;
  listMistakes(): Promise<Mistake[]>;
  /** Marca como resuelto (o no) un fallo concreto */
  setMistakeResolved(id: string, resolved: boolean): Promise<void>;
  /** Marca como resueltos los fallos pendientes de esas preguntas de un ejercicio (al acertarlas de nuevo) */
  resolveMistakes(exerciseId: string, ns: number[]): Promise<void>;

  saveSpeaking(s: SpeakingSubmission): Promise<void>;
  listSpeakings(): Promise<SpeakingSubmission[]>;

  saveWriting(w: WritingSubmission): Promise<void>;
  listWritings(): Promise<WritingSubmission[]>;

  /** Ejercicios generados con IA cacheados (los seeds viven en el código) */
  saveExercise(e: Exercise): Promise<void>;
  listExercises(partId: PartId): Promise<Exercise[]>;
}
