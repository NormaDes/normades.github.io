"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { getPart } from "@/config/exam";
import { computeProgress, localDay, partShort, skillLabel, type DayPoint } from "@/lib/progress";
import { repo, type Attempt } from "@/lib/storage";

const TARGET = 0.8;
const pct = (x: number) => `${Math.round(x * 100)} %`;
const fmtDay = (day: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  new Date(`${day}T12:00:00`).toLocaleDateString("es-ES", opts);

/** Fila de barra horizontal: una sola serie, extremo redondeado, valor al final */
function BarRow({ label, sub, value, detail, mark }: { label: string; sub?: string; value: number; detail: string; mark?: boolean }) {
  return (
    <li className="py-2.5" title={`${label}: ${detail}`}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate">
          <span className="font-semibold">{label}</span>
          {sub && <span className="ml-2 text-muted">{sub}</span>}
        </span>
        <span className="shrink-0 font-semibold tabular-nums">{pct(value)}</span>
      </div>
      <div className="relative mt-1.5 h-2.5 rounded-sm bg-line/70" role="img" aria-label={`${label}: ${detail}`}>
        <div className="h-full rounded-r-[4px] bg-brand" style={{ width: `${Math.max(2, value * 100)}%` }} />
        {mark && <span aria-hidden className="absolute -top-1 bottom-[-4px] w-px bg-ink/50" style={{ left: `${TARGET * 100}%` }} />}
      </div>
      <p className="mt-1 text-[11px] text-muted">{detail}</p>
    </li>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4 md:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Línea de evolución: eje único, trazo fino, rejilla discreta, cruceta y tooltip al pasar el ratón */
function EvolutionChart({ points }: { points: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 230;
  const m = { l: 40, r: 14, t: 14, b: 30 };
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const x = (i: number) => m.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => m.t + (1 - v) * ih;
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.accuracy).toFixed(1)}`).join(" ");
  const h = hover === null ? null : points[hover];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Evolución de tu acierto diario entre el ${fmtDay(points[0].day)} y el ${fmtDay(points.at(-1)!.day)}`}
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
              {Math.round(t * 100)}%
            </text>
          </g>
        ))}
        <line x1={m.l} x2={W - m.r} y1={y(TARGET)} y2={y(TARGET)} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />
        <text x={m.l + 6} y={y(TARGET) - 5} textAnchor="start" fontSize="10.5" fill="var(--accent)">
          objetivo 80 %
        </text>

        {points.length > 1 && <path d={path} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {h && hover !== null && <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={H - m.b} stroke="var(--ink)" strokeWidth="1" opacity="0.25" />}
        {points.map((p, i) => (
          <circle key={p.day} cx={x(i)} cy={y(p.accuracy)} r={hover === i ? 5.5 : 4} fill="var(--brand)" stroke="var(--surface)" strokeWidth="2" />
        ))}

        <text x={x(0)} y={H - 8} textAnchor={points.length === 1 ? "middle" : "start"} fontSize="11" fill="var(--muted)">
          {fmtDay(points[0].day)}
        </text>
        {points.length > 1 && (
          <text x={x(points.length - 1)} y={H - 8} textAnchor="end" fontSize="11" fill="var(--muted)">
            {fmtDay(points.at(-1)!.day)}
          </text>
        )}

        {/* Zonas de contacto más grandes que las marcas */}
        {points.map((p, i) => {
          const half = points.length === 1 ? iw / 2 : iw / (points.length - 1) / 2;
          return <rect key={p.day} x={x(i) - half} y={m.t} width={half * 2} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} onMouseMove={() => setHover(i)} onTouchStart={() => setHover(i)} />;
        })}
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-[0_8px_24px_-10px_rgba(1,26,59,0.45)]"
          style={{ left: `${(x(hover) / W) * 100}%`, top: 0 }}
        >
          <p className="font-semibold">{fmtDay(h.day, { weekday: "short", day: "numeric", month: "long" })}</p>
          <p className="mt-0.5 text-muted">
            Acierto <strong className="text-ink">{pct(h.accuracy)}</strong> · {h.exercises} {h.exercises === 1 ? "ejercicio" : "ejercicios"}
          </p>
        </div>
      )}
    </div>
  );
}

/** Calendario de actividad de 12 semanas: una sola tonalidad, de claro a oscuro */
function Heatmap({ heat }: { heat: Array<{ day: string; count: number }> }) {
  const cell = 15;
  const gap = 3;
  const lead = new Date(`${heat[0].day}T12:00:00`).getDay(); // 0 = domingo
  const offset = (lead + 6) % 7; // semana empieza en lunes
  const cols = Math.ceil((offset + heat.length) / 7);
  const level = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);
  const fills = ["var(--line)", "color-mix(in srgb, var(--brand) 28%, white)", "color-mix(in srgb, var(--brand) 50%, white)", "color-mix(in srgb, var(--brand) 75%, white)", "var(--brand)"];
  const w = cols * (cell + gap) - gap;
  const h = 7 * (cell + gap) - gap;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} style={{ minWidth: w, maxWidth: 420 }} className="w-full" role="img" aria-label="Actividad de las últimas 12 semanas">
          {heat.map((d, i) => {
            const idx = i + offset;
            const col = Math.floor(idx / 7);
            const row = idx % 7;
            return (
              <rect key={d.day} x={col * (cell + gap)} y={row * (cell + gap)} width={cell} height={cell} rx="3" fill={fills[level(d.count)]}>
                <title>{`${d.count} ${d.count === 1 ? "ejercicio" : "ejercicios"} · ${fmtDay(d.day, { day: "numeric", month: "long" })}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
        menos
        {fills.map((f, i) => (
          <span key={i} className="h-3 w-3 rounded-[3px]" style={{ background: f }} />
        ))}
        más
      </div>
    </div>
  );
}

export function ProgressDashboard() {
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.listAttempts().then((a) => !cancelled && setAttempts(a));
    return () => {
      cancelled = true;
    };
  }, []);

  const p = useMemo(() => (attempts ? computeProgress(attempts) : null), [attempts]);

  if (!p) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Cargando tu progreso">
        <div className="h-24 animate-pulse rounded-xl bg-line/60" />
        <div className="h-64 animate-pulse rounded-xl bg-line/60" />
      </div>
    );
  }

  if (!p.totalAttempts) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
        <p className="font-display text-xl font-bold">Aquí verás tu progreso</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Completa tu primer ejercicio y aparecerán tu acierto por parte, tu evolución, tus puntos débiles y tu racha.</p>
        <Link href="/practica" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink">
          Empezar a practicar <ArrowIcon width={18} height={18} />
        </Link>
      </div>
    );
  }

  const kpis = [
    { label: "Ejercicios", value: String(p.totalAttempts), unit: `en ${p.activeDays} ${p.activeDays === 1 ? "día" : "días"}` },
    { label: "Acierto global", value: p.accuracy === null ? "–" : String(Math.round(p.accuracy * 100)), unit: "%" },
    { label: "Racha", value: String(p.streak), unit: `mejor: ${p.bestStreak}` },
    { label: "Tiempo", value: p.minutes >= 60 ? (p.minutes / 60).toFixed(1).replace(".", ",") : String(p.minutes), unit: p.minutes >= 60 ? "horas" : "min" },
  ];

  const weakest = p.parts.length > 1 ? [...p.parts].sort((a, b) => a.accuracy - b.accuracy)[0] : null;
  const sug = getPart(p.suggestion.partId);

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface px-4 py-4">
            <dt className="eyebrow text-muted">{k.label}</dt>
            <dd className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold leading-none tabular-nums">{k.value}</span>
              <span className="text-xs text-muted">{k.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      <Link href={`/practica/${p.suggestion.partId}`} className="group flex items-center gap-4 rounded-xl border border-line border-l-[3px] border-l-accent bg-surface p-4 transition-shadow hover:shadow-[0_10px_28px_-16px_rgba(1,26,59,0.45)]">
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-accent">Recomendación de hoy</p>
          <p className="mt-1 font-display text-lg font-bold leading-snug">{sug.name}</p>
          <p className="mt-0.5 text-sm text-muted">{p.suggestion.reason}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-ink transition-transform group-hover:translate-x-0.5">
          <ArrowIcon width={18} height={18} />
        </span>
      </Link>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Acierto por parte" hint="| = objetivo 80 %">
          <ul className="divide-y divide-line">
            {p.parts.map((s) => (
              <BarRow
                key={s.partId}
                label={partShort(s.partId)}
                sub={getPart(s.partId).name}
                value={s.accuracy}
                detail={`${s.attempts} ${s.attempts === 1 ? "intento" : "intentos"}${weakest?.partId === s.partId ? " · tu parte más floja" : ""}`}
                mark
              />
            ))}
          </ul>
        </Panel>

        <Panel title="Puntos débiles" hint="por tipo de error">
          {p.skills.length ? (
            <ul className="divide-y divide-line">
              {p.skills.slice(0, 6).map((s) => (
                <BarRow key={s.skill} label={skillLabel(s.skill)} value={s.errorRate} detail={`${s.wrong} fallos de ${s.total} preguntas`} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Necesitamos algunos ejercicios más para detectar patrones de error con fiabilidad.</p>
          )}
          <Link href="/errores" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-accent">
            Repasar mi cuaderno de errores <ArrowIcon width={16} height={16} />
          </Link>
        </Panel>
      </div>

      <Panel title="Evolución del acierto" hint="media diaria">
        {p.daily.length >= 2 ? (
          <>
            <EvolutionChart points={p.daily.slice(-30)} />
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-medium text-brand">Ver como tabla</summary>
              <table className="mt-2 w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr><th className="py-1 font-semibold">Día</th><th className="py-1 font-semibold">Acierto</th><th className="py-1 font-semibold">Ejercicios</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {p.daily.slice(-30).map((d) => (
                    <tr key={d.day}><td className="py-1.5">{fmtDay(d.day, { day: "numeric", month: "long" })}</td><td className="py-1.5 tabular-nums">{pct(d.accuracy)}</td><td className="py-1.5 tabular-nums">{d.exercises}</td></tr>
                  ))}
                </tbody>
              </table>
            </details>
          </>
        ) : (
          <p className="text-sm text-muted">Practica en al menos dos días distintos para ver cómo evoluciona tu acierto.</p>
        )}
      </Panel>

      <Panel title="Constancia" hint="últimas 12 semanas">
        <Heatmap heat={p.heat} />
        <p className="mt-3 text-xs text-muted">Hoy es {fmtDay(localDay(new Date()), { weekday: "long", day: "numeric", month: "long" })}. La constancia pesa más que las maratones: mejor 20 minutos al día.</p>
      </Panel>
    </div>
  );
}
