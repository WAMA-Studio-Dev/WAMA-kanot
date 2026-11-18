export const KODIGO_KLUB_INSTAGRAM_HREF =
  "https://www.instagram.com/kodigoklub?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

export const KODIGO_KLUB_DESCRIPCION =
  "Kodigo Klub es nuestro espacio para conectar la comunidad. Organizamos eventos, fiestas y experiencias donde el baile, la música y la cultura urbana se unen para crear momentos únicos. Porque la pista también es un lugar para compartir.";

export type KodigoPoster = { src: string; alt: string };

export type KodigoSala = {
  nombre: string;
  ciudad: string;
  direccion: string;
  descripcion: string;
};

export type KodigoEdicion = {
  /** 1, 2, 3… Se muestra como "1ª edición". */
  numero: number;
  /** Texto libre, p. ej. "Noviembre 2026". Opcional. */
  fecha?: string;
  /** Edición anunciada pero sin contenido todavía: se muestra "Próximamente". */
  proximamente?: boolean;
  /** Edición ya celebrada: no se muestran "Únete a Kodigo" ni "¿Cómo llegar?". */
  finalizada?: boolean;
  entradasHref?: string;
  fotos: string[];
  /** Fotos del collage abstracto (debajo del título de la edición). */
  collage?: { src: string; vertical: boolean }[];
  invitadxs: KodigoPoster[];
  sala: KodigoSala;
};

const SALA_EVEN: KodigoSala = {
  nombre: "Sala Even",
  ciudad: "Sevilla",
  direccion: "C/ José Díaz, 5, Sevilla",
  descripcion:
    "La Sala Even en Sevilla ofrece un amplio espacio versátil para eventos. Situada en la C/ José Díaz, 5, este recinto proporciona un marco único a solo unos minutos del centro de la ciudad.",
};

// Añade cada nueva edición aquí. La página abre por defecto la de número más
// alto que no esté marcada como "proximamente".
export const ediciones: KodigoEdicion[] = [
  {
    numero: 1,
    fecha: "16 de octubre de 2026",
    finalizada: true,
    entradasHref: "https://entradas.salaeven.com/es/entradas/kodigo-klub-en-sevilla",
    fotos: [
      "/imagenes/kodigoklub/Foto 1.png",
      "/imagenes/kodigoklub/Foto 2.jpeg",
      "/imagenes/kodigoklub/Foto 3.png",
      "/imagenes/kodigoklub/Foto 4.PNG",
      "/imagenes/kodigoklub/Foto 5.PNG",
      "/imagenes/kodigoklub/Foto 6.PNG",
    ],
    // Orden pensado para el collage: alterna horizontales (H) y verticales (V).
    collage: (
      [
        ["KodigoClub-1", false],
        ["IMG_2260", true],
        ["KodigoClub-16", false],
        ["KodigoClub-19", true],
        ["KodigoClub-24", true],
        ["KodigoClub-18", false],
        ["KodigoClub-20", false],
        ["KodigoClub-25", true],
        ["KodigoClub-28", false],
        ["IMG_2264", true],
        ["KodigoClub-32", false],
        ["KodigoClub-31", true],
        ["KodigoClub-33", false],
        ["KodigoClub-6", false],
        ["IMG_2265", true],
        ["KodigoClub-8", false],
        ["KodigoClub-9", false],
      ] as const
    ).map(([nombre, vertical]) => ({
      src: `/imagenes/kodigoklub/edicion-1/collage/${nombre}.jpg`,
      vertical,
    })),
    invitadxs: [
      { src: "/imagenes/kodigoklub/DJ SET.png", alt: "Jony Gonzalez — DJ Set" },
      { src: "/imagenes/kodigoklub/JUANJE y ESTELA.jpg", alt: "Juanje & Estela" },
      { src: "/imagenes/kodigoklub/DRAG.jpeg", alt: "The Juicy Dollz — Drag Artist" },
      { src: "/imagenes/kodigoklub/DIEGO Y DANI.jpg", alt: "Diego & Dani" },
      { src: "/imagenes/kodigoklub/ISABELA.jpg", alt: "Isabela" },
      { src: "/imagenes/kodigoklub/POLO Y PATRI.jpg", alt: "Polo & Patri" },
      { src: "/imagenes/kodigoklub/ARI.png", alt: "Ari & Eric" },
      { src: "/imagenes/kodigoklub/QUE ES.jpeg", alt: "¿Qué es Kodigo Klub?" },
    ],
    sala: SALA_EVEN,
  },
  {
    numero: 2,
    proximamente: true,
    fotos: [],
    invitadxs: [],
    sala: SALA_EVEN,
  },
];

export const edicionesOrdenadas = [...ediciones].sort((a, b) => b.numero - a.numero);

export const edicionPorDefecto =
  edicionesOrdenadas.find((e) => !e.proximamente) ?? edicionesOrdenadas[0];

/** Entradas de la edición más reciente (lo usa también la app /app/kodigo-klub). */
export const KODIGO_KLUB_ENTRADAS_HREF =
  edicionesOrdenadas.find((e) => !e.proximamente && e.entradasHref)?.entradasHref ??
  "https://entradas.salaeven.com/es/entradas/kodigo-klub-en-sevilla";

export function nombreEdicion(numero: number) {
  return `${numero}ª edición`;
}
