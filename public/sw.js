// Service worker mínimo de la App Kanot: permite instalarla como app.
// No guarda nada en caché para que el contenido esté siempre actualizado.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
