"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { BarChart3, Camera, ChevronRight, Eye, FolderOpen, KeyRound, LogOut, Pencil, Trash2, Users } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { useAuth } from "../_components/AuthProvider";
import Avatar, { guardarMiPerfil, subirFotoPerfil } from "../_components/Avatar";
import type { RolVista } from "../_components/AuthProvider";
import ElegirGrupo from "../_components/ElegirGrupo";
import MiFamilia from "../_components/MiFamilia";
import ActivarNotificaciones from "../_components/ActivarNotificaciones";
import UsoAlmacenamiento from "../_components/UsoAlmacenamiento";
import { colorGrupo } from "../_components/secciones";
import InstalarApp from "../_components/InstalarApp";
import { Aviso, Boton, Etiqueta, Input, Modal } from "../_components/ui";

const NOMBRE_ROL = {
  pendiente: "Pendiente",
  usuario: "Usuario",
  miembro: "Miembro de Kanot",
  editor: "Editor",
  admin: "Admin",
} as const;

export default function PaginaPerfil() {
  const { perfil, esEditor, esAdmin, esSuper, rol, salir } = useAuth();
  const [cambiarClave, setCambiarClave] = useState(false);
  const [editar, setEditar] = useState(false);
  if (!perfil) return null;

  const enlaces = [
    { href: "/app/archivos", nombre: "Gestor de archivos", ayuda: "Todos los archivos del equipo", icono: FolderOpen, ver: esEditor },
    { href: "/app/usuarios", nombre: "Usuarios", ayuda: "Aprobar cuentas y asignar roles", icono: Users, ver: esAdmin },
    { href: "/app/estadisticas", nombre: "Estadísticas", ayuda: "Quién usa la app y qué mira", icono: BarChart3, ver: esAdmin },
  ].filter((e) => e.ver);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <FotoEditable />
        <div>
          <h1 className="text-xl font-bold">{perfil.nombre || "Sin nombre"}</h1>
          <p className="text-sm text-white/55">{perfil.email}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-kanot-pink/15 px-3 py-1 text-xs font-semibold text-kanot-pink">
              {perfil.super_admin ? "Superadmin" : NOMBRE_ROL[perfil.role]}
            </span>
            {rol === "miembro" && (
              <a
                href="#mi-grupo"
                className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold hover:border-white/50"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colorGrupo(perfil.grupo ?? "") }}
                />
                {perfil.grupo ?? "Sin grupo"} · cambiar
              </a>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditar(true)}
          className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-kanot-pink hover:text-kanot-pink"
        >
          <Pencil size={14} /> Editar perfil
        </button>
      </div>

      {rol === "miembro" && <ElegirGrupo />}

      {rol === "miembro" && <MiFamilia />}

      <InstalarApp />
      <ActivarNotificaciones />

      {enlaces.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">Equipo</h2>
          <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5">
                  <e.icono size={20} className="text-kanot-pink" />
                  <span className="flex-1">
                    <span className="block font-medium">{e.nombre}</span>
                    <span className="block text-xs text-white/50">{e.ayuda}</span>
                  </span>
                  <ChevronRight size={18} className="text-white/30" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {esAdmin && <UsoAlmacenamiento />}

      {esSuper && <VerComo />}

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">Cuenta</h2>
        <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-black/25">
          <li>
            <button
              type="button"
              onClick={() => setCambiarClave(true)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5"
            >
              <KeyRound size={20} className="text-kanot-pink" />
              <span className="flex-1 font-medium">Cambiar contraseña</span>
              <ChevronRight size={18} className="text-white/30" />
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={salir}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-red-200 hover:bg-white/5"
            >
              <LogOut size={20} />
              <span className="flex-1 font-medium">Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </section>

      {cambiarClave && <CambiarClave onCerrar={() => setCambiarClave(false)} />}
      {editar && <EditarPerfil onCerrar={() => setEditar(false)} />}
    </div>
  );
}

function CambiarClave({ onCerrar }: { onCerrar: () => void }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await getSupabase().auth.updateUser({ password: clave });
    setEnviando(false);
    if (error) setError(error.message);
    else setOk(true);
  }

  return (
    <Modal titulo="Cambiar contraseña" onCerrar={onCerrar}>
      {ok ? (
        <div className="flex flex-col gap-4">
          <Aviso tipo="ok">Contraseña cambiada.</Aviso>
          <Boton onClick={onCerrar}>Cerrar</Boton>
        </div>
      ) : (
        <form onSubmit={guardar} className="flex flex-col gap-4">
          <Etiqueta texto="Contraseña nueva">
            <Input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              minLength={6}
              required
              autoFocus
              autoComplete="new-password"
            />
          </Etiqueta>
          {error && <Aviso>{error}</Aviso>}
          <Boton type="submit" disabled={enviando}>
            {enviando ? "Guardando…" : "Guardar"}
          </Boton>
        </form>
      )}
    </Modal>
  );
}

/** Foto grande con botón de cámara: al elegir una imagen se sube y se guarda al momento. */
function FotoEditable() {
  const { perfil, recargarPerfil } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function elegir(archivo: File | undefined) {
    if (!archivo || !perfil) return;
    setSubiendo(true);
    setError(null);
    try {
      const url = await subirFotoPerfil(perfil.id, archivo);
      await guardarMiPerfil(perfil.nombre ?? "", url);
      await recargarPerfil();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={subiendo}
        aria-label="Cambiar foto de perfil"
        className="group relative rounded-full"
      >
        <Avatar perfil={perfil} tamano={104} className={`ring-4 ring-kanot-navy-deep ${subiendo ? "opacity-50" : ""}`} />
        <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-kanot-navy bg-kanot-pink text-kanot-navy-deep transition group-hover:scale-110">
          {subiendo ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-kanot-navy-deep/30 border-t-kanot-navy-deep" />
          ) : (
            <Camera size={16} />
          )}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          elegir(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && <Aviso>{error}</Aviso>}
    </div>
  );
}

function EditarPerfil({ onCerrar }: { onCerrar: () => void }) {
  const { perfil, recargarPerfil } = useAuth();
  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [quitarFoto, setQuitarFoto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setGuardando(true);
    setError(null);
    try {
      if (quitarFoto) {
        // Borra los archivos de su carpeta (si falla, la foto igualmente deja de mostrarse).
        const almacen = getSupabase().storage.from("avatares");
        const { data } = await almacen.list(perfil.id);
        if (data?.length) await almacen.remove(data.map((a) => `${perfil.id}/${a.name}`));
      }
      await guardarMiPerfil(nombre, quitarFoto ? null : (perfil.avatar_url ?? null));
      await recargarPerfil();
      onCerrar();
    } catch (err) {
      setError(mensajeError(err));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Editar perfil" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Etiqueta texto="Nombre y apellidos">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus autoComplete="name" />
        </Etiqueta>
        {perfil?.avatar_url && (
          <label className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm">
            <input type="checkbox" checked={quitarFoto} onChange={(e) => setQuitarFoto(e.target.checked)} className="h-4 w-4 accent-kanot-pink" />
            <Trash2 size={16} className="text-white/50" /> Quitar mi foto
          </label>
        )}
        <p className="text-xs text-white/45">Para cambiar la foto, pulsa sobre ella en tu perfil.</p>
        {error && <Aviso>{error}</Aviso>}
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </Boton>
      </form>
    </Modal>
  );
}

function mensajeError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (/actualizar_mi_perfil|function .* does not exist|schema cache/i.test(msg))
    return "Falta activar las fotos de perfil en la base de datos (SQL 004).";
  if (/bucket not found/i.test(msg)) return "Falta activar las fotos de perfil en la base de datos (SQL 004).";
  if (/exceeded|too large|maximum/i.test(msg)) return "La foto es demasiado grande.";
  return msg;
}

const VISTAS: { rol: RolVista | null; nombre: string; ayuda: string }[] = [
  { rol: null, nombre: "Yo", ayuda: "Superadmin: todo" },
  { rol: "admin", nombre: "Admin", ayuda: "Todo + gestiona roles" },
  { rol: "editor", nombre: "Editor", ayuda: "Todo menos roles" },
  { rol: "miembro", nombre: "Miembro", ayuda: "Kanot Crew, sin editar" },
  { rol: "usuario", nombre: "Usuario", ayuda: "Sin Kanot Crew ni Agencia" },
];

/** Solo superadmin: ver la app como la ve cada rol (no cambia su rol real). */
function VerComo() {
  const { verComo, setVerComo } = useAuth();
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-widest text-white/50">
        <Eye size={14} /> Ver la app como
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {VISTAS.map((v) => {
          const activo = verComo === v.rol;
          return (
            <button
              key={v.nombre}
              type="button"
              onClick={() => setVerComo(v.rol)}
              aria-pressed={activo}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                activo ? "border-kanot-pink bg-kanot-pink/15" : "border-white/10 bg-black/25 hover:border-white/30"
              }`}
            >
              <span className={`block text-sm font-bold ${activo ? "text-kanot-pink" : ""}`}>{v.nombre}</span>
              <span className="block text-[11px] leading-snug text-white/50">{v.ayuda}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 px-1 text-[11px] text-white/40">
        Solo cambia lo que ves tú en este móvil. Tu rol de superadmin no cambia.
      </p>
    </section>
  );
}
