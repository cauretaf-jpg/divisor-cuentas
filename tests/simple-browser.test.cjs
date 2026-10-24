const { chromium } = require("playwright");
const assert=require("node:assert/strict");
const {spawn}=require("node:child_process");
const fs=require("node:fs");
const path=require("node:path");
const base="http://127.0.0.1:8899/index.html";
const dir="artifacts/simple-ui";fs.mkdirSync(dir,{recursive:true});
const server=spawn("python3",["-m","http.server","8899","--bind","127.0.0.1"],{stdio:"ignore"});
async function wait(){for(let i=0;i<35;i++){try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,200));}throw Error("servidor no inicia");}
(async()=>{
 let browser;try{
 await wait();browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 const page=await ctx.newPage();
 const errs=[];page.on("pageerror",e=>errs.push(e.message));
 page.on("dialog",d=>d.accept());
 await page.goto(base,{waitUntil:"domcontentloaded"});
 await page.locator("#homeTitle").waitFor({state:"visible"});
 assert.equal(await page.locator("#authDialog").evaluate(e=>e.open),false,"No debe pedir registro");
 await page.screenshot({path:path.join(dir,"01-inicio-390.png"),fullPage:true});
 await page.locator('[data-category="bar"]').click();
 await page.locator("#screenCalc").waitFor({state:"visible"});
 await page.locator('[data-person]').nth(0).fill("Carlos");
 await page.locator('[data-person]').nth(1).fill("Felipe");
 await page.locator("#totalAmount").fill("30000");
 await page.screenshot({path:path.join(dir,"02-calculadora-390.png"),fullPage:true});
 await page.reload({waitUntil:"domcontentloaded"});
 await page.locator("#resumeDraft").waitFor({state:"visible"});
 await page.locator("#resumeDraft").click();
 await page.locator("#screenCalc").waitFor({state:"visible"});
 assert.equal(await page.locator("#totalAmount").inputValue(),"30000","El borrador no debe perderse al recargar");
 await page.locator("#calculateBtn").click();
 await page.locator("#screenResult").waitFor({state:"visible"});
 assert.equal((await page.locator("#resultAmount").innerText()).trim(),"$33.000");
 assert.match(await page.locator("#transferRows").innerText(),/Felipe/);
 assert.equal(await page.locator("#whatsappBtn").isVisible(),true);
 await page.screenshot({path:path.join(dir,"03-resultado-390.png"),fullPage:true});

 await page.locator("#newBtn").click();
 await page.locator('[data-category="supermarket"]').click();
 await page.locator('[data-person]').nth(0).fill("Carlos");
 await page.locator('[data-person]').nth(1).fill("Enma");
 await page.locator("#modeItems").click();
 await page.locator('[data-suggestion="Queso"]').click();
 await page.locator("#itemPrice").fill("10000");
 await page.locator("#itemQty").fill("2");
 await page.locator("#addItem").click();
 assert.match(await page.locator("#itemRows").innerText(),/Queso/);
 await page.locator("#calculateBtn").click();
 await page.locator("#screenResult").waitFor({state:"visible"});
 assert.equal((await page.locator("#resultAmount").innerText()).trim(),"$20.000");
 assert.match(await page.locator("#receiptItemSummary").innerText(),/Queso x2/);
 assert.match(await page.locator("#receiptNames").innerText(),/Carlos, Enma/);
 const [download] = await Promise.all([
   page.waitForEvent("download"),
   page.locator("#downloadImageBtn").click()
 ]);
 assert.match(download.suggestedFilename(),/Cuenta-Clara-.*\.png$/);
 const bytes=fs.readFileSync(await download.path());
 assert.deepEqual([...bytes.slice(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(bytes.readUInt32BE(16),2160,"El PNG debe tener resolución para compartir");

 await page.reload({waitUntil:"domcontentloaded"});
 await page.locator("#homeTitle").waitFor({state:"visible"});
 await page.locator("#historyOpen").click();
 assert.equal(await page.locator("#savedList .saved-card").count(),2);
 await page.screenshot({path:path.join(dir,"04-historial-390.png"),fullPage:true});
 await page.locator('[data-open-saved]').first().click();
 await page.locator("#screenResult").waitFor({state:"visible"});
 assert.equal((await page.locator("#resultAmount").innerText()).trim(),"$20.000");
 // El registro se presenta únicamente si se solicita.
 await page.locator("#authOpen").click();
 assert.equal(await page.locator("#authDialog").evaluate(e=>e.open),true);
 await page.locator('[data-close="authDialog"]').click();
 // Desktop, ventana nueva y sin cuentas.
 const desktop=await browser.newPage({viewport:{width:1280,height:850}});
 await desktop.goto(base,{waitUntil:"domcontentloaded"});
 await desktop.locator("#homeTitle").waitFor({state:"visible"});
 assert.ok(await desktop.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+5),"Sin desborde horizontal");
 await desktop.screenshot({path:path.join(dir,"05-inicio-1280.png"),fullPage:true});
 await desktop.locator('[data-category="restaurant"]').click();
 await desktop.locator("#screenCalc").waitFor({state:"visible"});
 await desktop.screenshot({path:path.join(dir,"06-calculadora-1280.png"),fullPage:true});

 // Reproducir la cuenta de la imagen aportada y verificar todos sus montos.
 const referencePage=await ctx.newPage();
 await referencePage.goto(base,{waitUntil:"domcontentloaded"});
 await referencePage.evaluate(()=>{
   const C=window.CCSimpleCore;
   const d=C.initial("bar");
   d.people=[{id:"carlos",name:"Carlos"},{id:"gyn",name:"Gyn"},{id:"dani",name:"Daniela"}];
   d.payerId="carlos";d.mode="items";d.tipPercent=10;
   d.items=[
     {id:"gift",name:"Mango Sour (cortesía)",qty:3,price:0,consumers:["carlos","gyn","dani"]},
     {id:"cc",name:"Austral Calafate",qty:2,price:4300,consumers:["carlos"]},
     {id:"cg",name:"Austral Calafate",qty:1,price:4300,consumers:["gyn"]},
     {id:"dm",name:"Moscow Mule",qty:1,price:6900,consumers:["dani"]}
   ];
   localStorage.setItem("cuenta-clara-simple-draft-v1",JSON.stringify(d));
 });
 await referencePage.reload({waitUntil:"domcontentloaded"});
 await referencePage.locator("#resumeDraft").click();
 await referencePage.locator("#calculateBtn").click();
 await referencePage.locator("#screenResult").waitFor({state:"visible"});
 assert.equal((await referencePage.locator("#resultAmount").innerText()).trim(),"$21.780");
 const listed=await referencePage.locator("#resultPeople .receipt-person-total").allInnerTexts();
 assert.deepEqual(listed,["$9.460","$4.730","$7.590"]);
 assert.match(await referencePage.locator("#receiptItemSummary").innerText(),/Mango Sour \(cortesía\) x3/);
 assert.match(await referencePage.locator("#receiptItemSummary").innerText(),/Austral Calafate x3/);
 await referencePage.screenshot({path:path.join(dir,"07-comprobante-ejemplo-390.png"),fullPage:true});
 await referencePage.close();
 console.log("Cuenta Clara 2.0: flujos invitado, propina, productos e historial aprobados.");
 if(errs.length){console.warn("Errores de terceros:",errs.slice(0,4));}
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;server.kill();});
