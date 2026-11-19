
Ya vuelve a cargar. El servidor de pruebas se había apagado y lo he encendido otra vez.

Recarga la página en el móvil: http://192.168.1.11:3000/app

La primera vez puede tardar unos segundos. Si sigue sin cargar, comprueba que el móvil está en la misma Wi-Fi que el ordenador.

Vamos a seguir mejorando la app

Te propongo cosas por orden de utilidad. Elige las que quieras:

Para el día a día de la crew

Confirmar asistencia a los ensayos: en cada ensayo del calendario, botones “Voy” y “No puedo”. Los editores verían quién falta antes de empezar.
Recordatorio automático el día antes de cada ensayo o campeonato, que llegue al móvil sin que nadie tenga que enviarlo.
Cuenta atrás en Inicio para el próximo campeonato, por ejemplo “Faltan 12 días para Jack Unit”.
Para los admins
4. Avisar a quien no ha pagado: un botón en las inscripciones que mande la notificación solo a los que no han pagado.
5. Avisar a quien no ha entregado la autorización: ahora el recordatorio va a toda la crew. Con esto iría solo a los que faltan.

Secciones que quedaban pendientes
6. Merch: mejores fotos, tallas y un botón para pedir por WhatsApp.
7. Kanot Kamp: cambiar la presentación cuando tengas los datos de los profesores.
8. Agencia y Fotografía: darles una presentación más cuidada.

Yo empezaría por la 1, la 4 y la 5. Se usan cada semana y aprovechan lo que ya está hecho.

¿Cuáles hacemos?

El 4 me parece bien tipo que al admin al lao de la persona le salga para poner un aviso de pasar autorizacion y de pagar campeonatos tipo que el admin le pueda dar

Ejecutó 5 comandos
Ya están los botones de “Avisar” en autorizaciones y pagos; corrijo un último error y lo reviso.

Ejecutó 2 comandos
Ya está. Al lado de cada persona a la que le falta algo hay un botón rosa “Avisar” con una campana. Al pulsarlo, le llega una notificación al móvil solo a esa persona.

Autorizaciones (Competición → campeonato → Ver entregas)

Cada persona que falta tiene “Avisar” al lado de “Subir”. Le llega: “Falta tu autorización · Jack Unit — Descarga la autorización oficial, fírmala y súbela en la app.”
Abajo hay un botón “Avisar a todos los que faltan (N)”. Sustituye al recordatorio que antes iba a toda la crew.
Pagos (Competición → campeonato → Ver inscripciones y opciones)

Cada bailarín sin pagar tiene “Avisar”. Le llega con su importe: “Pago pendiente · Rock Da House — Falta pagar la inscripción de [nombre]: 30 €.”
También hay un botón “Avisar a todos los que no han pagado (N)”.
El aviso llega a la cuenta que tiene asignado ese bailarín. Si no tiene cuenta asignada, aparece “Sin cuenta asignada”.
Lo que ve el admin después de avisar

“Avisado el 19 nov” debajo de la persona, para que no se avise dos veces sin querer.
“No tiene las notificaciones activadas” si no le ha podido llegar. A esa persona habrá que escribirle por WhatsApp.
Lo que tienes que hacer

Pega en Supabase supabase/021_avisos_personales.sql.
Haz el push. El aviso se envía desde el servidor, y la versión de pruebas del ordenador no tiene la clave para enviar notificaciones. Hasta que hagas el push solo verás los botones, sin que llegue nada.
Pruébalo contigo: activa las notificaciones en tu Perfil y avísate desde una persona que tengas asignada.
He comprobado que compila y que la página carga, pero no lo he podido probar con sesión iniciada.

Ahora puedes avisar al móvil de cada persona a la que le falta la autorización o el pago, una a una o a todas a la vez. Falta pegar el SQL 021 en Supabase y hacer el push, porque el aviso se envía desde el servidor. Compila bien, pero no lo he probado con sesión iniciada.

¿Has pegado ya el SQL 021 en Supabase?



-- Avisos a personas concretas (falta autorización, falta pagar) y registro de cuándo se avisó.
-- Pega esto en Supabase → SQL Editor → New query → Run.

-- Móviles de unas cuentas concretas (solo editores y admins).
create or replace function public.push_personas(p_usuarios uuid[])
returns table (user_id uuid, endpoint text, p256dh text, auth text)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.es_editor() then
    raise exception 'Solo editores y admins pueden enviar notificaciones';
  end if;
  return query
    select s.user_id, s.endpoint, s.p256dh, s.auth
    from public.push_subs s
    where s.user_id = any (p_usuarios);
end;
$$;

revoke execute on function public.push_personas(uuid[]) from public, anon;
grant execute on function public.push_personas(uuid[]) to authenticated;

-- Cuándo se avisó a cada persona (para que el admin vea "Avisado el …").
create table if not exists public.avisos_enviados (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas (id) on delete cascade,
  tipo text not null check (tipo in ('autorizacion', 'pago')),
  user_id uuid references auth.users (id) on delete cascade,
  bailarin_id uuid references public.bailarines (id) on delete cascade,
  enviado_por uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists avisos_enviados_entrada_idx on public.avisos_enviados (entrada_id, tipo);

alter table public.avisos_enviados enable row level security;

drop policy if exists "editores ven avisos enviados" on public.avisos_enviados;
create policy "editores ven avisos enviados" on public.avisos_enviados
  for select to authenticated using ((select public.es_editor()));

drop policy if exists "editores registran avisos" on public.avisos_enviados;
create policy "editores registran avisos" on public.avisos_enviados
  for insert to authenticated with check ((select public.es_editor()));

