"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { partShort, skillLabel } from "@/lib/progress";
import { repo, type Mistake } from "@/lib/storage";

type View = "pending" | "resolved" | "all";

const chip = (active: boolean) =>
  `min-h-9 rounded-lg border px-3 text-xs font-semibold transition-colors ${active ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface hover:border-brand"}`;

export function MistakesNotebook() {
  const [mistakes, setMistakes] = useState<Mistake[] | null>(null);
  const [view, setView] = useState<View>("pending");
  const [skill, setSkill] = useState<string>("all");
  const [part, setPart] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    repo.listMistakes().then((m) => !cancelled && setMistakes(m));
    return () => {
      cancelled = true;
    };
  }, []);

  const base = useMemo(() => (mistakes ?? []).filter((m) => (view === "all" ? true : view === "pending" ? !m.resolved : m.resolved)), [mistakes, view]);
  const skills = useMemo(() => {
    const c = new Map<string, number>();
    base.forEach((m) => c.set(m.skill, (c.get(m.skill) ?? 0) + 1));
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [base]);
  const parts = useMemo(() => [...new Set(base.map((m) => m.partId))], [base]);
  const shown = base
    .filter((m) => (skill === "all" || m.skill === skill) && (part === "all" || m.partId === part))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Si el filtro elegido deja de tener datos, volvemos a «todos»
  const safeSkill = skill === "all" || skills.some(([s]) => s === skill) ? skill : "all";
  const safePart = part === "all" || parts.includes(part as Mistake["partId"]) ? part : "all";

  const toggle = async (m: Mistake) => {
    setMistakes((all) => (all ?? []).map((x) => (x.id === m.id ? { ...x, resolved: !x.resolved } : x)));
    await repo.setMistakeResolved(m.id, !m.resolved);
  };

  if (!mistakes) return <div className="h-40 animate-pulse rounded-xl bg-line/60" aria-busy="true" aria-label="Cargando tus errores" />;

  const pending = mistakes.filter((m) => !m.resolved).length;

  if (!mistakes.length) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
        <p className="font-serif text-xl font-bold">Todavía no hay errores guardados</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Cada pregunta que falles aparecerá aquí con tu respuesta y la correcta, para que puedas repetirla cuando quieras.</p>
        <Link href="/practica" className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink">
          Ir a practicar <ArrowIcon width={18} height={18} />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Estado">
        <button type="button" className={chip(view === "pending")} onClick={() => setView("pending")}>Pendientes ({pending})</button>
        <button type="button" className={chip(view === "resolved")} onClick={() => setView("resolved")}>Resueltos ({mistakes.length - pending})</button>
        <button type="button" className={chip(view === "all")} onClick={() => setView("all")}>Todos</button>
        {parts.length > 1 && (
          <select value={safePart} onChange={(e) => setPart(e.target.value)} aria-label="Filtrar por parte" className="ml-auto min-h-9 rounded-lg border border-line bg-surface px-2 text-xs font-semibold">
            <option value="all">Todas las partes</option>
            {parts.map((id) => (
              <option key={id} value={id}>{partShort(id)}</option>
            ))}
          </select>
        )}
      </div>

      {skills.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Tipo de error">
          <button type="button" className={chip(safeSkill === "all")} onClick={() => setSkill("all")}>Todos los tipos</button>
          {skills.map(([s, n]) => (
            <button key={s} type="button" className={chip(safeSkill === s)} onClick={() => setSkill(s)}>
              {skillLabel(s)} · {n}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="mt-6 rounded-xl border border-line bg-surface p-5 text-sm text-muted">
          {view === "pending" ? "¡No tienes errores pendientes! Sigue practicando para seguir mejorando." : "No hay errores con estos filtros."}
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {shown.map((m) => (
            <li key={m.id} className={`p-4 ${m.resolved ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-brand">{partShort(m.partId)}</span>
                <span className="font-medium text-muted">{skillLabel(m.skill)}</span>
                <span className="text-muted">· pregunta {m.n}</span>
                <time className="ml-auto text-muted" dateTime={m.createdAt}>
                  {new Date(m.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </time>
              </div>
              <p className="mt-2 text-sm">
                <span className="text-muted">Tu respuesta: </span>
                <span className="font-semibold text-bad line-through decoration-1">{m.given || "(en blanco)"}</span>
                <span aria-hidden className="mx-2 text-muted">→</span>
                <span className="font-semibold text-ok">{m.expected}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/practica/${m.partId}?ex=${encodeURIComponent(m.exerciseId)}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-brand-ink">
                  Repetir ejercicio <ArrowIcon width={14} height={14} />
                </Link>
                <button type="button" onClick={() => toggle(m)} className="min-h-9 rounded-lg border border-line px-3 text-xs font-semibold hover:border-brand">
                  {m.resolved ? "Volver a pendiente" : "Marcar como resuelto"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted">Al repetir un ejercicio y acertar una pregunta que habías fallado, el error se marca como resuelto automáticamente.</p>
    </div>
  );
}
