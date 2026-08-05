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
    rol: "Fundadora de Kanot Krew",
    foto: "/imagenes/podcast/invitado-ariadna.jpg",
  },
  {
    id: "enrique",
    nombre: "Enrique",
    rol: "Fundador de Kanot Krew",
    foto: "/imagenes/podcast/invitado-enrique.jpg",
  },
  {
    id: "invitado-3",
    nombre: "Nora",
    rol: "Coach & bailarina invitada",
    foto: "/imagenes/podcast/invitado-nora.jpg",
  },
];
