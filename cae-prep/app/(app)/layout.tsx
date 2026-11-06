import { Nav } from "@/components/nav";
import { SiteFooter } from "@/components/site-footer";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto min-h-dvh max-w-[1180px] md:flex">
      <Nav />
      <main id="contenido" className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-14 md:pt-10">
        {children}
        <SiteFooter />
      </main>
    </div>
  );
}
