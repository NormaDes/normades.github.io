"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Inicio", icon: "🏠", mobile: true },
  { href: "/practica", label: "Practicar", icon: "✏️", mobile: true },
  { href: "/simulacro", label: "Simulacro", icon: "⏱️", mobile: false },
  { href: "/biblioteca", label: "Biblioteca", icon: "📚", mobile: true },
  { href: "/vocabulario", label: "Vocabulario", icon: "🔤", mobile: true },
  { href: "/errores", label: "Errores", icon: "🔁", mobile: false },
  { href: "/progreso", label: "Progreso", icon: "📈", mobile: true },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Escritorio: barra lateral */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 border-r border-line px-4 py-8 md:flex">
        <Link href="/" className="mb-6 px-3 text-lg font-bold tracking-tight">
          CAE <span className="text-brand">Prep</span>
        </Link>
        {ITEMS.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-brand-soft text-brand" : "text-muted hover:bg-brand-soft/60 hover:text-ink"
              }`}
            >
              <span aria-hidden>{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
        <p className="mt-auto px-3 text-xs text-muted">Cambridge C1 Advanced</p>
      </aside>

      {/* Móvil: barra inferior */}
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {ITEMS.filter((i) => i.mobile).map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
                active ? "text-brand" : "text-muted"
              }`}
            >
              <span aria-hidden className="text-lg leading-none">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
