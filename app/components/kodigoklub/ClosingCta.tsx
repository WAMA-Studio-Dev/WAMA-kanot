"use client";

import CtaButton from "@/app/components/ui/CtaButton";
import { useContactModal } from "@/app/components/contacto/ContactModalContext";

export default function ClosingCta() {
  const { openModal } = useContactModal();

  return (
    <section className="bg-[#d6127e] px-6 py-16 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight text-black sm:text-4xl md:text-5xl">
          ¿Te apuntas?
        </h2>
        <p className="max-w-xl text-base font-semibold text-white sm:text-lg">
          Reserva tu plaza en las clases o apúntate a la próxima noche Kodigo Klub.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <CtaButton onClick={openModal}>Quiero apuntarme</CtaButton>
          <a
            href="https://instagram.com/bykanot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-black/40 px-6 py-3 font-bold text-black transition-colors hover:bg-black hover:text-white"
          >
            Síguenos en Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
