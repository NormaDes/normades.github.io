"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** ¿El usuario con sesión es administrador/profesor? (rol en la tabla profiles) */
export function useIsAdmin(): boolean | null {
  const [admin, setAdmin] = useState<boolean | null>(isSupabaseConfigured() ? null : false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    const supabase = getBrowserClient();
    supabase.auth
      .getUser()
      .then(async ({ data }: { data: { user: { id: string } | null } }) => {
        if (!data.user) return false;
        // Un admin puede leer todos los perfiles: hay que pedir solo el suyo.
        const { data: row } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
        return (row as { role?: string } | null)?.role === "admin";
      })
      .then((isAdmin: boolean) => {
        if (!cancelled) setAdmin(isAdmin);
      })
      .catch(() => {
        if (!cancelled) setAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return admin;
}
