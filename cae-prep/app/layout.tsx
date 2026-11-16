import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const body = Nunito({ subsets: ["latin"], variable: "--nf-body", display: "swap", style: ["normal", "italic"] });
const display = Fredoka({ subsets: ["latin"], variable: "--nf-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Englora · Preparación de exámenes de inglés", template: "%s · Englora" },
  description:
    "Englora: prepara tus exámenes de inglés con práctica por partes, simulacros, corrección con IA y explicaciones. Ahora, Cambridge C1 Advanced. Practice, improve, succeed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1130" },
  ],
};

/** Aplica el tema guardado antes de pintar, para evitar el parpadeo claro/oscuro. */
const THEME_SCRIPT = `try{var t=JSON.parse(localStorage.getItem("cae.v1.pref.theme")||"null");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-ES" className={`${body.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a href="#contenido" className="sr-only rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
