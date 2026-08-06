"use client";

import Link from "next/link";
import { useCookieConsent } from "@/app/components/legal/CookieConsentContext";

const legalLinks = [
  { label: "Aviso Legal", href: "/aviso-legal" },
  { label: "Términos y Condiciones", href: "/terminos-y-condiciones" },
  { label: "Política de Privacidad", href: "/politica-de-privacidad" },
  { label: "Política de Cookies", href: "/politica-de-cookies" },
];

export default function Footer() {
  const { openPreferences } = useCookieConsent();

  return (
    <footer className="border-t border-white/10 bg-kanot-navy-deep px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <span className="font-extrabold text-lg tracking-[0.1em] text-kanot-pink">ByKanot</span>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/70">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-kanot-pink"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={openPreferences}
            className="transition-colors hover:text-kanot-pink"
          >
            Configurar cookies
          </button>
        </nav>

        <p className="text-xs text-white/40">© 2026 ByKanot. Todos los Derechos Reservados.</p>
      </div>
    </footer>
  );
}
