"use client";

import type { ExerciseResult, UserAnswers } from "@/lib/checking";
import type { Exercise } from "@/lib/schemas";
import { Feedback, GapText } from "@/components/practice/gap-text";

interface Props {
  exercise: Exercise;
  answers: UserAnswers;
  onChange: (n: number, value: string) => void;
  /** Si hay resultado, la vista pasa a modo revisión (solo lectura con corrección) */
  result?: ExerciseResult;
}

const LETTERS = ["A", "B", "C", "D"];

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
                <fieldset key={q.n} className="rounded-2xl border border-line bg-surface p-4">
                  <legend className="px-1 text-sm font-semibold">Pregunta {q.n}</legend>
                  <div role="radiogroup" aria-label={`Pregunta ${q.n}`} className="mt-1 grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, i) => {
                      const selected = answers[q.n] === String(i);
                      let cls = "border-line hover:border-brand";
                      if (review) {
                        if (i === q.correct) cls = "border-ok bg-ok-soft";
                        else if (selected) cls = "border-bad bg-bad-soft";
                        else cls = "border-line opacity-70";
                      } else if (selected) cls = "border-brand bg-brand-soft";
                      return (
                        <button
                          key={i}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={review}
                          onClick={() => onChange(q.n, String(i))}
                          className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-left text-[15px] transition-colors ${cls}`}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg text-xs font-bold">
                            {LETTERS[i]}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {r && (
                    <div className="mt-4 space-y-3">
                      <Feedback
                        n={q.n}
                        ok={r.correct}
                        given={r.given}
                        expected={r.expected}
                        evidence={q.evidence}
                        skill={q.skill}
                      />
                      <ul className="space-y-1.5 text-sm">
                        {q.options.map((opt, i) => (
                          <li key={i} className="flex gap-2">
                            <span className={`font-bold ${i === q.correct ? "text-ok" : "text-bad"}`}>
                              {LETTERS[i]} · {opt}
                            </span>
                            <span className="text-muted">— {q.explanations[i]}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </fieldset>
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
                    <span
                      className={`rounded-md px-2 font-sans text-sm font-semibold ${r.correct ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad line-through"}`}
                    >
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
                return (
                  <Feedback
                    key={g.n}
                    n={g.n}
                    ok={r.correct}
                    given={r.given}
                    expected={r.expected}
                    explanation={g.explanation}
                    evidence={g.evidence}
                    skill={g.skill}
                  />
                );
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
                <p className="mt-3 inline-block rounded-lg border border-brand bg-brand-soft px-3 py-1 text-sm font-bold tracking-widest text-brand">
                  {it.keyword}
                </p>
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
                    <Feedback
                      n={it.n}
                      ok={r.correct}
                      given={r.given}
                      expected={r.expected}
                      explanation={it.explanation}
                      skill={it.skill}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  }
}
