export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "ariadna",
    name: "Ariadna",
    role: "Fundadora & Directora Artística",
    photo: "/imagenes/equipo/ariadna.jpg",
    bio: "Representa a Kanot Krew liderando la dirección artística, la coreografía y la visión de marca.",
  },
  {
    id: "enrique",
    name: "Enrique",
    role: "Fundador & Director de Competición",
    photo: "/imagenes/equipo/enrique.jpg",
    bio: "Al frente del grupo de competición, la formación técnica y la estrategia de temporada.",
  },
  {
    id: "crew-4",
    name: "Diego",
    role: "Bailarín & Creador de Contenido",
    photo: "/imagenes/equipo/diego.jpg",
    bio: "Cultura urbana y creación de contenido audiovisual para la crew.",
  },
];
