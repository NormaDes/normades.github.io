import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Vocabulario" };

export default function Page() {
  return (
    <ComingSoon
      title="Banco de vocabulario"
      phase={4}
      description="Todo lo que marques en un texto se guarda con definición, ejemplo y collocations para repasarlo con repetición espaciada."
      bullets={["Repaso con SM-2 simplificado", "Definición, ejemplo y collocations generados con IA", "Importa palabras desde la biblioteca y desde tus errores"]}
    />
  );
}
