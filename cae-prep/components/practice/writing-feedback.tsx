"use client";

import { useState } from "react";
import { CRITERIA, bandHint, totalScore, type WritingEvaluation } from "@/lib/writing";

const TYPE_ES: Record<string, string> = {
  grammar: "Gramática",
  vocabulary: "Vocabulario",
  spelling: "Ortografía",
  punctuation: "Puntuación",
  register: "Registro",
  cohesion: "Cohesión",
  task: "Tarea",
};

/** Divide el texto en trozos normales y trozos marcados (errores), sin solapes */
function segments(text: string, errors: WritingEvaluation["errors"]) {
  const lower = text.toLowerCase();
  const found: Array<{ start: number; end: number; idx: number }> = [];
  errors.forEach((e, idx) => {
    const start = lower.indexOf(e.quote.toLowerCase());
    if (start === -1) return;
    const end = start + e.quote.length;
    if (found.some((f) => start < f.end && end > f.start)) return;
    found.push({ start, end, idx });
  });
  found.sort((a, b) => a.start - b.start);

  const out: Array<{ text: string; err?: number }> = [];
  let pos = 0;
  for (const f of found) {
    if (f.start > pos) out.push({ text: text.slice(pos, f.start) });
    out.push({ text: text.slice(f.start, f.end), err: f.idx });
    pos = f.end;
  }
  if (pos < text.length) out.push({ text: text.slice(pos) });
  return out;
}

export function WritingFeedback({ evaluation, text, wordCount }: { evaluation: WritingEvaluation; text: string; wordCount: number }) {
  const total = totalScore(evaluation);
  const band = bandHint(total);
  const [copied, setCopied] = useState(false);

  const toneCls = band.tone === "ok" ? "bg-ok-soft text-ok" : band.tone === "warn" ? "bg-warn-soft" : "bg-bad-soft text-bad";

  return (
    <div className="space-y-6">
      {/* Puntuación */}
      <section className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Puntuación estimada por la IA</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <p className="text-3xl font-bold tabular-nums">
            {total}
            <span className="text-lg font-medium text-muted">/20</span>
          </p>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneCls}`}>{band.label}</span>
          <span className="text-xs text-muted">{wordCount} palabras</span>
        </div>

        <div className="mt-5 space-y-4">
          {CRITERIA.map((c) => {
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
          Es una estimación orientativa hecha por IA con los criterios oficiales; la banda 3 corresponde a un nivel C1 satisfactorio. No sustituye a un examinador.
        </p>
      </section>

      {/* Fortalezas y prioridades */}
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

      {/* Texto con errores marcados */}
      <section className="rounded-2xl border border-line bg-surface p-4 md:p-6">
        <h3 className="text-sm font-semibold">Tu texto, con los errores marcados</h3>
        <p className="exam-text-long mt-3 whitespace-pre-wrap font-serif text-[1.05rem]">
          {segments(text, evaluation.errors).map((s, i) =>
            s.err === undefined ? (
              <span key={i}>{s.text}</span>
            ) : (
              <mark key={i} className="rounded bg-bad-soft px-0.5 text-ink underline decoration-bad decoration-wavy underline-offset-4">
                {s.text}
                <sup className="ml-0.5 font-sans text-[10px] font-bold text-bad">{s.err + 1}</sup>
              </mark>
            ),
          )}
        </p>
      </section>

      {evaluation.errors.length > 0 && (
        <section className="space-y-2.5">
          <h3 className="text-sm font-semibold">Correcciones ({evaluation.errors.length})</h3>
          {evaluation.errors.map((e, i) => (
            <div key={i} className="rounded-2xl border border-line bg-surface p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bad-soft text-xs font-bold text-bad">{i + 1}</span>
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">{TYPE_ES[e.type] ?? e.type}</span>
              </div>
              <p className="mt-2 font-serif text-[1.02rem]">
                <span className="text-bad line-through">{e.quote}</span> → <span className="font-semibold text-ok">{e.correction}</span>
              </p>
              <p className="mt-1.5 text-muted">{e.explanation}</p>
            </div>
          ))}
        </section>
      )}

      {/* Versión mejorada */}
      <section className="rounded-2xl border border-brand/40 bg-brand-soft p-4 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-brand">Versión mejorada (mismas ideas, nivel C1+)</h3>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(evaluation.improvedVersion);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                /* sin portapapeles */
              }
            }}
            className="min-h-9 rounded-lg border border-brand px-3 text-xs font-semibold text-brand"
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
        <p className="exam-text-long mt-3 whitespace-pre-wrap font-serif text-[1.05rem]">{evaluation.improvedVersion}</p>
      </section>
    </div>
  );
}
