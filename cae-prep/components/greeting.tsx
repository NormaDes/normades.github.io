"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const hourNow = () => new Date().getHours();

/** «Good morning, Ana.» — saludo en inglés según la hora, con una línea en español. */
export function Greeting() {
  const hour = useSyncExternalStore(
    () => () => undefined,
    hourNow,
    () => -1,
  );
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getBrowserClient()
      .auth.getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        const u = data.user;
        if (u) setName(((u.user_metadata?.display_name as string | undefined) || u.email?.split("@")[0] || "").split(" ")[0] || null);
      });
  }, []);

  if (hour < 0) return <p className="hand text-3xl leading-none text-white/90 md:text-4xl">&nbsp;</p>;

  const hello = hour < 12 ? "Good morning" : hour < 20 ? "Good afternoon" : "Good evening";
  const es = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  return (
    <>
      <p className="hand text-3xl leading-none text-white md:text-4xl">
        {hello}
        {name ? `, ${name}` : ""}!
      </p>
      <p className="eyebrow mt-2 text-white/60">{es} · empieza la clase</p>
    </>
  );
}
