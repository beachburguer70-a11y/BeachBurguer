(() => {
  "use strict";
  let deferredPrompt=null;

  const standalone=()=>matchMedia("(display-mode: standalone)").matches || navigator.standalone===true;
  const isiOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);

  function hide(el){if(!el)return;el.hidden=true;el.style.display="none";}
  function show(el,display="block"){if(!el)return;el.hidden=false;el.style.display=display;}

  function build(){
    if(standalone()||document.getElementById("pwaLojaInstallBar"))return;

    const bar=document.createElement("div");
    bar.id="pwaLojaInstallBar";
    bar.hidden=true;
    bar.style.display="none";
    bar.innerHTML=`<div style="display:flex;align-items:center;gap:10px;background:#111;color:#fff;border:1px solid #3b3b3b;border-radius:15px;padding:10px;box-shadow:0 14px 45px rgba(0,0,0,.55)">
      <img src="/assets/loja-pwa-192.png" style="width:46px;height:46px;border-radius:11px" alt="">
      <div style="flex:1;min-width:0">
        <strong style="display:block;color:#ffb800">Instalar Beach Burguer Loja</strong>
        <span style="font-size:12px;color:#ddd">Abra Loja, Garçom e Relatórios direto pelo celular.</span>
      </div>
      <button id="pwaLojaInstallBtn" type="button" style="border:0;border-radius:9px;padding:10px 13px;background:#ffb800;color:#111;font-weight:900">Instalar</button>
      <button id="pwaLojaInstallClose" type="button" style="border:0;background:transparent;color:#aaa;font-size:25px">×</button>
    </div>`;
    Object.assign(bar.style,{
      position:"fixed",left:"12px",right:"12px",bottom:"14px",zIndex:"10050",
      maxWidth:"680px",margin:"0 auto"
    });
    document.body.appendChild(bar);

    const modal=document.createElement("div");
    modal.id="pwaLojaIosModal";
    modal.hidden=true; modal.style.display="none";
    Object.assign(modal.style,{
      position:"fixed",inset:"0",zIndex:"10060",background:"rgba(0,0,0,.84)",
      alignItems:"center",justifyContent:"center",padding:"18px"
    });
    modal.innerHTML=`<div style="position:relative;width:min(410px,96vw);background:#111;color:#fff;border:1px solid #444;border-radius:20px;padding:24px">
      <button id="pwaLojaIosClose" type="button" style="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#aaa;font-size:28px">×</button>
      <img src="/assets/loja-pwa-192.png" style="display:block;width:72px;height:72px;border-radius:16px;margin:0 auto 10px" alt="">
      <h2 style="text-align:center;color:#ffb800">Instalar Beach Burguer Loja</h2>
      <p>No iPhone:</p>
      <ol style="line-height:1.8">
        <li>Toque em <strong>Compartilhar</strong>.</li>
        <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
        <li>Toque em <strong>Adicionar</strong>.</li>
      </ol>
      <button id="pwaLojaIosOk" type="button" style="width:100%;border:0;border-radius:10px;padding:11px;background:#ffb800;color:#111;font-weight:900">Entendi</button>
    </div>`;
    document.body.appendChild(modal);

    document.getElementById("pwaLojaInstallClose").onclick=()=>{
      hide(bar); sessionStorage.setItem("bb_pwa_loja_closed","1");
    };
    const closeModal=()=>hide(modal);
    document.getElementById("pwaLojaIosClose").onclick=closeModal;
    document.getElementById("pwaLojaIosOk").onclick=closeModal;
    modal.onclick=e=>{if(e.target===modal)closeModal();};

    document.getElementById("pwaLojaInstallBtn").onclick=async()=>{
      if(deferredPrompt){
        const p=deferredPrompt; deferredPrompt=null;
        p.prompt();
        try{await p.userChoice}catch{}
        hide(bar);
      }else if(isiOS()){
        show(modal,"flex");
      }
    };

    if(isiOS()&&!sessionStorage.getItem("bb_pwa_loja_closed"))show(bar);
  }

  addEventListener("beforeinstallprompt",e=>{
    e.preventDefault();
    deferredPrompt=e;
    build();
    const bar=document.getElementById("pwaLojaInstallBar");
    if(bar&&!sessionStorage.getItem("bb_pwa_loja_closed"))show(bar);
  });

  addEventListener("appinstalled",()=>{
    deferredPrompt=null;
    hide(document.getElementById("pwaLojaInstallBar"));
    hide(document.getElementById("pwaLojaIosModal"));
  });

  addEventListener("DOMContentLoaded",build);

  if("serviceWorker" in navigator){
    addEventListener("load",()=>{
      navigator.serviceWorker.register("/sw.js?v=31_3",{updateViaCache:"none"}).catch(()=>{});
    });
  }
})();