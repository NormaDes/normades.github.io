"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Nombre del usuario y botón «Salir». No se muestra si Supabase no está configurado (modo local). */
export function UserChip({ variant }: { variant: "sidebar" | "topbar" }) {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const enabled = isSupabaseConfigured();

  useEffect(() => {
    if (!enabled) return;
    getBrowserClient()
      .auth.getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        const u = data.user;
        if (u) setName((u.user_metadata?.display_name as string | undefined) || u.email?.split("@")[0] || "Mi cuenta");
      });
  }, [enabled]);

  if (!enabled || !name) return null;

  const logout = async () => {
    await getBrowserClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const initial = name.charAt(0).toUpperCase();

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
