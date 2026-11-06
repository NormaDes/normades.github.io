import type { PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import { clientPrefs } from "@/lib/storage";

export class ApiError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

export interface AiStatus {
  configured: boolean;
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

export async function requestExercise(
  partId: PartId,
  topic?: string,
): Promise<{ exercise: Exercise; remainingToday: number }> {
  const send = (code: string) =>
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-access-code": code },
      body: JSON.stringify({ partId, topic }),
    });

  let res = await send(clientPrefs.get<string>("accessCode", ""));
  if (res.status === 401) {
    const code = window.prompt("Introduce el código de acceso de la app:") ?? "";
    clientPrefs.set("accessCode", code);
    res = await send(code);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? "Error desconocido", body.code ?? "error");
  return body;
}
