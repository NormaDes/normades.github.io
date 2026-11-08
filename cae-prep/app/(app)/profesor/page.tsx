import type { Metadata } from "next";
import { TeacherPanel } from "@/components/library/teacher-panel";

export const metadata: Metadata = { title: "Profesor" };

export default function TeacherPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-accent">Panel del profesor</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">Material para la clase</h1>
      <p className="mb-6 mt-2 max-w-xl text-muted">Sube audios, PDFs, imágenes y enlaces. Los alumnos con sesión iniciada los verán en la biblioteca, en «Material de clase».</p>
      <TeacherPanel />
    </div>
  );
}
