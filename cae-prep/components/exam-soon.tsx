"use client";

import Link from "next/link";
import { DEFAULT_EXAM, EXAMS, type ExamId } from "@/config/exam";
import { setExam } from "@/lib/use-exam";

/** Aviso para funciones que aún no están disponibles en el examen elegido. */
export function ExamSoon({ exam, what }: { exam: ExamId; what: string }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-line bg-surface p-8 text-center">
      <p className="font-display text-2xl font-semibold">{what} de {EXAMS[exam].name}: próximamente</p>
      <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-muted">Ahora puedes practicar Reading y Writing de {EXAMS[exam].name} por partes. {what} está disponible para {EXAMS[DEFAULT_EXAM].name}.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link href="/practica" className="inline-flex min-h-12 items-center rounded-2xl bg-brand px-6 text-sm font-extrabold text-brand-ink">Practicar {EXAMS[exam].name}</Link>
        <button type="button" onClick={() => setExam(DEFAULT_EXAM)} className="inline-flex min-h-12 items-center rounded-2xl border-2 border-line px-6 text-sm font-extrabold hover:bg-bg">Cambiar a {EXAMS[DEFAULT_EXAM].name}</button>
      </div>
    </div>
  );
}
