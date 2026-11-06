"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="contenido" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow text-accent">Algo ha fallado</p>
      <h1 className="mt-1 font-serif text-3xl font-bold">No hemos podido cargar esta pantalla</h1>
      <p className="mt-2 text-muted">Ha ocurrido un error inesperado. Tu progreso no se ha perdido. Prueba de nuevo y, si persiste, vuelve al inicio.</p>
      {error.digest && <p className="mt-2 text-xs text-muted">Código: {error.digest}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="min-h-12 rounded-lg bg-brand px-6 text-sm font-semibold text-brand-ink">Reintentar</button>
        <Link href="/" className="inline-flex min-h-12 items-center rounded-lg border border-line px-6 text-sm font-semibold">Ir al inicio</Link>
      </div>
    </main>
  );
}
