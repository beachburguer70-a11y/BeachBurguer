const $=id=>document.getElementById(id), TK='bb_store_token'; let token=localStorage.getItem(TK)||''; const moeda=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); const hoje=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
$('data').value=hoje(); $('senha').value=token;
async function api(body){const r=await fetch('/api/finance',{method:'POST',headers:{'Content-Type':'application/json','X-Store-Token':token},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.error||'Erro');return d}
async function entrar(){token=$('senha').value.trim();try{await api({action:'summary',date:$('data').value});localStorage.setItem(TK,token);$('login').classList.add('hidden');$('app').classList.remove('hidden');carregar()}catch(e){alert('Senha inválida ou banco ainda não preparado.')}}
$('entrar').onclick=entrar;$('senha').onkeydown=e=>{if(e.key==='Enter')entrar()};$('sair').onclick=()=>{localStorage.removeItem(TK);location.reload()};$('atualizar').onclick=carregar;
const num=id=>Math.max(0,Number($(id)?.value||0)||0);
function calcular(){const baseCash=Number($('dinheiro').dataset.base||0),baseCard=Number($('cartao').dataset.base||0),basePix=Number($('pix').dataset.base||0);const ac=num('apagarCartao'),ad=num('apagarDinheiro'),tc=num('taxaCartao'),tp=num('taxaPix');const cash=baseCash+ad,card=baseCard+ac,pix=basePix,total=cash+card+pix;$('dinheiro').textContent=moeda(cash);$('cartao').textContent=moeda(card);$('pix').textContent=moeda(pix);$('total').textContent=moeda(total);$('cartaoLiquido').textContent=moeda(Math.max(0,card-tc));$('pixLiquido').textContent=moeda(Math.max(0,pix-tp));$('totalTaxas').textContent=moeda(tc+tp);$('totalLiquido').textContent=moeda(Math.max(0,total-tc-tp));}
['apagarDinheiro','apagarCartao','taxaCartao','taxaPix'].forEach(id=>$(id).addEventListener('input',calcular));
async function carregar(){try{const d=await api({action:'summary',date:$('data').value});const t=d.sales.totals,c=d.closing||{};$('dinheiro').dataset.base=t.Dinheiro;$('cartao').dataset.base=t['Cartão'];$('pix').dataset.base=t.Pix;$('apagarDinheiro').value=c.apagar_cash||'';$('apagarCartao').value=c.apagar_card||'';$('taxaCartao').value=c.card_fee||'';$('taxaPix').value=c.pix_fee||'';calcular();renderContas(d.accounts);renderLivro(d.ledger)}catch(e){alert(e.message)}}
$('salvarFechamento').onclick=async()=>{try{await api({action:'save_closing',date:$('data').value,apagar_cash:num('apagarDinheiro'),apagar_card:num('apagarCartao'),card_fee:num('taxaCartao'),pix_fee:num('taxaPix')});alert('Fechamento salvo e recebimentos de “A pagar” lançados no Livro Caixa.');carregar()}catch(e){alert(e.message)}};
$('criarConta').onclick=async()=>{try{const d=await api({action:'create_account',description:$('contaDesc').value,due_date:$('contaVenc').value,amount_due:$('contaValor').value});$('contaDesc').value='';$('contaValor').value='';alert(d.carried>0?`Conta criada. Saldo anterior de ${moeda(d.carried)} foi somado.`:'Conta criada.');carregar()}catch(e){alert(e.message)}};
$('addLanc').onclick=async()=>{try{await api({action:'add_ledger',date:$('data').value,type:$('lancTipo').value,description:$('lancDesc').value,amount:$('lancValor').value});$('lancDesc').value='';$('lancValor').value='';carregar()}catch(e){alert(e.message)}};
function renderContas(list){$('contas').innerHTML=(list||[]).map(a=>`<div class="account"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${esc(a.description)}</strong><span class="pill">${esc(a.status)}</span></div><div class="muted">Venc.: ${a.due_date||'-'} • Valor a pagar: ${moeda(a.amount_due)} • Pago: ${moeda(a.amount_paid)} • <strong>Restante: ${moeda(a.remaining)}</strong></div>${a.status!=='quitada'?`<div style="display:flex;gap:7px;margin-top:8px"><input id="pay${a.id}" type="number" step="0.01" placeholder="Valor pago"><button class="btn green" onclick="pagar(${a.id})">Registrar pagamento</button></div>`:''}</div>`).join('')||'<p class="muted">Nenhuma conta cadastrada.</p>'}
window.pagar=async id=>{const el=$('pay'+id);try{await api({action:'pay_account',id,amount_paid:el.value,date:$('data').value});carregar()}catch(e){alert(e.message)}};
function renderLivro(list){$('livro').innerHTML=(list||[]).map(x=>`<div><span>${esc(x.description)}<br><small class="muted">${esc(x.source||'')}</small></span><strong class="${x.type}">${x.type==='saida'?'-':'+'} ${moeda(x.amount)}</strong></div>`).join('')||'<p class="muted">Sem lançamentos nesta data.</p>'}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
if(token)entrar();
// V31.53 — Resumo mensal do Livro Caixa
const mesAtual=()=>hoje().slice(0,7);
if($('mesResumo'))$('mesResumo').value=mesAtual();
function alternarFinanceiroV3153(modo){
  const mensal=modo==='mensal';
  $('painelDiario')?.classList.toggle('hidden',mensal);
  $('painelMensal')?.classList.toggle('hidden',!mensal);
  $('verDiario')?.classList.toggle('ativo',!mensal);
  $('verMensal')?.classList.toggle('ativo',mensal);
  $('verDiario')?.classList.toggle('yellow',!mensal);
  $('verDiario')?.classList.toggle('dark',mensal);
  $('verMensal')?.classList.toggle('yellow',mensal);
  $('verMensal')?.classList.toggle('dark',!mensal);
  if(mensal)carregarResumoMensalV3153();
}
$('verDiario')?.addEventListener('click',()=>alternarFinanceiroV3153('diario'));
$('verMensal')?.addEventListener('click',()=>alternarFinanceiroV3153('mensal'));
$('atualizarResumo')?.addEventListener('click',carregarResumoMensalV3153);
$('mesResumo')?.addEventListener('change',carregarResumoMensalV3153);
function nomeDiaV3153(date){
  const [y,m,d]=String(date).split('-').map(Number);
  const dt=new Date(y,m-1,d,12,0,0);
  const dia=new Intl.DateTimeFormat('pt-BR',{weekday:'long'}).format(dt);
  const dm=new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(dt).replace('.','');
  return `${dm} — ${dia.charAt(0).toUpperCase()+dia.slice(1)}`;
}
async function carregarResumoMensalV3153(){
  if(!$('mesResumo')||!token)return;
  try{
    const d=await api({action:'monthly_summary',month:$('mesResumo').value});
    $('receitasMes').textContent=moeda(d.receitas);
    $('despesasMes').textContent=moeda(d.despesas);
    $('saldoAnteriorMes').textContent=moeda(d.saldo_anterior);
    $('saldoAtualMes').textContent=moeda(d.saldo_atual);
    const days=[...(d.days||[])].sort((a,b)=>b.date.localeCompare(a.date));
    $('diasResumo').innerHTML=days.length?days.map(day=>`<section class="day-group"><div class="day-title"><strong>${esc(nomeDiaV3153(day.date))}</strong><span class="day-values">Receitas: <b class="entrada">${moeda(day.receitas)}</b> &nbsp; Despesas: <b class="saida">${moeda(day.despesas)}</b></span></div>${(day.entries||[]).map(x=>`<div class="day-entry"><span>${esc(x.description)}${x.source?`<small>${esc(x.source)}</small>`:''}</span><strong class="${x.type}">${x.type==='saida'?'-':'+'} ${moeda(x.amount)}</strong></div>`).join('')}</section>`).join(''):'<p class="muted">Nenhum lançamento neste mês.</p>';
  }catch(e){alert(e.message)}
}
