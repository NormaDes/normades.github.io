import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Englora · English Exam Prep", template: "%s · Englora" },
  description:
    "Englora: prepara el Cambridge C1 Advanced (CAE) con práctica por partes, simulacros, corrección con IA y explicaciones. Practice, improve, succeed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { color: "#f6f4ef" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-ES">
      <body>{children}</body>
    </html>
  );
}
