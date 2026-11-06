import type { ReactNode } from "react";

/** Pizarra de clase: marco de madera, polvo de tiza y repisa con tizas. */
export function Chalkboard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`chalkboard rounded-xl ${className}`}>
      {children}
      <div aria-hidden className="chalk-tray">
        <i style={{ left: "8%", width: 34, height: 7 }} />
        <i style={{ left: "8%", marginLeft: 44, width: 20, height: 7, background: "#f2b6ba" }} />
        <i style={{ right: "9%", width: 46, height: 11, background: "linear-gradient(#e7d9b6 0 35%, #3d4252 35%)", borderRadius: 3 }} />
      </div>
    </section>
  );
}

/** Nota adhesiva escrita a mano (consejos del profe). */
export function TeacherNote({ title = "Teacher's tip", children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <aside className={`sticky-note rounded-sm px-5 pb-5 pt-6 ${className}`}>
      <p className="hand text-2xl leading-none">{title}</p>
      <p className="hand mt-2 text-[1.35rem] font-medium leading-snug">{children}</p>
    </aside>
  );
}

/** Nota a boli rojo, redondeada a mano, como la que pone un profesor al corregir. */
export function RedPenGrade({ value, max, caption, className = "" }: { value: string | number; max?: string | number; caption?: string; className?: string }) {
  return (
    <div className={`relative inline-flex -rotate-6 flex-col items-center justify-center ${className}`} style={{ width: 132, height: 96 }} role="img" aria-label={`Nota: ${value}${max ? ` sobre ${max}` : ""}`}>
      <svg viewBox="0 0 132 96" className="absolute inset-0 h-full w-full" fill="none" stroke="var(--accent)" strokeWidth="3.2" strokeLinecap="round" aria-hidden>
        <path d="M14 52C10 24 44 8 70 8c30 0 56 14 54 40-2 26-34 42-62 40C34 86 16 76 14 52Z" />
        <path d="M18 56C16 30 48 14 72 14" opacity=".45" />
      </svg>
      <span className="red-pen relative text-[2.2rem] leading-none">
        {value}
        {max !== undefined && <span className="text-xl">/{max}</span>}
      </span>
      {caption && <span className="red-pen relative mt-0.5 text-base leading-none">{caption}</span>}
    </div>
  );
}
