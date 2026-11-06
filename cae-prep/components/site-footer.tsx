import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-14 border-t border-line pt-5 text-xs text-muted">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p>
          <strong className="font-semibold text-ink">Englora</strong> · English Exam Prep
        </p>
        <nav aria-label="Información legal" className="flex gap-5">
          <Link href="/privacidad" className="hover:text-ink hover:underline">Privacidad</Link>
          <Link href="/aviso-legal" className="hover:text-ink hover:underline">Aviso legal</Link>
        </nav>
      </div>
      <p className="mt-2 max-w-2xl leading-relaxed">
        Englora es una herramienta de práctica independiente. No está afiliada ni respaldada por Cambridge University Press &amp; Assessment. «C1 Advanced» es una marca de sus titulares.
      </p>
    </footer>
  );
}
