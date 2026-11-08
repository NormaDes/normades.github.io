import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main id="contenido" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
      <Logo variant="full" width={260} />
      <p className="eyebrow mt-10 text-accent">Error 404</p>
      <h1 className="mt-1 font-display text-3xl font-bold">Esta página no existe</h1>
      <p className="mt-2 text-muted">Puede que el enlace esté mal escrito o que el contenido se haya movido.</p>
      <Link href="/" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-brand px-6 text-sm font-semibold text-brand-ink">
        Volver al inicio
      </Link>
    </main>
  );
}
