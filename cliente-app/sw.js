const CACHE="beach-burguer-cliente-app-v31-10";
const STATIC=[
  "/cliente-app/",
  "/cliente-app/cardapio.html",
  "/style.css",
  "/cardapio.css",
  "/script.js?v=31_8",
  "/cardapio.js?v=31_10",
  "/assets/logo.png",
  "/assets/pwa-192.png",
  "/assets/pwa-512.png"
];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k.startsWith("beach-burguer-cliente-app-")&&k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",e=>{
  const req=e.request;
  const url=new URL(req.url);
  if(url.origin!==location.origin || url.pathname.startsWith("/api/")) return;

  if(req.mode==="navigate"){
    e.respondWith(fetch(req).catch(()=>caches.match(req).then(r=>r||caches.match("/cliente-app/"))));
    return;
  }

  e.respondWith(
    caches.match(req).then(cached=>{
      const net=fetch(req).then(resp=>{
        if(resp&&resp.ok){
          const clone=resp.clone();
          caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{});
        }
        return resp;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});
