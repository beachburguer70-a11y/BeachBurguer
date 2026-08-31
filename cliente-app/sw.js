const CACHE="beach-burguer-cliente-app-v31-58-addon-obrigatorio-alinhado";
const STATIC=[
  "/cliente-app/",
  "/cliente-app/cardapio.html",
  "/cardapio.html",
  "/cardapio.js?v=31_58_addon_obrigatorio_alinhado",
  "/style.css?v=850",
  "/cardapio.css",
  "/script.js?v=31_56_cliente_app_addon_obrigatorio",
  "/assets/logo.png",
  "/assets/pwa-192.png",
  "/assets/pwa-512.png",
  "/assets/pwa-maskable-512.png",
  "/cliente-app/manifest.json"
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

  const mutable = req.mode==="navigate" || /\.(?:html|js|css)$/.test(url.pathname) || url.pathname==="/cliente-app/";
  if(mutable){
    e.respondWith(
      fetch(req,{cache:"no-store"}).then(resp=>{
        if(resp&&resp.ok){
          const clone=resp.clone();
          caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{});
        }
        return resp;
      }).catch(()=>caches.match(req).then(r=>r||caches.match("/cliente-app/")))
    );
    return;
  }

  e.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(resp=>{
    if(resp&&resp.ok){const clone=resp.clone();caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{});}
    return resp;
  })));
});
