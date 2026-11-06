import type { MetadataRoute } from "next";

/** Permite «Añadir a la pantalla de inicio» en el móvil y abrir la app a pantalla completa. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Englora · English Exam Prep",
    short_name: "Englora",
    description: "Prepara el Cambridge C1 Advanced: practica, mejora, aprueba.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#011a3b",
    lang: "es-ES",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
