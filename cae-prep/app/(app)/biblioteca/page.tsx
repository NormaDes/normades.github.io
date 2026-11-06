import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Biblioteca" };

export default function Page() {
  return (
    <ComingSoon
      title="Biblioteca de vídeos y artículos reales"
      phase={4}
      description="Artículos reales con licencia (The Guardian, The Conversation, Wikipedia) y vídeos de YouTube con ejercicios generados a partir del texto."
      bullets={[
        "Atribución, autor, fecha, licencia y enlace al original siempre visibles",
        "Lector con resaltado: guarda palabras y frases en tu vocabulario",
        "Botón «Convertir en ejercicio» (Reading 5, 7 y 8) y pegar tu propio artículo",
      ]}
    />
  );
}
