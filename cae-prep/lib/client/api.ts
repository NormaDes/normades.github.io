import type { PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { clientPrefs } from "@/lib/storage";
import type { SpeakingEvaluation, SpokenAnswer } from "@/lib/speaking";
import type { LessonPack } from "@/lib/lesson-pack";
import type { ExerciseOrigin } from "@/lib/schemas";
import type { VocabEnrichment } from "@/lib/vocab";
import type { WritingEvaluation } from "@/lib/writing";

export class ApiError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

export interface AiStatus {
  configured: boolean;
  /** Invitado: la IA existe pero hace falta iniciar sesión */
  needsLogin?: boolean;
  /** La IA está apagada a propósito: se muestra «Próximamente» */
  comingSoon?: boolean;
  accessCodeRequired: boolean;
  remainingToday: number;
}

export async function fetchAiStatus(): Promise<AiStatus | null> {
  try {
    const res = await fetch("/api/generate", { cache: "no-store" });
    return res.ok ? ((await res.json()) as AiStatus) : null;
  } catch {
    return null;
  }
}

/** POST JSON con el código de acceso opcional (se pide una vez si el servidor lo exige) */
async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const send = (code: string) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-access-code": code },
      body: JSON.stringify(payload),
    });

  let res = await send(clientPrefs.get<string>("accessCode", ""));
  if (res.status === 401 && isSupabaseConfigured()) {
    throw new ApiError("Esta función es para usuarios con cuenta. Inicia sesión (es gratis).", "login_required");
  }
  if (res.status === 401) {
    const code = window.prompt("Introduce el código de acceso de la app:") ?? "";
    clientPrefs.set("accessCode", code);
    res = await send(code);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? "Error desconocido", body.code ?? "error");
  return body as T;
}

export function requestExercise(partId: PartId, topic?: string) {
  return postJson<{ exercise: Exercise; remainingToday: number }>("/api/generate", { partId, topic });
}

export function requestEvaluation(input: { taskType: string; task: string; text: string }) {
  return postJson<{ evaluation: WritingEvaluation; remainingToday: number }>("/api/evaluate", input);
}

export function requestSpeakingFeedback(input: { partId: PartId; answers: SpokenAnswer[] }) {
  return postJson<{ evaluation: SpeakingEvaluation; remainingToday: number }>("/api/speaking", input);
}

export function requestVocabEnrich(items: Array<{ term: string; context?: string }>) {
  return postJson<{ items: VocabEnrichment[]; remainingToday: number }>("/api/vocab-enrich", { items });
}

export interface MaterialRequest {
  mode: "r5" | "r7" | "r8" | "pack";
  articleId?: string;
  text?: string;
  title?: string;
  url?: string;
  kind?: "article" | "video";
}

export function requestMaterialExercise(input: MaterialRequest & { mode: "r5" | "r7" | "r8" }) {
  return postJson<{ exercise: Exercise; remainingToday: number }>("/api/material-exercise", input);
}

export function requestLessonPack(input: Omit<MaterialRequest, "mode">) {
  return postJson<{ pack: LessonPack; origin: ExerciseOrigin; remainingToday: number }>("/api/material-exercise", { ...input, mode: "pack" });
}
