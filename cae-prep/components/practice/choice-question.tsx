"use client";

import type { ReactNode } from "react";

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
  return (
    <fieldset className="rounded-2xl border border-line bg-surface p-4">
      <legend className="px-1 text-sm font-semibold">{title ?? `Pregunta ${n}`}</legend>
      {stem && <p className="mb-3 font-serif text-[1.02rem] leading-relaxed">{stem}</p>}
      <div
        role="radiogroup"
        aria-label={title ?? `Pregunta ${n}`}
        className={compact ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2"}
      >
        {options.map((opt, i) => {
          const isSel = selected === String(i);
          let cls = "border-line hover:border-brand";
          if (review) {
            if (i === correct) cls = "border-ok bg-ok-soft";
            else if (isSel) cls = "border-bad bg-bad-soft";
            else cls = "border-line opacity-60";
          } else if (isSel) cls = "border-brand bg-brand-soft";
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
                  ? `flex h-12 w-12 items-center justify-center rounded-xl border text-base font-bold transition-colors ${cls}`
                  : `flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-left text-[15px] transition-colors ${cls}`
              }
            >
              {compact ? (
                LETTERS[i]
              ) : (
                <>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg text-xs font-bold">{LETTERS[i]}</span>
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
