"use client";

import { SPEAKING_CRITERIA, speakingTotal, type SpeakingEvaluation } from "@/lib/speaking";

export function SpeakingFeedback({ evaluation }: { evaluation: SpeakingEvaluation }) {
  const total = speakingTotal(evaluation);
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Valoración estimada por la IA</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {total}
          <span className="text-lg font-medium text-muted">/20</span>
        </p>
        <div className="mt-5 space-y-4">
          {SPEAKING_CRITERIA.map((c) => {
            const v = evaluation.scores[c.key];
            return (
              <div key={c.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">
                    {c.label} <span className="font-normal text-muted">· {c.es}</span>
                  </span>
                  <span className="font-bold tabular-nums">{v}/5</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={`${c.label}: ${v} de 5`}>
                  <div className={`h-full rounded-full ${v >= 3 ? "bg-ok" : "bg-bad"}`} style={{ width: `${(v / 5) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{evaluation.comments[c.key]}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted">
          La IA evalúa solo la transcripción: no puede juzgar tu pronunciación ni tu entonación. Una banda 3 equivale a un C1 satisfactorio.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-ok/40 bg-ok-soft p-4">
          <h3 className="text-sm font-semibold text-ok">Lo que has hecho bien</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="flex gap-2"><span aria-hidden>✓</span>{s}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold">Qué mejorar primero</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
            {evaluation.priorities.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      </div>

      {evaluation.errors.length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-sm font-semibold">Correcciones ({evaluation.errors.length})</h3>
          {evaluation.errors.map((e, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-4 text-sm">
              <p className="font-serif text-[1.02rem]">
                <span className="text-bad line-through">{e.quote}</span> → <span className="font-semibold text-ok">{e.correction}</span>
              </p>
              <p className="mt-1.5 text-muted">{e.explanation}</p>
            </div>
          ))}
        </section>
      )}

      {evaluation.upgrades.length > 0 && (
        <section className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="text-sm font-semibold">Sube el nivel de tu vocabulario</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {evaluation.upgrades.map((u, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-muted">{u.original}</span>
                <span aria-hidden>→</span>
                <span className="font-semibold text-brand">{u.better}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-brand/40 bg-brand-soft p-4 md:p-6">
        <h3 className="text-sm font-semibold text-brand">Respuesta modelo</h3>
        <p className="exam-text-long mt-3 whitespace-pre-wrap font-serif text-[1.05rem]">{evaluation.modelAnswer}</p>
      </section>
    </div>
  );
}
