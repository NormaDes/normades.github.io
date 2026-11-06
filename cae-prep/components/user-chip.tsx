"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Nombre del usuario y botón «Salir». No se muestra si Supabase no está configurado (modo local). */
export function UserChip() {
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

  return (
    <div className="mb-4 flex items-center justify-end gap-3 text-sm">
      <span className="truncate text-muted">
        Hola, <strong className="text-ink">{name}</strong>
      </span>
      <button type="button" onClick={logout} className="min-h-9 rounded-lg border border-line px-3 text-xs font-semibold hover:border-brand">
        Salir
      </button>
    </div>
  );
}
