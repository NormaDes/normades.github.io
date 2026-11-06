import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Simulacro" };

export default function Page() {
  return (
    <ComingSoon
      title="Modo simulacro"
      phase={4}
      description="Examen completo por papers con los tiempos reales del examen y puntuación estimada al final."
      bullets={[
        "Reading & Use of English (90 min), Writing (90 min) y Listening (~40 min)",
        "Los tiempos y el nº de preguntas se leen de config/exam.ts",
        "Puntuación estimada por paper y nota CEFR aproximada",
      ]}
    />
  );
}
