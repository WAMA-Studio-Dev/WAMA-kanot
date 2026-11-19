"use client";

/**
 * Reduce una foto en el propio móvil antes de subirla (ocupa ~10 veces menos y sube más rápido).
 * - Si no es una imagen, es un GIF o ya es pequeña, se devuelve tal cual.
 * - Si el navegador no puede leerla (algún HEIC en Android, por ejemplo), también se devuelve tal cual.
 * La foto original sigue en el móvil de quien la sube.
 */
export async function comprimirImagen(archivo: File, { maxLado = 2000, calidad = 0.85 } = {}): Promise<File> {
  if (!archivo.type.startsWith("image/") || archivo.type === "image/gif" || archivo.type === "image/svg+xml") return archivo;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    return archivo;
  }

  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  // Pequeña y ya ligera: no merece la pena tocarla.
  if (escala === 1 && archivo.size < 600 * 1024) {
    bitmap.close();
    return archivo;
  }

  const ancho = Math.round(bitmap.width * escala);
  const alto = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return archivo;
  }
  // Fondo blanco por si la imagen tenía transparencia (el JPEG no la admite).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.drawImage(bitmap, 0, 0, ancho, alto);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", calidad));
  // Si por lo que sea no ha mejorado, nos quedamos con la original.
  if (!blob || blob.size >= archivo.size) return archivo;

  const nombre = archivo.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], nombre, { type: "image/jpeg", lastModified: Date.now() });
}
