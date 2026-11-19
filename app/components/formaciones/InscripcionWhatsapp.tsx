"use client";

import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { WhatsAppIcon } from "@/app/components/ui/SocialIcons";
import type { Formacion } from "@/app/data/formaciones";
import { whatsappUrl } from "@/app/data/merch";
import { Boton, Etiqueta, Input, Modal } from "@/app/app/_components/ui";

/**
 * "Apúntate" (web y app): pide nombre, DNI e Instagram y abre WhatsApp (679 507 935)
 * con el mensaje de inscripción ya escrito.
 */
export default function InscripcionWhatsapp({
  formacion,
  onClose,
  nombreInicial = "",
  onEnviado,
}: {
  formacion: Formacion;
  onClose: () => void;
  /** En la app se rellena con el nombre de la cuenta. */
  nombreInicial?: string;
  /** En la app: guarda quién se ha apuntado (sin el DNI, que solo va por WhatsApp). */
  onEnviado?: (datos: { nombre: string; instagram: string }) => void;
}) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [dni, setDni] = useState("");
  const [instagram, setInstagram] = useState("");

  const ig = instagram.trim().replace(/^@/, "");
  const mensaje = [
    `¡Hola! Quiero apuntarme a la ${formacion.titulo} (${formacion.fecha}).`,
    "",
    `Nombre: ${nombre.trim()}`,
    `DNI: ${dni.trim().toUpperCase()}`,
    ig ? `Instagram: @${ig}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  function enviar(e: FormEvent) {
    e.preventDefault();
    window.open(whatsappUrl(mensaje), "_blank", "noopener");
    onEnviado?.({ nombre: nombre.trim(), instagram: ig });
    onClose();
  }

  return createPortal(
    <Modal titulo={`Apúntate · ${formacion.titulo}`} onCerrar={onClose}>
      <form onSubmit={enviar} className="flex flex-col gap-4">
        <Etiqueta texto="Nombre y apellidos">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoComplete="name" autoFocus />
        </Etiqueta>
        <Etiqueta texto="DNI / NIE">
          <Input value={dni} onChange={(e) => setDni(e.target.value)} required autoCapitalize="characters" />
        </Etiqueta>
        <Etiqueta texto="Instagram (opcional)">
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" autoCapitalize="none" />
        </Etiqueta>

        <div className="rounded-2xl bg-white/5 p-3 text-xs leading-relaxed text-white/60">
          <p className="mb-1 font-semibold text-white/75">Se enviará este mensaje:</p>
          <p className="whitespace-pre-line">{mensaje}</p>
        </div>

        <Boton type="submit" className="py-3">
          <WhatsAppIcon className="h-4 w-4" /> Enviar por WhatsApp
        </Boton>
        <p className="text-center text-xs text-white/45">Se abre WhatsApp con el mensaje escrito. Solo tienes que darle a enviar.</p>
      </form>
    </Modal>,
    document.body,
  );
}
