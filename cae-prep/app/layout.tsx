import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces } from "next/font/google";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", display: "swap", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: { default: "Englora · Preparación de exámenes de inglés", template: "%s · Englora" },
  description:
    "Englora: prepara tus exámenes de inglés con práctica por partes, simulacros, corrección con IA y explicaciones. Ahora, Cambridge C1 Advanced. Practice, improve, succeed.",
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
    <html lang="es-ES" className={`${display.variable} ${hand.variable}`}>
      <body>
        <a href="#contenido" className="sr-only rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
