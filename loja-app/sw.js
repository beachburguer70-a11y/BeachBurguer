const CACHE="beach-burguer-loja-app-v31-6";
const STATIC=[
  "/loja-app/",
  "/loja-app/garcom.html",
  "/loja-app/relatorios.html",
  "/style.css",
  "/garcom.css",
  "/assets/logo.png",
  "/assets/loja-pwa-192.png",
  "/assets/loja-pwa-512.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("beach-burguer-loja-app-")&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  const req=event.request;
  const url=new URL(req.url);

  // Never cache API calls or cross-origin requests.
  if(url.origin!==location.origin || url.pathname.startsWith("/api/")) return;

  if(req.mode==="navigate"){
    event.respondWith(fetch(req).catch(()=>caches.match(req).then(r=>r||caches.match("/loja-app/"))));
    return;
  }

  event.respondWith(
    caches.match(req).then(cached=>{
      const network=fetch(req).then(resp=>{
        if(resp && resp.ok){
          const clone=resp.clone();
          caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{});
        }
        return resp;
      }).catch(()=>cached);
      return cached||network;
    })
  );
});
