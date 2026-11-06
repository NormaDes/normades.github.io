import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[26rem] flex-col justify-center px-4 py-10">
      <div className="mb-7 flex justify-center">
        <Logo variant="full" width={300} priority />
      </div>
      {children}
    </main>
  );
}
