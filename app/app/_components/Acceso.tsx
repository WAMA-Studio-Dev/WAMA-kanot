"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { getSupabase } from "@/app/lib/supabase/client";
import { Aviso, Boton, Etiqueta, Input } from "./ui";

type Modo = "entrar" | "registro" | "olvido";

export default function Acceso() {
  const [modo, setModo] = useState<Modo>("entrar");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

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
          setOk("¡Cuenta creada! Revisa tu correo para confirmarla y después entra aquí.");
          setModo("entrar");
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

  const titulos: Record<Modo, string> = {
    entrar: "Entra en tu cuenta",
    registro: "Crea tu cuenta",
    olvido: "Recuperar contraseña",
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image src="/imagenes/logo/bykanot-icon.png" alt="ByKanot" width={88} height={88} priority />
        <div>
          <h1 className="text-2xl font-bold">App Kanot</h1>
          <p className="mt-1 text-sm text-white/60">{titulos[modo]}</p>
        </div>
      </div>

      <form onSubmit={enviar} className="flex flex-col gap-4">
        {modo === "registro" && (
          <Etiqueta texto="Nombre y apellidos">
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required autoComplete="name" />
          </Etiqueta>
        )}
        <Etiqueta texto="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </Etiqueta>
        {modo !== "olvido" && (
          <Etiqueta texto="Contraseña">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={modo === "registro" ? "new-password" : "current-password"}
            />
          </Etiqueta>
        )}

        {error && <Aviso>{error}</Aviso>}
        {ok && <Aviso tipo="ok">{ok}</Aviso>}

        <Boton type="submit" disabled={enviando} className="mt-2 py-3">
          {enviando ? "Un momento…" : modo === "entrar" ? "Entrar" : modo === "registro" ? "Crear cuenta" : "Enviar correo"}
        </Boton>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm text-white/60">
        {modo === "entrar" ? (
          <>
            <button type="button" className="hover:text-kanot-pink" onClick={() => setModo("registro")}>
              ¿No tienes cuenta? <span className="font-semibold text-kanot-pink">Regístrate</span>
            </button>
            <button type="button" className="hover:text-kanot-pink" onClick={() => setModo("olvido")}>
              He olvidado mi contraseña
            </button>
          </>
        ) : (
          <button type="button" className="hover:text-kanot-pink" onClick={() => setModo("entrar")}>
            ← Volver a entrar
          </button>
        )}
      </div>
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
