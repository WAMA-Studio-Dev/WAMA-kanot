export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  instagram: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "ariadna",
    name: "Ariadna",
    role: "Coreógrafa y CEO",
    photo: "/imagenes/equipo/ariadna.jpeg",
    bio: "Representa a Kanot Krew liderando la dirección artística, la coreografía y la visión de marca.",
    instagram: "https://www.instagram.com/ariadnagnzz",
  },
  {
    id: "enrique",
    name: "Eric",
    role: "Coreógrafo y CEO",
    photo: "/imagenes/equipo/eric.jpeg",
    bio: "Al frente del grupo de competición, la formación técnica y la estrategia de temporada.",
    instagram: "https://www.instagram.com/ericdguezz",
  },
  {
    id: "crew-4",
    name: "Diego",
    role: "Dirección y coordinación",
    photo: "/imagenes/equipo/diego.jpeg",
    bio: "Cultura urbana y creación de contenido audiovisual para la crew.",
    instagram: "https://www.instagram.com/diegoogmzzz",
  },
];
