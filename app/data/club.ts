export type Horario = {
  dia: string;
  hora: string;
  clase: string;
};

export const clubPhotos: string[] = [
  "/imagenes/kodigoklub/club-foto-1.jpg",
  "/imagenes/kodigoklub/club-foto-2.jpg",
  "/imagenes/kodigoklub/club-foto-3.jpg",
];

export const horarios: Horario[] = [
  { dia: "Lunes", hora: "18:00 - 19:30", clase: "Iniciación urbana" },
  { dia: "Miércoles", hora: "19:00 - 20:30", clase: "Coreografía crew" },
  { dia: "Jueves", hora: "18:00 - 19:30", clase: "Técnica avanzada" },
  { dia: "Sábado", hora: "11:00 - 13:00", clase: "Open class + freestyle" },
];
