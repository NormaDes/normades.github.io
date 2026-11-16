"use client";

import { EXAM_CATALOG } from "@/config/catalog";
import { setExam, useExam } from "@/lib/use-exam";
import { isExamId } from "@/config/exam";

/** Exámenes disponibles (se pueden elegir) y próximos. */
export function ExamPicker() {
  const current = useExam();
  return (
    <section className="mt-12" aria-labelledby="exams-title">
      <h2 id="exams-title" className="text-2xl md:text-3xl">Tu examen</h2>
      <p className="mb-4 mt-1 text-sm font-semibold text-muted">Elige el examen que preparas. Englora crece examen a examen: los marcados como «Pronto» llegarán más adelante.</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAM_CATALOG.map((e) => {
          const selectable = e.available && isExamId(e.id);
          const on = selectable && current === e.id;
          const inner = (
            <>
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-base font-semibold ${on ? "bg-brand text-brand-ink shadow-[0_4px_0_var(--brand-dark)]" : selectable ? "bg-brand-soft text-brand" : "bg-bg text-muted"}`}>{e.level}</span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate font-bold">{e.name}</span>
                <span className="block truncate text-xs font-semibold text-muted">{e.body}</span>
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${on ? "bg-brand text-brand-ink" : "bg-bg text-muted"}`}>{on ? "Elegido" : selectable ? "Elegir" : "Pronto"}</span>
            </>
          );
          return (
            <li key={e.id}>
              {selectable ? (
                <button type="button" aria-pressed={on} onClick={() => setExam(e.id as "c1-advanced" | "b2-first")} className={`flex w-full items-center gap-3 rounded-3xl border-2 p-3.5 ${on ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/40"}`}>{inner}</button>
              ) : (
                <div className="flex items-center gap-3 rounded-3xl border-2 border-line bg-surface p-3.5 opacity-80">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
