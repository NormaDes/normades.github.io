"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useUser } from "@/lib/supabase/use-user";

/** Aviso en la portada para invitados: qué se gana con una cuenta gratuita. */
export function GuestBanner() {
  const user = useUser();
  if (!isSupabaseConfigured() || user !== null) return null;
  return (
    <section className="mt-8 rounded-xl border border-line bg-surface p-5">
      <h2 className="font-display text-xl font-bold">Crea una cuenta gratis y desbloquea más</h2>
      <ul className="mt-2 grid gap-1.5 text-sm text-muted sm:grid-cols-2">
        <li>✓ Ejercicios nuevos y corrección de Writing y Speaking con IA</li>
        <li>✓ Tu progreso guardado en la nube, en todos tus dispositivos</li>
        <li>✓ Material de clase del profesor</li>
        <li>✓ Vocabulario enriquecido y conversión de textos en ejercicios</li>
      </ul>
      <p className="mt-2 text-xs text-muted">Sin cuenta puedes seguir practicando, hacer simulacros de Reading y Listening y leer la biblioteca; tu progreso queda en este dispositivo.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/registro" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm font-bold text-brand-ink">Crear cuenta</Link>
        <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-sm font-semibold">Ya tengo cuenta</Link>
      </div>
    </section>
  );
}
