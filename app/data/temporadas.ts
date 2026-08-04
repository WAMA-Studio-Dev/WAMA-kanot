export type Temporada = {
  id: string;
  periodo: string;
  titulo: string;
  descripcion: string;
};

export const temporadas: Temporada[] = [
  {
    id: "2026-2027",
    periodo: "2026 / 2027",
    titulo: "Temporada Kanot",
    descripcion:
      "Grupo de competición, cultura urbana, formación y creación de contenido. Nueva coreografía, nuevos retos y nuevas caras en la crew.",
  },
  {
    id: "2025-2026",
    periodo: "2025 / 2026",
    titulo: "Temporada anterior",
    descripcion:
      "Consolidación de CódigoClub, primeras formaciones abiertas y lanzamiento del podcast de la crew.",
  },
];
