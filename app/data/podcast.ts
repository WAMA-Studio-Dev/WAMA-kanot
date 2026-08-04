export type Invitado = {
  id: string;
  nombre: string;
  rol: string;
  foto: string;
};

export const youtubeChannelUrl = "https://youtube.com/@bykanot";

export const invitados: Invitado[] = [
  {
    id: "ariadna",
    nombre: "Ariadna",
    rol: "Fundadora de KanotCrew",
    foto: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "enrique",
    nombre: "Enrique",
    rol: "Fundador de KanotCrew",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "invitado-3",
    nombre: "Nora",
    rol: "Coach & bailarina invitada",
    foto: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop",
  },
];
