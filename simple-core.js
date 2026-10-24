(function core(){
"use strict";
const suggestions={
 bar:["Cerveza","Mojito","Piscola","Papas fritas","Empanadas","Nachos","Agua"],
 restaurant:["Plato de fondo","Entrada","Bebida","Jugo","Postre","Papas fritas","Empanadas"],
 supermarket:["Pan","Leche","Queso","Fruta","Verduras","Bebidas","Productos de aseo"],
 other:["Comida","Bebida","Transporte","Entrada","Otro gasto"]
};
const names={bar:"Bar",restaurant:"Restaurante",supermarket:"Supermercado",other:"Otra cuenta"};
const uid=()=>globalThis.crypto?.randomUUID?.() || ("c"+Math.random().toString(36).slice(2)+Date.now().toString(36));
const money=n=>"$"+Math.round(Number(n)||0).toLocaleString("es-CL");
function splitPesos(amount, ids, weights){
 const total=Math.round(Number(amount)||0); if(total<0||!Number.isSafeInteger(total))throw Error("Monto no válido");
 const keys=ids.slice();if(!keys.length)return {};
 const rawWeights=keys.map((id,i)=>Math.max(0,Number(weights?.[i]??1)||0));
 let weightSum=rawWeights.reduce((a,b)=>a+b,0);const w=weightSum?rawWeights:keys.map(()=>1);
 weightSum=w.reduce((a,b)=>a+b,0);
 const exact=w.map(x=>total*x/weightSum), result=exact.map(Math.floor);
 let remainder=total-result.reduce((a,b)=>a+b,0);
 const order=exact.map((x,i)=>({i,rest:x-result[i]})).sort((a,b)=>b.rest-a.rest||a.i-b.i);
 for(let j=0;j<remainder;j++)result[order[j%order.length].i]++;
 return Object.fromEntries(keys.map((id,i)=>[id,result[i]]));
}
function initial(category="bar"){
 return {id:uid(),category:names[category]?category:"other",title:"",mode:"total",people:[{id:uid(),name:""} ,{id:uid(),name:""}],
 total:0,totalMode:"equal",manual:{},items:[],receiptSubtotal:0,tipPercent:category==="bar"||category==="restaurant"?10:0,tipMode:"proportional",tipExempt:[],tipCustom:{},payerMode:"single",payerId:"",payments:{},createdAt:Date.now(),updatedAt:Date.now()};
}
function validate(b){
 const people=(b.people||[]).filter(p=>String(p.name||"").trim()); const ids=people.map(p=>p.id);
 if(ids.length<2)return "Agrega al menos dos participantes con nombre.";
 if(new Set(people.map(p=>p.name.trim().toLowerCase())).size!==people.length)return "Los nombres de los participantes deben ser diferentes.";
 if(people.length!==b.people.length)return "Escribe el nombre de cada participante.";
 const total=Number(b.total)||0;let base=0;
 if(b.mode==="total"){
  if(!Number.isSafeInteger(total)||total<=0)return "Ingresa un monto total válido en pesos.";
  if(b.totalMode==="custom"){
    let sum=0;
    for(const p of people){const amount=Number(b.manual?.[p.id]||0);if(!Number.isSafeInteger(amount)||amount<0)return "Revisa los montos personalizados.";sum+=amount;}
    if(sum!==total)return "Los montos personales deben sumar "+money(total)+".";
  }
  base=total;
 } else {
   if(!b.items?.length)return "Agrega al menos un producto.";
   for(const item of b.items){
     if(!String(item.name||"").trim()||!Number.isSafeInteger(Number(item.price))||Number(item.price)<0||!Number.isSafeInteger(Number(item.qty))||Number(item.qty)<1)return "Revisa el nombre, precio y cantidad de los productos.";
     if(!(item.consumers||[]).length || item.consumers.some(id=>!ids.includes(id)))return "Asigna cada producto a sus consumidores.";
     base+=Number(item.price)*Number(item.qty);
   }
   if(base<=0)return "El total de productos debe ser mayor que cero.";
   if(Number(b.receiptSubtotal||0)>0 && Number(b.receiptSubtotal)!==base)return "Los productos suman "+money(base)+" y la boleta indica "+money(b.receiptSubtotal)+". Corrige la diferencia.";
 }
 const tipPercent=Number(b.tipPercent||0);
 if(!Number.isFinite(tipPercent)||tipPercent<0||tipPercent>100)return "El porcentaje de propina debe estar entre 0 y 100.";
 const tip=Math.round(base*tipPercent/100);
 const eligible=people.filter(p=>!b.tipExempt?.includes(p.id));
 if(tip>0 && eligible.length===0)return "Al menos una persona debe participar de la propina.";
 if(tip>0 && b.tipMode==="custom"){
   const assigned=eligible.reduce((a,p)=>a+Number(b.tipCustom?.[p.id]||0),0);
   if(eligible.some(p=>!Number.isSafeInteger(Number(b.tipCustom?.[p.id]||0))||Number(b.tipCustom?.[p.id]||0)<0)||assigned!==tip)return "La distribución personalizada de propina debe sumar "+money(tip)+".";
 }
 const grand=base+tip;
 if(b.payerMode==="multiple"){
   const allocated=people.reduce((a,p)=>a+Number(b.payments?.[p.id]||0),0);
   if(people.some(p=>!Number.isSafeInteger(Number(b.payments?.[p.id]||0))||Number(b.payments?.[p.id]||0)<0) || allocated!==grand)return "Los pagos realizados deben sumar "+money(grand)+".";
 }
 if(b.payerMode==="single" && !ids.includes(b.payerId))return "Selecciona quién pagó la cuenta.";
 return null;
}
function calculate(b){
 const error=validate(b);if(error)throw Error(error);
 const people=b.people,ids=people.map(p=>p.id);
 let base=Object.fromEntries(ids.map(id=>[id,0]));
 let subtotal=0;
 if(b.mode==="total"){
  subtotal=Number(b.total);
  base=b.totalMode==="custom"?Object.fromEntries(ids.map(id=>[id,Number(b.manual?.[id]||0)])):splitPesos(subtotal,ids);
 } else {
  for(const item of b.items){
    const amount=Number(item.price)*Number(item.qty);subtotal+=amount;
    const portions=splitPesos(amount,item.consumers);
    for(const [id,n]of Object.entries(portions))base[id]=(base[id]||0)+n;
  }
 }
 const tip=Math.round(subtotal*Number(b.tipPercent||0)/100);
 const elig=ids.filter(id=>!b.tipExempt?.includes(id));
 let tipAlloc=Object.fromEntries(ids.map(id=>[id,0]));
 if(tip&&elig.length){
  if(b.tipMode==="custom")for(const id of elig)tipAlloc[id]=Number(b.tipCustom?.[id]||0);
  else {
   const part=splitPesos(tip,elig,b.tipMode==="equal"?elig.map(()=>1):elig.map(id=>base[id]));
   for(const id of elig)tipAlloc[id]=part[id];
  }
 }
 const total=subtotal+tip;
 let paid=Object.fromEntries(ids.map(id=>[id,0]));
 if(b.payerMode==="single")paid[b.payerId]=total;
 else if(b.payerMode==="multiple")for(const id of ids)paid[id]=Number(b.payments?.[id]||0);
 const members=people.map(p=>({id:p.id,name:p.name.trim(),base:base[p.id],tip:tipAlloc[p.id],due:base[p.id]+tipAlloc[p.id],paid:paid[p.id],balance:paid[p.id]-base[p.id]-tipAlloc[p.id]}));
 const creditors=members.filter(p=>p.balance>0).map(p=>({...p,left:p.balance})), debtors=members.filter(p=>p.balance<0).map(p=>({...p,left:-p.balance}));
 const transfers=[];let i=0,j=0;
 while(i<debtors.length&&j<creditors.length){
  const amount=Math.min(debtors[i].left,creditors[j].left);
  if(amount>0)transfers.push({from:debtors[i].name,to:creditors[j].name,amount});
  debtors[i].left-=amount;creditors[j].left-=amount;
  if(debtors[i].left===0)i++;if(creditors[j].left===0)j++;
 }
 return {subtotal,tip,total,members,transfers};
}
// Modelo puro para el comprobante: usa los montos ya conciliados de calculate().
function receiptDetails(d,r){
 const people=r.members.map(member=>{
   let entries;
   if(d.mode==="items"){
     const grouped=new Map();
     for(const item of d.items||[]){
       // Las cortesías se muestran en la boleta global, sin adjudicar a nadie un cobro.
       if(!(item.consumers||[]).includes(member.id)||Number(item.price)===0)continue;
       const name=String(item.name).trim(), shared=item.consumers.length>1;
       const key=name.toLocaleLowerCase("es-CL")+"|"+Number(item.price)+"|"+shared;
       if(!grouped.has(key))grouped.set(key,{name,qty:0,shared});
       grouped.get(key).qty+=Number(item.qty);
     }
     entries=[...grouped.values()].map(item=>({
       label:item.shared?item.name+" x"+item.qty+" · compartido":item.qty+" "+item.name,
       shared:item.shared
     }));
     if(!entries.length)entries=[{label:"Sin consumos cobrados",shared:false}];
   }else entries=[{label:"División del monto total",shared:false}];
   return {name:member.name,items:entries,base:member.base,tip:member.tip,total:member.due};
 });
 const summary=[];
 if(d.mode==="items"){
   const groups=new Map();
   for(const item of d.items||[]){
     const name=String(item.name||"").trim(),price=Number(item.price);
     const key=name.toLocaleLowerCase("es-CL")+"|"+price;
     if(!groups.has(key))groups.set(key,{name,qty:0,price,total:0});
     const row=groups.get(key);row.qty+=Number(item.qty);row.total+=Number(item.qty)*price;
   }
   summary.push(...groups.values());
 }else summary.push({name:"Consumo total",qty:1,price:r.subtotal,total:r.subtotal});
 return {title:d.title||"",participants:people.map(p=>p.name).join(", "),people,summary,
   subtotal:r.subtotal,tip:r.tip,total:r.total,transfers:r.transfers};
}
function receiptText(d,r){
 const data=receiptDetails(d,r);
 const out=["Detalle de la cuenta",data.participants];
 if(data.title)out.push(data.title);
 out.push("");
 for(const person of data.people){
   out.push(person.name);
   for(const item of person.items)out.push("  "+item.label);
   out.push("  "+money(person.base)+" + "+money(person.tip)+" propina");
   out.push("  Total: "+money(person.total),"");
 }
 out.push("Productos:");
 for(const item of data.summary)out.push("  "+item.name+" x"+item.qty+": "+money(item.total));
 out.push("Propina total: "+money(data.tip),"TOTAL: "+money(data.total));
 if(data.transfers.length){
   out.push("","Transferencias:");
   for(const transfer of data.transfers)out.push(transfer.from+" → "+transfer.to+": "+money(transfer.amount));
 }else if(d.payerMode==="unknown")out.push("","No se indicó quién pagó.");
 return out.join("\n");
}

globalThis.CCSimpleCore={suggestions,names,uid,money,splitPesos,initial,validate,calculate,receiptText,receiptDetails};
})();
