"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ExerciseView } from "@/components/practice/exercise-view";
import { getPart, partLabel, type PartId } from "@/config/exam";
import { checkExercise, type ExerciseResult, type UserAnswers } from "@/lib/checking";
import { ApiError, fetchAiStatus, requestExercise, type AiStatus } from "@/lib/client/api";
import { countUnseen, pickFromBank } from "@/lib/exercises/bank";
import type { Exercise } from "@/lib/schemas";
import { clientPrefs, repo, type Mistake } from "@/lib/storage";

type Status = "idle" | "loading" | "doing" | "review";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const fmt = (s: number) => {
  const sign = s < 0 ? "-" : "";
  const abs = Math.abs(s);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
};

export function PartRunner({ partId }: { partId: PartId }) {
  const part = getPart(partId);
  const totalSeconds = part.suggestedMinutes * 60;

  const [status, setStatus] = useState<Status>("idle");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [bankInfo, setBankInfo] = useState<{ unseen: number; total: number } | null>(null);
  const [topic, setTopic] = useState("");
  const timerOn = useSyncExternalStore(
    clientPrefs.subscribe,
    () => clientPrefs.get<boolean>("timer", false),
    () => false,
  );
  const [elapsed, setElapsed] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const startedAt = useRef(0);
  const submitted = useRef(false);

  const refreshBank = useCallback(async () => setBankInfo(await countUnseen(repo, partId)), [partId]);

  useEffect(() => {
    let cancelled = false;
    fetchAiStatus().then((s) => !cancelled && setAi(s));
    countUnseen(repo, partId).then((info) => !cancelled && setBankInfo(info));
    return () => {
      cancelled = true;
    };
  }, [partId]);

  // Cronómetro
  useEffect(() => {
    if (status !== "doing") return;
    const id = window.setInterval(() => setElapsed(Math.round((Date.now() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const begin = (ex: Exercise) => {
    setExercise(ex);
    setAnswers({});
    setResult(null);
    setElapsed(0);
    submitted.current = false;
    startedAt.current = Date.now();
    setStatus("doing");
    window.scrollTo({ top: 0 });
  };

  const fromBank = async () => {
    setError(null);
    setNotice(null);
    setStatus("loading");
    const pick = await pickFromBank(repo, partId);
    if (!pick) {
      setStatus("idle");
      setError("No hay ejercicios en el banco para esta parte. Genera uno con IA.");
      return;
    }
    if (!pick.fresh) setNotice("Ya has hecho todos los ejercicios del banco: te repito el que hiciste hace más tiempo. Genera uno nuevo con IA si quieres variar.");
    begin(pick.exercise);
  };

  const fromAi = async () => {
    setError(null);
    setNotice(null);
    setStatus("loading");
    try {
      const { exercise: ex, remainingToday } = await requestExercise(partId, topic.trim() || undefined);
      await repo.saveExercise(ex);
      setAi((prev) => (prev ? { ...prev, remainingToday } : prev));
      await refreshBank();
      begin(ex);
    } catch (e) {
      setStatus(exercise && result ? "review" : "idle");
      setError(e instanceof ApiError || e instanceof Error ? e.message : "No se pudo generar el ejercicio.");
      fetchAiStatus().then(setAi);
    }
  };

  const submit = useCallback(async () => {
    if (!exercise || submitted.current) return;
    submitted.current = true;
    const duration = Math.round((Date.now() - startedAt.current) / 1000);
    const res = checkExercise(exercise, answers);
    setResult(res);
    setStatus("review");
    window.scrollTo({ top: 0 });

    const now = new Date().toISOString();
    await repo.saveAttempt({
      id: uid(),
      exerciseId: exercise.id,
      partId,
      createdAt: now,
      correctCount: res.correctCount,
      total: res.total,
      marks: res.marks,
      maxMarks: res.maxMarks,
      durationSec: duration,
      timed: timerOn,
      details: res.results.map((r) => ({ n: r.n, correct: r.correct, skill: r.skill })),
    });
    const mistakes: Mistake[] = res.results
      .filter((r) => !r.correct)
      .map((r) => ({
        id: uid(),
        exerciseId: exercise.id,
        partId,
        n: r.n,
        skill: r.skill,
        given: r.given,
        expected: r.expected,
        createdAt: now,
        resolved: false,
      }));
    await repo.addMistakes(mistakes);
    refreshBank();
  }, [exercise, answers, partId, timerOn, refreshBank]);

  // Fin de tiempo: corrige automáticamente
  const remaining = totalSeconds - elapsed;
  useEffect(() => {
    if (status === "doing" && timerOn && remaining <= 0) void submit();
  }, [status, timerOn, remaining, submit]);

  const answeredCount = Object.values(answers).filter((v) => v !== undefined && v.trim() !== "").length;
  const aiDisabled = !ai?.configured || (ai?.remainingToday ?? 0) <= 0;

  // ───────────── Pantalla de inicio ─────────────
  if (status === "idle" || status === "loading") {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/practica" className="text-sm text-muted hover:text-ink">← Todas las partes</Link>
        <p className="mt-4 text-sm font-medium text-brand">{partLabel(partId)}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{part.name}</h1>
        <p className="mt-2 text-muted">{part.description}</p>

        <div className="mt-5 rounded-2xl border border-line bg-surface p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Instrucciones del examen</p>
          <p className="mt-1.5 font-serif italic">{part.instructions}</p>
        </div>

        <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={timerOn}
            onChange={(e) => clientPrefs.set("timer", e.target.checked)}
            className="h-5 w-5 accent-[var(--brand)]"
          />
          Temporizador ({part.suggestedMinutes} min, se corrige solo al terminar)
        </label>

        {error && <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={fromBank}
            disabled={status === "loading"}
            className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-60"
          >
            {status === "loading" ? "Cargando…" : "Empezar (del banco)"}
            {bankInfo && status !== "loading" && (
              <span className="ml-2 font-normal opacity-80">{bankInfo.unseen} sin hacer</span>
            )}
          </button>
          <button
            type="button"
            onClick={fromAi}
            disabled={status === "loading" || aiDisabled}
            className="min-h-12 rounded-xl border border-brand px-5 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar nuevo con IA
          </button>
        </div>

        <div className="mt-3 text-xs text-muted">
          {ai === null ? (
            "Comprobando IA…"
          ) : !ai.configured ? (
            <>La generación con IA no está configurada (falta <code>ANTHROPIC_API_KEY</code>). Puedes practicar con el banco inicial.</>
          ) : (
            <>Generaciones con IA restantes hoy: <strong>{ai.remainingToday}</strong></>
          )}
        </div>

        {ai?.configured && (
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={80}
            placeholder="Tema opcional para la IA (p. ej. climate, medicine, art…)"
            aria-label="Tema opcional"
            className="mt-3 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm"
          />
        )}
      </div>
    );
  }

  if (!exercise) return null;

  // ───────────── Ejercicio / revisión ─────────────
  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-0 z-20 -mx-4 mb-5 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{part.name}</p>
          <p className="truncate text-xs text-muted">{exercise.data.title}</p>
        </div>
        {status === "doing" && (
          <div className="flex items-center gap-3 text-sm tabular-nums">
            {timerOn ? (
              <span className={`rounded-lg px-2 py-1 font-bold ${remaining <= 60 ? "bg-bad-soft text-bad" : "bg-brand-soft text-brand"}`} aria-label="Tiempo restante">
                {fmt(remaining)}
              </span>
            ) : (
              <span className="text-muted" aria-label="Tiempo transcurrido">{fmt(elapsed)}</span>
            )}
            <span className="text-muted">{answeredCount}/{part.questionCount}</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-warn-soft px-2.5 py-1 font-semibold">
          Texto de práctica generado — no es un artículo real
        </span>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand">
          {exercise.source === "ai" ? "Generado con IA" : "Banco inicial"}
        </span>
      </div>

      {notice && <p className="mb-4 rounded-xl bg-warn-soft p-3 text-sm">{notice}</p>}

      {status === "doing" && (
        <p className="mb-4 rounded-xl border border-line bg-surface p-3 font-serif text-sm italic">{part.instructions}</p>
      )}

      {status === "review" && result && (
        <div className="mb-6 rounded-2xl border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Resultado</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {result.correctCount}/{result.total}
            <span className="ml-3 text-base font-medium text-muted">
              {result.marks}/{result.maxMarks} marcas · {Math.round((result.correctCount / Math.max(1, result.total)) * 100)}%
            </span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Tiempo: {fmt(elapsed)}
            {timerOn ? ` de ${fmt(totalSeconds)}` : ""}. Tus fallos se han guardado en el cuaderno de errores.
          </p>
          {partId === "r4" && (
            <p className="mt-2 text-xs text-muted">
              En el examen real la Parte 4 puntúa 0-2 por ítem (1 punto por cada mitad correcta). Aquí cada ítem puntúa 2 si coincide con una respuesta aceptada y 0 si no.
            </p>
          )}
        </div>
      )}

      <ExerciseView
        exercise={exercise}
        answers={answers}
        onChange={(n, v) => setAnswers((a) => ({ ...a, [n]: v }))}
        result={status === "review" ? (result ?? undefined) : undefined}
      />

      {error && <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {status === "doing" ? (
          <button
            type="button"
            onClick={() => void submit()}
            className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink sm:col-span-2"
          >
            Corregir ({answeredCount}/{part.questionCount} respondidas)
          </button>
        ) : (
          <>
            <button type="button" onClick={fromBank} className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink">
              Siguiente ejercicio
            </button>
            <button
              type="button"
              onClick={fromAi}
              disabled={aiDisabled}
              className="min-h-12 rounded-xl border border-brand px-5 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generar nuevo con IA
            </button>
            <button type="button" onClick={() => begin(exercise)} className="min-h-12 rounded-xl border border-line px-5 text-sm font-semibold">
              Repetir este ejercicio
            </button>
            <Link href="/practica" className="flex min-h-12 items-center justify-center rounded-xl border border-line px-5 text-sm font-semibold">
              Cambiar de parte
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
