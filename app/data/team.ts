export type TeamMember = {
  id: string;
  name: string;
  role: string;
  photo: string;
  instagram: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "ariadna",
    name: "Ariadna",
    role: "Coreógrafa y CEO",
    photo: "/imagenes/equipo/ariadna.jpeg",
    instagram: "https://www.instagram.com/ariadnagnzz",
  },
  {
    id: "enrique",
    name: "Eric",
    role: "Coreógrafo y CEO",
    photo: "/imagenes/equipo/eric.jpeg",
    instagram: "https://www.instagram.com/ericdguezz",
  },
  {
    id: "crew-4",
    name: "Diego",
    role: "Dirección y coordinación",
    photo: "/imagenes/equipo/diego.jpeg",
    instagram: "https://www.instagram.com/diegoogmzzz",
  },
];
