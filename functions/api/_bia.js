import { supabaseRequest } from './_shared.js';

const DEFAULT_ADDONS = [
  {nome:'Carne',preco:7},{nome:'Frango',preco:5},{nome:'Mussarela',preco:3},{nome:'Cheddar',preco:4},
  {nome:'Ovo',preco:2},{nome:'Calabresa',preco:2},{nome:'Bacon',preco:3},{nome:'Picles',preco:2},{nome:'Batata',preco:7}
];
const DELIVERY_FEES = {'Atafona':0,'São João da Barra':5,'Chapéu do Sol':5};
const NO_ADDONS = new Set(['combos','mistos quentes','beach podrão','bebidas','doces']);


export async function sendBiaText(env,to,text){
  if(!env.WHATSAPP_ACCESS_TOKEN||!env.WHATSAPP_PHONE_NUMBER_ID) throw new Error('WhatsApp não configurado.');
  let dest=String(to||'').replace(/\D/g,'');
  if(dest.length===10||dest.length===11) dest='55'+dest;
  const version=env.WHATSAPP_GRAPH_VERSION||'v23.0';
  const res=await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(env.WHATSAPP_PHONE_NUMBER_ID)}/messages`,{
    method:'POST',headers:{Authorization:`Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify({messaging_product:'whatsapp',recipient_type:'individual',to:dest,type:'text',text:{preview_url:false,body:String(text).slice(0,4096)}})
  });
  const data=await res.json();
  if(!res.ok) throw new Error(data?.error?.message||'Falha ao enviar WhatsApp.');
  return data;
}

export function cleanPhone(v){
  let n=String(v||'').replace(/\D/g,'');
  if(n.startsWith('55') && (n.length===12||n.length===13)) n=n.slice(2);
  return n.slice(0,11);
}
export function normalize(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
}
export async function getCatalog(env){
  const rows=await supabaseRequest(env,'products?select=id,category,name,description,price,active,available,sort_order,allows_addons&active=eq.true&order=sort_order.asc,id.asc');
  return (rows||[]).filter(p=>p.available!==false);
}
export async function getAddons(env){
  try{
    const rows=await supabaseRequest(env,'addons?select=id,name,price,active,sort_order&active=eq.true&order=sort_order.asc,id.asc');
    if(Array.isArray(rows)&&rows.length) return rows.map(a=>({nome:a.name,preco:Number(a.price||0)}));
  }catch(e){ console.warn('Adicionais Bia:',e?.message||e); }
  return DEFAULT_ADDONS;
}
export async function getStoreState(env){
  // Reusa o endpoint público de pedidos para manter exatamente a mesma regra de abertura/fechamento.
  return null;
}
export async function loadSession(env, phone){
  const rows=await supabaseRequest(env,`bia_sessions?select=phone,state,updated_at&phone=eq.${encodeURIComponent(phone)}&limit=1`);
  const row=Array.isArray(rows)?rows[0]:null;
  return row?.state && typeof row.state==='object' ? row.state : freshState(phone);
}
export function freshState(phone=''){
  return {phone,name:'',order_type:'',address:'',number:'',no_number:false,locality:'',reference:'',payment:'',change_for:'',cart:[],last_reply:'',handoff:false};
}
export async function saveSession(env, phone, state){
  await supabaseRequest(env,'bia_sessions?on_conflict=phone',{
    method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify({phone,state,updated_at:new Date().toISOString()})
  });
}
export async function markProcessed(env, messageId, phone){
  try{
    await supabaseRequest(env,'bia_processed_messages',{
      method:'POST',headers:{Prefer:'return=minimal'},
      body:JSON.stringify({message_id:String(messageId),phone,created_at:new Date().toISOString()})
    });
    return true;
  }catch(e){
    if(/duplicate|unique/i.test(String(e?.message||e))) return false;
    throw e;
  }
}
export function catalogForPrompt(catalog){
  return catalog.map(p=>`${p.id} | ${p.category} | ${p.name} | R$ ${Number(p.price).toFixed(2)} | ${p.description||''} | adicionais:${p.allows_addons===false?'não':'sim'}`).join('\n');
}
export function summarizeState(state, catalog){
  const byId=new Map(catalog.map(p=>[String(p.id),p]));
  const cart=(state.cart||[]).map(i=>{
    const p=byId.get(String(i.product_id));
    return `${i.quantity||1}x ${p?.name||i.product_name||i.product_id}${(i.addons||[]).length?' + '+i.addons.join(', '):''}${i.observation?' ('+i.observation+')':''}`;
  }).join('; ');
  return { ...state, cart_summary:cart };
}
function addonByName(name, addons=DEFAULT_ADDONS){
  const n=normalize(name); return addons.find(a=>normalize(a.nome)===n)||null;
}
export function applyActions(state, actions, catalog, addons=DEFAULT_ADDONS){
  const next=structuredClone(state||freshState());
  const byId=new Map(catalog.map(p=>[String(p.id),p]));
  for(const a of actions||[]){
    if(!a||!a.type) continue;
    if(a.type==='set_name') next.name=String(a.value||'').trim();
    if(a.type==='set_order_type' && ['Entrega','Retirada','Consumir no local'].includes(a.value)) next.order_type=a.value;
    if(a.type==='set_address') next.address=String(a.value||'').trim();
    if(a.type==='set_number'){ next.number=String(a.value||'').trim(); next.no_number=false; }
    if(a.type==='set_no_number') next.no_number=Boolean(a.value);
    if(a.type==='set_locality'){
      const wanted=normalize(a.value);
      const key=Object.keys(DELIVERY_FEES).find(k=>normalize(k)===wanted);
      if(key) next.locality=key;
    }
    if(a.type==='set_reference') next.reference=String(a.value||'').trim();
    if(a.type==='set_payment' && ['Pix','Dinheiro','Cartão'].includes(a.value)) next.payment=a.value;
    if(a.type==='set_change_for') next.change_for=String(a.value||'').trim();
    if(a.type==='clear_cart') next.cart=[];
    if(a.type==='remove_item'){
      const id=String(a.product_id||'');
      next.cart=(next.cart||[]).filter(i=>String(i.product_id)!==id);
    }
    if(a.type==='add_item'){
      const p=byId.get(String(a.product_id||''));
      if(!p) continue;
      const qty=Math.min(20,Math.max(1,Number(a.quantity||1)|0));
      const canAddons=p.allows_addons!==false && !NO_ADDONS.has(normalize(p.category));
      const addons=canAddons ? (a.addons||[]).map(n=>addonByName(n,addons)).filter(Boolean).map(x=>x.nome) : [];
      next.cart.push({product_id:p.id,product_name:p.name,quantity:qty,addons,observation:String(a.observation||'').trim()});
    }
    if(a.type==='handoff') next.handoff=true;
    if(a.type==='resume_bot') next.handoff=false;
  }
  return next;
}
export function buildOrder(state,catalog,addons=DEFAULT_ADDONS){
  const byId=new Map(catalog.map(p=>[String(p.id),p]));
  const itens=[];
  for(const c of state.cart||[]){
    const p=byId.get(String(c.product_id)); if(!p) continue;
    const adicionais=(c.addons||[]).map(n=>addonByName(n,addons)).filter(Boolean);
    const quantity=Math.max(1,Number(c.quantity||1));
    const unit=Number(p.price||0)+adicionais.reduce((s,a)=>s+Number(a.preco||0),0);
    itens.push({id:p.id,nome:p.name,categoria:p.category||'',quantidade:quantity,preco:Number(p.price||0),adicionais,observacao:String(c.observation||''),total:unit*quantity});
  }
  const subtotal=itens.reduce((s,i)=>s+i.total,0);
  let entrega=0;
  if(state.order_type==='Entrega'){
    entrega=Number(DELIVERY_FEES[state.locality]||0);
    if(state.locality==='Atafona' && state.payment==='Cartão') entrega=2;
  }
  const endereco=state.order_type==='Entrega' ? `${state.address}${state.no_number?', s/n':state.number?', nº '+state.number:''}` : '';
  return {
    cliente:state.name,telefone:state.phone,endereco,endereco_base:state.address,numero:state.number,
    sem_numero:Boolean(state.no_number),bairro:state.order_type==='Entrega'?state.locality:'',referencia:state.reference,
    localidade:state.order_type==='Entrega'?state.locality:state.order_type,tipo:state.order_type,pagamento:state.payment,
    troco:state.payment==='Dinheiro'&&state.change_for?`Paga com ${state.change_for}`:'',observacoes:'Pedido realizado pela Bia no WhatsApp',
    itens,subtotal,entrega,total:subtotal+entrega,origem:'bia'
  };
}
export function missingFields(state,order){
  const m=[];
  if(!state.name) m.push('nome');
  if(!state.order_type) m.push('tipo do pedido');
  if(state.order_type==='Entrega'){
    if(!state.locality) m.push('localidade');
    if(!state.address) m.push('endereço');
    if(!state.no_number&&!state.number) m.push('número');
  }
  if(!state.payment) m.push('forma de pagamento');
  if(!(order.itens||[]).length) m.push('itens');
  return m;
}
export { DEFAULT_ADDONS, DELIVERY_FEES };
