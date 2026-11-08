import { HeroCard } from "@/components/brand-ui";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

const PERKS = [
  "Ejercicios nuevos y corrección de Writing y Speaking con IA",
  "Tu progreso guardado en la nube, en cualquier dispositivo",
  "Material de clase que sube tu profesor",
  "Vocabulario con repaso espaciado y plan de estudio",
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto grid min-h-dvh max-w-[70rem] gap-10 px-4 py-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:px-10">
      <HeroCard className="hidden px-9 py-12 lg:block">
        <p className="font-display text-5xl font-semibold leading-none">Welcome!</p>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80">Entra con tu cuenta y la clase te sigue donde vayas.</p>
        <ul className="mt-8 space-y-4">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-3 text-[15px] leading-snug text-white/90">
              <span aria-hidden className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sun text-sm font-extrabold text-[#4d3700]">✓</span>
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-10 font-display text-3xl font-semibold text-white/90">Practice. Improve. Succeed!</p>
      </HeroCard>

      <main id="contenido" className="mx-auto flex w-full max-w-[26rem] flex-col justify-center">
        <div className="mb-7 flex justify-center">
          <Logo variant="full" width={280} priority />
        </div>
        {children}
        <SiteFooter />
      </main>
    </div>
  );
}
