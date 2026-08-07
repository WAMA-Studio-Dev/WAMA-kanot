import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildAdminEmail, buildUserEmail } from "@/app/lib/emailTemplates";
import { isValidEmail } from "@/app/lib/validation";

type ContactPayload = {
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  edad?: number | string;
  instagram?: string;
  mensaje?: string;
  extra?: Record<string, string>;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const LOCAL_IPS = new Set(["127.0.0.1", "::1", "unknown"]);

// Almacén en memoria del proceso: suficiente para una única instancia de servidor,
// no persiste entre despliegues serverless multi-instancia (limitación conocida).
const requestTimestamps = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  if (process.env.NODE_ENV === "development" || LOCAL_IPS.has(ip)) return false;

  const now = Date.now();
  const recent = (requestTimestamps.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  requestTimestamps.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un minuto antes de volver a intentarlo." },
      { status: 429 }
    );
  }

  let payload: ContactPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const nombre = payload.nombre?.trim();
  const email = payload.email?.trim();
  const telefono = payload.telefono;
  const tipo = payload.tipo?.trim();
  const instagram = payload.instagram?.trim();
  const { edad, mensaje, extra } = payload;

  if (!nombre || !email || !tipo) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios (nombre, email, tipo)." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "El email proporcionado no es válido." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.RECIPIENT_EMAIL;

  if (!apiKey || !recipient) {
    console.error("Faltan RESEND_API_KEY o RECIPIENT_EMAIL en las variables de entorno.");
    return NextResponse.json(
      { error: "El servidor no está configurado para enviar correos." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const fromAddress = process.env.RESEND_FROM_EMAIL || "ByKanot <onboarding@resend.dev>";
  if (!process.env.RESEND_FROM_EMAIL) {
    console.warn(
      "RESEND_FROM_EMAIL no está definido: usando el remitente de pruebas de Resend " +
        "(onboarding@resend.dev), que SOLO entrega al email de la propia cuenta de Resend. " +
        "Configura un dominio verificado (p. ej. notificaciones@bykanot.com) para poder " +
        "enviar el correo de confirmación a los emails de los usuarios."
    );
  }
  const fecha = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

  const [adminResult, userResult] = await Promise.allSettled([
    resend.emails.send({
      from: fromAddress,
      to: recipient,
      replyTo: email,
      subject: `[NUEVO CONTACTO / INSCRIPCIÓN] - ${nombre}`,
      html: buildAdminEmail({ nombre, email, telefono, tipo, edad, mensaje, extra, fecha }),
    }),
    resend.emails.send({
      from: fromAddress,
      to: email,
      subject: "¡Hemos recibido tu mensaje! | ByKanot",
      html: buildUserEmail({ nombre }),
    }),
  ]);

  // El SDK de Resend no lanza excepciones por errores de la API (dominio no
  // verificado, destinatario rechazado, etc.): siempre resuelve la promesa con
  // { data, error }. Por eso hay que inspeccionar también `.value.error` además
  // de `status === "rejected"`, o esos fallos quedan completamente silenciados.
  function resendFailed(
    label: string,
    result: PromiseSettledResult<Awaited<ReturnType<typeof resend.emails.send>>>
  ): boolean {
    if (result.status === "rejected") {
      console.error(`Excepción al enviar correo (${label}):`, result.reason);
      return true;
    }
    if (result.value.error) {
      console.error(`Resend devolvió un error al enviar correo (${label}):`, result.value.error);
      return true;
    }
    return false;
  }

  const adminFailed = resendFailed("notificación a ByKanot", adminResult);
  const userFailed = resendFailed("confirmación al usuario", userResult);

  if (adminFailed && userFailed) {
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }

  const sheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (sheetsUrl) {
    try {
      await fetch(sheetsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          nombre,
          email,
          telefono: telefono ?? "",
          tipo,
          instagram: instagram ?? "",
          mensaje: mensaje ?? "",
        }),
      });
    } catch (error) {
      console.error("Error enviando a Google Sheets:", error);
    }
  }

  return NextResponse.json({ success: true });
}
