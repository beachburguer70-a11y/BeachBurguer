const CACHE="beach-burguer-cliente-app-v31-79-localizacao-obrigatoria";
const STATIC=[
  "/cliente-app/",
  "/cliente-app/cardapio.html",
  "/cardapio.html",
  "/cardapio.js?v=31_75_sem_fotos_revisao",
  "/style.css?v=850",
  "/cardapio.css",
  "/script.js?v=31_79_localizacao_obrigatoria",
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

function atualizarEmSegundoPlano(req){
  return fetch(req).then(resp=>{
    if(resp&&resp.ok){
      const clone=resp.clone();
      caches.open(CACHE).then(c=>c.put(req,clone)).catch(()=>{});
    }
    return resp;
  }).catch(()=>null);
}

self.addEventListener("fetch",e=>{
  const req=e.request;
  const url=new URL(req.url);

  // Dados do pedido/loja nunca usam cache: continuam sempre atuais.
  if(url.origin!==location.origin || url.pathname.startsWith("/api/")) return;

  // V31.61: app shell e arquivos estáticos respondem do cache imediatamente
  // e são atualizados em segundo plano. Isso recupera a abertura rápida do app
  // sem voltar a aumentar as chamadas de API.
  if(req.method==="GET"){
    e.respondWith((async()=>{
      const cached=await caches.match(req,{ignoreSearch:false});
      if(cached){
        e.waitUntil(atualizarEmSegundoPlano(req));
        return cached;
      }

      if(req.mode==="navigate"){
        const shell=await caches.match(url.pathname==="/cliente-app/cardapio.html"?"/cliente-app/cardapio.html":"/cliente-app/");
        if(shell){
          e.waitUntil(atualizarEmSegundoPlano(req));
          return shell;
        }
      }

      const net=await atualizarEmSegundoPlano(req);
      if(net)return net;
      return caches.match("/cliente-app/");
    })());
  }
});
