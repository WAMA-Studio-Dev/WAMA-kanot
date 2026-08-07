"use client";

import { CreditCard, Mail } from "lucide-react";
import { InstagramIcon } from "@/app/components/ui/SocialIcons";
import { useContactModal } from "@/app/components/contacto/ContactModalContext";
import { KODIGO_KLUB_INSTAGRAM_HREF } from "@/app/data/kodigoKlub";

export default function UneteKodigo() {
  const { openModal } = useContactModal();

  return (
    <section className="relative overflow-hidden bg-black px-6 py-16 md:px-12 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(156,30,83,0.35), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Únete a Kodigo
        </h2>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <a
            href={KODIGO_KLUB_INSTAGRAM_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-1 flex-col items-start gap-5 rounded-2xl bg-[#9c1e53] px-6 py-6 transition-all duration-300 hover:scale-[1.02] hover:bg-black"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black transition-colors duration-300 group-hover:bg-[#d6127e]">
              <InstagramIcon className="h-5 w-5 text-[#d6127e] transition-colors duration-300 group-hover:text-black" />
            </span>
            <span className="font-semibold text-white transition-colors duration-300 group-hover:text-[#d6127e]">
              @KodigoKlub
            </span>
          </a>

          <button
            type="button"
            onClick={openModal}
            className="group flex flex-1 flex-col items-start gap-5 rounded-2xl bg-[#9c1e53] px-6 py-6 text-left transition-all duration-300 hover:scale-[1.02] hover:bg-black"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black transition-colors duration-300 group-hover:bg-[#d6127e]">
              <CreditCard className="h-5 w-5 text-[#d6127e] transition-colors duration-300 group-hover:text-black" />
            </span>
            <span className="font-semibold text-white transition-colors duration-300 group-hover:text-[#d6127e]">
              Entradas
            </span>
          </button>

          <button
            type="button"
            onClick={openModal}
            className="group flex flex-1 flex-col items-start gap-5 rounded-2xl bg-[#9c1e53] px-6 py-6 text-left transition-all duration-300 hover:scale-[1.02] hover:bg-black"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black transition-colors duration-300 group-hover:bg-[#d6127e]">
              <Mail className="h-5 w-5 text-[#d6127e] transition-colors duration-300 group-hover:text-black" />
            </span>
            <span className="font-semibold text-white transition-colors duration-300 group-hover:text-[#d6127e]">
              Contacto
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
