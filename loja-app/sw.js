const CACHE="beach-burguer-loja-app-v31-9";
const STATIC=["/loja-app/","/loja-app/garcom.html","/loja-app/relatorios.html","/assets/logo.png","/assets/loja-pwa-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).catch(()=>{}));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("beach-burguer-loja-app-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
 const req=e.request,url=new URL(req.url);
 if(url.origin!==location.origin||url.pathname.startsWith("/api/"))return;
 if(req.mode==="navigate"){e.respondWith(fetch(req).catch(()=>caches.match(req).then(r=>r||caches.match("/loja-app/"))));return;}
 e.respondWith(caches.match(req).then(c=>c||fetch(req)));
});