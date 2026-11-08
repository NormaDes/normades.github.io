import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { MistakesIcon } from "@/components/icons";
import { MistakesNotebook } from "@/components/mistakes-notebook";

export const metadata: Metadata = { title: "Cuaderno de errores" };

export default function MistakesPage() {
  return (
    <div>
      <PageHeader icon={<MistakesIcon width={32} height={32} weight="fill" />} tone="coral" eyebrow="Cuaderno de errores" title="Aprende de lo que fallas">Todo lo que has fallado, ordenado por tipo de error. Repite el ejercicio hasta dominarlo.</PageHeader>
      <MistakesNotebook />
    </div>
  );
}
