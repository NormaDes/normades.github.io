"use client";

import Link from "next/link";
import { TaskList } from "@/components/plan/plan-app";
import { usePlan } from "@/components/plan/use-plan";
import { daysBetween } from "@/lib/plan";
import { clientPrefs } from "@/lib/storage";

/** Panel de la pizarra: cuenta atrás del examen y lo de hoy en clase. */
export function HeroPanel() {
  const { settings, today, plan, isDone, toggle } = usePlan(1);
  if (!today) return <div className="min-h-[18rem]" aria-hidden />;

  const toExam = settings.examDate ? daysBetween(today, settings.examDate) : null;
  const d = plan?.[0];

  return (
    <aside aria-label="Tu examen y tu día" className="relative rounded-xl border border-white/20 bg-[#0b2a5c]/70 p-5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)] backdrop-blur-[2px]">
      {toExam !== null && toExam >= 0 ? (
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-white/60">Tu examen</p>
            <p className="hand mt-1 text-6xl leading-none">{toExam}</p>
            <p className="mt-1 text-sm text-white/80">{toExam === 1 ? "día" : "días"} · {new Date(`${settings.examDate}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</p>
          </div>
          <label className="text-xs text-white/70">
            <span className="sr-only">Cambiar la fecha del examen</span>
            <input type="date" min={today} value={settings.examDate} onChange={(e) => e.target.value && clientPrefs.set("examDate", e.target.value)} className="h-9 w-[8.6rem] rounded-md border border-white/30 bg-white/10 px-2 text-xs text-white [color-scheme:dark]" />
          </label>
        </div>
      ) : (
        <div>
          <p className="eyebrow text-white/60">Tu examen</p>
          <label htmlFor="hero-exam-date" className="mt-1 block font-display text-lg font-bold leading-snug">¿Cuándo es? Ajusto tu plan a esa fecha.</label>
          <input id="hero-exam-date" type="date" min={today} onChange={(e) => e.target.value && clientPrefs.set("examDate", e.target.value)} className="mt-3 h-11 w-full rounded-lg border border-white/30 bg-white px-3 text-ink" />
        </div>
      )}

      <div className="mt-5 border-t border-white/15 pt-4">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow text-white/60">Hoy en clase</p>
          <Link href="/plan" className="text-xs font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline">Ver la semana</Link>
        </div>
        {d && <TaskList day={d.day} tasks={d.tasks.slice(0, 3)} study={d.study} isDone={isDone} toggle={toggle} dark />}
      </div>
    </aside>
  );
}
