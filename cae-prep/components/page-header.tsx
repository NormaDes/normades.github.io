import type { ReactNode } from "react";

export type Tone = "brand" | "coral" | "mint" | "tangerine" | "grape" | "sun";

const TONES: Record<Tone, { icon: string; eyebrow: string; band: string }> = {
  brand: { icon: "bg-brand text-white shadow-[0_5px_0_var(--brand-dark)]", eyebrow: "text-brand", band: "bg-brand-soft" },
  coral: { icon: "bg-accent text-white shadow-[0_5px_0_var(--accent-dark)]", eyebrow: "text-accent-dark", band: "bg-coral-soft" },
  mint: { icon: "bg-mint text-white shadow-[0_5px_0_var(--mint-dark)]", eyebrow: "text-ok", band: "bg-ok-soft" },
  tangerine: { icon: "bg-tangerine text-white shadow-[0_5px_0_var(--tangerine-dark)]", eyebrow: "text-tangerine-dark", band: "bg-tangerine-soft" },
  grape: { icon: "bg-grape text-white shadow-[0_5px_0_var(--grape-dark)]", eyebrow: "text-grape-dark", band: "bg-grape-soft" },
  sun: { icon: "bg-sun text-[#4d3700] shadow-[0_5px_0_var(--sun-dark)]", eyebrow: "text-[#7a5a00]", band: "bg-sun-soft" },
};

/** Cabecera de página: icono de color, etiqueta, título y descripción. */
export function PageHeader({ icon, tone, eyebrow, title, children }: { icon: ReactNode; tone: Tone; eyebrow: string; title: string; children?: ReactNode }) {
  const t = TONES[tone];
  return (
    <header className="mb-6 flex items-start gap-3 md:mb-8 md:gap-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl md:h-16 md:w-16 ${t.icon}`}>{icon}</span>
      <div className="min-w-0">
        <p className={`eyebrow ${t.eyebrow}`}>{eyebrow}</p>
        <h1 className="mt-0.5 text-2xl leading-tight sm:text-3xl md:text-4xl">{title}</h1>
        {children && <p className="mt-1.5 max-w-xl text-sm font-semibold text-muted md:mt-2 md:text-base">{children}</p>}
      </div>
    </header>
  );
}
