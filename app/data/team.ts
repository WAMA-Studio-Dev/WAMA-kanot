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
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1200&auto=format&fit=crop",
    bio: "Representa a Kanot Krew liderando la dirección artística, la coreografía y la visión de marca.",
  },
  {
    id: "enrique",
    name: "Enrique",
    role: "Fundador & Director de Competición",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop",
    bio: "Al frente del grupo de competición, la formación técnica y la estrategia de temporada.",
  },
  {
    id: "crew-4",
    name: "Diego",
    role: "Bailarín & Creador de Contenido",
    photo:
      "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=1200&auto=format&fit=crop",
    bio: "Cultura urbana y creación de contenido audiovisual para la crew.",
  },
];
