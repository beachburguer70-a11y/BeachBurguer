function urlBase64ToUint8Array(base64String){
  const padding="=".repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(base64);
  return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
}

async function garantirAssinaturaPush(){
  if(!("Notification" in window)||!("serviceWorker" in navigator)||!("PushManager" in window)) return null;
  if(Notification.permission!=="granted") return null;

  try{
    const keyRes=await fetch("/api/push-public-key",{cache:"no-store"});
    if(!keyRes.ok) return null;
    const data=await keyRes.json();
    if(!data.publicKey) return null;

    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(!sub){
      sub=await reg.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey:urlBase64ToUint8Array(data.publicKey)
      });
    }
    localStorage.setItem("bb_push_subscription",JSON.stringify(sub.toJSON ? sub.toJSON() : sub));
    return sub;
  }catch(e){
    console.warn("Não foi possível criar assinatura push:",e);
    return null;
  }
}

async function vincularPushAoTelefone(telefone){
  const tel=String(telefone||"").replace(/\D/g,"");
  if(tel.length!==10&&tel.length!==11) return false;
  if(Notification.permission!=="granted") return false;

  try{
    const sub=await garantirAssinaturaPush();
    if(!sub) return false;

    const res=await fetch("/api/push-subscribe",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({phone:tel,subscription:sub.toJSON ? sub.toJSON() : sub})
    });
    return res.ok;
  }catch(e){
    console.warn("Não foi possível vincular push ao telefone:",e);
    return false;
  }
}


const $=id=>document.getElementById(id);
const moeda=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let carrinho=[];
try{carrinho=JSON.parse(localStorage.getItem("bb_carrinho")||"[]")}catch{}
let tipoPedido=localStorage.getItem("bb_tipo_pedido")||"Retirada";
let pagamento="Pix";
let pedidoPremiadoElegivel=false; let pedidoPremiadoAtivo=false;
let modoRevisao="normal";
let pixPaymentId=null;
let pixPolling=null;
let enviando=false;

let estadoLojaCheckoutV16={open:true,pickup_only:false,rain_mode:false,pix_operational:true,mode:"open"};
let pixManualFallback=false;
let pixPagamentoInformado=false;
let pixFalhaTimer=null;



function passouDas22V22(){
  return new Date().getHours()>=22;
}
function bairroEntregaEncerra22V25(){
  const b=String($("bairroCheckout")?.value||"").trim().toLowerCase();
  return b.includes("chapéu") || b.includes("chapeu") || b.includes("são joão") || b.includes("sao joao");
}
function salvarBairroCheckoutV22(){
  try{localStorage.setItem("bb_bairro_checkout",$("bairroCheckout")?.value||"")}catch{}
}
async function validarHorarioChapeuV22(){
  salvarBairroCheckoutV22();
  if(tipoPedido!=="Entrega" || !bairroEntregaEncerra22V25() || !passouDas22V22())return true;

  const prosseguir=confirm(
    "Nosso horário de entregas para São João da Barra e Chapéu do Sol finalizou às 22:00.\n\nDeseja prosseguir com o pedido para RETIRADA?\n\nOK = Prosseguir\nCancelar = Cancelar pedido"
  );

  if(!prosseguir)return false;

  tipoPedido="Retirada";
  localStorage.setItem("bb_tipo_pedido","Retirada");
  atualizarTudo();
  document.querySelectorAll(".tipo-opcao-checkout-v11").forEach(b=>{
    b.classList.toggle("ativa",b.dataset.tipo==="Retirada");
  });
  return true;
}

async function validarEstadoLojaAntesDeProsseguirV20(){
  await carregarEstadoLojaCheckoutV16();

  if(estadoLojaCheckoutV16 && estadoLojaCheckoutV16.open===false){
    alert("A loja está fechada no momento. Não é possível finalizar o pedido.");
    window.location.href="/cardapio.html";
    return false;
  }

  if(!(await validarHorarioChapeuV22()))return false;

  if(estadoLojaCheckoutV16 && estadoLojaCheckoutV16.pickup_only && tipoPedido!=="Retirada"){
    const prosseguir=confirm(
      "A loja está aceitando pedidos somente para RETIRADA no local porque nosso horário de entregas finalizou às 23:00.\n\nDeseja prosseguir com o pedido para RETIRADA?\n\nOK = Prosseguir\nCancelar = Cancelar pedido"
    );

    if(!prosseguir){
      return false;
    }

    tipoPedido="Retirada";
    localStorage.setItem("bb_tipo_pedido","Retirada");
    atualizarTudo();

    document.querySelectorAll(".tipo-opcao-checkout-v11").forEach(b=>{
      b.classList.toggle("ativa",b.dataset.tipo==="Retirada");
    });

    return true;
  }

  if(estadoLojaCheckoutV16?.rain_mode===true&&tipoPedido==="Entrega"){const local=String($("bairroCheckout")?.value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();if(local!=="atafona"){alert("🌧️ Devido à chuva, estamos aceitando entrega somente para Atafona ou retirada no local.");return false;}}

  return true;
}

async function carregarEstadoLojaCheckoutV16(){
  try{
    const r=await fetch("/api/orders",{method:"GET",cache:"no-store"});
    const j=await r.json();
    if(j.store){
      estadoLojaCheckoutV16=j.store;
      localStorage.setItem("bb_store_state",JSON.stringify(j.store));
    }
  }catch{
    try{estadoLojaCheckoutV16=JSON.parse(localStorage.getItem("bb_store_state")||"{}")||estadoLojaCheckoutV16}catch{}
  }
  // V23: se o pedido já estava em Entrega/Consumo, não muda silenciosamente.
  // A confirmação para mudar para Retirada ocorre antes de prosseguir/finalizar.
  aplicarBloqueioModalidadeCheckoutV16();
  atualizarTudo();
}
function aplicarModoChuvaCheckoutV31_15(){const sel=$("bairroCheckout");if(!sel)return;const chuva=estadoLojaCheckoutV16?.rain_mode===true;[...sel.options].forEach(op=>{if(!op.value)return;const n=String(op.value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();const bloqueada=chuva&&n!=="atafona";op.disabled=bloqueada;op.hidden=bloqueada});if(chuva&&tipoPedido==="Entrega"){const atual=String(sel.value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();if(atual&&atual!=="atafona")sel.value=""}}
function aplicarBloqueioModalidadeCheckoutV16(){
  aplicarModoChuvaCheckoutV31_15();
  document.querySelectorAll(".tipo-opcao-checkout-v11").forEach(b=>{
    const bloqueada=estadoLojaCheckoutV16.pickup_only && b.dataset.tipo!=="Retirada";
    b.disabled=bloqueada;
    b.classList.toggle("bloqueada-v16",bloqueada);
    b.title=bloqueada?"No momento a loja está aceitando somente retirada.":"";
  });
}


const CATEGORIAS_PRINCIPAIS_V15=["Artesanais","Combos","Mistos Quentes","Beach Podrão"];
function temItemPrincipalV15(){
  return carrinho.some(i=>CATEGORIAS_PRINCIPAIS_V15.includes(i.categoria));
}


function itemTotal(i){
  const extras=(i.adicionais||[]).reduce((s,a)=>s+Number(a.preco||0),0);
  return (Number(i.preco||0)+extras)*Number(i.quantidade||1);
}
function subtotal(){return carrinho.reduce((s,i)=>s+itemTotal(i),0)}
function taxa(){
  if(tipoPedido!=="Entrega") return 0;

  const op=$("bairroCheckout").selectedOptions[0];
  const bairro=String($("bairroCheckout").value||"").trim();

  // Regra Beach Burguer:
  // Atafona é grátis no Pix e no Dinheiro.
  // No Cartão, Atafona cobra R$ 2,00 de entrega.
  if(bairro==="Atafona"){
    return pagamento==="Cartão" ? 2 : 0;
  }

  return Number(op?.dataset?.taxa||0);
}
function descontoPremiado(){return (pedidoPremiadoElegivel && (pagamento==="Pix"||pagamento==="Dinheiro"))?Math.round((subtotal()+taxa())*0.30*100)/100:0}
function total(){return Math.max(0,Math.round(((subtotal()+taxa())-descontoPremiado())*100)/100)}
async function verificarPedidoPremiado(){try{const r=await fetch("/api/management",{cache:"no-store"});const d=await r.json();pedidoPremiadoAtivo=d.settings?.prize_enabled===true;pedidoPremiadoElegivel=d.prize_eligible===true;return pedidoPremiadoElegivel}catch{return false}}
function telefoneFormat(v){
  const n=String(v||"").replace(/\D/g,"").slice(0,11);
  if(n.length<=2)return n;
  if(n.length<=6)return `(${n.slice(0,2)}) ${n.slice(2)}`;
  if(n.length<=10)return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
}
function telefoneValido(v){const n=String(v||"").replace(/\D/g,"");return n.length===10||n.length===11}

function normalizarTelefoneV16(v){return String(v||"").replace(/\D/g,"")}
function obterClientesSalvosV16(){
  try{return JSON.parse(localStorage.getItem("bb_clientes")||"{}")||{}}catch{return {}}
}
function salvarClienteCheckoutV16(){
  const tel=normalizarTelefoneV16($("telefoneCheckout")?.value);
  if(tel.length!==10 && tel.length!==11)return;
  const clientes=obterClientesSalvosV16();
  clientes[tel]={
    nome:$("nomeCheckout")?.value.trim()||"",
    telefone:$("telefoneCheckout")?.value.trim()||"",
    endereco:$("enderecoCheckout")?.value.trim()||"",
    numero:$("numeroCheckout")?.value.trim()||"",
    sem_numero:Boolean($("semNumeroCheckout")?.checked),
    bairro:$("bairroCheckout")?.value||"",
    referencia:$("referenciaCheckout")?.value.trim()||""
  };
  localStorage.setItem("bb_clientes",JSON.stringify(clientes));
}
let telefoneConsultadoV25="";
let enderecosClienteV30=[];

function aplicarEnderecoV30(a){
  $("enderecoCheckout").value=a?.endereco||"";
  $("numeroCheckout").value=a?.numero||"";
  $("semNumeroCheckout").checked=Boolean(a?.sem_numero);
  $("numeroCheckout").disabled=Boolean(a?.sem_numero);
  $("bairroCheckout").value=a?.bairro||"";
  $("referenciaCheckout").value=a?.referencia||"";
  atualizarTudo();
}

function novoEnderecoV30(){
  $("enderecoCheckout").value="";
  $("numeroCheckout").value="";
  $("semNumeroCheckout").checked=false;
  $("numeroCheckout").disabled=false;
  $("bairroCheckout").value="";
  $("referenciaCheckout").value="";
  $("modalEnderecosV30")?.classList.remove("ativo");
  $("enderecoCheckout")?.focus();
  atualizarTudo();
}

function mostrarEnderecosV30(c,addresses){
  const lista=(addresses||[]).filter(a=>a&&a.endereco&&a.bairro);
  enderecosClienteV30=lista;
  if(!lista.length)return;

  if($("saudacaoEnderecosV30"))$("saudacaoEnderecosV30").textContent=
    `Olá${c?.nome?", "+c.nome:""}! Selecione um endereço salvo ou use um novo.`;

  $("listaEnderecosV30").innerHTML=lista.map((a,i)=>{
    const numero=a.sem_numero?"s/n":(a.numero?`nº ${a.numero}`:"número pendente");
    const ref=a.referencia?`<small style="display:block;opacity:.72;margin-top:3px">Ref.: ${String(a.referencia).replace(/[<>&"]/g,"")}</small>`:"";
    return `<button type="button" class="btn btn-escuro endereco-salvo-v30" data-i="${i}" style="text-align:left;padding:14px">
      <strong>${String(a.endereco).replace(/[<>&"]/g,"")} — ${numero}</strong>
      <span style="display:block;margin-top:3px">${String(a.bairro).replace(/[<>&"]/g,"")}</span>${ref}
    </button>`;
  }).join("");

  document.querySelectorAll(".endereco-salvo-v30").forEach(b=>b.onclick=()=>{
    aplicarEnderecoV30(enderecosClienteV30[Number(b.dataset.i)]);
    $("modalEnderecosV30")?.classList.remove("ativo");
    // Endereço legado sem número: mantém o mesmo endereço e exige completar o número na finalização.
    if(!$("semNumeroCheckout").checked && !$("numeroCheckout").value.trim())$("numeroCheckout")?.focus();
  });
  $("modalEnderecosV30")?.classList.add("ativo");
}

async function preencherClienteCheckoutV16(){
  const tel=normalizarTelefoneV16($("telefoneCheckout")?.value);
  if(tel.length!==10 && tel.length!==11)return;
  if(telefoneConsultadoV25===tel)return;
  telefoneConsultadoV25=tel;
  try{
    const r=await fetch(`/api/orders?customer_phone=${encodeURIComponent(tel)}`,{cache:"no-store"});
    const data=await r.json();
    const c=data?.customer;
    const addresses=Array.isArray(data?.addresses)?data.addresses:[];
    if(!r.ok||!data?.ok||(!c&&!addresses.length))return;

    if($("nomeCheckout") && c?.nome) $("nomeCheckout").value=c.nome;
    if(tipoPedido!=="Entrega")return;

    if(addresses.length){
      mostrarEnderecosV30(c,addresses);
    }else if(c?.endereco){
      mostrarEnderecosV30(c,[c]);
    }
  }catch(e){console.warn("Cliente por telefone:",e);}
}

function parseDinheiroV10(v){
  let s=String(v||"").trim().replace(/\s/g,"").replace("R$","");
  if(!s)return 0;
  if(s.includes(",") && s.includes(".")){
    s=s.replace(/\./g,"").replace(",",".");
  }else{
    s=s.replace(",",".");
  }
  const n=Number(s);
  return Number.isFinite(n)?n:0;
}

function atualizarCalculoTrocoV10(){
  const box=$("calculoTrocoV10");
  if(!box)return;

  if(pagamento!=="Dinheiro"){
    box.className="calculo-troco-v10";
    box.textContent="Digite o valor que será entregue em dinheiro.";
    return;
  }

  const pago=parseDinheiroV10($("trocoCheckout").value);
  const valorTotal=Number(total().toFixed(2));

  if(!pago){
    box.className="calculo-troco-v10";
    box.textContent=`Total do pedido: ${moeda(valorTotal)}. Digite com quanto vai pagar.`;
    return;
  }

  const troco=Number((pago-valorTotal).toFixed(2));

  if(troco<0){
    box.className="calculo-troco-v10 aviso";
    box.textContent=`Valor insuficiente. Faltam ${moeda(Math.abs(troco))}.`;
  }else if(troco===0){
    box.className="calculo-troco-v10 sem-troco";
    box.textContent=`Pagamento exato: ${moeda(pago)}. Sem troco.`;
  }else{
    box.className="calculo-troco-v10 ok";
    box.textContent=`Total ${moeda(valorTotal)} • Pagamento ${moeda(pago)} • Troco ${moeda(troco)}`;
  }
}


function atualizarModalidadeCheckoutV11(tipo){
  if(estadoLojaCheckoutV16.rain_mode===true&&tipo==="Entrega")alert("🌧️ Devido à chuva, estamos aceitando ENTREGA somente para Atafona. Para São João da Barra e Chapéu do Sol, escolha RETIRADA no local.");
  if(estadoLojaCheckoutV16.pickup_only && tipo!=="Retirada"){
    alert("No momento a loja está aceitando somente retirada no local.");
    return;
  }
  tipoPedido=tipo;
  localStorage.setItem("bb_tipo_pedido",tipoPedido);
  document.querySelectorAll(".tipo-opcao-checkout-v11").forEach(b=>{
    b.classList.toggle("ativa",b.dataset.tipo===tipoPedido);
  });
  atualizarTudo();

  // Se a pessoa já está no pagamento e muda para Entrega,
  // volta automaticamente para os dados para preencher endereço/localidade.
  if(tipoPedido==="Entrega" && !$("etapaPagamento").classList.contains("hidden")){
    $("modalTipoCheckoutV11")?.classList.remove("ativo");
    mostrarEtapa("etapaDados");
    setTimeout(()=>$("enderecoCheckout")?.focus(),120);
  }
}

function atualizarResumoDinheiroV11(){
  renderResumo($("resumoCarrinhoDados"));
  renderResumo($("resumoPagamento"));
}

function deveAvisarTaxaCartaoAtafona(){
  return tipoPedido==="Entrega"
    && $("bairroCheckout").value==="Atafona"
    && pagamento==="Cartão";
}

function abrirAvisoTaxaCartaoAtafona(){
  $("modalTaxaCartaoAtafona").classList.add("ativo");
}

function fecharAvisoTaxaCartaoAtafona(){
  $("modalTaxaCartaoAtafona").classList.remove("ativo");
}

function renderResumo(container){
  if(!container)return;

  const itensHtml=carrinho.map(i=>`
    <div class="order-item">
      <div>
        <strong>${i.quantidade||1}x ${i.nome}</strong>
        ${(i.adicionais||[]).length?`<small>+ ${(i.adicionais||[]).map(a=>a.nome).join(", ")}</small>`:""}
        ${i.observacao?`<small>Obs.: ${i.observacao}</small>`:""}
      </div>
      <strong>${moeda(itemTotal(i))}</strong>
    </div>`).join("");

  const pago=pagamento==="Dinheiro" ? parseDinheiroV10($("trocoCheckout")?.value||"") : 0;
  const troco=pago>0 ? Math.max(0,Number((pago-total()).toFixed(2))) : 0;

  container.innerHTML=
    itensHtml+
    `<div class="order-item"><span>Subtotal</span><strong>${moeda(subtotal())}</strong></div>`+
    (pagamento==="Dinheiro"
      ? `<div class="order-item resumo-dinheiro-v13"><span>Valor que vai pagar em dinheiro</span><strong>${pago>0?moeda(pago):"—"}</strong></div>`
      : "")+
    (tipoPedido==="Entrega"
      ? `<div class="order-item"><span>Entrega</span><strong>${moeda(taxa())}</strong></div>`
      : "")+
    `<div class="total-line"><span>Total</span><span>${moeda(total())}</span></div>`+
    (pagamento==="Dinheiro"
      ? `<div class="order-item resumo-troco-v13"><span>Troco</span><strong>${pago>0?moeda(troco):"—"}</strong></div>`
      : "");
}
function atualizarTudo(){
  tipoPedido=localStorage.getItem("bb_tipo_pedido")||tipoPedido||"Retirada";

  if($("tipoResumo")) $("tipoResumo").textContent=`📍 ${tipoPedido}`;
  if($("tipoResumo2")) $("tipoResumo2").textContent=`📍 ${tipoPedido}`;

  const entrega=tipoPedido==="Entrega";
  if($("camposEntregaCheckout")){
    $("camposEntregaCheckout").classList.toggle("hidden",!entrega);
    $("camposEntregaCheckout").style.display=entrega?"block":"none";
  }

  if($("resumoCarrinhoDados")) renderResumo($("resumoCarrinhoDados"));
  if($("resumoPagamento")) renderResumo($("resumoPagamento"));

  if($("trocoWrap")) $("trocoWrap").classList.toggle("hidden",pagamento!=="Dinheiro");
  if($("acaoPagamento")) $("acaoPagamento").textContent=pagamento==="Pix"?"Gerar QR Code":"Fazer pedido";

  atualizarCalculoTrocoV10();
  atualizarResumoDinheiroV11();
}
function mostrarEtapa(nome){
  ["etapaDados","etapaPagamento","etapaPix","etapaSucesso"].forEach(id=>$(id).classList.add("hidden"));
  $(nome).classList.remove("hidden");
  $("progDados").classList.toggle("ativo",nome==="etapaDados");
  $("progPagamento").classList.toggle("ativo",nome==="etapaPagamento"||nome==="etapaPix");
  $("progRevisao").classList.toggle("ativo",false);
  window.scrollTo({top:0,behavior:"smooth"});
}
function validarDados(){
  if(!carrinho.length){alert("Seu carrinho está vazio.");location.href="/cardapio.html";return false}
  if(!temItemPrincipalV15()){
    alert("Para fazer o pedido é obrigatório incluir pelo menos 1 item de Artesanais, Combos, Misto Quente ou Beach Podrão. Bebidas e doces não podem ser pedidos sozinhos.");
    location.href="/cardapio.html";
    return false;
  }
  if(!$("nomeCheckout").value.trim()){alert("Preencha seu nome.");$("nomeCheckout").focus();return false}
  if(!telefoneValido($("telefoneCheckout").value)){alert("Informe um telefone com DDD.");$("telefoneCheckout").focus();return false}
  if(tipoPedido==="Entrega"){
    if(!$("enderecoCheckout").value.trim()){alert("Preencha o endereço.");$("enderecoCheckout").focus();return false}
    if(!$("semNumeroCheckout").checked && !$("numeroCheckout").value.trim()){alert("Preencha o número do endereço ou marque Sem número.");$("numeroCheckout").focus();return false}
    if(!$("bairroCheckout").value){alert("Selecione a localidade.");$("bairroCheckout").focus();return false}
  }
  if(pagamento==="Dinheiro"){
    const pago=parseDinheiroV10($("trocoCheckout").value);
    if(pago>0 && pago<total()){
      alert("O valor informado em dinheiro é menor que o total do pedido.");
      $("trocoCheckout").focus();
      return false;
    }
  }
  return true;
}
function dadosPedido(){
  return {
    cliente:$("nomeCheckout").value.trim(),
    telefone:$("telefoneCheckout").value.trim(),
    endereco:tipoPedido==="Entrega"?`${$("enderecoCheckout").value.trim()}${$("semNumeroCheckout").checked?", s/n":", nº "+$("numeroCheckout").value.trim()}`:"",
    endereco_base:tipoPedido==="Entrega"?$("enderecoCheckout").value.trim():"",
    numero:tipoPedido==="Entrega"?$("numeroCheckout").value.trim():"",
    sem_numero:tipoPedido==="Entrega"?Boolean($("semNumeroCheckout").checked):false,
    bairro:tipoPedido==="Entrega"?$("bairroCheckout").value:"",
    referencia:tipoPedido==="Entrega"?$("referenciaCheckout").value.trim():"",
    localidade:tipoPedido==="Entrega"?$("bairroCheckout").value:tipoPedido,
    tipo:tipoPedido,
    pagamento:pixManualFallback?"Pix Manual":pagamento,
    pix_manual:pixManualFallback,
    troco:(pagamento==="Dinheiro"&&!pixManualFallback) ? (()=> {
      const pago=parseDinheiroV10($("trocoCheckout").value);
      const t=Math.max(0,pago-total());
      return pago ? `Paga com ${moeda(pago)} | Troco ${moeda(t)}` : "";
    })() : "",
    observacoes:$("observacoesCheckout").value.trim(),
    itens:carrinho.map(i=>({
      id:i.id,nome:i.nome,categoria:i.categoria||"",quantidade:i.quantidade||1,
      preco:Number(i.preco||0),adicionais:i.adicionais||[],observacao:i.observacao||"",
      total:itemTotal(i)
    })),
    subtotal:subtotal(),
    entrega:taxa(),
    total:total(),
    discount_amount:descontoPremiado(),
    prize_awarded:pedidoPremiadoElegivel && (pagamento==="Pix"||pagamento==="Dinheiro"),
    pix_payment_id:pixPaymentId
  };
}
function abrirRevisao(modo){
  if(!validarDados())return;
  modoRevisao=modo;
  const d=dadosPedido();
  $("conteudoRevisaoCheckout").innerHTML=`
    <div class="review-box"><strong>Tipo do pedido</strong>${d.tipo}</div>
    <div class="review-box"><strong>Cliente</strong>${d.cliente}<br>${d.telefone}</div>
    ${d.tipo==="Entrega"?`<div class="review-box"><strong>Entrega</strong>${d.endereco}<br>${d.bairro}${d.referencia?`<br>Ref.: ${d.referencia}`:""}</div>`:""}
    <div class="review-box"><strong>Itens</strong>${d.itens.map(i=>`${i.quantidade}x ${i.nome}${i.observacao?` — ${i.observacao}`:""}`).join("<br>")}</div>
    <div class="review-box"><strong>Pagamento</strong>${d.pix_manual?"Pix manual — aguardando comprovante":d.pagamento}${d.troco?`<br>Troco para: ${d.troco}`:""}</div>
    ${d.observacoes?`<div class="review-box"><strong>Observações</strong>${d.observacoes}</div>`:""}
    <div class="review-box"><strong>Total</strong>${d.discount_amount>0?`<span style="color:#2ecc71;font-weight:900">🎁 PEDIDO PREMIADO — 30% OFF (${moeda(d.discount_amount)})</span>`:""}<span style="font-size:22px">${moeda(d.total)}</span></div>`;
  $("confirmarRevisaoCheckout").textContent=modo==="pix"?"Confirmar e gerar Pix":"Finalizar pedido";
  $("modalRevisaoCheckout").classList.add("ativo");
  $("progRevisao").classList.add("ativo");
}
async function enviarPedido(){
  if(enviando)return;
  enviando=true;
  try{
    const d=dadosPedido();
    const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"create",...d})});
    const data=await r.json();
    if(!r.ok||!data.ok)throw new Error(data.error||"Não foi possível enviar o pedido.");
    salvarClienteCheckoutV16();
    try{ await vincularPushAoTelefone(d.telefone); }catch(e){ console.warn("Push não vinculado:",e); }
    localStorage.removeItem("bb_carrinho");
    carrinho=[];
    $("textoSucesso").textContent=`Pedido #${data.order.id} enviado com sucesso.`;
    mostrarEtapa("etapaSucesso");
  }catch(e){alert(e.message)}
  finally{enviando=false}
}
async function gerarPix(){
  if(!(await validarHorarioChapeuV22()))return;
  await carregarEstadoLojaCheckoutV16();
  if(estadoLojaCheckoutV16 && estadoLojaCheckoutV16.open===false){
    alert("A loja está fechada. O Pix não pode ser gerado.");
    location.href="/cardapio.html";
    return;
  }
  $("modalRevisaoCheckout").classList.remove("ativo");
  const d=dadosPedido();
  mostrarEtapa("etapaPix");
  $("pixStatusCheckout").textContent="Gerando Pix...";
  const r=await fetch("/api/pix-create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:d.total,name:d.cliente,phone:d.telefone,order:d})});
  const data=await r.json();
  if(!r.ok||!data.ok){alert(data.error||"Erro ao gerar Pix.");mostrarEtapa("etapaPagamento");return}
  pixPaymentId=String(data.payment_id||data.id);
  pixPagamentoInformado=false;
  if(pixFalhaTimer){clearTimeout(pixFalhaTimer);pixFalhaTimer=null;}
  const btnJaPaguei=$("pixJaPagueiCheckout");if(btnJaPaguei){btnJaPaguei.disabled=false;btnJaPaguei.textContent="Já paguei o Pix";}
  $("pixCopiaCheckout").textContent=data.qr_code||"";
  const qrImg=$("pixQrImagem");
  if(qrImg){
    if(data.qr_code_base64){
      qrImg.src=`data:image/png;base64,${data.qr_code_base64}`;
      qrImg.style.display="block";
    }else{
      qrImg.removeAttribute("src");
      qrImg.style.display="none";
    }
  }
  $("pixStatusCheckout").textContent=data.qr_code_base64
    ? "Pix gerado. Aguardando confirmação do pagamento..."
    : "Pix gerado. Use o código Copia e Cola abaixo. Aguardando confirmação...";
  clearInterval(pixPolling);
  // Consulta o Mercado Pago até o pagamento ser aprovado.
  pixPolling=setInterval(verificarPix,1500);
  setTimeout(verificarPix,400);
}
async function verificarPix(){
  if(!pixPaymentId)return;
  try{
    const r=await fetch(`/api/pix-status?payment_id=${encodeURIComponent(pixPaymentId)}`,{cache:"no-store"});
    const data=await r.json();
    if(data.ok && (data.approved===true||data.status==="approved")){
      // O próprio /api/pix-status cria/reconcilia o pedido pago no servidor.
      // Só sai do QR Code quando o servidor devolver o número do pedido.
      // Isso evita criar um segundo pedido pelo POST /api/orders.
      $("pixStatusCheckout").classList.add("ok");
      if(data.order_id){
        clearInterval(pixPolling);
        pixPolling=null;
        if(pixFalhaTimer){clearTimeout(pixFalhaTimer);pixFalhaTimer=null;}
        const d=dadosPedido();
        pagamento="Pix";
        salvarClienteCheckoutV16();
        try{ await vincularPushAoTelefone(d.telefone); }catch(e){ console.warn("Push não vinculado:",e); }
        localStorage.removeItem("bb_carrinho");
        carrinho=[];
        $("pixStatusCheckout").textContent="✅ Pagamento confirmado! Pedido realizado.";
        $("textoSucesso").textContent=`Pedido #${data.order_id} realizado com sucesso.`;
        pixPaymentId="";
        mostrarEtapa("etapaSucesso");
      }else{
        $("pixStatusCheckout").textContent="✅ Pagamento confirmado! Finalizando seu pedido...";
        // Mantém o polling: na próxima consulta o servidor devolve o pedido
        // criado pelo webhook/reconciliação, com o respectivo número.
      }
    }
  }catch{}
}


async function confirmarTentativaPixV31_23(){
  if(!pixPaymentId||pixPagamentoInformado)return;
  pixPagamentoInformado=true;
  $("pixStatusCheckout").textContent="Pagamento informado. Aguardando confirmação do Mercado Pago...";
  const btn=$("pixJaPagueiCheckout"); if(btn){btn.disabled=true;btn.textContent="Pagamento informado ✓";}
  pixFalhaTimer=setTimeout(async()=>{
    if(!pixPaymentId)return;
    try{
      const r=await fetch(`/api/pix-status?payment_id=${encodeURIComponent(pixPaymentId)}&confirm_attempt=1`,{cache:"no-store"});
      const data=await r.json();
      if(data.ok&&(data.approved===true||data.status==="approved"))return;
      if(data.ok&&data.pix_auto_disabled===true){
        clearInterval(pixPolling);
        $("pixStatusCheckout").textContent="⚠️ Pix não confirmado. O Pix automático foi temporariamente desativado.";
        alert("⚠️ O Mercado Pago não confirmou este Pix. O Pix automático foi desativado para os próximos pedidos. Se o valor for estornado, use a chave Pix manual enviada pelo WhatsApp.");
      }
    }catch{}
  },60000);
}
const pixJaPagueiCheckout=$("pixJaPagueiCheckout");
if(pixJaPagueiCheckout)pixJaPagueiCheckout.onclick=confirmarTentativaPixV31_23;

// restore customer data from local cache if present
try{
  const clientes=JSON.parse(localStorage.getItem("bb_clientes")||"{}");
  const ultimo=Object.values(clientes).slice(-1)[0];
  if(ultimo){
    $("nomeCheckout").value=ultimo.nome||"";
    $("telefoneCheckout").value=ultimo.telefone||"";
  }
}catch{}

$("telefoneCheckout").addEventListener("input",e=>{
  e.target.value=telefoneFormat(e.target.value);
  const tel=normalizarTelefoneV16(e.target.value);
  if(tel.length<10)telefoneConsultadoV25="";
  preencherClienteCheckoutV16();
});
$("novoEnderecoV30")?.addEventListener("click",novoEnderecoV30);
$("modalEnderecosV30")?.addEventListener("click",e=>{
  if(e.target.id==="modalEnderecosV30")e.currentTarget.classList.remove("ativo");
});
$("semNumeroCheckout")?.addEventListener("change",e=>{
  $("numeroCheckout").disabled=e.target.checked;
  if(e.target.checked)$("numeroCheckout").value="";
});
$("trocoCheckout").addEventListener("input",()=>{
  atualizarCalculoTrocoV10();
  renderResumo($("resumoCarrinhoDados"));
  renderResumo($("resumoPagamento"));
});
$("bairroCheckout").addEventListener("change",()=>{
  atualizarTudo();
  if(deveAvisarTaxaCartaoAtafona()){
    abrirAvisoTaxaCartaoAtafona();
  }
});
$("avancarPagamento").onclick=async()=>{
  if(!(await validarEstadoLojaAntesDeProsseguirV20()))return;
  if(validarDados())mostrarEtapa("etapaPagamento");
  atualizarTudo();
};
$("voltarDados").onclick=()=>mostrarEtapa("etapaDados");
async function selecionarPagamentoCheckoutV31_19(b){
  if(b.dataset.pagamento==="Pix"){
    await carregarEstadoLojaCheckoutV16();
    if(estadoLojaCheckoutV16?.pix_operational===false){
      const ok=confirm("PIX AUTOMÁTICO TEMPORARIAMENTE INDISPONÍVEL.\n\nSeu pedido será finalizado como PIX MANUAL e a chave Pix será enviada no WhatsApp para pagamento manual.\n\nApós pagar, envie o comprovante pelo WhatsApp.\n\nToque em OK para continuar.");
      if(!ok)return;
      pixManualFallback=true;
      pagamento="Pix Manual";
      document.querySelectorAll(".payment-option").forEach(x=>x.classList.remove("ativo"));
      b.classList.add("ativo");
      if($("trocoWrap"))$("trocoWrap").classList.add("hidden");
      if($("acaoPagamento"))$("acaoPagamento").textContent="Fazer pedido";
      atualizarTudo();
      return;
    }
  }
  pixManualFallback=false;
  document.querySelectorAll(".payment-option").forEach(x=>x.classList.remove("ativo"));
  b.classList.add("ativo");
  pagamento=b.dataset.pagamento;
  atualizarTudo();
  if(deveAvisarTaxaCartaoAtafona())abrirAvisoTaxaCartaoAtafona();
}

document.querySelectorAll(".payment-option").forEach(b=>b.onclick=async()=>{
  await selecionarPagamentoCheckoutV31_19(b);
});
$("acaoPagamento").onclick=async()=>{
  if(!(await validarEstadoLojaAntesDeProsseguirV20()))return;
  if(pagamento==="Pix"&&!pixManualFallback){
    await carregarEstadoLojaCheckoutV16();
    if(estadoLojaCheckoutV16?.pix_operational===false){
      const pixBtn=document.querySelector('.payment-option[data-pagamento="Pix"]');
      if(pixBtn)await selecionarPagamentoCheckoutV31_19(pixBtn);
      if(!pixManualFallback)return;
    }
  }
  abrirRevisao((pagamento==="Pix"&&!pixManualFallback)?"pix":"normal");
};
$("fecharRevisaoCheckout").onclick=$("voltarRevisaoCheckout").onclick=()=>{
  $("modalRevisaoCheckout").classList.remove("ativo");$("progRevisao").classList.remove("ativo");
};
$("confirmarRevisaoCheckout").onclick=async()=>{
  if(!(await validarEstadoLojaAntesDeProsseguirV20()))return;
  if(modoRevisao==="pix") await gerarPix();
  else { $("modalRevisaoCheckout").classList.remove("ativo"); await enviarPedido(); }
};
$("copiarPixCheckout").onclick=async()=>{
  const t=$("pixCopiaCheckout").textContent;
  try{await navigator.clipboard.writeText(t);alert("Código Pix copiado.")}catch{prompt("Copie o código Pix:",t)}
};


$("voltarCardapioDados").onclick=()=>{
  localStorage.setItem("bb_tipo_pedido",tipoPedido);
  window.location.href="/cardapio.html";
};




function abrirModalTipoCheckoutV13(){
  document.querySelectorAll(".tipo-opcao-checkout-v11").forEach(b=>{
    b.classList.toggle("ativa",b.dataset.tipo===tipoPedido);
  });
  $("modalTipoCheckoutV11")?.classList.add("ativo");
}


$("alterarTipoCheckoutV14")?.addEventListener("click",()=>{
  aplicarBloqueioModalidadeCheckoutV16();
  document.querySelectorAll(".tipo-opcao-checkout-v11").forEach(b=>{
    b.classList.toggle("ativa",b.dataset.tipo===tipoPedido);
  });
  $("modalTipoCheckoutV11")?.classList.add("ativo");
});

$("alterarTipoPagamentoV12")?.addEventListener("click",abrirModalTipoCheckoutV13);

$("fecharTipoCheckoutV11")?.addEventListener("click",()=>$("modalTipoCheckoutV11")?.classList.remove("ativo"));

document.querySelectorAll(".tipo-opcao-checkout-v11").forEach(b=>{
  b.addEventListener("click",()=>{
    atualizarModalidadeCheckoutV11(b.dataset.tipo);
    $("modalTipoCheckoutV11")?.classList.remove("ativo");
  });
});

$("modalTipoCheckoutV11")?.addEventListener("click",e=>{
  if(e.target===$("modalTipoCheckoutV11")) $("modalTipoCheckoutV11").classList.remove("ativo");
});

$("fecharTaxaCartaoAtafona").onclick=fecharAvisoTaxaCartaoAtafona;
$("entendiTaxaCartaoAtafona").onclick=fecharAvisoTaxaCartaoAtafona;
$("modalTaxaCartaoAtafona").onclick=e=>{
  if(e.target===$("modalTaxaCartaoAtafona")) fecharAvisoTaxaCartaoAtafona();
};

atualizarTudo();
if(!carrinho.length){
  $("resumoCarrinhoDados").innerHTML='<p style="color:#aaa">Seu carrinho está vazio. Volte ao cardápio para adicionar produtos.</p>';
}

window.addEventListener("pageshow",()=>{
  tipoPedido=localStorage.getItem("bb_tipo_pedido")||"Retirada";
  atualizarTudo();
});

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js?v=842",{updateViaCache:"none"}).catch(()=>{});
}

carregarEstadoLojaCheckoutV16();

$("bairroCheckout")?.addEventListener("change",salvarBairroCheckoutV22);


let monitorStatusCheckoutV23=null;
async function atualizarStatusCheckoutV23(){
  try{
    await carregarEstadoLojaCheckoutV16();
  }catch(e){}
}
function iniciarMonitorStatusCheckoutV23(){
  atualizarStatusCheckoutV23();
  if(monitorStatusCheckoutV23)clearInterval(monitorStatusCheckoutV23);
  monitorStatusCheckoutV23=setInterval(atualizarStatusCheckoutV23,3000);
}
window.addEventListener("focus",atualizarStatusCheckoutV23);
document.addEventListener("visibilitychange",()=>{
  if(!document.hidden) atualizarStatusCheckoutV23();
});

iniciarMonitorStatusCheckoutV23();
