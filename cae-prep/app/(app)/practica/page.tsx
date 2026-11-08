import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ClockIcon, PAPER_ICONS, PracticeIcon } from "@/components/icons";
import { PAPERS, partsOfPaper } from "@/config/exam";
import { PartBadge } from "@/components/practice/part-badge";
import { PAPER_THEME } from "@/lib/paper-theme";
import { isImplemented } from "@/lib/schemas";

export const metadata: Metadata = { title: "Practicar" };

export default function PracticePage() {
  return (
    <div>
      <PageHeader icon={<PracticeIcon width={32} height={32} weight="fill" />} tone="coral" eyebrow="Modo práctica" title="Elige una parte del examen">Cada parte con el formato oficial, temporizador opcional y corrección explicada.</PageHeader>

      {PAPERS.map((paper) => {
        const Icon = PAPER_ICONS[paper.id];
        const t = PAPER_THEME[paper.id];
        return (
          <section key={paper.id} id={paper.id} className="mt-10 scroll-mt-24">
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
              {partsOfPaper(paper.id).map((p) => {
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
                    {ready && <PartBadge partId={p.id} />}
                    {!ready && <span className="eyebrow shrink-0 text-muted">Pronto</span>}
                  </>
                );
                return (
                  <li key={p.id}>
                    {ready ? (
                      <Link href={`/practica/${p.id}`} className={`group flex h-full items-start gap-4 rounded-3xl border-2 border-line bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40`}>
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
        );
      })}
    </div>
  );
}
