
(function(){
  const moedaDev=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  function renderDestaques(){
    const box=document.getElementById("destaquesProdutos");
    if(!box || typeof dados==="undefined") return;

    const preferidos=["Beach Burguer","Chapéu do Sol","Combo Beach Casal","Beach Podrão"];
    let lista=preferidos.map(n=>dados.produtos.find(p=>p.nome===n&&p.ativo)).filter(Boolean);
    if(lista.length<4){
      const extras=dados.produtos.filter(p=>p.ativo&&p.disponivel!==false&&!lista.includes(p)).slice(0,4-lista.length);
      lista=lista.concat(extras);
    }

    box.innerHTML=lista.map(p=>`
      <article class="destaque-produto">
        <div class="dest-icone">${typeof iconeProduto==="function"?iconeProduto(p.categoria):"🍔"}</div>
        <h3>${p.nome}</h3>
        <p>${p.descricao}</p>
        <footer>
          <span class="dest-preco">${moedaDev(p.preco)}</span>
          <button type="button" ${p.disponivel===false?"disabled":""} data-destaque-id="${p.id}">
            ${p.disponivel===false?"Esgotado":"Adicionar"}
          </button>
        </footer>
      </article>`).join("");

    box.querySelectorAll("[data-destaque-id]").forEach(b=>{
      b.addEventListener("click",()=> {
        if(typeof abrirProduto==="function") abrirProduto(Number(b.dataset.destaqueId));
      });
    });
  }

  function atualizarCarrinhoFlutuante(){
    const btn=document.getElementById("carrinhoFlutuante");
    const resumo=document.getElementById("carrinhoFlutuanteResumo");
    if(!btn||!resumo) return;
    let qtd=0;
    try {
      if(typeof carrinho!=="undefined") qtd=carrinho.reduce((s,i)=>s+Number(i.quantidade||1),0);
    } catch {}
    const totalEl=document.getElementById("total");
    const total=totalEl?.textContent?.trim()||"R$ 0,00";
    resumo.textContent=`${qtd} ${qtd===1?"item":"itens"} • ${total}`;
    btn.classList.toggle("visivel",qtd>0);
  }

  function ligarBotoes(){
    document.getElementById("abrirMeusPedidosHero")?.addEventListener("click",()=>{
      document.getElementById("abrirMeusPedidos")?.click();
    });
    document.getElementById("verCardapioPainel")?.addEventListener("click",()=>{
      document.getElementById("verCardapio")?.click();
    });
  }

  function observar(){
    const total=document.getElementById("total");
    const contador=document.getElementById("contador");
    const obs=new MutationObserver(atualizarCarrinhoFlutuante);
    if(total) obs.observe(total,{childList:true,subtree:true,characterData:true});
    if(contador) obs.observe(contador,{childList:true,subtree:true,characterData:true});
  }

  window.addEventListener("load",()=>{
    setTimeout(()=>{
      renderDestaques();
      atualizarCarrinhoFlutuante();
      ligarBotoes();
      observar();
    },500);
  });
})();
