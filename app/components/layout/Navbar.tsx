"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { temporadas } from "@/app/data/temporadas";
import { InstagramIcon, TikTokIcon } from "@/app/components/ui/SocialIcons";

const kanotCrewLinkTop = { label: "Quiénes somos", href: "/quienes-lo-llevamos" };
const kanotCrewLinkBottom = { label: "Formulario", href: "/formulario" };

const temporadasLinks = temporadas.map((temporada) => ({
  label: temporada.periodo,
  href: `/temporadas/${temporada.id}`,
}));

const navLinks = [
  { label: "Formaciones", href: "/formaciones" },
  { label: "Kodigo Klub", href: "/kodigoklub" },
  { label: "Podcast", href: "/podcast" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/bykanot" },
  { label: "TikTok", href: "https://tiktok.com/@bykanot" },
];

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [temporadasSubOpen, setTemporadasSubOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileTemporadasOpen, setMobileTemporadasOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isTransparent = pathname === "/kodigoklub";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setTemporadasSubOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-4 md:top-6 inset-x-4 md:inset-x-0 z-50 md:mx-auto md:w-fit ${
        isTransparent ? "kodigo-navbar" : ""
      }`}
    >
      <div
        className={`flex items-center gap-4 md:gap-8 rounded-full px-4 md:px-6 py-2.5 transition-colors ${
          isTransparent ? "" : "border border-white/10 bg-kanot-navy/80 backdrop-blur-md shadow-lg shadow-black/20"
        }`}
      >
        <Link href="/#inicio" className="font-extrabold text-lg text-kanot-pink tracking-tight">
          ByKanot
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/90">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              className="flex items-center gap-1 hover:text-kanot-pink active:text-kanot-pink transition-colors"
            >
              Kanot Krew
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
                <Link
                  href={kanotCrewLinkTop.href}
                  onClick={() => setDropdownOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
                >
                  {kanotCrewLinkTop.label}
                </Link>

                <button
                  type="button"
                  onClick={() => setTemporadasSubOpen((v) => !v)}
                  aria-expanded={temporadasSubOpen}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
                >
                  Temporadas
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    className={`transition-transform ${temporadasSubOpen ? "rotate-180" : ""}`}
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
                {temporadasSubOpen && (
                  <div className="ml-3 flex flex-col border-l border-white/10 pl-2">
                    {temporadasLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setDropdownOpen(false);
                          setTemporadasSubOpen(false);
                        }}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}

                <Link
                  href={kanotCrewLinkBottom.href}
                  onClick={() => setDropdownOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
                >
                  {kanotCrewLinkBottom.label}
                </Link>
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-kanot-pink active:text-kanot-pink transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-3 border-l border-white/10 pl-4">
            <a
              href={socialLinks[0].href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks[0].label}
              className="hover:text-kanot-pink active:text-kanot-pink transition-colors"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={socialLinks[1].href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks[1].label}
              className="hover:text-kanot-pink active:text-kanot-pink transition-colors"
            >
              <TikTokIcon className="h-[18px] w-[18px]" />
            </a>
          </div>
        </nav>

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
            Kanot Krew
          </p>
          <Link
            href={kanotCrewLinkTop.href}
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
          >
            {kanotCrewLinkTop.label}
          </Link>

          <button
            type="button"
            onClick={() => setMobileTemporadasOpen((v) => !v)}
            aria-expanded={mobileTemporadasOpen}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
          >
            Temporadas
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              className={`transition-transform ${mobileTemporadasOpen ? "rotate-180" : ""}`}
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
          {mobileTemporadasOpen && (
            <div className="ml-3 flex flex-col border-l border-white/10 pl-2">
              {temporadasLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setMobileOpen(false);
                    setMobileTemporadasOpen(false);
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            href={kanotCrewLinkBottom.href}
            onClick={() => setMobileOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
          >
            {kanotCrewLinkBottom.label}
          </Link>

          <div className="my-2 border-t border-white/10" />
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5 hover:text-kanot-pink active:text-kanot-pink transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 border-t border-white/10" />
          <div className="flex items-center gap-4 px-3 py-1 text-white/90">
            <a
              href={socialLinks[0].href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks[0].label}
              className="hover:text-kanot-pink active:text-kanot-pink transition-colors"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={socialLinks[1].href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={socialLinks[1].label}
              className="hover:text-kanot-pink active:text-kanot-pink transition-colors"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
