import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress-dashboard";

export const metadata: Metadata = { title: "Progreso" };

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-accent">Tu progreso</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Cómo vas hacia el examen</h1>
      <p className="mb-6 mt-2 max-w-xl text-muted">Acierto por parte, evolución, tipos de error y constancia, con una recomendación para hoy.</p>
      <ProgressDashboard />
    </div>
  );
}
