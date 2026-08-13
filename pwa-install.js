(() => {
  "use strict";

  let deferredPrompt = null;

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

  const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  function hide(el) {
    if (!el) return;
    el.hidden = true;
    el.style.display = "none";
  }

  function show(el, displayValue = "block") {
    if (!el) return;
    el.hidden = false;
    el.style.display = displayValue;
  }

  function buildUI() {
    if (isStandalone() || document.getElementById("pwaInstallBar")) return;

    const bar = document.createElement("div");
    bar.id = "pwaInstallBar";
    bar.className = "pwa-install-bar";
    bar.hidden = true;
    bar.style.display = "none";
    bar.innerHTML = `
      <div class="pwa-install-inner">
        <img src="/assets/pwa-192.png" class="pwa-install-icon" alt="">
        <div class="pwa-install-copy">
          <strong>Instale o app Beach Burguer</strong>
          <span>Acesse o delivery direto pela tela inicial.</span>
        </div>
        <button id="pwaInstallBtn" class="pwa-install-btn" type="button">Instalar</button>
        <button id="pwaInstallClose" class="pwa-install-close" type="button" aria-label="Fechar">×</button>
      </div>`;
    document.body.appendChild(bar);

    const modal = document.createElement("div");
    modal.id = "pwaIosModal";
    modal.className = "pwa-ios-modal";
    modal.hidden = true;
    modal.style.display = "none";
    modal.innerHTML = `
      <div class="pwa-ios-card">
        <button id="pwaIosClose" class="pwa-ios-x" type="button" aria-label="Fechar">×</button>
        <img src="/assets/pwa-192.png" class="pwa-ios-logo" alt="Beach Burguer">
        <h2>Instalar Beach Burguer</h2>
        <p>No iPhone:</p>
        <ol>
          <li>Toque em <strong>Compartilhar</strong>.</li>
          <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
          <li>Toque em <strong>Adicionar</strong>.</li>
        </ol>
        <button id="pwaIosOk" class="pwa-ios-ok" type="button">Entendi</button>
      </div>`;
    document.body.appendChild(modal);

    const closeBar = () => {
      hide(bar);
      sessionStorage.setItem("bb_pwa_bar_closed", "1");
    };

    const closeModal = () => hide(modal);

    document.getElementById("pwaInstallClose").addEventListener("click", closeBar);
    document.getElementById("pwaIosClose").addEventListener("click", closeModal);
    document.getElementById("pwaIosOk").addEventListener("click", closeModal);

    // Clicking outside the iOS card also closes it.
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.getElementById("pwaInstallBtn").addEventListener("click", async () => {
      if (deferredPrompt) {
        const prompt = deferredPrompt;
        deferredPrompt = null;
        prompt.prompt();
        try { await prompt.userChoice; } catch {}
        hide(bar);
        return;
      }

      // Manual instructions are ONLY for iPhone/iPad.
      if (isIOS()) {
        show(modal, "flex");
      }
    });

    // iPhone doesn't fire beforeinstallprompt.
    if (isIOS() && !sessionStorage.getItem("bb_pwa_bar_closed")) {
      show(bar, "block");
    }
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    // Android/Chromium path
    event.preventDefault();
    deferredPrompt = event;
    buildUI();

    const bar = document.getElementById("pwaInstallBar");
    if (bar && !sessionStorage.getItem("bb_pwa_bar_closed")) {
      show(bar, "block");
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    hide(document.getElementById("pwaInstallBar"));
    hide(document.getElementById("pwaIosModal"));
    localStorage.setItem("bb_pwa_installed", "1");
  });

  window.addEventListener("DOMContentLoaded", () => {
    buildUI();

    const params = new URLSearchParams(location.search);
    if (params.get("abrir") === "pedidos") {
      setTimeout(() => {
        const btn =
          document.getElementById("abrirMeusPedidos") ||
          document.getElementById("abrirMeusPedidosHero");
        if (btn) btn.click();
      }, 700);
    }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js?v=30_4", { updateViaCache: "none" })
        .catch(() => {});
    });
  }
})();