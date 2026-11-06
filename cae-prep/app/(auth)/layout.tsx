import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main id="contenido" className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col justify-center px-4 py-10">
      <div className="mb-7 flex justify-center">
        <Logo variant="full" width={300} priority />
      </div>
      {children}
      <SiteFooter />
    </main>
  );
}
