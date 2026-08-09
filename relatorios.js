const HISTORICO_LEGADO_ATE=new Date("2026-08-09T00:00:00-03:00");
const TOKEN_KEY="bb_store_token";
let token=localStorage.getItem(TOKEN_KEY)||"";
let periodoAtual="dia";

const $=id=>document.getElementById(id);
const moeda=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const numero=v=>Number(v||0).toLocaleString("pt-BR");
const pad=n=>String(n).padStart(2,"0");
const dataInput=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

$("senha").value=token;
$("entrar").onclick=entrar;
$("senha").onkeydown=e=>{if(e.key==="Enter")entrar()};
$("sair").onclick=()=>{localStorage.removeItem(TOKEN_KEY);location.reload()};
$("atualizar").onclick=carregar;
$("aplicarPeriodo").onclick=()=>{periodoAtual="custom";document.querySelectorAll(".periodo").forEach(b=>b.classList.remove("ativo"));carregar()};

document.querySelectorAll(".periodo").forEach(btn=>btn.onclick=()=>{
  periodoAtual=btn.dataset.periodo;
  document.querySelectorAll(".periodo").forEach(b=>b.classList.toggle("ativo",b===btn));
  definirDatasPeriodo(periodoAtual);
  carregar();
});

async function api(body){
  const r=await fetch("/api/orders",{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Store-Token":token},
    body:JSON.stringify(body)
  });
  const d=await r.json();
  if(!r.ok||!d.ok)throw new Error(d.error||"Erro na API");
  return d;
}

async function entrar(){
  token=$("senha").value.trim();
  if(!token)return;
  try{
    await api({action:"list_orders",limit:1});
    localStorage.setItem(TOKEN_KEY,token);
    $("login").classList.add("hidden");
    $("app").classList.remove("hidden");
    definirDatasPeriodo("dia");
    carregar();
  }catch(e){alert("Senha inválida.");}
}

function definirDatasPeriodo(p){
  const agora=new Date();
  let inicio=new Date(agora.getFullYear(),agora.getMonth(),agora.getDate());
  let fim=new Date(inicio); fim.setDate(fim.getDate()+1);

  if(p==="semana"){
    const dia=(agora.getDay()+6)%7;
    inicio.setDate(inicio.getDate()-dia);
    fim=new Date(inicio); fim.setDate(fim.getDate()+7);
  }else if(p==="mes"){
    inicio=new Date(agora.getFullYear(),agora.getMonth(),1);
    fim=new Date(agora.getFullYear(),agora.getMonth()+1,1);
  }else if(p==="ano"){
    inicio=new Date(agora.getFullYear(),0,1);
    fim=new Date(agora.getFullYear()+1,0,1);
  }

  $("dataInicio").value=dataInput(inicio);
  const fimVisual=new Date(fim); fimVisual.setDate(fimVisual.getDate()-1);
  $("dataFim").value=dataInput(fimVisual);
}

function datasSelecionadas(){
  const a=$("dataInicio").value,b=$("dataFim").value;
  if(!a||!b)throw new Error("Escolha as datas.");
  const inicio=new Date(a+"T00:00:00");
  const fim=new Date(b+"T00:00:00"); fim.setDate(fim.getDate()+1);
  return {inicio,fim};
}

function periodoAnterior(inicio,fim){
  const dur=fim-inicio;
  return {inicio:new Date(inicio-dur),fim:new Date(inicio)};
}

function normCat(c){return c||"Sem categoria"}
function normTipo(t){return t||"Não informado"}
function normPag(p){return p||"Não informado"}

function agregar(lista,catalogo=[]){
  const concluidos=[];
  const cancelados=[];
  const abertos=[];

  for(const p of lista){
    const status=String(p.status||"").toLowerCase();
    const criado=new Date(p.created_at);

    if(status==="cancelado"){
      cancelados.push(p);
      continue;
    }

    // Compatibilidade histórica:
    // pedidos criados até 08/08/2026 faziam parte do relatório mesmo quando
    // o status final não havia sido atualizado. Mantemos isso somente para
    // o histórico antigo, sem reintroduzir o erro nos novos expedientes.
    const legado=criado < HISTORICO_LEGADO_ATE;

    if(legado || status==="entregue" || status==="concluido"){
      concluidos.push(p);
    }else{
      abertos.push(p);
    }
  }

  const faturamento=concluidos.reduce((s,p)=>s+Number(p.total||0),0);
  const taxas=concluidos.reduce((s,p)=>s+Number(p.entrega||0),0);
  const produtos=new Map(),cats=new Map(),pag=new Map(),tipos=new Map(),origens=new Map(),horas=new Map(),dias=new Map();
  let itens=0;

  for(const p of (catalogo||[])){
    const key=`id:${p.id}`;
    produtos.set(key,{
      id:Number(p.id),
      nome:p.name||"Produto",
      categoria:normCat(p.category),
      qtd:0,
      receita:0
    });
  }

  for(const p of concluidos){
    inc(pag,normPag(p.pagamento),1);
    inc(tipos,normTipo(p.tipo),1);
    inc(origens,String(p.origem||"cliente")==="garcom"?"Garçom":"Cliente/Delivery",1);

    const d=new Date(p.created_at);
    inc(horas,`${pad(d.getHours())}:00`,1);
    inc(dias,dataInput(d),Number(p.total||0));

    for(const item of (p.itens||[])){
      const qtd=Math.max(0,Number(item.quantidade||1));
      itens+=qtd;

      const id=Number(item.id||0);
      const nome=item.nome||"Produto";
      const cat=normCat(item.categoria);
      const key=id?`id:${id}`:`nome:${String(nome).trim().toLowerCase()}`;

      const totalSalvo=Number(item.total);
      const extras=(item.adicionais||[]).reduce((s,a)=>s+Number(a.preco||0),0);
      const calculado=(Number(item.preco||0)+extras)*qtd;
      const receita=Number.isFinite(totalSalvo)&&totalSalvo>=0 ? totalSalvo : calculado;

      const atual=produtos.get(key)||{id:id||null,nome,categoria:cat,qtd:0,receita:0};
      atual.nome=nome;
      atual.categoria=cat;
      atual.qtd+=qtd;
      atual.receita+=receita;
      produtos.set(key,atual);

      inc(cats,cat,qtd);
    }
  }

  return {validos:concluidos,concluidos,cancelados,abertos,faturamento,taxas,itens,produtos,cats,pag,tipos,origens,horas,dias};
}
function inc(map,k,v){map.set(k,(map.get(k)||0)+v)}

function deltaHtml(atual,anterior){
  if(!anterior&&atual)return `<span class="up">↑ novo</span>`;
  if(!anterior)return "";
  const pct=((atual-anterior)/anterior)*100;
  const cls=pct>=0?"up":"down";
  return `<span class="${cls}">${pct>=0?"↑":"↓"} ${Math.abs(pct).toFixed(1)}% vs período anterior</span>`;
}

function renderBars(id,map,limit=8){
  const box=$(id);
  const arr=[...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit);
  if(!arr.length){box.innerHTML='<div class="empty">Sem dados</div>';return}
  const max=arr[0][1]||1;
  box.innerHTML=arr.map(([nome,v])=>`
    <div class="bar-row">
      <span>${escapeHtml(nome)}</span>
      <div class="bar-bg"><div class="bar-fill" style="width:${Math.max(3,(v/max)*100)}%"></div></div>
      <strong>${numero(v)}</strong>
    </div>`).join("");
}

function renderProdutos(a){
  const arr=[...a.produtos.values()].sort((x,y)=>y.qtd-x.qtd);
  const top=arr.slice(0,5),menos=[...arr].sort((x,y)=>x.qtd-y.qtd||x.receita-y.receita).slice(0,5);

  $("maisVendidos").innerHTML=top.length?top.map((p,i)=>`<tr><td class="rank">${i+1}</td><td>${escapeHtml(p.nome)}</td><td>${numero(p.qtd)}</td><td>${moeda(p.receita)}</td></tr>`).join(""):'<tr><td colspan="4">Sem dados</td></tr>';
  $("menosVendidos").innerHTML=menos.length?menos.map((p,i)=>`<tr><td class="rank">${i+1}</td><td>${escapeHtml(p.nome)}</td><td>${numero(p.qtd)}</td><td>${moeda(p.receita)}</td></tr>`).join(""):'<tr><td colspan="4">Sem dados</td></tr>';

  const max=top[0]?.qtd||1;
  $("topProdutos").innerHTML=top.length?top.map(p=>`<div class="bar-row"><span>${escapeHtml(p.nome)}</span><div class="bar-bg"><div class="bar-fill" style="width:${(p.qtd/max)*100}%"></div></div><strong>${numero(p.qtd)}</strong></div>`).join(""):'<div class="empty">Sem vendas</div>';

  $("tabelaProdutos").innerHTML=arr.length?arr.map(p=>`<tr><td>${escapeHtml(p.nome)}</td><td>${escapeHtml(p.categoria)}</td><td>${numero(p.qtd)}</td><td>${a.itens?((p.qtd/a.itens)*100).toFixed(1):0}%</td><td>${moeda(p.receita)}</td></tr>`).join(""):'<tr><td colspan="5">Sem dados</td></tr>';
}

function renderGraficoDias(map,inicio,fim){
  const box=$("graficoFaturamento"),leg=$("graficoLegenda");
  const pontos=[];
  const d=new Date(inicio);
  while(d<fim){
    const key=dataInput(d);
    pontos.push({key,label:`${pad(d.getDate())}/${pad(d.getMonth()+1)}`,v:map.get(key)||0});
    d.setDate(d.getDate()+1);
  }
  const max=Math.max(...pontos.map(x=>x.v),1);
  box.innerHTML=pontos.map(p=>`<div class="col" data-tip="${p.label}: ${moeda(p.v)}" style="height:${p.v?Math.max(5,(p.v/max)*100):2}%"></div>`).join("");
  leg.innerHTML=pontos.length?`<span>${pontos[0].label}</span><span>${pontos[Math.floor((pontos.length-1)/2)].label}</span><span>${pontos[pontos.length-1].label}</span>`:"";
}

function renderResumo(a){
  const maiorHora=[...a.horas.entries()].sort((x,y)=>y[1]-x[1])[0];
  const maiorDia=[...a.dias.entries()].sort((x,y)=>y[1]-x[1])[0];
  const delivery=a.tipos.get("Entrega")||0;
  const total=a.validos.length;
  $("resumoOperacional").innerHTML=`
    <p><strong>Ticket médio:</strong> ${moeda(total?a.faturamento/total:0)}</p>
    <p><strong>Itens por pedido:</strong> ${total?(a.itens/total).toFixed(1):"0"}</p>
    <p><strong>Pedidos ainda abertos:</strong> ${numero(a.abertos.length)}</p>
    <p><strong>Regra histórica:</strong> pedidos até 08/08/2026 são recuperados mesmo sem status final.</p>
    <p><strong>Participação delivery:</strong> ${total?((delivery/total)*100).toFixed(1):0}%</p>
    <p><strong>Horário de pico:</strong> ${maiorHora?`${maiorHora[0]} (${maiorHora[1]} pedidos)`:"—"}</p>
    <p><strong>Melhor dia:</strong> ${maiorDia?`${maiorDia[0].split("-").reverse().join("/")} (${moeda(maiorDia[1])})`:"—"}</p>
  `;
}

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

async function carregar(){
  let datas;
  try{datas=datasSelecionadas()}catch(e){alert(e.message);return}
  const prev=periodoAnterior(datas.inicio,datas.fim);
  $("conteudo").classList.add("loading");

  try{
    const [r,catResp]=await Promise.all([
      api({action:"report_orders",from:prev.inicio.toISOString(),to:datas.fim.toISOString()}),
      api({action:"list_products"})
    ]);
    const catalogo=catResp.catalog||[];
    const atualLista=r.orders.filter(p=>{const d=new Date(p.created_at);return d>=datas.inicio&&d<datas.fim});
    const anteriorLista=r.orders.filter(p=>{const d=new Date(p.created_at);return d>=prev.inicio&&d<prev.fim});
    const a=agregar(atualLista,catalogo),b=agregar(anteriorLista,catalogo);

    $("fat").textContent=moeda(a.faturamento);
    $("pedidos").textContent=numero(a.validos.length);
    $("itens").textContent=numero(a.itens);
    $("ticket").textContent=moeda(a.validos.length?a.faturamento/a.validos.length:0);
    $("taxas").textContent=moeda(a.taxas);
    $("cancelados").textContent=numero(a.cancelados.length);
    $("fatDelta").innerHTML=deltaHtml(a.faturamento,b.faturamento);
    $("pedDelta").innerHTML=deltaHtml(a.validos.length,b.validos.length);
    $("itensDelta").innerHTML=deltaHtml(a.itens,b.itens);
    $("periodoLabel").textContent=`${$("dataInicio").value.split("-").reverse().join("/")} a ${$("dataFim").value.split("-").reverse().join("/")}`;

    renderGraficoDias(a.dias,datas.inicio,datas.fim);
    renderProdutos(a);
    renderBars("porCategoria",a.cats);
    renderBars("porPagamento",a.pag);
    renderBars("porTipo",a.tipos);
    renderBars("porOrigem",a.origens);
    renderBars("porHora",a.horas,6);
    renderResumo(a);

    if(r.truncated)alert("Aviso: o período possui muitos pedidos e o relatório foi limitado a 20.000 registros.");
  }catch(e){
    console.error(e);
    alert("Não foi possível carregar os relatórios: "+e.message);
  }finally{
    $("conteudo").classList.remove("loading");
  }
}

if(token)entrar();
