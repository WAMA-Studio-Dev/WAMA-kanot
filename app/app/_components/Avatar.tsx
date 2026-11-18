"use client";

import { getSupabase } from "@/app/lib/supabase/client";
import type { Perfil } from "./secciones";

/** Foto de perfil redonda; si no hay foto, la inicial sobre rosa. */
export default function Avatar({
  perfil,
  tamano = 40,
  className = "",
}: {
  perfil: Pick<Perfil, "nombre" | "email" | "avatar_url"> | null;
  tamano?: number;
  className?: string;
}) {
  const inicial = (perfil?.nombre ?? perfil?.email ?? "?").charAt(0).toUpperCase();
  const estilo = { width: tamano, height: tamano, fontSize: tamano * 0.42 };

  if (perfil?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto subida a Supabase Storage
      <img
        src={perfil.avatar_url}
        alt={perfil.nombre ?? ""}
        style={estilo}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <span
      style={estilo}
      className={`flex shrink-0 items-center justify-center rounded-full bg-kanot-pink font-bold text-kanot-navy-deep ${className}`}
    >
      {inicial}
    </span>
  );
}

/** Recorta la imagen en cuadrado y la reduce a 512 px en JPEG (más rápido de subir y de cargar). */
async function prepararFoto(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo);
  const lado = Math.min(bitmap.width, bitmap.height);
  const destino = Math.min(512, lado);
  const canvas = document.createElement("canvas");
  canvas.width = destino;
  canvas.height = destino;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    bitmap,
    (bitmap.width - lado) / 2,
    (bitmap.height - lado) / 2,
    lado,
    lado,
    0,
    0,
    destino,
    destino,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo procesar la foto"))), "image/jpeg", 0.85),
  );
}

/** Sube la foto a avatares/<id>/ y borra las anteriores. Devuelve la URL pública. */
export async function subirFotoPerfil(idUsuario: string, archivo: File): Promise<string> {
  const almacen = getSupabase().storage.from("avatares");
  const foto = await prepararFoto(archivo);
  const ruta = `${idUsuario}/${Date.now()}.jpg`;

  const { error } = await almacen.upload(ruta, foto, { contentType: "image/jpeg" });
  if (error) throw error;

  // Limpia fotos antiguas (si falla, no pasa nada).
  const { data: antiguas } = await almacen.list(idUsuario);
  const sobran = (antiguas ?? []).map((a) => `${idUsuario}/${a.name}`).filter((r) => r !== ruta);
  if (sobran.length) await almacen.remove(sobran);

  return almacen.getPublicUrl(ruta).data.publicUrl;
}

/** Guarda nombre y foto del propio perfil (no puede cambiar el rol). */
export async function guardarMiPerfil(nombre: string, avatarUrl: string | null) {
  const { error } = await getSupabase().rpc("actualizar_mi_perfil", {
    p_nombre: nombre,
    p_avatar_url: avatarUrl,
  });
  if (error) throw error;
}
