export type Formacion = {
  id: string;
  titulo: string;
  fecha: string;
  precio: string;
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
    fecha: "Octubre 2026",
    precio: "Precio por confirmar",
    ubicacion: "Ubicación pendiente de anunciar",
    horario: "Horario aún sin definir",
    nivel: "Nivel por concretar",
    profesores: ["Anunciaremos el equipo docente pronto"],
    temario: ["Muy pronto compartiremos el temario completo"],
  },
  {
    id: "formacion-diciembre",
    titulo: "Formación Diciembre",
    fecha: "Diciembre 2026",
    precio: "Precio por confirmar",
    ubicacion: "Sede por anunciar",
    horario: "Horario por confirmar",
    nivel: "Nivel pendiente de anunciar",
    profesores: ["Profesorado por confirmar"],
    temario: ["Detalles del temario disponibles próximamente"],
  },
  {
    id: "formacion-enero",
    titulo: "Formación Enero",
    fecha: "Enero 2027",
    precio: "Precio por confirmar",
    ubicacion: "Lugar todavía sin concretar",
    horario: "Horario pendiente de definir",
    nivel: "Aún sin determinar",
    profesores: ["Equipo docente por anunciar"],
    temario: ["El contenido se revelará más adelante"],
  },
];
