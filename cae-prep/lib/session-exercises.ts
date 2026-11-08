import type { Exercise } from "@/lib/schemas";

const KEY = "cae.session.ex.";

/** Ejercicios que solo viven mientras dura la pestaña (p. ej. los de un texto pegado por el alumno) */
export function putSessionExercise(e: Exercise): void {
  try {
    window.sessionStorage.setItem(KEY + e.id, JSON.stringify(e));
  } catch {
    /* sin sessionStorage */
  }
}

export function getSessionExercise(id: string): Exercise | null {
  try {
    const raw = window.sessionStorage.getItem(KEY + id);
    return raw ? (JSON.parse(raw) as Exercise) : null;
  } catch {
    return null;
  }
}
