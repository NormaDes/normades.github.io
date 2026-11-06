import Link from "next/link";
import { HomeStats } from "@/components/home-stats";
import { PAPERS } from "@/config/exam";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-medium text-brand">Cambridge C1 Advanced · CAE</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Prepara tu examen, parte a parte</h1>
      <p className="mt-3 max-w-xl text-muted">
        Ejercicios con el formato oficial, corrección inmediata y explicaciones de por qué cada respuesta es correcta o falla.
      </p>

      <HomeStats />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/practica/r1" className="rounded-2xl bg-brand p-5 text-brand-ink transition-transform active:scale-[0.99]">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Empezar ahora</p>
          <p className="mt-1 text-lg font-bold">Reading · Parte 1</p>
          <p className="text-sm opacity-90">Multiple-choice cloze</p>
        </Link>
        <Link href="/practica" className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Elegir parte</p>
          <p className="mt-1 text-lg font-bold">Modo práctica</p>
          <p className="text-sm text-muted">Las 18 partes del examen</p>
        </Link>
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-muted">El examen</h2>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface text-sm">
        {PAPERS.map((p) => (
          <li key={p.id} className="flex items-center justify-between px-4 py-3">
            <span className="font-medium">{p.name}</span>
            <span className="text-muted">{p.durationMinutes} min</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
