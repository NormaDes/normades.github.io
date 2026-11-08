"use client";

import Link from "next/link";
import { useState } from "react";
import { ClockIcon, PAPER_ICONS } from "@/components/icons";
import { PartBadge } from "@/components/practice/part-badge";
import { PAPERS, partsOfPaper, type PaperId } from "@/config/exam";
import { PAPER_THEME } from "@/lib/paper-theme";
import { isImplemented } from "@/lib/schemas";
import { useQueryParam } from "@/lib/use-query-param";

const SHORT: Record<PaperId, string> = { reading: "Reading", writing: "Writing", listening: "Listening", speaking: "Speaking" };

/** Selector de pruebas (una a la vez) y lista de sus partes como tarjetas grandes. */
export function PracticeBrowser() {
  const fromUrl = useQueryParam("prueba");
  const [picked, setPicked] = useState<PaperId | null>(null);
  const active = (picked ?? (PAPERS.some((p) => p.id === fromUrl) ? (fromUrl as PaperId) : "reading")) as PaperId;
  const paper = PAPERS.find((p) => p.id === active)!;
  const t = PAPER_THEME[active];
  const Icon = PAPER_ICONS[active];

  return (
    <div>
      <div role="tablist" aria-label="Prueba del examen" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {PAPERS.map((p) => {
          const th = PAPER_THEME[p.id];
          const I = PAPER_ICONS[p.id];
          const on = p.id === active;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setPicked(p.id);
                window.history.replaceState(null, "", `?prueba=${p.id}`);
              }}
              className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 px-3.5 text-left font-extrabold transition-all ${on ? `${th.border} ${th.soft} ${th.text}` : "border-line bg-surface text-muted hover:border-brand/30"}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? `${th.solid} ${th.lift}` : "bg-bg"}`}>
                <I width={22} height={22} weight={on ? "fill" : "duotone"} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base">{SHORT[p.id]}</span>
                <span className="block text-[11px] font-bold opacity-70">{partsOfPaper(p.id).length} partes</span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="mt-7" role="tabpanel" aria-label={paper.name}>
        <div className="flex items-center gap-3">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${t.solid} ${t.lift}`}>
            <Icon width={26} height={26} weight="fill" />
          </span>
          <h2 className="text-2xl">{paper.name}</h2>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-muted ring-2 ring-line">
            <ClockIcon width={15} height={15} />
            {paper.durationMinutes} min
          </span>
        </div>

        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {partsOfPaper(active).map((p) => {
            const ready = isImplemented(p.id);
            const inner = (
              <>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-2xl font-semibold ${t.soft} ${t.text}`}>{p.number}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold leading-snug">{p.name}</span>
                  <span className="mt-0.5 block text-sm font-semibold leading-snug text-muted">{p.description}</span>
                  <span className="eyebrow mt-2 block text-muted">
                    {p.marksPerQuestion > 0 && p.questionCount > 1 ? `${p.questionCount} preguntas · ` : ""}~{p.suggestedMinutes} min
                  </span>
                </span>
                {ready ? <PartBadge partId={p.id} /> : <span className="eyebrow shrink-0 text-muted">Pronto</span>}
              </>
            );
            return (
              <li key={p.id}>
                {ready ? (
                  <Link href={`/practica/${p.id}`} className="flex h-full items-start gap-4 rounded-3xl border-2 border-line bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 active:scale-[0.99]">
                    {inner}
                  </Link>
                ) : (
                  <div className="flex h-full items-start gap-4 rounded-3xl border-2 border-dashed border-line p-4 opacity-60">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
