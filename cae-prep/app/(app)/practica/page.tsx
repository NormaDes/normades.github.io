import type { Metadata } from "next";
import { PracticeIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { PracticeBrowser } from "@/components/practice/practice-browser";

export const metadata: Metadata = { title: "Practicar" };

export default function PracticePage() {
  return (
    <div>
      <PageHeader icon={<PracticeIcon width={32} height={32} weight="fill" />} tone="coral" eyebrow="Modo práctica" title="Elige qué quieres practicar">
        Toca una prueba y elige la parte. Formato oficial, temporizador opcional y corrección explicada.
      </PageHeader>
      <PracticeBrowser />
    </div>
  );
}
