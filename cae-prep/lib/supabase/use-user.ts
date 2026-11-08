"use client";

import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Nombre para mostrar (nombre elegido, nombre de Google o parte local del email) */
export function displayName(u: User): string {
  const m = u.user_metadata ?? {};
  return (m.display_name as string | undefined) || (m.full_name as string | undefined) || (m.name as string | undefined) || u.email?.split("@")[0] || "Mi cuenta";
}

/**
 * Usuario actual: `undefined` mientras carga, `null` si es invitado (o no hay Supabase), o el usuario.
 */
export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(isSupabaseConfigured() ? undefined : null);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getBrowserClient();
    let cancelled = false;
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => !cancelled && setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e: string, session: Session | null) => setUser(session?.user ?? null));
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);
  return user;
}
