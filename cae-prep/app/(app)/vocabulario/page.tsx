import type { Metadata } from "next";
import { VocabApp } from "@/components/vocab/vocab-app";

export const metadata: Metadata = { title: "Vocabulario" };

export default function VocabularyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-accent">Tarjetas de estudio</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Tu vocabulario</h1>
      <p className="mb-6 mt-2 max-w-xl text-muted">Guarda palabras y expresiones y repásalas justo cuando estás a punto de olvidarlas (repetición espaciada SM-2).</p>
      <VocabApp />
    </div>
  );
}
