"use client";

import { useEffect, useState } from "react";
import { getPart } from "@/config/exam";
import type { ClassSummary, StudentRow } from "@/lib/class-stats";
import { partShort } from "@/lib/progress";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useIsAdmin } from "@/lib/supabase/use-admin";

type Data = { rows: StudentRow[]; summary: ClassSummary } | { error: string };

const pct = (v: number | null) => (v === null ? "-" : `${Math.round(v * 100)} %`);
const STATUS = {
  activo: { label: "Activo", cls: "bg-ok-soft text-ok" },
  parado: { label: "Parado", cls: "bg-coral-soft text-accent-dark" },
  nuevo: { label: "Sin empezar", cls: "bg-sun-soft text-[#7a5a00]" },
} as const;

const barTone = (v: number) => (v >= 0.8 ? "bg-mint" : v >= 0.6 ? "bg-sun" : "bg-accent");

/** Progreso de toda la clase para el profesor. */
export function ClassDashboard() {
  const admin = useIsAdmin();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || admin !== true) return;
    let cancelled = false;
    fetch("/api/class", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => !cancelled && setData(j))
      .catch(() => !cancelled && setData({ error: "No se pudo cargar la clase." }));
    return () => {
      cancelled = true;
    };
  }, [admin]);

  if (admin !== true) return null;

  return (
    <section className="mt-2" aria-labelledby="class-title">
      <h2 id="class-title" className="mb-4 text-2xl md:text-3xl">Tu clase</h2>
      {!data ? (
        <div className="h-40 animate-pulse rounded-3xl bg-line/60" aria-busy="true" />
      ) : "error" in data ? (
        <p role="alert" className="rounded-3xl bg-bad-soft p-4 text-sm font-semibold text-bad">{data.error}</p>
      ) : data.summary.students === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-line bg-surface p-8 text-center">
          <p className="font-display text-xl font-semibold">Aún no hay alumnos registrados</p>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-muted">Cuando tus alumnos creen su cuenta aparecerán aquí con su actividad y sus aciertos.</p>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Alumnos", String(data.summary.students), "bg-brand-soft"],
              ["Activos esta semana", String(data.summary.active7), "bg-ok-soft"],
              ["Acierto medio", pct(data.summary.avgAccuracy), "bg-grape-soft"],
              ["Ejercicios hechos", String(data.summary.totalAttempts), "bg-tangerine-soft"],
            ].map(([l, v, tone]) => (
              <div key={l} className={`rounded-3xl px-4 py-4 ${tone}`}>
                <dt className="eyebrow text-muted">{l}</dt>
                <dd className="mt-1 font-display text-4xl font-semibold leading-none tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {data.summary.byPart.length > 0 && (
            <div className="mt-5 rounded-3xl border-2 border-line bg-surface p-5 shadow-card">
              <h3 className="font-display text-xl font-semibold">Dónde falla más la clase</h3>
              <p className="text-sm font-semibold text-muted">Acierto medio por parte, de la más floja a la más fuerte.</p>
              <ul className="mt-3 space-y-2.5">
                {data.summary.byPart.slice(0, 8).map((p) => (
                  <li key={p.partId}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-bold">{partShort(p.partId)} <span className="font-semibold text-muted">· {getPart(p.partId).name}</span></span>
                      <span className="font-extrabold tabular-nums">{pct(p.accuracy)}</span>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-line" role="img" aria-label={`${partShort(p.partId)}: ${pct(p.accuracy)}`}>
                      <div className={`h-full rounded-full ${barTone(p.accuracy)}`} style={{ width: `${Math.max(3, p.accuracy * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {data.rows.map((r) => (
              <li key={r.id} className="rounded-3xl border-2 border-line bg-surface p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-grape text-base font-extrabold text-white">{r.name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-extrabold">{r.name}</p>
                    {r.email && <p className="truncate text-xs font-semibold text-muted">{r.email}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-bg p-2"><dt className="eyebrow text-muted">Acierto</dt><dd className="font-display text-xl font-semibold tabular-nums">{pct(r.accuracy)}</dd></div>
                  <div className="rounded-2xl bg-bg p-2"><dt className="eyebrow text-muted">7 días</dt><dd className="font-display text-xl font-semibold tabular-nums">{r.last7}</dd></div>
                  <div className="rounded-2xl bg-bg p-2"><dt className="eyebrow text-muted">Total</dt><dd className="font-display text-xl font-semibold tabular-nums">{r.total}</dd></div>
                </dl>
                <p className="mt-3 text-xs font-semibold text-muted">
                  {r.idleDays === null ? "Todavía no ha practicado." : r.idleDays === 0 ? "Última actividad: hoy." : `Última actividad: hace ${r.idleDays} ${r.idleDays === 1 ? "día" : "días"}.`}
                  {r.weakest && <> Parte más floja: <strong className="text-ink">{partShort(r.weakest.partId)}</strong> ({pct(r.weakest.accuracy)}).</>}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
