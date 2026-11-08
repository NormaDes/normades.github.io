"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroCard, ScoreBadge } from "@/components/brand-ui";
import { ArrowIcon, ClockIcon } from "@/components/icons";
import { ExerciseView } from "@/components/practice/exercise-view";
import { ListeningView } from "@/components/practice/listening-view";
import { WritingFeedback } from "@/components/practice/writing-feedback";
import { PAPERS, getPart, type PaperId, type PartId } from "@/config/exam";
import { checkExercise, type ExerciseResult, type UserAnswers } from "@/lib/checking";
import { ApiError, fetchAiStatus, requestEvaluation, type AiStatus } from "@/lib/client/api";
import { pickFromBank } from "@/lib/exercises/bank";
import { mockMinutes, mockParts, summarizeMock, type MockPartResult, type MockRecord } from "@/lib/mock";
import { partShort } from "@/lib/progress";
import { recordAutoGraded } from "@/lib/record";
import { isListeningExercise, isWritingExercise, type Exercise, type ListeningExercise, type ReadingExercise, type WritingExercise } from "@/lib/schemas";
import { clientPrefs, repo } from "@/lib/storage";
import { CRITERIA, countTextWords, totalScore, type WritingEvaluation } from "@/lib/writing";
import { TYPE_LABEL, describeTask } from "@/lib/writing-task";

type Phase = "intro" | "loading" | "running" | "grading" | "results";

const clock = () => Date.now();
const fmt = (s: number) => {
  const a = Math.max(0, s);
  const h = Math.floor(a / 3600);
  return `${h ? `${h}:` : ""}${String(Math.floor((a % 3600) / 60)).padStart(h ? 2 : 1, "0")}:${String(a % 60).padStart(2, "0")}`;
};
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

interface PartOutcome {
  result: MockPartResult;
  auto?: ExerciseResult;
  evaluation?: WritingEvaluation;
  note?: string;
}

export function MockRunner({ paper }: { paper: PaperId }) {
  const info = PAPERS.find((p) => p.id === paper)!;
  const parts = mockParts(paper);
  const totalSeconds = mockMinutes(paper) * 60;
  const maxMarks = parts.reduce((a, id) => a + getPart(id).questionCount * getPart(id).marksPerQuestion, 0);

  const [phase, setPhase] = useState<Phase>("intro");
  const [exercises, setExercises] = useState<Record<string, Exercise>>({});
  const [answers, setAnswers] = useState<Record<string, UserAnswers>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [taskIdx, setTaskIdx] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [outcomes, setOutcomes] = useState<Record<string, PartOutcome>>({});
  const [reviewing, setReviewing] = useState(false);
  const [ai, setAi] = useState<AiStatus | null>(null);
  const startedAt = useRef(0);
  const submitRef = useRef<(auto: boolean) => Promise<void>>(async () => undefined);
  const submitted = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchAiStatus().then((s) => !cancelled && setAi(s));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      const sec = Math.round((clock() - startedAt.current) / 1000);
      setElapsed(sec);
      if (sec >= totalSeconds) void submitRef.current(true);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, totalSeconds]);

  const start = async () => {
    setError(null);
    setPhase("loading");
    const picked = await Promise.all(parts.map((id) => pickFromBank(repo, id)));
    if (picked.some((p) => !p)) {
      setPhase("intro");
      return setError("Faltan ejercicios en el banco para montar este simulacro.");
    }
    setExercises(Object.fromEntries(parts.map((id, i) => [id, picked[i]!.exercise])));
    setAnswers({});
    setTexts({});
    setTaskIdx({});
    setCurrent(0);
    setElapsed(0);
    submitted.current = false;
    startedAt.current = clock();
    setPhase("running");
    window.scrollTo({ top: 0 });
  };

  const answered = (id: PartId): number => {
    const ex = exercises[id];
    if (!ex) return 0;
    if (isWritingExercise(ex)) return countTextWords(texts[id] ?? "") >= 40 ? 1 : 0;
    return Object.values(answers[id] ?? {}).filter((v) => v !== undefined && String(v).trim() !== "").length;
  };
  const total = (id: PartId) => (paper === "writing" ? 1 : getPart(id).questionCount);

  const submit = useCallback(
    async (auto = false) => {
      if (submitted.current) return;
      if (!auto) {
        const blank = parts.reduce((a, id) => a + (total(id) - answered(id)), 0);
        if (blank > 0 && !window.confirm(`Te faltan ${blank} respuestas por contestar. ¿Entregar de todas formas?`)) return;
      }
      submitted.current = true;
      setPhase("grading");
      const duration = Math.round((clock() - startedAt.current) / 1000);
      const out: Record<string, PartOutcome> = {};
      const aiOk = Boolean(ai?.configured);

      for (const id of parts) {
        const ex = exercises[id];
        setProgress(`Corrigiendo ${partShort(id)}…`);
        if (isWritingExercise(ex)) {
          const text = (texts[id] ?? "").trim();
          const idx = taskIdx[id] ?? 0;
          const t = describeTask(ex as WritingExercise, idx);
          const max = getPart(id).marksPerQuestion;
          if (countTextWords(text) < 40) {
            out[id] = { result: { partId: id, marks: 0, maxMarks: max, assessed: true }, note: "No has escrito el mínimo (40 palabras): 0 puntos." };
            continue;
          }
          if (!aiOk) {
            out[id] = { result: { partId: id, marks: 0, maxMarks: max, assessed: false }, note: ai?.comingSoon ? "La corrección de Writing con IA llegará pronto (próximamente)." : ai?.needsLogin ? "La corrección de Writing necesita una cuenta: inicia sesión (gratis) para obtener la nota." : "La corrección de Writing necesita la IA, que no está configurada en este servidor." };
            continue;
          }
          try {
            const { evaluation, remainingToday } = await requestEvaluation({ taskType: t.type, task: t.text, text });
            setAi((p) => (p ? { ...p, remainingToday } : p));
            const marks = totalScore(evaluation);
            const now = new Date().toISOString();
            await repo.saveWriting({ id: uid(), exerciseId: ex.id, partId: id as "w1" | "w2", taskType: t.type, taskTitle: ex.data.title, text, wordCount: countTextWords(text), createdAt: now, durationSec: duration, evaluation });
            await repo.saveAttempt({ id: uid(), exerciseId: ex.id, partId: id, createdAt: now, correctCount: Math.round(marks), total: 20, marks, maxMarks: 20, durationSec: duration, timed: true, details: CRITERIA.map((c, i) => ({ n: i + 1, correct: evaluation.scores[c.key] >= 3, skill: c.label })) });
            out[id] = { result: { partId: id, marks, maxMarks: max, assessed: true }, evaluation };
          } catch (e) {
            out[id] = { result: { partId: id, marks: 0, maxMarks: max, assessed: false }, note: e instanceof ApiError || e instanceof Error ? e.message : "No se pudo evaluar." };
          }
        } else {
          const res = checkExercise(ex as ReadingExercise | ListeningExercise, answers[id] ?? {});
          await recordAutoGraded(repo, { exerciseId: ex.id, partId: id, result: res, durationSec: duration, timed: true });
          out[id] = { result: { partId: id, marks: res.marks, maxMarks: res.maxMarks, assessed: true }, auto: res };
        }
      }

      const summary = summarizeMock(parts.map((id) => out[id].result));
      const record: MockRecord = { id: uid(), paper, at: new Date().toISOString(), scale: summary.scale, level: summary.level, pct: summary.pct, assessedAll: summary.assessedAll };
      clientPrefs.set("mocks", [record, ...clientPrefs.get<MockRecord[]>("mocks", [])].slice(0, 20));
      setOutcomes(out);
      setPhase("results");
      window.scrollTo({ top: 0 });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercises, answers, texts, taskIdx, ai, paper],
  );

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);
  const remaining = totalSeconds - elapsed;

  /* ───────── Intro ───────── */
  if (phase === "intro" || phase === "loading") {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/simulacro" className="text-sm text-muted hover:text-ink">← Simulacros</Link>
        <p className="eyebrow mt-4 text-accent-dark">Simulacro</p>
        <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{info.name}</h1>

        <HeroCard className="mt-5 px-6 pb-10 pt-6">
          <p className="hand text-3xl leading-none">Reglas del examen</p>
          <ul className="mt-4 space-y-2 text-[15px] text-white/90">
            <li>⏱ <strong>{info.durationMinutes} minutos</strong> en total, con una sola cuenta atrás. Al llegar a 0, se entrega solo.</li>
            <li>📄 {parts.length} partes, {maxMarks} marcas en total. Puedes moverte entre partes como en el examen real.</li>
            {paper === "listening" && <li>🎧 Cada audio se reproduce solo <strong>2 veces</strong>.</li>}
            {paper === "writing" && <li>✍️ Escribe un essay y una segunda tarea a elegir (220–260 palabras). La corrección la hace la IA al entregar.</li>}
            <li>🔒 No ves ninguna corrección hasta entregar.</li>
          </ul>
        </HeroCard>

        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {parts.map((id) => {
            const p = getPart(id);
            return (
              <li key={id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-8 text-center font-display text-xl font-bold text-brand/80">{p.number}</span>
                <span className="min-w-0 flex-1 font-semibold">{p.name}</span>
                <span className="text-xs text-muted">{p.questionCount * p.marksPerQuestion} marcas</span>
              </li>
            );
          })}
        </ul>

        {paper === "writing" && ai && !ai.configured && <p className="mt-4 rounded-lg bg-warn-soft p-3 text-sm">{ai.comingSoon ? "La corrección de Writing con IA llegará pronto (próximamente). Podrás escribir igualmente." : ai.needsLogin ? "Sin cuenta podrás escribir, pero la nota de Writing no se calculará. Inicia sesión (gratis) para obtenerla." : "La IA no está configurada: podrás escribir, pero la nota de Writing no se calculará."}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-bad-soft p-3 text-sm text-bad">{error}</p>}
        <button type="button" onClick={start} disabled={phase === "loading"} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 text-base font-semibold text-brand-ink disabled:opacity-60">
          {phase === "loading" ? "Preparando el examen…" : "Empezar el simulacro"} <ArrowIcon width={18} height={18} />
        </button>
        <p className="mt-3 text-center text-xs text-muted">Sugerencia: busca un sitio tranquilo y apaga el móvil. {info.durationMinutes} minutos seguidos.</p>
      </div>
    );
  }

  /* ───────── Corrigiendo ───────── */
  if (phase === "grading") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center" role="status" aria-live="polite">
        <p className="hand text-4xl text-accent-dark">Pens down!</p>
        <p className="mt-3 font-display text-xl font-bold">Corrigiendo tu simulacro…</p>
        <p className="mt-1 text-sm text-muted">{progress}</p>
        <p className="mt-6 text-xs text-muted">La corrección de Writing puede tardar hasta un minuto por redacción.</p>
      </div>
    );
  }

  /* ───────── Resultados ───────── */
  if (phase === "results") {
    const summary = summarizeMock(parts.map((id) => outcomes[id].result));
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/simulacro" className="text-sm text-muted hover:text-ink">← Simulacros</Link>
        <HeroCard className="mt-4 px-6 pb-12 pt-7">
          <p className="eyebrow text-white/60">Resultado · {info.name}</p>
          <div className="mt-3 flex flex-wrap items-center gap-6">
            <ScoreBadge value={summary.scale} caption={summary.level} />
            <div className="min-w-0 flex-1">
              <p className="hand text-3xl leading-none">{summary.pct >= 0.6 ? "Well done!" : "Keep going!"}</p>
              <p className="mt-2 text-[15px] text-white/85">
                {summary.raw}/{summary.max} marcas ({Math.round(summary.pct * 100)} %). Puntuación estimada en la escala Cambridge: <strong>{summary.scale}</strong> (≈ {summary.level}).
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/60">Estimación orientativa: ~60 % de las marcas equivale a 180 (aprobado C1). No es la conversión oficial de Cambridge.{!summary.assessedAll && " Alguna parte no se pudo evaluar y no cuenta en la nota."}</p>
        </HeroCard>

        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {parts.map((id) => {
            const o = outcomes[id];
            const pct = o.result.maxMarks ? o.result.marks / o.result.maxMarks : 0;
            return (
              <li key={id} className="px-4 py-3">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{partShort(id)} <span className="font-normal text-muted">· {getPart(id).name}</span></span>
                  <span className="font-semibold tabular-nums">{o.result.assessed ? `${o.result.marks}/${o.result.maxMarks}` : "sin evaluar"}</span>
                </div>
                {o.result.assessed && (
                  <div className="mt-1.5 h-2.5 rounded-sm bg-line/70" role="img" aria-label={`${partShort(id)}: ${Math.round(pct * 100)} %`}>
                    <div className="h-full rounded-r-[4px] bg-brand" style={{ width: `${Math.max(2, pct * 100)}%` }} />
                  </div>
                )}
                {o.note && <p className="mt-1 text-xs text-muted">{o.note}</p>}
              </li>
            );
          })}
        </ul>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setReviewing((v) => !v)} className="min-h-12 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink">{reviewing ? "Ocultar la revisión" : "Revisar mis respuestas"}</button>
          <button type="button" onClick={() => { setPhase("intro"); setReviewing(false); }} className="min-h-12 rounded-lg border border-line px-5 text-sm font-semibold">Hacer otro simulacro</button>
        </div>
        <p className="mt-3 text-xs text-muted">Tus fallos están en el cuaderno de errores, y todo cuenta en tu panel de progreso.</p>

        {reviewing && (
          <div className="mt-8 space-y-12">
            {parts.map((id) => {
              const ex = exercises[id];
              const o = outcomes[id];
              return (
                <section key={id}>
                  <h2 className="mb-3 border-b-2 border-ink pb-2 font-display text-xl font-bold">{partShort(id)} · {getPart(id).name}</h2>
                  {isWritingExercise(ex) ? (
                    o.evaluation ? <WritingFeedback evaluation={o.evaluation} text={texts[id] ?? ""} wordCount={countTextWords(texts[id] ?? "")} /> : <p className="text-sm text-muted">{o.note ?? "Sin corrección."}</p>
                  ) : isListeningExercise(ex) ? (
                    <ListeningView exercise={ex} answers={answers[id] ?? {}} onChange={() => undefined} result={o.auto} />
                  ) : (
                    <ExerciseView exercise={ex as ReadingExercise} answers={answers[id] ?? {}} onChange={() => undefined} result={o.auto} />
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ───────── En curso ───────── */
  const idCurrent = parts[current];
  const low = remaining <= 300;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="sticky top-16 z-20 -mx-4 mb-4 border-b border-line bg-bg/95 px-4 py-2.5 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold">{info.name} · simulacro</p>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${low ? "bg-bad-soft text-bad" : "bg-brand-soft text-brand"}`} aria-label="Tiempo restante">
              <ClockIcon width={15} height={15} /> {fmt(remaining)}
            </span>
            <button type="button" onClick={() => submit(false)} className="min-h-9 rounded-lg bg-ink px-3 text-xs font-bold text-white">Entregar</button>
          </div>
        </div>
        <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-0.5" role="tablist" aria-label="Partes del examen">
          {parts.map((id, i) => {
            const a = answered(id);
            const t = total(id);
            const done = a >= t;
            return (
              <button key={id} type="button" role="tab" aria-selected={i === current} onClick={() => { setCurrent(i); window.scrollTo({ top: 0 }); }} className={`relative min-h-9 shrink-0 rounded-lg border px-3 text-xs font-semibold ${i === current ? "border-brand bg-brand text-brand-ink" : done ? "border-ok/50 bg-ok-soft text-ok" : "border-line bg-surface"}`}>
                {getPart(id).number}
                <span className="ml-1 font-normal opacity-80">{a}/{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-3 font-display text-lg font-bold">{partShort(idCurrent)} · {getPart(idCurrent).name}</p>
      <p className="mb-4 rounded-lg border border-line bg-surface p-3 font-serif text-sm italic">{getPart(idCurrent).instructions}</p>

      {parts.map((id, i) => {
        const ex = exercises[id];
        const hidden = i !== current ? "hidden" : "";
        if (isWritingExercise(ex)) {
          const idx = taskIdx[id] ?? 0;
          const task = describeTask(ex, idx);
          const range = getPart(id).wordRange ?? { min: 220, max: 260 };
          const text = texts[id] ?? "";
          const w = countTextWords(text);
          return (
            <div key={id} className={hidden}>
              {ex.partId === "w2" && (
                <div role="tablist" aria-label="Elige una tarea" className="mb-3 flex gap-2 overflow-x-auto">
                  {ex.data.tasks.map((t, n) => (
                    <button key={n} type="button" role="tab" aria-selected={n === idx} onClick={() => setTaskIdx((s) => ({ ...s, [id]: n }))} className={`min-h-11 shrink-0 rounded-lg border px-4 text-sm font-semibold ${n === idx ? "border-brand bg-brand-soft text-brand" : "border-line"}`}>
                      {n + 2}. {TYPE_LABEL[t.type]}
                    </button>
                  ))}
                </div>
              )}
              <section className="rounded-xl border border-line bg-surface p-4">
                <p className="eyebrow text-muted">{TYPE_LABEL[task.type]}</p>
                <div className="mt-2 whitespace-pre-line font-serif text-[1.02rem] leading-relaxed">{task.text}</div>
              </section>
              <textarea value={text} onChange={(e) => setTexts((s) => ({ ...s, [id]: e.target.value }))} rows={14} aria-label={`Tu respuesta, parte ${getPart(id).number}`} placeholder="Escribe aquí tu texto…" className="ruled mt-4 w-full resize-y rounded-xl border border-line text-[1.05rem] focus:border-brand" />
              <p className={`mt-1 text-xs ${w >= range.min && w <= range.max ? "text-ok" : "text-muted"}`}>{w} palabras · objetivo {range.min}–{range.max}</p>
            </div>
          );
        }
        const set = (n: number, v: string) => setAnswers((s) => ({ ...s, [id]: { ...(s[id] ?? {}), [n]: v } }));
        return (
          <div key={id} className={hidden}>
            {isListeningExercise(ex) ? <ListeningView exercise={ex} answers={answers[id] ?? {}} onChange={set} /> : <ExerciseView exercise={ex as ReadingExercise} answers={answers[id] ?? {}} onChange={set} />}
          </div>
        );
      })}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button type="button" disabled={current === 0} onClick={() => { setCurrent((c) => c - 1); window.scrollTo({ top: 0 }); }} className="min-h-12 rounded-lg border border-line px-5 text-sm font-semibold disabled:opacity-40">← Anterior</button>
        {current < parts.length - 1 ? (
          <button type="button" onClick={() => { setCurrent((c) => c + 1); window.scrollTo({ top: 0 }); }} className="min-h-12 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink">Siguiente →</button>
        ) : (
          <button type="button" onClick={() => submit(false)} className="min-h-12 rounded-lg bg-ink px-6 text-sm font-bold text-white">Entregar el examen</button>
        )}
      </div>
    </div>
  );
}
