import type { ReactNode } from "react";
import { SparkleIcon } from "@/components/icons";

/** Tarjeta héroe: azul vivo con formas de color (portadas y resultados). */
export function HeroCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`hero-card ${className}`}>{children}</section>;
}

/** Consejo del profe: burbuja amarilla con icono. */
export function TipBubble({ title = "Consejo del día", children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <aside className={`relative rounded-3xl border-2 border-sun-dark/30 bg-sun-soft p-5 shadow-[0_4px_0_rgba(217,159,0,0.35)] ${className}`}>
      <p className="flex items-center gap-2 font-display text-lg font-semibold text-[#6b4b00]">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun text-[#6b4b00]">
          <SparkleIcon width={18} height={18} />
        </span>
        {title}
      </p>
      <p className="mt-2 text-[15px] font-semibold leading-snug text-[#4d3700]">{children}</p>
    </aside>
  );
}

/** Insignia de nota: círculo con degradado y anillo. */
export function ScoreBadge({ value, max, caption, className = "" }: { value: string | number; max?: string | number; caption?: string; className?: string }) {
  return (
    <div className={`relative flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full bg-white text-ink shadow-[0_6px_0_rgba(0,0,0,0.18)] ring-8 ring-white/30 ${className}`} role="img" aria-label={`Nota: ${value}${max ? ` sobre ${max}` : ""}`}>
      <span className="font-display text-[2.6rem] font-semibold leading-none">
        {value}
        {max !== undefined && <span className="text-lg text-muted">/{max}</span>}
      </span>
      {caption && <span className="mt-1 rounded-full bg-sun px-2.5 py-0.5 text-xs font-extrabold text-[#4d3700]">{caption}</span>}
    </div>
  );
}
