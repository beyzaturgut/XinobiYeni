// Real Chrome, synthetic API only (SIP-TAS-03): no account, order, catalog or file is read or written.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {join} from 'node:path'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/',output=process.env.ADMIN_CONSISTENCY_OUTPUT
const money={amountMinor:99000,currency:'TRY'},sha='a'.repeat(64),other='b'.repeat(64)
const longConfiguration='CFG-'+'çok-uzun-konfigürasyon-kimliği-'.repeat(3)
const file=hash=>({sha256:hash,mime:'image/png',bytes:2048})
const orders={
 // Real zeros, two body regions with partly saved fields, matching pattern file.
 REV:{schemaVersion:1,configurationId:longConfiguration,configurationRevision:7,sourceSha256:sha,files:{pattern:file(sha),productSource:file('c'.repeat(64)),composition:null},
  placement:{sourceWidth:2000,sourceHeight:1000,surfaceVersion:'d'.repeat(64),x:0,y:250,scale:1,rotation:0,curvatureStrength:0,mode:'pattern',fillMask:true,
   bodyAdjustments:{'upper-body':{x:0,y:-12.5},'lower-body':{scale:.9,rotation:5}}}},
 // Another canvas size, unsaved mode/fill/schema, no regions and a pattern file of another revision.
 CANVAS:{schemaVersion:null,configurationId:'CFG-B',configurationRevision:2,sourceSha256:sha,files:{pattern:file(other),productSource:null,composition:null},
  placement:{sourceWidth:500,sourceHeight:800,surfaceVersion:'e'.repeat(64),x:250,y:800,scale:2.5,rotation:-30,curvatureStrength:.75}},
 FUTURE:{schemaVersion:99,configurationId:'CFG-C',configurationRevision:1,sourceSha256:sha,placement:{sourceWidth:10,sourceHeight:10,surfaceVersion:'f'.repeat(64),x:1,y:1,scale:1,rotation:0,curvatureStrength:0,futureField:'yorumlanmaz'}},
 LEGACY:{},
}
const staffOrder=key=>({accountId:'synthetic',customerName:'Synthetic',customerEmail:'synthetic@example.invalid',order:{id:key,number:'PLC-'+key,createdAt:'2026-11-03T09:00:00Z',status:'received',
 address:{title:'Ev',fullName:'Synthetic',phone:'+905321234567',line:'Synthetic adres',district:'Test',city:'Test'},total:money,history:[],requests:[],
 lines:[{productId:'P-SYN',variantId:'V-SYN',name:'Synthetic ürün',color:'Yeşil',quantity:1,unitPrice:money,lineTotal:money,
  personalization:{designId:'D-'+key,kind:'upload',name:'Synthetic müşteri tasarımı '+key,imageUrl:`/api/v1/local-commerce/orders/${key}/lines/0/design`,sku:'SKU-'+key,...orders[key]}}]}})
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=','base64')
async function open(key,width=1440){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];let writes=0
 page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/**',route=>{
  const request=route.request(),path=new URL(request.url()).pathname
  if(request.method()!=='GET'){writes++;return route.fulfill({status:403,json:{title:'Read-only fixture'}})}
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['orders.read']}})
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:Object.keys(orders).map(staffOrder)})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['Synthetic kargo'],returnWindowDays:14}})
  if(path.endsWith('/design'))return route.fulfill({body:png,contentType:'image/png'})
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=orders');await page.getByRole('button',{name:`PLC-${key} detayını aç`}).click()
 const layout=page.getByRole('region',{name:'Sipariş tasarım detayı · 1. satır'}).getByRole('region',{name:'Kayıtlı yerleşim'})
 await layout.waitFor()
 return {page,layout,close:async()=>{assert.deepEqual(errors,[]);assert.equal(writes,0);await context.close()}}
}
const value=(layout,label)=>layout.locator('dl>div').filter({has:layout.page().getByText(label,{exact:true})}).locator('dd')
try{
 { const {layout,close}=await open('REV')
  await layout.getByText(`PLC-REV · 1. satır · konfigürasyon ${longConfiguration} · revizyon 7`).waitFor()
  assert.match(await value(layout,'Kaynak tuval').innerText(),/^2\.000 × 1\.000 px/)
  assert.match(await value(layout,'Yatay konum (desen merkezi)').innerText(),/^0 px\s*Tuval genişliğinin soldan %0 /,'A saved zero is a real zero')
  assert.match(await value(layout,'Dikey konum (desen merkezi)').innerText(),/^250 px\s*Tuval yüksekliğinin üstten %25 /)
  assert.match(await value(layout,'Döndürme').innerText(),/^0°\s*Döndürülmemiş/)
  assert.match(await value(layout,'Yüzey kavisi').innerText(),/^0\s*0 = kavis uygulanmaz/)
  assert.match(await value(layout,'Yerleşim modu').innerText(),/^Desen/);assert.equal(await value(layout,'Maske alanını doldurma').innerText(),'Açık')
  const upper=layout.locator('dl').filter({hasText:'Üst gövde'}),lower=layout.locator('dl').filter({hasText:'Alt gövde'})
  assert.equal(await upper.locator(':scope>div').filter({hasText:'Ek yatay kaydırma'}).locator('dd').innerText(),'0 px')
  assert.equal(await upper.locator(':scope>div').filter({hasText:'Ek dikey kaydırma'}).locator('dd').innerText(),'-12,5 px')
  assert.match(await upper.locator(':scope>div').filter({hasText:'Ek ölçek'}).locator('dd').innerText(),/^Kaydedilmemiş\s*Ana ölçek aynen uygulanır/,'Unsaved region scale is not 1 or 0')
  assert.match(await lower.locator(':scope>div').filter({hasText:'Ek ölçek'}).locator('dd').innerText(),/^0,9 kat/)
  assert.match(await lower.locator(':scope>div').filter({hasText:'Ek döndürme'}).locator('dd').innerText(),/^5°/)
  assert.match(await lower.locator(':scope>div').filter({hasText:'Ek yatay kaydırma'}).locator('dd').innerText(),/^Kaydedilmemiş\s*Ek kaydırma uygulanmadı/)
  await layout.getByRole('status').filter({hasText:'SHA-256 eşleşiyor'}).waitFor()
  await close() }
 { const {layout,close}=await open('CANVAS')
  assert.match(await value(layout,'Kaynak tuval').innerText(),/^500 × 800 px/)
  assert.match(await value(layout,'Yatay konum (desen merkezi)').innerText(),/%50 /,'Percent follows this order\'s own canvas')
  assert.match(await value(layout,'Dikey konum (desen merkezi)').innerText(),/^800 px\s*Tuval yüksekliğinin üstten %100 /)
  assert.match(await value(layout,'Döndürme').innerText(),/^-30°\s*Saat yönünün tersine/)
  assert.equal(await value(layout,'Yerleşim modu').innerText(),'Kaydedilmemiş');assert.equal(await value(layout,'Maske alanını doldurma').innerText(),'Kaydedilmemiş')
  await layout.getByText('Şema sürümü bu siparişte kaydedilmemiş; değerler mevcut şemaya göre okunuyor.').waitFor()
  await layout.getByText('Bölgeye özel ayar kaydedilmemiş; ana yerleşim tüm yüzeye uygulanır.').waitFor()
  await layout.getByRole('alert').filter({hasText:'eşleşmiyor'}).waitFor()
  await close() }
 { const {layout,close}=await open('FUTURE')
  await layout.getByText(/99\. şema sürümüyle kaydedilmiş; bu ekran 1 ve 2\. sürümleri yorumlar\. Kayıt değiştirilmedi/).waitFor()
  assert.match(await layout.locator('pre').innerText(),/"futureField": "yorumlanmaz"/)
  assert.equal(await layout.getByText('Yatay konum (desen merkezi)').count(),0,'Unsupported schema values are not interpreted')
  await close() }
 { const {layout,close}=await open('LEGACY')
  await layout.getByText('Bu eski siparişte yerleşim ayarları kaydedilmemiş; güncel tasarımdan tahmin edilmez.').waitFor()
  assert.equal(await layout.locator('dl>div').filter({hasText:'Kaynak tuval'}).count(),0)
  await close() }
 for(const width of [320,390,1440])for(const text of [1,2]){
  const {page,layout,close}=await open('REV',width)
  // Measure after the raw pattern preview has loaded, so its layout is final.
  await page.getByRole('dialog').getByRole('img').evaluate(image=>image.decode())
  if(text===2)await page.evaluate(()=>{for(const e of document.querySelectorAll('dialog *'))e.style.setProperty('font-size',parseFloat(getComputedStyle(e).fontSize)*2+'px','important')})
  const dialog=page.getByRole('dialog')
  assert.deepEqual(await dialog.evaluate(element=>{const box=element.getBoundingClientRect();return element.scrollWidth>element.clientWidth+1?[...element.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>box.right+1&&![...e.children].some(c=>c.getBoundingClientRect().right>box.right+1)).slice(0,6).map(e=>e.tagName+'.'+e.className+' '+e.textContent.slice(0,40)):[]}),[],`Dialog overflow ${width}px ${text}x`)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Page overflow ${width}px ${text}x`)
  if(output){await layout.evaluate(element=>element.scrollIntoView({block:'start'}));await page.screenshot({path:join(output,`order-placement-${width}-${text}x.png`)})}
  await close()
 }
 console.log('PASS: saved revision/owner line, two canvas sizes and percent labels, real zero vs unsaved fields, two body regions, unsupported and missing schema, legacy order, pattern binding match/mismatch, long id at 320/390/1440 px normal and 200 % text, no writes')
}finally{await browser.close()}
