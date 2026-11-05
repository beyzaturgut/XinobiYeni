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
async function fixture({write=true,existing=null,configured=true,malformed=false,createError=false,awaiting=false,delayed=false}={}){
 const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage();let creates=0,labels=0,refreshes=0;let current=existing
 page.on('dialog',d=>d.accept());const failures=[];page.on('pageerror',e=>failures.push(e.message))
 await page.route('**/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname,post=req.method()==='POST'
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Test'},permissions:write?['orders.read','orders.write','integration.read']:['orders.read','integration.read']}})
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:[order]})
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
   if(post){creates++;assert.deepEqual(req.postDataJSON(),{parcelCount:1,parcelDesi:3,parcelKg:2,paymentType:1});await new Promise(r=>setTimeout(r,250));if(createError)return route.fulfill({status:503,json:{title:"Gönderim sonucu doğrulanamadı; kayıt durumunu yenileyin."}});current=registration;return route.fulfill({json:registration})}
   return current?route.fulfill({json:current}):route.fulfill({status:204})
  }
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=orders');await page.getByRole('button',{name:'SEC-SURAT detayını aç'}).click()
 const region=page.getByRole('region',{name:'Sürat Kargo gönderisi'});if(delayed)await region.getByText('Kargo kaydı yükleniyor…').waitFor();if(malformed)await region.getByRole('alert').waitFor();else await region.getByText('Ortam: TEST',{exact:false}).first().waitFor()
 return{page,region,context,counts:()=>({creates,labels,refreshes}),close:async()=>{assert.deepEqual(failures,[]);await context.close()}}
}
try{
 {const f=await fixture();await f.region.getByLabel('Paket sayısı').fill('1');await f.region.getByLabel('Tek paketin desisi').fill('3');await f.region.getByLabel('Tek paketin ağırlığı (kg)').fill('2');await f.region.getByLabel('Kargo ücretini ödeyen').selectOption('1')
  const button=f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'});await button.click();await button.evaluate(element=>element.click()).catch(()=>{});await f.region.getByText('Gönderi referansı:',{exact:false}).waitFor();assert.equal(f.counts().creates,1)
  const saved=f.page.waitForEvent('download');await f.region.getByRole('button',{name:'Test etiketini indir (SVG)'}).click();assert.equal((await saved).suggestedFilename(),'test-label.svg');assert.equal(f.counts().creates,1);assert.equal(f.counts().labels,1)
  await f.region.getByRole('button',{name:'Takibi sorgula'}).click();await f.region.getByRole('alert').filter({hasText:'Son başarılı veri korunuyor'}).waitFor();assert.equal(f.counts().refreshes,1)
  assert.equal(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
  await f.page.screenshot({path:output+'/surat-390.png',fullPage:true});await f.page.setViewportSize({width:1440,height:1000});await f.page.screenshot({path:output+'/surat-1440.png',fullPage:true});await f.close()}
 {const f=await fixture({write:false});assert.equal(await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).isDisabled(),true);assert.equal(f.counts().creates,0);await f.close()}
 {const f=await fixture({configured:false});assert.equal(await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).isDisabled(),true);await f.region.getByText('Kapalı veya hesap ayarı eksik',{exact:false}).waitFor();await f.close()}
 {const f=await fixture({existing:{reference,state:'reconciliation_required',message:'Sonuç kesinleşmedi; ikinci gönderim engellendi.'}});assert.equal(await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).count(),0);await f.region.getByLabel('Sağlayıcı kabul kanıtı').waitFor();assert.equal(f.counts().creates,0);await f.close()}
 {const f=await fixture();await f.page.goto(base+'?view=integrations');await f.page.getByRole('button',{name:'Sürat Kargo',exact:true}).click();const status=f.page.getByRole('region',{name:'Sürat Kargo bağlantı durumu'});await status.getByText('Tanımlı',{exact:true}).waitFor();await status.getByText('Kabul bekliyor; kapalı',{exact:true}).waitFor();assert.equal(f.counts().creates,0);await f.close()}
 {const f=await fixture({existing:registration,malformed:true});await f.region.getByRole('alert').filter({hasText:'Kargo takip yanıtı doğrulanamadı'}).waitFor();assert.equal(await f.page.getByRole('dialog').isVisible(),true);await f.close()}
 {const f=await fixture({createError:true});await f.region.getByLabel('Paket sayısı').fill('1');await f.region.getByLabel('Tek paketin desisi').fill('3');await f.region.getByLabel('Tek paketin ağırlığı (kg)').fill('2');await f.region.getByLabel('Kargo ücretini ödeyen').selectOption('1');await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).click();await f.region.getByRole('alert').waitFor();assert.equal(await f.region.getByLabel('Paket sayısı').inputValue(),'1');assert.equal(await f.region.getByLabel('Tek paketin desisi').inputValue(),'3');assert.equal(await f.region.getByLabel('Tek paketin ağırlığı (kg)').inputValue(),'2');assert.equal(await f.region.getByLabel('Kargo ücretini ödeyen').inputValue(),'1');assert.equal(f.counts().creates,1);assert.equal(await f.region.getByRole('button',{name:'Test ortamında gönderi oluştur'}).isDisabled(),true);await f.region.getByText('Kayıt durumu doğrulanamadı; önce kargo kaydını yenileyin.',{exact:true}).waitFor();await f.close()}
 {const f=await fixture({existing:registration,awaiting:true,delayed:true});await f.region.getByText('Şube kabulü veya hareket bekleniyor.',{exact:true}).waitFor();assert.equal(f.counts().creates,0);await f.close()}
 console.log('PASS: create once, label without recreate, stale tracking, read-only/config gates, ambiguous flow, responsive screenshots, form preserved after create error, loading and awaiting acceptance')
}finally{await browser.close()}
