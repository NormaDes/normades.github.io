"use client";

import { useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** ¿El usuario con sesión es administrador/profesor? (rol en la tabla profiles) */
export function useIsAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;
    getBrowserClient()
      .from("profiles")
      .select("role")
      .maybeSingle()
      .then(({ data }: { data: { role?: string } | null }) => {
        if (!cancelled) setAdmin(data?.role === "admin");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return admin;
}
