(() => {
  "use strict";
  let deferredPrompt = null;
  const standalone = () =>
    matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isiOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

  function buildUI(){
    if (standalone() || document.getElementById("pwaInstallBar")) return;

    const bar=document.createElement("div");
    bar.id="pwaInstallBar"; bar.className="pwa-install-bar"; bar.hidden=true;
    bar.innerHTML=`<div class="pwa-install-inner">
      <img src="/assets/pwa-192.png" class="pwa-install-icon" alt="">
      <div class="pwa-install-copy"><strong>Instale o app Beach Burguer</strong>
      <span>Acesse o delivery direto pela tela inicial.</span></div>
      <button id="pwaInstallBtn" class="pwa-install-btn" type="button">Instalar</button>
      <button id="pwaInstallClose" class="pwa-install-close" type="button">×</button>
    </div>`;
    document.body.appendChild(bar);

    const modal=document.createElement("div");
    modal.id="pwaIosModal"; modal.className="pwa-ios-modal"; modal.hidden=true;
    modal.innerHTML=`<div class="pwa-ios-card">
      <button id="pwaIosClose" class="pwa-ios-x" type="button">×</button>
      <img src="/assets/pwa-192.png" class="pwa-ios-logo" alt="Beach Burguer">
      <h2>Instalar Beach Burguer</h2>
      <p>No iPhone:</p>
      <ol><li>Toque em <strong>Compartilhar</strong>.</li>
      <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
      <li>Toque em <strong>Adicionar</strong>.</li></ol>
      <button id="pwaIosOk" class="pwa-ios-ok" type="button">Entendi</button>
    </div>`;
    document.body.appendChild(modal);

    document.getElementById("pwaInstallClose").onclick=()=>{
      bar.hidden=true; sessionStorage.setItem("bb_pwa_bar_closed","1");
    };
    document.getElementById("pwaIosClose").onclick=
    document.getElementById("pwaIosOk").onclick=()=>modal.hidden=true;

    document.getElementById("pwaInstallBtn").onclick=async()=>{
      if(deferredPrompt){
        const p=deferredPrompt; deferredPrompt=null;
        p.prompt();
        try{await p.userChoice}catch{}
        bar.hidden=true;
      }else if(isiOS()){
        modal.hidden=false;
      }
    };

    if(isiOS()&&!sessionStorage.getItem("bb_pwa_bar_closed")) bar.hidden=false;
  }

  addEventListener("beforeinstallprompt",e=>{
    e.preventDefault(); deferredPrompt=e; buildUI();
    const bar=document.getElementById("pwaInstallBar");
    if(bar&&!sessionStorage.getItem("bb_pwa_bar_closed")) bar.hidden=false;
  });

  addEventListener("appinstalled",()=>{
    deferredPrompt=null;
    const bar=document.getElementById("pwaInstallBar");
    if(bar) bar.hidden=true;
  });

  addEventListener("DOMContentLoaded",()=>{
    buildUI();
    const params=new URLSearchParams(location.search);
    if(params.get("abrir")==="pedidos"){
      setTimeout(()=>{
        const b=document.getElementById("abrirMeusPedidos")||document.getElementById("abrirMeusPedidosHero");
        if(b) b.click();
      },700);
    }
  });

  if("serviceWorker" in navigator){
    addEventListener("load",()=>{
      navigator.serviceWorker.register("/sw.js?v=30_3",{updateViaCache:"none"}).catch(()=>{});
    });
  }
})();