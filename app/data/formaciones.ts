export type Formacion = {
  id: string;
  titulo: string;
  fecha: string;
  ubicacion: string;
  horario?: string;
  nivel: string;
  profesores: string[];
  temario: string[];
  finalizada?: boolean;
};

export const formaciones: Formacion[] = [
  {
    id: "formacion-noviembre",
    titulo: "Formación Noviembre",
    fecha: "7 de noviembre de 2026",
    ubicacion: "Star Factory Sevilla",
    nivel: "Inicio-Medio",
    profesores: ["Adrián Franco"],
    temario: ["Estilo: Hip-Hop"],
    finalizada: true,
  },
  {
    id: "formacion-diciembre",
    titulo: "Formación Diciembre",
    fecha: "20 de diciembre de 2026",
    ubicacion: "Sevilla Dance Center",
    horario: "Horario por confirmar",
    nivel: "Intermedio/Avanzado",
    profesores: ["Caro BM"],
    temario: ["Estilo: Hip-Hop"],
  },
  {
    id: "formacion-enero",
    titulo: "Formación Enero",
    fecha: "Enero 2027",
    ubicacion: "Lugar todavía sin concretar",
    horario: "Horario pendiente de definir",
    nivel: "Aún sin determinar",
    profesores: ["Equipo docente por anunciar"],
    temario: ["El contenido se revelará más adelante"],
  },
];
