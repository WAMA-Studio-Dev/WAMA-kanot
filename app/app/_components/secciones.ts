import {
  CalendarClock,
  GraduationCap,
  Music2,
  Tent,
  Trophy,
  Mic,
  Briefcase,
  Camera,
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
  vista: "semana" | "fechas" | "texto" | "personas";
  /** Texto del botón del enlace (por defecto "Abrir enlace"). */
  textoEnlace?: string;
};

export const SECCIONES: Seccion[] = [
  {
    slug: "horarios",
    nombre: "Horarios",
    descripcion: "Clases y ensayos de la semana",
    icono: CalendarClock,
    vista: "semana",
    campos: {
      titulo: "Clase / grupo",
      dia_semana: "Día",
      hora: "Hora (ej. 18:00 – 19:30)",
      lugar: "Sala / lugar",
      descripcion: "Notas (profe, nivel…)",
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
    descripcion: "Castings, trabajos y bolos",
    icono: Briefcase,
    vista: "fechas",
    campos: {
      titulo: "Trabajo / casting",
      fecha: "Fecha",
      hora: "Hora",
      lugar: "Lugar",
      descripcion: "Detalles (requisitos, perfil, pago…)",
      enlace: "Enlace (inscripción, info…)",
    },
  },
  {
    slug: "fotografia",
    nombre: "Fotografía",
    descripcion: "Sesiones de fotos y álbumes",
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
};

export type Rol = "pendiente" | "usuario" | "editor" | "admin";

export type Perfil = {
  id: string;
  email: string | null;
  nombre: string | null;
  role: Rol;
  created_at: string;
};
