"use client";

import { AudioPlayer, Transcript } from "@/components/practice/audio-player";
import { ChoiceQuestion } from "@/components/practice/choice-question";
import { Feedback } from "@/components/practice/gap-text";
import type { ExerciseResult, UserAnswers } from "@/lib/checking";
import { letterOf, type ListeningExercise } from "@/lib/schemas";

interface Props {
  exercise: ListeningExercise;
  answers: UserAnswers;
  onChange: (n: number, value: string) => void;
  result?: ExerciseResult;
}

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function ListeningView({ exercise, answers, onChange, result }: Props) {
  const review = Boolean(result);
  const resultOf = (n: number) => result?.results.find((r) => r.n === n);

  switch (exercise.partId) {
    // ───────────── Part 1: tres extractos ─────────────
    case "l1": {
      return (
        <div className="space-y-8">
          {exercise.data.extracts.map((ex, ei) => (
            <section key={ei} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Extracto {ei + 1}</h3>
              <p className="font-serif text-[1.02rem] italic">{ex.context}</p>
              <AudioPlayer key={`${exercise.id}-${ei}`} segments={ex.segments} audioUrl={ex.audio} label={`Extracto ${ei + 1}`} />
              {ex.questions.map((q) => {
                const r = resultOf(q.n);
                return (
                  <ChoiceQuestion key={q.n} n={q.n} stem={q.stem} options={q.options} selected={answers[q.n]} onSelect={(v) => onChange(q.n, v)} correct={r ? q.correct : undefined}>
                    {r && (
                      <>
                        <Feedback n={q.n} ok={r.correct} given={r.given} expected={r.expected} evidence={q.evidence} skill={q.skill} />
                        <OptionNotes options={q.options} correct={q.correct} explanations={q.explanations} />
                      </>
                    )}
                  </ChoiceQuestion>
                );
              })}
              {review && <Transcript segments={ex.segments} />}
            </section>
          ))}
        </div>
      );
    }

    // ───────────── Part 2: sentence completion ─────────────
    case "l2": {
      const d = exercise.data;
      return (
        <div className="space-y-5">
          <p className="font-serif text-[1.02rem] italic">{d.intro}</p>
          <AudioPlayer key={exercise.id} segments={d.segments} audioUrl={d.audio} label="Talk" />
          <div className="space-y-3">
            {d.sentences.map((g) => {
              const r = resultOf(g.n);
              return (
                <div key={g.n} className="rounded-2xl border border-line bg-surface p-4">
                  <p className="font-serif text-[1.05rem] leading-[2.1]">
                    <span className="mr-2 font-sans text-xs font-bold text-muted">{g.n}</span>
                    {g.before}{" "}
                    {r ? (
                      <span className={`rounded-md px-2 font-sans text-sm font-semibold ${r.correct ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad line-through"}`}>{answers[g.n] || "···"}</span>
                    ) : (
                      <input
                        type="text"
                        value={answers[g.n] ?? ""}
                        onChange={(e) => onChange(g.n, e.target.value)}
                        aria-label={`Frase ${g.n}`}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        className="h-10 w-40 rounded-md border border-line bg-bg px-2 text-center font-sans text-[15px] focus:border-brand"
                      />
                    )}{" "}
                    {g.after}
                  </p>
                  {r && (
                    <div className="mt-3">
                      <Feedback n={g.n} ok={r.correct} given={r.given} expected={r.expected} explanation={g.explanation} evidence={g.evidence} skill={g.skill} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {review && <Transcript segments={d.segments} />}
        </div>
      );
    }

    // ───────────── Part 3: interview ─────────────
    case "l3": {
      const d = exercise.data;
      return (
        <div className="space-y-5">
          <p className="font-serif text-[1.02rem] italic">{d.intro}</p>
          <AudioPlayer key={exercise.id} segments={d.segments} audioUrl={d.audio} label="Interview" />
          <div className="space-y-4">
            {d.questions.map((q) => {
              const r = resultOf(q.n);
              return (
                <ChoiceQuestion key={q.n} n={q.n} stem={q.stem} options={q.options} selected={answers[q.n]} onSelect={(v) => onChange(q.n, v)} correct={r ? q.correct : undefined}>
                  {r && (
                    <>
                      <Feedback n={q.n} ok={r.correct} given={r.given} expected={r.expected} evidence={q.evidence} skill={q.skill} />
                      <OptionNotes options={q.options} correct={q.correct} explanations={q.explanations} />
                    </>
                  )}
                </ChoiceQuestion>
              );
            })}
          </div>
          {review && <Transcript segments={d.segments} />}
        </div>
      );
    }

    // ───────────── Part 4: multiple matching (5 hablantes, 2 tareas) ─────────────
    case "l4": {
      const d = exercise.data;
      const allSegments = d.speakers.flatMap((s, i) => s.segments.map((seg, j) => ({ ...seg, speaker: `Speaker ${i + 1}`, pauseBefore: j === 0 && i > 0 ? 1800 : seg.pauseBefore })));
      const audioUrl = d.speakers[0]?.audio;
      return (
        <div className="space-y-6">
          <p className="font-serif text-[1.02rem] italic">You will hear five different people talking. Listen to all five speakers; each recording is played twice.</p>
          <AudioPlayer key={exercise.id} segments={allSegments} audioUrl={audioUrl} label="Speakers 1–5" />
          {d.tasks.map((task, ti) => (
            <section key={ti} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Task {ti + 1}</h3>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="font-serif text-[1.02rem] font-semibold">{task.stem}</p>
                <ul className="mt-3 grid gap-1.5 text-[15px] sm:grid-cols-2">
                  {task.options.map((o, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-5 font-bold text-brand">{LETTERS[i]}</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
              {d.questions
                .filter((q) => q.task === ti + 1)
                .map((q) => {
                  const r = resultOf(q.n);
                  return (
                    <ChoiceQuestion key={q.n} n={q.n} title={`Speaker ${q.speaker}`} compact options={task.options.map((_, i) => letterOf(i))} selected={answers[q.n]} onSelect={(v) => onChange(q.n, v)} correct={r ? q.correct : undefined}>
                      {r && <Feedback n={q.n} ok={r.correct} given={r.given} expected={`${r.expected} · ${task.options[q.correct]}`} explanation={q.explanation} evidence={q.evidence} skill={q.skill} />}
                    </ChoiceQuestion>
                  );
                })}
            </section>
          ))}
          {review && <Transcript segments={allSegments} />}
        </div>
      );
    }
  }
}

function OptionNotes({ options, correct, explanations }: { options: string[]; correct: number; explanations: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {options.map((opt, i) => (
        <li key={i} className="flex gap-2">
          <span className={`shrink-0 font-bold ${i === correct ? "text-ok" : "text-bad"}`}>
            {LETTERS[i]} · {opt}
          </span>
          <span className="text-muted">— {explanations[i]}</span>
        </li>
      ))}
    </ul>
  );
}
