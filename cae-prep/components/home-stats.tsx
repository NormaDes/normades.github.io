"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/icons";
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
    { label: "Racha", value: attempts ? String(streak) : "–", unit: streak === 1 ? "día" : "días" },
    { label: "Hoy", value: attempts ? String(today) : "–", unit: "ejercicios" },
    { label: "Total", value: p ? String(p.totalAttempts) : "–", unit: "ejercicios" },
    { label: "Acierto", value: p?.accuracy != null ? `${Math.round(p.accuracy * 100)}` : "–", unit: "%" },
  ];

  const s = p?.suggestion ?? null;
  const part = s ? getPart(s.partId) : null;

  return (
    <>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="bg-surface px-4 py-4">
            <dt className="eyebrow text-muted">{i.label}</dt>
            <dd className="mt-1.5 flex items-baseline gap-1.5">
              <span className="font-serif text-3xl font-bold tabular-nums leading-none">{i.value}</span>
              <span className="text-xs text-muted">{i.unit}</span>
            </dd>
          </div>
        ))}
      </dl>

      {s && part && (
        <Link
          href={`/practica/${s.partId}`}
          className="group mt-4 flex items-center gap-4 rounded-xl border border-line border-l-[3px] border-l-accent bg-surface p-4 transition-shadow hover:shadow-[0_10px_28px_-16px_rgba(1,26,59,0.45)]"
        >
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-accent">Sugerencia de hoy</p>
            <p className="mt-1 font-serif text-lg font-bold leading-snug">{part.name}</p>
            <p className="mt-0.5 text-sm text-muted">{s.reason}</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-ink transition-transform group-hover:translate-x-0.5">
            <ArrowIcon width={18} height={18} />
          </span>
        </Link>
      )}
    </>
  );
}
