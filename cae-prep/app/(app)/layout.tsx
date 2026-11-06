import { Nav } from "@/components/nav";
import { UserChip } from "@/components/user-chip";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl">
      <Nav />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-12 md:pt-6">
        <UserChip />
        {children}
      </main>
    </div>
  );
}
