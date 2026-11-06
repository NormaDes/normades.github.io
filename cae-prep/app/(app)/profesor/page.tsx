import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Profesor" };

export default function Page() {
  return <ComingSoon title="Panel del profesor" description="Sube material para la clase." bullets={["Próximamente"]} />;
}
