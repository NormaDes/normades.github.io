import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProgressIcon } from "@/components/icons";
import { ProgressDashboard } from "@/components/progress-dashboard";

export const metadata: Metadata = { title: "Progreso" };

export default function ProgressPage() {
  return (
    <div>
      <PageHeader icon={<ProgressIcon width={32} height={32} weight="fill" />} tone="brand" eyebrow="Tu progreso" title="Cómo vas hacia el examen">Acierto por parte, evolución, tipos de error y constancia, con una recomendación para hoy.</PageHeader>
      <ProgressDashboard />
    </div>
  );
}
