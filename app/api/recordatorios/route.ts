import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as webpush from "web-push";
import { podcastVideos } from "@/app/data/podcastVideos";
import { youtubeChannelUrl } from "@/app/data/podcast";

/**
 * Recordatorio automático: Vercel lo llama cada tarde (ver vercel.json) y avisa
 * de los ensayos y campeonatos del día siguiente. Solo funciona con la clave CRON_SECRET.
 */

type Entrada = { seccion: "horarios" | "competicion"; titulo: string; hora: string | null; lugar: string | null };
type Sub = { endpoint: string; p256dh: string; auth: string; role: string; grupo: string | null; notis_off: string[] };

/** Mañana en España, como "AAAA-MM-DD". */
function mananaEnEspana() {
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
  const [y, m, d] = hoy.split("-").map(Number);
  const manana = new Date(Date.UTC(y, m - 1, d + 1));
  return manana.toISOString().slice(0, 10);
}

const linea = (e: Entrada) => [e.titulo, e.hora, e.lugar].filter(Boolean).join(" · ");

/** Qué ensayos le tocan a cada persona: los de su grupo y los de "todos juntos". Sin grupo (o editores): todos. */
function ensayosDe(sub: Sub, ensayos: Entrada[]) {
  if (!sub.grupo || sub.role !== "miembro") return ensayos;
  const g = sub.grupo.toLowerCase();
  return ensayos.filter((e) => e.titulo.toLowerCase().includes(g) || e.titulo.toLowerCase().includes("todos"));
}

export async function GET(request: NextRequest) {
  const secreto = process.env.CRON_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const vapidPublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivada = process.env.VAPID_PRIVATE_KEY;
  if (!secreto || !url || !clave || !vapidPublica || !vapidPrivada) {
    return NextResponse.json({ error: "Recordatorios sin configurar." }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const fecha = mananaEnEspana();
  const supabase = createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
  webpush.setVapidDetails("mailto:kanotcrew@gmail.com", vapidPublica, vapidPrivada);

  // Podcast: si hay un episodio nuevo en la web desde la última vez, se avisa a todos.
  let podcast = 0;
  const ultimo = podcastVideos.find((v) => v.url !== youtubeChannelUrl);
  if (ultimo) {
    const { data: destinos } = await supabase.rpc("podcast_nuevo", { p_secreto: secreto, p_episodio: ultimo.id });
    for (const s of (destinos ?? []) as { endpoint: string; p256dh: string; auth: string }[]) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ titulo: `Nuevo episodio del podcast · ${ultimo.titulo}`, cuerpo: "Ya puedes verlo en la app.", url: "/app/podcast?noti=1" }),
          { TTL: 60 * 60 * 24 },
        );
        podcast++;
      } catch {
        /* móvil caducado: se limpia en el recordatorio de abajo o en otro envío */
      }
    }
  }

  const { data, error } = await supabase.rpc("datos_recordatorio", { p_secreto: secreto, p_fecha: fecha });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ fecha, enviadas: 0, podcast, nota: "Ya enviado hoy." });

  const { entradas, subs } = data as { entradas: Entrada[]; subs: Sub[] };
  const ensayos = entradas.filter((e) => e.seccion === "horarios");
  const campeonatos = entradas.filter((e) => e.seccion === "competicion");
  if (!entradas.length) return NextResponse.json({ fecha, enviadas: 0, podcast, nota: "Mañana no hay nada." });

  // Cada persona recibe solo lo suyo (y respeta los avisos que haya desactivado en su perfil).
  const envios: { sub: Sub; titulo: string; cuerpo: string; url: string }[] = [];
  for (const sub of subs) {
    const suyos = ensayosDe(sub, ensayos);
    if (suyos.length && !sub.notis_off.includes("horarios")) {
      envios.push({
        sub,
        titulo: suyos.length === 1 ? `Mañana ensayas · ${suyos[0].titulo}` : "Mañana hay ensayo",
        cuerpo: suyos.length === 1 ? [suyos[0].hora, suyos[0].lugar].filter(Boolean).join(" · ") || "Mira la hora en la app." : suyos.map(linea).join("\n"),
        url: "/app/kanot-crew?tab=horarios&noti=1",
      });
    }
    if (campeonatos.length && !sub.notis_off.includes("competicion")) {
      envios.push({
        sub,
        titulo: `Mañana: ${campeonatos.map((c) => c.titulo).join(" y ")}`,
        cuerpo: `¡Mucha suerte, Kanot! ${campeonatos.map((c) => [c.hora, c.lugar].filter(Boolean).join(" · ")).filter(Boolean).join(" / ") || "Revisa los detalles en la app."}`,
        url: "/app/kanot-crew?tab=competicion&noti=1",
      });
    }
  }

  let enviadas = 0;
  await Promise.all(
    envios.map(async ({ sub, titulo, cuerpo, url: enlace }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({ titulo, cuerpo, url: enlace }),
          { TTL: 60 * 60 * 12 },
        );
        enviadas++;
      } catch (err) {
        const codigo = (err as { statusCode?: number }).statusCode;
        if (codigo === 404 || codigo === 410) await supabase.rpc("borrar_push_cron", { p_secreto: secreto, p_endpoint: sub.endpoint });
        else console.error("Error enviando recordatorio:", codigo, err);
      }
    }),
  );

  return NextResponse.json({ fecha, ensayos: ensayos.length, campeonatos: campeonatos.length, enviadas, podcast });
}
