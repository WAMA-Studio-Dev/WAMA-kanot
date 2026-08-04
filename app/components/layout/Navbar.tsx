"use client";

import { useEffect, useRef, useState } from "react";

const kanotCrewLinks = [
  { label: "Quiénes lo llevamos", href: "#quienes-lo-llevamos" },
  { label: "Temporadas", href: "#temporadas" },
  { label: "Formulario", href: "#formulario" },
];

const navLinks = [
  { label: "CódigoClub", href: "#codigoclub" },
  { label: "Podcast", href: "#podcast" },
  { label: "Formaciones", href: "#formaciones" },
];

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-4 md:top-6 inset-x-4 md:inset-x-0 z-50 md:mx-auto md:w-fit">
      <div className="flex items-center gap-4 md:gap-8 rounded-full border border-white/10 bg-kanot-navy/80 backdrop-blur-md px-4 md:px-6 py-2.5 shadow-lg shadow-black/20">
        <a href="#inicio" className="font-extrabold text-lg text-kanot-pink tracking-tight">
          ByKanot
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/90">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              className="flex items-center gap-1 hover:text-kanot-electric transition-colors"
            >
              KanotCrew
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 rounded-2xl border border-kanot-pink/20 bg-kanot-navy/95 backdrop-blur-md p-2 shadow-xl">
                {kanotCrewLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setDropdownOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-kanot-pink transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-kanot-electric transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#formulario"
          className="hidden md:inline-block rounded-full bg-kanot-pink px-6 py-2 font-bold text-kanot-navy hover:bg-white transition-colors"
        >
          Únete
        </a>

        <button
          type="button"
          className="md:hidden ml-auto text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileOpen}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {mobileOpen ? (
              <path
                d="M5 5l12 12M17 5L5 17"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 6h16M3 11h16M3 16h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden mt-3 rounded-2xl border border-white/10 bg-kanot-navy/95 backdrop-blur-md p-4 flex flex-col gap-1">
          <p className="px-3 pt-1 pb-2 text-xs font-semibold uppercase tracking-wide text-kanot-pink-soft">
            KanotCrew
          </p>
          {kanotCrewLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5 hover:text-kanot-pink transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="my-2 border-t border-white/10" />
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5 hover:text-kanot-pink transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#formulario"
            onClick={() => setMobileOpen(false)}
            className="mt-3 rounded-full bg-kanot-pink px-6 py-2 text-center font-bold text-kanot-navy hover:bg-white transition-colors"
          >
            Únete
          </a>
        </div>
      )}
    </header>
  );
}
