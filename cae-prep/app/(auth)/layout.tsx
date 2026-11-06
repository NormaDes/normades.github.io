export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="mb-6 text-center text-xl font-bold tracking-tight">
        CAE <span className="text-brand">Prep</span>
      </p>
      {children}
    </main>
  );
}
