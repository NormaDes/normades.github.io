"use client";

import { useEffect, useState } from "react";
import type { PartId } from "@/config/exam";
import { repo, type Attempt } from "@/lib/storage";

let cache: Promise<Attempt[]> | null = null;
const load = () => (cache ??= repo.listAttempts().catch(() => []));

/** Acierto acumulado en una parte (o «Sin hacer»). Los intentos se cargan una sola vez para toda la lista. */
export function PartBadge({ partId }: { partId: PartId }) {
  const [stat, setStat] = useState<{ n: number; pct: number } | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    load().then((all) => {
      if (cancelled) return;
      const mine = all.filter((a) => a.partId === partId);
      const max = mine.reduce((s, a) => s + a.maxMarks, 0);
      setStat(mine.length && max ? { n: mine.length, pct: Math.round((mine.reduce((s, a) => s + a.marks, 0) / max) * 100) } : null);
    });
    return () => {
      cancelled = true;
    };
  }, [partId]);

  if (stat === undefined) return <span className="h-6 w-14 shrink-0 animate-pulse rounded-md bg-line/60" aria-hidden />;
  if (stat === null) return <span className="shrink-0 rounded-md bg-bg px-2 py-1 text-[11px] font-semibold text-muted">Sin hacer</span>;
  const tone = stat.pct >= 80 ? "bg-ok-soft text-ok" : stat.pct >= 60 ? "bg-warn-soft text-[#7a5a00]" : "bg-bad-soft text-bad";
  return (
    <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold tabular-nums ${tone}`} title={`${stat.n} ${stat.n === 1 ? "intento" : "intentos"}`}>
      {stat.pct} %
    </span>
  );
}
