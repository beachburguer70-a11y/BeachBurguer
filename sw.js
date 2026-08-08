const CACHE = "beach-burguer-v8-24";
const STATIC_FILES = [
  "./assets/logo.png",
  "./manifest.json"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_FILES))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  // APIs nunca entram em cache.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // HTML, JS e CSS: rede primeiro para o celular receber sempre a versão atual.
  const isPage = req.mode === "navigate" || url.pathname.endsWith(".html");
  const isCode = url.pathname.endsWith(".js") || url.pathname.endsWith(".css");

  if (isPage || isCode) {
    event.respondWith(
      fetch(req)
        .then(response => response)
        .catch(() => caches.match(req))
    );
    return;
  }

  // Imagens/manifest: cache com fallback para rede.
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
