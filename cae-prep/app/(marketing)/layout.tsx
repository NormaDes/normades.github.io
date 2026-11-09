import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto min-h-dvh max-w-[1100px] px-4 py-6 md:px-8">
      <header className="flex items-center justify-between">
        <Logo variant="header" width={150} href="/" priority />
        <Link href="/" className="inline-flex h-11 items-center rounded-xl border-2 border-line bg-white px-4 text-sm font-bold hover:bg-bg">Probar la versión gratis</Link>
      </header>
      <main id="contenido" className="mt-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
