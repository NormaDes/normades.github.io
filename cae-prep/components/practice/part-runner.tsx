"use client";

import { PAPER_ICONS } from "@/components/icons";
import { PAPER_THEME } from "@/lib/paper-theme";
import { AiOff } from "@/components/ai-off";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ExerciseView } from "@/components/practice/exercise-view";
import { ListeningView } from "@/components/practice/listening-view";
import { getPart, partLabel, type PartId } from "@/config/exam";
import { checkExercise, type ExerciseResult, type UserAnswers } from "@/lib/checking";
import { ApiError, fetchAiStatus, requestExercise, type AiStatus } from "@/lib/client/api";
import { bankFor, countUnseen, pickFromBank } from "@/lib/exercises/bank";
import { recordAutoGraded } from "@/lib/record";
import { getSessionExercise } from "@/lib/session-exercises";
import { SOURCE_LABEL, isListeningExercise, type AutoGradedExercise, type ReadingExercise } from "@/lib/schemas";
import { clientPrefs, repo } from "@/lib/storage";

type Status = "idle" | "loading" | "doing" | "review";

const fmt = (s: number) => {
  const sign = s < 0 ? "-" : "";
  const abs = Math.abs(s);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
};

export function PartRunner({ partId }: { partId: PartId }) {
  const part = getPart(partId);
  const totalSeconds = part.suggestedMinutes * 60;

  const [status, setStatus] = useState<Status>("idle");
  const [exercise, setExercise] = useState<AutoGradedExercise | null>(null);
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

  const begin = (ex: AutoGradedExercise) => {
    setExercise(ex);
    setAnswers({});
    setResult(null);
    setElapsed(0);
    submitted.current = false;
    startedAt.current = Date.now();
    setStatus("doing");
    window.scrollTo({ top: 0 });
  };

  // Enlace «Repetir ejercicio» desde el cuaderno de errores: /practica/r1?ex=<id>
  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("ex");
    if (!wanted) return;
    let cancelled = false;
    const session = getSessionExercise(wanted);
    if (session && session.partId === partId) {
      void Promise.resolve().then(() => !cancelled && begin(session as AutoGradedExercise));
      return () => {
        cancelled = true;
      };
    }
    bankFor(repo, partId).then((all) => {
      const ex = all.find((e) => e.id === wanted);
      if (ex && !cancelled) begin(ex as AutoGradedExercise);
    });
    return () => {
      cancelled = true;
    };
  }, [partId]);

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
    begin(pick.exercise as AutoGradedExercise);
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
      begin(ex as AutoGradedExercise);
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

    await recordAutoGraded(repo, { exerciseId: exercise.id, partId, result: res, durationSec: duration, timed: timerOn });
    refreshBank();
  }, [exercise, answers, partId, timerOn, refreshBank]);

  // Fin de tiempo: corrige automáticamente
  const remaining = totalSeconds - elapsed;
  useEffect(() => {
    if (status === "doing" && timerOn && remaining <= 0) void submit();
  }, [status, timerOn, remaining, submit]);

  const theme = PAPER_THEME[part.paper];
  const PaperIcon = PAPER_ICONS[part.paper];
  const answeredCount = Object.values(answers).filter((v) => v !== undefined && v.trim() !== "").length;
  const aiDisabled = !ai?.configured || (ai?.remainingToday ?? 0) <= 0;

  // ───────────── Pantalla de inicio ─────────────
  if (status === "idle" || status === "loading") {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href="/practica" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-muted hover:text-ink">← Todas las partes</Link>
        <div className={`mt-2 flex items-start gap-4 rounded-3xl border-2 ${theme.border} ${theme.soft} p-5`}>
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${theme.solid} ${theme.lift}`}>
            <PaperIcon width={30} height={30} weight="fill" />
          </span>
          <div className="min-w-0">
            <p className={`eyebrow ${theme.text}`}>{partLabel(partId)}</p>
            <h1 className="mt-0.5 text-3xl leading-tight">{part.name}</h1>
            <p className="mt-1.5 text-sm font-semibold text-muted">{part.description}</p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border-2 border-line bg-surface p-4 text-sm">
          <p className="eyebrow text-muted">Instrucciones del examen</p>
          <p className="mt-1.5 font-semibold italic">{part.instructions}</p>
        </div>

        <label className="mt-4 flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 border-line bg-surface px-4 text-sm font-bold">
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
            className="min-h-14 rounded-2xl bg-brand px-5 text-base font-extrabold text-brand-ink disabled:opacity-60"
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
            className="min-h-14 rounded-2xl border-2 border-brand px-5 text-base font-extrabold text-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar nuevo con IA
          </button>
        </div>

        <div className="mt-3 text-xs text-muted">
          {ai === null ? (
            "Comprobando IA…"
          ) : !ai.configured ? (
            <><AiOff ai={ai} what="generar ejercicios nuevos con IA" /> Mientras tanto puedes practicar con el banco.</>
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
            className="mt-3 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-sm font-semibold"
          />
        )}
      </div>
    );
  }

  if (!exercise) return null;

  // ───────────── Ejercicio / revisión ─────────────
  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-16 z-20 -mx-4 mb-5 border-b-2 border-line bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.solid}`}>
              <PaperIcon width={22} height={22} weight="fill" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{part.name}</p>
              <p className="truncate text-xs font-semibold text-muted">{exercise.data.title}</p>
            </div>
          </div>
          {status === "doing" && (
            <div className="flex items-center gap-3 text-sm tabular-nums">
              {timerOn ? (
                <span className={`rounded-full px-3 py-1 font-extrabold ${remaining <= 60 ? "bg-bad-soft text-bad" : "bg-brand-soft text-brand"}`} aria-label="Tiempo restante">
                  {fmt(remaining)}
                </span>
              ) : (
                <span className="font-bold text-muted" aria-label="Tiempo transcurrido">{fmt(elapsed)}</span>
              )}
              <span className="rounded-full bg-bg px-3 py-1 font-extrabold">{answeredCount}/{part.questionCount}</span>
            </div>
          )}
        </div>
        {status === "doing" && (
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={part.questionCount} aria-valuenow={answeredCount} aria-label="Preguntas respondidas">
            <div className={`h-full rounded-full transition-[width] duration-300 ${theme.solid.split(" ")[0]}`} style={{ width: `${Math.min(100, (answeredCount / Math.max(1, part.questionCount)) * 100)}%` }} />
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {exercise.origin ? (
          <span className="rounded-full bg-ok-soft px-2.5 py-1 font-semibold text-ok">
            Texto real: {exercise.origin.url ? <a href={exercise.origin.url} target="_blank" rel="noreferrer" className="underline">{exercise.origin.title}</a> : exercise.origin.title}
            {" · "}{exercise.origin.sourceName}{exercise.origin.license ? ` (${exercise.origin.license})` : ""}
          </span>
        ) : (
          <span className="rounded-full bg-warn-soft px-2.5 py-1 font-semibold">
            {part.paper === "listening" ? "Guion de práctica con voz sintética, no es una grabación real" : "Texto de práctica generado, no es un artículo real"}
          </span>
        )}
        <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand">
          {SOURCE_LABEL[exercise.source]}
        </span>
      </div>

      {notice && <p className="mb-4 rounded-xl bg-warn-soft p-3 text-sm">{notice}</p>}

      {status === "doing" && (
        <p className="mb-4 rounded-xl border border-line bg-surface p-3 font-serif text-sm italic">{part.instructions}</p>
      )}

      {status === "review" && result && (() => {
        const pct = Math.round((result.correctCount / Math.max(1, result.total)) * 100);
        const great = pct >= 80;
        const ok = pct >= 60;
        return (
          <div className={`mb-6 overflow-hidden rounded-3xl border-2 ${great ? "border-mint bg-ok-soft" : ok ? "border-sun-dark/40 bg-sun-soft" : "border-accent/30 bg-coral-soft"}`}>
            <div className="flex flex-wrap items-center gap-5 p-5">
              <div className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full text-white shadow-[0_5px_0_rgba(0,0,0,0.18)] ${great ? "bg-mint" : ok ? "bg-sun text-[#4d3700]" : "bg-accent"}`}>
                <span className="font-display text-4xl font-semibold leading-none tabular-nums">{pct}</span>
                <span className="text-xs font-extrabold">%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-semibold leading-tight">{great ? "¡Excelente trabajo!" : ok ? "¡Bien! Vas por buen camino" : "No pasa nada: así se aprende"}</p>
                <p className="mt-1 text-sm font-semibold">
                  {result.correctCount} de {result.total} correctas · {result.marks}/{result.maxMarks} marcas
                </p>
                <p className="mt-1 text-xs font-semibold text-muted">
                  Tiempo: {fmt(elapsed)}
                  {timerOn ? ` de ${fmt(totalSeconds)}` : ""}. Tus fallos están en el cuaderno de errores.
                </p>
              </div>
            </div>
            {partId === "r4" && (
              <p className="border-t-2 border-black/5 px-5 py-3 text-xs font-semibold text-muted">
                En el examen real la Parte 4 puntúa 0-2 por ítem (1 punto por cada mitad correcta). Aquí cada ítem puntúa 2 si coincide con una respuesta aceptada y 0 si no.
              </p>
            )}
          </div>
        );
      })()}

      {isListeningExercise(exercise) ? (
        <ListeningView
          exercise={exercise}
          answers={answers}
          onChange={(n, v) => setAnswers((a) => ({ ...a, [n]: v }))}
          result={status === "review" ? (result ?? undefined) : undefined}
        />
      ) : (
        <ExerciseView
          exercise={exercise as ReadingExercise}
          answers={answers}
          onChange={(n, v) => setAnswers((a) => ({ ...a, [n]: v }))}
          result={status === "review" ? (result ?? undefined) : undefined}
        />
      )}

      {error && <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}

      <div className={`mt-8 grid gap-3 sm:grid-cols-2 ${status === "doing" ? "sticky bottom-[4.75rem] z-20 rounded-3xl bg-bg/90 py-2 backdrop-blur lg:bottom-4" : ""}`}>
        {status === "doing" ? (
          <button
            type="button"
            onClick={() => void submit()}
            className="min-h-14 rounded-2xl bg-brand px-5 text-base font-extrabold text-brand-ink sm:col-span-2"
          >
            Corregir ({answeredCount}/{part.questionCount} respondidas)
          </button>
        ) : (
          <>
            <button type="button" onClick={fromBank} className="min-h-14 rounded-2xl bg-brand px-5 text-base font-extrabold text-brand-ink">
              Siguiente ejercicio
            </button>
            <button
              type="button"
              onClick={fromAi}
              disabled={aiDisabled}
              className="min-h-14 rounded-2xl border-2 border-brand bg-surface px-5 text-base font-extrabold text-brand disabled:cursor-not-allowed disabled:opacity-50"
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
