"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { buildPlan, isTaskDone, type PlanDay, type PlanTask } from "@/lib/plan";
import { localDay } from "@/lib/progress";
import { clientPrefs, repo, type Attempt } from "@/lib/storage";

export interface PlanSettings {
  examDate: string;
  minutes: number;
  days: number;
}

const DEFAULTS = { minutes: 45, days: 5 };

export function usePlanSettings(): PlanSettings {
  const raw = useSyncExternalStore(
    clientPrefs.subscribe,
    () => JSON.stringify([clientPrefs.get<string>("examDate", ""), clientPrefs.get<number>("planMinutes", DEFAULTS.minutes), clientPrefs.get<number>("planDays", DEFAULTS.days)]),
    () => JSON.stringify(["", DEFAULTS.minutes, DEFAULTS.days]),
  );
  const [examDate, minutes, days] = JSON.parse(raw) as [string, number, number];
  return { examDate, minutes, days };
}

/** Día local del cliente; "" en servidor */
export function useToday(): string {
  return useSyncExternalStore(
    () => () => undefined,
    () => localDay(new Date()),
    () => "",
  );
}

type Done = Record<string, string[]>; // día → claves de tareas marcadas a mano

export function usePlan(length = 7) {
  const settings = usePlanSettings();
  const today = useToday();
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const doneRaw = useSyncExternalStore(
    clientPrefs.subscribe,
    () => JSON.stringify(clientPrefs.get<Done>("planDone", {})),
    () => "{}",
  );
  const manual = JSON.parse(doneRaw) as Done;

  useEffect(() => {
    let cancelled = false;
    repo.listAttempts().then((a) => !cancelled && setAttempts(a));
    return () => {
      cancelled = true;
    };
  }, []);

  const plan: PlanDay[] | null = useMemo(
    () => (today && attempts ? buildPlan({ today, examDate: settings.examDate || undefined, minutesPerDay: settings.minutes, daysPerWeek: settings.days, attempts }, length) : null),
    [today, attempts, settings.examDate, settings.minutes, settings.days, length],
  );

  const keyOf = (t: PlanTask) => `${t.kind}:${t.partId ?? t.paper ?? ""}`;
  const isDone = (t: PlanTask, day: string): boolean => {
    const auto = isTaskDone(t, day, attempts ?? []);
    return auto ?? (manual[day] ?? []).includes(keyOf(t));
  };
  const toggle = (t: PlanTask, day: string) => {
    const k = keyOf(t);
    const cur = manual[day] ?? [];
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
    // Conserva solo los últimos 14 días
    const keep = Object.fromEntries(Object.entries({ ...manual, [day]: next }).sort().slice(-14));
    clientPrefs.set("planDone", keep);
  };

  return { settings, today, plan, isDone, toggle, ready: Boolean(plan) };
}
