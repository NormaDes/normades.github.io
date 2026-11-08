import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { LibraryIcon } from "@/components/icons";
import { LibraryApp } from "@/components/library/library-app";

export const metadata: Metadata = { title: "Biblioteca" };

export default function LibraryPage() {
  return (
    <div>
      <PageHeader icon={<LibraryIcon width={32} height={32} weight="fill" />} tone="mint" eyebrow="Biblioteca de clase" title="Lee, escucha y aprende con material real">Artículos, vídeos, podcasts y el material que sube tu profesor. Selecciona palabras mientras lees y conviértelas en ejercicios.</PageHeader>
      <LibraryApp />
    </div>
  );
}
