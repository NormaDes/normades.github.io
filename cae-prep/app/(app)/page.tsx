import Link from "next/link";
import { HeroCard, TipBubble } from "@/components/brand-ui";
import { ExamPapers } from "@/components/exam-papers";
import { ExamPicker } from "@/components/exam-picker";
import { Greeting } from "@/components/greeting";
import { GuestBanner } from "@/components/guest-banner";
import { HeroStickers } from "@/components/hero-stickers";
import { HeroPanel } from "@/components/hero-panel";
import { HomeStats } from "@/components/home-stats";
import { ArrowIcon } from "@/components/icons";
import { tipOfTheDay } from "@/lib/tips";

export default function Home() {
  const tip = tipOfTheDay();
  return (
    <div>
      <HeroCard className="px-6 py-8 md:px-10 md:py-10">
        <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
          <div className="relative">
            <HeroStickers />
            <Greeting />
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] sm:text-5xl md:text-[3.6rem] md:leading-[1.08]">
              Practice.
              <br />
              Improve.
              <br />
              <span className="mt-1 inline-block rounded-2xl bg-sun px-3 pb-0.5 text-[#4d3700]">Succeed!</span>
            </h1>
            <p className="mt-5 max-w-sm text-base font-semibold leading-relaxed text-white/85">
              Ejercicios con el formato oficial, corrección al momento y la explicación de por qué cada respuesta acierta o falla.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/practica" className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-2xl bg-white px-6 text-base font-extrabold text-brand">
                Empezar a practicar
                <ArrowIcon width={20} height={20} />
              </Link>
              <Link href="/simulacro" className="inline-flex min-h-[3.25rem] items-center rounded-2xl border-2 border-white/50 px-6 text-base font-bold text-white hover:bg-white/10">
                Hacer un simulacro
              </Link>
            </div>
          </div>
          <HeroPanel />
        </div>
      </HeroCard>

      <GuestBanner />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <HomeStats />
        <TipBubble>{tip}</TipBubble>
      </div>

      <ExamPapers />

      <section className="mt-12 flex flex-wrap items-center gap-4 rounded-3xl border-2 border-sun-dark/30 bg-sun-soft p-5 shadow-[0_4px_0_rgba(217,159,0,0.35)]">
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold text-[#4d3700]">Englora abre pronto al público</p>
          <p className="text-sm font-semibold text-[#6b4b00]">Apúntate a la lista de espera y recibe ventajas de los primeros inscritos.</p>
        </div>
        <Link href="/lista-espera" className="inline-flex min-h-12 items-center whitespace-nowrap rounded-2xl bg-ink px-5 text-sm font-extrabold text-white">Apuntarme</Link>
      </section>

      <ExamPicker />
    </div>
  );
}
