// Service worker de la App ByKanot: permite instalarla y recibir notificaciones.
// No guarda nada en caché para que el contenido esté siempre actualizado.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});

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
