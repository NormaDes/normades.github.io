"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Recorder, type Recording } from "@/components/practice/recorder";
import { SpeakingFeedback } from "@/components/practice/speaking-feedback";
import { getPart, partLabel, type PartId } from "@/config/exam";
import { ApiError, fetchAiStatus, requestExercise, requestSpeakingFeedback, type AiStatus } from "@/lib/client/api";
import { countUnseen, pickFromBank } from "@/lib/exercises/bank";
import type { SpeakingExercise } from "@/lib/schemas";
import { SPEAKING_CRITERIA, speakingTotal, wordsOf, type SpeakingEvaluation } from "@/lib/speaking";
import { repo } from "@/lib/storage";

type Status = "idle" | "loading" | "doing" | "evaluating" | "review";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface PromptItem {
  label: string;
  prompt: string;
  targetSec: number;
}

/** Convierte el ejercicio en la lista de respuestas que se graban */
function promptsOf(ex: SpeakingExercise): PromptItem[] {
  switch (ex.partId) {
    case "s1":
      return ex.data.questions.map((q, i) => ({ label: `Pregunta ${i + 1}`, prompt: q, targetSec: 30 }));
    case "s4":
      return ex.data.questions.map((q, i) => ({ label: `Pregunta ${i + 1}`, prompt: q, targetSec: 45 }));
    case "s2":
      return [
        {
          label: "Tu turno (1 minuto)",
          prompt: `${ex.data.instruction}\n${ex.data.photos.map((p) => p.description).join("\n")}`,
          targetSec: 60,
        },
        { label: "Pregunta sobre las fotos de tu compañero (20 s)", prompt: ex.data.partnerQuestion, targetSec: 20 },
      ];
    case "s3":
      return [
        {
          label: "Conversación (2 minutos)",
          prompt: `${ex.data.question}\nOptions: ${ex.data.options.join("; ")}\nThen decide: ${ex.data.decisionQuestion}`,
          targetSec: 120,
        },
      ];
  }
}

export function SpeakingRunner({ partId }: { partId: PartId }) {
  const part = getPart(partId);

  const [status, setStatus] = useState<Status>("idle");
  const [exercise, setExercise] = useState<SpeakingExercise | null>(null);
  const [recs, setRecs] = useState<Array<Recording | null>>([]);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [bankInfo, setBankInfo] = useState<{ unseen: number; total: number } | null>(null);
  const [topic, setTopic] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAiStatus().then((s) => !cancelled && setAi(s));
    countUnseen(repo, partId).then((i) => !cancelled && setBankInfo(i));
    return () => {
      cancelled = true;
    };
  }, [partId]);

  const begin = (ex: SpeakingExercise) => {
    setExercise(ex);
    setRecs(promptsOf(ex).map(() => null));
    setEvaluation(null);
    setError(null);
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
      setError("No hay ejercicios en el banco para esta parte.");
      return;
    }
    if (!pick.fresh) setNotice("Ya has hecho todos los del banco: te repito el más antiguo.");
    begin(pick.exercise as SpeakingExercise);
  };

  const fromAi = async () => {
    setError(null);
    setNotice(null);
    setStatus("loading");
    try {
      const { exercise: ex, remainingToday } = await requestExercise(partId, topic.trim() || undefined);
      await repo.saveExercise(ex);
      setAi((p) => (p ? { ...p, remainingToday } : p));
      countUnseen(repo, partId).then(setBankInfo);
      begin(ex as SpeakingExercise);
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "No se pudo generar el ejercicio.");
      fetchAiStatus().then(setAi);
    }
  };

  const prompts = exercise ? promptsOf(exercise) : [];
  const totalWords = recs.reduce((a, r) => a + wordsOf(r?.transcript ?? ""), 0);
  const aiDisabled = !ai?.configured || (ai?.remainingToday ?? 0) <= 0;

  const evaluate = async () => {
    if (!exercise) return;
    setError(null);
    setStatus("evaluating");
    const answers = prompts
      .map((p, i) => ({ prompt: p.prompt, transcript: (recs[i]?.transcript ?? "").trim(), durationSec: Math.round(recs[i]?.durationSec ?? 0) }))
      .filter((a) => a.transcript);
    try {
      const { evaluation: ev, remainingToday } = await requestSpeakingFeedback({ partId, answers });
      setAi((p) => (p ? { ...p, remainingToday } : p));
      const now = new Date().toISOString();
      const marks = speakingTotal(ev);
      await repo.saveSpeaking({ id: uid(), exerciseId: exercise.id, partId: partId as "s1", title: exercise.data.title, answers, createdAt: now, evaluation: ev });
      await repo.saveAttempt({
        id: uid(),
        exerciseId: exercise.id,
        partId,
        createdAt: now,
        correctCount: Math.round(marks),
        total: 20,
        marks,
        maxMarks: 20,
        durationSec: answers.reduce((a, x) => a + x.durationSec, 0),
        timed: false,
        details: SPEAKING_CRITERIA.map((c, i) => ({ n: i + 1, correct: ev.scores[c.key] >= 3, skill: c.label })),
      });
      setEvaluation(ev);
      setStatus("review");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setStatus("doing");
      setError(e instanceof ApiError || e instanceof Error ? e.message : "No se pudo evaluar.");
      fetchAiStatus().then(setAi);
    }
  };

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
        <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          Grabas tu voz (el audio se queda en tu dispositivo), el navegador la transcribe y la IA valora gramática, vocabulario, fluidez y coherencia. Necesitas permitir el micrófono. Mejor con Chrome o Edge.
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={fromBank} disabled={status === "loading"} className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-60">
            {status === "loading" ? "Cargando…" : "Empezar (del banco)"}
            {bankInfo && status !== "loading" && <span className="ml-2 font-normal opacity-80">{bankInfo.unseen} sin hacer</span>}
          </button>
          <button type="button" onClick={fromAi} disabled={status === "loading" || aiDisabled} className="min-h-12 rounded-xl border border-brand px-5 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50">
            Generar con IA
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          {ai === null ? "Comprobando IA…" : !ai.configured ? <>La IA no está configurada (falta <code>ANTHROPIC_API_KEY</code>): puedes grabarte, pero no obtener el feedback.</> : <>Usos de IA restantes hoy: <strong>{ai.remainingToday}</strong></>}
        </p>
        {ai?.configured && (
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={80} placeholder="Tema opcional" aria-label="Tema opcional" className="mt-3 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm" />
        )}
      </div>
    );
  }

  if (!exercise) return null;
  const review = status === "review";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-14 z-20 -mx-4 md:top-0 mb-5 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{part.name}</p>
          <p className="truncate text-xs text-muted">{exercise.data.title}</p>
        </div>
        <span className="text-sm tabular-nums text-muted">{totalWords} palabras</span>
      </div>

      {notice && <p className="mb-4 rounded-xl bg-warn-soft p-3 text-sm">{notice}</p>}

      {/* Material de la tarea */}
      {exercise.partId === "s2" && (
        <section className="mb-5 space-y-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-serif text-[1.02rem]">{exercise.data.instruction}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {exercise.data.photos.map((p, i) => (
              <figure key={i} className="rounded-2xl border border-line bg-surface p-4">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={p.description} className="mb-3 w-full rounded-xl" />
                ) : (
                  <div aria-hidden className="mb-3 flex h-24 items-center justify-center rounded-xl bg-brand-soft text-3xl">🖼️</div>
                )}
                <figcaption className="font-serif text-[0.98rem]">{p.description}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-muted">Las fotos se describen con texto. Cuando tengas imágenes reales del profe, se mostrarán aquí.</p>
        </section>
      )}
      {exercise.partId === "s3" && (
        <section className="mb-5 rounded-2xl border border-line bg-surface p-4">
          <p className="font-serif text-[1.02rem]">{exercise.data.question}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {exercise.data.options.map((o, i) => (
              <div key={i} className="rounded-xl border border-line bg-bg px-3 py-2 text-sm font-medium">{o}</div>
            ))}
          </div>
          <p className="mt-3 font-serif text-[1.02rem] font-semibold">{exercise.data.decisionQuestion}</p>
          <p className="mt-2 text-xs text-muted">Habla como si tuvieras a tu compañero delante: haz preguntas, reacciona y llegad a una decisión.</p>
        </section>
      )}

      <div className="space-y-4">
        {prompts.map((p, i) => (
          <div key={i}>
            {(exercise.partId === "s1" || exercise.partId === "s4") && (
              <p className="mb-2 font-serif text-[1.05rem] font-semibold">{p.prompt}</p>
            )}
            {exercise.partId === "s2" && i === 1 && <p className="mb-2 font-serif text-[1.05rem] font-semibold">{p.prompt}</p>}
            <Recorder
              key={`${exercise.id}-${i}`}
              label={p.label}
              targetSec={p.targetSec}
              value={recs[i] ?? null}
              onChange={(r) => setRecs((all) => all.map((x, j) => (j === i ? r : x)))}
              readOnly={review}
            />
          </div>
        ))}
      </div>

      {review && evaluation ? (
        <div className="mt-8">
          <SpeakingFeedback evaluation={evaluation} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={fromBank} className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink">Siguiente ejercicio</button>
            <button type="button" onClick={fromAi} disabled={aiDisabled} className="min-h-12 rounded-xl border border-brand px-5 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50">Generar nuevo con IA</button>
            <button type="button" onClick={() => begin(exercise)} className="min-h-12 rounded-xl border border-line px-5 text-sm font-semibold">Repetir este ejercicio</button>
            <Link href="/practica" className="flex min-h-12 items-center justify-center rounded-xl border border-line px-5 text-sm font-semibold">Cambiar de parte</Link>
          </div>
        </div>
      ) : (
        <>
          {error && <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}
          <button
            type="button"
            onClick={evaluate}
            disabled={status === "evaluating" || totalWords < 15 || aiDisabled}
            className="mt-6 min-h-12 w-full rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "evaluating" ? "Evaluando… (puede tardar hasta 1 minuto)" : "Obtener feedback con IA"}
          </button>
          {aiDisabled && status !== "evaluating" && (
            <p className="mt-2 text-xs text-muted">{ai?.configured ? "Has agotado los usos de IA de hoy." : "El feedback requiere configurar ANTHROPIC_API_KEY en el servidor."}</p>
          )}
          {!aiDisabled && totalWords < 15 && <p className="mt-2 text-xs text-muted">Graba o escribe al menos 15 palabras para poder evaluarlo.</p>}
        </>
      )}
    </div>
  );
}
