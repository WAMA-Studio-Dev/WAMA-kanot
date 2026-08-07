import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildAdminEmail, buildUserEmail } from "@/app/lib/emailTemplates";

type ContactPayload = {
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  edad?: number | string;
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

  const { nombre, email, telefono, tipo, edad, mensaje, extra } = payload;

  if (!nombre || !email || !tipo) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios (nombre, email, tipo)." },
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

  if (adminResult.status === "rejected") {
    console.error("Error enviando correo de notificación con Resend:", adminResult.reason);
  }
  if (userResult.status === "rejected") {
    console.error("Error enviando correo de confirmación con Resend:", userResult.reason);
  }

  if (adminResult.status === "rejected" && userResult.status === "rejected") {
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
          mensaje: mensaje ?? "",
        }),
      });
    } catch (error) {
      console.error("Error enviando a Google Sheets:", error);
    }
  }

  return NextResponse.json({ success: true });
}
