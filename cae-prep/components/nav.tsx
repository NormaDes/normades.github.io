"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarIcon, HomeIcon, LibraryIcon, MistakesIcon, MockIcon, MoreIcon, PracticeIcon, ProgressIcon, TeacherIcon, VocabIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { UserChip } from "@/components/user-chip";
import { useIsAdmin } from "@/lib/supabase/use-admin";

type Item = { href: string; label: string; Icon: typeof HomeIcon; mobile?: boolean; admin?: boolean; tone: string };

const ITEMS: Item[] = [
  { href: "/", label: "Inicio", Icon: HomeIcon, mobile: true, tone: "text-brand" },
  { href: "/practica", label: "Practicar", Icon: PracticeIcon, mobile: true, tone: "text-accent-dark" },
  { href: "/simulacro", label: "Simulacro", Icon: MockIcon, tone: "text-tangerine-dark" },
  { href: "/plan", label: "Plan", Icon: CalendarIcon, tone: "text-grape" },
  { href: "/biblioteca", label: "Biblioteca", Icon: LibraryIcon, mobile: true, tone: "text-ok" },
  { href: "/vocabulario", label: "Vocabulario", Icon: VocabIcon, mobile: true, tone: "text-grape" },
  { href: "/errores", label: "Errores", Icon: MistakesIcon, tone: "text-accent-dark" },
  { href: "/progreso", label: "Progreso", Icon: ProgressIcon, tone: "text-brand" },
  { href: "/profesor", label: "Profesor", Icon: TeacherIcon, admin: true, tone: "text-tangerine-dark" },
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
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b-2 border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 md:px-8">
          <Logo variant="header" width={132} href="/" priority />
          <nav aria-label="Navegación principal" className="ml-2 hidden flex-1 items-center gap-0.5 lg:flex">
            {items.map(({ href, label, Icon, tone }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold transition-colors ${active ? "bg-brand-soft text-brand" : "text-muted hover:bg-bg hover:text-ink"}`}
                >
                  <Icon width={22} height={22} weight={active ? "fill" : "duotone"} className={active ? "" : tone} />
                  <span className="hidden xl:inline">{label}</span>
                  <span className="sr-only xl:hidden">{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto lg:ml-0">
            <UserChip variant="bar" />
          </div>
        </div>
      </header>

      {/* Móvil: hoja «Más» */}
      {more && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Más secciones">
          <button type="button" aria-label="Cerrar" onClick={() => setMore(false)} className="absolute inset-0 bg-ink/40" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] border-t-2 border-line bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] pt-4">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
            <ul className="grid grid-cols-2 gap-3">
              {rest.map(({ href, label, Icon, tone }) => (
                <li key={href}>
                  <Link href={href} onClick={() => setMore(false)} className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 text-[15px] font-bold ${isActive(pathname, href) ? "border-brand bg-brand-soft text-brand" : "border-line"}`}>
                    <Icon width={26} height={26} className={tone} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Móvil y tablet: barra inferior */}
      <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-50 flex border-t-2 border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {main.map(({ href, label, Icon, tone }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} onClick={() => setMore(false)} aria-current={active ? "page" : undefined} className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${active ? "text-brand" : "text-muted"}`}>
              <span className={`flex h-8 w-12 items-center justify-center rounded-full ${active ? "bg-brand-soft" : ""}`}>
                <Icon width={25} height={25} weight={active ? "fill" : "duotone"} className={active ? "" : tone} />
              </span>
              {label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${moreActive || more ? "text-brand" : "text-muted"}`}>
          <span className={`flex h-8 w-12 items-center justify-center rounded-full ${moreActive || more ? "bg-brand-soft" : ""}`}>
            <MoreIcon width={25} height={25} />
          </span>
          Más
        </button>
      </nav>
    </>
  );
}
