import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-8">
      <header className="flex items-center justify-between">
        <Logo variant="header" width={150} href="/" />
        <Link href="/" className="text-sm font-semibold text-brand hover:underline">← Volver</Link>
      </header>
      <main id="contenido" className="legal mt-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
