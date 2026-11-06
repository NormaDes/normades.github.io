"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { PARTS, getPart, type PartId } from "@/config/exam";
import { repo, type Attempt } from "@/lib/storage";

const dayOf = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function computeStreak(days: Set<string>): number {
  let streak = 0;
  const d = new Date();
  // Si hoy aún no has practicado, la racha cuenta desde ayer
  if (!days.has(dayOf(d.toISOString()))) d.setDate(d.getDate() - 1);
  while (days.has(dayOf(d.toISOString()))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/** Qué practicar hoy: la parte más floja (con ≥2 intentos) o, si no hay, la primera sin tocar */
function suggest(attempts: Attempt[]): { partId: PartId; reason: string } {
  const byPart = new Map<PartId, { ok: number; total: number; n: number }>();
  for (const a of attempts) {
    const cur = byPart.get(a.partId) ?? { ok: 0, total: 0, n: 0 };
    byPart.set(a.partId, { ok: cur.ok + a.correctCount, total: cur.total + a.total, n: cur.n + 1 });
  }
  const weak = [...byPart.entries()]
    .filter(([, v]) => v.n >= 2 && v.total > 0)
    .map(([id, v]) => ({ id, acc: v.ok / v.total }))
    .sort((a, b) => a.acc - b.acc)[0];
  if (weak && weak.acc < 0.85) {
    return { partId: weak.id, reason: `Tu acierto aquí es del ${Math.round(weak.acc * 100)} %: es donde más puedes subir.` };
  }
  const untouched = PARTS.find((p) => !byPart.has(p.id));
  if (untouched && attempts.length) return { partId: untouched.id, reason: "Aún no has practicado esta parte del examen." };
  return { partId: "r1", reason: "Un buen punto de partida: vocabulario y colocaciones en contexto." };
}

export function HomeStats() {
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.listAttempts().then((a) => !cancelled && setAttempts(a));
    return () => {
      cancelled = true;
    };
  }, []);

  const days = new Set((attempts ?? []).map((a) => dayOf(a.createdAt)));
  const correct = (attempts ?? []).reduce((a, x) => a + x.correctCount, 0);
  const total = (attempts ?? []).reduce((a, x) => a + x.total, 0);
  const streak = attempts ? computeStreak(days) : 0;
  const today = (attempts ?? []).filter((a) => dayOf(a.createdAt) === dayOf(new Date().toISOString())).length;

  const items = [
    { label: "Racha", value: attempts ? String(streak) : "–", unit: streak === 1 ? "día" : "días" },
    { label: "Hoy", value: attempts ? String(today) : "–", unit: "ejercicios" },
    { label: "Total", value: attempts ? String((attempts ?? []).length) : "–", unit: "ejercicios" },
    { label: "Acierto", value: attempts && total ? `${Math.round((correct / total) * 100)}` : "–", unit: "%" },
  ];

  const s = attempts ? suggest(attempts) : null;
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
