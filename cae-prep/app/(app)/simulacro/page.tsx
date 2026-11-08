import type { Metadata } from "next";
import { MockHub } from "@/components/mock/mock-hub";

export const metadata: Metadata = { title: "Simulacro" };

export default function MockPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-accent">Modo examen</p>
      <h1 className="mt-1 font-serif text-3xl font-bold md:text-4xl">Simulacros con tiempos reales</h1>
      <p className="mb-6 mt-2 max-w-xl text-muted">Un paper completo con una sola cuenta atrás, como el día del examen. Al entregar, corrección y puntuación estimada en la escala Cambridge.</p>
      <MockHub />
    </div>
  );
}
