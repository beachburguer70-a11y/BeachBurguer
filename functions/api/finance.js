import { json, authorized, supabaseRequest } from './_shared.js';

const money=v=>Math.round((Number(v)||0)*100)/100;
const dayBounds=date=>({from:`${date}T00:00:00-03:00`,to:`${date}T23:59:59.999-03:00`});
function monthBounds(month){
  const m=String(month||'').match(/^(\d{4})-(\d{2})$/);
  if(!m)return null;
  const y=Number(m[1]), mo=Number(m[2]);
  if(mo<1||mo>12)return null;
  const start=`${m[1]}-${m[2]}-01`;
  const ny=mo===12?y+1:y, nm=mo===12?1:mo+1;
  const next=`${String(ny).padStart(4,'0')}-${String(nm).padStart(2,'0')}-01`;
  return {start,next};
}
const closingGross=c=>money(Number(c.cash_total||0)+Number(c.card_total||0)+Number(c.pix_total||0)+Number(c.apagar_cash||0)+Number(c.apagar_card||0));
const closingFees=c=>money(Number(c.card_fee||0)+Number(c.pix_fee||0));
const isClosingReceipt=l=>['a_pagar_dinheiro','a_pagar_cartao'].includes(String(l?.source||''));


async function salesSummary(env,date){
  const {from,to}=dayBounds(date);
  const rows=await supabaseRequest(env,`orders?select=id,status,pagamento,total,origem&created_at=gte.${encodeURIComponent(from)}&created_at=lte.${encodeURIComponent(to)}&order=created_at.asc`);
  const totals={Dinheiro:0,Pix:0,'Cartão':0};
  let count=0;
  for(const p of rows||[]){
    if(String(p.status||'').toLowerCase()==='cancelado')continue;
    const pg=String(p.pagamento||'').trim();
    if(Object.prototype.hasOwnProperty.call(totals,pg)){totals[pg]+=Number(p.total||0);count++;}
  }
  Object.keys(totals).forEach(k=>totals[k]=money(totals[k]));
  return {totals,count};
}

export async function onRequestOptions(){return json({ok:true});}
export async function onRequestPost({request,env}){
  try{
    if(!authorized(request,env))return json({ok:false,error:'Não autorizado.'},401);
    const b=await request.json(); const action=String(b.action||'');
    if(action==='summary'){
      const date=String(b.date||'').slice(0,10); if(!date)return json({ok:false,error:'Data inválida.'},400);
      const sales=await salesSummary(env,date);
      const closings=await supabaseRequest(env,`cash_closings?select=*&closing_date=eq.${date}&limit=1`);
      const ledger=await supabaseRequest(env,`cash_ledger?select=*&entry_date=eq.${date}&order=created_at.desc`);
      const accounts=await supabaseRequest(env,'accounts_payable?select=*&order=due_date.asc,created_at.asc');
      return json({ok:true,sales,closing:closings?.[0]||null,ledger:ledger||[],accounts:accounts||[]});
    }
    if(action==='monthly_summary'){
      const bounds=monthBounds(b.month); if(!bounds)return json({ok:false,error:'Mês inválido.'},400);
      const [closingsAll,ledgerAll]=await Promise.all([
        supabaseRequest(env,`cash_closings?select=closing_date,cash_total,card_total,pix_total,apagar_cash,apagar_card,card_fee,pix_fee&closing_date=lt.${bounds.next}&order=closing_date.asc&limit=10000`),
        supabaseRequest(env,`cash_ledger?select=id,entry_date,type,description,amount,source,created_at&entry_date=lt.${bounds.next}&order=entry_date.asc,created_at.asc&limit=10000`)
      ]);
      const priorClosings=(closingsAll||[]).filter(c=>String(c.closing_date)<bounds.start);
      const monthClosings=(closingsAll||[]).filter(c=>String(c.closing_date)>=bounds.start);
      const priorLedger=(ledgerAll||[]).filter(l=>String(l.entry_date)<bounds.start && !isClosingReceipt(l));
      const monthLedger=(ledgerAll||[]).filter(l=>String(l.entry_date)>=bounds.start && !isClosingReceipt(l));
      let saldoAnterior=0;
      priorClosings.forEach(c=>{saldoAnterior+=closingGross(c)-closingFees(c)});
      priorLedger.forEach(l=>{saldoAnterior+=(String(l.type)==='entrada'?1:-1)*Number(l.amount||0)});
      saldoAnterior=money(saldoAnterior);
      const dias={};
      const dia=d=>dias[d]||(dias[d]={date:d,receitas:0,despesas:0,entries:[]});
      monthClosings.forEach(c=>{
        const d=dia(String(c.closing_date)); const venda=closingGross(c), taxas=closingFees(c);
        if(venda>0){d.receitas=money(d.receitas+venda);d.entries.push({type:'entrada',description:'Venda',amount:venda,source:'fechamento'});}
        if(taxas>0){d.despesas=money(d.despesas+taxas);d.entries.push({type:'saida',description:'Taxas do fechamento',amount:taxas,source:'taxas'});}
      });
      monthLedger.forEach(l=>{
        const d=dia(String(l.entry_date)); const amount=money(l.amount); const type=String(l.type)==='entrada'?'entrada':'saida';
        if(type==='entrada')d.receitas=money(d.receitas+amount); else d.despesas=money(d.despesas+amount);
        d.entries.push({type,description:l.description||'Lançamento',amount,source:l.source||''});
      });
      const days=Object.values(dias).sort((a,b)=>a.date.localeCompare(b.date));
      const receitas=money(days.reduce((s,d)=>s+d.receitas,0));
      const despesas=money(days.reduce((s,d)=>s+d.despesas,0));
      const saldoAtual=money(saldoAnterior+receitas-despesas);
      return json({ok:true,month:b.month,receitas,despesas,saldo_anterior:saldoAnterior,saldo_atual:saldoAtual,days});
    }
    if(action==='save_closing'){
      const date=String(b.date||'').slice(0,10); const sales=await salesSummary(env,date);
      const apagarCash=money(b.apagar_cash), apagarCard=money(b.apagar_card), cardFee=money(b.card_fee), pixFee=money(b.pix_fee);
      const row={closing_date:date,cash_total:sales.totals.Dinheiro,card_total:sales.totals['Cartão'],pix_total:sales.totals.Pix,pending_unclassified:0,notes:'',apagar_cash:apagarCash,apagar_card:apagarCard,card_fee:cardFee,pix_fee:pixFee,updated_at:new Date().toISOString()};
      const saved=await supabaseRequest(env,'cash_closings?on_conflict=closing_date',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(row)});
      async function syncReceipt(source,description,amount){
        const prior=await supabaseRequest(env,`cash_ledger?select=id,amount&entry_date=eq.${date}&source=eq.${source}&limit=1`);
        if(prior?.[0]){
          if(amount>0) await supabaseRequest(env,`cash_ledger?id=eq.${prior[0].id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({amount,description})});
          else await supabaseRequest(env,`cash_ledger?id=eq.${prior[0].id}`,{method:'DELETE',headers:{Prefer:'return=minimal'}});
        }else if(amount>0){
          await supabaseRequest(env,'cash_ledger',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({entry_date:date,type:'entrada',description,amount,source})});
        }
      }
      await syncReceipt('a_pagar_dinheiro','Recebimento de A pagar — Dinheiro',apagarCash);
      await syncReceipt('a_pagar_cartao','Recebimento de A pagar — Cartão',apagarCard);
      return json({ok:true,closing:saved?.[0]||row});
    }
    if(action==='add_ledger'){
      const amount=money(b.amount); if(amount<=0)return json({ok:false,error:'Informe um valor válido.'},400);
      const row={entry_date:String(b.date||'').slice(0,10),type:String(b.type)==='entrada'?'entrada':'saida',description:String(b.description||'').trim()||'Lançamento manual',amount,source:'manual'};
      const saved=await supabaseRequest(env,'cash_ledger',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(row)});
      return json({ok:true,entry:saved?.[0]});
    }
    if(action==='create_account'){
      const desc=String(b.description||'').trim(); const base=money(b.amount_due); if(!desc||base<=0)return json({ok:false,error:'Descrição e valor são obrigatórios.'},400);
      let carry=0;
      const prior=await supabaseRequest(env,`accounts_payable?select=id,remaining,status&description=eq.${encodeURIComponent(desc)}&status=in.(pendente,parcial,vencida)&order=created_at.desc&limit=1`);
      if(prior?.[0])carry=money(prior[0].remaining);
      const total=money(base+carry);
      const row={description:desc,due_date:String(b.due_date||'').slice(0,10)||null,base_amount:base,carried_amount:carry,amount_due:total,amount_paid:0,remaining:total,status:'pendente',updated_at:new Date().toISOString()};
      const saved=await supabaseRequest(env,'accounts_payable',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(row)});
      return json({ok:true,account:saved?.[0],carried:carry});
    }
    if(action==='pay_account'){
      const id=Number(b.id), pay=money(b.amount_paid); if(!id||pay<=0)return json({ok:false,error:'Pagamento inválido.'},400);
      const rows=await supabaseRequest(env,`accounts_payable?select=*&id=eq.${id}&limit=1`); const a=rows?.[0]; if(!a)return json({ok:false,error:'Conta não encontrada.'},404);
      const newPaid=money(Number(a.amount_paid||0)+pay); const remaining=Math.max(0,money(Number(a.amount_due||0)-newPaid)); const status=remaining<=0?'quitada':'parcial';
      await supabaseRequest(env,`accounts_payable?id=eq.${id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({amount_paid:newPaid,remaining,status,updated_at:new Date().toISOString()})});
      const date=String(b.date||new Date().toISOString().slice(0,10)).slice(0,10);
      await supabaseRequest(env,'cash_ledger',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({entry_date:date,type:'saida',description:`Conta a pagar: ${a.description}`,amount:pay,source:'conta_a_pagar',account_id:id})});
      return json({ok:true,amount_paid:newPaid,remaining,status});
    }
    return json({ok:false,error:'Ação inválida.'},400);
  }catch(e){console.error(e);return json({ok:false,error:e.message||'Erro interno.'},500)}
}
