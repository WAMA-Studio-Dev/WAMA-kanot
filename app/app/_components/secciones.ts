import {
  CalendarClock,
  GraduationCap,
  Music2,
  Tent,
  Trophy,
  Mic,
  Briefcase,
  Camera,
  Shirt,
  type LucideIcon,
} from "lucide-react";

/** Enlace a la carpeta de Google Drive de Kanot (solo lo ven admins y editores, en Kanot Crew). */
export const KANOT_DRIVE_URL = "";

export type Campo = "titulo" | "descripcion" | "fecha" | "hora" | "dia_semana" | "lugar" | "enlace";

export type Seccion = {
  slug: string;
  nombre: string;
  descripcion: string;
  icono: LucideIcon;
  /** Campos que se muestran en el formulario de edición, con su etiqueta. */
  campos: Partial<Record<Campo, string>>;
  /**
   * Cómo se muestran las entradas:
   * semana = agrupadas por día · fechas = próximas/anteriores · texto = bloques de información · personas = fichas
   */
  vista: "semana" | "fechas" | "texto" | "personas" | "calendario";
  /** Texto del botón del enlace (por defecto "Abrir enlace"). */
  textoEnlace?: string;
  /** Sugerencias para el campo título (aparecen al escribir). */
  sugerencias?: string[];
  /** Cada evento tiene autorización para descargar y subir firmada. */
  autorizaciones?: boolean;
};

/** Grupos de Kanot Crew y su color (como en el calendario de la temporada). */
export const GRUPOS = [
  { nombre: "Kanot Jr", color: "#ffb0d6" },
  { nombre: "Knallas", color: "#4da8ff" },
  { nombre: "Knelo", color: "#ffd166" },
  { nombre: "Kinkis", color: "#7ee0c3" },
  { nombre: "Todos juntos", color: "#ffffff" },
];

export function colorGrupo(titulo: string) {
  const t = titulo.toLowerCase();
  return GRUPOS.find((g) => t.includes(g.nombre.toLowerCase()))?.color ?? "#ffffff";
}

export const SECCIONES: Seccion[] = [
  {
    slug: "horarios",
    nombre: "Horarios",
    descripcion: "Ensayos de la temporada",
    icono: CalendarClock,
    vista: "calendario",
    sugerencias: GRUPOS.map((g) => g.nombre),
    campos: {
      titulo: "Grupo",
      fecha: "Día",
      hora: "Hora (ej. 10:00 – 12:00)",
      lugar: "Lugar (opcional)",
      descripcion: "Notas (opcional)",
    },
  },
  {
    slug: "formaciones",
    nombre: "Formaciones",
    descripcion: "Próximas formaciones y talleres",
    icono: GraduationCap,
    vista: "fechas",
    campos: {
      titulo: "Título",
      fecha: "Fecha",
      hora: "Horario",
      lugar: "Lugar",
      descripcion: "Descripción (profes, temario, precio…)",
      enlace: "Enlace de inscripción",
    },
  },
  {
    slug: "kodigo-klub",
    nombre: "Kodigo Klub",
    descripcion: "Eventos, fiestas y novedades",
    icono: Music2,
    vista: "fechas",
    campos: {
      titulo: "Evento",
      fecha: "Fecha",
      hora: "Hora",
      lugar: "Lugar",
      descripcion: "Descripción (artistas, precio…)",
      enlace: "Enlace de venta de entradas",
    },
  },
  {
    slug: "kanot-kamp",
    nombre: "Kanot Kamp",
    descripcion: "Campus, convivencias e intensivos",
    icono: Tent,
    vista: "fechas",
    textoEnlace: "Inscribirme",
    campos: {
      titulo: "Edición / turno",
      fecha: "Fecha de inicio",
      hora: "Fechas / horario",
      lugar: "Lugar",
      descripcion: "Información (edades, precio, qué incluye…)",
      enlace: "Enlace de inscripción",
    },
  },
  {
    slug: "kanot-kamp-info",
    nombre: "Qué es Kanot Kamp",
    descripcion: "Presentación del Kamp",
    icono: Tent,
    vista: "texto",
    campos: {
      titulo: "Título del bloque",
      descripcion: "Texto",
      enlace: "Enlace (opcional)",
    },
  },
  {
    slug: "kanot-kamp-profes",
    nombre: "Profesores",
    descripcion: "Equipo docente del Kamp",
    icono: Tent,
    vista: "personas",
    textoEnlace: "Instagram",
    campos: {
      titulo: "Nombre",
      descripcion: "Bio / estilo",
      enlace: "Instagram (enlace)",
    },
  },
  {
    slug: "competicion",
    nombre: "Competición",
    descripcion: "Calendario de competiciones y resultados",
    icono: Trophy,
    vista: "fechas",
    autorizaciones: true,
    campos: {
      titulo: "Competición",
      fecha: "Fecha",
      hora: "Hora de convocatoria",
      lugar: "Lugar",
      descripcion: "Detalles / resultado",
      enlace: "Enlace (web, bases…)",
    },
  },
  {
    slug: "podcast",
    nombre: "Podcast",
    descripcion: "Episodios del podcast de Kanot",
    icono: Mic,
    vista: "fechas",
    campos: {
      titulo: "Episodio",
      fecha: "Fecha de publicación",
      descripcion: "Descripción",
      enlace: "Enlace de YouTube",
    },
  },
  {
    slug: "agencia",
    nombre: "Agencia",
    descripcion: "Representación de bailarines",
    icono: Briefcase,
    vista: "texto",
    campos: {
      titulo: "Título del bloque",
      descripcion: "Texto",
      enlace: "Enlace (opcional)",
    },
  },
  {
    slug: "fotografia",
    nombre: "Fotografía",
    descripcion: "Sesiones de fotos con Diego",
    icono: Camera,
    vista: "fechas",
    campos: {
      titulo: "Sesión / álbum",
      fecha: "Fecha",
      hora: "Hora",
      lugar: "Lugar",
      descripcion: "Detalles",
      enlace: "Enlace al álbum (Drive, Google Fotos…)",
    },
  },
];

export function getSeccion(slug: string) {
  return SECCIONES.find((s) => s.slug === slug);
}

/** Apartados que viven dentro de Kanot Crew (pestañas). */
export const SUBSECCIONES_CREW = ["horarios", "competicion", "formaciones"] as const;

/** Apartados que se ven como tarjetas en Inicio (Kanot Crew aparte, destacado). */
export type Apartado = { href: string; nombre: string; corto: string; descripcion: string; icono: LucideIcon };

const desdeSeccion = (slug: string, corto?: string): Apartado => {
  const s = getSeccion(slug)!;
  return { href: `/app/${s.slug}`, nombre: s.nombre, corto: corto ?? s.nombre, descripcion: s.descripcion, icono: s.icono };
};

export const APARTADOS: Apartado[] = [
  desdeSeccion("podcast"),
  {
    href: "/app/merch",
    nombre: "Merch",
    corto: "Merch",
    descripcion: "Camiseta, pantalón y pack",
    icono: Shirt,
  },
  desdeSeccion("agencia"),
  desdeSeccion("fotografia", "Fotos"),
];

export const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export type Entrada = {
  id: string;
  seccion: string;
  titulo: string;
  descripcion: string | null;
  fecha: string | null;
  hora: string | null;
  dia_semana: number | null;
  lugar: string | null;
  enlace: string | null;
  orden: number;
  documento_path?: string | null;
  /** Opciones de solo/pareja del campeonato, con su precio. */
  opciones_extra?: { nombre: string; precio: number }[] | null;
  /** Fecha límite para elegir solo/pareja. */
  limite_extra?: string | null;
};

export type Rol = "pendiente" | "usuario" | "miembro" | "editor" | "admin";

export type Perfil = {
  id: string;
  email: string | null;
  nombre: string | null;
  role: Rol;
  created_at: string;
  avatar_url?: string | null;
  super_admin?: boolean;
  /** Grupo de Kanot Crew (Kanot Jr, Knallas, Knelo, Kinkis). */
  grupo?: string | null;
  /** Tipos de notificación que la persona ha quitado. */
  notis_off?: string[] | null;
  /** El propio bailarín o su familia (madre, padre o tutor/a). */
  tipo?: "bailarin" | "familia";
};
