import type { Metadata } from "next";
import { MistakesNotebook } from "@/components/mistakes-notebook";

export const metadata: Metadata = { title: "Cuaderno de errores" };

export default function MistakesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-accent">Cuaderno de errores</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Aprende de lo que fallas</h1>
      <p className="mb-6 mt-2 max-w-xl text-muted">Todo lo que has fallado, ordenado por tipo de error. Repite el ejercicio hasta dominarlo.</p>
      <MistakesNotebook />
    </div>
  );
}
