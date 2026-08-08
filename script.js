
const PADRAO = {
  config:{
    whatsapp:"5522997849915",
    chavePix:"22997849915",
    pixPayload:"00020101021126360014BR.GOV.BCB.PIX0114+55229978499155204000053039865802BR5925FABRICIO JUNIOR FERNANDES6009SAO PAULO62080504daqr63049539"
  },
  taxas:[
    {nome:"Selecione",valor:0},
    {nome:"Atafona",valor:0},
    {nome:"São João da Barra",valor:5},
    {nome:"Chapéu do Sol",valor:5}
  ],
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
    {id:19,categoria:"Bebidas",nome:"Guaraná Lata",descricao:"Guaraná lata gelado.",preco:7,ativo:true,disponivel:true},
    {id:20,categoria:"Bebidas",nome:"Coca-Cola 1,5L",descricao:"Coca-Cola 1,5 litro gelada.",preco:12,ativo:true,disponivel:true},
    {id:21,categoria:"Bebidas",nome:"Coca-Cola Zero 1,5L",descricao:"Coca-Cola Zero 1,5 litro gelada.",preco:12,ativo:true,disponivel:true},
    {id:22,categoria:"Bebidas",nome:"Guaraná 1,5L",descricao:"Guaraná 1,5 litro gelado.",preco:12,ativo:true,disponivel:true},
    {id:23,categoria:"Bebidas",nome:"Guaravita",descricao:"Guaravita gelado.",preco:3,ativo:true,disponivel:true},
    {id:24,categoria:"Bebidas",nome:"Guaravton",descricao:"Guaravton gelado.",preco:6,ativo:true,disponivel:true},
    {id:25,categoria:"Bebidas",nome:"Água com gás",descricao:"Água mineral com gás.",preco:4,ativo:true,disponivel:true},
    {id:26,categoria:"Bebidas",nome:"Água sem gás",descricao:"Água mineral sem gás.",preco:3,ativo:true,disponivel:true},
    {id:27,categoria:"Bebidas",nome:"H2O",descricao:"H2O gelada.",preco:8,ativo:true,disponivel:true}
  ]
};

const ADICIONAIS=[
  {nome:"Carne",preco:7},
  {nome:"Frango",preco:5},
  {nome:"Mussarela",preco:3},
  {nome:"Cheddar",preco:4},
  {nome:"Ovo",preco:2},
  {nome:"Calabresa",preco:2},
  {nome:"Bacon",preco:3},
  {nome:"Picles",preco:2},
  {nome:"Batata",preco:7}
];

const CATEGORIAS_SEM_ADICIONAIS=["Combos","Mistos Quentes","Beach Podrão","Bebidas","Doces"];
const CATEGORIAS=["Artesanais","Combos","Mistos Quentes","Beach Podrão","Bebidas","Doces"];

let dados=carregarDadosLocais();
let carrinho=JSON.parse(localStorage.getItem("bb_carrinho")||"[]");
let categoriaAtual="Artesanais";
let produtoSelecionado=null;
let pagamento="Pix";
let pixConfirmado=false;
let pixPaymentId=null;
let pixCopiaColaAtual="";
let pixValorGerado=0;
let pixPollingTimer=null;
let pixPollingStartedAt=0;
let pixFinalizacaoAutomaticaIniciada=false;
let adminToken="";

const $=id=>document.getElementById(id);
const moeda=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function carregarDadosLocais(){
  const salvo=JSON.parse(localStorage.getItem("bb_dados_v5")||"null");
  if(!salvo) return structuredClone(PADRAO);
  const base=structuredClone(PADRAO);
  base.taxas=Array.isArray(salvo.taxas)?salvo.taxas:base.taxas;
  base.produtos=base.produtos.map(p=>{
    const antigo=(salvo.produtos||[]).find(x=>Number(x.id)===p.id);
    return antigo?{...p,preco:Number(antigo.preco??p.preco),ativo:antigo.ativo!==false}:p;
  });
  return base;
}

function salvarDados(){localStorage.setItem("bb_dados_v5",JSON.stringify(dados))}
function salvarCarrinho(){localStorage.setItem("bb_carrinho",JSON.stringify(carrinho));renderCarrinho()}
function normalizarTelefone(valor){return String(valor||"").replace(/\D/g,"")}

function formatarTelefone(valor){
  const n=normalizarTelefone(valor).slice(0,11);
  if(n.length<=2)return n;
  if(n.length<=6)return `(${n.slice(0,2)}) ${n.slice(2)}`;
  if(n.length<=10)return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
}
function telefoneValido(valor){const n=normalizarTelefone(valor);return n.length===10||n.length===11}

function obterClientesSalvos(){
  try{return JSON.parse(localStorage.getItem("bb_clientes"))||{}}catch{return {}}
}
function salvarClienteAtual(){
  const tel=normalizarTelefone($("telefone").value);
  if(tel.length<10)return;
  const clientes=obterClientesSalvos();
  clientes[tel]={
    nome:$("nome").value.trim(),telefone:$("telefone").value.trim(),
    endereco:$("endereco").value.trim(),bairro:$("bairro").value.trim(),
    referencia:$("referencia").value.trim()
  };
  localStorage.setItem("bb_clientes",JSON.stringify(clientes));
}
function preencherClientePeloTelefone(){
  const tel=normalizarTelefone($("telefone").value);
  if(tel.length<10)return;
  const c=obterClientesSalvos()[tel];if(!c)return;
  $("nome").value=c.nome||"";$("endereco").value=c.endereco||"";
  $("bairro").value=c.bairro||"";$("referencia").value=c.referencia||"";
}

async function apiPedidos(method="GET",body=null,token=""){
  const options={method,headers:{"Content-Type":"application/json"}};
  if(token)options.headers["X-Store-Token"]=token;
  if(body)options.body=JSON.stringify(body);
  const resposta=await fetch("/api/orders",options);
  const resultado=await resposta.json();
  if(!resposta.ok||!resultado.ok)throw new Error(resultado.error||"Erro no servidor.");
  return resultado;
}

async function carregarDisponibilidade(){
  try{
    const resultado=await apiPedidos("GET",null,"");
    if(Array.isArray(resultado.catalog)&&resultado.catalog.length){
      dados.produtos=resultado.catalog.map(p=>({
        id:Number(p.id),categoria:p.category,nome:p.name,descricao:p.description||"",
        preco:Number(p.price||0),ativo:p.active!==false,disponivel:p.available!==false
      }));
      return;
    }
    if(Array.isArray(resultado.products)){
      resultado.products.forEach(status=>{
        const produto=dados.produtos.find(p=>p.id===Number(status.product_id));
        if(produto)produto.disponivel=status.available!==false;
      });
    }
  }catch(erro){
    console.warn("Não foi possível consultar catálogo:",erro.message);
  }
}

async function iniciar(){
  const link=`https://wa.me/${dados.config.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de fazer um pedido na Beach Burguer.")}`;
  $("whatsappTopo").href=link;$("whatsappFlutuante").href=link;

  renderTaxas();renderAbas();
  await carregarDisponibilidade();
  
function liberarConteudo(destino="#cardapio"){
  document.body.classList.remove("inicio-travado");
  requestAnimationFrame(()=>{
    const alvo=document.querySelector(destino);
    if(alvo)alvo.scrollIntoView({behavior:"smooth",block:"start"});
  });
}

function configurarPaginaInicial(){
  const hash=location.hash;
  const abrirDireto=hash==="#cardapio"||hash==="#finalizar";
  if(!abrirDireto){
    document.body.classList.add("inicio-travado");
    window.scrollTo(0,0);
  }

  const btnVer=$("verCardapio");
  if(btnVer){
    btnVer.onclick=()=>liberarConteudo("#cardapio");
  }

  document.querySelectorAll('a[href="#cardapio"]').forEach(a=>{
    a.addEventListener("click",e=>{
      if(document.body.classList.contains("inicio-travado")){
        e.preventDefault();
        liberarConteudo("#cardapio");
      }
    });
  });

  document.querySelectorAll('a[href="#finalizar"]').forEach(a=>{
    a.addEventListener("click",e=>{
      if(document.body.classList.contains("inicio-travado")){
        e.preventDefault();
        liberarConteudo("#finalizar");
      }
    });
  });

  window.addEventListener("hashchange",()=>{
    if(location.hash==="#cardapio"||location.hash==="#finalizar"){
      document.body.classList.remove("inicio-travado");
    }
  });
}

configurarPaginaInicial();
renderProdutos();renderCarrinho();atualizarCamposEntrega();atualizarBotaoPedido();
window.addEventListener("pageshow",()=>setTimeout(atualizarCamposEntrega,0));
setTimeout(atualizarCamposEntrega,100);
}

function renderTaxas(){
  $("taxaEntrega").innerHTML=dados.taxas.map(t=>`<option value="${t.valor}">${t.nome}${t.valor?` — ${moeda(t.valor)}`:""}</option>`).join("");
}
function renderAbas(){
  $("abas").innerHTML=CATEGORIAS.map(c=>`<button class="aba ${c===categoriaAtual?"ativa":""}" onclick="selecionarCategoria('${c}')">${c}</button>`).join("");
}
function selecionarCategoria(c){categoriaAtual=c;renderAbas();renderProdutos()}

function iconeProduto(categoria){
  if(categoria==="Mistos Quentes")return "🥪";
  if(categoria==="Combos")return "📦";
  if(categoria==="Beach Podrão")return "🍔";
  if(categoria==="Bebidas")return "🥤";
  if(categoria==="Doces")return "🍬";
  return "🍔";
}

function renderProdutos(){
  const lista=dados.produtos.filter(p=>p.categoria===categoriaAtual&&p.ativo);
  $("produtos").innerHTML=lista.map(p=>`
    <article class="produto ${p.disponivel===false?"produto-esgotado":""}">
      <div class="icone">${iconeProduto(p.categoria)}</div>
      ${p.disponivel===false?'<span class="selo-esgotado">ESGOTADO</span>':""}
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
      <div class="produto-rodape">
        <span class="preco">${moeda(p.preco)}</span>
        <button ${p.disponivel===false?"disabled":""} onclick="abrirProduto(${p.id})">${p.disponivel===false?"Em falta":"Adicionar"}</button>
      </div>
    </article>`).join("");
}

function abrirProduto(id){
  produtoSelecionado=dados.produtos.find(p=>p.id===id);
  if(!produtoSelecionado||produtoSelecionado.disponivel===false){
    alert("Este produto está em falta no momento.");return;
  }
  $("produtoNome").textContent=produtoSelecionado.nome;
  $("produtoDescricao").textContent=produtoSelecionado.descricao;
  $("produtoPreco").textContent=moeda(produtoSelecionado.preco);
  $("produtoQtd").value=1;$("produtoObs").value="";

  const aceitaAdicionais=!CATEGORIAS_SEM_ADICIONAIS.includes(produtoSelecionado.categoria);
  $("tituloAdicionais").hidden=!aceitaAdicionais;
  $("listaAdicionais").hidden=!aceitaAdicionais;
  $("listaAdicionais").innerHTML=aceitaAdicionais?ADICIONAIS.map((a,i)=>`
    <div class="adicional">
      <label><input type="checkbox" class="checkAdicional" data-i="${i}"> ${a.nome}</label>
      <strong>+ ${moeda(a.preco)}</strong>
    </div>`).join(""):"";

  $("modalProduto").classList.add("ativo");
}

function adicionarProduto(){
  const adicionais=[...document.querySelectorAll(".checkAdicional:checked")].map(c=>ADICIONAIS[Number(c.dataset.i)]);
  carrinho.push({
    uid:Date.now(),id:produtoSelecionado.id,nome:produtoSelecionado.nome,categoria:produtoSelecionado.categoria,
    preco:Number(produtoSelecionado.preco),quantidade:Math.max(1,Number($("produtoQtd").value)||1),
    adicionais,observacao:$("produtoObs").value.trim()
  });
  salvarCarrinho();$("modalProduto").classList.remove("ativo");
  resetarConfirmacaoPix();
  $("modalDepoisAdicionar").classList.add("ativo");
}

function valorItem(i){return (i.preco+(i.adicionais||[]).reduce((s,a)=>s+a.preco,0))*i.quantidade}
function subtotal(){return carrinho.reduce((s,i)=>s+valorItem(i),0)}
function taxaAtual(){
  if($("tipoPedido").value!=="Entrega")return 0;
  const local=$("taxaEntrega").selectedOptions[0]?.textContent?.split(" — ")[0]||"";
  if(local==="Atafona")return pagamento==="Cartão"?2:0;
  if(local==="São João da Barra"||local==="Chapéu do Sol")return 5;
  return 0;
}
function renderCarrinho(){
  $("itensCarrinho").innerHTML=carrinho.length?carrinho.map(i=>`
    <div class="item-carrinho">
      <div><strong>${i.quantidade}x ${i.nome}</strong>
      ${(i.adicionais||[]).length?`<small><br>+ ${i.adicionais.map(a=>a.nome).join(", ")}</small>`:""}
      ${i.observacao?`<small><br>Obs.: ${i.observacao}</small>`:""}
      <div class="controles"><button onclick="alterarQtd(${i.uid},-1)">−</button><span>${i.quantidade}</span>
      <button onclick="alterarQtd(${i.uid},1)">+</button><button onclick="removerItem(${i.uid})">🗑️</button></div></div>
      <strong>${moeda(valorItem(i))}</strong>
    </div>`).join(""):'<div class="vazio">Seu carrinho está vazio.</div>';
  const sub=subtotal(),taxa=taxaAtual();
  $("subtotal").textContent=moeda(sub);$("entrega").textContent=moeda(taxa);$("total").textContent=moeda(sub+taxa);
  $("contador").textContent=carrinho.reduce((s,i)=>s+i.quantidade,0);
}
function alterarQtd(uid,delta){const i=carrinho.find(x=>x.uid===uid);if(!i)return;i.quantidade+=delta;if(i.quantidade<=0)carrinho=carrinho.filter(x=>x.uid!==uid);resetarConfirmacaoPix();salvarCarrinho()}
function removerItem(uid){carrinho=carrinho.filter(x=>x.uid!==uid);resetarConfirmacaoPix();salvarCarrinho()}



function atualizarBotaoPedido(){
  const botao=$("enviarPedido");
  if(!botao)return;
  const bloqueado=pagamento==="Pix"&&!pixConfirmado;
  botao.disabled=bloqueado;
  botao.title=bloqueado?"O Mercado Pago ainda não confirmou o Pix.":"";
  botao.textContent=bloqueado?"Aguardando pagamento Pix":"Fazer pedido";
}

function pararPollingPix(){
  if(pixPollingTimer){
    clearInterval(pixPollingTimer);
    pixPollingTimer=null;
  }
}

function limparPixGerado(){
  pararPollingPix();
  pixConfirmado=false;
  pixPaymentId=null;
  pixCopiaColaAtual="";
  pixValorGerado=0;
  pixPollingStartedAt=0;
  pixFinalizacaoAutomaticaIniciada=false;

  if($("pixPagamentoArea"))$("pixPagamentoArea").hidden=true;
  if($("qrcodeDinamico"))$("qrcodeDinamico").innerHTML="";
  if($("pixCopiaCola"))$("pixCopiaCola").textContent="";
  if($("statusPix")){
    $("statusPix").textContent="Aguardando geração do Pix.";
    $("statusPix").className="status-pix aguardando";
  }
  if($("pixTempo"))$("pixTempo").textContent="";
  atualizarBotaoPedido();
}

function resetarConfirmacaoPix(){
  limparPixGerado();
}


function carrinhoTemLanche(){
  return carrinho.some(item=>{
    const produto=dados.produtos.find(p=>Number(p.id)===Number(item.id) || p.nome===item.nome);
    const categoria=String(item.categoria || produto?.categoria || "").trim().toLowerCase();
    return categoria && !["bebidas","doces"].includes(categoria);
  });
}

function validarLancheObrigatorio(){
  if(!carrinho.length)return true;
  if(carrinhoTemLanche())return true;

  alert("Para finalizar o pedido, é obrigatório escolher pelo menos 1 lanche. Não é permitido fazer pedido somente de bebidas e/ou doces.");
  document.querySelector("#cardapio")?.scrollIntoView({behavior:"smooth",block:"start"});
  return false;
}

function validarDadosParaPix(){
  if(!validarLancheObrigatorio())return false;
  if(!carrinho.length){alert("Adicione pelo menos um produto ao carrinho.");return false}
  if(!$("nome").value.trim()){alert("Preencha seu nome antes de gerar o Pix.");$("nome").focus();return false}
  if(!telefoneValido($("telefone").value)){alert("Informe um telefone com DDD antes de gerar o Pix.");$("telefone").focus();return false}
  if($("tipoPedido").value==="Entrega"&&(!$("endereco").value.trim()||!$("bairro").value.trim())){
    alert("Preencha endereço e bairro antes de gerar o Pix.");return false
  }
  if(subtotal()+taxaAtual()<=0){alert("O valor do pedido precisa ser maior que zero.");return false}
  return true;
}

async function gerarPixAutomatico(){
  if(!validarDadosParaPix())return;
  limparPixGerado();

  const btn=$("gerarPix");
  const original=btn.textContent;
  btn.disabled=true;
  btn.textContent="Gerando Pix...";

  try{
    const totalPedido=Number((subtotal()+taxaAtual()).toFixed(2));

    const resposta=await fetch("/api/pix-create",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        amount:totalPedido,
        name:$("nome").value.trim(),
        phone:normalizarTelefone($("telefone").value)
      })
    });

    const dadosPix=await resposta.json();
    if(!resposta.ok||!dadosPix.ok)throw new Error(dadosPix.error||"Não foi possível gerar o Pix.");

    pixPaymentId=String(dadosPix.payment_id);
    pixCopiaColaAtual=dadosPix.qr_code;
    pixValorGerado=totalPedido;
    pixPollingStartedAt=Date.now();

    $("pixPagamentoArea").hidden=false;
    $("pixCopiaCola").textContent=pixCopiaColaAtual;
    $("qrcodeDinamico").innerHTML="";

    if(window.QRCode){
      new QRCode($("qrcodeDinamico"),{
        text:pixCopiaColaAtual,
        width:210,
        height:210,
        correctLevel:QRCode.CorrectLevel.M
      });
    }

    $("statusPix").textContent="Pix gerado. Aguardando confirmação do Mercado Pago...";
    $("statusPix").className="status-pix aguardando";
    $("pixTempo").textContent="A confirmação é automática. Depois de pagar, aguarde alguns segundos.";
    iniciarPollingPix();
  }catch(erro){
    alert("Não foi possível gerar o Pix.\n\n"+erro.message);
    limparPixGerado();
  }finally{
    btn.disabled=false;
    btn.textContent=original;
  }
}

function iniciarPollingPix(){
  pararPollingPix();
  verificarStatusPix();
  pixPollingTimer=setInterval(verificarStatusPix,3000);
}

async function verificarStatusPix(){
  if(!pixPaymentId)return;

  try{
    const resposta=await fetch(
      `/api/pix-status?payment_id=${encodeURIComponent(pixPaymentId)}`,
      {cache:"no-store"}
    );

    const r=await resposta.json();
    if(!resposta.ok||!r.ok)throw new Error(r.error||"Erro ao consultar pagamento.");

    const totalAtual=Number((subtotal()+taxaAtual()).toFixed(2));
    const mesmoValor=
      Math.abs(Number(r.amount||0)-totalAtual)<0.01 &&
      Math.abs(pixValorGerado-totalAtual)<0.01;

    if(r.status==="approved"&&mesmoValor){
      pixConfirmado=true;
      pararPollingPix();
      $("statusPix").textContent="✅ Pagamento Pix confirmado automaticamente!";
      $("statusPix").className="status-pix pago";
      $("pixTempo").textContent="Pagamento aprovado. Finalizando seu pedido automaticamente...";
      atualizarBotaoPedido();

      if(!pixFinalizacaoAutomaticaIniciada){
        pixFinalizacaoAutomaticaIniciada=true;
        setTimeout(()=>{
          const botao=$("enviarPedido");
          if(botao && carrinho.length){
            botao.click();
          }
        },500);
      }
      return;
    }

    if(["rejected","cancelled","refunded","charged_back"].includes(r.status)){
      pararPollingPix();
      $("statusPix").textContent=`Pagamento não aprovado (${r.status}). Gere um novo Pix.`;
      $("statusPix").className="status-pix erro";
      pixConfirmado=false;
      atualizarBotaoPedido();
      return;
    }

    if(Date.now()-pixPollingStartedAt>30*60*1000){
      pararPollingPix();
      $("statusPix").textContent="Tempo de acompanhamento encerrado. Gere um novo Pix se necessário.";
      $("statusPix").className="status-pix erro";
    }
  }catch(erro){
    console.warn("Consulta Pix:",erro.message);
  }
}

function sincronizarTipoRapido(){
  const atual=$("tipoPedido").value;
  document.querySelectorAll(".tipo-rapido").forEach(btn=>{
    btn.classList.toggle("ativo",btn.dataset.tipoRapido===atual);
  });
}

function atualizarCamposEntrega(){
  sincronizarTipoRapido();
  const entrega=$("tipoPedido").value==="Entrega";

  // Usa style.display para garantir que o CSS do formulário não mantenha
  // os labels visíveis quando for Retirada ou Consumir no local.
  document.querySelectorAll(".campo-entrega").forEach(el=>{
    el.style.display=entrega?"":"none";
  });

  $("taxaEntrega").disabled=!entrega;

  if(!entrega){
    $("endereco").value="";
    $("bairro").value="";
    $("referencia").value="";
    $("observacoes").value="";
    $("taxaEntrega").selectedIndex=0;
  }
}

function selecionarTipoPedido(tipo){
  $("tipoPedido").value=tipo;
  atualizarCamposEntrega();
  resetarConfirmacaoPix();
  renderCarrinho();
  $("modalTipoPedido").classList.remove("ativo");
  $("cardapio").scrollIntoView({behavior:"smooth"});
}

function validar(){
  if(!validarLancheObrigatorio())return false;
  if(pagamento==="Pix"&&!pixConfirmado){alert("O Pix ainda não foi confirmado pelo Mercado Pago.");return false}
  if(!carrinho.length){alert("Adicione pelo menos um produto.");return false}
  if(!$("nome").value.trim()){alert("Preencha seu nome.");return false}
  if(!telefoneValido($("telefone").value)){alert("Informe um telefone com DDD. Exemplo: (22) 99784-9915.");$("telefone").focus();return false}
  if($("tipoPedido").value==="Entrega"&&(!$("endereco").value.trim()||!$("bairro").value.trim())){alert("Preencha endereço e bairro.");return false}
  return true;
}

async function enviarPedidoAoServidor(){
  const sub=subtotal(),taxa=taxaAtual();
  const local=$("tipoPedido").value==="Entrega"?($("taxaEntrega").selectedOptions[0]?.textContent?.split(" — ")[0]||""):$("tipoPedido").value;
  const pedido={
    action:"create",cliente:$("nome").value.trim(),telefone:$("telefone").value.trim(),
    endereco:$("endereco").value.trim(),bairro:$("bairro").value.trim(),referencia:$("referencia").value.trim(),
    localidade:local,tipo:$("tipoPedido").value,pagamento,
    troco:pagamento==="Dinheiro"?$("troco").value.trim():"",observacoes:$("observacoes").value.trim(),
    itens:carrinho.map(i=>({id:i.id,nome:i.nome,categoria:i.categoria || (dados.produtos.find(p=>Number(p.id)===Number(i.id) || p.nome===i.nome)?.categoria || ""),quantidade:i.quantidade,preco:i.preco,adicionais:i.adicionais,observacao:i.observacao,total:valorItem(i)})),
    subtotal:sub,entrega:taxa,total:sub+taxa,pix_payment_id:pagamento==="Pix"?pixPaymentId:null
  };
  return (await apiPedidos("POST",pedido)).order;
}

function montarMensagem(){
  const itens=carrinho.map(i=>{
    let t=`• ${i.quantidade}x ${i.nome} — ${moeda(valorItem(i))}`;
    if((i.adicionais||[]).length)t+=`\n  Adicionais: ${i.adicionais.map(a=>a.nome).join(", ")}`;
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
${$("tipoPedido").value==="Entrega"?`*Endereço:* ${$("endereco").value.trim()}\n*Bairro:* ${$("bairro").value.trim()}\n*Referência:* ${$("referencia").value.trim()||"Não informada"}\n`:""}*Pagamento:* ${pagamento}
${pagamento==="Dinheiro"?`*Troco para:* ${$("troco").value.trim()||"Não informado"}\n`:""}${pagamento==="Pix"?`*Chave Pix:* ${dados.config.chavePix}\n`:""}*Subtotal:* ${moeda(sub)}
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
      <label><input class="admin-ativo" data-id="${p.id}" type="checkbox" ${p.ativo?"checked":""}> Exibir</label>
      <label class="status-produto ${p.disponivel===false?"falta":"ok"}">
        <input class="admin-disponivel" data-id="${p.id}" type="checkbox" ${p.disponivel!==false?"checked":""}>
        ${p.disponivel===false?"Em falta":"Disponível"}
      </label>
    </div>`).join("");
  $("taxasAdmin").innerHTML=dados.taxas.map((t,i)=>`
    <div class="taxa-item"><input class="taxa-nome" data-i="${i}" value="${t.nome}">
    <input class="taxa-valor" data-i="${i}" type="number" step="0.01" value="${t.valor}"><span></span></div>`).join("");
}

async function entrarAdmin(){
  adminToken=$("senhaAdmin").value.trim();
  if(!adminToken)return alert("Digite a senha da loja.");
  try{
    const resultado=await apiPedidos("POST",{action:"list_products"},adminToken);
    if(Array.isArray(resultado.catalog)&&resultado.catalog.length){
      dados.produtos=resultado.catalog.map(p=>({
        id:Number(p.id),categoria:p.category,nome:p.name,descricao:p.description||"",
        preco:Number(p.price||0),ativo:p.active!==false,disponivel:p.available!==false
      }));
    }else if(Array.isArray(resultado.products)){
      resultado.products.forEach(s=>{const p=dados.produtos.find(x=>x.id===Number(s.product_id));if(p)p.disponivel=s.available!==false});
    }
    $("loginAdmin").hidden=true;$("conteudoAdmin").hidden=false;renderAdmin();
  }catch{alert("Senha incorreta ou conexão indisponível.")}
}

async function cadastrarProdutoAdmin(){
  const botao=$("cadastrarProdutoAdmin");
  const status=$("statusCadastroProduto");
  const categoria=$("novoProdutoCategoria")?.value||"";
  const nome=$("novoProdutoNome")?.value.trim()||"";
  const descricao=$("novoProdutoDescricao")?.value.trim()||"";
  const precoTexto=String($("novoProdutoPreco")?.value||"").replace(",",".");
  const preco=Number(precoTexto);

  if(!categoria||!nome){
    alert("Informe a categoria e o nome do produto.");
    return;
  }
  if(!Number.isFinite(preco)||preco<0){
    alert("Informe um preço válido.");
    return;
  }
  if(!adminToken){
    alert("Sua sessão do Admin expirou. Entre novamente com a senha.");
    return;
  }

  try{
    if(botao){botao.disabled=true;botao.textContent="CADASTRANDO...";}
    if(status)status.textContent="Salvando produto no catálogo online...";

    const r=await apiPedidos("POST",{
      action:"create_product",
      category:categoria,
      name:nome,
      description:descricao,
      price:preco
    },adminToken);

    if(!r.product||!r.product.id){
      throw new Error("O servidor não retornou o produto cadastrado.");
    }

    // Recarrega do servidor para garantir que o que aparece no Admin é exatamente o que foi salvo.
    const atualizado=await apiPedidos("POST",{action:"list_products"},adminToken);
    if(Array.isArray(atualizado.catalog)){
      dados.produtos=atualizado.catalog.map(p=>({
        id:Number(p.id),
        categoria:p.category,
        nome:p.name,
        descricao:p.description||"",
        preco:Number(p.price||0),
        ativo:p.active!==false,
        disponivel:p.available!==false
      }));
    }

    $("novoProdutoNome").value="";
    $("novoProdutoDescricao").value="";
    $("novoProdutoPreco").value="";

    salvarDados();
    renderAdmin();
    renderAbas();
    renderProdutos();

    if(status)status.textContent=`✅ ${nome} cadastrado com sucesso.`;
    alert("Produto cadastrado com sucesso!");
  }catch(e){
    console.error("Erro ao cadastrar produto:",e);
    if(status)status.textContent="❌ Não foi possível salvar o produto.";
    alert("Não foi possível cadastrar o produto.\n\n"+e.message);
  }finally{
    if(botao){botao.disabled=false;botao.textContent="Cadastrar produto";}
  }
}

window.cadastrarProdutoAdmin=cadastrarProdutoAdmin;

async function salvarAdmin(){
  document.querySelectorAll(".admin-preco").forEach(el=>{const p=dados.produtos.find(x=>x.id===Number(el.dataset.id));p.preco=Number(el.value||0)});
  document.querySelectorAll(".admin-ativo").forEach(el=>{const p=dados.produtos.find(x=>x.id===Number(el.dataset.id));p.ativo=el.checked});
  document.querySelectorAll(".taxa-nome").forEach(el=>dados.taxas[Number(el.dataset.i)].nome=el.value);
  document.querySelectorAll(".taxa-valor").forEach(el=>dados.taxas[Number(el.dataset.i)].valor=Number(el.value||0));

  const products=dados.produtos.map(p=>({
    id:p.id,
    price:Number(document.querySelector(`.admin-preco[data-id="${p.id}"]`)?.value??p.preco),
    active:Boolean(document.querySelector(`.admin-ativo[data-id="${p.id}"]`)?.checked),
    available:Boolean(document.querySelector(`.admin-disponivel[data-id="${p.id}"]`)?.checked)
  }));
  try{
    await apiPedidos("POST",{action:"save_catalog",products},adminToken);
    products.forEach(s=>{const p=dados.produtos.find(x=>x.id===s.id);if(p){p.preco=s.price;p.ativo=s.active;p.disponivel=s.available}});
    salvarDados();renderTaxas();renderProdutos();renderCarrinho();renderAdmin();
    alert("Alterações salvas online para todos os clientes e garçons.");
  }catch(erro){alert("Não foi possível salvar o catálogo online.\n\n"+erro.message)}
}


$("gerarPix").onclick=gerarPixAutomatico;

$("verCardapio").onclick=()=>$("modalTipoPedido").classList.add("ativo");
$("fecharTipoPedido").onclick=()=>$("modalTipoPedido").classList.remove("ativo");
$("modalTipoPedido").onclick=e=>{if(e.target===$("modalTipoPedido"))$("modalTipoPedido").classList.remove("ativo")};
document.querySelectorAll(".opcao-pedido").forEach(btn=>btn.addEventListener("click",()=>selecionarTipoPedido(btn.dataset.tipo)));
document.querySelectorAll(".tipo-rapido").forEach(btn=>btn.addEventListener("click",()=>{
  // Troca o tipo de pedido sem sair da tela de finalização.
  $("tipoPedido").value=btn.dataset.tipoRapido;
  atualizarCamposEntrega();
  resetarConfirmacaoPix();
  renderCarrinho();
}));

$("continuarComprando").onclick=()=>{
  $("modalDepoisAdicionar").classList.remove("ativo");
  $("cardapio").scrollIntoView({behavior:"smooth"});
};
$("irFinalizar").onclick=()=>{
  $("modalDepoisAdicionar").classList.remove("ativo");
  $("finalizar").scrollIntoView({behavior:"smooth"});
};

$("telefone").addEventListener("input",e=>e.target.value=formatarTelefone(e.target.value));
$("telefone").addEventListener("blur",preencherClientePeloTelefone);
$("telefone").addEventListener("change",preencherClientePeloTelefone);
["nome","endereco","bairro","referencia"].forEach(id=>{$(id).addEventListener("input",()=>{if(pixPaymentId)resetarConfirmacaoPix()})});

$("fecharProduto").onclick=()=>$("modalProduto").classList.remove("ativo");
$("confirmarProduto").onclick=adicionarProduto;
$("modalProduto").onclick=e=>{if(e.target===$("modalProduto"))$("modalProduto").classList.remove("ativo")};
$("pagamentos").onclick=e=>{
  const b=e.target.closest(".pagamento");if(!b)return;
  document.querySelectorAll(".pagamento").forEach(x=>x.classList.remove("ativo"));
  b.classList.add("ativo");pagamento=b.dataset.forma;
  $("pixBox").classList.toggle("ativo",pagamento==="Pix");
  $("campoTroco").style.display=pagamento==="Dinheiro"?"flex":"none";
  resetarConfirmacaoPix();
  renderCarrinho();
};
$("copiarPix").onclick=()=>{if(!pixCopiaColaAtual)return alert("Gere o Pix primeiro.");navigator.clipboard.writeText(pixCopiaColaAtual).then(()=>alert("Código Pix Copia e Cola copiado!")).catch(()=>prompt("Copie o código Pix:",pixCopiaColaAtual));};
$("taxaEntrega").onchange=()=>{resetarConfirmacaoPix();renderCarrinho()};
$("tipoPedido").onchange=()=>{atualizarCamposEntrega();resetarConfirmacaoPix();renderCarrinho()};
$("enviarPedido").onclick=async()=>{
  if(!validar())return;
  const botao=$("enviarPedido"),original=botao.textContent;botao.disabled=true;botao.textContent="PROCESSANDO...";
  try{
    salvarClienteAtual();const pedido=await enviarPedidoAoServidor();
    carrinho=[];resetarConfirmacaoPix();salvarCarrinho();alert(`Pedido #${pedido.id} realizado com sucesso! A loja já recebeu seu pedido.`);
  }catch(erro){alert("Não foi possível realizar o pedido.\n\n"+erro.message)}
  finally{botao.disabled=false;botao.textContent=original}
};
$("limparCarrinho").onclick=()=>{if(confirm("Limpar o carrinho?")){carrinho=[];resetarConfirmacaoPix();salvarCarrinho()}};
$("abrirAdmin").onclick=()=>{$("modalAdmin").classList.add("ativo");$("loginAdmin").hidden=false;$("conteudoAdmin").hidden=true;$("senhaAdmin").value=""};
$("fecharAdmin").onclick=()=>$("modalAdmin").classList.remove("ativo");
$("entrarAdmin").onclick=entrarAdmin;
$("salvarAdmin").onclick=salvarAdmin;
$("restaurarAdmin").onclick=()=>{if(confirm("Restaurar preços e exibição padrão neste navegador?")){dados=structuredClone(PADRAO);salvarDados();renderAdmin();renderTaxas();renderProdutos();renderCarrinho()}};

window.selecionarCategoria=selecionarCategoria;
window.abrirProduto=abrirProduto;
window.alterarQtd=alterarQtd;
window.removerItem=removerItem;
window.addEventListener("load",iniciar);
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js?v=832",{updateViaCache:"none"})
    .then(reg=>reg.update())
    .catch(()=>{});
}


// V8.31 - Meus Pedidos por telefone + notificações push no Cloudflare Pages
let telefoneConsultaPedidos="";
let pollingMeusPedidos=null;

const rotulosStatusPedidos={
  novo:"Pedido recebido",
  preparo:"Em preparação",
  pronto:"Pronto",
  entregue:"Entregue",
  cancelado:"Cancelado"
};

function etapasPedidoCliente(p){
  if(p.status==="cancelado")return '<span class="ativo">Cancelado</span>';
  const etapas=p.tipo==="Entrega"
    ?["novo","preparo","pronto","entregue"]
    :["novo","preparo","pronto"];
  const atual=Math.max(0,etapas.indexOf(p.status));
  return etapas.map((e,i)=>`<span class="${i<=atual?'ativo':''}">${rotulosStatusPedidos[e]||e}</span>`).join("");
}

function renderMeusPedidos(lista){
  const box=$("listaMeusPedidos");
  if(!box)return;
  if(!lista.length){
    box.innerHTML='<p>Nenhum pedido encontrado para este telefone.</p>';
    return;
  }
  box.innerHTML=lista.map(p=>`
    <div class="meu-pedido-card">
      <div class="meu-pedido-topo">
        <strong>Pedido #${p.id}</strong>
        <span class="meu-pedido-status">${rotulosStatusPedidos[p.status]||p.status}</span>
      </div>
      <div class="meu-pedido-etapas">${etapasPedidoCliente(p)}</div>
      <div class="meu-pedido-itens">${(p.itens||[]).map(i=>`${i.quantidade}x ${i.nome}`).join(" • ")}</div>
      <p>${p.tipo||""}</p>
      <div class="meu-pedido-total">${Number(p.total||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</div>
    </div>`).join("");
}

async function buscarMeusPedidos(silencioso=false){
  const campo=$("telefoneMeusPedidos");
  const tel=String(campo?.value||"").replace(/\D/g,"");
  if(tel.length!==10&&tel.length!==11){
    if(!silencioso)alert("Informe um telefone com DDD.");
    return;
  }
  telefoneConsultaPedidos=tel;
  try{
    const res=await fetch(`/api/orders?phone=${encodeURIComponent(tel)}`,{cache:"no-store"});
    const data=await res.json();
    if(!res.ok||!data.ok)throw new Error(data.error||"Erro");
    renderMeusPedidos(data.orders||[]);
    if(!silencioso)await ativarNotificacoesPedido(tel);
  }catch(e){
    if($("avisoMeusPedidos"))$("avisoMeusPedidos").textContent="Não foi possível consultar os pedidos.";
  }
}

function urlBase64ToUint8Array(base64String){
  const padding="=".repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(base64);
  return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
}

async function ativarNotificacoesPedido(tel){
  const aviso=$("avisoMeusPedidos");
  if(!("Notification" in window)||!("serviceWorker" in navigator)||!("PushManager" in window)){
    if(aviso)aviso.textContent="Acompanhe o status por esta tela. Este navegador não oferece notificações push.";
    return;
  }
  if(Notification.permission==="denied"){
    if(aviso)aviso.textContent="As notificações estão bloqueadas no navegador, mas o status continuará aparecendo aqui.";
    return;
  }
  try{
    const perm=Notification.permission==="granted"?"granted":await Notification.requestPermission();
    if(perm!=="granted")return;

    const keyRes=await fetch("/api/push-public-key",{cache:"no-store"});
    if(!keyRes.ok){
      if(aviso)aviso.textContent="Status disponível. As notificações push ainda precisam ser configuradas no Cloudflare.";
      return;
    }

    const {publicKey}=await keyRes.json();
    if(!publicKey)return;

    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(!sub){
      sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:urlBase64ToUint8Array(publicKey)
      });
    }

    const save=await fetch("/api/push-subscribe",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({phone:tel,subscription:sub})
    });
    if(!save.ok)throw new Error("Falha ao registrar notificação.");

    if(aviso)aviso.textContent="🔔 Notificações ativadas para este telefone.";
  }catch(e){
    console.warn("Push:",e);
    if(aviso)aviso.textContent="O status funciona normalmente, mas não foi possível ativar a notificação neste aparelho.";
  }
}

if($("abrirMeusPedidos")){
  $("abrirMeusPedidos").onclick=()=>{
    $("modalMeusPedidos").classList.add("ativo");
    $("telefoneMeusPedidos").value=$("telefone")?.value||"";
    if($("telefoneMeusPedidos").value)buscarMeusPedidos(true);
    clearInterval(pollingMeusPedidos);
    pollingMeusPedidos=setInterval(()=>{
      if(telefoneConsultaPedidos)buscarMeusPedidos(true);
    },5000);
  };
}
if($("fecharMeusPedidos")){
  $("fecharMeusPedidos").onclick=()=>{
    $("modalMeusPedidos").classList.remove("ativo");
    clearInterval(pollingMeusPedidos);
  };
}
if($("buscarMeusPedidos"))$("buscarMeusPedidos").onclick=()=>buscarMeusPedidos(false);
if($("telefoneMeusPedidos")){
  $("telefoneMeusPedidos").addEventListener("input",e=>{
    const n=String(e.target.value||"").replace(/\D/g,"").slice(0,11);
    if(n.length<=2)e.target.value=n;
    else if(n.length<=6)e.target.value=`(${n.slice(0,2)}) ${n.slice(2)}`;
    else if(n.length<=10)e.target.value=`(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
    else e.target.value=`(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
  });
}
