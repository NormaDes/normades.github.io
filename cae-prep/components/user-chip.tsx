"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { displayName, useUser } from "@/lib/supabase/use-user";

/** Usuario con sesión y «Salir»; para invitados, invitación a entrar. Nada si no hay Supabase (modo local). */
export function UserChip({ variant }: { variant: "sidebar" | "topbar" | "bar" }) {
  const router = useRouter();
  const user = useUser();

  if (!isSupabaseConfigured() || user === undefined) return null;

  if (user === null) {
    if (variant === "bar") {
      return (
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden h-10 items-center whitespace-nowrap rounded-xl border-2 border-line px-4 text-sm font-bold text-ink hover:bg-bg sm:flex">Entrar</Link>
          <Link href="/registro" className="flex h-10 items-center whitespace-nowrap rounded-xl bg-brand px-4 text-sm font-bold text-brand-ink">Crear cuenta</Link>
        </div>
      );
    }
    if (variant === "topbar") {
      return (
        <Link href="/login" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-brand-ink">
          Entrar
        </Link>
      );
    }
    return (
      <div className="rounded-lg border border-line bg-surface p-3">
        <p className="text-sm font-semibold">Estás como invitado</p>
        <p className="mt-0.5 text-xs text-muted">Con cuenta: progreso en la nube y material de clase.</p>
        <div className="mt-2.5 flex gap-2">
          <Link href="/login" className="flex-1 rounded-md bg-brand py-2 text-center text-xs font-bold text-brand-ink">Entrar</Link>
          <Link href="/registro" className="flex-1 rounded-md border border-line py-2 text-center text-xs font-semibold">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  const name = displayName(user);
  const logout = async () => {
    await getBrowserClient().auth.signOut();
    router.replace("/");
    router.refresh();
  };
  const initial = name.charAt(0).toUpperCase();

  if (variant === "bar") {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grape text-sm font-extrabold text-white" title={name}>{initial}</span>
        <button type="button" onClick={logout} className="hidden h-10 rounded-xl border-2 border-line px-3 text-sm font-bold text-muted hover:bg-bg hover:text-ink sm:block">Salir</button>
        <button type="button" onClick={logout} aria-label={`Salir (${name})`} className="rounded-xl border-2 border-line px-3 py-2 text-xs font-bold sm:hidden">Salir</button>
      </div>
    );
  }

  if (variant === "topbar") {
    return (
      <button type="button" onClick={logout} aria-label={`Salir (${name})`} className="flex items-center gap-2 rounded-lg border border-line bg-surface py-1 pl-1 pr-2.5 text-xs font-semibold">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-[11px] text-brand-ink">{initial}</span>
        Salir
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-ink">{initial}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <button type="button" onClick={logout} className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
