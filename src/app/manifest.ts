import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cobrapp Web",
    short_name: "Cobrapp",
    description: "Gestion de prestamos, rutas, cobros y caja.",
    start_url: "/collector",
    scope: "/",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#047857",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
