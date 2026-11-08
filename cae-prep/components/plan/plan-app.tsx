"use client";

import Link from "next/link";
import { Chalkboard } from "@/components/classroom";
import { usePlan } from "@/components/plan/use-plan";
import { PHASE_LABEL, daysBetween, type PlanTask } from "@/lib/plan";
import { clientPrefs } from "@/lib/storage";

const KIND_TAG: Record<PlanTask["kind"], string> = { practice: "Práctica", vocab: "Vocabulario", errors: "Errores", mock: "Simulacro" };
const fmtDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" });

export function PlanApp() {
  const { settings, today, plan, isDone, toggle } = usePlan(14);
  if (!today) return null;

  const toExam = settings.examDate ? daysBetween(today, settings.examDate) : null;
  const first = plan?.[0];

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-accent">Horario</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Tu plan de estudio</h1>
      <p className="mb-6 mt-2 max-w-xl text-muted">Se adapta a la fecha de tu examen, al tiempo que tienes y a tus puntos débiles. Cada vez que practicas, se reajusta solo.</p>

      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-semibold">
            Fecha del examen
            <input type="date" min={today} value={settings.examDate} onChange={(e) => clientPrefs.set("examDate", e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-line bg-bg px-3 font-normal" />
          </label>
          <label className="text-sm font-semibold">
            Minutos por día
            <select value={settings.minutes} onChange={(e) => clientPrefs.set("planMinutes", Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border border-line bg-bg px-3 font-normal">
              {[30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Días por semana
            <select value={settings.days} onChange={(e) => clientPrefs.set("planDays", Number(e.target.value))} className="mt-1 h-11 w-full rounded-lg border border-line bg-bg px-3 font-normal">
              {[2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{d} días</option>)}
            </select>
          </label>
        </div>
        {toExam !== null && toExam >= 0 && first && (
          <p className="mt-4 text-sm"><strong>{toExam}</strong> días para el examen · fase actual: <strong>{PHASE_LABEL[first.phase]}</strong>. {first.phase === "simulacros" && "Toca entrenar en condiciones reales."}{first.phase === "descanso" && "Sesiones ligeras: descansa, duerme y repasa lo ya visto."}</p>
        )}
        {toExam !== null && toExam < 0 && <p className="mt-4 text-sm text-muted">La fecha del examen ya ha pasado. Elige una nueva para recuperar el plan.</p>}
        {!settings.examDate && <p className="mt-4 text-sm text-muted">Sin fecha de examen verás un plan de base. Añádela para que el plan cambie de fase (base, refuerzo, simulacros).</p>}
      </section>

      <ol className="mt-6 space-y-4">
        {plan?.map((d, i) => (
          <li key={d.day} className={i === 0 ? "" : ""}>
            {i === 0 ? (
              <Chalkboard className="px-5 pb-8 pt-5">
                <p className="eyebrow text-white/60">Hoy en clase</p>
                <p className="hand mt-1 text-3xl capitalize">{fmtDay(d.day)}</p>
                <TaskList day={d.day} tasks={d.tasks} study={d.study} isDone={isDone} toggle={toggle} dark />
              </Chalkboard>
            ) : (
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="font-display text-lg font-bold capitalize">{fmtDay(d.day)}</p>
                <TaskList day={d.day} tasks={d.tasks} study={d.study} isDone={isDone} toggle={toggle} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TaskList({ day, tasks, study, isDone, toggle, dark }: { day: string; tasks: PlanTask[]; study: boolean; isDone: (t: PlanTask, d: string) => boolean; toggle: (t: PlanTask, d: string) => void; dark?: boolean }) {
  if (!study) return <p className={`mt-2 text-sm ${dark ? "text-white/70" : "text-muted"}`}>Día libre. Si te apetece, repasa vocabulario 5 minutos.</p>;
  return (
    <ul className="mt-3 space-y-2">
      {tasks.map((t) => {
        const done = isDone(t, day);
        const manual = t.kind === "vocab" || t.kind === "errors";
        return (
          <li key={`${t.kind}${t.partId ?? t.paper ?? ""}`} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${dark ? "bg-white/10" : "bg-bg"}`}>
            {manual ? (
              <input type="checkbox" checked={done} onChange={() => toggle(t, day)} aria-label={`Hecho: ${t.label}`} className="h-5 w-5 accent-[var(--accent)]" />
            ) : (
              <span aria-label={done ? "Hecho" : "Pendiente"} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${done ? "border-ok bg-ok text-white" : dark ? "border-white/50" : "border-line"}`}>{done ? "✓" : ""}</span>
            )}
            <Link href={t.href} className={`min-w-0 flex-1 text-sm font-semibold hover:underline ${done ? "line-through opacity-60" : ""}`}>
              {t.label}
              <span className={`ml-2 text-xs font-normal ${dark ? "text-white/60" : "text-muted"}`}>{KIND_TAG[t.kind]}</span>
            </Link>
            <span className={`text-xs tabular-nums ${dark ? "text-white/70" : "text-muted"}`}>{t.minutes} min</span>
          </li>
        );
      })}
    </ul>
  );
}
