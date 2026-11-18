"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { getSupabase } from "@/app/lib/supabase/client";
import { Aviso } from "./ui";
import { BotonDescargar } from "./InstalarApp";

type Modo = "entrar" | "registro" | "olvido";

const APARTADOS = ["Kanot Crew", "Kodigo Klub", "Kanot Kamp", "Podcast", "Merch"];

export default function Acceso() {
  const [modo, setModo] = useState<Modo>("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function cambiarModo(m: Modo) {
    setModo(m);
    setError(null);
    setOk(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    setOk(null);
    const supabase = getSupabase();
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (modo === "registro") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nombre },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setModo("entrar");
          setOk("¡Cuenta creada! Revisa tu correo para confirmarla y después entra aquí.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/app/restablecer`,
        });
        if (error) throw error;
        setOk("Te hemos enviado un correo para crear una contraseña nueva.");
      }
    } catch (err) {
      setError(traducirError(err instanceof Error ? err.message : String(err)));
    } finally {
      setEnviando(false);
    }
  }

  const textoBoton = enviando
    ? "Un momento…"
    : modo === "entrar"
      ? "Entrar"
      : modo === "registro"
        ? "Crear cuenta"
        : "Enviar correo";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-kanot-navy-deep md:flex-row">
      {/* ---------- Portada con foto ---------- */}
      <div className="relative flex min-h-[42dvh] flex-1 flex-col justify-end px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))] md:min-h-dvh md:justify-center md:px-14">
        <Image
          src="/imagenes/hero/fondo-hero.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover object-[50%_70%]"
        />
        {/* Degradados para que el texto se lea y la foto se funda con el panel */}
        <div className="absolute inset-0 bg-gradient-to-b from-kanot-navy-deep/70 via-kanot-navy/55 to-kanot-navy-deep md:bg-gradient-to-r md:from-kanot-navy-deep/40 md:via-kanot-navy/60 md:to-kanot-navy-deep" />
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-kanot-pink/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-kanot-electric/25 blur-3xl" />

        <div className="relative flex flex-col gap-4">
          <Image
            src="/imagenes/logo/bykanot-icon.png"
            alt="ByKanot"
            width={72}
            height={72}
            priority
            className="h-16 w-16 rounded-2xl shadow-xl shadow-black/40 md:h-20 md:w-20"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-kanot-pink">App oficial · ByKanot</p>
            <h1 className="mt-2 text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
              Kanot,
              <br />
              <span className="text-kanot-pink">en tu bolsillo</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {APARTADOS.map((a) => (
              <span
                key={a}
                className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-sm"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Panel del formulario ---------- */}
      <div className="relative z-10 -mt-6 rounded-t-[2rem] border-t border-white/10 bg-kanot-navy-deep px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-7 shadow-[0_-20px_60px_rgba(0,0,0,0.45)] md:mt-0 md:flex md:w-[440px] md:flex-col md:justify-center md:rounded-none md:border-l md:border-t-0 md:px-10">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
          {modo === "olvido" ? (
            <div>
              <button
                type="button"
                onClick={() => cambiarModo("entrar")}
                className="mb-4 flex items-center gap-1.5 text-sm text-white/60 hover:text-kanot-pink"
              >
                <ArrowLeft size={16} /> Volver
              </button>
              <h2 className="text-2xl font-bold">Recuperar contraseña</h2>
              <p className="mt-1 text-sm text-white/60">Te mandamos un enlace para crear una nueva.</p>
            </div>
          ) : (
            <div role="tablist" className="grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1">
              {(["entrar", "registro"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={modo === m}
                  onClick={() => cambiarModo(m)}
                  className={`rounded-full py-2.5 text-sm font-bold transition-colors ${
                    modo === m ? "bg-kanot-pink text-kanot-navy-deep" : "text-white/65 hover:text-white"
                  }`}
                >
                  {m === "entrar" ? "Entrar" : "Crear cuenta"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={enviar} className="flex flex-col gap-3">
            {modo === "registro" && (
              <CampoIcono icono={<User size={18} />}>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Nombre y apellidos"
                  aria-label="Nombre y apellidos"
                  className={INPUT}
                />
              </CampoIcono>
            )}
            <CampoIcono icono={<Mail size={18} />}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                placeholder="Email"
                aria-label="Email"
                className={INPUT}
              />
            </CampoIcono>
            {modo !== "olvido" && (
              <CampoIcono icono={<Lock size={18} />}>
                <input
                  type={verPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={modo === "registro" ? "new-password" : "current-password"}
                  placeholder={modo === "registro" ? "Contraseña (mín. 6 caracteres)" : "Contraseña"}
                  aria-label="Contraseña"
                  className={`${INPUT} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/45 hover:text-white"
                >
                  {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </CampoIcono>
            )}

            {modo === "entrar" && (
              <button
                type="button"
                onClick={() => cambiarModo("olvido")}
                className="self-end text-xs font-medium text-white/55 hover:text-kanot-pink"
              >
                ¿Has olvidado tu contraseña?
              </button>
            )}

            {error && <Aviso>{error}</Aviso>}
            {ok && <Aviso tipo="ok">{ok}</Aviso>}

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 rounded-full bg-kanot-pink py-3.5 text-base font-bold text-kanot-navy-deep shadow-lg shadow-kanot-pink/25 transition hover:bg-white disabled:opacity-60"
            >
              {textoBoton}
            </button>
          </form>

          {modo === "registro" && (
            <p className="text-center text-xs leading-relaxed text-white/45">
              Al crear tu cuenta, el equipo de Kanot la revisará y te dará acceso.
            </p>
          )}

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/30">
            <span className="h-px flex-1 bg-white/10" /> o <span className="h-px flex-1 bg-white/10" />
          </div>
          <BotonDescargar />
        </div>
      </div>
    </div>
  );
}

const INPUT =
  "w-full rounded-2xl border border-white/12 bg-white/[0.06] py-3.5 pl-11 pr-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-kanot-pink focus:bg-white/10";

function CampoIcono({ icono, children }: { icono: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/45">{icono}</span>
      {children}
    </div>
  );
}

function traducirError(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "Email o contraseña incorrectos.";
  if (/email not confirmed/i.test(msg)) return "Tienes que confirmar tu email antes de entrar (revisa tu correo).";
  if (/already registered/i.test(msg)) return "Ya existe una cuenta con ese email.";
  if (/password should be at least/i.test(msg)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/rate limit/i.test(msg)) return "Demasiados intentos. Espera un poco y vuelve a probar.";
  return msg;
}
