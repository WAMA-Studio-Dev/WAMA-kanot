export type Horario = {
  dia: string;
  hora: string;
  clase: string;
};

export const clubPhotos: string[] = [
  "https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1600&auto=format&fit=crop",
];

export const horarios: Horario[] = [
  { dia: "Lunes", hora: "18:00 - 19:30", clase: "Iniciación urbana" },
  { dia: "Miércoles", hora: "19:00 - 20:30", clase: "Coreografía crew" },
  { dia: "Jueves", hora: "18:00 - 19:30", clase: "Técnica avanzada" },
  { dia: "Sábado", hora: "11:00 - 13:00", clase: "Open class + freestyle" },
];
