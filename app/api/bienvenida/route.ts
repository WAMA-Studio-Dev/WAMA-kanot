import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

/**
 * Correo de bienvenida cuando un admin aprueba una cuenta.
 * Solo admins: se usa la sesión de quien aprueba y la base de datos comprueba el rol.
 */

const ROL: Record<string, string> = {
  usuario: "Usuario",
  miembro: "Miembro de Kanot",
  editor: "Editor",
  admin: "Admin",
};

const escapar = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function correo(nombre: string, rol: string, esCrew: boolean) {
  const pasos = [
    "Instala la app en tu móvil (en iPhone: Safari → Compartir → “Añadir a pantalla de inicio”).",
    "Activa las notificaciones en tu Perfil para no perderte ningún aviso.",
    "Pon tu foto y elige tu nombre de usuario: tu carnet de Kanot irá subiendo de nivel.",
    ...(esCrew ? ["Elige tu grupo en el Perfil y mira los horarios en Kanot Crew."] : []),
  ];
  return `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
  <body style="margin:0;padding:0;background:#082054;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#082054;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0b2b6b;border-radius:24px;padding:32px 28px;">
          <tr><td align="center" style="padding-bottom:20px;">
            <img src="https://www.bykanot.com/app-icons/icon-192.png" width="72" height="72" alt="ByKanot" style="display:block;border-radius:16px;" />
          </td></tr>
          <tr><td align="center" style="color:#ffb0d6;font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;padding-bottom:8px;">ByKanot</td></tr>
          <tr><td align="center" style="color:#ffffff;font-size:24px;font-weight:bold;line-height:1.3;padding-bottom:12px;">¡Ya tienes acceso${nombre ? `, ${escapar(nombre)}` : ""}!</td></tr>
          <tr><td align="center" style="padding-bottom:20px;">
            <span style="display:inline-block;background:rgba(255,176,214,0.18);color:#ffb0d6;font-size:13px;font-weight:bold;padding:6px 14px;border-radius:999px;">${escapar(rol)}</span>
          </td></tr>
          <tr><td align="center" style="color:#d9e2f5;font-size:15px;line-height:1.6;padding-bottom:20px;">
            El equipo de Kanot ha aprobado tu cuenta. Ya puedes entrar en la app con tu email o tu nombre de usuario.
          </td></tr>
          <tr><td style="padding-bottom:24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.05);border-radius:16px;">
              <tr><td style="color:#ffffff;font-size:14px;font-weight:bold;padding:16px 18px 6px;">Lo primero que puedes hacer:</td></tr>
              ${pasos
                .map(
                  (p, i) =>
                    `<tr><td style="color:#d9e2f5;font-size:14px;line-height:1.5;padding:6px 18px ${i === pasos.length - 1 ? "16px" : "6px"};"><span style="color:#ffb0d6;font-weight:bold;">${i + 1}.</span> ${escapar(p)}</td></tr>`,
                )
                .join("")}
            </table>
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <a href="https://www.bykanot.com/app" style="display:inline-block;background:#ffb0d6;color:#082054;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:999px;">Abrir la app</a>
          </td></tr>
          <tr><td align="center" style="color:#8fa3cc;font-size:12px;line-height:1.6;">¿Dudas? Escríbenos desde la app con el botón “Escribir a Kanot”.</td></tr>
        </table>
        <p style="color:#5c74a6;font-size:11px;margin-top:20px;">© ByKanot · Sevilla · www.bykanot.com</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!url || !clave || !resendKey) return NextResponse.json({ error: "El correo no está configurado en el servidor." }, { status: 500 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Falta iniciar sesión." }, { status: 401 });

  let userId: string | undefined;
  try {
    userId = (await request.json())?.userId;
  } catch {
    /* sin cuerpo */
  }
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return NextResponse.json({ error: "Falta la cuenta." }, { status: 400 });

  const supabase = createClient(url, clave, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: esAdmin } = await supabase.rpc("es_admin");
  if (!esAdmin) return NextResponse.json({ error: "Solo admins." }, { status: 403 });

  // La cuenta aprobada (los admins pueden leer todos los perfiles).
  const { data: perfil } = await supabase.from("profiles").select("email, nombre, role").eq("id", userId).single();
  if (!perfil?.email || perfil.role === "pendiente") return NextResponse.json({ error: "Esa cuenta aún no está aprobada." }, { status: 400 });

  const nombre = (perfil.nombre ?? "").split(" ")[0];
  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "ByKanot <no-responder@bykanot.com>",
    to: perfil.email,
    subject: "¡Ya tienes acceso a la app de ByKanot!",
    html: correo(nombre, ROL[perfil.role] ?? "Usuario", ["miembro", "editor", "admin"].includes(perfil.role)),
  });
  if (error) {
    console.error("Error enviando bienvenida:", error);
    return NextResponse.json({ error: "No se pudo enviar el correo." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
