import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Plan de estudio" };

export default function Page() {
  return <ComingSoon title="Plan de estudio" description="Tu horario semanal hasta el examen." bullets={["Próximamente"]} />;
}
