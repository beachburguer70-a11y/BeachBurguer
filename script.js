
const PADRAO = {
  config:{
    whatsapp:"5522997849915",
    chavePix:"22997849915",
    pixPayload:"00020101021126360014BR.GOV.BCB.PIX0114+55229978499155204000053039865802BR5925FABRICIO JUNIOR FERNANDES6009SAO PAULO62080504daqr63049539",
    senhaAdmin:"beach2026"
  },
  taxas:[
    {nome:"Selecione",valor:0},
    {nome:"Atafona",valor:0},
    {nome:"São João da Barra",valor:5},
    {nome:"Chapéu do Sol",valor:5}
  ],
  produtos:[
    {id:1,categoria:"Artesanais",nome:"Açu",descricao:"Pão brioche, hambúrguer artesanal, queijo e salada.",preco:15,ativo:true},
    {id:2,categoria:"Artesanais",nome:"SJB",descricao:"Pão brioche, hambúrguer artesanal, queijo, ovo e salada.",preco:17,ativo:true},
    {id:3,categoria:"Artesanais",nome:"Iquipari",descricao:"Pão brioche, hambúrguer artesanal, queijo, ovo, calabresa e salada.",preco:19,ativo:true},
    {id:4,categoria:"Artesanais",nome:"Grussaí",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, ovo, bacon e salada.",preco:21,ativo:true},
    {id:5,categoria:"Artesanais",nome:"Chapéu do Sol",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, ovo, calabresa, bacon e salada.",preco:23,ativo:true},
    {id:6,categoria:"Artesanais",nome:"Balneário",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, ovo, calabresa, bacon, picles e salada.",preco:25,ativo:true},
    {id:7,categoria:"Artesanais",nome:"Dunas",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, frango artesanal, ovo, calabresa, bacon, picles e salada.",preco:30,ativo:true},
    {id:8,categoria:"Artesanais",nome:"Pontal",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, frango artesanal, 2 ovos, calabresa, bacon, picles e salada.",preco:32,ativo:true},
    {id:9,categoria:"Artesanais",nome:"Atafona",descricao:"Pão brioche, hambúrguer artesanal, queijo cheddar, 2 frangos artesanais, 2 ovos, calabresa, bacon, picles e salada.",preco:37,ativo:true},
    {id:10,categoria:"Artesanais",nome:"Beach Burguer",descricao:"Pão brioche, 2 hambúrgueres artesanais, 2 queijos cheddar, 2 frangos artesanais, 2 ovos, calabresa, bacon, picles e salada.",preco:44,ativo:true},
    {id:11,categoria:"Combos",nome:"Combo Beach Casal",descricao:"2 Chapéu do Sol, 2 Guaravitas e batata 100g.",preco:45,ativo:true},
    {id:12,categoria:"Combos",nome:"Combo Beach Família",descricao:"1 SJB, 1 Dunas, 1 Grussaí, refrigerante 1,5L e batata 200g.",preco:67,ativo:true},
    {id:13,categoria:"Mistos Quentes",nome:"Misto Tradicional",descricao:"2 queijos, 2 presuntos, orégano, batata 100g, maionese e ketchup.",preco:10,ativo:true},
    {id:14,categoria:"Mistos Quentes",nome:"Misto com Ovo",descricao:"2 queijos, 2 presuntos, ovo, orégano, batata 100g, maionese e ketchup.",preco:12,ativo:true},
    {id:15,categoria:"Mistos Quentes",nome:"Misto com Ovo e Salsicha",descricao:"2 queijos, 2 presuntos, ovo, salsicha, orégano, batata 100g, maionese e ketchup.",preco:14,ativo:true},
    {id:16,categoria:"Beach Podrão",nome:"Beach Podrão",descricao:"Pão, carne industrializada, ovo, salsicha, queijo, presunto, batata palha, milho e salada.",preco:20,ativo:true}
  ]
};

const ADICIONAIS=[
  {nome:"Bacon",preco:4},{nome:"Ovo",preco:2},{nome:"Queijo",preco:3},
  {nome:"Carne extra",preco:6},{nome:"Calabresa",preco:4}
];

let dados=JSON.parse(localStorage.getItem("bb_dados"))||structuredClone(PADRAO);
let carrinho=JSON.parse(localStorage.getItem("bb_carrinho"))||[];
let categoriaAtual="Artesanais";
let produtoSelecionado=null;
let pagamento="Pix";

const $=id=>document.getElementById(id);
const moeda=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function salvarDados(){localStorage.setItem("bb_dados",JSON.stringify(dados))}
function salvarCarrinho(){localStorage.setItem("bb_carrinho",JSON.stringify(carrinho));renderCarrinho()}


function normalizarTelefone(valor){
  return String(valor || "").replace(/\D/g,"");
}


function formatarTelefone(valor){
  const numeros=normalizarTelefone(valor).slice(0,11);
  if(numeros.length<=2) return numeros;
  if(numeros.length<=6) return `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
  if(numeros.length<=10) return `(${numeros.slice(0,2)}) ${numeros.slice(2,6)}-${numeros.slice(6)}`;
  return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
}

function telefoneValido(valor){
  const numeros=normalizarTelefone(valor);
  return numeros.length===10 || numeros.length===11;
}

function obterClientesSalvos(){
  try{
    return JSON.parse(localStorage.getItem("bb_clientes")) || {};
  }catch{
    return {};
  }
}

function salvarClienteAtual(){
  const telefoneNormalizado=normalizarTelefone($("telefone").value);
  if(telefoneNormalizado.length < 10) return;

  const clientes=obterClientesSalvos();
  clientes[telefoneNormalizado]={
    nome:$("nome").value.trim(),
    telefone:$("telefone").value.trim(),
    endereco:$("endereco").value.trim(),
    bairro:$("bairro").value.trim(),
    referencia:$("referencia").value.trim()
  };
  localStorage.setItem("bb_clientes",JSON.stringify(clientes));
}

function preencherClientePeloTelefone(){
  const telefoneNormalizado=normalizarTelefone($("telefone").value);
  if(telefoneNormalizado.length < 10) return;

  const cliente=obterClientesSalvos()[telefoneNormalizado];
  if(!cliente) return;

  $("nome").value=cliente.nome || "";
  $("endereco").value=cliente.endereco || "";
  $("bairro").value=cliente.bairro || "";
  $("referencia").value=cliente.referencia || "";
}

function iniciar(){
  const link=`https://wa.me/${dados.config.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de fazer um pedido na Beach Burguer.")}`;
  $("whatsappTopo").href=link;
  $("whatsappFlutuante").href=link;
  $("pixChave").textContent=dados.config.chavePix;

  const qr=$("qrcode"); qr.innerHTML="";
  if(window.QRCode){
    new QRCode(qr,{text:dados.config.pixPayload,width:190,height:190,correctLevel:QRCode.CorrectLevel.H});
  }

  renderTaxas();
  renderAbas();
  renderProdutos();
  renderCarrinho();
}

function renderTaxas(){
  $("taxaEntrega").innerHTML=dados.taxas.map(t=>`<option value="${t.valor}">${t.nome}${t.valor?` — ${moeda(t.valor)}`:""}</option>`).join("");
}

function renderAbas(){
  const categorias=["Artesanais","Combos","Mistos Quentes","Beach Podrão"];
  $("abas").innerHTML=categorias.map(c=>`<button class="aba ${c===categoriaAtual?"ativa":""}" onclick="selecionarCategoria('${c}')">${c}</button>`).join("");
}

function selecionarCategoria(c){
  categoriaAtual=c;
  renderAbas();
  renderProdutos();
}

function renderProdutos(){
  const lista=dados.produtos.filter(p=>p.categoria===categoriaAtual&&p.ativo);
  $("produtos").innerHTML=lista.map(p=>`
    <article class="produto">
      <div class="icone">${p.categoria==="Mistos Quentes"?"🥪":p.categoria==="Combos"?"🍟":p.categoria==="Beach Podrão"?"🌭":"🍔"}</div>
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
      <div class="produto-rodape">
        <span class="preco">${moeda(Number(p.preco))}</span>
        <button onclick="abrirProduto(${p.id})">Adicionar</button>
      </div>
    </article>`).join("");
}

function abrirProduto(id){
  produtoSelecionado=dados.produtos.find(p=>p.id===id);
  $("produtoNome").textContent=produtoSelecionado.nome;
  $("produtoDescricao").textContent=produtoSelecionado.descricao;
  $("produtoPreco").textContent=moeda(Number(produtoSelecionado.preco));
  $("produtoQtd").value=1;
  $("produtoObs").value="";
  $("listaAdicionais").innerHTML=ADICIONAIS.map((a,i)=>`
    <div class="adicional">
      <label><input type="checkbox" class="checkAdicional" data-i="${i}"> ${a.nome}</label>
      <strong>+ ${moeda(a.preco)}</strong>
    </div>`).join("");
  $("modalProduto").classList.add("ativo");
}

function adicionarProduto(){
  const adicionais=[...document.querySelectorAll(".checkAdicional:checked")].map(c=>ADICIONAIS[Number(c.dataset.i)]);
  carrinho.push({
    uid:Date.now(),id:produtoSelecionado.id,nome:produtoSelecionado.nome,
    preco:Number(produtoSelecionado.preco),quantidade:Math.max(1,Number($("produtoQtd").value)||1),
    adicionais,observacao:$("produtoObs").value.trim()
  });
  salvarCarrinho();
  $("modalProduto").classList.remove("ativo");
  $("finalizar").scrollIntoView({behavior:"smooth"});
}

function valorItem(i){
  return (i.preco+i.adicionais.reduce((s,a)=>s+a.preco,0))*i.quantidade;
}
function subtotal(){return carrinho.reduce((s,i)=>s+valorItem(i),0)}
function taxaAtual(){
  if($("tipoPedido").value==="Retirada no local") return 0;
  const localidade=$("taxaEntrega").selectedOptions[0]?.textContent?.split(" — ")[0] || "";
  if(localidade==="Atafona") return pagamento==="Cartão" ? 2 : 0;
  if(localidade==="São João da Barra" || localidade==="Chapéu do Sol") return 5;
  return 0;
}

function renderCarrinho(){
  $("itensCarrinho").innerHTML=carrinho.length?carrinho.map(i=>`
    <div class="item-carrinho">
      <div>
        <strong>${i.quantidade}x ${i.nome}</strong>
        ${i.adicionais.length?`<small><br>+ ${i.adicionais.map(a=>a.nome).join(", ")}</small>`:""}
        ${i.observacao?`<small><br>Obs.: ${i.observacao}</small>`:""}
        <div class="controles">
          <button onclick="alterarQtd(${i.uid},-1)">−</button><span>${i.quantidade}</span>
          <button onclick="alterarQtd(${i.uid},1)">+</button>
          <button onclick="removerItem(${i.uid})">🗑️</button>
        </div>
      </div>
      <strong>${moeda(valorItem(i))}</strong>
    </div>`).join(""):'<div class="vazio">Seu carrinho está vazio.</div>';

  const sub=subtotal(),taxa=taxaAtual();
  $("subtotal").textContent=moeda(sub);
  $("entrega").textContent=moeda(taxa);
  $("total").textContent=moeda(sub+taxa);
  $("contador").textContent=carrinho.reduce((s,i)=>s+i.quantidade,0);
}

function alterarQtd(uid,delta){
  const item=carrinho.find(i=>i.uid===uid);
  if(!item)return;
  item.quantidade+=delta;
  if(item.quantidade<=0)carrinho=carrinho.filter(i=>i.uid!==uid);
  salvarCarrinho();
}
function removerItem(uid){carrinho=carrinho.filter(i=>i.uid!==uid);salvarCarrinho()}

function validar(){
  if(!carrinho.length){alert("Adicione pelo menos um produto.");return false}
  if(!$("nome").value.trim()){alert("Preencha seu nome.");return false}
  if(!telefoneValido($("telefone").value)){
    alert("Informe um telefone com DDD. Exemplo: (22) 99784-9915.");
    $("telefone").focus();
    return false;
  }
  if($("tipoPedido").value==="Entrega"&&(!$("endereco").value.trim()||!$("bairro").value.trim())){
    alert("Preencha endereço e bairro.");return false
  }
  return true;
}


async function enviarPedidoAoServidor(){
  const sub=subtotal();
  const taxa=taxaAtual();
  const localidade=$("tipoPedido").value==="Entrega"
    ? ($("taxaEntrega").selectedOptions[0]?.textContent?.split(" — ")[0] || "")
    : "Retirada";

  const pedido={
    action:"create",
    cliente:$("nome").value.trim(),
    telefone:$("telefone").value.trim(),
    endereco:$("endereco").value.trim(),
    bairro:$("bairro").value.trim(),
    referencia:$("referencia").value.trim(),
    localidade,
    tipo:$("tipoPedido").value,
    pagamento,
    troco:pagamento==="Dinheiro"?$("troco").value.trim():"",
    observacoes:$("observacoes").value.trim(),
    itens:carrinho.map(i=>({
      nome:i.nome,
      quantidade:i.quantidade,
      preco:i.preco,
      adicionais:i.adicionais,
      observacao:i.observacao,
      total:valorItem(i)
    })),
    subtotal:sub,
    entrega:taxa,
    total:sub+taxa
  };

  const resposta=await fetch("/api/orders",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(pedido)
  });
  const resultado=await resposta.json();
  if(!resposta.ok||!resultado.ok){
    throw new Error(resultado.error||"Não foi possível registrar o pedido.");
  }
  return resultado.order;
}

function montarMensagem(){
  const itens=carrinho.map(i=>{
    let t=`• ${i.quantidade}x ${i.nome} — ${moeda(valorItem(i))}`;
    if(i.adicionais.length)t+=`\n  Adicionais: ${i.adicionais.map(a=>a.nome).join(", ")}`;
    if(i.observacao)t+=`\n  Obs.: ${i.observacao}`;
    return t;
  }).join("\n");

  const sub=subtotal(),taxa=taxaAtual();
  return `🍔 *NOVO PEDIDO - BEACH BURGUER*

*Cliente:* ${$("nome").value.trim()}
*Telefone:* ${$("telefone").value.trim()}

*PEDIDO:*
${itens}

*Tipo:* ${$("tipoPedido").value}
${$("tipoPedido").value==="Entrega"?`*Endereço:* ${$("endereco").value.trim()}\n*Bairro:* ${$("bairro").value.trim()}\n*Referência:* ${$("referencia").value.trim()||"Não informada"}\n`:""}
*Pagamento:* ${pagamento}
${pagamento==="Dinheiro"?`*Troco para:* ${$("troco").value.trim()||"Não informado"}\n`:""}
${pagamento==="Pix"?`*Chave Pix:* ${dados.config.chavePix}\n`:""}
*Subtotal:* ${moeda(sub)}
*Entrega:* ${moeda(taxa)}
*TOTAL:* ${moeda(sub+taxa)}

*Observações:* ${$("observacoes").value.trim()||"Nenhuma"}

Aguardo a confirmação.`;
}

function renderAdmin(){
  $("listaAdmin").innerHTML=dados.produtos.map(p=>`
    <div class="admin-item">
      <div><strong>${p.nome}</strong><br><small>${p.categoria}</small></div>
      <input class="admin-preco" data-id="${p.id}" type="number" step="0.01" value="${p.preco}">
      <label><input class="admin-ativo" data-id="${p.id}" type="checkbox" ${p.ativo?"checked":""}> Ativo</label>
    </div>`).join("");

  $("taxasAdmin").innerHTML=dados.taxas.map((t,i)=>`
    <div class="taxa-item">
      <input class="taxa-nome" data-i="${i}" value="${t.nome}">
      <input class="taxa-valor" data-i="${i}" type="number" step="0.01" value="${t.valor}">
      <span></span>
    </div>`).join("");
}



$("telefone").addEventListener("input",e=>{
  const pos=e.target.selectionStart;
  e.target.value=formatarTelefone(e.target.value);
});

$("telefone").addEventListener("blur",preencherClientePeloTelefone);
$("telefone").addEventListener("change",preencherClientePeloTelefone);

$("fecharProduto").onclick=()=>$("modalProduto").classList.remove("ativo");
$("confirmarProduto").onclick=adicionarProduto;
$("modalProduto").onclick=e=>{if(e.target===$("modalProduto"))$("modalProduto").classList.remove("ativo")};

$("pagamentos").onclick=e=>{
  const b=e.target.closest(".pagamento");if(!b)return;
  document.querySelectorAll(".pagamento").forEach(x=>x.classList.remove("ativo"));
  b.classList.add("ativo");pagamento=b.dataset.forma;
  $("pixBox").classList.toggle("ativo",pagamento==="Pix");
  $("campoTroco").style.display=pagamento==="Dinheiro"?"flex":"none";
  renderCarrinho();
};

$("copiarPix").onclick=()=>navigator.clipboard.writeText(dados.config.chavePix).then(()=>alert("Chave Pix copiada!")).catch(()=>prompt("Copie a chave Pix:",dados.config.chavePix));
$("taxaEntrega").onchange=renderCarrinho;
$("tipoPedido").onchange=()=>{$("taxaEntrega").disabled=$("tipoPedido").value==="Retirada no local";renderCarrinho()};
$("enviarPedido").onclick=async()=>{
  if(!validar()) return;

  const botao=$("enviarPedido");
  const original=botao.textContent;
  botao.disabled=true;
  botao.textContent="ENVIANDO...";

  try{
    salvarClienteAtual();
    const pedido=await enviarPedidoAoServidor();
    const mensagem=`*Pedido #${pedido.id}*

${montarMensagem()}`;
    window.open(`https://wa.me/${dados.config.whatsapp}?text=${encodeURIComponent(mensagem)}`,"_blank");
    carrinho=[];
    salvarCarrinho();
    alert(`Pedido #${pedido.id} recebido pela loja!`);
  }catch(erro){
    alert("Não foi possível enviar o pedido.\n\n"+erro.message);
  }finally{
    botao.disabled=false;
    botao.textContent=original;
  }
};

$("limparCarrinho").onclick=()=>{if(confirm("Limpar o carrinho?")){carrinho=[];salvarCarrinho()}};

$("abrirAdmin").onclick=()=>{$("modalAdmin").classList.add("ativo");$("loginAdmin").hidden=false;$("conteudoAdmin").hidden=true;$("senhaAdmin").value=""};
$("fecharAdmin").onclick=()=>$("modalAdmin").classList.remove("ativo");
$("entrarAdmin").onclick=()=>{
  if($("senhaAdmin").value===dados.config.senhaAdmin){
    $("loginAdmin").hidden=true;$("conteudoAdmin").hidden=false;renderAdmin();
  }else alert("Senha incorreta.");
};
$("salvarAdmin").onclick=()=>{
  document.querySelectorAll(".admin-preco").forEach(el=>{
    const p=dados.produtos.find(x=>x.id===Number(el.dataset.id));
    p.preco=Number(el.value||0);
  });
  document.querySelectorAll(".admin-ativo").forEach(el=>{
    const p=dados.produtos.find(x=>x.id===Number(el.dataset.id));
    p.ativo=el.checked;
  });
  document.querySelectorAll(".taxa-nome").forEach(el=>dados.taxas[Number(el.dataset.i)].nome=el.value);
  document.querySelectorAll(".taxa-valor").forEach(el=>dados.taxas[Number(el.dataset.i)].valor=Number(el.value||0));
  salvarDados();renderTaxas();renderProdutos();renderCarrinho();alert("Alterações salvas neste navegador.");
};
$("restaurarAdmin").onclick=()=>{
  if(confirm("Restaurar todos os produtos e preços originais?")){
    dados=structuredClone(PADRAO);salvarDados();renderAdmin();renderTaxas();renderProdutos();renderCarrinho();
  }
};

window.selecionarCategoria=selecionarCategoria;
window.abrirProduto=abrirProduto;
window.alterarQtd=alterarQtd;
window.removerItem=removerItem;

window.addEventListener("load",iniciar);
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
