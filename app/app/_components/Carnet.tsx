"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronRight, Crown, Sparkles } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "./AuthProvider";
import { estadoNotificaciones } from "./notificaciones";
import { colorGrupo } from "./secciones";

const NOMBRE_ROL = { pendiente: "Pendiente", usuario: "Usuario", miembro: "Miembro de Kanot", editor: "Editor", admin: "Admin" } as const;

/** Niveles del carnet: cuanto más completo el perfil, más brilla. */
const NIVELES = [
  {
    nombre: "Nuevo",
    fondo: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900",
    borde: "border-white/15",
    acento: "text-white/70",
    chip: "bg-white/10 text-white/80",
  },
  {
    nombre: "Bronce",
    fondo: "bg-gradient-to-br from-[#7a4a2a] via-[#4a2c1c] to-[#2a1a12]",
    borde: "border-[#d39a6a]/40",
    acento: "text-[#f0b98a]",
    chip: "bg-[#d39a6a]/20 text-[#f6c9a3]",
  },
  {
    nombre: "Plata",
    fondo: "bg-gradient-to-br from-[#8d97a8] via-[#4b5363] to-[#22262f]",
    borde: "border-white/40",
    acento: "text-[#e5ebf5]",
    chip: "bg-white/20 text-white",
  },
  {
    nombre: "Oro",
    fondo: "bg-gradient-to-br from-[#c9a03c] via-[#7a5a16] to-[#33250a]",
    borde: "border-[#ffd166]/60",
    acento: "text-[#ffe29a]",
    chip: "bg-[#ffd166]/25 text-[#fff0c2]",
  },
  {
    nombre: "Kanot Legend",
    fondo: "bg-gradient-to-br from-kanot-pink via-[#7b3fe4] to-kanot-electric",
    borde: "border-white/60",
    acento: "text-white",
    chip: "bg-white/25 text-white",
  },
  {
    nombre: "Supremo",
    fondo: "bg-[conic-gradient(from_210deg_at_30%_20%,#120a1f,#3a1240,#0b2b6b,#1a0f05,#120a1f)]",
    borde: "border-[#ffd166]/80",
    acento: "text-[#ffd166]",
    chip: "bg-gradient-to-r from-[#ffd166] to-kanot-pink text-[#1a0f05]",
  },
];

type Paso = { id: string; texto: string; hecho: boolean; href?: string; accion?: string };

function instalada() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Carnet de Kanot de cada persona. Sube de nivel (Nuevo → Bronce → Plata → Oro → Kanot Legend)
 * según tenga el perfil completo: foto, usuario, notificaciones, app instalada, grupo y bailarín.
 */
export default function Carnet({ foto, onEditar }: { foto: ReactNode; onEditar: () => void }) {
  const { perfil, rol } = useAuth();
  const [notis, setNotis] = useState(false);
  const [app, setApp] = useState(false);
  const [conBailarin, setConBailarin] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depende del navegador
    setApp(instalada());
    estadoNotificaciones()
      .then((e) => setNotis(e === "activas"))
      .catch(() => setNotis(false));
  }, []);

  useEffect(() => {
    if (!perfil || rol !== "miembro") return;
    getSupabase()
      .from("cuenta_bailarines")
      .select("bailarin_id", { count: "exact", head: true })
      .eq("user_id", perfil.id)
      .then(({ count }) => setConBailarin((count ?? 0) > 0));
  }, [perfil, rol]);

  if (!perfil) return null;
  const esMiembro = rol === "miembro";

  const pasos: Paso[] = [
    { id: "foto", texto: "Pon una foto de perfil", hecho: Boolean(perfil.avatar_url), accion: "foto" },
    { id: "usuario", texto: "Elige tu nombre de usuario", hecho: Boolean(perfil.usuario), accion: "editar" },
    { id: "app", texto: "Instala la app en el móvil", hecho: app, href: "#instalar" },
    { id: "notis", texto: "Activa las notificaciones", hecho: notis, href: "#notificaciones" },
    ...(esMiembro
      ? [
          { id: "grupo", texto: "Elige tu grupo", hecho: Boolean(perfil.grupo), href: "#mi-grupo" },
          { id: "bailarin", texto: "Ten tu bailarín vinculado", hecho: conBailarin },
        ]
      : []),
  ];
  const hechos = pasos.filter((p) => p.hecho).length;
  const ratio = hechos / pasos.length;
  // El superadmin tiene su propio rango, por encima de todos.
  const supremo = Boolean(perfil.super_admin);
  const indice = supremo ? 5 : ratio === 1 ? 4 : ratio >= 0.75 ? 3 : ratio >= 0.5 ? 2 : ratio > 0 ? 1 : 0;
  const nivel = NIVELES[indice];
  const siguiente = supremo || indice >= 4 ? undefined : NIVELES[indice + 1];
  const color = esMiembro && perfil.grupo ? colorGrupo(perfil.grupo) : null;
  const desde = new Date(perfil.created_at).toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-3">
      {/* La tarjeta */}
      <div className={`tema-fijo relative overflow-hidden rounded-[1.75rem] border ${nivel.borde} ${nivel.fondo} p-5 shadow-2xl shadow-black/40`}>
        {/* Brillo: más intenso cuanto más nivel */}
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white blur-3xl"
          style={{ opacity: 0.04 + indice * 0.04 }}
        />
        {indice >= 3 && <div className="carnet-brillo pointer-events-none absolute inset-0" />}
        {color && <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: color }} />}
        {supremo && (
          <>
            <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-kanot-pink/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#ffd166]/25 blur-3xl" />
            <Crown className="pointer-events-none absolute -bottom-6 -right-4 h-36 w-36 rotate-[-12deg] text-[#ffd166]/10" />
          </>
        )}

        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Image src="/app-icons/icon-192.png" alt="" width={28} height={28} className="h-7 w-7 rounded-lg" />
            <span className="text-xs font-black uppercase tracking-[0.25em]">ByKanot</span>
          </span>
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${nivel.chip}`}>
            {indice === 4 && <Sparkles size={12} />}
            {supremo && <Crown size={12} />}
            {nivel.nombre}
          </span>
        </div>

        <div className="relative mt-5 flex items-center gap-4">
          <div className="shrink-0">{foto}</div>
          <div className="min-w-0">
            <p className="truncate text-xl font-black leading-tight">{perfil.nombre || "Sin nombre"}</p>
            {perfil.usuario && <p className={`truncate text-sm font-semibold ${nivel.acento}`}>@{perfil.usuario}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-semibold">
                {perfil.super_admin ? "Superadmin" : NOMBRE_ROL[perfil.role]}
              </span>
              {esMiembro && (
                <a href="#mi-grupo" className="flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color ?? "rgba(255,255,255,0.4)" }} />
                  {perfil.grupo ?? "Sin grupo"}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex items-end justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            Desde {desde}
          </p>
          <button type="button" onClick={onEditar} className="text-[11px] font-semibold text-white/70 underline-offset-2 hover:underline">
            Editar
          </button>
        </div>

        {/* Progreso */}
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full transition-all duration-700 ${supremo ? "bg-gradient-to-r from-[#ffd166] via-kanot-pink to-kanot-electric" : "bg-white/90"}`}
            style={{ width: supremo ? "100%" : `${Math.max(6, ratio * 100)}%` }}
          />
        </div>
      </div>

      {/* Cómo subir de nivel */}
      {siguiente ? (
        <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
          <p className="mb-2 text-sm font-bold">
            Sube a <span className="text-kanot-pink">{siguiente.nombre}</span>
            <span className="ml-1 font-normal text-white/45">
              · {hechos} de {pasos.length}
            </span>
          </p>
          <ul className="flex flex-col gap-1">
            {pasos.map((p) => {
              const contenido = (
                <>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      p.hecho ? "bg-emerald-400 text-kanot-navy-deep" : "border border-white/25"
                    }`}
                  >
                    {p.hecho && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className={`flex-1 ${p.hecho ? "text-white/45 line-through" : ""}`}>{p.texto}</span>
                  {!p.hecho && (p.href || p.accion) && <ChevronRight size={16} className="text-white/30" />}
                </>
              );
              const clase = "flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left text-sm";
              if (p.hecho || (!p.href && !p.accion)) return <li key={p.id} className={clase}>{contenido}</li>;
              return (
                <li key={p.id}>
                  {p.href ? (
                    <a href={p.href} className={`${clase} hover:bg-white/5`}>
                      {contenido}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        p.accion === "editar"
                          ? onEditar()
                          : document.querySelector<HTMLButtonElement>("[aria-label='Cambiar foto de perfil']")?.click()
                      }
                      className={`${clase} hover:bg-white/5`}
                    >
                      {contenido}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {pasos.some((p) => p.id === "bailarin" && !p.hecho) && (
            <p className="mt-2 text-[11px] text-white/40">El bailarín lo vincula un admin de Kanot.</p>
          )}
        </div>
      ) : (
        <p className="text-center text-xs font-semibold text-kanot-pink">
          {supremo ? "👑 Rango Supremo · el más alto de Kanot" : "✨ Perfil completo: eres Kanot Legend"}
        </p>
      )}
    </div>
  );
}
