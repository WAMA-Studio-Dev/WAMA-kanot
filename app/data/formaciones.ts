export type Formacion = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  precio: string;
  foto: string;
};

export const formaciones: Formacion[] = [
  {
    id: "coreografia-avanzada",
    titulo: "Coreografía Avanzada",
    descripcion:
      "Formación intensiva de coreografía y puesta en escena para bailarines con experiencia.",
    fecha: "Septiembre 2026",
    precio: "45€",
    foto: "/imagenes/formaciones/coreografia-avanzada.jpg",
  },
  {
    id: "cultura-urbana",
    titulo: "Cultura Urbana & Freestyle",
    descripcion:
      "Historia, estilos y práctica de freestyle dentro de la cultura urbana contemporánea.",
    fecha: "Noviembre 2026",
    precio: "35€",
    foto: "/imagenes/formaciones/cultura-urbana-freestyle.jpg",
  },
  {
    id: "creacion-contenido",
    titulo: "Creación de Contenido",
    descripcion:
      "Taller práctico de grabación, edición y estrategia de redes para crews y bailarines.",
    fecha: "Febrero 2027",
    precio: "40€",
    foto: "/imagenes/formaciones/creacion-contenido.jpg",
  },
];
