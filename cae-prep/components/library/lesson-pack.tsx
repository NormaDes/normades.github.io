"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import type { LessonPack as Pack } from "@/lib/lesson-pack";
import type { Exercise, ExerciseOrigin } from "@/lib/schemas";
import { putSessionExercise } from "@/lib/session-exercises";
import { repo } from "@/lib/storage";
import { makeVocab, mergeVocab } from "@/lib/vocab";

const LETTERS = ["A", "B", "C", "D"];

function Choice({ options, correct, onPick, picked }: { options: string[]; correct: number; onPick: (i: number) => void; picked: number | null }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o, i) => {
        let cls = "border-line hover:border-brand";
        if (picked !== null) cls = i === correct ? "border-ok bg-ok-soft" : i === picked ? "border-bad bg-bad-soft" : "border-line opacity-60";
        return (
          <button key={i} type="button" disabled={picked !== null} onClick={() => onPick(i)} className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-left text-[15px] ${cls}`}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg text-xs font-bold">{LETTERS[i]}</span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Paquete de clase: resumen, comprensión, vocabulario, colocaciones y essay sobre un texto real */
export function LessonPack({ pack, origin, sourceKey }: { pack: Pack; origin: ExerciseOrigin; sourceKey: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const saveWords = async (terms: string[]) => {
    const now = new Date();
    const existing = await repo.listVocab();
    for (const term of terms) {
      const v = pack.vocabulary.find((x) => x.term === term)!;
      const incoming = { term: v.term, definition: v.definition, example: v.example, translation: v.translation, collocations: v.collocations, sourceTitle: origin.title, sourceUrl: origin.url };
      const prev = existing.find((e) => e.term.trim().toLowerCase() === v.term.trim().toLowerCase());
      await repo.saveVocab(prev ? mergeVocab(prev, incoming) : makeVocab(incoming, now));
    }
    setSaved((s) => new Set([...s, ...terms]));
  };

  const practiceEssay = async () => {
    setBusy(true);
    const ex = {
      id: `src-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now()}`,
      partId: "w1",
      data: { title: `Essay: ${origin.title}`.slice(0, 120), topic: origin.title.slice(0, 60), question: pack.essay.question, points: pack.essay.points },
      source: "ai",
      createdAt: new Date().toISOString(),
      isGeneratedText: false,
      origin,
    } as Exercise;
    if (origin.ephemeral) putSessionExercise(ex);
    else await repo.saveExercise(ex);
    router.push(`/practica/w1?ex=${encodeURIComponent(ex.id)}`);
  };

  const pick = (key: string, i: number) => setAnswers((a) => ({ ...a, [key]: i }));
  const score = pack.comprehension.filter((q, i) => answers[`c${i}`] === q.correct).length;
  const answered = pack.comprehension.filter((_, i) => answers[`c${i}`] !== undefined).length;

  return (
    <div className="space-y-6" data-pack={sourceKey}>
      <section className="sticky-note rounded-sm px-5 pb-5 pt-6">
        <p className="hand text-2xl leading-none">Summary</p>
        <p className="mt-2 font-serif text-[1.02rem] leading-relaxed">{pack.summary}</p>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4 md:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl font-bold">Comprensión</h3>
          {answered > 0 && <span className="text-sm font-semibold tabular-nums">{score}/{pack.comprehension.length}</span>}
        </div>
        <div className="mt-4 space-y-6">
          {pack.comprehension.map((q, i) => (
            <div key={i}>
              <p className="mb-2 font-serif text-[1.02rem] font-semibold">{i + 1}. {q.stem}</p>
              <Choice options={q.options} correct={q.correct} picked={answers[`c${i}`] ?? null} onPick={(n) => pick(`c${i}`, n)} />
              {answers[`c${i}`] !== undefined && (
                <p className="mt-2 text-sm text-muted">
                  {q.explanation} <span className="font-serif italic">«{q.evidence}»</span>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4 md:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl font-bold">Vocabulario C1</h3>
          <button type="button" onClick={() => saveWords(pack.vocabulary.map((v) => v.term).filter((t) => !saved.has(t)))} disabled={saved.size === pack.vocabulary.length} className="min-h-9 rounded-lg border border-brand px-3 text-xs font-semibold text-brand disabled:opacity-50">
            {saved.size === pack.vocabulary.length ? "Todo guardado ✓" : "Guardar las 8 en mi vocabulario"}
          </button>
        </div>
        <ul className="mt-3 divide-y divide-line">
          {pack.vocabulary.map((v) => (
            <li key={v.term} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p>
                  <span className="font-serif text-lg font-bold">{v.term}</span> <span className="text-xs text-muted">{v.pos}</span>
                </p>
                <p className="text-sm">{v.definition}</p>
                <p className="font-serif text-sm italic text-muted">{v.example}</p>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  {v.collocations.map((c) => (
                    <span key={c} className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">{c}</span>
                  ))}
                  <span className="text-xs text-muted"><span className="hand text-base text-accent">ES </span>{v.translation}</span>
                </p>
              </div>
              <button type="button" onClick={() => saveWords([v.term])} disabled={saved.has(v.term)} aria-label={`Guardar ${v.term}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line hover:border-brand disabled:border-ok disabled:text-ok">
                <CheckIcon width={18} height={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4 md:p-5">
        <h3 className="font-serif text-xl font-bold">Colocaciones</h3>
        <div className="mt-4 space-y-6">
          {pack.collocations.map((c, i) => (
            <div key={i}>
              <p className="mb-2 font-serif text-[1.02rem]">{i + 1}. {c.sentence}</p>
              <Choice options={c.options} correct={c.correct} picked={answers[`k${i}`] ?? null} onPick={(n) => pick(`k${i}`, n)} />
              {answers[`k${i}`] !== undefined && <p className="mt-2 text-sm text-muted">{c.explanation}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="chalkboard rounded-xl px-6 py-7">
        <p className="hand text-3xl leading-none">Homework</p>
        <p className="mt-3 font-serif text-[1.05rem] leading-relaxed text-white/90">{pack.essay.question}</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-[15px] text-white/90">
          {pack.essay.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
        <button type="button" onClick={practiceEssay} disabled={busy} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink disabled:opacity-60">
          Escribir este essay <ArrowIcon width={18} height={18} />
        </button>
      </section>
    </div>
  );
}
