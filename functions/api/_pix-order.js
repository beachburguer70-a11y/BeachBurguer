import { supabaseRequest } from './_shared.js';

function cleanPhone(v){ return String(v||'').replace(/\D/g,''); }

export async function ensureOrderFromApprovedPix(env, payment) {
  if (!payment || String(payment.status) !== 'approved') return { ok:false, skipped:true, reason:'Pix não aprovado.' };

  const paymentId=String(payment.id||'').trim();
  if(!paymentId) return { ok:false, skipped:true, reason:'Pagamento sem ID.' };

  // Idempotência: se o pedido desse Pix já existe, devolve o mesmo pedido.
  const existing=await supabaseRequest(env, `orders?select=*&pix_payment_id=eq.${encodeURIComponent(paymentId)}&limit=1`);
  if(Array.isArray(existing) && existing[0]) return { ok:true, order:existing[0], existing:true };

  const pixRows=await supabaseRequest(env, `pix_payments?select=payment_id,order_payload,order_created_id&payment_id=eq.${encodeURIComponent(paymentId)}&limit=1`);
  const pixRow=Array.isArray(pixRows)?pixRows[0]:null;
  const d=pixRow?.order_payload;
  if(!d || typeof d!=='object') return { ok:false, skipped:true, reason:'Dados do pedido ainda não vinculados ao Pix.' };

  const paid=Number(payment.transaction_amount||0);
  const expected=Number(d.total||0);
  if(!Number.isFinite(expected) || expected<=0 || Math.abs(paid-expected)>=0.01){
    return { ok:false, skipped:true, reason:'Valor do Pix diferente do total do pedido.' };
  }

  const telefone=cleanPhone(d.telefone);
  const order={
    status:'novo', printed:false,
    cliente:String(d.cliente||'').trim(),
    telefone,
    endereco:String(d.endereco||'').trim(),
    bairro:String(d.bairro||'').trim(),
    referencia:String(d.referencia||'').trim(),
    localidade:String(d.localidade||'').trim(),
    tipo:String(d.tipo||''),
    pagamento:'Pix',
    troco:'',
    observacoes:String(d.observacoes||'').trim(),
    itens:Array.isArray(d.itens)?d.itens:[],
    subtotal:Number(d.subtotal||0),
    entrega:Number(d.entrega||0),
    total:expected,
    pix_payment_id:paymentId,
    pix_status:'approved',
    origem:'cliente'
  };

  if(!order.cliente || !telefone || !order.itens.length || !order.tipo){
    return { ok:false, skipped:true, reason:'Dados incompletos para criar o pedido pago.' };
  }

  try{
    const inserted=await supabaseRequest(env,'orders?select=*',{
      method:'POST', headers:{Prefer:'return=representation'}, body:JSON.stringify(order)
    });
    const saved=Array.isArray(inserted)?inserted[0]:inserted;

    try{
      await supabaseRequest(env,`pix_payments?payment_id=eq.${encodeURIComponent(paymentId)}`,{
        method:'PATCH', headers:{Prefer:'return=minimal'},
        body:JSON.stringify({order_created_id:saved?.id||null,updated_at:new Date().toISOString()})
      });
    }catch{}

    // Mantém o cadastro do cliente atualizado, sem impedir a criação do pedido.
    try{
      await supabaseRequest(env,'customers?on_conflict=telefone',{
        method:'POST', headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
        body:JSON.stringify({
          telefone,nome:order.cliente,
          endereco:String(d.endereco_base||order.endereco).trim(),
          numero:String(d.numero||'').trim(),sem_numero:Boolean(d.sem_numero),
          bairro:order.bairro,referencia:order.referencia,updated_at:new Date().toISOString()
        })
      });
    }catch{}

    return {ok:true,order:saved,created:true};
  }catch(error){
    // Se houve corrida entre webhook/polling, consulta novamente pelo índice único.
    try{
      const raced=await supabaseRequest(env, `orders?select=*&pix_payment_id=eq.${encodeURIComponent(paymentId)}&limit=1`);
      if(Array.isArray(raced)&&raced[0]) return {ok:true,order:raced[0],existing:true};
    }catch{}
    throw error;
  }
}
