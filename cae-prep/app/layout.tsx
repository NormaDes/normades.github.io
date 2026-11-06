import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/nav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CAE Prep — Prepara el Cambridge C1 Advanced", template: "%s · CAE Prep" },
  description:
    "Practica el examen Cambridge C1 Advanced (CAE): Reading & Use of English, Writing, Listening y Speaking con corrección y explicaciones.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0f1a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-ES">
      <body>
        <div className="mx-auto flex min-h-dvh max-w-6xl">
          <Nav />
          <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
