"use client";

import Link from "next/link";
import { PAPER_ICONS } from "@/components/icons";
import { DEFAULT_EXAM, EXAMS, papersOf, partsOfPaper } from "@/config/exam";
import { PAPER_THEME } from "@/lib/paper-theme";
import { useExam } from "@/lib/use-exam";

const BLURB: Record<string, string> = {
  reading: "Textos, huecos y transformaciones, con la explicación de cada opción.",
  writing: "Essay, carta, informe o reseña, con enunciados al estilo del examen.",
  listening: "Audios con solo 2 reproducciones, como en el examen.",
  speaking: "Graba tu voz y practica las 4 partes con un compañero.",
};

/** Las pruebas del examen elegido (portada). */
export function ExamPapers() {
  const exam = useExam();
  return (
    <section aria-labelledby="papers-title">
      <h2 id="papers-title" className="mb-4 mt-12 text-2xl md:text-3xl">{EXAMS[exam].name} · las pruebas del examen</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {papersOf(exam).map((paper) => {
          const Icon = PAPER_ICONS[paper.id];
          const t = PAPER_THEME[paper.id];
          return (
            <Link key={paper.id} href={`/practica?prueba=${paper.id}`} className={`group flex gap-4 rounded-3xl border-2 ${t.border} ${t.soft} p-5 transition-transform hover:-translate-y-1`}>
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${t.solid} ${t.lift}`}>
                <Icon width={30} height={30} weight="fill" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold leading-tight">{paper.name}</p>
                <p className={`eyebrow mt-1 ${t.text}`}>{partsOfPaper(paper.id, exam).length} partes · {paper.durationMinutes} min</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-muted">{BLURB[paper.id]}</p>
              </div>
            </Link>
          );
        })}
      </div>
      {exam !== DEFAULT_EXAM && <p className="mt-3 text-sm font-semibold text-muted">En {EXAMS[exam].name}, Reading y Writing ya tienen ejercicios; Listening y Speaking llegarán pronto.</p>}
    </section>
  );
}
