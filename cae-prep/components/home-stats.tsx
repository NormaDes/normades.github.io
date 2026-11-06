"use client";

import { useEffect, useState } from "react";
import { repo } from "@/lib/storage";

interface Stats {
  streak: number;
  attempts: number;
  accuracy: number | null;
  today: number;
}

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

export function HomeStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    repo.listAttempts().then((attempts) => {
      const days = new Set(attempts.map((a) => dayOf(a.createdAt)));
      const correct = attempts.reduce((a, x) => a + x.correctCount, 0);
      const total = attempts.reduce((a, x) => a + x.total, 0);
      setStats({
        streak: computeStreak(days),
        attempts: attempts.length,
        accuracy: total ? Math.round((correct / total) * 100) : null,
        today: attempts.filter((a) => dayOf(a.createdAt) === dayOf(new Date().toISOString())).length,
      });
    });
  }, []);

  const items = [
    { label: "Racha", value: stats ? `${stats.streak} ${stats.streak === 1 ? "día" : "días"}` : "–" },
    { label: "Hoy", value: stats ? String(stats.today) : "–" },
    { label: "Ejercicios", value: stats ? String(stats.attempts) : "–" },
    { label: "Precisión", value: stats?.accuracy != null ? `${stats.accuracy}%` : "–" },
  ];

  return (
    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="rounded-2xl border border-line bg-surface p-4">
          <dt className="text-xs font-medium text-muted">{i.label}</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
