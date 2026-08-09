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

const ADICIONAIS = [
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
const TOKEN_KEY="bb_store_token";
const GARCOM_CART_KEY="bb_carrinho_garcom";

let token=localStorage.getItem(TOKEN_KEY)||"";
let dados=carregarDadosLocais();
let carrinho=[];
let categoriaAtual="Artesanais";
let produtoSelecionado=null;
let tipoPedido="Consumir no local";
let pagamento="A pagar";
let pesquisaProdutoGarcom="";
let enviando=false;
let pedidoEditando=null;
let itemEditandoUid=null;

const $=id=>document.getElementById(id);
const moeda=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const normalizarTelefone=v=>String(v||"").replace(/\D/g,"");

function carregarDadosLocais(){
  try{
    const salvo=JSON.parse(localStorage.getItem("bb_dados_v5")||"null");
    if(!salvo)return structuredClone(PADRAO);
    const base=structuredClone(PADRAO);
    base.produtos=base.produtos.map(p=>{
      const antigo=(salvo.produtos||[]).find(x=>Number(x.id)===p.id);
      return antigo?{...p,preco:Number(antigo.preco??p.preco),ativo:antigo.ativo!==false}:p;
    });
    return base;
  }catch{return structuredClone(PADRAO)}
}

async function api(method="GET",body=null,withToken=false){
  const options={method,headers:{"Content-Type":"application/json"}};
  if(withToken&&token)options.headers["X-Store-Token"]=token;
  if(body)options.body=JSON.stringify(body);
  const res=await fetch("/api/orders",options);
  const data=await res.json();
  if(!res.ok||!data.ok)throw new Error(data.error||"Erro no servidor.");
  return data;
}

async function entrar(){
  token=$("senhaGarcom").value.trim();
  if(!token)return alert("Digite a senha da loja.");
  try{
    await api("POST",{action:"list_orders",limit:1},true);
    localStorage.setItem(TOKEN_KEY,token);
    $("loginGarcom").classList.add("hidden");
    $("appGarcom").classList.remove("hidden");
    await carregarDisponibilidade();
    renderTudo();
  }catch(e){
    alert("Senha incorreta ou conexão indisponível.");
  }
}

async function carregarDisponibilidade(){
  try{
    const r=await api("GET");
    if(Array.isArray(r.catalog)&&r.catalog.length){
      dados.produtos=r.catalog.map(p=>({
        id:Number(p.id),categoria:p.category,nome:p.name,descricao:p.description||"",
        preco:Number(p.price||0),ativo:p.active!==false,disponivel:p.available!==false
      }));
      return;
    }
    (r.products||[]).forEach(st=>{
      const p=dados.produtos.find(x=>x.id===Number(st.product_id));
      if(p)p.disponivel=st.available!==false;
    });
  }catch(e){console.warn(e)}
}

function icone(c){
  return c==="Bebidas"?"🥤":c==="Doces"?"🍬":c==="Combos"?"📦":c==="Mistos Quentes"?"🥪":"🍔";
}

function renderAbas(){
  $("abasGarcom").innerHTML=CATEGORIAS.map(c=>
    `<button class="aba ${c===categoriaAtual?"ativa":""}" onclick="selecionarCategoriaGarcom('${c.replace(/'/g,"\\'")}')">${c}</button>`
  ).join("");
}

function renderProdutos(){
  const termo=String(pesquisaProdutoGarcom||"").trim().toLowerCase();

  const lista=dados.produtos.filter(p=>{
    if(!p.ativo)return false;

    if(termo){
      const texto=`${p.nome||""} ${p.descricao||""} ${p.categoria||""}`.toLowerCase();
      return texto.includes(termo);
    }

    return p.categoria===categoriaAtual;
  });

  $("produtosGarcom").innerHTML=lista.length?lista.map(p=>`
    <article class="produto ${p.disponivel===false?"produto-esgotado":""}">
      <div class="icone">${icone(p.categoria)}</div>
      ${p.disponivel===false?'<span class="selo-esgotado">ESGOTADO</span>':""}
      ${termo?`<small style="color:#999;font-weight:800">${esc(p.categoria)}</small>`:""}
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
      <div class="produto-rodape">
        <span class="preco">${moeda(p.preco)}</span>
        <button ${p.disponivel===false?"disabled":""} onclick="abrirProdutoGarcom(${p.id})">${p.disponivel===false?"Em falta":"Adicionar"}</button>
      </div>
    </article>`).join(""):`<div class="garcom-card" style="grid-column:1/-1;text-align:center"><p>${termo?"Nenhum item encontrado para esta pesquisa.":"Nenhum produto cadastrado nesta categoria."}</p></div>`;
}
function selecionarCategoriaGarcom(c){
  categoriaAtual=c;
  pesquisaProdutoGarcom="";
  if($("pesquisaProdutoGarcom"))$("pesquisaProdutoGarcom").value="";
  renderAbas();
  renderProdutos();
}


function numeroMoedaGarcom(v){
  const n=Number(String(v||"").replace(/\s/g,"").replace("R$","").replace(/\./g,"").replace(",","."));
  return Number.isFinite(n)?Math.max(0,n):0;
}
function valorEntregaGarcom(){return numeroMoedaGarcom($("valorEntregaGarcom")?.value)}
function ordenarCarrinhoGarcom(){
  const ordem=new Map(CATEGORIAS.map((c,i)=>[c,i]));
  carrinho.sort((a,b)=>(ordem.get(a.categoria)??999)-(ordem.get(b.categoria)??999));
}
function atualizarTrocoCalculadoGarcom(){
  const el=$("valorTrocoCalculadoGarcom");
  if(!el)return;
  if(!(tipoPedido==="Entrega"&&pagamento==="Dinheiro")){el.textContent="";return;}
  const recebido=numeroMoedaGarcom($("trocoGarcom").value);
  const valorTotal=total();
  if(!recebido){el.textContent="";return;}
  const troco=recebido-valorTotal;
  el.textContent=troco<0?`Valor insuficiente: faltam ${moeda(Math.abs(troco))}`:`Troco a dar: ${moeda(troco)}`;
}

function atualizarPagamentoGarcom(){
  const entrega=tipoPedido==="Entrega";
  const opcoes=entrega
    ? [["Dinheiro","💵 Dinheiro"],["Cartão","💳 Cartão"],["Pago","✅ Pago"]]
    : [["A pagar","⏳ A pagar"],["Pago","✅ Pago"]];
  if(!opcoes.some(x=>x[0]===pagamento))pagamento=opcoes[0][0];
  $("pagamentoPresencial").innerHTML=opcoes.map(([v,t])=>`<button type="button" class="pg-btn ${pagamento===v?"ativo":""}" data-pagamento="${v}">${t}</button>`).join("");
  document.querySelectorAll(".pg-btn").forEach(btn=>btn.onclick=()=>{
    pagamento=btn.dataset.pagamento;
    document.querySelectorAll(".pg-btn").forEach(b=>b.classList.toggle("ativo",b===btn));
    $("campoTrocoGarcom").classList.toggle("hidden",!(tipoPedido==="Entrega"&&pagamento==="Dinheiro"));
    if(pagamento!=="Dinheiro")$("trocoGarcom").value="";
    atualizarTrocoCalculadoGarcom();
  });
  $("campoTrocoGarcom").classList.toggle("hidden",!(entrega&&pagamento==="Dinheiro"));
  atualizarTrocoCalculadoGarcom();
}

function criarDialogoGarcom({titulo,texto,mostrarQuantidade=false,qtd=1}){
  return new Promise(resolve=>{
    const overlay=document.createElement("div");
    overlay.setAttribute("data-dialogo-garcom","1");
    Object.assign(overlay.style,{
      position:"fixed", inset:"0", zIndex:"999999",
      background:"rgba(0,0,0,.82)", display:"flex",
      alignItems:"center", justifyContent:"center", padding:"18px"
    });

    const box=document.createElement("div");
    Object.assign(box.style,{
      width:"min(430px,94vw)", background:"#111", color:"#fff",
      border:"2px solid #ffb800", borderRadius:"16px",
      padding:"20px", boxShadow:"0 18px 60px rgba(0,0,0,.55)",
      textAlign:"center"
    });

    const h=document.createElement("h2");
    h.textContent=titulo;
    h.style.margin="0 0 10px";

    const p=document.createElement("p");
    p.textContent=texto;
    p.style.margin="0 0 16px";

    box.appendChild(h);
    box.appendChild(p);

    let input=null;
    if(mostrarQuantidade){
      input=document.createElement("input");
      input.type="number";
      input.min="0";
      input.max=String(qtd);
      input.value="1";
      Object.assign(input.style,{
        width:"100%", boxSizing:"border-box", padding:"12px",
        borderRadius:"10px", border:"1px solid #555",
        background:"#050505", color:"#fff", fontSize:"20px",
        textAlign:"center", marginBottom:"14px"
      });
      box.appendChild(input);
    }

    const acoes=document.createElement("div");
    Object.assign(acoes.style,{
      display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"
    });

    const botao=(texto,bg,fg)=>{
      const b=document.createElement("button");
      b.type="button";
      b.textContent=texto;
      Object.assign(b.style,{
        border:"0", borderRadius:"10px", padding:"13px",
        fontWeight:"900", fontSize:"16px", cursor:"pointer",
        background:bg, color:fg
      });
      return b;
    };

    const fechar=(valor)=>{
      overlay.remove();
      resolve(valor);
    };

    if(!mostrarQuantidade){
      const sim=botao("SIM","#ffb800","#111");
      const nao=botao("NÃO","#2a2a2a","#fff");
      sim.onclick=()=>fechar(true);
      nao.onclick=()=>fechar(false);
      acoes.append(sim,nao);
    }else{
      const confirmar=botao("CONFIRMAR","#ffb800","#111");
      const cancelar=botao("CANCELAR","#2a2a2a","#fff");
      confirmar.onclick=()=>{
        let n=Math.floor(Number(input.value)||0);
        n=Math.max(0,Math.min(qtd,n));
        fechar(n);
      };
      cancelar.onclick=()=>fechar(null);
      acoes.append(confirmar,cancelar);
      setTimeout(()=>input.focus(),30);
    }

    box.appendChild(acoes);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}

function perguntarAdicionaisTodas(qtd){
  return criarDialogoGarcom({
    titulo:"Aplicar adicionais?",
    texto:`Aplicar os adicionais selecionados nas ${qtd} unidades?`
  });
}

function perguntarQuantidadeComAdicional(qtd){
  return criarDialogoGarcom({
    titulo:"Em quantas unidades?",
    texto:`Informe quantas das ${qtd} unidades terão os adicionais selecionados.`,
    mostrarQuantidade:true,
    qtd
  });
}

async function dividirAdicionaisPorQuantidade(qtd,adicionais,base){
  if(qtd<=1||!adicionais.length){
    return [{...base,quantidade:qtd,adicionais}];
  }

  const aplicarTodas=await perguntarAdicionaisTodas(qtd);

  if(aplicarTodas){
    return [{...base,quantidade:qtd,adicionais}];
  }

  const resposta=await perguntarQuantidadeComAdicional(qtd);
  if(resposta===null)return null;

  const partes=[];
  if(resposta>0){
    partes.push({...base,uid:Date.now()+Math.random(),quantidade:resposta,adicionais});
  }
  if(qtd-resposta>0){
    partes.push({...base,uid:Date.now()+Math.random(),quantidade:qtd-resposta,adicionais:[]});
  }
  return partes;
}

function abrirProdutoGarcom(id){
  produtoSelecionado=dados.produtos.find(p=>p.id===id);
  if(!produtoSelecionado||produtoSelecionado.disponivel===false)return;

  $("produtoNomeGarcom").textContent=produtoSelecionado.nome;
  $("produtoDescricaoGarcom").textContent=produtoSelecionado.descricao;
  $("produtoPrecoGarcom").textContent=moeda(produtoSelecionado.preco);
  itemEditandoUid=null;
  $("produtoQtdGarcom").value=1;
  $("produtoObsGarcom").value="";
  $("confirmarProdutoGarcom").textContent="Adicionar ao pedido";

  const aceita=!CATEGORIAS_SEM_ADICIONAIS.includes(produtoSelecionado.categoria);
  $("tituloAdicionaisGarcom").hidden=!aceita;
  $("listaAdicionaisGarcom").hidden=!aceita;
  $("listaAdicionaisGarcom").innerHTML=aceita?ADICIONAIS.map((a,i)=>`
    <div class="adicional">
      <label><input type="checkbox" class="checkAdicionalGarcom" data-i="${i}"> ${a.nome}</label>
      <strong>+ ${moeda(a.preco)}</strong>
    </div>`).join(""):"";

  $("modalProdutoGarcom").classList.add("ativo");
}

async function adicionarProduto(){
  if(!produtoSelecionado)return;
  const qtd=Math.max(1,Math.floor(Number($("produtoQtdGarcom").value)||1));
  const adicionais=[...document.querySelectorAll(".checkAdicionalGarcom:checked")]
    .map(c=>ADICIONAIS[Number(c.dataset.i)]);
  const base={
    uid:itemEditandoUid||Date.now()+Math.random(),
    id:produtoSelecionado.id,nome:produtoSelecionado.nome,categoria:produtoSelecionado.categoria,
    preco:Number(produtoSelecionado.preco),observacao:$("produtoObsGarcom").value.trim()
  };

  if(itemEditandoUid){
    const idx=carrinho.findIndex(x=>String(x.uid)===String(itemEditandoUid));
    if(idx>=0)carrinho.splice(idx,1);
  }
  const partes=await dividirAdicionaisPorQuantidade(qtd,adicionais,base);
  if(partes===null)return;
  carrinho.push(...partes);
  itemEditandoUid=null;
  ordenarCarrinhoGarcom();
  $("modalProdutoGarcom").classList.remove("ativo");
  renderCarrinho();
}
function editarItemGarcom(uid){
  const i=carrinho.find(x=>String(x.uid)===String(uid)); if(!i)return;
  produtoSelecionado=dados.produtos.find(p=>Number(p.id)===Number(i.id))||{id:i.id,nome:i.nome,categoria:i.categoria,descricao:"",preco:i.preco,disponivel:true};
  itemEditandoUid=i.uid;
  $("produtoNomeGarcom").textContent=produtoSelecionado.nome;
  $("produtoDescricaoGarcom").textContent=produtoSelecionado.descricao||"";
  $("produtoPrecoGarcom").textContent=moeda(produtoSelecionado.preco);
  $("produtoQtdGarcom").value=i.quantidade||1;
  $("produtoObsGarcom").value=i.observacao||"";
  const aceita=!CATEGORIAS_SEM_ADICIONAIS.includes(produtoSelecionado.categoria);
  $("tituloAdicionaisGarcom").hidden=!aceita; $("listaAdicionaisGarcom").hidden=!aceita;
  $("listaAdicionaisGarcom").innerHTML=aceita?ADICIONAIS.map((a,n)=>{
    const marcado=(i.adicionais||[]).some(x=>x.nome===a.nome);
    return `<div class="adicional"><label><input type="checkbox" class="checkAdicionalGarcom" data-i="${n}" ${marcado?"checked":""}> ${a.nome}</label><strong>+ ${moeda(a.preco)}</strong></div>`;
  }).join(""):"";
  $("confirmarProdutoGarcom").textContent="Salvar alteração";
  $("modalProdutoGarcom").classList.add("ativo");
}

function valorItem(i){
  return (Number(i.preco)+(i.adicionais||[]).reduce((s,a)=>s+Number(a.preco||0),0))*Number(i.quantidade||1);
}
function subtotalGarcom(){return carrinho.reduce((s,i)=>s+valorItem(i),0)}
function total(){return subtotalGarcom()+valorEntregaGarcom()}

function alterarQtd(uid,delta){
  const i=carrinho.find(x=>String(x.uid)===String(uid));
  if(!i)return;
  i.quantidade=Math.max(1,Number(i.quantidade||1)+delta);
  renderCarrinho();
}

function remover(uid){
  carrinho=carrinho.filter(x=>String(x.uid)!==String(uid));
  renderCarrinho();
}

function esc(v){
  return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function renderCarrinho(){
  ordenarCarrinhoGarcom();
  $("itensGarcom").innerHTML=carrinho.length?carrinho.map(i=>`
    <div class="cart-item">
      <div class="cart-item-top">
        <strong>${i.quantidade}x ${esc(i.nome)}</strong>
        <strong>${moeda(valorItem(i))}</strong>
      </div>
      ${(i.adicionais||[]).length?`<small>+ ${i.adicionais.map(a=>esc(a.nome)).join(", ")}</small>`:""}
      ${i.observacao?`<small><br>Obs.: ${esc(i.observacao)}</small>`:""}
      <div class="cart-controls">
        <button class="menos" onclick="alterarQtd('${i.uid}',-1)">−</button>
        <strong>${i.quantidade}</strong>
        <button class="mais" onclick="alterarQtd('${i.uid}',1)">+</button>
        <button class="alterar" onclick="editarItemGarcom('${i.uid}')">Alterar</button>
        <button class="remover" onclick="remover('${i.uid}')">Remover</button>
      </div>
    </div>`).join(""):'<div class="carrinho-vazio">Nenhum item adicionado.</div>';

  $("totalGarcom").textContent=moeda(total());
  atualizarTrocoCalculadoGarcom();
}

function renderTudo(){
  renderAbas();
  renderProdutos();
  renderCarrinho();
}

function novoPedido(){
  pedidoEditando=null;
  carrinho=[];
  $("nomeGarcom").value="";
  $("observacoesGarcom").value="";
  tipoPedido="Consumir no local";
  pagamento="A pagar";
  itemEditandoUid=null;
  $("valorEntregaGarcom").value="";
  $("trocoGarcom").value="";
  atualizarPagamentoGarcom();
  document.querySelectorAll(".tipo-btn").forEach(b=>b.classList.toggle("ativo",b.dataset.tipo===tipoPedido));
  document.querySelectorAll(".pg-btn").forEach(b=>b.classList.toggle("ativo",b.dataset.pagamento===pagamento));
  $("statusGarcom").textContent="";
  $("enviarGarcom").textContent="ENVIAR PEDIDO";
  const aviso=document.getElementById("avisoEdicaoGarcom");
  if(aviso)aviso.remove();
  renderCarrinho();
  window.scrollTo({top:0,behavior:"smooth"});
}


async function abrirListaEditarPedido(){
  $("modalEditarPedidoGarcom").classList.add("ativo");
  await carregarPedidosParaEditar();
}
async function carregarPedidosParaEditar(){
  const box=$("listaPedidosEditarGarcom");
  box.innerHTML="<p>Carregando pedidos...</p>";
  try{
    const r=await api("POST",{action:"list_orders",limit:100},true);
    const pedidos=(r.orders||[]).filter(p=>String(p.origem||"")==="garcom" && p.status!=="cancelado");
    window.__pedidosGarcomEditar=pedidos;
    box.innerHTML=pedidos.length?pedidos.map(p=>`
      <div class="pedido-editar-card">
        <div class="pedido-editar-topo"><strong>Pedido #${p.id} — ${esc(p.cliente)}</strong><strong>${moeda(p.total)}</strong></div>
        <div class="pedido-editar-itens">${(p.itens||[]).map(i=>`${i.quantidade}x ${esc(i.nome)}`).join(" • ")}</div>
        <small>${esc(p.tipo||"")} • ${esc(p.pagamento||"")} • ${esc(p.status||"")}</small>
        <button class="btn btn-amarelo btn-largo" onclick="carregarPedidoParaEdicao(${p.id})">Editar este pedido</button>
      </div>`).join(""):"<p>Nenhum pedido do garçom encontrado.</p>";
  }catch(e){box.innerHTML=`<p>Erro ao carregar pedidos: ${esc(e.message)}</p>`}
}
function carregarPedidoParaEdicao(id){
  const p=(window.__pedidosGarcomEditar||[]).find(x=>Number(x.id)===Number(id));
  if(!p)return;
  pedidoEditando=p;
  carrinho=(p.itens||[]).map((i,n)=>({uid:Date.now()+n+Math.random(),id:i.id,nome:i.nome,categoria:i.categoria||"",preco:Number(i.preco||0),quantidade:Number(i.quantidade||1),adicionais:Array.isArray(i.adicionais)?i.adicionais:[],observacao:i.observacao||""}));
  $("nomeGarcom").value=p.cliente||"";
  $("observacoesGarcom").value=p.observacoes||"";
  tipoPedido=p.tipo||"Consumir no local"; pagamento=p.pagamento||"A pagar";
  $("valorEntregaGarcom").value=Number(p.entrega||0)?Number(p.entrega).toFixed(2).replace(".",","):"";
  $("trocoGarcom").value=p.troco||"";
  document.querySelectorAll(".tipo-btn").forEach(b=>b.classList.toggle("ativo",b.dataset.tipo===tipoPedido));
  atualizarPagamentoGarcom();
  $("modalEditarPedidoGarcom").classList.remove("ativo");
  $("enviarGarcom").textContent=`SALVAR ALTERAÇÃO DO PEDIDO #${p.id}`;
  let aviso=document.getElementById("avisoEdicaoGarcom");
  if(!aviso){aviso=document.createElement("div");aviso.id="avisoEdicaoGarcom";aviso.className="modo-edicao-aviso";$("itensGarcom").parentElement.insertBefore(aviso,$("itensGarcom"))}
  aviso.textContent=`EDITANDO PEDIDO #${p.id} — ao salvar, será impresso novamente.`;
  renderCarrinho(); window.scrollTo({top:0,behavior:"smooth"});
}

function validar(){
  if(!$("nomeGarcom").value.trim()){
    alert("Informe o nome do cliente.");
    $("nomeGarcom").focus();
    return false;
  }
  if(!carrinho.length){
    alert("Adicione pelo menos um item ao pedido.");
    return false;
  }
  return true;
}

async function enviarPedido(){
  if(enviando||!validar())return;
  enviando=true;
  $("enviarGarcom").disabled=true;
  $("enviarGarcom").textContent="ENVIANDO...";
  $("statusGarcom").textContent="Enviando pedido para a cozinha...";

  try{
    const body={
      action:"create",
      cliente:$("nomeGarcom").value.trim(),
      telefone:"",
      endereco:"",
      bairro:"",
      referencia:"",
      localidade:tipoPedido,
      tipo:tipoPedido,
      pagamento,
      troco:(tipoPedido==="Entrega"&&pagamento==="Dinheiro")?$("trocoGarcom").value.trim():"",
      observacoes:$("observacoesGarcom").value.trim(),
      itens:carrinho.map(i=>({
        id:i.id,nome:i.nome,categoria:i.categoria,quantidade:i.quantidade,
        preco:i.preco,adicionais:i.adicionais,observacao:i.observacao,total:valorItem(i)
      })),
      subtotal:subtotalGarcom(),
      entrega:valorEntregaGarcom(),
      total:total(),
      origem:"garcom"
    };

    if(pedidoEditando){
      body.action="edit_waiter_order";
      body.id=pedidoEditando.id;
      await api("POST",body,true);
      alert(`Pedido #${pedidoEditando.id} atualizado! A comanda será impressa novamente com as alterações.`);
      novoPedido();
    }else{
      const r=await api("POST",body,false);
      const id=r.order?.id||"";
      alert(`Pedido ${id?"#"+id+" ":""}enviado para a cozinha!`);
      novoPedido();
    }
  }catch(e){
    $("statusGarcom").textContent="Erro ao enviar o pedido.";
    alert("Não foi possível enviar o pedido.\n\n"+e.message);
  }finally{
    enviando=false;
    $("enviarGarcom").disabled=false;
    $("enviarGarcom").textContent="ENVIAR PEDIDO";
  }
}

$("senhaGarcom").value=token;
$("entrarGarcom").onclick=entrar;
$("senhaGarcom").onkeydown=e=>{if(e.key==="Enter")entrar()};
$("sairGarcom").onclick=()=>{localStorage.removeItem(TOKEN_KEY);location.reload()};
$("novoPedido").onclick=()=>{if(!carrinho.length||confirm("Limpar o pedido atual e começar outro?"))novoPedido()};
$("fecharProdutoGarcom").onclick=()=>$("modalProdutoGarcom").classList.remove("ativo");
$("modalProdutoGarcom").onclick=e=>{if(e.target.id==="modalProdutoGarcom")$("modalProdutoGarcom").classList.remove("ativo")};
$("confirmarProdutoGarcom").onclick=adicionarProduto;
$("enviarGarcom").onclick=enviarPedido;

document.querySelectorAll(".tipo-btn").forEach(btn=>btn.onclick=()=>{
  tipoPedido=btn.dataset.tipo;
  document.querySelectorAll(".tipo-btn").forEach(b=>b.classList.toggle("ativo",b===btn));
  atualizarPagamentoGarcom();
});

document.querySelectorAll(".pg-btn").forEach(btn=>btn.onclick=()=>{
  pagamento=btn.dataset.pagamento;
  document.querySelectorAll(".pg-btn").forEach(b=>b.classList.toggle("ativo",b===btn));
});

window.selecionarCategoriaGarcom=selecionarCategoriaGarcom;
window.abrirProdutoGarcom=abrirProdutoGarcom;
window.alterarQtd=alterarQtd;
window.remover=remover;
window.editarItemGarcom=editarItemGarcom;

if(token)entrar();

$("editarPedidoGarcom").onclick=abrirListaEditarPedido;
$("fecharEditarPedidoGarcom").onclick=()=>$("modalEditarPedidoGarcom").classList.remove("ativo");
$("atualizarPedidosGarcom").onclick=carregarPedidosParaEditar;
$("modalEditarPedidoGarcom").onclick=e=>{if(e.target.id==="modalEditarPedidoGarcom")$("modalEditarPedidoGarcom").classList.remove("ativo")};


// V8.39 - pesquisa rápida de itens no cardápio do garçom
if($("pesquisaProdutoGarcom")){
  $("pesquisaProdutoGarcom").addEventListener("input",e=>{
    pesquisaProdutoGarcom=e.target.value||"";
    renderProdutos();
  });

  $("pesquisaProdutoGarcom").addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      e.target.value="";
      pesquisaProdutoGarcom="";
      renderProdutos();
    }
  });
}

if($("limparPesquisaGarcom")){
  $("limparPesquisaGarcom").onclick=()=>{
    pesquisaProdutoGarcom="";
    $("pesquisaProdutoGarcom").value="";
    renderProdutos();
    $("pesquisaProdutoGarcom").focus();
  };
}

$("valorEntregaGarcom").addEventListener("input",()=>{renderCarrinho();atualizarTrocoCalculadoGarcom()});
$("trocoGarcom").addEventListener("input",atualizarTrocoCalculadoGarcom);
