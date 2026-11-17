"use client";

import AnimatedHeroTitle from "@/app/components/sections/AnimatedHeroTitle";
import CtaButton from "@/app/components/ui/CtaButton";
import ScrollIndicator from "@/app/components/ui/ScrollIndicator";
import { useContactModal } from "@/app/components/contacto/ContactModalContext";

export default function HeroSection() {
  const { openModal } = useContactModal();

  return (
    <section
      id="inicio"
      className="relative h-screen w-full overflow-hidden bg-kanot-navy scroll-mt-28"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/imagenes/hero/fondo-hero.jpg"
        className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
        src="/imagenes/fondos/fondo-hero.mov"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-kanot-navy-deep/40 via-transparent to-kanot-navy" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-6 px-4 text-center">
        <AnimatedHeroTitle />

        <p className="max-w-2xl text-base md:text-xl font-medium text-white/90">
          ByKanot nace con la idea de crear un espacio donde la danza vaya más allá de las clases.
        </p>

        <CtaButton onClick={openModal} variant="glow">
          Contacta con nosotros
        </CtaButton>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
        <a
          href="tel:+34679507935"
          className="inline-flex items-center gap-2 text-base md:text-lg font-semibold tracking-wide text-white/90 transition-colors hover:text-white"
          aria-label="Llamar al 679 507 935"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          679 507 935
        </a>

        <a
          href="mailto:kanotcrew@gmail.com"
          className="inline-flex items-center gap-2 text-base md:text-lg font-semibold tracking-wide text-white/90 transition-colors hover:text-white"
          aria-label="Enviar un correo a kanotcrew@gmail.com"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-10 6L2 7" />
          </svg>
          kanotcrew@gmail.com
        </a>
        </div>
      </div>

      <ScrollIndicator />
    </section>
  );
}
