import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Progreso" };

export default function Page() {
  return (
    <ComingSoon
      title="Dashboard de progreso"
      phase={4}
      description="Precisión por parte, evolución en el tiempo, puntos débiles y recomendación diaria."
      bullets={["Racha de días de estudio", "Tipos de error más frecuentes", "Qué practicar hoy según tus resultados"]}
    />
  );
}
