"use client";

import { useSyncExternalStore } from "react";
import { displayName, useUser } from "@/lib/supabase/use-user";

const hourNow = () => new Date().getHours();

/** «Good morning, Ana.» — saludo en inglés según la hora, con una línea en español. */
export function Greeting() {
  const hour = useSyncExternalStore(
    () => () => undefined,
    hourNow,
    () => -1,
  );
  const user = useUser();
  const name = user ? displayName(user).split(" ")[0] || null : null;

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
