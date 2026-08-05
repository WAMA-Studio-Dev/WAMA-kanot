export type Formacion = {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  precio: string;
  foto: string;
};

export const formaciones: Formacion[] = [
  {
    id: "coreografia-avanzada",
    titulo: "Próximamente",
    fecha: "Octubre 2026",
    precio: "?",
    foto: "/imagenes/formaciones/proximamente.jpg",
  },
  {
    id: "cultura-urbana",
    titulo: "Próximamente",
    fecha: "Diciembre 2026",
    precio: "?",
    foto: "/imagenes/formaciones/proximamente.jpg",
  },
  {
    id: "creacion-contenido",
    titulo: "Próximamente",
    fecha: "Febrero 2027",
    precio: "?",
    foto: "/imagenes/formaciones/proximamente.jpg",
  },
];
