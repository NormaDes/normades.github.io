"use client";

import { useState, useSyncExternalStore } from "react";
import { clientPrefs } from "@/lib/storage";

const PREF = "examDate";

/** Cuenta atrás hasta el examen (se guarda en este dispositivo). */
export function ExamCountdown() {
  const date = useSyncExternalStore(
    clientPrefs.subscribe,
    () => clientPrefs.get<string>(PREF, ""),
    () => "",
  );
  // Día actual en el cliente (en el servidor es "" para no pintar una fecha desfasada)
  const today = useSyncExternalStore(
    () => () => undefined,
    () => {
      const n = new Date();
      return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
    },
    () => "",
  );
  const [editing, setEditing] = useState(false);

  if (!today) return null;

  const days = date ? Math.round((new Date(`${date}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000) : null;

  if (editing || !date) {
    return (
      <div className="relative mt-5 inline-flex flex-wrap items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm text-white/90">
        <label htmlFor="exam-date">¿Cuándo es tu examen?</label>
        <input
          id="exam-date"
          type="date"
          min={today}
          defaultValue={date || undefined}
          onChange={(e) => {
            if (e.target.value) {
              clientPrefs.set(PREF, e.target.value);
              setEditing(false);
            }
          }}
          className="h-9 rounded-md border border-white/30 bg-white px-2 text-ink"
        />
        {editing && (
          <button type="button" onClick={() => setEditing(false)} className="text-xs underline underline-offset-2">
            Cancelar
          </button>
        )}
      </div>
    );
  }

  const label = days === null ? "" : days > 1 ? `Faltan ${days} días` : days === 1 ? "¡Mañana es el examen!" : days === 0 ? "¡Hoy es el examen! Mucha suerte" : "Tu examen ya ha pasado";

  return (
    <div className="relative mt-5 inline-flex items-center gap-3 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5">
      <span className="font-serif text-lg font-bold">{label}</span>
      <span className="text-xs text-white/70">
        {new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
      </span>
      <button type="button" onClick={() => setEditing(true)} className="text-xs underline underline-offset-2 hover:text-white">
        cambiar
      </button>
    </div>
  );
}
