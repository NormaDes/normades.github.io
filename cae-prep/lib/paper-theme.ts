import type { PaperId } from "@/config/exam";

/** Un color por prueba del examen (clases completas para que Tailwind las detecte). */
export const PAPER_THEME: Record<PaperId, { solid: string; soft: string; text: string; border: string; lift: string; label: string }> = {
  reading: { solid: "bg-brand text-white", soft: "bg-brand-soft", text: "text-brand", border: "border-brand/25", lift: "shadow-[0_5px_0_var(--brand-dark)]", label: "azul" },
  writing: { solid: "bg-accent text-white", soft: "bg-coral-soft", text: "text-accent-dark", border: "border-accent/30", lift: "shadow-[0_5px_0_var(--accent-dark)]", label: "coral" },
  listening: { solid: "bg-mint text-white", soft: "bg-ok-soft", text: "text-ok", border: "border-mint/40", lift: "shadow-[0_5px_0_var(--mint-dark)]", label: "verde" },
  speaking: { solid: "bg-tangerine text-white", soft: "bg-tangerine-soft", text: "text-tangerine-dark", border: "border-tangerine/40", lift: "shadow-[0_5px_0_var(--tangerine-dark)]", label: "naranja" },
};
