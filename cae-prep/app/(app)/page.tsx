import Link from "next/link";
import { Chalkboard, TeacherNote } from "@/components/classroom";
import { ExamCountdown } from "@/components/exam-countdown";
import { Greeting } from "@/components/greeting";
import { HomeStats } from "@/components/home-stats";
import { GuestBanner } from "@/components/guest-banner";
import { TodayPlan } from "@/components/plan/today-plan";
import { ArrowIcon, PAPER_ICONS } from "@/components/icons";
import { PAPERS, partsOfPaper } from "@/config/exam";
import { tipOfTheDay } from "@/lib/tips";

const PAPER_BLURB: Record<string, string> = {
  reading: "Textos, huecos y transformaciones. Corrección con la explicación de cada opción.",
  writing: "Essay, carta, informe o reseña, corregidos con los 4 criterios oficiales.",
  listening: "Audios con solo 2 reproducciones, como en el examen.",
  speaking: "Graba tu voz y recibe feedback de gramática, vocabulario y fluidez.",
};

export default function Home() {
  const tip = tipOfTheDay();
  return (
    <div className="mx-auto max-w-4xl">
      {/* La pizarra de hoy */}
      <Chalkboard className="px-6 pb-12 pt-8 md:px-10 md:pb-14 md:pt-10">
        <div aria-hidden className="stripes pointer-events-none absolute inset-y-0 right-0 w-2/5 opacity-70" />
        <Greeting />
        <h1 className="hand relative mt-5 max-w-md text-[3.1rem] leading-[0.98] md:text-[4.2rem]">
          Practice.
          <br />
          Improve.
          <br />
          <span className="chalk-underline inline-block">
            Succeed<span className="text-[#ff8a8f]">!</span>
          </span>
        </h1>
        <p className="relative mt-5 max-w-sm font-sans text-[15px] leading-relaxed text-white/80">
          Hoy en clase: ejercicios con el formato oficial, corrección inmediata y la explicación de por qué cada respuesta es correcta o falla.
        </p>
        <ExamCountdown />
        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link href="/practica" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-ink transition-transform hover:-translate-y-px">
            Entrar a clase
            <ArrowIcon width={18} height={18} />
          </Link>
          <Link href="/plan" className="inline-flex min-h-12 items-center rounded-lg border border-white/35 px-5 text-sm font-semibold text-white hover:bg-white/10">
            Ver mi horario
          </Link>
        </div>
      </Chalkboard>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_17rem] md:items-start">
        <HomeStats />
        <TeacherNote className="mt-2 md:mt-0">{tip}</TeacherNote>
      </div>

      <GuestBanner />
      <TodayPlan />

      <h2 className="mb-3 mt-10 font-serif text-2xl font-bold">Las asignaturas del examen</h2>
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
