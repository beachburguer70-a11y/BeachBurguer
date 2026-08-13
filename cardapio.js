
const $=id=>document.getElementById(id);
const moeda=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

const PADRAO = {
  produtos:[
    {id:1,categoria:"Artesanais",nome:"Açu",descricao:"Pão brioche, hambúrguer artesanal, queijo e salada.",preco:15,ativo:true,disponivel:true},
    {id:2,categoria:"Artesanais",nome:"SJB",descricao:"Pão brioche, hambúrguer artesanal, queijo, ovo e salada.",preco:17,ativo:true,disponivel:true},
    {id:3,categoria:"Artesanais",nome:"Iquipari",descricao:"Pão brioche, hambúrguer artesanal, queijo, ovo, calabresa e salada.",preco:19,ativo:true,disponivel:true},
    {id:4,categoria:"Artesanais",nome:"Grussaí",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, ovo, bacon e salada.",preco:21,ativo:true,disponivel:true},
    {id:5,categoria:"Artesanais",nome:"Chapéu do Sol",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, ovo, calabresa, bacon e salada.",preco:23,ativo:true,disponivel:true},
    {id:6,categoria:"Artesanais",nome:"Balneário",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, ovo, calabresa, bacon, picles e salada.",preco:25,ativo:true,disponivel:true},
    {id:7,categoria:"Artesanais",nome:"Dunas",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, frango artesanal, ovo, calabresa, bacon, picles e salada.",preco:30,ativo:true,disponivel:true},
    {id:8,categoria:"Artesanais",nome:"Pontal",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, frango artesanal, 2 ovos, calabresa, bacon, picles e salada.",preco:32,ativo:true,disponivel:true},
    {id:9,categoria:"Artesanais",nome:"Atafona",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, 2 frangos artesanais, 2 ovos, calabresa, bacon, picles e salada.",preco:37,ativo:true,disponivel:true},
    {id:10,categoria:"Artesanais",nome:"Beach Burguer",descricao:"Pão brioche, 2 hambúrgueres artesanais, 2 queijos cheddar, 2 frangos artesanais, 2 ovos, calabresa, bacon, picles e salada.",preco:44,ativo:true,disponivel:true},
    {id:11,categoria:"Combos",nome:"Combo Beach Casal",descricao:"2 Chapéu do Sol, 2 Guaravitas e batata 100g.",preco:45,ativo:true,disponivel:true},
    {id:12,categoria:"Combos",nome:"Combo Beach Família",descricao:"1 SJB, 1 Dunas, 1 Grussaí, refrigerante 1,5L e batata 200g.",preco:67,ativo:true,disponivel:true},
    {id:13,categoria:"Mistos Quentes",nome:"Misto Tradicional",descricao:"2 queijos, 2 presuntos, orégano, batata 100g, maionese e ketchup.",preco:10,ativo:true,disponivel:true},
    {id:14,categoria:"Mistos Quentes",nome:"Misto com Ovo",descricao:"2 queijos, 2 presuntos, ovo, orégano, batata 100g, maionese e ketchup.",preco:12,ativo:true,disponivel:true},
    {id:15,categoria:"Mistos Quentes",nome:"Misto com Ovo e Salsicha",descricao:"2 queijos, 2 presuntos, ovo, salsicha, orégano, batata 100g, maionese e ketchup.",preco:14,ativo:true,disponivel:true},
    {id:16,categoria:"Beach Podrão",nome:"Beach Podrão",descricao:"Pão, carne industrializada, ovo, salsicha, queijo, presunto, batata palha, milho e salada.",preco:20,ativo:true,disponivel:true},
    {id:17,categoria:"Bebidas",nome:"Coca-Cola Lata",descricao:"Coca-Cola lata gelada.",preco:7,ativo:true,disponivel:true},
    {id:18,categoria:"Bebidas",nome:"Coca-Cola Zero Lata",descricao:"Coca-Cola Zero lata gelada.",preco:7,ativo:true,disponivel:true},
    {id:19,categoria:"Bebidas",nome:"Guaraná Lata",descricao:"Guaraná Lata gelado.",preco:7,ativo:true,disponivel:true},
    {id:20,categoria:"Bebidas",nome:"Coca-Cola 1,5L",descricao:"Coca-Cola 1,5 litro gelada.",preco:12,ativo:true,disponivel:true},
    {id:21,categoria:"Bebidas",nome:"Coca-Cola Zero 1,5L",descricao:"Coca-Cola Zero 1,5 litro gelada.",preco:12,ativo:true,disponivel:true},
    {id:22,categoria:"Bebidas",nome:"Guaraná 1,5L",descricao:"Guaraná 1,5 litro gelado.",preco:12,ativo:true,disponivel:true},
    {id:23,categoria:"Bebidas",nome:"Guaravita",descricao:"Guaravita gelado.",preco:3,ativo:true,disponivel:true},
    {id:24,categoria:"Bebidas",nome:"Guaraviton",descricao:"Guaraviton gelado.",preco:6,ativo:true,disponivel:true},
    {id:25,categoria:"Bebidas",nome:"Água com gás",descricao:"Água mineral com gás.",preco:4,ativo:true,disponivel:true},
    {id:26,categoria:"Bebidas",nome:"Água sem gás",descricao:"Água mineral sem gás.",preco:3,ativo:true,disponivel:true},
    {id:27,categoria:"Bebidas",nome:"H2O",descricao:"H2O gelada.",preco:8,ativo:true,disponivel:true}
  ]
};
const ADICIONAIS=[
  {nome:"Carne",preco:7},{nome:"Frango",preco:5},{nome:"Mussarela",preco:3},{nome:"Cheddar",preco:4},
  {nome:"Ovo",preco:2},{nome:"Calabresa",preco:2},{nome:"Bacon",preco:3},{nome:"Picles",preco:2},{nome:"Batata",preco:7}
];
const SEM_ADICIONAIS=["Combos","Mistos Quentes","Beach Podrão","Bebidas","Doces"];
const CATEGORIAS=["Artesanais","Combos","Mistos Quentes","Beach Podrão","Bebidas","Doces"];

let dados=structuredClone(PADRAO);
let carrinho=[];
try{carrinho=JSON.parse(localStorage.getItem("bb_carrinho")||"[]")}catch{}

function temItemPrincipalV15(){
  return carrinho.some(i=>(REGRAS_CATEGORIAS[i.categoria]||"artesanais")==="artesanais");
}
function validarItemPrincipalV15(){
  if(!carrinho.length)return false;
  if(temItemPrincipalV15())return true;
  alert("Para fazer o pedido é obrigatório incluir pelo menos 1 item de uma categoria principal. Itens de categorias com regra de bebidas não podem ser pedidos sozinhos.");
  return false;
}


let estadoLojaV16={open:true,pickup_only:false,mode:"open"};




function passouDas22V22(){
  const agora=new Date();
  return agora.getHours()>=22;
}
function localidadeChapeuV22(){
  // No cardápio a localidade pode ainda não ter sido preenchida.
  // Se houver uma última localidade salva, usamos apenas como antecipação;
  // a validação definitiva ocorre no checkout após o cliente selecionar o bairro.
  try{
    const b=localStorage.getItem("bb_bairro_checkout")||"";
    return String(b).trim().toLowerCase().includes("chapéu") ||
           String(b).trim().toLowerCase().includes("chapeu");
  }catch{return false}
}
function confirmarChapeuApos22V22(){
  if(tipoPedido!=="Entrega" || !passouDas22V22() || !localidadeChapeuV22()) return true;
  const ok=confirm(
    "Nosso horário de entregas para Chapéu do Sol finalizou às 22:00.\n\nDeseja prosseguir com o pedido para RETIRADA?\n\nOK = Prosseguir\nCancelar = Cancelar pedido"
  );
  if(!ok)return false;
  tipoPedido="Retirada";
  localStorage.setItem("bb_tipo_pedido","Retirada");
  $("tipoPedidoBadgeV7").textContent="📍 Retirada";
  document.querySelectorAll(".tipo-opcao-v10").forEach(b=>b.classList.toggle("ativa",b.dataset.tipo==="Retirada"));
  return true;
}

async function atualizarEstadoLojaAntesDeFinalizarV20(){
  try{
    const r=await fetch("/api/orders",{method:"GET",cache:"no-store"});
    const j=await r.json();
    if(j && j.store){
      estadoLojaV16=j.store;
      localStorage.setItem("bb_store_state",JSON.stringify(j.store));
      aplicarEstadoLojaCardapioV16();
    }
  }catch(e){
    try{
      const salvo=JSON.parse(localStorage.getItem("bb_store_state")||"null");
      if(salvo) estadoLojaV16=salvo;
    }catch{}
  }
}

function validarSomenteRetiradaAntesFinalizarV20(){
  if(estadoLojaV16 && estadoLojaV16.pickup_only && tipoPedido!=="Retirada"){
    const prosseguir=confirm(
      "A loja está aceitando pedidos somente para RETIRADA no local porque nosso horário de entregas finalizou às 23:00.\n\nDeseja prosseguir com o pedido para RETIRADA?\n\nOK = Prosseguir\nCancelar = Cancelar pedido"
    );

    if(!prosseguir){
      return false;
    }

    tipoPedido="Retirada";
    localStorage.setItem("bb_tipo_pedido","Retirada");
    $("tipoPedidoBadgeV7").textContent="📍 Retirada";

    document.querySelectorAll(".tipo-opcao-v10").forEach(b=>{
      b.classList.toggle("ativa",b.dataset.tipo==="Retirada");
    });

    return true;
  }
  return true;
}

function lojaFechadaV18(){
  return estadoLojaV16 && estadoLojaV16.open===false;
}

function avisarLojaFechadaV18(){
  alert("A Beach Burguer está fechada no momento. Não é possível continuar ou finalizar o pedido.");
}

function atualizarBotoesItemAdicionadoV18(){
  const fechada=lojaFechadaV18();
  ["continuarComprandoV7","finalizarPedidoV7"].forEach(id=>{
    const b=$(id);
    if(!b)return;
    b.classList.toggle("bloqueado-loja-v18",fechada);
    b.setAttribute("aria-disabled",fechada?"true":"false");
    b.title=fechada?"Loja fechada no momento":"";
  });
}

function aplicarEstadoLojaCardapioV16(){
  if(estadoLojaV16.pickup_only){
    // V23: não muda silenciosamente um pedido que já estava em Entrega/Consumo.
    // A troca para Retirada será perguntada ao cliente ao tentar finalizar.
    document.querySelectorAll(".tipo-opcao-v10").forEach(b=>{
      const ok=b.dataset.tipo==="Retirada";
      b.disabled=!ok;
      b.classList.toggle("bloqueada-v16",!ok);
      b.title=ok?"":"No momento a loja está aceitando somente retirada.";
    });
  }else{
    document.querySelectorAll(".tipo-opcao-v10").forEach(b=>{
      b.disabled=false;b.classList.remove("bloqueada-v16");b.title="";
    });
  }
  atualizarBotoesItemAdicionadoV18();
  if(typeof renderProdutos==="function") renderProdutos();
}

let categoriaAtual="Artesanais";
let produtoSelecionado=null;
let itemEditandoUid=null;
let tipoPedido=localStorage.getItem("bb_tipo_pedido")||"Retirada";

$("tipoPedidoBadgeV7").textContent=`📍 ${tipoPedido}`;

function atualizarTipoPedidoV10(tipo){
  if(estadoLojaV16.pickup_only && tipo!=="Retirada"){
    alert("No momento a loja está aceitando somente retirada no local.");
    return;
  }
  tipoPedido=tipo;
  localStorage.setItem("bb_tipo_pedido",tipoPedido);
  $("tipoPedidoBadgeV7").textContent=`📍 ${tipoPedido}`;
  document.querySelectorAll(".tipo-opcao-v10").forEach(b=>{
    b.classList.toggle("ativa",b.dataset.tipo===tipoPedido);
  });
}

function salvarCarrinho(){
  localStorage.setItem("bb_carrinho",JSON.stringify(carrinho));
  atualizarBotaoCarrinho();
}
function valorItem(i){
  const extras=(i.adicionais||[]).reduce((s,a)=>s+Number(a.preco||0),0);
  return (Number(i.preco||0)+extras)*Number(i.quantidade||1);
}
function totalCarrinho(){return carrinho.reduce((s,i)=>s+valorItem(i),0)}
function icone(c){return c==="Mistos Quentes"?"🥪":c==="Combos"?"📦":c==="Bebidas"?"🥤":c==="Doces"?"🍬":"🍔"}

async function carregarCatalogo(){
  try{
    // V31.10: o Cliente passa a usar a mesma origem de categorias do Garçom.
    // Primeiro lê a resposta normal /api/orders, que já abastece o Garçom.
    // Depois consulta categories_only apenas como reforço/fallback.
    const [respCatalogo, respCategorias] = await Promise.all([
      fetch(`/api/orders?_=${Date.now()}`,{
        method:"GET",
        cache:"no-store",
        headers:{"Cache-Control":"no-cache","Pragma":"no-cache"}
      }),
      fetch(`/api/orders?categories_only=1&_=${Date.now()}`,{
        method:"GET",
        cache:"no-store",
        headers:{"Cache-Control":"no-cache","Pragma":"no-cache"}
      })
    ]);

    const j = await respCatalogo.json();
    let jc = {categories:[]};
    try{ jc = await respCategorias.json(); }catch{}

    if(j.store){
      estadoLojaV16=j.store;
      localStorage.setItem("bb_store_state",JSON.stringify(j.store));
      aplicarEstadoLojaCardapioV16();
    }

    const mapaCategorias=new Map();

    // Mesma lista que o Garçom recebe da resposta normal.
    for(const c of (Array.isArray(j.categories)?j.categories:[])){
      const nome=String(c?.name||"").trim();
      if(!nome)continue;
      mapaCategorias.set(nome,{
        name:nome,
        rule:String(c?.rule||"artesanais"),
        sort_order:Number(c?.sort_order||0),
        active:c?.active!==false
      });
    }

    // Fallback/garantia: endpoint exclusivo.
    for(const c of (Array.isArray(jc.categories)?jc.categories:[])){
      const nome=String(c?.name||"").trim();
      if(!nome)continue;
      mapaCategorias.set(nome,{
        name:nome,
        rule:String(c?.rule||"artesanais"),
        sort_order:Number(c?.sort_order||0),
        active:c?.active!==false
      });
    }

    const lista=Array.isArray(j.catalog)?j.catalog:(Array.isArray(j.products)?j.products:[]);

    // Produtos também podem revelar uma categoria por segurança.
    for(const p of lista){
      const id=Number(p.id||p.product_id);
      const categoria=String(p.categoria||p.category||"").trim();
      const nome=p.nome||p.name||"Produto";
      const descricao=p.descricao||p.description||"";
      const preco=Number(p.preco??p.price??0);
      const ativo=(p.ativo??p.active)!==false;
      const disponivel=(p.disponivel??p.available)!==false;
      const permiteAdicionais=(p.permiteAdicionais??p.allows_addons)===true;

      if(categoria && !mapaCategorias.has(categoria)){
        mapaCategorias.set(categoria,{
          name:categoria,
          rule:["Bebidas","Doces"].includes(categoria)?"bebidas":"artesanais",
          sort_order:9999,
          active:true
        });
      }

      let alvo=dados.produtos.find(x=>Number(x.id)===id);
      if(alvo){
        alvo.categoria=categoria||alvo.categoria;
        alvo.nome=nome||alvo.nome;
        alvo.descricao=descricao;
        alvo.preco=preco;
        alvo.ativo=ativo;
        alvo.disponivel=disponivel;
        alvo.permiteAdicionais=permiteAdicionais;
      }else if(id){
        dados.produtos.push({
          id,categoria,nome,descricao,preco,ativo,disponivel,permiteAdicionais
        });
      }
    }

    const categoriasAtivas=[...mapaCategorias.values()]
      .filter(c=>c.active!==false)
      .sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0) || a.name.localeCompare(b.name,"pt-BR"));

    if(categoriasAtivas.length){
      CATEGORIAS=categoriasAtivas.map(c=>c.name);
      REGRAS_CATEGORIAS=Object.fromEntries(
        categoriasAtivas.map(c=>[c.name,c.rule])
      );

      if(!CATEGORIAS.includes(categoriaAtual)){
        categoriaAtual=CATEGORIAS[0]||"Artesanais";
      }
    }

    renderAbas();
    renderProdutos();
  }catch(e){
    console.warn("Não foi possível carregar o cardápio:",e.message);
    renderAbas();
    renderProdutos();
  }
}

function renderAbas(){
  const el=$("abasV7");
  if(!el)return;
  el.innerHTML=CATEGORIAS.map((c,i)=>`<button class="${c===categoriaAtual?"ativa":""}" data-cat-index="${i}">${c}</button>`).join("");
  el.querySelectorAll("button[data-cat-index]").forEach(b=>{
    b.onclick=()=>{
      const idx=Number(b.dataset.catIndex);
      const cat=CATEGORIAS[idx];
      if(!cat)return;
      categoriaAtual=cat;
      renderAbas();
      renderProdutos();
    };
  });
}
function renderProdutos(){
  const lista=dados.produtos.filter(p=>p.categoria===categoriaAtual&&p.ativo);
  if(!lista.length){
    $("produtosV7").innerHTML=`<div class="categoria-vazia-v15">
      <div style="font-size:36px">${categoriaAtual==="Doces"?"🍬":"🍔"}</div>
      <strong>Nenhum item disponível nesta categoria no momento.</strong>
    </div>`;
    return;
  }
  $("produtosV7").innerHTML=lista.map(p=>`
    <article class="produto-v7 ${p.disponivel===false?"esgotado":""}">
      <div class="icone">${icone(p.categoria)}</div>
      <h3>${p.nome}</h3>
      <p>${p.descricao||""}</p>
      <footer>
        <span class="preco">${moeda(p.preco)}</span>
        <button ${(p.disponivel===false||lojaFechadaV18())?"disabled":""} data-id="${p.id}">
          ${p.disponivel===false?"Esgotado":lojaFechadaV18()?"Loja fechada":"Adicionar"}
        </button>
      </footer>
    </article>`).join("");
  $("produtosV7").querySelectorAll("button[data-id]").forEach(b=>b.onclick=()=>abrirProduto(Number(b.dataset.id)));
}
function abrirProduto(id,uid=null){
  if(lojaFechadaV18()){
    avisarLojaFechadaV18();
    return;
  }
  const item=uid?carrinho.find(x=>String(x.uid)===String(uid)):null;
  produtoSelecionado=dados.produtos.find(p=>Number(p.id)===Number(item?.id||id));
  if(!produtoSelecionado)return;
  itemEditandoUid=item?.uid??null;

  $("produtoNomeV7").textContent=produtoSelecionado.nome;
  $("produtoDescricaoV7").textContent=produtoSelecionado.descricao||"";
  $("produtoPrecoV7").textContent=moeda(produtoSelecionado.preco);
  $("produtoQtdV7").value=item?.quantidade||1;
  $("produtoObsV7").value=item?.observacao||"";

  const aceita=!SEM_ADICIONAIS.includes(produtoSelecionado.categoria);
  $("tituloAdicionaisV7").style.display=aceita?"":"none";
  $("listaAdicionaisV7").style.display=aceita?"":"none";
  $("listaAdicionaisV7").innerHTML=aceita?ADICIONAIS.map((a,i)=>{
    const checked=(item?.adicionais||[]).some(x=>x.nome===a.nome);
    return `<label style="display:flex;justify-content:space-between;gap:10px;margin:8px 0">
      <span><input class="addV7" data-i="${i}" type="checkbox" ${checked?"checked":""}> ${a.nome}</span>
      <strong>+ ${moeda(a.preco)}</strong>
    </label>`;
  }).join(""):"";

  $("confirmarProdutoV7").textContent=item?"Salvar alteração":"Adicionar ao pedido";
  $("modalProdutoV7").classList.add("ativo");
}
function confirmarProduto(){
  if(lojaFechadaV18()){
    avisarLojaFechadaV18();
    $("modalProdutoV7")?.classList.remove("ativo");
    return;
  }
  const qtd=Math.max(1,Number($("produtoQtdV7").value||1));
  const adicionais=[...document.querySelectorAll(".addV7:checked")].map(c=>ADICIONAIS[Number(c.dataset.i)]);
  const novo={
    id:produtoSelecionado.id,
    nome:produtoSelecionado.nome,
    categoria:produtoSelecionado.categoria,
    preco:Number(produtoSelecionado.preco),
    quantidade:qtd,
    adicionais,
    observacao:$("produtoObsV7").value.trim(),
    uid:itemEditandoUid??(Date.now()+Math.random())
  };
  if(itemEditandoUid!==null){
    carrinho=carrinho.map(i=>String(i.uid)===String(itemEditandoUid)?novo:i);
  }else{
    carrinho.push(novo);
  }
  itemEditandoUid=null;
  salvarCarrinho();
  $("modalProdutoV7").classList.remove("ativo");
  $("modalDepoisAdicionarV7").classList.add("ativo");
}
function atualizarBotaoCarrinho(){
  const qtd=carrinho.reduce((s,i)=>s+Number(i.quantidade||1),0);
  $("resumoCarrinhoV7").textContent=`${qtd} ${qtd===1?"item":"itens"} • ${moeda(totalCarrinho())}`;
  $("verPedidoV7").classList.toggle("visivel",qtd>0);
}
function renderCarrinhoModal(){
  const box=$("listaCarrinhoV7");
  $("totalCarrinhoV7").textContent=moeda(totalCarrinho());
  $("finalizarCarrinhoV7").disabled=!carrinho.length;
  $("limparCarrinhoV7").disabled=!carrinho.length;
  if(!carrinho.length){
    box.innerHTML='<div style="padding:25px;text-align:center;color:#888">Seu carrinho está vazio.</div>';
    return;
  }
  box.innerHTML=carrinho.map(i=>`
    <article class="item-carrinho-v7">
      <div class="item-carrinho-v7-info">
        <strong>${i.quantidade||1}x ${i.nome}</strong>
        ${(i.adicionais||[]).length?`<small>Adicionais: ${(i.adicionais||[]).map(a=>a.nome).join(", ")}</small>`:""}
        ${i.observacao?`<small>Obs.: ${i.observacao}</small>`:""}
        <span>${moeda(valorItem(i))}</span>
      </div>
      <div class="item-carrinho-v7-acoes">
        <button class="alt" data-uid="${i.uid}">✏️ Alterar</button>
        <button class="excluir" data-uid="${i.uid}">🗑 Excluir</button>
      </div>
    </article>`).join("");
  box.querySelectorAll(".alt").forEach(b=>b.onclick=()=>{
    $("modalCarrinhoV7").classList.remove("ativo");
    const item=carrinho.find(x=>String(x.uid)===String(b.dataset.uid));
    abrirProduto(item.id,item.uid);
  });
  box.querySelectorAll(".excluir").forEach(b=>b.onclick=()=>{
    const item=carrinho.find(x=>String(x.uid)===String(b.dataset.uid));
    if(!item)return;
    if(confirm(`Excluir ${item.nome}?`)){
      carrinho=carrinho.filter(x=>String(x.uid)!==String(b.dataset.uid));
      salvarCarrinho();renderCarrinhoModal();
    }
  });
}

$("confirmarProdutoV7").onclick=confirmarProduto;
$("fecharProdutoV7").onclick=()=>$("modalProdutoV7").classList.remove("ativo");
$("continuarComprandoV7").onclick=()=>$("modalDepoisAdicionarV7").classList.remove("ativo");
$("finalizarPedidoV7").onclick=async()=>{
  await atualizarEstadoLojaAntesDeFinalizarV20();
  if(lojaFechadaV18()){avisarLojaFechadaV18();return}
  if(!confirmarChapeuApos22V22())return;
  if(!validarSomenteRetiradaAntesFinalizarV20())return;
  if(!validarItemPrincipalV15())return;
  localStorage.setItem("bb_tipo_pedido",tipoPedido);
  location.href="/checkout.html";
};
$("verPedidoV7").onclick=()=>{renderCarrinhoModal();$("modalCarrinhoV7").classList.add("ativo")};
$("fecharCarrinhoV7").onclick=()=>$("modalCarrinhoV7").classList.remove("ativo");
$("continuarCarrinhoV7").onclick=()=>$("modalCarrinhoV7").classList.remove("ativo");
$("finalizarCarrinhoV7").onclick=async()=>{
  await atualizarEstadoLojaAntesDeFinalizarV20();
  if(lojaFechadaV18()){avisarLojaFechadaV18();return}
  if(!confirmarChapeuApos22V22())return;
  if(!validarSomenteRetiradaAntesFinalizarV20())return;
  if(!validarItemPrincipalV15())return;
  location.href="/checkout.html";
};
$("limparCarrinhoV7").onclick=()=>{
  if(carrinho.length&&confirm("Limpar todo o carrinho?")){
    carrinho=[];salvarCarrinho();renderCarrinhoModal();
  }
};
$("modalProdutoV7").onclick=e=>{if(e.target===$("modalProdutoV7"))$("modalProdutoV7").classList.remove("ativo")};
$("modalDepoisAdicionarV7").onclick=e=>{if(e.target===$("modalDepoisAdicionarV7"))$("modalDepoisAdicionarV7").classList.remove("ativo")};
$("modalCarrinhoV7").onclick=e=>{if(e.target===$("modalCarrinhoV7"))$("modalCarrinhoV7").classList.remove("ativo")};


$("alterarTipoPedidoV10").onclick=()=>{
  atualizarTipoPedidoV10(tipoPedido);
  $("modalTipoPedidoV10").classList.add("ativo");
};
$("fecharTipoPedidoV10").onclick=()=>$("modalTipoPedidoV10").classList.remove("ativo");
document.querySelectorAll(".tipo-opcao-v10").forEach(b=>b.onclick=()=>{
  atualizarTipoPedidoV10(b.dataset.tipo);
  $("modalTipoPedidoV10").classList.remove("ativo");
});
$("modalTipoPedidoV10").onclick=e=>{
  if(e.target===$("modalTipoPedidoV10")) $("modalTipoPedidoV10").classList.remove("ativo");
};

atualizarBotaoCarrinho();
carregarCatalogo();


async function atualizarStatusLojaV23(){
  try{
    const r=await fetch("/api/orders",{method:"GET",cache:"no-store"});
    const j=await r.json();
    if(j && j.store){
      const antes=JSON.stringify(estadoLojaV16||{});
      estadoLojaV16=j.store;
      localStorage.setItem("bb_store_state",JSON.stringify(j.store));
      aplicarEstadoLojaCardapioV16();

      // If the store switched to pickup-only while customer is browsing,
      // preserve current modality until they decide at finalization.
      if(JSON.stringify(j.store)!==antes && j.store.pickup_only){
        console.log("Beach Burguer: estado atualizado para somente retirada.");
      }
    }
  }catch(e){}
}
let monitorStatusLojaV23=null;
function iniciarMonitorStatusLojaV23(){
  atualizarStatusLojaV23();
  if(monitorStatusLojaV23)clearInterval(monitorStatusLojaV23);
  monitorStatusLojaV23=setInterval(atualizarStatusLojaV23,3000);
}
window.addEventListener("focus",atualizarStatusLojaV23);
document.addEventListener("visibilitychange",()=>{
  if(!document.hidden) atualizarStatusLojaV23();
});

iniciarMonitorStatusLojaV23();

// V31.10: mantém o menu de categorias sincronizado com o Garçom/Admin.
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible"){
    carregarCatalogo().catch(()=>{});
  }
});
window.addEventListener("focus",()=>carregarCatalogo().catch(()=>{}));
setInterval(()=>carregarCatalogo().catch(()=>{}),15000);
