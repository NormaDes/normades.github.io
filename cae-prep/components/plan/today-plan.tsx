"use client";

import Link from "next/link";
import { TaskList } from "@/components/plan/plan-app";
import { usePlan } from "@/components/plan/use-plan";

/** Resumen de «Hoy en clase» para la portada */
export function TodayPlan() {
  const { plan, today, isDone, toggle } = usePlan(1);
  const d = plan?.[0];
  if (!today || !d) return null;
  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-xl font-bold">Hoy en clase</h2>
        <Link href="/plan" className="text-sm font-semibold text-brand hover:text-accent">Ver la semana →</Link>
      </div>
      <TaskList day={d.day} tasks={d.tasks} study={d.study} isDone={isDone} toggle={toggle} />
    </section>
  );
}
