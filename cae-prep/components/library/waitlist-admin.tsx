"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useIsAdmin } from "@/lib/supabase/use-admin";

interface Row { email: string; name: string | null; exam: string; role: string; source: string | null; created_at: string }

/** Resumen de la lista de espera para el administrador (con descarga en CSV). */
export function WaitlistAdmin() {
  const admin = useIsAdmin();
  const [data, setData] = useState<{ count: number; rows: Row[] } | { error: string } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || admin !== true) return;
    let cancelled = false;
    fetch("/api/waitlist", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => !cancelled && setData(j))
      .catch(() => !cancelled && setData({ error: "No se pudo cargar" }));
    return () => {
      cancelled = true;
    };
  }, [admin]);

  if (admin !== true) return null;

  return (
    <section className="mt-10 rounded-3xl border-2 border-line bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl">Lista de espera</h2>
        <a href="/api/waitlist?format=csv" className="inline-flex h-11 items-center rounded-xl border-2 border-line px-4 text-sm font-extrabold hover:bg-bg">Descargar CSV</a>
      </div>
      {!data ? (
        <p className="mt-3 text-sm text-muted">Cargando…</p>
      ) : "error" in data ? (
        <p className="mt-3 rounded-xl bg-bad-soft p-3 text-sm font-semibold text-bad">{data.error}</p>
      ) : (
        <>
          <p className="mt-3 text-sm font-semibold"><span className="font-display text-3xl font-semibold tabular-nums">{data.count}</span> apuntados · enlace para compartir: <code className="rounded bg-bg px-1.5 py-0.5">/lista-espera</code></p>
          <ul className="mt-3 divide-y-2 divide-line text-sm">
            {data.rows.slice(0, 8).map((r) => (
              <li key={r.email} className="flex flex-wrap gap-x-3 py-2">
                <span className="font-bold">{r.email}</span>
                <span className="text-muted">{r.exam} · {r.role}{r.source ? ` · ${r.source}` : ""}</span>
                <span className="ml-auto text-muted">{new Date(r.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
