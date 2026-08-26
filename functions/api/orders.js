import { sendNotification } from "web-push-neo";

import { json, authorized, supabaseRequest, mpToken } from "./_shared.js";

async function verifyApprovedPix(env, paymentId, expectedAmount) {
  if (!paymentId) return { ok:false, error:"Pagamento Pix não informado." };

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers:{ Authorization:`Bearer ${mpToken(env)}` } }
  );
  const payment = await res.json();

  if (!res.ok) return { ok:false, error:payment.message || "Não foi possível validar o Pix." };

  const paid = Number(payment.transaction_amount || 0);
  const expected = Number(expectedAmount || 0);

  if (payment.status !== "approved") {
    return { ok:false, error:"O Pix ainda não foi aprovado." };
  }
  if (Math.abs(paid - expected) >= 0.01) {
    return { ok:false, error:"O valor pago no Pix não corresponde ao total do pedido." };
  }
  return { ok:true, payment };
}


async function sendWhatsAppTemplate(env, telefone, templateName, nomeCliente, orderId) {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId || !templateName || !telefone) {
    return { ok:false, skipped:true, reason:"WhatsApp não configurado." };
  }

  let to = String(telefone || "").replace(/\D/g, "");
  if (to.length === 10 || to.length === 11) to = "55" + to;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: env.WHATSAPP_LANGUAGE_CODE || "pt_BR" },
      components: [{
        type: "body",
        parameters: [
          { type: "text", text: String(nomeCliente || "Cliente") },
          { type: "text", text: String(orderId || "") }
        ]
      }]
    }
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.warn("WhatsApp não enviado:", data);
      return { ok:false, error:data?.error?.message || "Falha no WhatsApp." };
    }
    return { ok:true, data };
  } catch (error) {
    console.warn("Erro ao enviar WhatsApp:", error);
    return { ok:false, error:error.message };
  }
}


async function enviarPushPedido(env, telefone, pedido) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn("PUSH: chaves VAPID ausentes.");
    return {ok:false,error:"Chaves VAPID ausentes."};
  }

  const phone=String(telefone||"").replace(/\D/g,"");
  if(!phone) return {ok:false,error:"Telefone ausente."};

  const rows=await supabaseRequest(
    env,
    `push_subscriptions?select=endpoint,subscription&telefone=eq.${phone}`
  );

  console.log(`PUSH: telefone ${phone}, assinaturas encontradas: ${(rows||[]).length}`);

  if(!(rows||[]).length){
    return {ok:false,error:"Nenhuma assinatura encontrada para este telefone."};
  }

  const entrega=String(pedido?.tipo||"").trim().toLowerCase()==="entrega";
  const payload=JSON.stringify({
    title:"Beach Burguer",
    body:entrega ? "🛵 Seu pedido está a caminho!" : "🍔 Seu pedido está pronto!",
    url:"/?meus-pedidos=1",
    tag:`pedido-${pedido?.id||""}-pronto`
  });

  let enviados=0;
  let erros=[];

  for(const row of rows||[]){
    try{
      const result = await sendNotification(row.subscription, payload, {
        vapidDetails: {
          subject: env.VAPID_SUBJECT || "mailto:contato@beachburguer.local",
          publicKey: env.VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY
        },
        TTL: 120,
        urgency: "high",
        topic: `pedido-${pedido?.id || "novo"}`.slice(0,32)
      });
      enviados++;
      console.log("PUSH enviado com sucesso:", phone, result?.statusCode || "ok");
    }catch(error){
      const status=Number(error?.statusCode||0);
      const msg=String(error?.message||error);
      console.warn("PUSH falhou:",status,msg);
      erros.push({status,message:msg});

      if(status===404||status===410){
        try{
          await supabaseRequest(
            env,
            `push_subscriptions?endpoint=eq.${encodeURIComponent(row.endpoint)}`,
            {method:"DELETE"}
          );
        }catch{}
      }
    }
  }

  return {ok:enviados>0,enviados,erros};
}


const DEFAULT_OPENING_HOURS={
  "0":{enabled:true,open:"19:00",close:"23:00"},
  "1":{enabled:false,open:"19:00",close:"23:00"},
  "2":{enabled:false,open:"19:00",close:"23:00"},
  "3":{enabled:true,open:"19:00",close:"23:00"},
  "4":{enabled:true,open:"19:00",close:"23:00"},
  "5":{enabled:true,open:"19:00",close:"23:00"},
  "6":{enabled:true,open:"19:00",close:"23:00"}
};

function horarioSaoPaulo(){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hourCycle:"h23",weekday:"short"
  }).formatToParts(new Date());
  const obj=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const map={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
  return {
    date:`${obj.year}-${obj.month}-${obj.day}`,
    day:map[obj.weekday],
    time:`${obj.hour}:${obj.minute}`
  };
}
function minutos(h){const [a,b]=String(h||"00:00").split(":").map(Number);return a*60+b}
function proximaAbertura(hours, agora){
  const nomes=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
  const atual=minutos(agora.time);
  for(let offset=0;offset<=7;offset++){
    const dia=(agora.day+offset)%7;
    const cfg=hours[String(dia)]||DEFAULT_OPENING_HOURS[String(dia)];
    if(!cfg?.enabled||!cfg.open)continue;
    if(offset===0 && minutos(cfg.open)<=atual)continue;
    return {day:dia,day_name:nomes[dia],time:String(cfg.open),days_ahead:offset};
  }
  return null;
}

function calcularStatusLoja(state){
  const agora=horarioSaoPaulo();
  let hours=state?.opening_hours||DEFAULT_OPENING_HOURS;
  if(typeof hours==="string"){try{hours=JSON.parse(hours)}catch{hours=DEFAULT_OPENING_HOURS}}
  const manualDate=state?.manual_date||null;
  const manualMode=(manualDate===agora.date)?String(state?.manual_mode||"auto"):"auto";
  const next_open=proximaAbertura(hours,agora);

  if(manualMode==="closed")return {mode:"closed",open:false,pickup_only:false,now:agora,hours,next_open,manual_date:state?.manual_date||null};
  if(manualMode==="pickup_only")return {mode:"pickup_only",open:true,pickup_only:true,now:agora,hours,next_open,manual_date:state?.manual_date||null};
  if(manualMode==="open")return {mode:"open",open:true,pickup_only:false,now:agora,hours,next_open,manual_date:state?.manual_date||null};

  const cfg=hours[String(agora.day)]||DEFAULT_OPENING_HOURS[String(agora.day)];
  if(!cfg?.enabled)return {mode:"closed",open:false,pickup_only:false,now:agora,hours,next_open,today:cfg,manual_date:state?.manual_date||null};

  const atual=minutos(agora.time),ini=minutos(cfg.open),fim=minutos(cfg.close);

  // Durante o horário normal: aberto.
  const dentroHorario=fim>ini ? (atual>=ini&&atual<fim) : (atual>=ini||atual<fim);
  if(dentroHorario){
    return {mode:"open",open:true,pickup_only:false,now:agora,hours,next_open,today:cfg,manual_date:state?.manual_date||null};
  }

  // Ao atingir o horário de fechamento, não fecha imediatamente:
  // aguarda a decisão da página Garçom.
  const passouFechamento=fim>ini ? (atual>=fim) : (atual>=fim&&atual<ini);
  if(passouFechamento){
    return {mode:"awaiting_close_decision",open:true,pickup_only:false,now:agora,hours,next_open,today:cfg,manual_date:state?.manual_date||null};
  }

  return {mode:"closed",open:false,pickup_only:false,now:agora,hours,next_open,today:cfg,manual_date:state?.manual_date||null};
}
async function obterEstadoLoja(env){
  try{
    const rows=await supabaseRequest(env,"store_state?select=id,shift_started_at,opening_hours,manual_mode,manual_date,rain_mode,updated_at&id=eq.1&limit=1");
    const row=rows?.[0]||{};
    return {...row,rain_mode:row?.rain_mode===true,...calcularStatusLoja(row)};
  }catch{
    return {rain_mode:false,...calcularStatusLoja({})};
  }
}

async function obterInicioExpediente(env){
  try{
    const rows=await supabaseRequest(
      env,
      "store_state?select=shift_started_at&id=eq.1&limit=1"
    );
    return rows?.[0]?.shift_started_at || null;
  }catch{
    return null;
  }
}

export async function onRequestOptions() {
  return json({}, 204);
}

export async function onRequestGet({ request, env }) {
  try {
    const url=new URL(request.url);

    // V31.7: endpoint público e independente para o menu de categorias do Cliente.
    // Não depende da consulta de produtos; assim uma categoria recém-criada aparece
    // mesmo quando ainda não possui nenhum produto.
    if(url.searchParams.get("categories_only")==="1"){
      const categories=await supabaseRequest(
        env,
        "categories?select=id,name,rule,sort_order,active&active=eq.true&order=sort_order.asc,id.asc"
      );
      return json({ok:true,categories:categories||[]});
    }

    const customerPhone=String(url.searchParams.get("customer_phone")||"").replace(/\D/g,"");
    if(customerPhone){
      if(customerPhone.length!==10&&customerPhone.length!==11)return json({ok:false,error:"Telefone inválido."},400);
      const rows=await supabaseRequest(env,`customers?select=telefone,nome,endereco,numero,sem_numero,bairro,referencia,updated_at&telefone=eq.${customerPhone}&limit=1`);
      let customer=Array.isArray(rows)?(rows[0]||null):null;

      // V30.2: clientes que já fizeram pedido (inclusive hoje) precisam ser
      // reconhecidos imediatamente, mesmo que ainda não exista linha em customers.
      // O último pedido do telefone vira o fallback do cadastro.
      let latestOrder=null;
      try{
        const latest=await supabaseRequest(
          env,
          `orders?select=id,cliente,telefone,endereco,bairro,referencia,created_at,tipo&telefone=eq.${customerPhone}&order=created_at.desc&limit=1`
        );
        latestOrder=Array.isArray(latest)?(latest[0]||null):null;
      }catch(e){
        console.warn("Último pedido do cliente:",e?.message||e);
      }

      const separarEnderecoNumero=v=>{
        const s=String(v||"").trim();
        if(!s)return {endereco:"",numero:"",sem_numero:false};
        if(/,\s*s\/?n$/i.test(s)){
          return {endereco:s.replace(/,\s*s\/?n$/i,"").trim(),numero:"",sem_numero:true};
        }
        const m=s.match(/^(.*?),\s*(?:n[ºo°]?\s*)?([^,]+)$/i);
        if(m){
          return {endereco:String(m[1]||"").trim(),numero:String(m[2]||"").trim(),sem_numero:false};
        }
        return {endereco:s,numero:"",sem_numero:false};
      };

      if(!customer && latestOrder){
        const pe=separarEnderecoNumero(latestOrder.endereco);
        customer={
          telefone:customerPhone,
          nome:String(latestOrder.cliente||"").trim(),
          endereco:pe.endereco,
          numero:pe.numero,
          sem_numero:pe.sem_numero,
          bairro:String(latestOrder.bairro||"").trim(),
          referencia:String(latestOrder.referencia||"").trim(),
          updated_at:latestOrder.created_at
        };
      }else if(customer && latestOrder){
        // Se o cadastro antigo estiver incompleto, completa com o último pedido.
        const pe=separarEnderecoNumero(latestOrder.endereco);
        if(!String(customer.nome||"").trim())customer.nome=String(latestOrder.cliente||"").trim();
        if(!String(customer.endereco||"").trim())customer.endereco=pe.endereco;
        if(!String(customer.numero||"").trim() && pe.numero)customer.numero=pe.numero;
        if(!customer.sem_numero && pe.sem_numero)customer.sem_numero=true;
        if(!String(customer.bairro||"").trim())customer.bairro=String(latestOrder.bairro||"").trim();
        if(!String(customer.referencia||"").trim())customer.referencia=String(latestOrder.referencia||"").trim();
      }

      let addresses=[];
      try{
        addresses=await supabaseRequest(
          env,
          `customer_addresses?select=id,telefone,endereco,numero,sem_numero,bairro,referencia,updated_at&telefone=eq.${customerPhone}&order=updated_at.desc`
        ) || [];
      }catch(e){
        console.warn("customer_addresses ainda não disponível:",e?.message||e);
      }

      // Compatibilidade imediata: pedidos antigos/feitos hoje também entram na seleção,
      // mesmo antes de terem sido migrados para customer_addresses.
      try{
        const historico=await supabaseRequest(
          env,
          `orders?select=cliente,telefone,endereco,bairro,referencia,created_at,tipo&telefone=eq.${customerPhone}&tipo=eq.Entrega&order=created_at.desc&limit=50`
        ) || [];
        if(!customer && historico.length){
          const ultimo=historico[0];
          const pe=separarEnderecoNumero(ultimo.endereco);
          customer={
            telefone:customerPhone,
            nome:String(ultimo.cliente||"").trim(),
            endereco:pe.endereco,
            numero:pe.numero,
            sem_numero:pe.sem_numero,
            bairro:String(ultimo.bairro||"").trim(),
            referencia:String(ultimo.referencia||"").trim(),
            updated_at:ultimo.created_at
          };
        }
        const normal=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/\s+/g," ");
        const parseEnderecoCompleto=v=>{
          const s=String(v||"").trim();
          const m=s.match(/^(.*?)(?:,\s*(?:n[ºo°]?\s*)?([^,]+)|,\s*s\/?n)$/i);
          if(!m)return {endereco:s,numero:"",sem_numero:false};
          const sem=/,\s*s\/?n$/i.test(s);
          return {endereco:String(m[1]||s).trim(),numero:sem?"":String(m[2]||"").trim(),sem_numero:sem};
        };
        for(const ped of historico){
          const p=parseEnderecoCompleto(ped.endereco);
          const candidato={endereco:p.endereco,numero:p.numero,sem_numero:p.sem_numero,bairro:ped.bairro||"",referencia:ped.referencia||"",updated_at:ped.created_at};
          const key=normal(candidato.endereco)+"|"+normal(candidato.bairro);
          const existente=addresses.find(a=>normal(a.endereco)+"|"+normal(a.bairro)===key);
          if(!existente)addresses.push(candidato);
          else if(!String(existente.numero||"").trim() && candidato.numero){
            existente.numero=candidato.numero; existente.sem_numero=false;
          }
        }
      }catch(e){console.warn("Histórico de endereços:",e?.message||e);}

      if(customer && customer.endereco){
        const normal=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/\s+/g," ");
        const key=normal(customer.endereco)+"|"+normal(customer.bairro);
        if(!addresses.some(a=>normal(a.endereco)+"|"+normal(a.bairro)===key)){
          addresses.unshift({
            endereco:customer.endereco,numero:customer.numero||"",sem_numero:Boolean(customer.sem_numero),
            bairro:customer.bairro||"",referencia:customer.referencia||"",updated_at:customer.updated_at
          });
        }
      }

      return json({ok:true,customer,addresses});
    }
    const phone=String(url.searchParams.get("phone")||"").replace(/\D/g,"");
    if(phone){
      if(phone.length!==10&&phone.length!==11){
        return json({ok:false,error:"Telefone inválido."},400);
      }
      const orders=await supabaseRequest(
        env,
        `orders?select=id,created_at,status,cliente,telefone,tipo,itens,total&telefone=eq.${phone}&order=created_at.desc&limit=30`
      );
      return json({ok:true,orders:orders||[]});
    }
    // Público: catálogo completo para cliente e garçom.
    try {
      const catalog = await supabaseRequest(
        env,
        "products?select=id,category,name,description,price,active,available,sort_order,allows_addons&order=sort_order.asc,id.asc"
      );
      const store=await obterEstadoLoja(env);
      const categories=await supabaseRequest(env,"categories?select=id,name,rule,sort_order,active&active=eq.true&order=sort_order.asc,id.asc");
      let addons=[];
      try{ addons=await supabaseRequest(env,"addons?select=id,name,price,active,sort_order&active=eq.true&order=sort_order.asc,id.asc"); }catch(e){ console.warn("Adicionais ainda não migrados:",e?.message||e); }
      return json({ ok:true, catalog:catalog || [], categories:categories||[], addons:addons||[], products:(catalog || []).map(p=>({product_id:p.id,available:p.available})), store });
    } catch {
      // Compatibilidade caso a migração V8.24 ainda não tenha sido executada.
      const products = await supabaseRequest(
        env,
        "product_availability?select=product_id,available,updated_at&order=product_id.asc"
      );
      const store=await obterEstadoLoja(env);
      return json({ ok:true, products:products || [], store });
    }
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro interno." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const action = body.action || "create";

    if (action === "create") {
      const isGarcom = String(body.origem || "").toLowerCase() === "garcom";
      const isBia = String(body.origem || "").toLowerCase() === "bia";
      if(!isGarcom){
        const store=await obterEstadoLoja(env);
        if(!store.open){
          return json({ok:false,error:"A loja está fechada no momento. Consulte o horário de funcionamento."},403);
        }
        if(store.pickup_only && String(body.tipo)!=="Retirada"){
          return json({ok:false,error:"Neste momento estamos aceitando pedidos somente para retirada no local."},403);
        }
        if(store.rain_mode===true && String(body.tipo)==="Entrega"){
          const localChuva=String(body.localidade||body.bairro||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
          if(localChuva!=="atafona") return json({ok:false,error:"Devido à chuva, estamos aceitando entrega somente para Atafona. Para São João da Barra e Chapéu do Sol, escolha retirada no local."},403);
        }
      }
      const required = isGarcom ? ["cliente","itens","total","pagamento","tipo"] : ["cliente","telefone","itens","total","pagamento","tipo"];
      for (const field of required) {
        if (body[field] === undefined || body[field] === "" || body[field] === null) {
          return json({ ok:false, error:`Campo obrigatório: ${field}` }, 400);
        }
      }

      const telefone = String(body.telefone || "").replace(/\D/g, "");
      if (!isGarcom && telefone.length !== 10 && telefone.length !== 11) {
        return json({ ok:false, error:"Telefone deve conter DDD." }, 400);
      }

      if (!Array.isArray(body.itens) || !body.itens.length) {
        return json({ ok:false, error:"Adicione pelo menos um produto ao pedido." }, 400);
      }

      let categoriasRegra={};
      try{
        const cats=await supabaseRequest(env,"categories?select=name,rule&active=eq.true");
        categoriasRegra=Object.fromEntries((cats||[]).map(c=>[String(c.name).toLowerCase(),c.rule]));
      }catch{}
      const temLanche = body.itens.some(item => {
        const cat=String(item?.categoria||"").trim().toLowerCase();
        const regra=categoriasRegra[cat] || (["bebidas","doces"].includes(cat)?"bebidas":"artesanais");
        return cat && regra==="artesanais";
      });

      if (!isGarcom && !temLanche) {
        return json({
          ok:false,
          error:"Para finalizar o pedido, é obrigatório escolher pelo menos 1 lanche. Não é permitido pedir somente bebidas e/ou doces."
        }, 400);
      }

      let pixPayment = null;
      if (String(body.pagamento) === "Pix") {
        const verified = await verifyApprovedPix(env, body.pix_payment_id, body.total);
        if (!verified.ok) return json({ ok:false, error:verified.error }, 400);
        pixPayment = verified.payment;

        // Idempotência: webhook/polling podem já ter criado o pedido deste Pix.
        const existingPixOrder = await supabaseRequest(
          env,
          `orders?select=*&pix_payment_id=eq.${encodeURIComponent(String(pixPayment.id))}&limit=1`
        );
        if (Array.isArray(existingPixOrder) && existingPixOrder[0]) {
          return json({ ok:true, order:existingPixOrder[0], existing:true });
        }
      }

      const order = {
        status:"novo",
        printed:false,
        cliente:String(body.cliente).trim(),
        telefone,
        endereco:String(body.endereco || "").trim(),
        bairro:String(body.bairro || "").trim(),
        referencia:String(body.referencia || "").trim(),
        localidade:String(body.localidade || "").trim(),
        tipo:String(body.tipo),
        pagamento:String(body.pagamento),
        troco:String(body.troco || "").trim(),
        observacoes:String(body.observacoes || "").trim(),
        itens:body.itens,
        subtotal:Number(body.subtotal || 0),
        entrega:Number(body.entrega || 0),
        total:Number(body.total || 0),
        pix_payment_id:pixPayment ? String(pixPayment.id) : null,
        pix_status:pixPayment ? String(pixPayment.status) : null,
        origem:isGarcom ? "garcom" : (String(body.origem||"").toLowerCase()==="bia" ? "bia" : "cliente")
      };

      const inserted = await supabaseRequest(
        env,
        "orders?select=*",
        {
          method:"POST",
          headers:{ Prefer:"return=representation" },
          body:JSON.stringify(order)
        }
      );
      const saved = Array.isArray(inserted) ? inserted[0] : inserted;

      // Pedido do cliente: tenta enviar confirmação automática pelo WhatsApp.
      // A falha do WhatsApp nunca impede o pedido de ser criado.
      if (!isGarcom && !isBia && telefone) {
        await sendWhatsAppTemplate(
          env,
          telefone,
          env.WHATSAPP_TEMPLATE_PEDIDO_ACEITO || "bb_pedido_aceito",
          order.cliente,
          saved?.id
        );
      }

      if (!isGarcom && telefone) {
        const customer = {
          telefone,
          nome:order.cliente,
          endereco:String(body.endereco_base || order.endereco).trim(),
          numero:String(body.numero || "").trim(),
          sem_numero:Boolean(body.sem_numero),
          bairro:order.bairro,
          referencia:order.referencia,
          updated_at:new Date().toISOString()
        };

        await supabaseRequest(
          env,
          "customers?on_conflict=telefone",
          {
            method:"POST",
            headers:{ Prefer:"resolution=merge-duplicates,return=minimal" },
            body:JSON.stringify(customer)
          }
        );

        // V30: histórico permanente de endereços. Rua + localidade identificam o endereço.
        // Se antes faltava número, informar o número atualiza o mesmo registro em vez de duplicar.
        if(String(body.tipo)==="Entrega" && customer.endereco && customer.bairro){
          const normal=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/\s+/g," ");
          const addressKey=normal(customer.endereco)+"|"+normal(customer.bairro);
          try{
            await supabaseRequest(
              env,
              "customer_addresses?on_conflict=telefone,address_key",
              {
                method:"POST",
                headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
                body:JSON.stringify({
                  telefone,
                  address_key:addressKey,
                  endereco:customer.endereco,
                  numero:customer.numero,
                  sem_numero:customer.sem_numero,
                  bairro:customer.bairro,
                  referencia:customer.referencia,
                  updated_at:new Date().toISOString()
                })
              }
            );
          }catch(e){console.warn("Não foi possível salvar histórico de endereço:",e?.message||e);}
        }
      }


      return json({ ok:true, order:saved });
    }


    if (action === "get_store_config") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const store=await obterEstadoLoja(env);
      return json({ok:true,store});
    }

    if (action === "save_opening_hours") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const hours=body.opening_hours;
      if(!hours||typeof hours!=="object")return json({ok:false,error:"Horários inválidos."},400);
      const agora=new Date().toISOString();
      const sp=horarioSaoPaulo();
      await supabaseRequest(env,"store_state?on_conflict=id",{
        method:"POST",
        headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
        body:JSON.stringify({
          id:1,
          opening_hours:hours,
          manual_mode:"auto",
          manual_date:sp.date,
          updated_at:agora
        })
      });
      return json({ok:true,store:await obterEstadoLoja(env)});
    }

    if (action === "set_store_mode") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const mode=String(body.mode||"auto");
      if(!["auto","open","closed","pickup_only"].includes(mode))return json({ok:false,error:"Modo inválido."},400);
      const sp=horarioSaoPaulo();
      const agora=new Date().toISOString();
      await supabaseRequest(env,"store_state?on_conflict=id",{
        method:"POST",
        headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
        body:JSON.stringify({id:1,manual_mode:mode,manual_date:sp.date,updated_at:agora})
      });
      return json({ok:true,store:await obterEstadoLoja(env)});
    }

    if (action === "set_rain_mode") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const enabled=body.enabled===true;
      await supabaseRequest(env,"store_state?on_conflict=id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:1,rain_mode:enabled,updated_at:new Date().toISOString()})});
      return json({ok:true,store:await obterEstadoLoja(env)});
    }

    if (action === "list_orders") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const limit = Math.min(Number(body.limit || 100), 300);
      const inicioExpediente=await obterInicioExpediente(env);
      const filtroInicio=inicioExpediente
        ? `&created_at=gte.${encodeURIComponent(inicioExpediente)}`
        : "";
      // V31.13: a Loja deve exibir somente os pedidos do expediente atual.
      // Não buscamos pedidos ativos de expedientes antigos, pois eles pertencem
      // apenas ao histórico/relatórios e não podem reaparecer na fila da Loja.
      const orders = await supabaseRequest(
        env,
        `orders?select=*&order=created_at.desc&limit=${limit}${filtroInicio}`
      );
      return json({ ok:true, orders:orders || [], shift_started_at:inicioExpediente });
    }



    if (action === "finalize_shift") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);

      const inicioExpediente=await obterInicioExpediente(env);
      const agora=new Date().toISOString();

      // Ao encerrar, qualquer pedido ainda aberto é considerado concluído.
      // Isso evita que pedidos esquecidos em Novo/Preparo/Pronto fiquem fora
      // dos relatórios de vendas concluídas.
      let filtroPendentes="status=in.(novo,preparo,pronto)";
      if(inicioExpediente){
        filtroPendentes+=`&created_at=gte.${encodeURIComponent(inicioExpediente)}`;
      }

      await supabaseRequest(
        env,
        `orders?${filtroPendentes}`,
        {
          method:"PATCH",
          headers:{Prefer:"return=minimal"},
          body:JSON.stringify({status:"entregue"})
        }
      );

      await supabaseRequest(
        env,
        "store_state?on_conflict=id",
        {
          method:"POST",
          headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
          body:JSON.stringify({
            id:1,
            shift_started_at:agora,
            updated_at:agora
          })
        }
      );

      return json({
        ok:true,
        shift_started_at:agora,
        message:"Expediente finalizado. Pedidos pendentes foram marcados como concluídos e a fila foi zerada."
      });
    }

    if (action === "report_orders") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);

      const from=String(body.from||"").trim();
      const to=String(body.to||"").trim();
      if(!from||!to) return json({ok:false,error:"Período inválido."},400);

      const pageSize=1000;
      const maxRows=20000;
      let offset=0;
      let all=[];

      while(offset<maxRows){
        const path=
          `orders?select=id,created_at,status,cliente,telefone,tipo,pagamento,subtotal,entrega,total,itens,origem`+
          `&created_at=gte.${encodeURIComponent(from)}`+
          `&created_at=lte.${encodeURIComponent(to)}`+
          `&order=created_at.asc&limit=${pageSize}&offset=${offset}`;

        const rows=await supabaseRequest(env,path);
        const batch=Array.isArray(rows)?rows:[];
        all.push(...batch);

        if(batch.length<pageSize)break;
        offset+=pageSize;
      }

      return json({
        ok:true,
        orders:all,
        truncated:all.length>=maxRows
      });
    }

    if (action === "list_products") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const catalog = await supabaseRequest(
        env,
        "products?select=id,category,name,description,price,active,available,sort_order,allows_addons&order=sort_order.asc,id.asc"
      );
      const categories=await supabaseRequest(env,"categories?select=id,name,rule,sort_order,active&order=sort_order.asc,id.asc");
      let addons=[];
      try{ addons=await supabaseRequest(env,"addons?select=id,name,price,active,sort_order&order=sort_order.asc,id.asc"); }catch(e){ console.warn("Adicionais ainda não migrados:",e?.message||e); }
      return json({ ok:true, catalog:catalog || [], categories:categories||[], addons:addons||[], products:(catalog || []).map(p=>({product_id:p.id,available:p.available})) });
    }

    if (action === "create_addon") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const name=String(body.name||"").trim();
      const price=Number(body.price||0);
      if(!name || !Number.isFinite(price) || price<0) return json({ok:false,error:"Informe nome e preço válido do adicional."},400);
      const mx=await supabaseRequest(env,"addons?select=sort_order&order=sort_order.desc&limit=1");
      try{
        const rows=await supabaseRequest(env,"addons?select=id,name,price,active,sort_order",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({name,price,active:true,sort_order:Number(mx?.[0]?.sort_order||0)+1,updated_at:new Date().toISOString()})});
        return json({ok:true,addon:Array.isArray(rows)?rows[0]:rows});
      }catch(e){ return json({ok:false,error:/relation.*addons|could not find.*addons/i.test(String(e?.message||e))?"Execute primeiro o SQL ATUALIZAR_V31_18_ADICIONAIS_ADMIN.sql no Supabase.":(e?.message||"Não foi possível cadastrar o adicional.")},400); }
    }

    if (action === "save_addon") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const id=Number(body.id); const name=String(body.name||"").trim(); const price=Number(body.price||0);
      if(!id||!name||!Number.isFinite(price)||price<0) return json({ok:false,error:"Dados do adicional inválidos."},400);
      await supabaseRequest(env,`addons?id=eq.${id}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({name,price,active:body.active!==false,updated_at:new Date().toISOString()})});
      return json({ok:true});
    }

    if (action === "delete_addon") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const id=Number(body.id); if(!id)return json({ok:false,error:"Adicional inválido."},400);
      await supabaseRequest(env,`addons?id=eq.${id}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
      return json({ok:true});
    }

    if (action === "create_product") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const category=String(body.category||"").trim();
      const name=String(body.name||"").trim();
      const description=String(body.description||"").trim();
      const price=Number(body.price||0);
      const allowsAddons=body.allows_addons===true;
      if(!category||!name||price<0) return json({ok:false,error:"Preencha categoria, nome e preço."},400);

      const maxRows=await supabaseRequest(env,"products?select=sort_order&order=sort_order.desc&limit=1");
      const sortOrder=Number(maxRows?.[0]?.sort_order||0)+1;
      const inserted=await supabaseRequest(
        env,
        "products?select=id,category,name,description,price,active,available,sort_order,allows_addons",
        {
          method:"POST",
          headers:{Prefer:"return=representation"},
          body:JSON.stringify({
            category,
            name,
            description,
            price,
            active:true,
            available:true,
            sort_order:sortOrder,
            allows_addons:allowsAddons,
            updated_at:new Date().toISOString()
          })
        }
      );

      const product=Array.isArray(inserted)?inserted[0]:inserted;
      if(!product?.id) return json({ok:false,error:"Produto não foi gravado no banco."},500);

      // Mantém a tabela antiga de disponibilidade sincronizada para compatibilidade.
      await supabaseRequest(
        env,
        "product_availability?on_conflict=product_id",
        {
          method:"POST",
          headers:{Prefer:"resolution=merge-duplicates,return=minimal"},
          body:JSON.stringify({
            product_id:Number(product.id),
            available:true,
            updated_at:new Date().toISOString()
          })
        }
      );

      return json({ok:true,product});
    }

    if (action === "save_catalog") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      if (!Array.isArray(body.products)) return json({ok:false,error:"Lista inválida."},400);
      for (const p of body.products) {
        const id=Number(p.id);
        if(!id) continue;
        await supabaseRequest(env,`products?id=eq.${id}`,{
          method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({
            category:String(p.category||"").trim() || undefined,
            name:String(p.name||"").trim() || undefined,
            description:String(p.description||""),
            price:Number(p.price||0),
            active:p.active!==false,
            available:p.available!==false,
            allows_addons:p.allows_addons===true,
            updated_at:new Date().toISOString()
          })
        });
      }
      return json({ok:true});
    }


    if (action === "create_category") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const name=String(body.name||"").trim();
      const rule=String(body.rule||"artesanais")==="bebidas"?"bebidas":"artesanais";
      if(!name)return json({ok:false,error:"Informe o nome da categoria."},400);
      const mx=await supabaseRequest(env,"categories?select=sort_order&order=sort_order.desc&limit=1");
      const rows=await supabaseRequest(env,"categories?select=id,name,rule,sort_order,active",{
        method:"POST",headers:{Prefer:"return=representation"},
        body:JSON.stringify({name,rule,sort_order:Number(mx?.[0]?.sort_order||0)+1,active:true,updated_at:new Date().toISOString()})
      });
      return json({ok:true,category:rows?.[0]||rows});
    }

    if (action === "save_category") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const id=Number(body.id), name=String(body.name||"").trim();
      const rule=String(body.rule||"artesanais")==="bebidas"?"bebidas":"artesanais";
      if(!id||!name)return json({ok:false,error:"Categoria inválida."},400);
      const current=await supabaseRequest(env,`categories?select=name&id=eq.${id}&limit=1`);
      const oldName=current?.[0]?.name;
      await supabaseRequest(env,`categories?id=eq.${id}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({name,rule,updated_at:new Date().toISOString()})});
      if(oldName && oldName!==name){
        await supabaseRequest(env,`products?category=eq.${encodeURIComponent(oldName)}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({category:name,updated_at:new Date().toISOString()})});
      }
      return json({ok:true});
    }

    if (action === "delete_category") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const id=Number(body.id);
      const current=await supabaseRequest(env,`categories?select=name&id=eq.${id}&limit=1`);
      const name=current?.[0]?.name;
      if(!name)return json({ok:false,error:"Categoria não encontrada."},404);
      const products=await supabaseRequest(env,`products?select=id&category=eq.${encodeURIComponent(name)}&limit=1`);
      if(products?.length)return json({ok:false,error:"Esta categoria ainda possui produtos. Altere ou exclua os produtos primeiro."},400);
      await supabaseRequest(env,`categories?id=eq.${id}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
      return json({ok:true});
    }

    if (action === "delete_product") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const id=Number(body.id);
      if(!id)return json({ok:false,error:"Produto inválido."},400);
      await supabaseRequest(env,`product_availability?product_id=eq.${id}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
      await supabaseRequest(env,`products?id=eq.${id}`,{method:"DELETE",headers:{Prefer:"return=minimal"}});
      return json({ok:true});
    }

    if (action === "daily_metrics") {
      if (!authorized(request, env)) return json({ok:false,error:"Não autorizado."},401);
      const date=String(body.date||"").trim();
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json({ok:false,error:"Data inválida."},400);
      const visits=await supabaseRequest(env,`client_daily_visits?select=session_id&visit_date=eq.${date}`);
      // Limites UTC que correspondem à meia-noite de Brasília (UTC-3).
      const start=`${date}T03:00:00.000Z`;
      const next=new Date(start); next.setUTCDate(next.getUTCDate()+1);
      const orders=await supabaseRequest(env,
        `orders?select=id&origem=eq.cliente&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(next.toISOString())}`
      );
      const visitantes=(visits||[]).length;
      const pedidos=(orders||[]).length;
      return json({ok:true,date,visitantes,pedidos,conversao:visitantes?Number(((pedidos/visitantes)*100).toFixed(1)):0});
    }

    if (action === "update_products") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      if (!Array.isArray(body.products)) return json({ ok:false, error:"Lista de produtos inválida." }, 400);

      const rows = body.products.map(item => ({
        product_id:Number(item.product_id),
        available:Boolean(item.available),
        updated_at:new Date().toISOString()
      }));

      await supabaseRequest(
        env,
        "product_availability?on_conflict=product_id",
        {
          method:"POST",
          headers:{ Prefer:"resolution=merge-duplicates,return=minimal" },
          body:JSON.stringify(rows)
        }
      );
      return json({ ok:true });
    }


    if (action === "edit_waiter_order") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);
      const id=Number(body.id);
      if(!id) return json({ok:false,error:"Pedido inválido."},400);
      if(!String(body.cliente||"").trim()) return json({ok:false,error:"Informe o nome do cliente."},400);
      if(!Array.isArray(body.itens)||!body.itens.length) return json({ok:false,error:"O pedido precisa ter pelo menos um item."},400);

      const rows=await supabaseRequest(env,`orders?select=id,origem&id=eq.${id}&limit=1`);
      const atual=Array.isArray(rows)?rows[0]:null;
      if(!atual) return json({ok:false,error:"Pedido não encontrado."},404);
      if(String(atual.origem||"")!=="garcom") return json({ok:false,error:"Somente pedidos do garçom podem ser editados nesta tela."},400);

      const alterado={
        cliente:String(body.cliente).trim(),
        localidade:String(body.tipo||"Consumir no local"),
        tipo:String(body.tipo||"Consumir no local"),
        pagamento:String(body.pagamento||"A pagar"),
        troco:String(body.troco||"").trim(),
        observacoes:String(body.observacoes||"").trim(),
        itens:body.itens,
        subtotal:Number(body.subtotal||0),
        entrega:Number(body.entrega||0),
        total:Number(body.total||0),
        printed:false
      };
      const updated=await supabaseRequest(env,`orders?id=eq.${id}&select=*`,{
        method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(alterado)
      });
      return json({ok:true,order:Array.isArray(updated)?updated[0]:updated,reprint:true});
    }

    if (action === "update") {
      if (!authorized(request, env)) return json({ ok:false, error:"Não autorizado." }, 401);

      const id = Number(body.id);
      const beforeRows = await supabaseRequest(
        env,
        `orders?select=id,status,cliente,telefone,origem,tipo&id=eq.${id}&limit=1`
      );
      const before = Array.isArray(beforeRows) ? beforeRows[0] : null;

      const allowed = {};
      if (body.status !== undefined) allowed.status = String(body.status);
      if (body.printed !== undefined) allowed.printed = Boolean(body.printed);

      await supabaseRequest(
        env,
        `orders?id=eq.${id}`,
        {
          method:"PATCH",
          headers:{ Prefer:"return=minimal" },
          body:JSON.stringify(allowed)
        }
      );

      // V8.36: todo clique explícito em "Pronto" tenta enviar a notificação.
      // Isso também permite refazer o envio caso o pedido já estivesse marcado como pronto.
      let pushResult=null;
      if (
        String(body.status || "") === "pronto" &&
        before &&
        String(before.origem || "cliente") !== "garcom" &&
        before.telefone
      ) {
        // WhatsApp permanece opcional; falha nele não bloqueia o Web Push.
        try{
          await sendWhatsAppTemplate(
            env,
            before.telefone,
            env.WHATSAPP_TEMPLATE_PEDIDO_CAMINHO || "bb_pedido_a_caminho",
            before.cliente,
            before.id
          );
        }catch(e){
          console.warn("WhatsApp ignorado:",e?.message||e);
        }

        try{
          pushResult=await enviarPushPedido(env,before.telefone,before);
        }catch(e){
          console.error("Erro geral no PUSH:",e);
          pushResult={ok:false,error:e?.message||String(e)};
        }
      }

      return json({ ok:true, push:pushResult });
    }

    return json({ ok:false, error:"Ação inválida." }, 400);
  } catch (error) {
    console.error(error);
    return json({ ok:false, error:error.message || "Erro interno." }, 500);
  }
}
