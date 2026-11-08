"use client";

import { AiOff } from "@/components/ai-off";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LessonPack } from "@/components/library/lesson-pack";
import { ApiError, fetchAiStatus, requestLessonPack, requestMaterialExercise, type AiStatus, type MaterialRequest } from "@/lib/client/api";
import type { LessonPack as Pack } from "@/lib/lesson-pack";
import type { ExerciseOrigin } from "@/lib/schemas";
import { putSessionExercise } from "@/lib/session-exercises";
import { repo } from "@/lib/storage";

const packKey = (k: string) => `cae.v1.pack.${k}`;

/** Botón «Convertir en ejercicio»: Reading 5/7/8 o paquete de clase a partir de un texto real */
/** Palabras mínimas del texto para cada ejercicio (igual que en el servidor) */
const NEED = { r5: 480, r7: 520, r8: 450 } as const;

export function Converter({ source, sourceKey, words }: { source: Omit<MaterialRequest, "mode">; sourceKey: string; words?: number }) {
  const router = useRouter();
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pack, setPack] = useState<{ pack: Pack; origin: ExerciseOrigin } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAiStatus().then((s) => !cancelled && setAi(s));
    try {
      const raw = window.localStorage.getItem(packKey(sourceKey));
      if (raw) {
        const saved = JSON.parse(raw) as { pack: Pack; origin: ExerciseOrigin };
        Promise.resolve().then(() => !cancelled && setPack(saved));
      }
    } catch {
      /* sin caché */
    }
    return () => {
      cancelled = true;
    };
  }, [sourceKey]);

  const disabled = !ai?.configured || (ai?.remainingToday ?? 0) <= 0 || busy !== null;

  const short = (m: "r5" | "r7" | "r8") => words !== undefined && words < NEED[m];

  const makeExercise = async (mode: "r5" | "r7" | "r8") => {
    setBusy(mode);
    setError(null);
    try {
      const { exercise, remainingToday } = await requestMaterialExercise({ ...source, mode });
      setAi((p) => (p ? { ...p, remainingToday } : p));
      if (exercise.origin?.ephemeral) putSessionExercise(exercise);
      else await repo.saveExercise(exercise);
      router.push(`/practica/${mode}?ex=${encodeURIComponent(exercise.id)}`);
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : "No se pudo generar el ejercicio.");
      setBusy(null);
    }
  };

  const makePack = async () => {
    setBusy("pack");
    setError(null);
    try {
      const res = await requestLessonPack(source);
      setAi((p) => (p ? { ...p, remainingToday: res.remainingToday } : p));
      setPack({ pack: res.pack, origin: res.origin });
      try {
        window.localStorage.setItem(packKey(sourceKey), JSON.stringify({ pack: res.pack, origin: res.origin }));
      } catch {
        /* cuota llena */
      }
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : "No se pudo generar el paquete.");
    } finally {
      setBusy(null);
    }
  };

  const btn = "min-h-12 rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-line border-t-[3px] border-t-accent bg-surface p-5">
        <h2 className="font-serif text-xl font-bold">Convertir en ejercicio</h2>
        <p className="mt-1 text-sm text-muted">La IA prepara el ejercicio con frases literales del texto (nunca se inventa contenido). Cada uno gasta 1 uso de IA.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" disabled={disabled || short("r5")} title={short("r5") ? `Hace falta un texto de al menos ${NEED.r5} palabras` : undefined} onClick={() => makeExercise("r5")} className={`${btn} bg-brand text-brand-ink`}>
            {busy === "r5" ? "Preparando…" : "Reading 5 · Opción múltiple"}
          </button>
          <button type="button" disabled={disabled || short("r7")} title={short("r7") ? `Hace falta un texto de al menos ${NEED.r7} palabras` : undefined} onClick={() => makeExercise("r7")} className={`${btn} bg-brand text-brand-ink`}>
            {busy === "r7" ? "Preparando…" : "Reading 7 · Párrafos eliminados"}
          </button>
          <button type="button" disabled={disabled || short("r8")} title={short("r8") ? `Hace falta un texto de al menos ${NEED.r8} palabras` : undefined} onClick={() => makeExercise("r8")} className={`${btn} bg-brand text-brand-ink`}>
            {busy === "r8" ? "Preparando…" : "Reading 8 · Multiple matching"}
          </button>
          <button type="button" disabled={disabled} onClick={makePack} className={`${btn} border border-brand text-brand`}>
            {busy === "pack" ? "Preparando…" : "Resumen + vocabulario + essay"}
          </button>
        </div>
        {words !== undefined && (short("r5") || short("r7") || short("r8")) && (
          <p className="mt-3 text-xs text-muted">Este texto tiene {words} palabras: los ejercicios de Reading necesitan unas {NEED.r5}–{NEED.r7} (el paquete de clase sí está disponible).</p>
        )}
        {busy && <p className="mt-3 text-xs text-muted">Esto puede tardar hasta un minuto…</p>}
        {error && <p role="alert" className="mt-3 rounded-lg bg-bad-soft p-3 text-sm text-bad">{error}</p>}
        {ai && !ai.configured && <p className="mt-3 text-xs text-muted"><AiOff ai={ai} what="convertir textos en ejercicios" /></p>}
        {ai?.configured && ai.remainingToday <= 0 && <p className="mt-3 text-xs text-muted">Has agotado los usos de IA de hoy.</p>}
        {ai?.configured && ai.remainingToday > 0 && <p className="mt-3 text-xs text-muted">Usos de IA restantes hoy: <strong>{ai.remainingToday}</strong></p>}
      </section>
      {pack && <LessonPack pack={pack.pack} origin={pack.origin} sourceKey={sourceKey} />}
    </div>
  );
}
