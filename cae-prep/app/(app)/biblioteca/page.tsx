import type { Metadata } from "next";
import { LibraryApp } from "@/components/library/library-app";

export const metadata: Metadata = { title: "Biblioteca" };

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow text-accent">Biblioteca de clase</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Lee, escucha y aprende con material real</h1>
      <p className="mb-6 mt-2 max-w-xl text-muted">Artículos, vídeos, podcasts y el material que sube tu profesor. Selecciona palabras mientras lees y conviértelas en ejercicios.</p>
      <LibraryApp />
    </div>
  );
}
