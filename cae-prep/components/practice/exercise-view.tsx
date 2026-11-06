"use client";

import type { ReactNode } from "react";
import { ChoiceQuestion } from "@/components/practice/choice-question";
import { Feedback, GapText } from "@/components/practice/gap-text";
import type { ExerciseResult, UserAnswers } from "@/lib/checking";
import { letterOf, type ReadingExercise } from "@/lib/schemas";

interface Props {
  exercise: ReadingExercise;
  answers: UserAnswers;
  onChange: (n: number, value: string) => void;
  /** Si hay resultado, la vista pasa a modo revisión (solo lectura con corrección) */
  result?: ExerciseResult;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Texto largo (R5) con párrafos */
function LongText({ text }: { text: string }) {
  return (
    <article className="exam-text exam-text-long rounded-2xl border border-line bg-surface p-4 md:p-6">
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </article>
  );
}

/** Tarjetas con textos/secciones etiquetados A, B, C… (R6, R8) y párrafos candidatos (R7) */
function LabelledCards({ items }: { items: Array<{ label: string; title?: string; text: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((t) => (
        <section key={t.label} className="rounded-2xl border border-line bg-surface p-4 md:p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink">{t.label}</span>
            {t.title && <h3 className="text-sm font-semibold">{t.title}</h3>}
          </div>
          <p className="exam-text-long font-serif text-[1.02rem]">{t.text}</p>
        </section>
      ))}
    </div>
  );
}

export function ExerciseView({ exercise, answers, onChange, result }: Props) {
  const review = Boolean(result);
  const resultOf = (n: number) => result?.results.find((r) => r.n === n);

  switch (exercise.partId) {
    // ───────────── Part 1: multiple-choice cloze ─────────────
    case "r1": {
      const { text, questions } = exercise.data;
      return (
        <div className="space-y-6">
          <GapText
            text={text}
            gap={(n) => {
              const q = questions.find((x) => x.n === n)!;
              const chosen = answers[n] !== undefined && answers[n] !== "" ? q.options[Number(answers[n])] : null;
              const r = resultOf(n);
              const tone = r ? (r.correct ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad") : chosen ? "bg-brand-soft text-brand" : "bg-line text-muted";
              return (
                <span className={`mx-0.5 inline-flex items-center gap-1 rounded-md px-1.5 align-baseline font-sans text-sm font-semibold ${tone}`}>
                  <span className="text-xs opacity-70">{n}</span>
                  {chosen ?? "······"}
                </span>
              );
            }}
          />
          <div className="space-y-4">
            {questions.map((q) => {
              const r = resultOf(q.n);
              return (
                <ChoiceQuestion
                  key={q.n}
                  n={q.n}
                  options={q.options}
                  selected={answers[q.n]}
                  onSelect={(v) => onChange(q.n, v)}
                  correct={r ? q.correct : undefined}
                >
                  {r && <OptionFeedback q={q} r={r} />}
                </ChoiceQuestion>
              );
            })}
          </div>
        </div>
      );
    }

    // ───────────── Part 2 / Part 3: open cloze & word formation ─────────────
    case "r2":
    case "r3": {
      const { text } = exercise.data;
      const gaps = exercise.data.gaps as Array<{ n: number; base?: string; explanation: string; evidence: string; skill: string }>;
      const isWf = exercise.partId === "r3";
      return (
        <div className="space-y-6">
          <GapText
            text={text}
            gap={(n) => {
              const g = gaps.find((x) => x.n === n)!;
              const r = resultOf(n);
              const base = g.base ?? null;
              return (
                <span className="mx-0.5 inline-flex flex-wrap items-baseline gap-1 whitespace-nowrap">
                  <span className="font-sans text-xs font-bold text-muted">{n}</span>
                  {r ? (
                    <span className={`rounded-md px-2 font-sans text-sm font-semibold ${r.correct ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad line-through"}`}>
                      {answers[n] || "···"}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={answers[n] ?? ""}
                      onChange={(e) => onChange(n, e.target.value)}
                      aria-label={`Hueco ${n}`}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="h-9 w-28 rounded-md border border-line bg-bg px-2 text-center font-sans text-[15px] focus:border-brand"
                    />
                  )}
                  {isWf && base && <span className="font-sans text-xs font-bold tracking-wide text-muted">({base})</span>}
                </span>
              );
            }}
          />
          {review && (
            <div className="space-y-3">
              {gaps.map((g) => {
                const r = resultOf(g.n)!;
                return <Feedback key={g.n} n={g.n} ok={r.correct} given={r.given} expected={r.expected} explanation={g.explanation} evidence={g.evidence} skill={g.skill} />;
              })}
            </div>
          )}
        </div>
      );
    }

    // ───────────── Part 4: key word transformations ─────────────
    case "r4": {
      return (
        <div className="space-y-4">
          {exercise.data.items.map((it) => {
            const r = resultOf(it.n);
            return (
              <div key={it.n} className="rounded-2xl border border-line bg-surface p-4 md:p-5">
                <p className="text-xs font-bold text-muted">{it.n}</p>
                <p className="mt-1 font-serif text-[1.05rem] leading-relaxed">{it.first}</p>
                <p className="mt-3 inline-block rounded-lg border border-brand bg-brand-soft px-3 py-1 text-sm font-bold tracking-widest text-brand">{it.keyword}</p>
                <p className="mt-3 font-serif text-[1.05rem] leading-[2.2]">
                  {it.before}{" "}
                  {r ? (
                    <span className={`rounded-md px-2 font-sans text-sm font-semibold ${r.correct ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad line-through"}`}>
                      {answers[it.n] || "···"}
                    </span>
                  ) : (
                    <input
                      type="text"
                      value={answers[it.n] ?? ""}
                      onChange={(e) => onChange(it.n, e.target.value)}
                      aria-label={`Respuesta ${it.n}`}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="h-10 w-full max-w-xs rounded-md border border-line bg-bg px-3 font-sans text-[15px] focus:border-brand sm:w-72"
                    />
                  )}{" "}
                  {it.after}
                </p>
                {r && (
                  <div className="mt-4">
                    <Feedback n={it.n} ok={r.correct} given={r.given} expected={r.expected} explanation={it.explanation} skill={it.skill} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    // ───────────── Part 5: multiple choice (long text) ─────────────
    case "r5": {
      const { text, questions } = exercise.data;
      return (
        <div className="space-y-6">
          <LongText text={text} />
          <div className="space-y-4">
            {questions.map((q) => {
              const r = resultOf(q.n);
              return (
                <ChoiceQuestion
                  key={q.n}
                  n={q.n}
                  stem={q.stem}
                  options={q.options}
                  selected={answers[q.n]}
                  onSelect={(v) => onChange(q.n, v)}
                  correct={r ? q.correct : undefined}
                >
                  {r && <OptionFeedback q={q} r={r} />}
                </ChoiceQuestion>
              );
            })}
          </div>
        </div>
      );
    }

    // ───────────── Part 6: cross-text multiple matching ─────────────
    case "r6": {
      const { intro, texts, questions } = exercise.data;
      return (
        <div className="space-y-6">
          <p className="font-serif text-[1.02rem] italic">{intro}</p>
          <LabelledCards items={texts.map((t) => ({ label: t.label, title: t.author, text: t.text }))} />
          <div className="space-y-4">
            {questions.map((q) => {
              const r = resultOf(q.n);
              return (
                <ChoiceQuestion
                  key={q.n}
                  n={q.n}
                  stem={q.stem}
                  compact
                  options={texts.map((t) => t.label)}
                  selected={answers[q.n]}
                  onSelect={(v) => onChange(q.n, v)}
                  correct={r ? q.correct : undefined}
                >
                  {r && <Feedback n={q.n} ok={r.correct} given={r.given} expected={r.expected} explanation={q.explanation} evidence={q.evidence} skill={q.skill} />}
                </ChoiceQuestion>
              );
            })}
          </div>
        </div>
      );
    }

    // ───────────── Part 7: gapped text ─────────────
    case "r7": {
      const { text, paragraphs, gaps } = exercise.data;
      const used = new Set(Object.values(answers).filter((v) => v !== ""));
      return (
        <div className="space-y-6">
          <GapText
            text={text}
            gap={(n) => {
              const r = resultOf(n);
              const v = answers[n];
              const chosen = v !== undefined && v !== "" ? letterOf(Number(v)) : null;
              const tone = r ? (r.correct ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad") : chosen ? "bg-brand-soft text-brand" : "bg-line text-muted";
              return (
                <span className={`my-1 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-sans text-sm font-semibold ${tone}`}>
                  <span className="text-xs opacity-70">{n}</span>
                  {chosen ?? "· · ·"}
                </span>
              );
            }}
          />
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Párrafos</h3>
            <LabelledCards items={paragraphs.map((p, i) => ({ label: p.letter, text: p.text, title: !review && used.has(String(i)) ? "Usado" : undefined }))} />
          </div>
          <div className="space-y-4">
            {gaps.map((g) => {
              const r = resultOf(g.n);
              return (
                <ChoiceQuestion
                  key={g.n}
                  n={g.n}
                  title={`Hueco ${g.n}`}
                  compact
                  options={paragraphs.map((p) => p.letter)}
                  selected={answers[g.n]}
                  onSelect={(v) => onChange(g.n, v)}
                  correct={r ? g.correct : undefined}
                >
                  {r && <Feedback n={g.n} ok={r.correct} given={r.given} expected={r.expected} explanation={g.explanation} evidence={g.evidence} skill={g.skill} />}
                </ChoiceQuestion>
              );
            })}
          </div>
        </div>
      );
    }

    // ───────────── Part 8: multiple matching ─────────────
    case "r8": {
      const { intro, sections, questions } = exercise.data;
      return (
        <div className="space-y-6">
          <p className="font-serif text-[1.02rem] italic">{intro}</p>
          <LabelledCards items={sections.map((s) => ({ label: s.label, title: s.heading, text: s.text }))} />
          <div className="space-y-4">
            {questions.map((q) => {
              const r = resultOf(q.n);
              return (
                <ChoiceQuestion
                  key={q.n}
                  n={q.n}
                  stem={q.stem}
                  compact
                  options={sections.map((s) => s.label)}
                  selected={answers[q.n]}
                  onSelect={(v) => onChange(q.n, v)}
                  correct={r ? q.correct : undefined}
                >
                  {r && <Feedback n={q.n} ok={r.correct} given={r.given} expected={r.expected} explanation={q.explanation} evidence={q.evidence} skill={q.skill} />}
                </ChoiceQuestion>
              );
            })}
          </div>
        </div>
      );
    }
  }
}

/** Corrección de una pregunta con 4 opciones: veredicto + explicación de cada opción */
function OptionFeedback({
  q,
  r,
}: {
  q: { n: number; options: string[]; correct: number; explanations: string[]; evidence: string; skill: string };
  r: { correct: boolean; given: string; expected: string };
}): ReactNode {
  return (
    <>
      <Feedback n={q.n} ok={r.correct} given={r.given} expected={r.expected} evidence={q.evidence} skill={q.skill} />
      <ul className="space-y-1.5 text-sm">
        {q.options.map((opt, i) => (
          <li key={i} className="flex gap-2">
            <span className={`shrink-0 font-bold ${i === q.correct ? "text-ok" : "text-bad"}`}>
              {LETTERS[i]} · {opt}
            </span>
            <span className="text-muted">— {q.explanations[i]}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
