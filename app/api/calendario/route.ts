import { NextRequest } from "next/server";

/**
 * Devuelve un evento de calendario (.ics) para añadir un ensayo o campeonato
 * al calendario del móvil. Los datos vienen en la URL (título, fecha, hora, lugar).
 */

const escapar = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** "10:00 – 12:00" → ["1000", "1200"]; "17:00" → ["1700", "1900"] (2 h por defecto). */
function horas(hora: string | null) {
  const m = hora?.match(/(\d{1,2})[:.h](\d{2})?(?:\s*[–-]\s*(\d{1,2})[:.h]?(\d{2})?)?/);
  if (!m) return null;
  const ini = `${m[1].padStart(2, "0")}${m[2] ?? "00"}`;
  const fin = m[3] ? `${m[3].padStart(2, "0")}${m[4] ?? "00"}` : `${String(Math.min(23, Number(m[1]) + 2)).padStart(2, "0")}${m[2] ?? "00"}`;
  return [ini, fin] as const;
}

export function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const titulo = (p.get("titulo") ?? "ByKanot").slice(0, 120);
  const fecha = p.get("fecha") ?? "";
  const lugar = p.get("lugar")?.slice(0, 200) ?? "";
  const notas = p.get("notas")?.slice(0, 500) ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return new Response("Fecha no válida", { status: 400 });

  const dia = fecha.replace(/-/g, "");
  const h = horas(p.get("hora"));
  const siguiente = new Date(`${fecha}T12:00:00Z`);
  siguiente.setUTCDate(siguiente.getUTCDate() + 1);
  const diaSiguiente = siguiente.toISOString().slice(0, 10).replace(/-/g, "");

  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ByKanot//App//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${dia}-${encodeURIComponent(titulo).slice(0, 40)}@bykanot.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    ...(h
      ? [`DTSTART;TZID=Europe/Madrid:${dia}T${h[0]}00`, `DTEND;TZID=Europe/Madrid:${dia}T${h[1]}00`]
      : [`DTSTART;VALUE=DATE:${dia}`, `DTEND;VALUE=DATE:${diaSiguiente}`]),
    `SUMMARY:${escapar(titulo)}`,
    ...(lugar ? [`LOCATION:${escapar(lugar)}`] : []),
    ...(notas ? [`DESCRIPTION:${escapar(notas)}`] : []),
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapar(titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(lineas.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="bykanot-${fecha}.ics"`,
    },
  });
}
