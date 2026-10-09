import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KrishiLens Nepal — कृषि बजार मूल्य",
    short_name: "KrishiLens",
    description: "नेपालका १२ वटै प्रमुख कृषि थोक बजारहरूको दैनिक मूल्य तथा बाली निर्णय प्रणाली",
    start_url: "/",
    display: "standalone",
    background_color: "#F8FBF8",
    theme_color: "#064E3B",
    orientation: "portrait-primary",
    scope: "/",
    lang: "ne",
    categories: ["finance", "business", "productivity", "utilities"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
