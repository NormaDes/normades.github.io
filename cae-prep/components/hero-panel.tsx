"use client";

import Link from "next/link";
import { TaskList } from "@/components/plan/plan-app";
import { usePlan } from "@/components/plan/use-plan";
import { daysBetween } from "@/lib/plan";
import { clientPrefs } from "@/lib/storage";

/** Panel de la portada: cuenta atrás del examen y lo de hoy. */
export function HeroPanel() {
  const { settings, today, plan, isDone, toggle } = usePlan(1);
  if (!today) return <div className="min-h-[18rem]" aria-hidden />;

  const toExam = settings.examDate ? daysBetween(today, settings.examDate) : null;
  const d = plan?.[0];

  return (
    <aside aria-label="Tu examen y tu día" className="rounded-3xl bg-white p-5 text-ink shadow-[0_6px_0_rgba(0,0,0,0.18)]">
      {toExam !== null && toExam >= 0 ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-sun text-[#4d3700] shadow-[0_4px_0_var(--sun-dark)]">
              <span className="font-display text-4xl font-semibold leading-none tabular-nums">{toExam}</span>
              <span className="text-[11px] font-extrabold uppercase">{toExam === 1 ? "día" : "días"}</span>
            </span>
            <div>
              <p className="eyebrow text-muted">Tu examen</p>
              <p className="font-display text-lg font-semibold leading-tight">{new Date(`${settings.examDate}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</p>
            </div>
          </div>
          <label>
            <span className="sr-only">Cambiar la fecha del examen</span>
            <input type="date" min={today} value={settings.examDate} onChange={(e) => e.target.value && clientPrefs.set("examDate", e.target.value)} className="h-10 w-[7.8rem] rounded-xl border-line bg-bg px-2 text-xs font-semibold" />
          </label>
        </div>
      ) : (
        <div>
          <p className="eyebrow text-muted">Tu examen</p>
          <label htmlFor="hero-exam-date" className="mt-1 block font-display text-xl font-semibold leading-snug">¿Cuándo es? Adapto tu plan a esa fecha.</label>
          <input id="hero-exam-date" type="date" min={today} onChange={(e) => e.target.value && clientPrefs.set("examDate", e.target.value)} className="mt-3 h-12 w-full rounded-xl border-line bg-bg px-3 font-semibold" />
        </div>
      )}

      <div className="mt-5 border-t-2 border-line pt-4">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow text-muted">Hoy en clase</p>
          <Link href="/plan" className="text-xs font-extrabold text-brand underline-offset-2 hover:underline">Ver la semana</Link>
        </div>
        {d && <TaskList day={d.day} tasks={d.tasks.slice(0, 3)} study={d.study} isDone={isDone} toggle={toggle} />}
      </div>
    </aside>
  );
}
