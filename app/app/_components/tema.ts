"use client";

import { useLayoutEffect } from "react";

export type Tema = "oscuro" | "claro" | "auto";
const CLAVE = "kanot-tema";
const EVENTO = "kanot-tema";

export function leerTema(): Tema {
  try {
    const t = localStorage.getItem(CLAVE);
    return t === "claro" || t === "auto" ? t : "oscuro";
  } catch {
    return "oscuro";
  }
}

export function guardarTema(t: Tema) {
  try {
    localStorage.setItem(CLAVE, t);
  } catch {
    /* sin almacenamiento: dura solo esta visita */
  }
  window.dispatchEvent(new Event(EVENTO));
}

function aplicar() {
  const t = leerTema();
  const claro = t === "claro" || (t === "auto" && window.matchMedia("(prefers-color-scheme: light)").matches);
  if (claro) document.documentElement.dataset.tema = "claro";
  else delete document.documentElement.dataset.tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", claro ? "#f5f1ea" : "#0b2b6b");
}

/** Aplica el tema elegido mientras se está dentro de la app (la web y la pantalla de entrar siguen en oscuro). */
export function useTemaApp() {
  useLayoutEffect(() => {
    aplicar();
    const media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", aplicar);
    window.addEventListener(EVENTO, aplicar);
    return () => {
      media.removeEventListener("change", aplicar);
      window.removeEventListener(EVENTO, aplicar);
      delete document.documentElement.dataset.tema;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#0b2b6b");
    };
  }, []);
}
