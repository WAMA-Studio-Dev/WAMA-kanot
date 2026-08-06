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

export async function POST(request: NextRequest) {
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

  try {
    await Promise.all([
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
  } catch (error) {
    console.error("Error enviando correo con Resend:", error);
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
