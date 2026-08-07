import type { MetadataRoute } from "next";
import { temporadas } from "@/app/data/temporadas";

const BASE_URL = "https://bykanot.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/formaciones`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/kodigoklub`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/podcast`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/temporadas`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/quienes-lo-llevamos`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/aviso-legal`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politica-de-privacidad`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/politica-de-cookies`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terminos-y-condiciones`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const temporadaRoutes: MetadataRoute.Sitemap = temporadas.map((temporada) => ({
    url: `${BASE_URL}/temporadas/${temporada.id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...temporadaRoutes];
}
