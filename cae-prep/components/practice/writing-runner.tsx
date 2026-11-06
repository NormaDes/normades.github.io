"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { WritingFeedback } from "@/components/practice/writing-feedback";
import { getPart, partLabel, type PartId } from "@/config/exam";
import { ApiError, fetchAiStatus, requestEvaluation, requestExercise, type AiStatus } from "@/lib/client/api";
import { countUnseen, pickFromBank } from "@/lib/exercises/bank";
import { SOURCE_LABEL, type WritingExercise } from "@/lib/schemas";
import { clientPrefs, repo } from "@/lib/storage";
import { CRITERIA, countTextWords, totalScore, type WritingEvaluation } from "@/lib/writing";

type Status = "idle" | "loading" | "doing" | "evaluating" | "review";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Reloj fuera del componente (los handlers lo llaman, nunca el render) */
const clock = () => Date.now();

const fmt = (s: number) => {
  const sign = s < 0 ? "-" : "";
  const abs = Math.abs(s);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
};

const TYPE_LABEL: Record<string, string> = {
  essay: "Essay",
  letter: "Letter",
  email: "Email",
  proposal: "Proposal",
  report: "Report",
  review: "Review",
};

/** Enunciado completo de una tarea, tal y como se manda a la IA y se muestra al usuario */
function describeTask(ex: WritingExercise, taskIdx: number): { type: string; text: string } {
  if (ex.partId === "w1") {
    const d = ex.data;
    return {
      type: "essay",
      text: `${d.question}\nNotes:\n${d.points.map((p, i) => `${i + 1}. ${p}`).join("\n")}\nWrite an essay discussing two of the points. You should explain which idea you think is more important, giving reasons to support your opinion.`,
    };
  }
  const t = ex.data.tasks[taskIdx];
  return { type: t.type, text: `${t.situation}\nIn your ${t.type} you should:\n${t.requirements.map((r) => `- ${r}`).join("\n")}` };
}

export function WritingRunner({ partId }: { partId: PartId }) {
  const part = getPart(partId);
  const range = part.wordRange ?? { min: 220, max: 260 };
  const totalSeconds = part.suggestedMinutes * 60;

  const [status, setStatus] = useState<Status>("idle");
  const [exercise, setExercise] = useState<WritingExercise | null>(null);
  const [taskIdx, setTaskIdx] = useState(0);
  const [text, setText] = useState("");
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [submittedText, setSubmittedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [bankInfo, setBankInfo] = useState<{ unseen: number; total: number } | null>(null);
  const [topic, setTopic] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerOn = useSyncExternalStore(
    clientPrefs.subscribe,
    () => clientPrefs.get<boolean>("timer", false),
    () => false,
  );
  const startedAt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetchAiStatus().then((s) => !cancelled && setAi(s));
    countUnseen(repo, partId).then((i) => !cancelled && setBankInfo(i));
    return () => {
      cancelled = true;
    };
  }, [partId]);

  useEffect(() => {
    if (status !== "doing") return;
    const id = window.setInterval(() => setElapsed(Math.round((clock() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const draftKey = (ex: WritingExercise, idx: number) => `draft.${ex.id}.${idx}`;

  const begin = (ex: WritingExercise, idx = 0) => {
    setExercise(ex);
    setTaskIdx(idx);
    setText(clientPrefs.get<string>(draftKey(ex, idx), ""));
    setEvaluation(null);
    setError(null);
    setElapsed(0);
    startedAt.current = clock();
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
      setError("No hay enunciados en el banco para esta parte. Genera uno con IA.");
      return;
    }
    if (!pick.fresh) setNotice("Ya has hecho todos los enunciados del banco: te repito el más antiguo. Genera uno nuevo con IA si quieres variar.");
    begin(pick.exercise as WritingExercise);
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
      begin(ex as WritingExercise);
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "No se pudo generar el enunciado.");
      fetchAiStatus().then(setAi);
    }
  };

  const onText = (v: string) => {
    setText(v);
    if (exercise) clientPrefs.set(draftKey(exercise, taskIdx), v);
  };

  const words = countTextWords(text);
  const aiDisabled = !ai?.configured || (ai?.remainingToday ?? 0) <= 0;
  const remaining = totalSeconds - elapsed;

  const evaluate = async () => {
    if (!exercise) return;
    setError(null);
    setStatus("evaluating");
    const task = describeTask(exercise, taskIdx);
    const sent = text.trim();
    try {
      const { evaluation: ev, remainingToday } = await requestEvaluation({ taskType: task.type, task: task.text, text: sent });
      setAi((p) => (p ? { ...p, remainingToday } : p));
      const now = new Date().toISOString();
      const duration = Math.round((clock() - startedAt.current) / 1000);
      const wc = countTextWords(sent);
      const marks = totalScore(ev);
      await repo.saveWriting({
        id: uid(),
        exerciseId: exercise.id,
        partId: partId as "w1" | "w2",
        taskType: task.type,
        taskTitle: exercise.data.title,
        text: sent,
        wordCount: wc,
        createdAt: now,
        durationSec: duration,
        evaluation: ev,
      });
      await repo.saveAttempt({
        id: uid(),
        exerciseId: exercise.id,
        partId,
        createdAt: now,
        correctCount: Math.round(marks),
        total: 20,
        marks,
        maxMarks: 20,
        durationSec: duration,
        timed: timerOn,
        details: CRITERIA.map((c, i) => ({ n: i + 1, correct: ev.scores[c.key] >= 3, skill: c.label })),
      });
      clientPrefs.set(draftKey(exercise, taskIdx), "");
      setSubmittedText(sent);
      setEvaluation(ev);
      setStatus("review");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setStatus("doing");
      setError(e instanceof ApiError || e instanceof Error ? e.message : "No se pudo evaluar el texto.");
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

        <div className="mt-4 rounded-2xl border border-line bg-surface p-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cómo te evaluamos</p>
          <p className="mt-1.5 text-muted">Con los 4 criterios oficiales, de 0 a 5 cada uno: {CRITERIA.map((c) => c.label).join(", ")}. Verás tus errores marcados y una versión mejorada.</p>
        </div>

        <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={timerOn} onChange={(e) => clientPrefs.set("timer", e.target.checked)} className="h-5 w-5 accent-[var(--brand)]" />
          Temporizador ({part.suggestedMinutes} min)
        </label>

        {error && <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={fromBank} disabled={status === "loading"} className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-60">
            {status === "loading" ? "Cargando…" : "Empezar (del banco)"}
            {bankInfo && status !== "loading" && <span className="ml-2 font-normal opacity-80">{bankInfo.unseen} sin hacer</span>}
          </button>
          <button type="button" onClick={fromAi} disabled={status === "loading" || aiDisabled} className="min-h-12 rounded-xl border border-brand px-5 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50">
            Generar enunciado con IA
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          {ai === null ? (
            "Comprobando IA…"
          ) : !ai.configured ? (
            <>La IA no está configurada (falta <code>ANTHROPIC_API_KEY</code>): podrás escribir con los enunciados del banco, pero no obtener la corrección.</>
          ) : (
            <>Usos de IA restantes hoy: <strong>{ai.remainingToday}</strong> (cada corrección y cada enunciado nuevo cuenta como 1)</>
          )}
        </p>
        {ai?.configured && (
          <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={80} placeholder="Tema opcional para el enunciado (p. ej. tourism, science…)" aria-label="Tema opcional" className="mt-3 h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm" />
        )}
      </div>
    );
  }

  if (!exercise) return null;
  const task = describeTask(exercise, taskIdx);
  const inRange = words >= range.min && words <= range.max;
  const counterTone = inRange ? "bg-ok-soft text-ok" : words === 0 ? "bg-line text-muted" : "bg-warn-soft";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-14 z-20 -mx-4 md:top-0 mb-5 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{part.name}</p>
          <p className="truncate text-xs text-muted">{exercise.data.title}</p>
        </div>
        {status !== "review" && (
          <div className="flex items-center gap-3 text-sm tabular-nums">
            {timerOn ? (
              <span className={`rounded-lg px-2 py-1 font-bold ${remaining <= 300 ? "bg-bad-soft text-bad" : "bg-brand-soft text-brand"}`} aria-label="Tiempo restante">{fmt(remaining)}</span>
            ) : (
              <span className="text-muted" aria-label="Tiempo transcurrido">{fmt(elapsed)}</span>
            )}
            <span className={`rounded-lg px-2 py-1 font-bold ${counterTone}`} aria-label="Palabras">{words}</span>
          </div>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-warn-soft px-2.5 py-1 font-semibold">Enunciado de práctica generado</span>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 font-semibold text-brand">{SOURCE_LABEL[exercise.source]}</span>
      </div>
      {notice && <p className="mb-4 rounded-xl bg-warn-soft p-3 text-sm">{notice}</p>}

      {/* Enunciado */}
      {partId === "w2" && exercise.partId === "w2" && status === "doing" && (
        <div role="tablist" aria-label="Elige una tarea" className="mb-3 flex gap-2 overflow-x-auto">
          {exercise.data.tasks.map((t, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === taskIdx}
              onClick={() => begin(exercise, i)}
              className={`min-h-11 shrink-0 rounded-xl border px-4 text-sm font-semibold ${i === taskIdx ? "border-brand bg-brand-soft text-brand" : "border-line"}`}
            >
              {i + 2}. {TYPE_LABEL[t.type]}
            </button>
          ))}
        </div>
      )}

      <section className="rounded-2xl border border-line bg-surface p-4 md:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{TYPE_LABEL[task.type]}</p>
        <div className="mt-2 whitespace-pre-line font-serif text-[1.02rem] leading-relaxed">{task.text}</div>
        <p className="mt-3 text-xs text-muted">Write your answer in {range.min}–{range.max} words.</p>
      </section>

      {status === "review" && evaluation ? (
        <div className="mt-6">
          <WritingFeedback evaluation={evaluation} text={submittedText} wordCount={countTextWords(submittedText)} />
        </div>
      ) : (
        <>
          <label htmlFor="answer" className="sr-only">Tu respuesta</label>
          <textarea
            id="answer"
            value={text}
            onChange={(e) => onText(e.target.value)}
            disabled={status === "evaluating"}
            rows={14}
            placeholder="Escribe aquí tu texto en inglés…"
            spellCheck
            autoCapitalize="sentences"
            className="mt-4 w-full resize-y rounded-2xl border border-line bg-surface p-4 font-serif text-[1.05rem] leading-relaxed focus:border-brand disabled:opacity-60"
          />
          <p className="mt-2 text-xs text-muted">
            {words} palabras · objetivo {range.min}–{range.max}. Tu borrador se guarda solo en este dispositivo.
          </p>

          {error && <p role="alert" className="mt-4 rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}

          <button
            type="button"
            onClick={evaluate}
            disabled={status === "evaluating" || words < 40 || aiDisabled}
            className="mt-4 min-h-12 w-full rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "evaluating" ? "Evaluando… (puede tardar hasta 1 minuto)" : "Evaluar con IA"}
          </button>
          {aiDisabled && status !== "evaluating" && (
            <p className="mt-2 text-xs text-muted">
              {ai?.configured ? "Has agotado los usos de IA de hoy." : "La evaluación requiere configurar ANTHROPIC_API_KEY en el servidor."}
            </p>
          )}
          {!aiDisabled && words < 40 && <p className="mt-2 text-xs text-muted">Escribe al menos 40 palabras para poder evaluarlo.</p>}
        </>
      )}

      {status === "review" && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={fromBank} className="min-h-12 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink">Siguiente enunciado</button>
          <button type="button" onClick={fromAi} disabled={aiDisabled} className="min-h-12 rounded-xl border border-brand px-5 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50">Generar nuevo con IA</button>
          <button type="button" onClick={() => begin(exercise, taskIdx)} className="min-h-12 rounded-xl border border-line px-5 text-sm font-semibold">Reescribir este enunciado</button>
          <Link href="/practica" className="flex min-h-12 items-center justify-center rounded-xl border border-line px-5 text-sm font-semibold">Cambiar de parte</Link>
        </div>
      )}
    </div>
  );
}
