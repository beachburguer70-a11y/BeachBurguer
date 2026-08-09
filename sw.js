const CACHE = "beach-burguer-v8-54";
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


// V8.31 - notificações de status do pedido
self.addEventListener("push", event => {
  let data={};
  try{ data=event.data ? event.data.json() : {}; }catch{ data={body:event.data?.text()||""}; }
  const title=data.title || "Beach Burguer";
  const options={
    body:data.body || "Seu pedido foi atualizado.",
    icon:"./assets/logo.png",
    badge:"./assets/logo.png",
    tag:data.tag || undefined,
    data:{url:data.url || "./"}
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url=event.notification.data?.url || "./";
  event.waitUntil(
    clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
      for(const client of list){
        if("focus" in client)return client.focus();
      }
      if(clients.openWindow)return clients.openWindow(url);
    })
  );
});
