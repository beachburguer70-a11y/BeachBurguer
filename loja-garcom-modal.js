(()=>{
  const byId=id=>document.getElementById(id);
  const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const parseMoney=v=>{const s=String(v??'').trim().replace(/\s/g,''); if(!s)return 0; const n=Number(s.includes(',')?s.replace(/\./g,'').replace(',','.'):s); return Number.isFinite(n)?Math.max(0,n):0};
  const storeToken=()=>localStorage.getItem('bb_store_token')||'';
  const WAITER_PRINTER_KEY='bb_garcom_impressora_ativa';
  const waiterPrinterEnabled=()=>localStorage.getItem(WAITER_PRINTER_KEY)!=='0';
  const setWaiterPrinterEnabled=(enabled)=>{localStorage.setItem(WAITER_PRINTER_KEY,enabled?'1':'0');updatePrinterButton();return enabled;};

  let catalog=[], categories=[], addons=[], requiredAddons=[];
  let tipo='', pagamento='', categoria='', pesquisa='', carrinho=[], etapa='tipo';
  let editingUid=null, productModalId=null, sending=false, countdownTimer=null, searchIndex=0;
  let editOrderId=null, editOrderDisplay=null, reviewDraft={cliente:'',endereco:'',observacoes:'',troco:'',entrega:'',desconto:''};

  function inject(){
    if(byId('gmOverlay'))return;
    const wrap=document.createElement('div');
    wrap.innerHTML=`
      <div id="gmOverlay" class="gm-overlay gm-hidden" aria-hidden="true">
        <div class="gm-shell" role="dialog" aria-modal="true" aria-label="Pedido do garçom">
          <div class="gm-head">
            <div><strong>👨‍🍳 Garçom</strong><small id="gmEtapaTitulo"></small></div>
            <div class="gm-head-actions"><button type="button" id="gmPrinterToggle" class="gm-printer-toggle"></button><button type="button" id="gmCancelarTopo" class="gm-x" aria-label="Cancelar pedido">×</button></div>
          </div>
          <div id="gmBody" class="gm-body"></div>
        </div>
      </div>
      <div id="gmProductOverlay" class="gm-overlay gm-hidden" aria-hidden="true">
        <div class="gm-product-box" role="dialog" aria-modal="true">
          <div class="gm-head"><div><strong id="gmProductName">Produto</strong><small id="gmProductPrice"></small></div><button type="button" id="gmProductX" class="gm-x">×</button></div>
          <div class="gm-product-content">
            <p id="gmProductDesc" class="gm-muted"></p>
            <label>Quantidade<input id="gmProductQty" type="number" min="1" step="1" value="1"></label>
            <div id="gmAddonArea"><h3>Adicionais</h3><div id="gmAddonList"></div></div>
            <label>Observação do item<input id="gmProductObs" placeholder="Ex.: sem salada"></label>
            <button id="gmProductConfirm" type="button" class="gm-primary">Adicionar ao pedido</button>
          </div>
        </div>
      </div>
      <div id="gmEditOverlay" class="gm-overlay gm-hidden" aria-hidden="true">
        <div class="gm-edit-box" role="dialog" aria-modal="true" aria-label="Editar pedido do garçom">
          <div class="gm-head"><div><strong>✏️ Editar pedido</strong><small>Pedidos do Garçom</small></div><button type="button" id="gmEditX" class="gm-x">×</button></div>
          <div id="gmEditList" class="gm-edit-list"></div>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    byId('gmOverlay').addEventListener('click',e=>{ if(e.target===byId('gmOverlay')) e.stopPropagation(); });
    byId('gmProductOverlay').addEventListener('click',e=>{ if(e.target===byId('gmProductOverlay')) e.stopPropagation(); });
    byId('gmEditOverlay').addEventListener('click',e=>{ if(e.target===byId('gmEditOverlay')) e.stopPropagation(); });
    byId('gmCancelarTopo').onclick=cancelarFluxo;
    byId('gmPrinterToggle').onclick=()=>setWaiterPrinterEnabled(!waiterPrinterEnabled());
    updatePrinterButton();
    byId('gmProductX').onclick=fecharProduto;
    byId('gmEditX').onclick=()=>byId('gmEditOverlay').classList.add('gm-hidden');
    byId('gmProductConfirm').onclick=salvarProduto;
  }

  function updatePrinterButton(){
    const b=byId('gmPrinterToggle');if(!b)return;
    const on=waiterPrinterEnabled();
    b.textContent=on?'🖨️ Impressora: ATIVADA':'🖨️ Impressora: DESATIVADA';
    b.classList.toggle('off',!on);
    b.title=on?'Pedidos do Garçom serão impressos automaticamente.':'Pedidos do Garçom irão direto para Em preparo, sem impressão.';
  }

  async function apiCatalog(){
    const r=await fetch('/api/orders',{cache:'no-store'}); const d=await r.json();
    if(!r.ok||!d.ok)throw new Error(d.error||'Não foi possível carregar o cardápio.');
    catalog=(d.catalog||[]).filter(p=>p.active!==false).map(p=>({
      id:Number(p.id),categoria:p.category||'Outros',nome:p.name||'',descricao:p.description||'',preco:Number(p.price||0),disponivel:p.available!==false,permiteAdicionais:p.allows_addons===true,adicionalObrigatorio:p.required_addon===true,imagem:''
    }));
    categories=(d.categories||[]).filter(c=>c.active!==false).map(c=>c.name).filter(Boolean);
    if(!categories.length)categories=[...new Set(catalog.map(p=>p.categoria))];
    addons=(d.addons||[]).filter(a=>a.active!==false).map(a=>({nome:a.name||a.nome||'',preco:Number(a.price??a.preco??0)})).filter(a=>a.nome);
    requiredAddons=(d.required_addons||[]).filter(a=>a.active!==false).map(a=>({nome:a.name||a.nome||'',preco:Number(a.price??a.preco??0)})).filter(a=>a.nome);
    categoria=categories[0]||'';
  }

  async function abrir(){
    inject();
    tipo=''; pagamento=''; categoria=''; pesquisa=''; carrinho=[]; etapa='tipo'; editingUid=null; productModalId=null; editOrderId=null; editOrderDisplay=null; reviewDraft={cliente:'',endereco:'',observacoes:'',troco:'',entrega:'',desconto:''};
    byId('gmCancelarTopo').style.display='';
    const o=byId('gmOverlay'); o.classList.remove('gm-hidden'); o.setAttribute('aria-hidden','false'); document.body.classList.add('gm-lock');
    byId('gmBody').innerHTML='<div class="gm-loading">Carregando cardápio...</div>';
    try{await apiCatalog(); render();}catch(e){byId('gmBody').innerHTML=`<div class="gm-error">${esc(e.message)}<br><button class="gm-secondary" id="gmRetry">Tentar novamente</button></div>`; byId('gmRetry').onclick=abrir;}
  }

  function hasDraft(){return carrinho.length>0||!!tipo||!!pagamento}
  function cancelarFluxo(){
    if(hasDraft()&&!confirm('Deseja realmente cancelar este pedido? Os itens adicionados serão perdidos.'))return;
    fecharTudo();
  }
  function fecharTudo(){
    clearInterval(countdownTimer); countdownTimer=null;
    byId('gmProductOverlay')?.classList.add('gm-hidden');
    byId('gmOverlay')?.classList.add('gm-hidden');
    document.body.classList.remove('gm-lock');
    tipo='';pagamento='';carrinho=[];etapa='tipo';editingUid=null;productModalId=null;editOrderId=null;editOrderDisplay=null;reviewDraft={cliente:'',endereco:'',observacoes:'',troco:'',entrega:'',desconto:''};
  }

  function setTitle(t){byId('gmEtapaTitulo').textContent=t?` • ${t}`:''}
  function render(){
    if(etapa==='tipo')renderTipo();
    else if(etapa==='menu')renderMenu();
    else if(etapa==='pagamento')renderPagamento();
    else if(etapa==='revisao')renderRevisao();
    else if(etapa==='sucesso')renderSucesso();
  }

  function renderTipo(){
    setTitle('Tipo do pedido');
    byId('gmBody').innerHTML=`
      <section class="gm-centered">
        <h2>Como será o pedido?</h2>
        <div class="gm-type-grid">
          <button class="gm-type" data-tipo="Consumir no local"><span>🍽️</span><strong>Consumir no local</strong></button>
          <button class="gm-type" data-tipo="Para viagem"><span>🛍️</span><strong>Para viagem</strong></button>
          <button class="gm-type" data-tipo="Entrega"><span>🛵</span><strong>Entrega</strong></button>
        </div>
        <button id="gmCancelStart" class="gm-danger">Cancelar pedido</button>
      </section>`;
    byId('gmCancelStart').onclick=cancelarFluxo;
    byId('gmBody').querySelectorAll('[data-tipo]').forEach(b=>b.onclick=()=>{tipo=b.dataset.tipo;pagamento='';etapa='menu';render()});
  }

  function filteredProducts(){
    const q=pesquisa.trim().toLowerCase();
    return catalog.filter(p=>p.categoria===categoria && (!q||`${p.nome} ${p.descricao}`.toLowerCase().includes(q)));
  }
  function cartSubtotal(){return carrinho.reduce((s,i)=>s+itemTotal(i),0)}
  function itemUnit(i){return Number(i.preco||0)+(i.adicionais||[]).reduce((s,a)=>s+Number(a.preco||0),0)}
  function itemTotal(i){return itemUnit(i)*Number(i.quantidade||1)}
  function desconto(){return parseMoney(byId('gmDiscount')?.value||0)}
  function entrega(){return parseMoney(byId('gmDelivery')?.value||0)}

  function renderMenu(){
    setTitle('Cardápio');
    const products=filteredProducts();
    byId('gmBody').innerHTML=`
      <div class="gm-menu-layout">
        <section class="gm-menu-panel">
          <div class="gm-navrow"><button id="gmBackType" class="gm-secondary">← Voltar</button><div class="gm-choice">${esc(tipo)}</div></div>
          <div class="gm-search-wrap"><input id="gmSearch" class="gm-search" type="search" placeholder="🔎 Pesquisar no cardápio..." value="${esc(pesquisa)}" autocomplete="off"><div id="gmSearchResults" class="gm-search-results gm-hidden"></div></div>
          <div class="gm-tabs">${categories.map(c=>`<button data-cat="${esc(c)}" class="${c===categoria?'active':''}">${esc(c)}</button>`).join('')}</div>
          <div id="gmProducts" class="gm-products">${products.length?products.map(p=>`
            <article class="gm-product ${p.disponivel?'':'soldout'}">
              
              <div><strong>${esc(p.nome)}</strong><small>${esc(p.descricao)}</small><b>${money(p.preco)}</b></div>
              <button class="${p.disponivel?'':'gm-soldout-btn'}" ${p.disponivel?'':'disabled'} data-product="${p.id}">${p.disponivel?'+':'Esgotado'}</button>
            </article>`).join(''):'<p class="gm-muted">Nenhum produto encontrado.</p>'}</div>
        </section>
        <aside class="gm-cart-panel">
          <h2>Seu pedido</h2>
          <div id="gmCartItems">${cartHtml()}</div>
          <div class="gm-total-line"><span>Subtotal</span><strong>${money(cartSubtotal())}</strong></div>
          <button id="gmPaymentBtn" class="gm-primary" ${carrinho.length?'':'disabled'}>Pagamento</button>
        </aside>
      </div>`;
    byId('gmBackType').onclick=()=>{etapa='tipo';render()};
    bindSearch();
    byId('gmBody').querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{categoria=b.dataset.cat;renderMenu()});
    bindProductButtons(); bindCartButtons();
    byId('gmPaymentBtn').onclick=()=>{if(!carrinho.length)return;etapa='pagamento';render()};
    // Mantém o fluxo rápido do garçom: ao abrir/voltar ao cardápio,
    // a pesquisa já fica pronta para digitação sem precisar clicar nela.
    setTimeout(()=>{const input=byId('gmSearch');if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}},0);
  }
  function searchMatches(){
    const q=pesquisa.trim().toLowerCase();
    if(!q)return [];
    return catalog.filter(p=>`${p.nome} ${p.descricao} ${p.categoria}`.toLowerCase().includes(q)).slice(0,12);
  }
  function renderSearchResults(){
    const box=byId('gmSearchResults'); if(!box)return;
    const list=searchMatches();
    if(!pesquisa.trim()){box.innerHTML='';box.classList.add('gm-hidden');return;}
    if(searchIndex>=list.length)searchIndex=0;
    if(!list.length){box.innerHTML='<div class="gm-search-empty">Nenhum item encontrado.</div>';box.classList.remove('gm-hidden');return;}
    box.innerHTML=list.map((p,idx)=>`<button type="button" class="gm-search-result ${idx===searchIndex?'active':''}" data-search-product="${p.id}" ${p.disponivel?'':'disabled'}><span><strong>${esc(p.nome)}</strong><small>${esc(p.categoria)}${p.disponivel?'':' • ESGOTADO'}</small></span><b>${money(p.preco)}</b></button>`).join('');
    box.classList.remove('gm-hidden');
    box.querySelectorAll('[data-search-product]').forEach(b=>b.onclick=()=>{if(b.disabled)return;abrirProduto(Number(b.dataset.searchProduct))});
    box.querySelector('.gm-search-result.active')?.scrollIntoView({block:'nearest'});
  }
  function bindSearch(){
    const input=byId('gmSearch'); if(!input)return;
    input.oninput=e=>{pesquisa=e.target.value||'';searchIndex=0;renderSearchResults()};
    input.onfocus=renderSearchResults;
    input.onkeydown=e=>{
      const list=searchMatches();
      if(e.key==='ArrowDown'&&list.length){e.preventDefault();searchIndex=(searchIndex+1)%list.length;let n=0;while(list[searchIndex]?.disponivel===false&&n<list.length){searchIndex=(searchIndex+1)%list.length;n++}renderSearchResults()}
      else if(e.key==='ArrowUp'&&list.length){e.preventDefault();searchIndex=(searchIndex-1+list.length)%list.length;let n=0;while(list[searchIndex]?.disponivel===false&&n<list.length){searchIndex=(searchIndex-1+list.length)%list.length;n++}renderSearchResults()}
      else if(e.key==='Enter'&&list.length&&pesquisa.trim()){e.preventDefault();const p=list[searchIndex]||list.find(x=>x.disponivel!==false);if(p&&p.disponivel!==false)abrirProduto(Number(p.id))}
      else if(e.key==='Escape'){e.preventDefault();pesquisa='';input.value='';searchIndex=0;renderSearchResults()}
    };
  }
  function renderProductsOnly(){
    const box=byId('gmProducts'); if(!box)return; const products=filteredProducts();
    box.innerHTML=products.length?products.map(p=>`<article class="gm-product ${p.disponivel?'':'soldout'}"><div><strong>${esc(p.nome)}</strong><small>${esc(p.descricao)}</small><b>${money(p.preco)}</b></div><button class="${p.disponivel?'':'gm-soldout-btn'}" ${p.disponivel?'':'disabled'} data-product="${p.id}">${p.disponivel?'+':'Esgotado'}</button></article>`).join(''):'<p class="gm-muted">Nenhum produto encontrado.</p>';
    bindProductButtons();
  }
  function bindProductButtons(){byId('gmProducts')?.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>abrirProduto(Number(b.dataset.product)))}
  function cartHtml(){
    if(!carrinho.length)return '<div class="gm-cart-empty">Nenhum item adicionado.</div>';
    return carrinho.map(i=>`<div class="gm-cart-item"><div><strong>${i.quantidade}x ${esc(i.nome)}</strong><b>${money(itemTotal(i))}</b></div>${(i.adicionais||[]).length?`<small>+ ${(i.adicionais||[]).map(a=>esc(a.nome)).join(', ')}</small>`:''}${i.observacao?`<small>Obs.: ${esc(i.observacao)}</small>`:''}<div class="gm-cart-actions"><button data-edit="${i.uid}">Alterar</button><button class="del" data-del="${i.uid}">Excluir</button></div></div>`).join('');
  }
  function bindCartButtons(){
    byId('gmCartItems')?.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editarItem(b.dataset.edit));
    byId('gmCartItems')?.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{carrinho=carrinho.filter(i=>String(i.uid)!==String(b.dataset.del));renderMenu()});
  }

  function abrirProduto(id){
    const p=catalog.find(x=>x.id===id); if(!p||!p.disponivel)return;
    pesquisa=''; searchIndex=0;
    if(byId('gmSearch'))byId('gmSearch').value='';
    if(byId('gmSearchResults')){byId('gmSearchResults').innerHTML='';byId('gmSearchResults').classList.add('gm-hidden')}
    productModalId=id; editingUid=null;
    preencherProduto(p,null);
  }
  function editarItem(uid){
    const i=carrinho.find(x=>String(x.uid)===String(uid)); if(!i)return;
    const p=catalog.find(x=>x.id===i.id)||{id:i.id,nome:i.nome,descricao:'',preco:i.preco,permiteAdicionais:true};
    productModalId=p.id; editingUid=uid; preencherProduto(p,i);
  }
  function preencherProduto(p,item){
    byId('gmProductName').textContent=p.nome;byId('gmProductPrice').textContent=money(p.preco);byId('gmProductDesc').textContent=p.descricao||'';
    byId('gmProductQty').value=item?.quantidade||1;byId('gmProductObs').value=item?.observacao||'';
    const area=byId('gmAddonArea'); area.style.display=(p.permiteAdicionais===true||p.adicionalObrigatorio===true)?'block':'none';
    const selected=new Set((item?.adicionais||[]).map(a=>a.nome));
    byId('gmAddonList').innerHTML=(p.permiteAdicionais===true?addons.map((a,n)=>`<label class="gm-addon"><span><input type="checkbox" data-addon="${n}" ${selected.has(a.nome)?'checked':''}> ${esc(a.nome)}</span><strong>+ ${money(a.preco)}</strong></label>`).join(''):'')+(p.adicionalObrigatorio===true?`<h4 style="margin:12px 0 6px">Escolha obrigatória</h4>`+requiredAddons.map((a,n)=>`<label class="gm-addon"><span><input type="radio" name="gm-required-addon" data-required-addon="${n}" ${selected.has(a.nome)?'checked':''}> ${esc(a.nome)}</span><strong>${Number(a.preco||0)>0?'+ '+money(a.preco):money(0)}</strong></label>`).join(''):'');
    byId('gmProductConfirm').textContent=item?'Salvar alteração':'Adicionar ao pedido';
    byId('gmProductOverlay').classList.remove('gm-hidden');
  }
  function fecharProduto(){byId('gmProductOverlay').classList.add('gm-hidden');editingUid=null;productModalId=null}
  function produtoAberto(){const o=byId('gmProductOverlay');return !!o&&!o.classList.contains('gm-hidden')}
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||!produtoAberto())return;
    // Shift+Enter continua disponível para quebrar linha na observação.
    if(e.shiftKey&&e.target?.tagName==='TEXTAREA')return;
    e.preventDefault();
    e.stopPropagation();
    salvarProduto();
  },true);
  function salvarProduto(){
    const p=catalog.find(x=>x.id===productModalId);if(!p)return;
    const qtd=Math.max(1,Math.floor(Number(byId('gmProductQty').value)||1));
    const ad=[...byId('gmAddonList').querySelectorAll('[data-addon]:checked')].map(c=>addons[Number(c.dataset.addon)]).filter(Boolean);
    const req=byId('gmAddonList').querySelector('[data-required-addon]:checked');
    if(p.adicionalObrigatorio===true&&!req){alert('Escolha uma opção obrigatória antes de adicionar este item.');return;}
    if(req)ad.push(requiredAddons[Number(req.dataset.requiredAddon)]);
    const item={uid:editingUid||`${Date.now()}-${Math.random()}`,id:p.id,nome:p.nome,categoria:p.categoria,preco:p.preco,quantidade:qtd,adicionais:ad,observacao:byId('gmProductObs').value.trim()};
    if(editingUid){const idx=carrinho.findIndex(x=>String(x.uid)===String(editingUid));if(idx>=0)carrinho[idx]=item}else carrinho.push(item);
    fecharProduto();renderMenu();
  }

  function renderPagamento(){
    setTitle('Pagamento');
    const delivery=tipo==='Entrega';
    const opts=delivery?[['Dinheiro','💵'],['Cartão','💳'],['Pago','✅']]:[['A pagar','⏳'],['Pago','✅']];
    byId('gmBody').innerHTML=`<section class="gm-stepbox"><button id="gmBackMenu" class="gm-secondary">← Voltar</button><h2>Forma de pagamento</h2><p class="gm-muted">${esc(tipo)}</p><div class="gm-pay-grid">${opts.map(([v,ic])=>`<button data-pay="${v}" class="${pagamento===v?'active':''}"><span>${ic}</span><strong>${v}</strong></button>`).join('')}</div></section>`;
    byId('gmBackMenu').onclick=()=>{etapa='menu';render()};
    byId('gmBody').querySelectorAll('[data-pay]').forEach(b=>b.onclick=()=>{pagamento=b.dataset.pay;etapa='revisao';render()});
  }

  function moneyInputValue(v){const n=Number(v||0);return n>0?n.toFixed(2).replace('.',','):''}
  function captureReviewDraft(){
    if(byId('gmClient'))reviewDraft.cliente=byId('gmClient').value;
    if(byId('gmAddress'))reviewDraft.endereco=byId('gmAddress').value;
    if(byId('gmNotes'))reviewDraft.observacoes=byId('gmNotes').value;
    if(byId('gmChange'))reviewDraft.troco=byId('gmChange').value;
    if(byId('gmDelivery'))reviewDraft.entrega=byId('gmDelivery').value;
    if(byId('gmDiscount'))reviewDraft.desconto=byId('gmDiscount').value;
  }
  function bindReviewDraft(){
    ['gmClient','gmAddress','gmNotes','gmChange','gmDelivery','gmDiscount'].forEach(id=>{const el=byId(id);if(!el)return;el.addEventListener('input',()=>{captureReviewDraft();if(id==='gmDelivery'||id==='gmDiscount')updateReviewTotal()})});
  }

  function renderRevisao(){
    setTitle('Revisão do pedido');
    const delivery=tipo==='Entrega';
    byId('gmBody').innerHTML=`
      <div class="gm-review">
        <section class="gm-review-summary">
          <button id="gmBackPay" class="gm-secondary">← Voltar</button>
          <h2>Itens do pedido</h2>
          ${carrinho.map(i=>`<div class="gm-review-item"><span>${i.quantidade}x ${esc(i.nome)}</span><strong>${money(itemTotal(i))}</strong></div>`).join('')}
          <div class="gm-review-totals"><div><span>Subtotal</span><strong>${money(cartSubtotal())}</strong></div><div><span>Pagamento</span><strong>${esc(pagamento)}</strong></div><div><span>Total</span><strong id="gmReviewTotal">${money(cartSubtotal())}</strong></div></div>
        </section>
        <section class="gm-review-form">
          <label>Cliente<input id="gmClient" placeholder="Digite o nome do cliente" value="${esc(reviewDraft.cliente)}"></label>
          ${delivery?`<label>Endereço <small>(opcional)</small><input id="gmAddress" placeholder="Digite o endereço" value="${esc(reviewDraft.endereco)}"></label>`:''}
          <label>Observações gerais<textarea id="gmNotes" placeholder="Ex.: mesa 4, sem talher, separar bebidas...">${esc(reviewDraft.observacoes)}</textarea></label>
          ${delivery&&pagamento==='Dinheiro'?`<label>Troco para quanto? <small>(opcional)</small><input id="gmChange" inputmode="decimal" placeholder="Ex.: 50,00" value="${esc(reviewDraft.troco)}"></label>`:''}
          <div class="gm-money-grid"><label>Entrega R$<input id="gmDelivery" inputmode="decimal" placeholder="0,00" value="${esc(reviewDraft.entrega)}"></label><label>Desconto R$<input id="gmDiscount" inputmode="decimal" placeholder="0,00" value="${esc(reviewDraft.desconto)}"></label></div>
          <div class="gm-final-total"><span>Total final</span><strong id="gmFinalTotal">${money(cartSubtotal())}</strong></div>
          <button id="gmFinish" class="gm-primary gm-big">${editOrderId?'💾 Salvar alterações':'✅ Finalizar pedido'}</button>
        </section>
      </div>`;
    byId('gmBackPay').onclick=()=>{captureReviewDraft();etapa='pagamento';render()};
    bindReviewDraft();
    updateReviewTotal();
    byId('gmFinish').onclick=enviar;
  }
  function currentTotal(){return Math.max(0,cartSubtotal()+entrega()-desconto())}
  function updateReviewTotal(){const t=money(currentTotal());if(byId('gmReviewTotal'))byId('gmReviewTotal').textContent=t;if(byId('gmFinalTotal'))byId('gmFinalTotal').textContent=t}

  async function enviar(){
    if(sending)return; sending=true; const btn=byId('gmFinish');btn.disabled=true;btn.textContent=editOrderId?'Salvando...':'Enviando...';
    try{
      captureReviewDraft();
      const body={action:editOrderId?'edit_waiter_order':'create',id:editOrderId||undefined,cliente:reviewDraft.cliente.trim(),telefone:'',endereco:tipo==='Entrega'?reviewDraft.endereco.trim():'',bairro:'',referencia:'',localidade:tipo,tipo,pagamento,troco:(tipo==='Entrega'&&pagamento==='Dinheiro')?reviewDraft.troco.trim():'',observacoes:reviewDraft.observacoes.trim(),itens:carrinho.map(i=>({id:i.id,nome:i.nome,categoria:i.categoria,quantidade:i.quantidade,preco:i.preco,adicionais:i.adicionais,observacao:i.observacao,total:itemTotal(i)})),subtotal:cartSubtotal(),entrega:entrega(),total:currentTotal(),discount_amount:desconto(),prize_awarded:false,origem:'garcom',waiter_print_enabled:waiterPrinterEnabled()};
      const headers={'Content-Type':'application/json'};if(editOrderId)headers['X-Store-Token']=storeToken();
      const r=await fetch('/api/orders',{method:'POST',headers,body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'Não foi possível salvar o pedido.');
      window.__gmLastOrder=d.order||{};
      if(editOrderId){
        const numero=d.order?.display_number||editOrderDisplay||d.order?.id||editOrderId;
        if(waiterPrinterEnabled()){
          const reimprimir=confirm(`Pedido G#${numero} atualizado com sucesso.\n\nDeseja reimprimir o pedido?`);
          if(reimprimir){
            const rr=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json','X-Store-Token':storeToken()},body:JSON.stringify({action:'update',id:editOrderId,printed:false})});
            const rd=await rr.json();if(!rr.ok||!rd.ok)alert('Pedido salvo, mas não foi possível enviar para reimpressão.');
          }
        }else{
          alert(`Pedido G#${numero} atualizado com sucesso.\n\nA impressora do Garçom está DESATIVADA, então não foi enviado para reimpressão.`);
        }
        fecharTudo();
        if(typeof window.carregarPedidos==='function')window.carregarPedidos().catch(()=>{});
        return;
      }
      etapa='sucesso';render();
      if(typeof window.carregarPedidos==='function')window.carregarPedidos().catch(()=>{});
    }catch(e){alert(e.message);btn.disabled=false;btn.textContent=editOrderId?'💾 Salvar alterações':'✅ Finalizar pedido'}finally{sending=false}
  }

  function renderSucesso(){
    setTitle('Pedido finalizado');
    const o=window.__gmLastOrder||{}; const num=o.display_number||o.id||'';
    byId('gmCancelarTopo').style.display='none';
    byId('gmBody').innerHTML=`<section class="gm-success"><div class="gm-check">✓</div><h2>Pedido finalizado com sucesso!</h2><div class="gm-order-number">Pedido G#${esc(num)}</div><p>Voltando para a página Loja em <strong id="gmCount">5</strong> segundos...</p></section>`;
    let n=5;clearInterval(countdownTimer);countdownTimer=setInterval(()=>{n--;if(byId('gmCount'))byId('gmCount').textContent=String(Math.max(0,n));if(n<=0){clearInterval(countdownTimer);byId('gmCancelarTopo').style.display='';fecharTudo();if(typeof window.carregarPedidos==='function')window.carregarPedidos().catch(()=>{})}},1000);
  }

  async function abrirEditorPedidos(){
    inject();
    const overlay=byId('gmEditOverlay');const list=byId('gmEditList');
    overlay.classList.remove('gm-hidden');list.innerHTML='<div class="gm-loading">Carregando pedidos do Garçom...</div>';
    try{
      const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json','X-Store-Token':storeToken()},body:JSON.stringify({action:'list_orders',limit:300}),cache:'no-store'});
      const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||'Não foi possível carregar os pedidos.');
      const orders=(d.orders||[]).filter(o=>String(o.origem||'')==='garcom');
      if(!orders.length){list.innerHTML='<div class="gm-edit-empty">Nenhum pedido do Garçom neste expediente.</div>';return;}
      list.innerHTML=orders.map(o=>`<button type="button" class="gm-edit-order" data-edit-order="${Number(o.id)}"><span><strong>G#${esc(o.display_number||o.id)}</strong><small>${esc(o.cliente||'Sem nome')} • ${esc(o.tipo||'')} • ${esc(String(o.status||'').toUpperCase())}</small></span><b>${money(o.total)}</b></button>`).join('');
      list.querySelectorAll('[data-edit-order]').forEach(b=>b.onclick=()=>{const o=orders.find(x=>Number(x.id)===Number(b.dataset.editOrder));if(o)carregarPedidoParaEdicao(o)});
    }catch(e){list.innerHTML=`<div class="gm-error">${esc(e.message)}</div>`}
  }

  async function carregarPedidoParaEdicao(o){
    byId('gmEditOverlay').classList.add('gm-hidden');
    if(!catalog.length)await apiCatalog();
    editOrderId=Number(o.id);editOrderDisplay=o.display_number||o.id;
    tipo=String(o.tipo||o.localidade||'Consumir no local');pagamento=String(o.pagamento||'A pagar');pesquisa='';etapa='menu';
    carrinho=(Array.isArray(o.itens)?o.itens:[]).map((i,n)=>({uid:`edit-${n}-${Date.now()}`,id:Number(i.id||0),nome:i.nome||'',categoria:i.categoria||'',preco:Number(i.preco||0),quantidade:Number(i.quantidade||1),adicionais:Array.isArray(i.adicionais)?i.adicionais:[],observacao:i.observacao||''}));
    reviewDraft={cliente:String(o.cliente||''),endereco:String(o.endereco||''),observacoes:String(o.observacoes||''),troco:String(o.troco||''),entrega:moneyInputValue(o.entrega),desconto:moneyInputValue(o.discount_amount)};
    const main=byId('gmOverlay');main.classList.remove('gm-hidden');main.setAttribute('aria-hidden','false');document.body.classList.add('gm-lock');
    render();
  }

  window.reativarImpressoraGarcom=()=>setWaiterPrinterEnabled(true);
  window.impressoraGarcomAtiva=()=>waiterPrinterEnabled();
  window.abrirEditorPedidosGarcom=abrirEditorPedidos;
  window.abrirGarcomModal=abrir;
  document.addEventListener('DOMContentLoaded',()=>{
    inject();
    document.querySelectorAll('[data-open-garcom-modal]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();abrir()}));
    document.querySelectorAll('[data-edit-garcom-order]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();abrirEditorPedidos()}));
  });
})();
