import type { PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import type { Attempt, Mistake, Repository } from "@/lib/storage/types";

const PREFIX = "cae.v1.";
const MAX_CACHED_EXERCISES = 200;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Cuota llena o modo privado: la app sigue funcionando sin persistencia.
  }
}

export class LocalRepository implements Repository {
  async saveAttempt(a: Attempt) {
    write("attempts", [...read<Attempt[]>("attempts", []), a]);
  }

  async listAttempts(partId?: PartId) {
    const all = read<Attempt[]>("attempts", []);
    return partId ? all.filter((a) => a.partId === partId) : all;
  }

  async addMistakes(m: Mistake[]) {
    if (!m.length) return;
    write("mistakes", [...read<Mistake[]>("mistakes", []), ...m]);
  }

  async listMistakes() {
    return read<Mistake[]>("mistakes", []);
  }

  async saveExercise(e: Exercise) {
    const all = read<Exercise[]>("exercises", []).filter((x) => x.id !== e.id);
    all.push(e);
    write("exercises", all.slice(-MAX_CACHED_EXERCISES));
  }

  async listExercises(partId: PartId) {
    return read<Exercise[]>("exercises", []).filter((e) => e.partId === partId);
  }
}

const prefListeners = new Set<() => void>();

/** Ajustes ligeros del cliente (código de acceso, preferencia de temporizador) */
export const clientPrefs = {
  get<T>(key: string, fallback: T): T {
    return read<T>("pref." + key, fallback);
  },
  set<T>(key: string, value: T): void {
    write("pref." + key, value);
    prefListeners.forEach((l) => l());
  },
  /** Para useSyncExternalStore */
  subscribe(listener: () => void): () => void {
    prefListeners.add(listener);
    return () => prefListeners.delete(listener);
  },
};
