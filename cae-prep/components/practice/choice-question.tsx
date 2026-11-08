"use client";

import type { ReactNode } from "react";
import { CheckIcon } from "@/components/icons";

const LETTERS = "ABCDEFGHIJ";

interface Props {
  n: number;
  /** Texto de la pregunta (si lo hay) */
  stem?: string;
  /** Título de la tarjeta; por defecto "Pregunta n" */
  title?: string;
  options: string[];
  /** Modo compacto: las opciones son solo letras en fila (R6, R7, R8) */
  compact?: boolean;
  selected?: string;
  onSelect: (value: string) => void;
  /** Índice correcto: activa el modo revisión */
  correct?: number;
  children?: ReactNode;
}

/** Pregunta de opción múltiple reutilizable (R1, R5) o de elegir letra (R6, R7, R8) */
export function ChoiceQuestion({ n, stem, title, options, compact, selected, onSelect, correct, children }: Props) {
  const review = correct !== undefined;
  const answered = selected !== undefined && selected !== "";
  return (
    <fieldset className={`rounded-3xl border-2 bg-surface p-4 shadow-card transition-colors md:p-5 ${review ? "border-line" : answered ? "border-brand/40" : "border-line"}`}>
      <legend className="flex items-center gap-2 px-1 text-sm font-extrabold">
        <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs text-white ${answered || review ? "bg-brand" : "bg-muted/60"}`}>{answered && !review ? <CheckIcon width={14} height={14} /> : n}</span>
        {title ?? `Pregunta ${n}`}
      </legend>
      {stem && <p className="mb-3 text-[1.05rem] font-semibold leading-relaxed">{stem}</p>}
      <div role="radiogroup" aria-label={title ?? `Pregunta ${n}`} className={compact ? "flex flex-wrap gap-2.5" : "grid gap-2.5 sm:grid-cols-2"}>
        {options.map((opt, i) => {
          const isSel = selected === String(i);
          let cls = "border-line bg-surface hover:border-brand hover:bg-brand-soft/60";
          let badge = "bg-bg text-muted";
          if (review) {
            if (i === correct) {
              cls = "border-ok bg-ok-soft";
              badge = "bg-ok text-white";
            } else if (isSel) {
              cls = "border-bad bg-bad-soft";
              badge = "bg-bad text-white";
            } else cls = "border-line opacity-55";
          } else if (isSel) {
            cls = "border-brand bg-brand-soft shadow-[0_3px_0_var(--brand)]";
            badge = "bg-brand text-white";
          }
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSel}
              disabled={review}
              onClick={() => onSelect(String(i))}
              className={
                compact
                  ? `flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-lg font-extrabold transition-all ${cls}`
                  : `flex min-h-14 items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left text-base font-semibold transition-all active:scale-[0.99] ${cls}`
              }
            >
              {compact ? (
                LETTERS[i]
              ) : (
                <>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${badge}`}>{LETTERS[i]}</span>
                  {opt}
                </>
              )}
            </button>
          );
        })}
      </div>
      {children && <div className="mt-4 space-y-3">{children}</div>}
    </fieldset>
  );
}
