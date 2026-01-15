// sw.js — SIMPLE & STABLE (pour index_updated.html)

const CACHE_NAME = "vine-stock-updated-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json"
];

// Installation : met en cache le minimum vital
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .catch(() => {})
  );
});

// Activation : supprime les anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch :
// - HTML → réseau d’abord (pour recevoir les mises à jour)
// - autres fichiers → cache d’abord
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Ne touche qu’aux fichiers du site
  if (url.origin !== self.location.origin) return;

  const accept = req.headers.get("accept") || "";

  // Pages HTML
  if (req.mode === "navigate" || accept.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Autres assets
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      });
    })
  );
});
