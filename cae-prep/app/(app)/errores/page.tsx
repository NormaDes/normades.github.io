import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Cuaderno de errores" };

export default function Page() {
  return (
    <ComingSoon
      title="Cuaderno de errores"
      phase={4}
      description="Ya se guardan todas tus respuestas falladas (en este dispositivo). En la Fase 4 podrás revisarlas y repetirlas."
      bullets={["Filtra por parte y por tipo de error", "Repite solo lo que fallaste", "Marca como resuelto cuando lo domines"]}
    />
  );
}
