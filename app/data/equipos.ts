export type Equipo = {
  id: string;
  nombre: string;
  categoria: string;
  rango: string;
  descripcion: string;
  imagen: string;
  galeria: string[];
};

export const equipos: Equipo[] = [
  {
    id: "knelo",
    nombre: "KNELO",
    categoria: "Infantil",
    rango: "Categoría Infantil · Hasta 12 años",
    descripcion:
      "Los más pequeños de Kanot. Aquí comienzan su camino en la competición desarrollando técnica, coordinación, confianza y trabajo en equipo, siempre disfrutando del proceso.",
    imagen: "/imagenes/equipos/KNELO.png",
    galeria: [
      "/imagenes/temporadas/2026-2027/KANOT 1.jpg",
      "/imagenes/temporadas/2026-2027/KANOT-2.jpg",
      "/imagenes/temporadas/2026-2027/KANOT-3.jpg",
      "/imagenes/temporadas/2026-2027/KANOT-4.jpg",
      "/imagenes/temporadas/2026-2027/KANOT-5.jpg",
    ],
  },
  {
    id: "knot-jr",
    nombre: "KNOT JR",
    categoria: "Junior",
    rango: "Categoría Junior · 12 a 14 años",
    descripcion: "Un equipo donde los bailarines dan un paso más en su formación.",
    imagen: "/imagenes/equipos/KNOT JR.png",
    galeria: [
      "/imagenes/temporadas/2026-2027/IMG_9760.JPG",
      "/imagenes/temporadas/2026-2027/IMG_9766.JPG",
      "/imagenes/temporadas/2026-2027/IMG_9773.JPG",
    ],
  },
  {
    id: "knallas",
    nombre: "KNALLAS",
    categoria: "Youth B",
    rango: "Categoría Youth B · 15 a 17 años",
    descripcion:
      "Nuestro equipo Youth B reúne a bailarines comprometidos con seguir creciendo y compitiendo al máximo nivel.",
    imagen: "/imagenes/equipos/KNALLAS.png",
    galeria: [
      "/imagenes/temporadas/2026-2027/IMG_9775.JPG",
      "/imagenes/temporadas/2026-2027/IMG_9777.JPG",
      "/imagenes/temporadas/2026-2027/IMG_9781.JPG",
      "/imagenes/temporadas/2026-2027/IMG_9786.JPG",
    ],
  },
  {
    id: "kinkis",
    nombre: "KINKIS",
    categoria: "Youth A",
    rango: "Categoría Youth A",
    descripcion:
      "Estamos preparando un nuevo equipo para la crew. Muy pronto compartiremos todos los detalles.",
    imagen: "/imagenes/equipos/PROXIMAMENTE.png",
    galeria: [
      "/imagenes/temporadas/2026-2027/IMG_9789.JPG",
      "/imagenes/temporadas/2026-2027/IMG_9794.JPG",
    ],
  },
  {
    id: "proximo-equipo-2",
    nombre: "Próximamente",
    categoria: "Próximamente",
    rango: "Categoría por anunciar",
    descripcion:
      "Estamos preparando un nuevo equipo para la crew. Muy pronto compartiremos todos los detalles.",
    imagen: "/imagenes/equipos/PROXIMAMENTE (2).png",
    galeria: ["/imagenes/formaciones/proximamente.jpg"],
  },
];
