import Link from "next/link";
import { HomeStats } from "@/components/home-stats";
import { ArrowIcon, PAPER_ICONS } from "@/components/icons";
import { PAPERS, partsOfPaper } from "@/config/exam";

const PAPER_BLURB: Record<string, string> = {
  reading: "Textos, huecos y transformaciones. Corrección con la explicación de cada opción.",
  writing: "Essay, carta, informe o reseña, corregidos con los 4 criterios oficiales.",
  listening: "Audios con solo 2 reproducciones, como en el examen.",
  speaking: "Graba tu voz y recibe feedback de gramática, vocabulario y fluidez.",
};

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Cabecera de marca */}
      <section className="relative overflow-hidden rounded-xl bg-ink px-6 py-9 text-white md:px-10 md:py-12">
        <div aria-hidden className="stripes pointer-events-none absolute inset-y-0 right-0 w-3/5 md:w-1/2" />
        <p className="eyebrow relative text-white/70">Cambridge C1 Advanced · CAE</p>
        <h1 className="relative mt-3 max-w-md font-serif text-4xl font-bold leading-[1.08] md:text-5xl">
          Practice.
          <br />
          Improve.
          <br />
          Succeed<span className="text-accent">.</span>
        </h1>
        <p className="relative mt-4 max-w-sm text-[15px] leading-relaxed text-white/80">
          Ejercicios con el formato oficial, corrección inmediata y explicaciones de por qué cada respuesta es correcta o falla.
        </p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link href="/practica" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink transition-transform hover:-translate-y-px">
            Empezar a practicar
            <ArrowIcon width={18} height={18} />
          </Link>
          <Link href="/practica/r1" className="inline-flex min-h-12 items-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10">
            Reading · Parte 1
          </Link>
        </div>
      </section>

      <div className="mt-6">
        <HomeStats />
      </div>

      <h2 className="mb-3 mt-10 font-serif text-2xl font-bold">El examen, por papers</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PAPERS.map((paper) => {
          const Icon = PAPER_ICONS[paper.id];
          const parts = partsOfPaper(paper.id).length;
          return (
            <Link
              key={paper.id}
              href={`/practica#${paper.id}`}
              className="group flex gap-4 rounded-xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_14px_30px_-18px_rgba(1,26,59,0.5)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon width={22} height={22} />
              </span>
              <div className="min-w-0">
                <p className="font-serif text-lg font-bold leading-tight">{paper.name}</p>
                <p className="eyebrow mt-1 text-accent">
                  {parts} partes · {paper.durationMinutes} min
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{PAPER_BLURB[paper.id]}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
