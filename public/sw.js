// Service worker de la App ByKanot: permite instalarla, recibir notificaciones
// y ver lo último guardado cuando no hay conexión (p. ej. en el pabellón).
//
// - Pantallas y datos: primero se pide a internet (siempre lo más nuevo) y se guarda una copia;
//   si no hay conexión, se enseña la copia guardada.
// - Archivos de la web que no cambian (/_next/static, iconos, imágenes): se guardan y se usan directamente.
// Lo guardado vive solo en este móvil y se borra al cerrar sesión.

const VERSION = "v1";
const PANTALLAS = `kanot-pantallas-${VERSION}`;
const ESTATICOS = `kanot-estaticos-${VERSION}`;
const DATOS = `kanot-datos-${VERSION}`;
const MAX_DATOS = 400;
const EN_PRUEBAS = /^(localhost|127\.|192\.168\.|10\.)/.test(self.location.hostname);

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const validas = [PANTALLAS, ESTATICOS, DATOS];
      for (const nombre of await caches.keys()) {
        if (nombre.startsWith("kanot-") && !validas.includes(nombre)) await caches.delete(nombre);
      }
      await self.clients.claim();
    })(),
  );
});

// La app pide borrar lo guardado al cerrar sesión.
self.addEventListener("message", (event) => {
  if (event.data === "borrar-datos") {
    event.waitUntil(Promise.all([caches.delete(DATOS), caches.delete(PANTALLAS)]));
  }
});

async function recortar(nombre, max) {
  const cache = await caches.open(nombre);
  const claves = await cache.keys();
  for (let i = 0; i < claves.length - max; i++) await cache.delete(claves[i]);
}

/** Internet primero; si falla, lo guardado. */
async function redPrimero(request, nombreCache) {
  const cache = await caches.open(nombreCache);
  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) {
      cache.put(request, respuesta.clone());
      if (nombreCache === DATOS && Math.random() < 0.05) recortar(DATOS, MAX_DATOS);
    }
    return respuesta;
  } catch (err) {
    const guardada = await cache.match(request);
    if (guardada) return guardada;
    // Pantalla nunca abierta: al menos el Inicio de la app.
    if (request.mode === "navigate") {
      const inicio = await cache.match("/app");
      if (inicio) return inicio;
    }
    throw err;
  }
}

/** Lo guardado primero (archivos que no cambian). */
async function cachePrimero(request) {
  const cache = await caches.open(ESTATICOS);
  const guardada = await cache.match(request);
  if (guardada) return guardada;
  const respuesta = await fetch(request);
  if (respuesta.ok) cache.put(request, respuesta.clone());
  return respuesta;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Misma web
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/api/")) return; // envíos y avisos: nunca de la caché
    if (url.pathname.startsWith("/_next/static/") || /\.(png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
      // En la versión de pruebas (ordenador o Wi-Fi de casa) los archivos cambian a cada momento: internet primero.
      event.respondWith(EN_PRUEBAS ? redPrimero(request, ESTATICOS) : cachePrimero(request));
      return;
    }
    // Pantallas de la app (y los datos que usa Next para cambiar de pantalla)
    if (url.pathname.startsWith("/app")) {
      event.respondWith(redPrimero(request, PANTALLAS));
    }
    return;
  }

  // Supabase: lecturas de datos y archivos (no el inicio de sesión ni el tiempo real)
  if (url.hostname.endsWith(".supabase.co")) {
    if (url.pathname.startsWith("/rest/v1/") || url.pathname.startsWith("/storage/v1/object/")) {
      event.respondWith(redPrimero(request, DATOS));
    }
  }
});

// Notificación recibida: { titulo, cuerpo, url }
self.addEventListener("push", (event) => {
  let datos = {};
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { cuerpo: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(datos.titulo || "ByKanot", {
      body: datos.cuerpo || "",
      icon: "/app-icons/icon-192.png",
      badge: "/app-icons/icon-192.png",
      data: { url: datos.url || "/app" },
    }),
  );
});

// Al tocar la notificación, abre (o enfoca) la app en la pantalla indicada.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/app", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      for (const v of ventanas) {
        if (v.url.startsWith(self.location.origin + "/app") && "focus" in v) {
          v.navigate(url);
          return v.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
