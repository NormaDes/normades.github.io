"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowIcon, PAPER_ICONS } from "@/components/icons";
import { PAPERS, getPart } from "@/config/exam";
import { MOCK_PAPERS, mockParts, type MockRecord } from "@/lib/mock";
import { clientPrefs } from "@/lib/storage";

export function MockHub() {
  // Historial local (JSON) como valor estable para useSyncExternalStore
  const raw = useSyncExternalStore(
    clientPrefs.subscribe,
    () => JSON.stringify(clientPrefs.get<MockRecord[]>("mocks", [])),
    () => "[]",
  );
  const history = JSON.parse(raw) as MockRecord[];

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {MOCK_PAPERS.map((id) => {
          const paper = PAPERS.find((p) => p.id === id)!;
          const Icon = PAPER_ICONS[id];
          const parts = mockParts(id);
          const marks = parts.reduce((a, p) => a + getPart(p).questionCount * getPart(p).marksPerQuestion, 0);
          const last = history.find((h) => h.paper === id);
          return (
            <Link key={id} href={`/simulacro/${id}`} className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_14px_30px_-18px_rgba(1,26,59,0.5)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand"><Icon width={22} height={22} /></span>
              <p className="mt-4 font-display text-xl font-bold leading-tight">{paper.name}</p>
              <p className="eyebrow mt-1 text-accent">{paper.durationMinutes} min · {parts.length} partes · {marks} marcas</p>
              <p className="mt-3 flex-1 text-sm text-muted">
                {last ? <>Último: <strong className="text-ink">{last.scale}</strong> (≈ {last.level}) el {new Date(last.at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</> : "Aún no has hecho este simulacro."}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand group-hover:text-accent">Empezar <ArrowIcon width={16} height={16} /></span>
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted">Speaking no se simula aquí porque necesita un compañero: practica sus 4 partes en <Link href="/practica#speaking" className="font-semibold text-brand underline">Practicar</Link>.</p>

      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold">Historial</h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {history.slice(0, 8).map((h) => (
              <li key={h.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="min-w-0 flex-1 font-semibold">{PAPERS.find((p) => p.id === h.paper)?.name}</span>
                <span className="text-muted">{new Date(h.at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
                <span className="w-24 text-right font-semibold tabular-nums">{h.scale} · {h.level}{!h.assessedAll && "*"}</span>
              </li>
            ))}
          </ul>
          {history.some((h) => !h.assessedAll) && <p className="mt-2 text-xs text-muted">* Alguna parte no se evaluó y no cuenta en la nota.</p>}
        </section>
      )}
    </div>
  );
}
