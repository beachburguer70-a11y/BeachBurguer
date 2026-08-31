const CACHE="beach-burguer-loja-app-v31-53-financeiro-addon-cloudflare";
const STATIC=["/garcom.html","/garcom.js","/assets/logo.png","/assets/loja-pwa-192.png","/assets/loja-pwa-512.png","/assets/loja-pwa-maskable-512.png","/loja-app/manifest.json","/loja-garcom-modal.js","/loja-garcom-modal.css"];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).catch(()=>{}));
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith("beach-burguer-loja-app-")&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return;

  // APIs are always live and never cached.
  if(url.pathname.startsWith("/api/")){
    event.respondWith(fetch(req));
    return;
  }

  // Pages/code are network-first, so the installed app receives each new deploy immediately.
  const live = req.mode==="navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith(".js") || url.pathname.endsWith(".css");
  if(live){
    event.respondWith(fetch(req,{cache:"no-store"}).catch(()=>caches.match(req).then(r=>r||caches.match("/loja-app/"))));
    return;
  }

  // Images/manifest can use cache, with network fallback.
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
