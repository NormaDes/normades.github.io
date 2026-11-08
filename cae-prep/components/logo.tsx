import Image from "next/image";
import Link from "next/link";

type Variant = "header" | "compact" | "full" | "mark";

const FILES: Record<Variant, { src: string; w: number; h: number }> = {
  header: { src: "/brand/logo-header.png", w: 1594, h: 335 },
  compact: { src: "/brand/logo-compact.png", w: 1594, h: 397 },
  full: { src: "/brand/logo-full.png", w: 1594, h: 477 },
  mark: { src: "/brand/logo-mark.png", w: 509, h: 403 },
};

/** Logo de Englora. PNG con fondo transparente. */
export function Logo({ variant = "header", width = 170, href, priority = false }: { variant?: Variant; width?: number; href?: string; priority?: boolean }) {
  const f = FILES[variant];
  const img = (
    <Image src={f.src} alt="Englora" width={width} height={Math.round((width * f.h) / f.w)} priority={priority} style={{ width, height: "auto" }} />
  );
  return href ? (
    <Link href={href} aria-label="Englora, ir al inicio" className="inline-block">
      {img}
    </Link>
  ) : (
    img
  );
}
