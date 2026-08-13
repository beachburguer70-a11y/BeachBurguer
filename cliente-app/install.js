(() => {
  "use strict";
  let deferredPrompt=null;
  const isiOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone=()=>matchMedia("(display-mode: standalone)").matches || navigator.standalone===true;
  function hide(el){if(!el)return;el.hidden=true;el.style.display="none";}
  function show(el,display="block"){if(!el)return;el.hidden=false;el.style.display=display;}

  function build(){
    if(standalone()||document.getElementById("pwaClienteBar"))return;
    const bar=document.createElement("div");
    bar.id="pwaClienteBar"; bar.hidden=true; bar.style.display="none";
    Object.assign(bar.style,{position:"fixed",left:"12px",right:"12px",bottom:"14px",zIndex:"10050",maxWidth:"680px",margin:"0 auto"});
    bar.innerHTML=`<div style="display:flex;align-items:center;gap:10px;background:#111;color:#fff;border:1px solid #3b3b3b;border-radius:15px;padding:10px;box-shadow:0 14px 45px rgba(0,0,0,.55)">
      <img src="/assets/pwa-192.png" style="width:46px;height:46px;border-radius:11px" alt="">
      <div style="flex:1"><strong style="display:block;color:#ffb800">Instalar Beach Burguer</strong><span style="font-size:12px;color:#ddd">App de clientes</span></div>
      <button id="pwaClienteBtn" type="button" style="border:0;border-radius:9px;padding:10px 13px;background:#ffb800;color:#111;font-weight:900">Instalar</button>
      <button id="pwaClienteClose" type="button" style="border:0;background:transparent;color:#aaa;font-size:25px">×</button>
    </div>`;
    document.body.appendChild(bar);

    const modal=document.createElement("div");
    modal.id="pwaClienteIos"; modal.hidden=true; modal.style.display="none";
    Object.assign(modal.style,{position:"fixed",inset:"0",zIndex:"10060",background:"rgba(0,0,0,.84)",alignItems:"center",justifyContent:"center",padding:"18px"});
    modal.innerHTML=`<div style="position:relative;width:min(410px,96vw);background:#111;color:#fff;border:1px solid #444;border-radius:20px;padding:24px">
      <button id="pwaClienteIosClose" type="button" style="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#aaa;font-size:28px">×</button>
      <h2 style="text-align:center;color:#ffb800">Instalar Beach Burguer</h2>
      <p>No iPhone:</p><ol style="line-height:1.8"><li>Compartilhar</li><li>Adicionar à Tela de Início</li><li>Adicionar</li></ol>
      <button id="pwaClienteIosOk" type="button" style="width:100%;border:0;border-radius:10px;padding:11px;background:#ffb800;color:#111;font-weight:900">Entendi</button>
    </div>`;
    document.body.appendChild(modal);

    document.getElementById("pwaClienteClose").onclick=()=>hide(bar);
    const closeModal=()=>hide(modal);
    document.getElementById("pwaClienteIosClose").onclick=closeModal;
    document.getElementById("pwaClienteIosOk").onclick=closeModal;

    document.getElementById("pwaClienteBtn").onclick=async()=>{
      if(deferredPrompt){
        const p=deferredPrompt; deferredPrompt=null; p.prompt();
        try{await p.userChoice}catch{}
        hide(bar); return;
      }
      if(isiOS()){show(modal,"flex");return;}
      alert('Se não abrir automaticamente, use o menu ⋮ do navegador e escolha "Instalar app".');
    };

    if(isiOS())show(bar);
  }

  addEventListener("beforeinstallprompt",e=>{
    e.preventDefault(); deferredPrompt=e; build(); show(document.getElementById("pwaClienteBar"));
  });
  addEventListener("DOMContentLoaded",build);
  if("serviceWorker" in navigator){
    addEventListener("load",()=>navigator.serviceWorker.register("/cliente-app/sw.js",{scope:"/cliente-app/",updateViaCache:"none"}).catch(()=>{}));
  }
})();