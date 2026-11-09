import type { Metadata } from "next";
import { BoltIcon, FlameIcon, ListeningIcon, StarIcon, TrophyIcon } from "@/components/icons";
import { WaitlistForm } from "@/components/waitlist-form";

export const metadata: Metadata = {
  title: "Lista de espera",
  description: "Englora: prepara tus exámenes de inglés con práctica por partes, simulacros con tiempos reales y un plan de estudio. Apúntate a la lista de espera.",
  openGraph: {
    title: "Englora · Practice. Improve. Succeed.",
    description: "Preparación de exámenes de inglés: práctica por partes, simulacros y plan de estudio. Apúntate a la lista de espera.",
    type: "website",
    locale: "es_ES",
  },
};

const BENEFITS = [
  { Icon: ListeningIcon, tone: "bg-ok-soft text-ok", icon: "bg-mint text-white", title: "Cada parte del examen", text: "Reading, Writing, Listening y Speaking con el formato oficial y corrección explicada." },
  { Icon: BoltIcon, tone: "bg-tangerine-soft text-tangerine-dark", icon: "bg-tangerine text-white", title: "Simulacros con tiempo real", text: "Una sola cuenta atrás, como el día del examen, y una nota estimada al terminar." },
  { Icon: StarIcon, tone: "bg-grape-soft text-grape-dark", icon: "bg-grape text-white", title: "Plan de estudio a tu medida", text: "Dime la fecha de tu examen y cuánto tiempo tienes: Englora organiza tus semanas." },
  { Icon: TrophyIcon, tone: "bg-brand-soft text-brand", icon: "bg-brand text-white", title: "Hecho para clases", text: "Material de tu profesor, vocabulario con repaso espaciado y tu progreso en un solo sitio." },
];

export default function WaitlistPage() {
  return (
    <div>
      <section className="hero-card px-6 py-10 md:px-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
              <FlameIcon width={14} height={14} /> Lanzamiento próximamente
            </p>
            <h1 className="mt-5 text-[2.4rem] font-semibold leading-[1.05] sm:text-5xl md:text-[3.3rem]">
              Aprueba tu examen de inglés,
              <br />
              <span className="mt-1 inline-block rounded-2xl bg-sun px-3 pb-0.5 text-[#4d3700]">paso a paso</span>
            </h1>
            <p className="mt-5 max-w-md text-base font-semibold leading-relaxed text-white/85">
              Englora está casi lista. Apúntate y serás de los primeros en entrar, con ventajas para los primeros inscritos.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <h2 className="mb-4 mt-12 text-2xl md:text-3xl">Qué vas a encontrar</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {BENEFITS.map((b) => (
          <li key={b.title} className={`flex gap-4 rounded-3xl p-5 ${b.tone}`}>
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${b.icon}`}>
              <b.Icon width={26} height={26} />
            </span>
            <div>
              <p className="font-display text-xl font-semibold leading-tight text-ink">{b.title}</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-muted">{b.text}</p>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-10 rounded-3xl border-2 border-line bg-surface p-6 text-center shadow-card">
        <p className="font-display text-2xl font-semibold">¿Eres profesor/a o tienes una academia?</p>
        <p className="mx-auto mt-2 max-w-lg text-sm font-semibold text-muted">Elige «Academia o centro» al apuntarte y te contactaremos para un piloto gratuito con tu clase.</p>
      </section>
    </div>
  );
}
