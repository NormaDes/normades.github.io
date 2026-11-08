import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { VocabIcon } from "@/components/icons";
import { VocabApp } from "@/components/vocab/vocab-app";

export const metadata: Metadata = { title: "Vocabulario" };

export default function VocabularyPage() {
  return (
    <div>
      <PageHeader icon={<VocabIcon width={32} height={32} weight="fill" />} tone="grape" eyebrow="Tarjetas de estudio" title="Tu vocabulario">Guarda palabras y expresiones y repásalas justo cuando estás a punto de olvidarlas (repetición espaciada SM-2).</PageHeader>
      <VocabApp />
    </div>
  );
}
