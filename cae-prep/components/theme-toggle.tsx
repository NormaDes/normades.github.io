"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { clientPrefs } from "@/lib/storage";

const query = () => window.matchMedia("(prefers-color-scheme: dark)");

/** Modo claro u oscuro: sigue al sistema hasta que eliges uno; la elección se recuerda en este dispositivo. */
export function ThemeToggle() {
  const pref = useSyncExternalStore(
    clientPrefs.subscribe,
    () => clientPrefs.get<string>("theme", ""),
    () => "",
  );
  const system = useSyncExternalStore(
    (cb) => {
      const m = query();
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => query().matches,
    () => false,
  );
  const dark = pref ? pref === "dark" : system;

  const toggle = () => {
    const next = dark ? "light" : "dark";
    clientPrefs.set("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={dark} aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"} title={dark ? "Modo claro" : "Modo oscuro"} className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-line bg-surface text-muted hover:text-ink">
      {dark ? <SunIcon width={22} height={22} /> : <MoonIcon width={20} height={20} />}
    </button>
  );
}
