import type { Metadata, Viewport } from "next";
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
      <body>{children}</body>
    </html>
  );
}
