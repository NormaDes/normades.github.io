"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarIcon, HomeIcon, LibraryIcon, MistakesIcon, MockIcon, MoreIcon, PracticeIcon, ProgressIcon, TeacherIcon, VocabIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { UserChip } from "@/components/user-chip";
import { useIsAdmin } from "@/lib/supabase/use-admin";

type Item = { href: string; label: string; Icon: typeof HomeIcon; mobile?: boolean; admin?: boolean };

const ITEMS: Item[] = [
  { href: "/", label: "Inicio", Icon: HomeIcon, mobile: true },
  { href: "/practica", label: "Practicar", Icon: PracticeIcon, mobile: true },
  { href: "/simulacro", label: "Simulacro", Icon: MockIcon },
  { href: "/plan", label: "Plan", Icon: CalendarIcon },
  { href: "/biblioteca", label: "Biblioteca", Icon: LibraryIcon, mobile: true },
  { href: "/vocabulario", label: "Vocabulario", Icon: VocabIcon, mobile: true },
  { href: "/errores", label: "Errores", Icon: MistakesIcon },
  { href: "/progreso", label: "Progreso", Icon: ProgressIcon },
  { href: "/profesor", label: "Profesor", Icon: TeacherIcon, admin: true },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function Nav() {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const [more, setMore] = useState(false);
  const items = ITEMS.filter((i) => !i.admin || isAdmin === true);
  const main = items.filter((i) => i.mobile);
  const rest = items.filter((i) => !i.mobile);
  const moreActive = rest.some((i) => isActive(pathname, i.href));

  return (
    <>
      {/* Escritorio: barra lateral */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-bg px-5 py-7 md:flex">
        <Logo variant="header" width={200} href="/" priority />
        <p className="eyebrow mt-3 text-muted">Cambridge C1 Advanced</p>

        <nav aria-label="Navegación principal" className="mt-7 flex flex-1 flex-col gap-0.5">
          {items.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors ${
                  active ? "bg-surface font-semibold text-ink shadow-[0_0_0_1px_var(--line)]" : "text-muted hover:bg-surface/70 hover:text-ink"
                }`}
              >
                {active && <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-accent" />}
                <Icon width={20} height={20} className={active ? "text-brand" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        <UserChip variant="sidebar" />
        <p className="hand mt-4 text-lg leading-none text-muted">Practice · Improve · Succeed</p>
      </aside>

      {/* Móvil: barra superior con el logo */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur md:hidden">
        <Logo variant="header" width={128} href="/" />
        <UserChip variant="topbar" />
      </header>

      {/* Móvil: hoja «Más» */}
      {more && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Más secciones">
          <button type="button" aria-label="Cerrar" onClick={() => setMore(false)} className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-line bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] pt-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <ul className="grid grid-cols-2 gap-2">
              {rest.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link href={href} onClick={() => setMore(false)} className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 text-[15px] font-medium ${isActive(pathname, href) ? "border-brand bg-brand-soft text-brand" : "border-line"}`}>
                    <Icon width={22} height={22} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Móvil: barra inferior */}
      <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-50 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {main.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} onClick={() => setMore(false)} aria-current={active ? "page" : undefined} className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium ${active ? "text-brand" : "text-muted"}`}>
              {active && <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b bg-accent" />}
              <Icon width={22} height={22} />
              {label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10.5px] font-medium ${moreActive || more ? "text-brand" : "text-muted"}`}>
          {moreActive && <span aria-hidden className="absolute inset-x-4 top-0 h-[3px] rounded-b bg-accent" />}
          <MoreIcon width={22} height={22} />
          Más
        </button>
      </nav>
    </>
  );
}
