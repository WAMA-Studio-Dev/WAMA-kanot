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
    galeria: ["/imagenes/formaciones/proximamente.jpg"],
  },
  {
    id: "knot-jr",
    nombre: "KNOT JR",
    categoria: "Junior",
    rango: "Categoría Junior · 12 a 14 años",
    descripcion: "Un equipo donde los bailarines dan un paso más en su formación.",
    imagen: "/imagenes/equipos/KNOT JR.png",
    galeria: ["/imagenes/formaciones/proximamente.jpg"],
  },
  {
    id: "knallas",
    nombre: "KNALLAS",
    categoria: "Youth",
    rango: "Categoría Youth · 15 a 17 años",
    descripcion:
      "Nuestro equipo Youth reúne a bailarines comprometidos con seguir creciendo y compitiendo al máximo nivel.",
    imagen: "/imagenes/equipos/KNALLAS.png",
    galeria: ["/imagenes/formaciones/proximamente.jpg"],
  },
  {
    id: "kinkis",
    nombre: "KINKIS",
    categoria: "Próximamente",
    rango: "Categoría por anunciar",
    descripcion:
      "Estamos preparando un nuevo equipo para la crew. Muy pronto compartiremos todos los detalles.",
    imagen: "/imagenes/equipos/PROXIMAMENTE.png",
    galeria: ["/imagenes/formaciones/proximamente.jpg"],
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
