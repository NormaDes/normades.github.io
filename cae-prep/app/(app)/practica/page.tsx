import type { Metadata } from "next";
import Link from "next/link";
import { ChevronIcon, ClockIcon, PAPER_ICONS } from "@/components/icons";
import { PAPERS, partsOfPaper } from "@/config/exam";
import { isImplemented } from "@/lib/schemas";

export const metadata: Metadata = { title: "Practicar" };

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-accent">Modo práctica</p>
      <h1 className="mt-1 font-serif text-3xl font-bold md:text-4xl">Elige una parte del examen</h1>
      <p className="mt-2 max-w-xl text-muted">Cada parte con el formato oficial, temporizador opcional y corrección explicada.</p>

      {PAPERS.map((paper) => {
        const Icon = PAPER_ICONS[paper.id];
        return (
          <section key={paper.id} id={paper.id} className="mt-10 scroll-mt-20">
            <div className="flex items-center gap-3 border-b-2 border-ink pb-2">
              <Icon width={22} height={22} className="text-brand" />
              <h2 className="font-serif text-xl font-bold">{paper.name}</h2>
              <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-muted">
                <ClockIcon width={15} height={15} />
                {paper.durationMinutes} min
              </span>
            </div>

            <ul className="divide-y divide-line border-b border-line bg-surface">
              {partsOfPaper(paper.id).map((p) => {
                const ready = isImplemented(p.id);
                const inner = (
                  <>
                    <span className="w-9 shrink-0 text-center font-serif text-3xl font-bold leading-none text-brand/80">{p.number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug">{p.name}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-muted">{p.description}</span>
                      <span className="eyebrow mt-1.5 block text-muted/80">
                        {p.marksPerQuestion > 0 && p.questionCount > 1 ? `${p.questionCount} preguntas · ` : ""}~{p.suggestedMinutes} min
                      </span>
                    </span>
                    {ready ? (
                      <ChevronIcon width={20} height={20} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                    ) : (
                      <span className="eyebrow shrink-0 text-muted">Pronto</span>
                    )}
                  </>
                );
                return (
                  <li key={p.id}>
                    {ready ? (
                      <Link href={`/practica/${p.id}`} className="group flex items-center gap-4 px-3 py-4 transition-colors hover:bg-brand-soft/60 md:px-4">
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-4 px-3 py-4 opacity-60 md:px-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
