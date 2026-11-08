"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowIcon, BoltIcon, FlameIcon, StarIcon, TrophyIcon } from "@/components/icons";
import { getPart } from "@/config/exam";
import { computeProgress } from "@/lib/progress";
import { repo, type Attempt } from "@/lib/storage";

export function HomeStats() {
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.listAttempts().then((a) => !cancelled && setAttempts(a));
    return () => {
      cancelled = true;
    };
  }, []);

  const p = attempts ? computeProgress(attempts) : null;
  const streak = p?.streak ?? 0;
  const today = p?.heat.at(-1)?.count ?? 0;

  const items = [
    { label: "Racha", value: attempts ? String(streak) : "-", unit: streak === 1 ? "día" : "días", Icon: FlameIcon, tone: "bg-tangerine-soft text-tangerine-dark", icon: "bg-tangerine text-white" },
    { label: "Hoy", value: attempts ? String(today) : "-", unit: "ejercicios", Icon: BoltIcon, tone: "bg-brand-soft text-brand", icon: "bg-brand text-white" },
    { label: "Total", value: p ? String(p.totalAttempts) : "-", unit: "ejercicios", Icon: TrophyIcon, tone: "bg-grape-soft text-grape-dark", icon: "bg-grape text-white" },
    { label: "Acierto", value: p?.accuracy != null ? `${Math.round(p.accuracy * 100)}` : "-", unit: "%", Icon: StarIcon, tone: "bg-ok-soft text-ok", icon: "bg-mint text-white" },
  ];

  const s = p?.suggestion ?? null;
  const part = s ? getPart(s.partId) : null;

  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className={`rounded-3xl p-4 ${i.tone}`}>
            <dt className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full ${i.icon}`}>
                <i.Icon width={17} height={17} />
              </span>
              <span className="eyebrow">{i.label}</span>
            </dt>
            <dd className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-semibold leading-none tabular-nums text-ink">{i.value}</span>
              <span className="text-xs font-bold">{i.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      {s && part && (
        <Link
          href={`/practica/${s.partId}`}
          className="group mt-4 flex items-center gap-4 rounded-3xl border-2 border-line bg-surface p-4 shadow-card transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-white shadow-[0_4px_0_var(--accent-dark)]">
            <BoltIcon width={24} height={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-accent-dark">Tu tarea de hoy</p>
            <p className="mt-0.5 font-display text-xl font-semibold leading-snug">{part.name}</p>
            <p className="text-sm font-semibold text-muted">{s.reason}</p>
          </div>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink transition-transform group-hover:translate-x-0.5">
            <ArrowIcon width={20} height={20} />
          </span>
        </Link>
      )}
    </div>
  );
}
