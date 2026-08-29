import { json, authorized, supabaseRequest } from './_shared.js';

const money=v=>Math.round((Number(v)||0)*100)/100;
const dayBounds=date=>({from:`${date}T00:00:00-03:00`,to:`${date}T23:59:59.999-03:00`});

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
    if(action==='save_closing'){
      const date=String(b.date||'').slice(0,10); const sales=await salesSummary(env,date);
      const pending=money(b.pending_unclassified);
      const row={closing_date:date,cash_total:sales.totals.Dinheiro,card_total:sales.totals['Cartão'],pix_total:sales.totals.Pix,pending_unclassified:pending,notes:String(b.notes||'').trim(),updated_at:new Date().toISOString()};
      const saved=await supabaseRequest(env,'cash_closings?on_conflict=closing_date',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(row)});
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
