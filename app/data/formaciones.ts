export type Formacion = {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;
  precio: string;
  foto: string;
  ubicacion: string;
  horario: string;
  nivel: string;
  profesores: string[];
  temario: string[];
};

export const formaciones: Formacion[] = [
  {
    id: "formacion-octubre",
    titulo: "Formación Octubre",
    descripcion: "Arranque de temporada: técnica, coreografía y trabajo en equipo.",
    fecha: "15-17 Octubre 2026",
    precio: "120€",
    foto: "/imagenes/formaciones/proximamente.jpg",
    ubicacion: "Sala ByKanot, Sevilla",
    horario: "Viernes 18:00-21:00 · Sábado y domingo 10:00-14:00",
    nivel: "Todos los niveles",
    profesores: ["Ariadna", "Eric"],
    temario: [
      "Calentamiento y preparación física",
      "Técnica de suelo y giros",
      "Coreografía grupal",
      "Grabación de contenido audiovisual",
    ],
  },
  {
    id: "formacion-diciembre",
    titulo: "Formación Diciembre",
    descripcion: "Freestyle, musicalidad y creación de coreografía original.",
    fecha: "12-14 Diciembre 2026",
    precio: "130€",
    foto: "/imagenes/formaciones/proximamente.jpg",
    ubicacion: "Sala ByKanot, Barcelona",
    horario: "Viernes 18:00-21:00 · Sábado y domingo 10:00-14:00",
    nivel: "Intermedio - Avanzado",
    profesores: ["Ariadna", "Eric"],
    temario: [
      "Musicalidad y freestyle",
      "Composición coreográfica",
      "Trabajo de formaciones y bloques",
      "Sesión de fotos y vídeo grupal",
    ],
  },
  {
    id: "formacion-enero",
    titulo: "Formación Enero",
    descripcion: "Performance, puesta en escena y preparación de competición.",
    fecha: "16-18 Enero 2027",
    precio: "120€",
    foto: "/imagenes/formaciones/proximamente.jpg",
    ubicacion: "Sala ByKanot, Barcelona",
    horario: "Viernes 18:00-21:00 · Sábado y domingo 10:00-14:00",
    nivel: "Todos los niveles",
    profesores: ["Ariadna", "Eric"],
    temario: [
      "Presencia escénica y expresión",
      "Preparación de repertorio de competición",
      "Trabajo en equipo y sincronización",
      "Grabación final y feedback individual",
    ],
  },
];
