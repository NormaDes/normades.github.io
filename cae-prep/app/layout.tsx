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
      <body>
        <a href="#contenido" className="sr-only rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
