"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSupabase } from "@/app/lib/supabase/client";
import { Aviso, Boton, Etiqueta, Input } from "../_components/ui";

/** Llega aquí desde el correo de "He olvidado mi contraseña". */
export default function Restablecer() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    const { error } = await getSupabase().auth.updateUser({ password });
    setEnviando(false);
    if (error) setError("El enlace ha caducado o no es válido. Pide otro correo desde la pantalla de entrada.");
    else router.replace("/app");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <Image src="/imagenes/logo/bykanot-icon.png" alt="ByKanot" width={72} height={72} />
        <h1 className="text-2xl font-bold">Nueva contraseña</h1>
      </div>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Etiqueta texto="Contraseña nueva">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </Etiqueta>
        {error && <Aviso>{error}</Aviso>}
        <Boton type="submit" disabled={enviando} className="py-3">
          {enviando ? "Guardando…" : "Guardar contraseña"}
        </Boton>
      </form>
    </div>
  );
}
