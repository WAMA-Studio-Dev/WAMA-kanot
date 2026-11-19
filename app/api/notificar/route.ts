import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as webpush from "web-push";

type Peticion = {
  titulo?: string;
  cuerpo?: string;
  url?: string;
  destino?: "todos" | "crew";
  tipo?: string;
  /** Si viene, se envía solo a estas cuentas (avisos personales). */
  usuarios?: string[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Tipos que cada persona puede desactivar en su perfil. Sin tipo = siempre se envía. */
const TIPOS = ["avisos", "horarios", "competicion", "formaciones", "kodigo-klub", "kanot-kamp", "podcast"];

/**
 * Envía una notificación a los móviles suscritos. Solo editores y admins:
 * se usa la sesión de quien envía (cabecera Authorization) y la base de datos comprueba el rol.
 */
export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const vapidPublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivada = process.env.VAPID_PRIVATE_KEY;
  if (!url || !clave || !vapidPublica || !vapidPrivada) {
    return NextResponse.json({ error: "Las notificaciones no están configuradas en el servidor." }, { status: 500 });
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Falta iniciar sesión." }, { status: 401 });

  let datos: Peticion;
  try {
    datos = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }
  const titulo = datos.titulo?.trim().slice(0, 80);
  if (!titulo) return NextResponse.json({ error: "Falta el título." }, { status: 400 });
  const cuerpo = datos.cuerpo?.trim().slice(0, 200) ?? "";
  const destino = datos.destino === "crew" ? "crew" : "todos";
  const enlace = datos.url?.startsWith("/app") ? datos.url : "/app";
  const tipo = datos.tipo && TIPOS.includes(datos.tipo) ? datos.tipo : null;

  // Cliente con la sesión de quien envía: push_destinos solo funciona para editores/admins.
  const supabase = createClient(url, clave, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const usuarios = Array.isArray(datos.usuarios) ? datos.usuarios.filter((u) => typeof u === "string" && UUID.test(u)).slice(0, 500) : null;
  const { data: subs, error } = usuarios
    ? await supabase.rpc("push_personas", { p_usuarios: usuarios })
    : await supabase.rpc("push_destinos", { p_destino: destino, p_tipo: tipo });
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  webpush.setVapidDetails("mailto:kanotcrew@gmail.com", vapidPublica, vapidPrivada);
  // ?noti=1 para saber en las estadísticas que se abrió desde una notificación.
  const conMarca = `${enlace}${enlace.includes("?") ? "&" : "?"}noti=1`;
  const mensaje = JSON.stringify({ titulo, cuerpo, url: conMarca });

  let enviadas = 0;
  const recibieron = new Set<string>();
  await Promise.all(
    (subs as { user_id?: string; endpoint: string; p256dh: string; auth: string }[]).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, mensaje, {
          TTL: 60 * 60 * 24,
        });
        enviadas++;
        if (s.user_id) recibieron.add(s.user_id);
      } catch (err) {
        const codigo = (err as { statusCode?: number }).statusCode;
        // 404/410: el móvil ya no existe o desactivó las notificaciones.
        if (codigo === 404 || codigo === 410) await supabase.rpc("borrar_push_caducada", { p_endpoint: s.endpoint });
        else console.error("Error enviando notificación:", codigo, err);
      }
    }),
  );

  // En avisos personales: quién no lo ha recibido (no tiene las notificaciones activadas).
  const sinMovil = usuarios ? usuarios.filter((u) => !recibieron.has(u)) : [];
  return NextResponse.json({ enviadas, total: subs?.length ?? 0, sinMovil });
}
