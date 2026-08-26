import { json } from './_shared.js';
import { cleanPhone,getCatalog,getAddons,loadSession,saveSession,markProcessed,catalogForPrompt,summarizeState,applyActions,buildOrder,missingFields,DEFAULT_ADDONS,DELIVERY_FEES,sendBiaText } from './_bia.js';

const sendText=sendBiaText;
function readOutputText(data){
  if(typeof data?.output_text==='string') return data.output_text;
  for(const item of data?.output||[]) for(const c of item?.content||[]) if(c?.type==='output_text'&&c?.text) return c.text;
  return '';
}
async function askBiaAI(env,{message,state,catalog,addons=DEFAULT_ADDONS}){
  if(!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY não configurada.');
  const schema={type:'object',additionalProperties:false,properties:{
    reply:{type:'string'},ready_to_confirm:{type:'boolean'},confirm_order:{type:'boolean'},
    actions:{type:'array',items:{type:'object',additionalProperties:false,properties:{
      type:{type:'string',enum:['set_name','set_order_type','set_address','set_number','set_no_number','set_locality','set_reference','set_payment','set_change_for','add_item','remove_item','clear_cart','handoff','resume_bot']},
      value:{type:['string','boolean','null']},product_id:{type:['string','number','null']},quantity:{type:['integer','null']},addons:{type:'array',items:{type:'string'}},observation:{type:['string','null']}
    },required:['type','value','product_id','quantity','addons','observation']}}
  },required:['reply','ready_to_confirm','confirm_order','actions']};
  const instructions=`Você é Bia, atendente virtual da Beach Burguer. Fale em português do Brasil, simpática, curta e natural.\n
Sua função é montar pedidos, tirar dúvidas do cardápio e coletar dados. Nunca invente produto, preço, adicional, taxa ou disponibilidade. Use SOMENTE o catálogo informado.\n
Quando o cliente pedir produto, use add_item com o ID exato. Se estiver ambíguo, pergunte. Para alterar/remover, use as ações apropriadas.\n
Tipos válidos: Entrega, Retirada, Consumir no local. Localidades de entrega: Atafona, São João da Barra, Chapéu do Sol. Taxas: ${JSON.stringify(DELIVERY_FEES)}; Atafona é grátis no Pix/Dinheiro e R$2 no Cartão.\n
Pagamentos: Pix, Dinheiro, Cartão. Se Dinheiro e cliente mencionar troco, salve set_change_for.\n
Adicionais permitidos nos produtos que aceitam: ${addons.map(a=>a.nome+' R$'+a.preco).join(', ')}.\n
Nunca confirme que um pedido foi enviado só pela intenção do cliente. Se todos os dados estiverem completos, mostre um resumo e pergunte explicitamente se pode confirmar; marque ready_to_confirm=true. Somente marque confirm_order=true se a mensagem atual do cliente for uma confirmação inequívoca do resumo, como 'sim', 'confirmo', 'pode enviar'.\n
Se pedirem humano, marque handoff e diga que o atendimento será assumido pela equipe.\n
O telefone já vem do WhatsApp, não peça telefone. Não solicite e-mail.`;
  const input=`ESTADO ATUAL:\n${JSON.stringify(summarizeState(state,catalog))}\n\nCATÁLOGO DISPONÍVEL:\n${catalogForPrompt(catalog)}\n\nMENSAGEM DO CLIENTE:\n${message}`;
  const res=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5-mini',instructions,input,text:{format:{type:'json_schema',name:'bia_action',strict:true,schema}}})
  });
  const data=await res.json(); if(!res.ok) throw new Error(data?.error?.message||'Falha na IA.');
  const text=readOutputText(data); if(!text) throw new Error('IA retornou resposta vazia.');
  return JSON.parse(text);
}
async function fetchStore(request){
  const r=await fetch(new URL('/api/orders',request.url),{cache:'no-store'}); const j=await r.json(); return j.store||{};
}
function formatMoney(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function orderSummary(order){
  const lines=(order.itens||[]).map(i=>`${i.quantidade}x ${i.nome}${(i.adicionais||[]).length?' + '+i.adicionais.map(a=>a.nome).join(', '):''}${i.observacao?' — '+i.observacao:''}`);
  return `🍔 *Resumo do pedido*\n${lines.join('\n')}\n${order.tipo==='Entrega'?`📍 ${order.endereco} — ${order.bairro}${order.referencia?'\nRef.: '+order.referencia:''}\n`:''}💳 ${order.pagamento}\nSubtotal: ${formatMoney(order.subtotal)}${order.entrega?`\nEntrega: ${formatMoney(order.entrega)}`:''}\n*Total: ${formatMoney(order.total)}*\n\nPosso confirmar e enviar seu pedido?`;
}
async function createOrder(request,order){
  const r=await fetch(new URL('/api/orders',request.url),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...order})});
  const j=await r.json(); if(!r.ok||!j.ok) throw new Error(j.error||'Não foi possível criar o pedido.'); return j;
}
async function createPix(request,order){
  const r=await fetch(new URL('/api/pix-create',request.url),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({amount:order.total,phone:order.telefone,name:order.cliente,order})});
  const j=await r.json(); if(!r.ok||!j.ok) throw new Error(j.error||'Não foi possível gerar o Pix.'); return j;
}
async function processIncoming(request,env,msg){
  const waPhone=String(msg.from||''); const phone=cleanPhone(waPhone); if(!phone) return;
  if(!(await markProcessed(env,msg.id||crypto.randomUUID(),phone))) return;
  if(msg.type!=='text'){
    await sendText(env,waPhone,'Por enquanto eu consigo atender pedidos por texto 😊 Pode me mandar sua mensagem escrita?'); return;
  }
  const message=String(msg.text?.body||'').trim(); if(!message) return;
  const catalog=await getCatalog(env); const addons=await getAddons(env); let state=await loadSession(env,phone); state.phone=phone;
  if(state.handoff){
    const n=message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(n==='bia' || n.includes('voltar bia') || n.includes('falar com a bia')){
      state.handoff=false; await saveSession(env,phone,state);
      await sendText(env,waPhone,'Voltei 😊 Sou a Bia. Como posso te ajudar com seu pedido?');
    }
    return;
  }
  const store=await fetchStore(request);
  if(store.open===false){
    const next=store.next_open; const when=next?`${next.day_name} às ${next.time}`:'no próximo horário de funcionamento';
    await sendText(env,waPhone,`Oi! Eu sou a Bia 😊 A Beach Burguer está fechada agora e volta ${when}. Posso te mostrar o cardápio, mas não consigo confirmar pedido enquanto a loja estiver fechada.`);
    return;
  }
  let ai;
  try{ ai=await askBiaAI(env,{message,state,catalog}); }
  catch(e){ console.error('Bia IA:',e); await sendText(env,waPhone,'Tive um probleminha para entender sua mensagem. Pode tentar de novo em uma frase curta?'); return; }
  state=applyActions(state,ai.actions,catalog,addons); state.phone=phone;
  if(state.handoff){ state.last_reply=ai.reply; await saveSession(env,phone,state); await sendText(env,waPhone,ai.reply||'Vou chamar alguém da equipe para continuar seu atendimento.'); return; }
  const order=buildOrder(state,catalog,addons); const missing=missingFields(state,order);
  let reply=String(ai.reply||'');
  if(ai.confirm_order && !missing.length){
    try{
      if(order.pagamento==='Pix'){
        const pix=await createPix(request,order);
        reply=`Pix gerado ✅\n\nTotal: *${formatMoney(order.total)}*\n\nCódigo Pix copia e cola:\n${pix.qr_code}\n\nAssim que o pagamento for aprovado, o pedido entra automaticamente na loja.`;
        state.pix_payment_id=pix.payment_id; state.pix_pending=true;
      }else{
        const created=await createOrder(request,order);
        reply=`Pedido *#${created.order.id}* confirmado! 🍔✅\nTotal: *${formatMoney(order.total)}*\nPagamento: ${order.pagamento}.\n\nJá enviei para a Beach Burguer.`;
        state={...state,cart:[],last_order_id:created.order.id};
      }
    }catch(e){ reply=`Não consegui finalizar ainda: ${e.message}`; }
  }else if(ai.ready_to_confirm && !missing.length){
    reply=orderSummary(order);
  }
  state.last_reply=reply; await saveSession(env,phone,state); await sendText(env,waPhone,reply||'Como posso te ajudar com seu pedido?');
}
export async function onRequestGet({request,env}){
  const u=new URL(request.url); const mode=u.searchParams.get('hub.mode'); const token=u.searchParams.get('hub.verify_token'); const challenge=u.searchParams.get('hub.challenge');
  if(mode==='subscribe' && token && token===env.WHATSAPP_VERIFY_TOKEN) return new Response(challenge||'',{status:200});
  return new Response('Verificação recusada.',{status:403});
}
export async function onRequestPost(context){
  try{
    const payload=await context.request.json();
    const messages=[];
    for(const entry of payload.entry||[]) for(const change of entry.changes||[]) for(const msg of change.value?.messages||[]) messages.push(msg);
    for(const msg of messages){
      const job=processIncoming(context.request,context.env,msg).catch(e=>console.error('Bia webhook:',e));
      if(context.waitUntil) context.waitUntil(job); else await job;
    }
    return json({ok:true,received:messages.length});
  }catch(e){ console.error(e); return json({ok:true}); }
}
