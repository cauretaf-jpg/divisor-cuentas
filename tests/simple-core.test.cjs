const assert=require("node:assert/strict");
require("../simple-core.js");
const C=globalThis.CCSimpleCore;
const person=(name)=>({id:C.uid(),name});
const d=C.initial("bar");
d.people=[person("Carlos"),person("Felipe"),person("Enma")];
d.payerId=d.people[0].id;
d.mode="total";d.total=45000;d.tipPercent=0;
let r=C.calculate(d);
assert.equal(r.total,45000);
assert.deepEqual(r.members.map(x=>x.due),[15000,15000,15000]);
assert.equal(r.transfers.reduce((sum,x)=>sum+x.amount,0),30000);

d.mode="items";d.items=[
 {id:"pizza",name:"Pizza",price:18000,qty:1,consumers:[d.people[0].id,d.people[1].id]},
 {id:"ensalada",name:"Ensalada",price:8000,qty:1,consumers:[d.people[2].id]},
 {id:"bebida",name:"Bebida",price:4000,qty:1,consumers:[d.people[1].id]}
];
d.tipPercent=10;
r=C.calculate(d);
assert.equal(r.subtotal,30000);assert.equal(r.tip,3000);assert.equal(r.total,33000);
assert.deepEqual(r.members.map(x=>x.base),[9000,13000,8000]);
assert.deepEqual(r.members.map(x=>x.due),[9900,14300,8800]);
assert.deepEqual(r.transfers.map(x=>({from:x.from,to:x.to,amount:x.amount})),[
 {from:"Felipe",to:"Carlos",amount:14300},
 {from:"Enma",to:"Carlos",amount:8800}
]);
assert.equal(r.members.reduce((n,x)=>n+x.due,0),r.total);
assert.equal(r.members.reduce((n,x)=>n+x.paid,0),r.total);

d.receiptSubtotal=31000;
assert.match(C.validate(d),/boleta/);
d.receiptSubtotal=30000;assert.equal(C.validate(d),null);

d.tipMode="equal";d.tipExempt=[d.people[2].id];r=C.calculate(d);
assert.equal(r.members[2].tip,0);assert.equal(r.members[0].tip,1500);
d.tipMode="custom";d.tipCustom={[d.people[0].id]:1200,[d.people[1].id]:1800};
assert.equal(C.validate(d),null);
d.tipCustom[d.people[1].id]=1500;assert.match(C.validate(d),/propina/);

d.tipPercent=0;d.tipMode="proportional";d.tipExempt=[];
d.mode="total";d.totalMode="custom";d.total=20000;
d.manual={[d.people[0].id]:6000,[d.people[1].id]:8000,[d.people[2].id]:6000};
d.payerMode="multiple";d.payments={[d.people[0].id]:0,[d.people[1].id]:20000,[d.people[2].id]:0};
assert.equal(C.validate(d),null);
r=C.calculate(d);
assert.equal(r.total,20000);assert.equal(r.transfers.reduce((n,x)=>n+x.amount,0),12000);
assert.ok(r.transfers.every(x=>x.to==="Felipe"));
d.payments[d.people[1].id]=19000;
assert.match(C.validate(d),/pagos/);
d.payerMode="unknown";
assert.equal(C.validate(d),null);
assert.equal(C.calculate(d).transfers.length,0);
d.totalMode="equal";d.total=10000;r=C.calculate(d);
assert.deepEqual(r.members.map(x=>x.base),[3334,3333,3333]);
assert.match(C.receiptText(d,r),/TOTAL: \$10\.000/);
assert.equal(C.suggestions.bar.includes("Mojito"),true);
// Ejemplo visual de referencia: Carlos, Gyn y Daniela, con cortesías y propina 10%.
const bar=C.initial("bar");
bar.people=[person("Carlos"),person("Gyn"),person("Daniela")];
bar.mode="items";bar.payerId=bar.people[0].id;bar.tipPercent=10;
bar.items=[
 {id:"gratis",name:"Mango Sour (cortesía)",price:0,qty:3,consumers:bar.people.map(p=>p.id)},
 {id:"calafate-c",name:"Austral Calafate",price:4300,qty:2,consumers:[bar.people[0].id]},
 {id:"calafate-g",name:"Austral Calafate",price:4300,qty:1,consumers:[bar.people[1].id]},
 {id:"moscow",name:"Moscow Mule",price:6900,qty:1,consumers:[bar.people[2].id]}
];
const barResult=C.calculate(bar);
assert.equal(barResult.subtotal,19800);
assert.equal(barResult.tip,1980);
assert.equal(barResult.total,21780);
assert.deepEqual(barResult.members.map(p=>p.due),[9460,4730,7590]);
assert.deepEqual(barResult.members.map(p=>p.tip),[860,430,690]);
const receipt=C.receiptDetails(bar,barResult);
assert.deepEqual(receipt.people.map(p=>p.items.map(x=>x.label)),[
 ["2 Austral Calafate"],["1 Austral Calafate"],["1 Moscow Mule"]
]);
assert.deepEqual(receipt.summary.map(x=>({name:x.name,qty:x.qty,total:x.total})),[
 {name:"Mango Sour (cortesía)",qty:3,total:0},
 {name:"Austral Calafate",qty:3,total:12900},
 {name:"Moscow Mule",qty:1,total:6900}
]);
assert.match(C.receiptText(bar,barResult),/2 Austral Calafate/);
assert.match(C.receiptText(bar,barResult),/Mango Sour \(cortesía\) x3: \$0/);
assert.match(C.receiptText(bar,barResult),/TOTAL: \$21\.780/);
console.log("Pruebas core Cuenta Clara 2.0: aprobadas");
