(function app(){
"use strict";
const C=globalThis.CCSimpleCore;
if(!C){document.body.textContent="No se pudo cargar la calculadora. Actualiza la página.";return;}
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const HISTORY_KEY="cuenta-clara-simple-history-v1",DRAFT_KEY="cuenta-clara-simple-draft-v1";
let draft=null,result=null,editingId=null,savedMemory=[],loggedUser=null,authMode="login",syncRunning=false;
const cloud=typeof supabaseClient==="undefined"?null:supabaseClient;
function toast(message){$("toast").textContent=message;$("toast").classList.remove("hidden");clearTimeout(toast._id);toast._id=setTimeout(()=>$("toast").classList.add("hidden"),3800);}
function localRead(key,defaultValue){try{return JSON.parse(localStorage.getItem(key))??defaultValue;}catch{return defaultValue;}}
function localWrite(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true;}catch{toast("El navegador no permite guardar datos locales.");return false;}}
function history(){const arr=localRead(HISTORY_KEY,savedMemory);return Array.isArray(arr)?arr:[];}
function setHistory(arr){savedMemory=arr;localWrite(HISTORY_KEY,arr.slice(0,100));}
function persist(){if(draft){draft.updatedAt=Date.now();localWrite(DRAFT_KEY,draft);}preview();}
function screen(which){for(const name of ["Home","Calc","Result"])$("screen"+name).classList.toggle("hidden",name.toLowerCase()!==which);window.scrollTo?.({top:0,behavior:"instant"});}
function restoreDraft(){const d=localRead(DRAFT_KEY,null);return d && d.people?.length&&d.category&&d.id?d:null;}
function start(category){draft=C.initial(category);draft.payerId=draft.people[0].id;editingId=null;result=null;renderCalc();persist();screen("calc");}
function goHome(){
 const unsaved=draft&&!history().some(e=>e.id===draft.id);
 $("resumeDraft").classList.toggle("hidden",!unsaved);
 screen("home");
}
function renderCalc(){
 $("calcTitle").textContent="Divide tu cuenta de "+(C.names[draft.category]||"gastos").toLowerCase();
 $("calcName").value=draft.title||"";
 $("totalAmount").value=draft.total||"";
 $("receiptSubtotal").value=draft.receiptSubtotal||"";
 $("modeTotal").classList.toggle("selected",draft.mode==="total");
 $("modeTotal").setAttribute("aria-pressed",String(draft.mode==="total"));
 $("modeItems").classList.toggle("selected",draft.mode==="items");
 $("modeItems").setAttribute("aria-pressed",String(draft.mode==="items"));
 $("totalFields").classList.toggle("hidden",draft.mode!=="total");
 $("itemFields").classList.toggle("hidden",draft.mode!=="items");
 document.querySelectorAll('[name="totalMode"]').forEach(i=>i.checked=i.value===draft.totalMode);
 const tip=Number(draft.tipPercent||0);
 $("tipSelect").value=tip===0?"0":tip===10?"10":"custom";
 $("tipCustomField").classList.toggle("hidden",tip===0||tip===10);
 $("tipCustomPercent").value=tip;
 $("tipMode").value=draft.tipMode||"proportional";
 $("payerMode").value=draft.payerMode||"single";
 renderPeople();renderRelated();renderItems();renderSuggestions();renderManual();renderTipOptions();renderPayer();
 $("calcError").classList.add("hidden");preview();
}
function renderPeople(){
 $("peopleRows").innerHTML=draft.people.map((p,i)=>'<div class="person-row"><span class="avatar">'+(i+1)+'</span><input data-person="'+esc(p.id)+'" aria-label="Nombre de participante '+(i+1)+'" maxlength="45" placeholder="Persona '+(i+1)+'" value="'+esc(p.name)+'"><button data-remove-person="'+esc(p.id)+'" type="button" class="delete-mini" aria-label="Eliminar participante '+(i+1)+'">×</button></div>').join("");
}
function renderRelated(){
 const selected=editingId?draft.items.find(x=>x.id===editingId)?.consumers||[]:null;
 $("consumers").innerHTML=draft.people.map(p=>'<label><input data-consumer="'+esc(p.id)+'" type="checkbox" '+(!selected||selected.includes(p.id)?"checked":"")+'> '+esc(p.name||"Sin nombre")+"</label>").join("");
}
function renderManual(){
 $("manualAmounts").classList.toggle("hidden",draft.totalMode!=="custom"||draft.mode!=="total");
 $("manualAmounts").innerHTML=draft.people.map(p=>'<label><span>'+esc(p.name||"Sin nombre")+'</span><input aria-label="Monto de '+esc(p.name||"participante")+'" data-manual="'+esc(p.id)+'" type="number" min="0" step="1" inputmode="numeric" value="'+(Number(draft.manual?.[p.id]||0))+'"></label>').join("");
}
function renderSuggestions(){
 $("suggestions").innerHTML=(C.suggestions[draft.category]||C.suggestions.other).map(s=>'<button type="button" data-suggestion="'+esc(s)+'">＋ '+esc(s)+'</button>').join("");
}
function renderItems(){
 $("itemRows").innerHTML=draft.items.length?draft.items.map(x=>'<div class="item-line"><div><strong>'+esc(x.name)+'</strong><small>'+x.qty+' × '+C.money(x.price)+' · '+(x.consumers||[]).map(id=>draft.people.find(p=>p.id===id)?.name||"Persona").join(", ")+'</small></div><b>'+C.money(x.price*x.qty)+'</b><div class="item-buttons"><button type="button" data-edit="'+esc(x.id)+'">Editar</button><button type="button" data-remove-item="'+esc(x.id)+'" aria-label="Eliminar '+esc(x.name)+'">×</button></div></div>').join(""):'<p class="subtle-hint">Aún no hay productos. Elige una sugerencia o escribe uno.</p>';
}
function renderTipOptions(){
 $("tipExempts").innerHTML=draft.people.map(p=>'<label><input type="checkbox" data-tip-exempt="'+esc(p.id)+'" '+(draft.tipExempt?.includes(p.id)?"checked":"")+'> '+esc(p.name||"Sin nombre")+'</label>').join("");
 $("tipCustomAmounts").classList.toggle("hidden",draft.tipMode!=="custom");
 $("tipCustomAmounts").innerHTML=draft.people.filter(p=>!draft.tipExempt?.includes(p.id)).map(p=>'<label><span>'+esc(p.name||"Sin nombre")+'</span><input data-tip-person="'+esc(p.id)+'" aria-label="Propina de '+esc(p.name||"participante")+'" type="number" min="0" step="1" inputmode="numeric" value="'+Number(draft.tipCustom?.[p.id]||0)+'"></label>').join("");
}
function renderPayer(){
 const m=draft.payerMode;
 $("singlePayer").classList.toggle("hidden",m!=="single");
 $("multiPayers").classList.toggle("hidden",m!=="multiple");
 $("payerId").innerHTML=draft.people.map(p=>'<option value="'+esc(p.id)+'" '+(p.id===draft.payerId?"selected":"")+'>'+esc(p.name||"Sin nombre")+'</option>').join("");
 $("multiPayers").innerHTML=draft.people.map(p=>'<label><span>'+esc(p.name||"Sin nombre")+'</span><input data-paid="'+esc(p.id)+'" aria-label="Pagó '+esc(p.name||"participante")+'" type="number" min="0" step="1" inputmode="numeric" value="'+Number(draft.payments?.[p.id]||0)+'"></label>').join("");
}
function preview(){
 if(!draft)return;
 const base=draft.mode==="total"?Number(draft.total||0):draft.items.reduce((s,x)=>s+Number(x.price||0)*Number(x.qty||0),0);
 const tip=Math.round(Math.max(0,base)*Number(draft.tipPercent||0)/100);
 $("previewBase").textContent=C.money(base);
 $("previewTip").textContent=C.money(tip);
 $("previewTotal").textContent=C.money(base+tip);
 $("previewType").textContent=C.names[draft.category]||"Cuenta";
}
function updateRelatedNames(){renderRelated();renderManual();renderPayer();renderTipOptions();}
function addItem(){
 const name=$("itemName").value.trim(),price=Number($("itemPrice").value),qty=Number($("itemQty").value);
 const consumers=[...document.querySelectorAll("[data-consumer]:checked")].map(x=>x.dataset.consumer);
 if(!name||$("itemPrice").value===""||!Number.isSafeInteger(price)||price<0||!Number.isSafeInteger(qty)||qty<1||qty>10000||!consumers.length){toast("Completa nombre, precio, cantidad y consumidores.");return;}
 const item={id:editingId||C.uid(),name,price,qty,consumers};
 if(editingId){draft.items=draft.items.map(x=>x.id===editingId?item:x);}else draft.items.push(item);
 editingId=null;$("itemName").value="";$("itemPrice").value="";$("itemQty").value="1";
 $("cancelItemEdit").classList.add("hidden");renderRelated();renderItems();persist();toast("Producto agregado.");
}
function editItem(id){
 const x=draft.items.find(x=>x.id===id);if(!x)return;
 editingId=id;$("itemName").value=x.name;$("itemPrice").value=x.price;$("itemQty").value=x.qty;
 renderRelated();$("cancelItemEdit").classList.remove("hidden");$("itemName").focus();$("itemName").scrollIntoView({block:"center",behavior:"smooth"});
}
function seededManual(){const parts=C.splitPesos(Math.max(0,Math.round(Number(draft.total)||0)),draft.people.map(p=>p.id));draft.manual=parts;}
function seededTip(){const raw=draft.mode==="total"?Number(draft.total||0):draft.items.reduce((n,x)=>n+x.price*x.qty,0);
 const amount=Math.round(raw*Number(draft.tipPercent||0)/100),ids=draft.people.filter(p=>!draft.tipExempt?.includes(p.id)).map(p=>p.id);
 draft.tipCustom=C.splitPesos(Math.max(0,amount),ids);
}
function renderResult(){
 if(!result)return;
 const r=result, detail=C.receiptDetails(draft,r);
 $("receiptNames").textContent=detail.participants;
 $("resultName").textContent=detail.title;
 $("resultAmount").textContent=C.money(detail.total);
 $("resultBreakdown").textContent="Consumo "+C.money(detail.subtotal)+" + propina "+C.money(detail.tip);
 $("resultPeople").innerHTML=detail.people.map(person=>`
   <section class="receipt-person">
     <div class="receipt-person-copy">
       <h3>${esc(person.name)}</h3>
       <div class="receipt-consumption">
         ${person.items.map(item=>`<p class="${item.shared?'shared-note':''}">${esc(item.label)}</p>`).join("")}
       </div>
       <p class="receipt-person-math">${C.money(person.base)} + ${C.money(person.tip)} propina</p>
     </div>
     <strong class="receipt-person-total">${C.money(person.total)}</strong>
   </section>`).join("");
 $("receiptItemSummary").innerHTML=detail.summary.map(item=>`
   <div class="receipt-summary-row">
     <span>${esc(item.name)} x${item.qty}</span><strong>${C.money(item.total)}</strong>
   </div>`).join("")+`
   <div class="receipt-summary-row"><span>Propina total</span><strong>${C.money(detail.tip)}</strong></div>`;
 $("transferSection").classList.toggle("hidden",!r.transfers.length);
 $("transferRows").innerHTML=r.transfers.map(t=>'<div class="transfer-row"><span>'+esc(t.from)+' → '+esc(t.to)+'</span><b>'+C.money(t.amount)+'</b></div>').join("");
 if(loggedUser){$("cloudCalloutTitle").textContent="Tu cuenta se sincroniza con Supabase";$("cloudCalloutText").textContent="Tus resultados estarán disponibles cuando ingreses en otro dispositivo.";$("cloudAction").textContent="Sincronizar";}
 else {$("cloudCalloutTitle").textContent="¿Quieres conservar esta cuenta?";$("cloudCalloutText").textContent="Se guardó en este dispositivo. Inicia sesión para sincronizarla en la nube.";$("cloudAction").textContent="Guardar en la nube";}
}
function saveResult(){
 if(!draft||!result)return;
 const entry={id:draft.id,draft:JSON.parse(JSON.stringify(draft)),updatedAt:Date.now(),createdAt:draft.createdAt||Date.now()};
 const arr=history().filter(x=>x.id!==entry.id);arr.unshift(entry);setHistory(arr);
 if(loggedUser)syncCloud().catch(e=>console.warn("Sincronización diferida",e));
}
function calculate(){
 const err=C.validate(draft);
 if(err){$("calcError").textContent=err;$("calcError").classList.remove("hidden");$("calcError").scrollIntoView({block:"center",behavior:"smooth"});return;}
 $("calcError").classList.add("hidden");
 try{result=C.calculate(draft);saveResult();renderResult();screen("result");}
 catch(e){toast(e.message||"No se pudo calcular.");}
}
async function share(){
 if(!draft||!result)return;
 try {
   const didShare=await globalThis.CCSimpleReceipt.share(draft,result);
   if(!didShare){
     await globalThis.CCSimpleReceipt.download(draft,result);
     toast("Imagen descargada. Puedes adjuntarla en WhatsApp o compartirla desde tu galería.");
   }
 }catch(error){
   if(error?.name==="AbortError")return;
   console.error("Error al compartir imagen:",error);
   toast("No se pudo compartir la imagen. Intenta descargar el comprobante.");
 }
}
async function downloadReceipt(){
 if(!draft||!result)return;
 try {
   await globalThis.CCSimpleReceipt.download(draft,result);
   toast("Comprobante PNG descargado.");
 }catch(error){
   console.error("No se pudo descargar el comprobante:",error);
   toast(error.message||"No se pudo generar la imagen.");
 }
}
async function copy(){
 const text=C.receiptText(draft,result);
 try{await navigator.clipboard.writeText(text);toast("Detalle copiado.");}
 catch{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Detalle copiado.");}
}
function showHistory(){
 const records=history().sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
 $("savedList").innerHTML=records.length?records.map(e=>{
  const d=e.draft||{}, label=d.title||C.names[d.category]||"Cuenta", date=new Date(e.updatedAt).toLocaleDateString("es-CL");
  return '<div class="saved-card"><div><strong>'+esc(label)+'</strong><small>'+esc(date)+' · '+(d.people?.length||0)+' participantes</small></div><div><button type="button" data-open-saved="'+esc(e.id)+'">Abrir</button><button type="button" data-delete-saved="'+esc(e.id)+'" aria-label="Eliminar cuenta '+esc(label)+'">×</button></div></div>';
 }).join(""):'<p class="modal-intro">Todavía no hay cuentas. Tu próximo resultado aparecerá aquí.</p>';
 $("historyInfo").textContent=loggedUser?"Cuentas guardadas en este dispositivo y sincronizadas con tu usuario.":"Se conservan en este navegador. Si borras sus datos podrían perderse.";
 $("historyDialog").showModal();
}
function openSaved(id){const entry=history().find(e=>e.id===id);if(!entry)return;draft=JSON.parse(JSON.stringify(entry.draft));editingId=null;$("historyDialog").close();result=null;renderCalc();const error=C.validate(draft);if(!error){result=C.calculate(draft);renderResult();screen("result");}else screen("calc");localWrite(DRAFT_KEY,draft);}
async function deleteSaved(id){
 if(!window.confirm("¿Eliminar esta cuenta guardada?"))return;
 setHistory(history().filter(e=>e.id!==id));showHistoryRefresh();
 if(loggedUser&&cloud){const {error}=await cloud.from("simple_calculations").delete().eq("user_id",loggedUser.id).eq("client_id",id);if(error)toast("No se pudo borrar la copia en nube.");}
}
function showHistoryRefresh(){ $("historyDialog").close();showHistory();}
function openAuth(){
 if(loggedUser){if(window.confirm("Sesión iniciada. ¿Deseas cerrar sesión?"))cloud?.auth.signOut().then(()=>toast("Sesión cerrada."));return;}
 $("authMessage").textContent="";$("authDialog").showModal();
}
function authLabel(){const btn=$("authOpen");btn.textContent=loggedUser?"Mi nube ✓":"Ingresar";btn.title=loggedUser?"Cerrar sesión de "+(loggedUser.email||"Cuenta Clara"):"Sincronizar mis cuentas (opcional)";}
async function syncCloud(){
 if(!cloud||!loggedUser||syncRunning)return;
 syncRunning=true;
 try{
  const uid=loggedUser.id;
  const {data:remote,error}=await cloud.from("simple_calculations").select("client_id,payload,updated_at").eq("user_id",uid).order("updated_at",{ascending:false}).limit(200);
  if(error)throw error;
  const list=history();const map=new Map(list.map(x=>[x.id,x]));const rows=[];
  for(const row of remote||[]){
   const old=map.get(row.client_id),time=Date.parse(row.updated_at)||0;
   if(row.payload?.draft && (!old||time>(old.updatedAt||0)+1000))map.set(row.client_id,{...row.payload,id:row.client_id,updatedAt:time});
  }
  for(const entry of map.values()){
   const remoteRow=(remote||[]).find(r=>r.client_id===entry.id);
   if(!remoteRow||(entry.updatedAt||0)>(Date.parse(remoteRow.updated_at)||0)+1000){
    rows.push({user_id:uid,client_id:entry.id,payload:entry,updated_at:new Date(entry.updatedAt||Date.now()).toISOString()});
   }
  }
  if(rows.length){const up=await cloud.from("simple_calculations").upsert(rows,{onConflict:"user_id,client_id"});if(up.error)throw up.error;}
  setHistory([...map.values()].sort((a,b)=>b.updatedAt-a.updatedAt));
  if(document.querySelector("#screenResult:not(.hidden)"))renderResult();
  toast("Cuentas sincronizadas.");
 }catch(e){console.warn("Supabase sync:",e);toast("No se pudo sincronizar. Tus cuentas siguen guardadas en este dispositivo.");}
 finally{syncRunning=false;}
}
function bind(){
 document.querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>start(btn.dataset.category)));
 $("calcBack").addEventListener("click",goHome);
 $("resultBack").addEventListener("click",()=>{renderCalc();screen("calc");});
 $("newBtn").addEventListener("click",goHome);
 $("addPerson").addEventListener("click",()=>{if(draft.people.length>=20){toast("Máximo 20 participantes.");return;}draft.people.push({id:C.uid(),name:""});renderPeople();updateRelatedNames();persist();});
 $("peopleRows").addEventListener("input",e=>{const input=e.target.closest("[data-person]");if(!input)return;const p=draft.people.find(p=>p.id===input.dataset.person);if(p){p.name=input.value;updateRelatedNames();persist();}});
 $("peopleRows").addEventListener("click",e=>{const btn=e.target.closest("[data-remove-person]");if(!btn)return;if(draft.people.length<=2){toast("Necesitas al menos dos participantes.");return;}const id=btn.dataset.removePerson;draft.people=draft.people.filter(x=>x.id!==id);draft.items.forEach(item=>item.consumers=item.consumers.filter(x=>x!==id));draft.tipExempt=draft.tipExempt.filter(x=>x!==id);if(draft.payerId===id)draft.payerId=draft.people[0].id;renderPeople();updateRelatedNames();renderItems();persist();});
 $("calcName").addEventListener("input",e=>{draft.title=e.target.value;persist();});
 $("totalAmount").addEventListener("input",e=>{draft.total=Number(e.target.value||0);persist();});
 document.querySelectorAll("[data-mode]").forEach(btn=>btn.addEventListener("click",()=>{draft.mode=btn.dataset.mode;renderCalc();persist();}));
 document.querySelectorAll('[name="totalMode"]').forEach(input=>input.addEventListener("change",()=>{draft.totalMode=input.value;if(input.value==="custom")seededManual();renderManual();persist();}));
 $("manualAmounts").addEventListener("input",e=>{const field=e.target.closest("[data-manual]");if(field){draft.manual[field.dataset.manual]=Number(field.value||0);persist();}});
 $("suggestions").addEventListener("click",e=>{const btn=e.target.closest("[data-suggestion]");if(!btn)return;$("itemName").value=btn.dataset.suggestion;$("itemPrice").focus();});
 $("addItem").addEventListener("click",addItem);
 $("cancelItemEdit").addEventListener("click",()=>{editingId=null;$("itemName").value="";$("itemPrice").value="";$("itemQty").value="1";renderRelated();$("cancelItemEdit").classList.add("hidden");});
 $("itemRows").addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-remove-item]");if(edit)editItem(edit.dataset.edit);if(del){draft.items=draft.items.filter(x=>x.id!==del.dataset.removeItem);renderItems();persist();}});
 $("receiptSubtotal").addEventListener("input",e=>{draft.receiptSubtotal=Number(e.target.value||0);persist();});
 $("tipSelect").addEventListener("change",e=>{const v=e.target.value;draft.tipPercent=v==="custom"?15:Number(v);$("tipCustomPercent").value=draft.tipPercent;$("tipCustomField").classList.toggle("hidden",v!=="custom");if(draft.tipMode==="custom")seededTip();renderTipOptions();persist();});
 $("tipCustomPercent").addEventListener("input",e=>{draft.tipPercent=Number(e.target.value||0);if(draft.tipMode==="custom")seededTip();renderTipOptions();persist();});
 $("tipMode").addEventListener("change",e=>{draft.tipMode=e.target.value;if(draft.tipMode==="custom")seededTip();renderTipOptions();persist();});
 $("tipExempts").addEventListener("change",e=>{const c=e.target.closest("[data-tip-exempt]");if(!c)return;const set=new Set(draft.tipExempt||[]);c.checked?set.add(c.dataset.tipExempt):set.delete(c.dataset.tipExempt);draft.tipExempt=[...set];if(draft.tipMode==="custom")seededTip();renderTipOptions();persist();});
 $("tipCustomAmounts").addEventListener("input",e=>{const x=e.target.closest("[data-tip-person]");if(x){draft.tipCustom[x.dataset.tipPerson]=Number(x.value||0);persist();}});
 $("payerMode").addEventListener("change",e=>{draft.payerMode=e.target.value;if(draft.payerMode==="multiple"){const total=draft.mode==="total"?draft.total:draft.items.reduce((s,x)=>s+x.price*x.qty,0);const v=Math.round(total*(1+Number(draft.tipPercent||0)/100));if(!Object.values(draft.payments).some(Number))draft.payments={[draft.payerId||draft.people[0].id]:v};}renderPayer();persist();});
 $("payerId").addEventListener("change",e=>{draft.payerId=e.target.value;persist();});
 $("multiPayers").addEventListener("input",e=>{const x=e.target.closest("[data-paid]");if(x){draft.payments[x.dataset.paid]=Number(x.value||0);persist();}});
 $("calculateBtn").addEventListener("click",calculate);
 $("copyBtn").addEventListener("click",copy);$("shareBtn").addEventListener("click",share);
 $("downloadImageBtn").addEventListener("click",downloadReceipt);
 $("whatsappBtn").addEventListener("click",()=>{
   if(!draft||!result)return;
   window.open("https://wa.me/?text="+encodeURIComponent(C.receiptText(draft,result)),"_blank","noopener,noreferrer");
 });
 $("historyOpen").addEventListener("click",showHistory);$("homeHistory").addEventListener("click",showHistory);
 $("resumeDraft").addEventListener("click",()=>{
  const saved=restoreDraft();
  if(!saved)return toast("No encontramos ese borrador.");
  draft=saved;editingId=null;result=null;
  if(!draft.payerId)draft.payerId=draft.people[0]?.id||"";
  renderCalc();screen("calc");
 });
 $("authOpen").addEventListener("click",openAuth);$("cloudAction").addEventListener("click",()=>loggedUser?syncCloud():openAuth());
 document.querySelectorAll("[data-close]").forEach(x=>x.addEventListener("click",()=>$((x.dataset.close)).close()));
 $("savedList").addEventListener("click",e=>{const open=e.target.closest("[data-open-saved]"),del=e.target.closest("[data-delete-saved]");if(open)openSaved(open.dataset.openSaved);if(del)deleteSaved(del.dataset.deleteSaved);});
 $("authForm").addEventListener("submit",authSubmit);
 $("authSwitch").addEventListener("click",()=>{authMode=authMode==="login"?"signup":"login";$("authTitle").textContent=authMode==="login"?"Guardar en la nube":"Crear cuenta opcional";$("authSubmit").textContent=authMode==="login"?"Ingresar":"Crear cuenta";$("authSwitch").textContent=authMode==="login"?"Crear cuenta":"Ya tengo cuenta";$("authMessage").textContent="";});
 $("resetPassword").addEventListener("click",async()=>{const email=$("authEmail").value.trim();if(!email){$("authMessage").textContent="Ingresa tu correo electrónico.";return;}if(!cloud){$("authMessage").textContent="Conexión a Supabase no disponible.";return;}const {error}=await cloud.auth.resetPasswordForEmail(email,{redirectTo:location.origin+"/index.html"});$("authMessage").textContent=error?error.message:"Si existe una cuenta con ese correo, recibirás instrucciones.";});
}
async function authSubmit(e){
 e.preventDefault();
 if(!cloud){$("authMessage").textContent="No se pudo conectar a Supabase. Puedes seguir usando la calculadora.";return;}
 const email=$("authEmail").value.trim(),password=$("authPassword").value;
 $("authMessage").textContent="Conectando...";
 try{
  const res=authMode==="login"?await cloud.auth.signInWithPassword({email,password}):await cloud.auth.signUp({email,password});
  if(res.error)throw res.error;
  if(authMode==="signup"&&!res.data.session){$("authMessage").textContent="Revisa tu correo para confirmar el registro y después ingresa.";return;}
  $("authDialog").close();$("authMessage").textContent="";toast("Sesión iniciada. Sincronizando resultados...");
 }catch(ex){$("authMessage").textContent=ex.message||"No se pudo ingresar.";}
}
async function initCloud(){
 if(!cloud){authLabel();return;}
 try{
  const {data:{session}}=await cloud.auth.getSession();
  loggedUser=session?.user||null;authLabel();
  cloud.auth.onAuthStateChange((_event,session)=>{
   const old=loggedUser?.id;loggedUser=session?.user||null;authLabel();
   if(loggedUser && old!==loggedUser.id)Promise.resolve().then(()=>syncCloud());
   if($("screenResult")&&!$("screenResult").classList.contains("hidden"))renderResult();
  });
  if(loggedUser)await syncCloud();
 }catch(e){console.warn("Supabase auth unavailable",e);}
}
bind();authLabel();screen("home");initCloud();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
if(new URLSearchParams(location.search).has("auth")){openAuth();}
if(restoreDraft()&&!history().some(e=>e.id===restoreDraft().id)){
  $("resumeDraft").classList.remove("hidden");
}
})();
