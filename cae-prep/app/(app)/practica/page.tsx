import type { Metadata } from "next";
import Link from "next/link";
import { PAPERS, partsOfPaper } from "@/config/exam";
import { isImplemented } from "@/lib/schemas";

export const metadata: Metadata = { title: "Modo práctica" };

const PHASE: Record<string, number> = { reading: 2, writing: 2, listening: 3, speaking: 3 };

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Modo práctica</h1>
      <p className="mt-2 text-muted">Elige una parte concreta y practica con el formato oficial.</p>

      {PAPERS.map((paper) => (
        <section key={paper.id} className="mt-8">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{paper.name}</h2>
            <span className="text-xs text-muted">{paper.durationMinutes} min</span>
          </div>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {partsOfPaper(paper.id).map((p) => {
              const ready = isImplemented(p.id);
              const body = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">
                      <span className="mr-1.5 text-muted">{p.number}.</span>
                      {p.name}
                    </p>
                    {ready ? (
                      <span className="shrink-0 rounded-full bg-ok-soft px-2 py-0.5 text-[11px] font-semibold text-ok">Listo</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-semibold">
                        Fase {PHASE[paper.id]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-muted">{p.description}</p>
                  <p className="mt-2 text-xs text-muted">
                    {p.questionCount > 1 || paper.id === "reading" || paper.id === "listening" ? `${p.questionCount} preguntas · ` : ""}
                    ~{p.suggestedMinutes} min
                  </p>
                </>
              );
              return (
                <li key={p.id}>
                  {ready ? (
                    <Link
                      href={`/practica/${p.id}`}
                      className="block h-full rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-brand active:scale-[0.995]"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="h-full rounded-2xl border border-dashed border-line bg-surface/50 p-4 opacity-70">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
