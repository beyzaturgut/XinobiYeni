// Every API response is isolated; no real account, catalogue, provider, or order is mutated.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir,writeFile} from 'node:fs/promises'
import {mockPanel,store,permissions} from './consistency-fixtures.mjs'
const {chromium,expect}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/',output=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-admin-consistency-states'
await mkdir(output,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),results=[]
async function scenario(name,run,options={}){
 const context=await browser.newContext({viewport:{width:390,height:1000}}),page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message))
 let fail=true,writes=0
 await mockPanel(page,{...options,handler:async(route,path)=>{
  if(options.handler&&await options.handler(route,path))return true
  if(route.request().method()!=='GET'){
   writes++;await new Promise(r=>setTimeout(r,150));await route.fulfill(fail?{status:409,json:{title:'İzole işlem hatası'}}:{json:path.endsWith('/content')||path.includes('/products/')?store:{}});return true
  }return false
 }})
 try{await run({page,success:()=>{fail=false},writes:()=>writes});assert.deepEqual(errors,[]);results.push({name,result:'PASS'});console.log('PASS',name)}finally{await context.close()}
}
const error=page=>page.getByRole('alert').filter({hasText:'İzole işlem hatası'})
try{
 await scenario('order failed action is alert, draft remains, success only after confirmation',async({page,success,writes})=>{
  await page.goto(base+'?view=orders');await page.getByRole('button',{name:'UI-ORDER detayını aç'}).click();const modal=page.getByRole('dialog'),note=modal.getByLabel('Not (müşteriye iletilir, isteğe bağlı)');await note.fill('Korunacak sipariş notu')
  page.once('dialog',d=>d.accept());const button=modal.getByRole('button',{name:'Hazırlanmaya başla'});await button.click();await expect(button).toBeDisabled();await expect(error(page)).toBeVisible();await expect(note).toHaveValue('Korunacak sipariş notu');assert.equal(writes(),1);await expect(modal.getByRole('status').filter({hasText:'Sipariş hazırlanıyor.'})).toHaveCount(0)
  success();page.once('dialog',d=>d.accept());await button.click();await expect(modal.getByRole('status').filter({hasText:'Sipariş hazırlanıyor.'})).toBeVisible();await expect(error(page)).toHaveCount(0);assert.equal(writes(),2)
 })
 await scenario('quote failed send is alert and preserves message, success clears confirmed draft',async({page,success})=>{
  await page.goto(base+'?view=quotes');await page.getByRole('button',{name:'Aç',exact:true}).click();const field=page.getByLabel('Firmaya mesaj');await field.fill('Korunacak teklif mesajı');await page.getByRole('button',{name:'Gönder',exact:true}).click();await expect(error(page)).toBeVisible();await expect(field).toHaveValue('Korunacak teklif mesajı');success();await page.getByRole('button',{name:'Gönder',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Mesaj kaydedildi'})).toBeVisible();await expect(field).toHaveValue('')
 })
 await scenario('review failed moderation keeps reply form and displays alert',async({page,success,writes})=>{
  await page.goto(base+'?view=reviews');const field=page.getByLabel('Mağaza yanıtı (yayınlanır, isteğe bağlı)');await field.fill('Korunacak mağaza yanıtı');await page.getByRole('button',{name:'Onayla ve yayınla'}).click();await expect(error(page)).toBeVisible();await expect(field).toHaveValue('Korunacak mağaza yanıtı');await page.screenshot({path:output+'/review-failure-390.png',fullPage:true});success();await page.getByRole('button',{name:'Onayla ve yayınla'}).click();await expect(page.getByRole('status').filter({hasText:'Değerlendirme kaydedildi'})).toBeVisible();assert.equal(writes(),2)
 })
 await scenario('AI failed policy write keeps draft and alerts rather than success status',async({page,success})=>{
  await page.goto(base+'?view=ai');await page.getByRole('button',{name:'Yeni sürüm hazırla'}).click();const reason=page.getByLabel('Değişiklik gerekçesi');await reason.fill('Korunacak gerekçe');await page.getByRole('button',{name:'Yürürlüğe al'}).click();await expect(error(page)).toBeVisible();await expect(reason).toHaveValue('Korunacak gerekçe');success();await page.getByRole('button',{name:'Yürürlüğe al'}).click();await expect(page.getByRole('status').filter({hasText:'Yeni politika sürümü yürürlükte.'})).toBeVisible()
 })
 await scenario('content save lock, failed draft retained, confirmed save status',async({page,success,writes})=>{
  await page.goto(base+'?view=content');const name=page.getByLabel('İçerik adı',{exact:true});await name.fill('Korunacak içerik');const button=page.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true});await button.click();await expect(name).toBeDisabled();await expect(error(page)).toBeVisible();await expect(name).toHaveValue('Korunacak içerik');assert.equal(writes(),1);success();await button.click();await expect(page.getByRole('status').filter({hasText:'İçerik kaydedildi.'})).toBeVisible();assert.equal(writes(),2);await expect.poll(()=>page.locator('.media-preview img').evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);await page.screenshot({path:output+'/content-390.png',fullPage:true})
 })
 await scenario('announcement write failure alerts and preserves form',async({page})=>{
  await page.goto(base+'?view=content');await page.getByRole('button',{name:'Haber ve duyurular',exact:true}).click();await page.getByLabel('Başlık',{exact:true}).fill('Korunacak duyuru');await page.getByLabel('Metin',{exact:true}).fill('Korunacak duyuru metni');await page.getByRole('button',{name:'Yayımla',exact:true}).click();await expect(error(page)).toBeVisible();await expect(page.getByLabel('Başlık',{exact:true})).toHaveValue('Korunacak duyuru')
 })
 await scenario('catalog delete failure never announces success or removes row',async({page,writes})=>{
  page.on('dialog',d=>d.accept());await page.goto(base+'?view=catalog');await page.getByRole('button',{name:'Sil',exact:true}).click();await expect(error(page)).toBeVisible();await expect(page.getByRole('rowheader',{name:'UI-P1',exact:true})).toBeVisible();assert.equal(writes(),1)
 })
 await scenario('missing catalogue count is unknown in integrations rather than zero',async({page})=>{
  await page.goto(base+'?view=integrations');await page.getByRole('button',{name:'Uzlaştırma',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Uzlaştırma:'})).toContainText('yerel varyant sayısı bilinmiyor');await expect(page.getByText('Katalogda 0 yerel varyant var;',{exact:false})).toHaveCount(0)
 },{handler:async(route,path)=>{if(path.endsWith('/state')){await route.fulfill({status:503,json:{title:'İzole katalog kesintisi'}});return true}return false}})
 await scenario('surface loading then error never presents zero/empty, retry shows confirmed empty',async({page})=>{
  await page.goto(base+'?view=surfaces');await expect(page.getByRole('status').filter({hasText:'Ürün yüzeyleri yükleniyor'})).toBeVisible();await expect(page.getByRole('button',{name:'Tümü (0)',exact:true})).toHaveCount(0);await expect(page.getByRole('alert').filter({hasText:'İzole yüzey kesintisi'})).toBeVisible();await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await expect(page.getByRole('button',{name:'Tümü (0)',exact:true})).toBeVisible()
 },{handler:(()=>{let calls=0;return async(route,path)=>{if(path.endsWith('/surfaces/products')){calls++;await new Promise(r=>setTimeout(r,400));await route.fulfill(calls<=2?{status:503,json:{message:'İzole yüzey kesintisi'}}:{json:[]});return true}return false}})()})
 await scenario('undefined price remains undefined and table keyboard region is reachable',async({page})=>{
  await page.goto(base+'?view=pricing');await expect(page.getByRole('cell',{name:'Tanımlanmadı',exact:true})).toBeVisible();const table=page.getByRole('region',{name:'Kaydırılabilir veri tablosu'});await table.focus();await expect(table).toBeFocused();await page.keyboard.press('ArrowRight');const before=await table.evaluate(e=>e.scrollLeft);assert.ok(before>=0)
 })
 await scenario('catalog dialog Tab containment, Escape and return focus',async({page})=>{
  await page.goto(base+'?view=catalog');const trigger=page.getByRole('button',{name:'İzole tutarlılık ürünü ürününü düzenle'});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();const buttons=dialog.locator('button:enabled');await buttons.last().focus();await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(e=>e.contains(document.activeElement)),true);await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(trigger).toBeFocused()
 })
 await scenario('server 403 is an authorization alert rather than empty data',async({page})=>{
  await page.goto(base+'?view=quotes');await expect(page.getByRole('alert')).toContainText('Bu işlem için yetkiniz yok.');await expect(page.getByText('Talep yok',{exact:true})).toHaveCount(0)
 },{handler:async(route,path)=>{if(path.endsWith('/quotes')){await route.fulfill({status:403,json:{}});return true}return false}})
 await scenario('read-only permission disables price writes',async({page,writes})=>{
  await page.goto(base+'?view=pricing');await expect(page.getByRole('button',{name:'UI-SKU fiyatını düzenle'})).toBeDisabled();assert.equal(writes(),0)
 },{permissions:permissions.filter(p=>!p.endsWith('.write')&&!p.endsWith('.cancel'))})
 await scenario('read-only content allows tab inspection but blocks edits and sends no write',async({page,writes})=>{
  await page.goto(base+'?view=content');await expect(page.getByLabel('İçerik adı',{exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Haber ve duyurular',exact:true}).click();await expect(page.getByRole('button',{name:'Yayımla',exact:true})).toBeDisabled();assert.equal(writes(),0)
 },{permissions:permissions.filter(p=>!p.endsWith('.write')&&!p.endsWith('.cancel'))})
 await scenario('read-only surface detail permits inspection but blocks mask mutations',async({page,writes})=>{
  await page.goto(base+'?view=surfaces');await page.locator('.surface-row').click();await expect(page.getByLabel('Maske WebP dosyası')).toBeDisabled();await expect(page.getByRole('button',{name:'WebP maskeyi taslağa yükle'})).toBeDisabled();assert.equal(writes(),0)
 },{permissions:permissions.filter(p=>!p.endsWith('.write')&&!p.endsWith('.cancel')),handler:async(route,path)=>{
  const item={productId:'UI-P1',productName:'İzole ürün',profileRevision:1,sourceRevision:1,sourceStatus:'ready',status:'none',source:{image:'/assets/products/tea-maker-101-red.webp',width:100,height:100,sha256:'a'.repeat(64),mime:'image/webp',bytes:100},draft:null,approved:null};
  if(path.endsWith('/surfaces/products')){await route.fulfill({json:[item]});return true}
  if(path.endsWith('/surfaces/products/UI-P1')){await route.fulfill({json:item});return true}return false
 }})
 await writeFile(output+'/results.json',JSON.stringify(results,null,2));console.log(results.length+' scenarios passed')
}finally{await browser.close()}
