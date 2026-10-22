// Service worker: cache-first con actualización en segundo plano.
// Cambia VERSION para forzar que los usuarios descarguen una versión nueva.
const VERSION = 'sentinel-v3';
const CORE = ["./assets/index-B4wrIDwG.js","./assets/index-Q5lg3YEE.css","./assets/jetbrains-mono-latin-400-normal-V6pRDFza.woff2","./assets/jetbrains-mono-latin-600-normal-C8RAYTDA.woff2","./assets/jetbrains-mono-latin-700-normal-BYuf6tUa.woff2","./assets/outfit-latin-300-normal-CRYTwY6m.woff2","./assets/outfit-latin-400-normal-BGsTXAXT.woff2","./assets/outfit-latin-500-normal-DKnIMDSk.woff2","./assets/outfit-latin-600-normal-B7SfZ07L.woff2","./assets/outfit-latin-700-normal-Cu9v6i1X.woff2","./assets/outfit-latin-800-normal-CQna6-G7.woff2","./assets/outfit-latin-900-normal-D7VxKg29.woff2","./assets/sentinel_stars_banner_1792624012611-DImedx1s.jpg",'./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) =>
      Promise.all(CORE.map((url) => c.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // Navegaciones (abrir la app/URL): red primero, caché como respaldo.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
