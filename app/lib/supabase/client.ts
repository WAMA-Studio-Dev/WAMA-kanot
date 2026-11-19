import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigurado = Boolean(url && key);

let client: SupabaseClient | null = null;

/**
 * Cliente de Supabase del navegador.
 *
 * La sesión se guarda en localStorage (no en cookies): Safari borra a los 7 días las cookies
 * creadas desde JavaScript, y eso obligaba a volver a entrar. En la app instalada en la pantalla
 * de inicio, localStorage se conserva, y el token se renueva solo al abrir la app.
 */
export function getSupabase(): SupabaseClient {
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  client ??= createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storageKey: "bykanot-sesion",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
  return client;
}
