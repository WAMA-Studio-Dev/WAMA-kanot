type AdminEmailData = {
  nombre: string;
  email: string;
  telefono?: string;
  tipo: string;
  edad?: number | string;
  mensaje?: string;
  extra?: Record<string, string>;
  fecha: string;
};

const BRAND_PINK = "#FF2A85";
const BRAND_PINK_DEEP = "#E11D48";
const BRAND_BLUE = "#38BDF8";
const BG_DARK = "#0B1120";
const BG_PANEL = "#111A2E";
const BORDER = "rgba(255, 42, 133, 0.25)";

function emailShell(bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ByKanot</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BG_DARK}; font-family:'Segoe UI', Helvetica, Arial, sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">ByKanot &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_DARK}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:${BG_PANEL}; border:1px solid ${BORDER}; border-radius:20px; overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 20px; text-align:center; background:linear-gradient(135deg, rgba(255,42,133,0.18), rgba(56,189,248,0.12));">
                <span style="font-size:22px; font-weight:800; letter-spacing:0.08em; color:#ffffff; text-transform:uppercase;">
                  By<span style="color:${BRAND_PINK};">Kanot</span>
                </span>
              </td>
            </tr>
            ${bodyHtml}
            <tr>
              <td style="padding:20px 32px 28px; text-align:center; border-top:1px solid ${BORDER};">
                <p style="margin:0 0 8px; font-size:12px; color:rgba(255,255,255,0.45);">
                  ByKanot &middot; Sevilla
                </p>
                <p style="margin:0; font-size:12px;">
                  <a href="https://instagram.com/bykanot" style="color:${BRAND_BLUE}; text-decoration:none; margin-right:12px;">Instagram</a>
                  <a href="https://tiktok.com/@bykanot" style="color:${BRAND_BLUE}; text-decoration:none;">TikTok</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function row(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 16px; border-bottom:1px solid ${BORDER}; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${BRAND_BLUE}; white-space:nowrap; vertical-align:top;">
      ${label}
    </td>
    <td style="padding:10px 16px; border-bottom:1px solid ${BORDER}; font-size:14px; color:#ffffff; vertical-align:top;">
      ${value}
    </td>
  </tr>`;
}

export function buildAdminEmail(data: AdminEmailData): string {
  const rows = [
    row("Nombre", escapeHtml(data.nombre)),
    row("Email", `<a href="mailto:${escapeHtml(data.email)}" style="color:#ffffff; text-decoration:underline;">${escapeHtml(data.email)}</a>`),
    row("Teléfono", data.telefono ? escapeHtml(data.telefono) : "—"),
    row("Tipo de solicitud", `<span style="display:inline-block; padding:3px 10px; border-radius:999px; background:rgba(255,42,133,0.18); color:${BRAND_PINK}; font-weight:700; font-size:12px;">${escapeHtml(data.tipo)}</span>`),
    row("Edad", data.edad !== undefined && data.edad !== "" ? escapeHtml(String(data.edad)) : "—"),
  ];

  if (data.extra) {
    for (const [label, value] of Object.entries(data.extra)) {
      if (value) rows.push(row(label, escapeHtml(value)));
    }
  }

  const body = `
    <tr>
      <td style="padding:24px 32px 8px;">
        <p style="margin:0 0 4px; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:${BRAND_PINK};">
          Nueva solicitud
        </p>
        <h1 style="margin:0; font-size:20px; color:#ffffff;">${escapeHtml(data.nombre)}</h1>
        <p style="margin:6px 0 0; font-size:12px; color:rgba(255,255,255,0.45);">Recibido el ${escapeHtml(data.fecha)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 24px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.03); border:1px solid ${BORDER}; border-radius:14px; overflow:hidden;">
          ${rows.join("")}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px 8px;">
        <p style="margin:0 0 6px; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${BRAND_BLUE};">
          Mensaje
        </p>
        <p style="margin:0; font-size:14px; line-height:1.6; color:rgba(255,255,255,0.85); white-space:pre-wrap;">
          ${data.mensaje ? escapeHtml(data.mensaje) : "Sin mensaje adicional."}
        </p>
      </td>
    </tr>`;

  return emailShell(body);
}

export function buildUserEmail(data: { nombre: string }): string {
  const body = `
    <tr>
      <td style="padding:36px 32px 8px; text-align:center;">
        <div style="width:56px; height:56px; margin:0 auto 20px; border-radius:50%; background:rgba(255,42,133,0.15); border:1px solid ${BORDER}; display:flex; align-items:center; justify-content:center;">
        </div>
        <h1 style="margin:0 0 12px; font-size:22px; color:#ffffff;">¡Hola, ${escapeHtml(data.nombre)}!</h1>
        <p style="margin:0; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.8);">
          Hemos recibido tu mensaje correctamente. Gracias por confiar en <strong style="color:${BRAND_PINK};">ByKanot</strong>.
          Nuestro equipo lo revisará y se pondrá en contacto contigo muy pronto.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px 8px; text-align:center;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="border-radius:999px; background:linear-gradient(135deg, ${BRAND_PINK}, ${BRAND_PINK_DEEP});">
              <span style="display:inline-block; padding:12px 28px; font-size:13px; font-weight:700; color:#0B1120; letter-spacing:0.02em;">
                Te contactaremos muy pronto
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px 8px; text-align:center;">
        <p style="margin:0; font-size:13px; line-height:1.6; color:rgba(255,255,255,0.5);">
          Si no has solicitado este contacto, puedes ignorar este correo con total tranquilidad.
        </p>
      </td>
    </tr>`;

  return emailShell(body);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
