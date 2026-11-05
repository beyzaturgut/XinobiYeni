// Synthetic provider/commerce only. Never calls a carrier or changes real orders.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
const output=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-surat-ui'
await mkdir(output,{recursive:true})
const money={amountMinor:1000,currency:'TRY'},reference='XNB-0123456789ABCDEF0123456789ABCDEF'
const registration={reference,state:'registered',message:'Gönderi kaydı alındı; şube kabulü bekleniyor. Sipariş henüz kargolandı sayılmaz.'}
const order={accountId:'fixture',customerName:'Fixture',customerEmail:'fixture@example.invalid',order:{id:'ORDA',number:'SEC-SURAT',createdAt:'2026-11-03T09:00:00Z',status:'received',address:{title:'Test',fullName:'Test alıcı',phone:'+905550000000',line:'Test adres',district:'Test',city:'Test'},total:money,lines:[{productId:'P',variantId:'V',name:'Test ürün',color:'Test',quantity:1,unitPrice:money,lineTotal:money}],history:[],requests:[]}}
async function fixture({write=true,existing=null,configured=true,malformed=false,createError=false,awaiting=false,delayed=false,holdCreate=null,record=order}={}){
 const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage();let creates=0,labels=0,refreshes=0;let current=existing
 const failures=[];page.on('pageerror',e=>failures.push(e.message))
 await page.route('**/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname,post=req.method()==='POST'
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Test'},permissions:write?['orders.read','orders.write','orders.cancel','integration.read']:['orders.read','integration.read']}})
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:[record]})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['Sürat Kargo'],returnWindowDays:14}})
  if(path.endsWith('/shipping/surat/status'))return route.fulfill({json:{enabled:configured,mode:'Sandbox',accountConfigured:configured,pollingEnabled:false,liveOperationsAllowed:false}})
  if(path.endsWith('/surat-shipment/label')){labels++;return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>',headers:{'Content-Disposition':'attachment; filename=test-label.svg','Access-Control-Expose-Headers':'Content-Disposition'}})}
  if(path.endsWith('/surat-shipment/tracking')){
   if(post)refreshes++
   if(malformed)return route.fulfill({json:{environment:'Sandbox',result:'available',items:[null]}})
   return current?route.fulfill({json:{environment:'Sandbox',result:awaiting?'awaiting_acceptance':post?'unavailable':'available',lastSuccess:'2026-11-03T09:00:00Z',items:awaiting?[]:[{trackingNumber:'TEST-TRACK',state:'needs_review',providerText:'Test sağlayıcı durumu'}]}}):route.fulfill({status:204})
  }
  if(path.endsWith('/surat-shipment')){
   if(!post&&delayed)await new Promise(r=>setTimeout(r,500))
   if(post){creates++;assert.deepEqual(req.postDataJSON(),{parcelCount:1,parcelDesi:3,parcelKg:2,paymentType:1});if(holdCreate)await holdCreate;else await new Promise(r=>setTimeout(r,250));if(createError)return route.fulfill({status:503,json:{title:"Gönderim sonucu doğrulanamadı; kayıt durumunu yenileyin."}});current=registration;return route.fulfill({json:registration})}
   return current?route.fulfill({json:current}):route.fulfill({status:204})
  }
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=orders');await page.getByRole('button',{name:'SEC-SURAT detayını aç'}).click()
 const region=page.getByRole('region',{name:'Sürat Kargo gönderisi'});if(delayed)await region.getByText('Kargo kaydı yükleniyor…').waitFor();if(malformed)await region.getByRole('alert').waitFor();else await region.getByText('Ortam: TEST',{exact:false}).first().waitFor()
 return{page,region,context,counts:()=>({creates,labels,refreshes}),close:async()=>{assert.deepEqual(failures,[]);await context.close()}}
}
async function fill(f){await f.region.getByLabel('Paket sayısı').fill('1');await f.region.getByLabel('Tek paketin desisi').fill('3');await f.region.getByLabel('Tek paketin ağırlığı (kg)').fill('2');await f.region.getByLabel('Kargo ücretini ödeyen').selectOption('1')}
try{
 {const f=await fixture();const note=f.page.getByLabel('Not (müşteriye iletilir, isteğe bağlı)');await note.fill('SENTETIK TASLAK');let prompts=0;const refuse=async d=>{prompts++;assert.match(d.message(),/Kaydedilmemiş/);await d.dismiss()};f.page.on('dialog',refuse);
 await f.page.getByRole('button',{name:'Sipariş detayını kapat'}).click();assert.equal(await note.inputValue(),'SENTETIK TASLAK');assert.equal(await f.page.getByRole('dialog').isVisible(),true);
 await f.page.keyboard.press('Escape');assert.equal(await f.page.getByRole('dialog').isVisible(),true);
 assert.equal(await f.page.evaluate(()=>window.dispatchEvent(new Event('xinobi:before-navigation',{cancelable:true}))),false);assert.equal(prompts,3);await f.page.evaluate(()=>document.querySelector('[data-nav-view=integrations]').click());assert.equal(new URL(f.page.url()).searchParams.get('view'),'orders');assert.equal(await note.inputValue(),'SENTETIK TASLAK');assert.equal(prompts,4);
 f.page.off('dialog',refuse);f.page.once('dialog',d=>d.accept());await f.page.getByRole('button',{name:'Sipariş detayını kapat'}).click();await f.page.getByRole('button',{name:'SEC-SURAT detayını aç'}).click();assert.equal(await note.inputValue(),'');assert.equal(f.counts().creates,0);await f.close()}
 {const f=await fixture();await fill(f);f.page.once('dialog',async d=>{assert.match(d.message(),/SEC-SURAT/);assert.match(d.message(),/Ortam: TEST/);assert.match(d.message(),/3 desi/);await d.dismiss()});await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).click();assert.equal(f.counts().creates,0);assert.equal(await f.region.getByLabel('Tek paketin desisi').inputValue(),'3');await f.close()}
 {let release;const held=new Promise(r=>release=r);const f=await fixture({holdCreate:held});await fill(f);f.page.on('dialog',d=>d.accept());await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).click();await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).waitFor();
 await f.page.getByRole('button',{name:'Sipariş detayını kapat'}).click();await f.page.getByRole('alert').filter({hasText:'İşlem sürüyor.'}).waitFor();assert.equal(await f.page.getByRole('dialog').isVisible(),true);assert.equal(await f.region.getByLabel('Paket sayısı').isDisabled(),true);assert.equal(await f.page.getByRole('button',{name:'Hazırlanmaya başla'}).isDisabled(),true);release();await f.region.getByText('Gönderi referansı:',{exact:false}).waitFor();assert.equal(f.counts().creates,1);
 const download=f.page.waitForEvent('download');await f.region.getByRole('button',{name:'Test etiketini indir (SVG)'}).click();await download;await f.region.getByRole('status').filter({hasText:'tarayıcıya indirme için verildi'}).waitFor();assert.equal(f.counts().creates,1);await f.close()}
 {const f=await fixture({write:false});assert.equal(await f.region.getByLabel('Paket sayısı').isDisabled(),true);assert.equal(await f.region.getByLabel('Kargo ücretini ödeyen').isDisabled(),true);await f.close()}
 {const f=await fixture({existing:{reference,state:'reconciliation_required',message:'Sonuç kesinleşmedi'}});assert.equal(await f.region.getByLabel('Sağlayıcının teyit ettiği sonuç').inputValue(),'');assert.equal(await f.region.getByRole('button',{name:'Sağlayıcı teyidini kaydet'}).isDisabled(),true);await f.region.getByLabel('Sağlayıcı kabul kanıtı').fill('Sentetik yazılı teyit');assert.equal(await f.region.getByRole('button',{name:'Sağlayıcı teyidini kaydet'}).isDisabled(),true);
 for(const width of [320,390,768,1440]){await f.page.setViewportSize({width,height:900});assert.equal(await f.page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);await f.page.screenshot({path:output+'/manual-confirm-'+width+'.png',fullPage:true});
 const sizes=await f.page.getByRole('dialog').evaluate(e=>[...e.querySelectorAll('*')].map(n=>parseFloat(getComputedStyle(n).fontSize)));
 await f.page.getByRole('dialog').evaluate((e,sizes)=>[...e.querySelectorAll('*')].forEach((n,i)=>n.style.setProperty('font-size',sizes[i]*2+'px')),sizes);
 assert.equal(await f.page.getByRole('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true,'manual confirmation 200% text');
 if(width===320)await f.page.screenshot({path:output+'/manual-confirm-320-2x.png',fullPage:true});
 await f.page.getByRole('dialog').evaluate(e=>[...e.querySelectorAll('*')].forEach(n=>n.style.removeProperty('font-size')))
 }await f.close()}
 {const f=await fixture();let confirmations=0;f.page.on('dialog',async d=>{confirmations++;assert.match(d.message(),/SEC-SURAT/);await d.dismiss()});let writes=0;await f.page.route('**/local-commerce/orders/ORDA/**',route=>{writes++;return route.fulfill({json:{}})});await f.page.getByRole('button',{name:'Hazırlanmaya başla'}).click();assert.equal(confirmations,1);assert.equal(writes,0);await f.close()}
 // Every critical order action has a shared review step; cancellation must be side-effect free.
 for(const [status,request,label] of [
  ['received',null,'Hazırlanmaya başla'],['shipped',null,'Teslim edildi'],['received',null,'Siparişi iptal et'],
  ['received',{id:'REQ',type:'cancel',status:'requested',reason:'Fixture',lines:[],createdAt:'2026-11-03'},'İptali onayla'],
  ['received',{id:'REQ',type:'return',status:'requested',reason:'Fixture',lines:[],createdAt:'2026-11-03'},'İadeyi onayla'],
  ['received',{id:'REQ',type:'return',status:'approved',reason:'Fixture',lines:[],createdAt:'2026-11-03'},'Ürün depoya ulaştı · iadeyi tamamla']]){
   const record=structuredClone(order);record.order.status=status;record.order.requests=request?[request]:[];
   const f=await fixture({record});let writes=0;await f.page.route('**/local-commerce/orders/ORDA/**',route=>{writes++;return route.fulfill({json:{}})});
   f.page.once('dialog',d=>d.dismiss());await f.page.getByRole('button',{name:label,exact:true}).click();assert.equal(writes,0);
   f.page.once('dialog',d=>d.accept());await f.page.getByRole('button',{name:label,exact:true}).click();await f.page.getByRole('status').filter({hasText:'Bildirim kuyruğa alındı'}).waitFor();assert.equal(writes,1);await f.close()
 }
 console.log('PASS: dirty X/Escape/navigation reject retains draft; explicit discard; create summary cancel=0 writes; busy close blocked; one write; readonly fields; label handoff; neutral manual confirmation; 4 widths; order action cancellation')
}finally{await browser.close()}
