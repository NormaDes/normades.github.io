import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { MockIcon } from "@/components/icons";
import { MockHub } from "@/components/mock/mock-hub";

export const metadata: Metadata = { title: "Simulacro" };

export default function MockPage() {
  return (
    <div>
      <PageHeader icon={<MockIcon width={32} height={32} weight="fill" />} tone="tangerine" eyebrow="Modo examen" title="Simulacros con tiempos reales">Un paper completo con una sola cuenta atrás, como el día del examen. Al entregar, corrección y puntuación estimada en la escala Cambridge.</PageHeader>
      <MockHub />
    </div>
  );
}
