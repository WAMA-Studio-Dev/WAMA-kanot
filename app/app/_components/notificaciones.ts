"use client";

import { getSupabase } from "@/app/lib/supabase/client";

const CLAVE_PUBLICA = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Notificaciones que cada persona puede activar o quitar en su perfil. */
export const TIPOS_NOTI = [
  { id: "avisos", nombre: "Avisos del tablón", soloCrew: false },
  { id: "horarios", nombre: "Ensayos nuevos", soloCrew: true },
  { id: "competicion", nombre: "Competiciones", soloCrew: true },
  { id: "formaciones", nombre: "Formaciones", soloCrew: true },
  { id: "kodigo-klub", nombre: "Kodigo Klub", soloCrew: false },
  { id: "kanot-kamp", nombre: "Kanot Kamp", soloCrew: false },
  { id: "podcast", nombre: "Episodios nuevos del podcast", soloCrew: false },
] as const;
export type TipoNoti = (typeof TIPOS_NOTI)[number]["id"];

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
function fechaCorta(iso: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${DIAS[new Date(y, m - 1, d).getDay()]} ${d} ${MESES[m - 1]}`;
}

/**
 * Notificación automática al publicar algo nuevo en estos apartados.
 * Devuelve null si el apartado no avisa automáticamente.
 */
export function notificacionAutomatica(e: {
  seccion: string;
  titulo: string;
  fecha: string | null;
  hora: string | null;
  lugar: string | null;
}): { titulo: string; cuerpo: string; url: string; destino: "todos" | "crew"; tipo: TipoNoti } | null {
  const detalle = [fechaCorta(e.fecha), e.hora, e.lugar].filter(Boolean).join(" · ");
  switch (e.seccion) {
    case "horarios":
      return { titulo: `Nuevo ensayo · ${e.titulo}`, cuerpo: detalle, url: "/app/kanot-crew?tab=horarios", destino: "crew", tipo: "horarios" };
    case "competicion":
      return { titulo: `Nueva competición · ${e.titulo}`, cuerpo: detalle, url: "/app/kanot-crew?tab=competicion", destino: "crew", tipo: "competicion" };
    case "formaciones":
      return { titulo: `Nueva formación · ${e.titulo}`, cuerpo: detalle, url: "/app/kanot-crew?tab=formaciones", destino: "crew", tipo: "formaciones" };
    case "kodigo-klub":
      return { titulo: `Kodigo Klub · ${e.titulo}`, cuerpo: detalle, url: "/app/kodigo-klub?tab=entradas", destino: "todos", tipo: "kodigo-klub" };
    case "kanot-kamp":
      return { titulo: `Kanot Kamp · ${e.titulo}`, cuerpo: detalle, url: "/app/kanot-kamp?tab=inscribete", destino: "todos", tipo: "kanot-kamp" };
    case "podcast":
      return { titulo: `Nuevo episodio del podcast · ${e.titulo}`, cuerpo: "Ya puedes verlo en la app.", url: "/app/podcast", destino: "todos", tipo: "podcast" };
    default:
      return null;
  }
}

/** Guarda qué tipos de notificación NO quiere recibir la persona. */
export async function guardarMisNotis(desactivadas: string[]) {
  const { error } = await getSupabase().rpc("actualizar_mis_notis", { p_off: desactivadas });
  if (error) {
    throw new Error(/actualizar_mis_notis|schema cache/i.test(error.message) ? "Falta activar las preferencias (SQL 011)." : error.message);
  }
}

export type EstadoNotificaciones = "no-disponible" | "solo-instalada" | "bloqueadas" | "activas" | "inactivas";

function base64AUint8(base64: string) {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + relleno).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const instalada = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

async function registro() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/app" });
}

/** En qué situación están las notificaciones en este móvil. */
export async function estadoNotificaciones(): Promise<EstadoNotificaciones> {
  if (!CLAVE_PUBLICA || !("serviceWorker" in navigator)) return "no-disponible";
  // En iPhone solo funcionan con la app instalada en la pantalla de inicio.
  if (!("PushManager" in window)) return esIOS() && !instalada() ? "solo-instalada" : "no-disponible";
  if (Notification.permission === "denied") return "bloqueadas";
  const reg = await registro();
  const sub = await reg.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "activas" : "inactivas";
}

/** Pide permiso y guarda este móvil para recibir notificaciones. */
export async function activarNotificaciones() {
  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") throw new Error("No has dado permiso para las notificaciones.");
  const reg = await registro();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64AUint8(CLAVE_PUBLICA) }));
  const json = sub.toJSON();
  const { error } = await getSupabase()
    .from("push_subs")
    .upsert(
      { endpoint: sub.endpoint, p256dh: json.keys?.p256dh, auth: json.keys?.auth },
      { onConflict: "endpoint", ignoreDuplicates: true },
    );
  if (error && !/duplicate/i.test(error.message)) {
    throw new Error(/push_subs|schema cache/i.test(error.message) ? "Falta activar las notificaciones (SQL 010)." : error.message);
  }
}

/** Deja de recibir notificaciones en este móvil. */
export async function desactivarNotificaciones() {
  const reg = await registro();
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await getSupabase().from("push_subs").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe();
}

/** Editores/admins: envía una notificación a todos o solo a Kanot Crew. */
export async function enviarNotificacion(datos: {
  titulo: string;
  cuerpo?: string;
  url?: string;
  destino: "todos" | "crew";
  /** Tipo de notificación (cada persona puede desactivar los que no quiera). */
  tipo?: TipoNoti;
}) {
  const { data } = await getSupabase().auth.getSession();
  const res = await fetch("/api/notificar", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(datos),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "No se pudo enviar la notificación.");
  return json as { enviadas: number; total: number };
}

/**
 * Editores/admins: aviso personal a unas cuentas concretas (falta autorización, falta pagar…).
 * Guarda cuándo se avisó. Devuelve las cuentas que no lo han recibido (sin notificaciones activadas).
 */
export async function avisarPersonas(datos: {
  usuarios: string[];
  titulo: string;
  cuerpo: string;
  url: string;
  entradaId: string;
  tipo: "autorizacion" | "pago";
  /** Para pagos: bailarín de cada cuenta avisada. */
  bailarinDe?: Record<string, string>;
}) {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  const res = await fetch("/api/notificar", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify({ titulo: datos.titulo, cuerpo: datos.cuerpo, url: datos.url, usuarios: datos.usuarios }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = String(json.error ?? "");
    throw new Error(/push_personas|schema cache/i.test(msg) ? "Falta activar el SQL 021 para avisar a personas." : msg || "No se pudo enviar el aviso.");
  }
  const sinMovil = (json.sinMovil ?? []) as string[];
  const avisados = datos.usuarios.filter((u) => !sinMovil.includes(u));
  if (avisados.length) {
    await supabase.from("avisos_enviados").insert(
      avisados.map((u) => ({
        entrada_id: datos.entradaId,
        tipo: datos.tipo,
        user_id: u,
        bailarin_id: datos.bailarinDe?.[u] ?? null,
      })),
    );
  }
  return { avisados, sinMovil };
}

/** Última vez que se avisó, por cuenta y por bailarín, en un campeonato. */
export async function ultimosAvisos(entradaId: string, tipo: "autorizacion" | "pago") {
  const { data } = await getSupabase()
    .from("avisos_enviados")
    .select("user_id, bailarin_id, created_at")
    .eq("entrada_id", entradaId)
    .eq("tipo", tipo)
    .order("created_at");
  const mapa: Record<string, string> = {};
  for (const a of data ?? []) {
    if (a.user_id) mapa[a.user_id] = a.created_at;
    if (a.bailarin_id) mapa[a.bailarin_id] = a.created_at;
  }
  return mapa;
}

export function fechaAviso(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
