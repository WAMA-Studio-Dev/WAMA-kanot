import { youtubeChannelUrl } from "@/app/data/podcast";

export type PodcastVideo = {
  id: string;
  titulo: string;
  duracion: string;
  miniatura: string;
  url: string;
};

export const podcastVideos: PodcastVideo[] = [
  {
    id: "jose-ballesteros",
    titulo: "José Ballesteros",
    duracion: "--:--",
    miniatura: "/imagenes/podcast/jose-ballesteros.png",
    url: "https://www.youtube.com/watch?v=qdq6g967o60",
  },
  {
    id: "blanca-elias",
    titulo: "Blanca Elías",
    duracion: "--:--",
    miniatura: "/imagenes/podcast/blanca-elias.png",
    url: "https://www.youtube.com/watch?v=AqY0LCtF35U",
  },
  {
    id: "video-3",
    titulo: "Episodio próximamente",
    duracion: "--:--",
    miniatura: "/imagenes/formaciones/proximamente.jpg",
    url: youtubeChannelUrl,
  },
  {
    id: "video-4",
    titulo: "Episodio próximamente",
    duracion: "--:--",
    miniatura: "/imagenes/formaciones/proximamente.jpg",
    url: youtubeChannelUrl,
  },
];
