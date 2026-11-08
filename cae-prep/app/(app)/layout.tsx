import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh">
      <Nav />
      <main id="contenido" className="mx-auto max-w-[1100px] px-4 pb-28 pt-6 md:px-8 md:pb-14 md:pt-10">
        {children}
        <SiteFooter />
      </main>
    </div>
  );
}
