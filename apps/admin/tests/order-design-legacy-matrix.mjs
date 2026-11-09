// Real Chrome, synthetic API only (SIP-TAS-08): older, incomplete and partial order design records, one card at a time.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {join} from 'node:path'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/',output=process.env.ADMIN_CONSISTENCY_OUTPUT
const money={amountMinor:1000,currency:'TRY'}
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=','base64')
const jpeg=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==','base64')
const ref=(sha,mime)=>({sha256:sha.repeat(64),mime,bytes:100})
const placement={sourceWidth:100,sourceHeight:100,surfaceVersion:'b'.repeat(64),x:0,y:10,scale:1,rotation:0,curvatureStrength:0}
const config={schemaVersion:1,configurationId:'CFG',configurationRevision:2,sourceSha256:'a'.repeat(64),placement,sku:'SKU-1'}
const records={
 PATTERN_ONLY:{},
 BEFORE_FILES:{...config},
 BEFORE_NO_COPY:{...config},
 NO_PREVIEW:{...config,files:{pattern:ref('a','image/png'),productSource:ref('c','image/png'),composition:null}},
 NO_SOURCE:{...config,files:{pattern:ref('a','image/png'),productSource:null,composition:ref('d','image/jpeg')}},
 FUTURE_SCHEMA:{...config,schemaVersion:99,files:{pattern:ref('a','image/png'),productSource:ref('c','image/png'),composition:ref('d','image/jpeg')}},
 OUTAGE:{...config,files:{pattern:ref('a','image/png'),productSource:ref('c','image/png'),composition:ref('d','image/jpeg')}},
}
const staffOrder=key=>({accountId:'synthetic',customerName:'Synthetic',customerEmail:'synthetic@example.invalid',order:{id:key,number:'OLD-'+key,createdAt:'2026-10-01T09:00:00Z',status:'delivered',
 address:{title:'Ev',fullName:'Synthetic',phone:'+905321234567',line:'Synthetic adres',district:'Test',city:'Test'},total:money,history:[],requests:[],
 lines:[{productId:'P',variantId:'V',name:'Synthetic ürün',color:'Mavi',quantity:1,unitPrice:money,lineTotal:money,
  personalization:{designId:'D-'+key,kind:'upload',name:'Synthetic desen '+key,imageUrl:`/api/v1/local-commerce/orders/${key}/lines/0/design`,...records[key]}}]}})
const file=(body,contentType,name,check)=>({body,contentType,headers:{'Access-Control-Expose-Headers':'Content-Disposition, X-Xinobi-File-Check','Content-Disposition':`attachment; filename=${name}`,'X-Xinobi-File-Check':check}})
async function open(key){
 const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage(),errors=[],paths=[];let writes=0
 page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/**',route=>{
  const request=route.request(),path=new URL(request.url()).pathname;paths.push(path)
  if(request.method()!=='GET'){writes++;return route.fulfill({status:403,json:{title:'Read-only fixture'}})}
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['orders.read']}})
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:Object.keys(records).map(staffOrder)})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['K'],returnWindowDays:14}})
  const legacy=!records[key].files?'unrecorded':'sha256'
  if(path.endsWith('/lines/0/design'))return key==='OUTAGE'?route.fulfill({status:503,json:{title:'Dosya deposu şu anda kullanılamıyor.',code:'feature_unavailable'}}):route.fulfill({body:png,contentType:'image/png'})
  if(path.endsWith('/lines/0/pattern'))return route.fulfill(file(png,'image/png',`xinobi-OLD-${key}-satir-1-desen.png`,legacy))
  if(path.endsWith('/lines/0/source'))return records[key].files?.productSource?route.fulfill(file(png,'image/png',`xinobi-OLD-${key}-satir-1-urun-kaynak.png`,'sha256'))
   :route.fulfill({status:404,json:{title:'Bu sipariş, ürün kaynak görseli kopyası saklanmadan önce verilmiş; güncel katalog fotoğrafı yerine kullanılmaz.',code:'order_source_not_recorded'}})
  if(path.endsWith('/lines/0/composition')){
   if(key==='OUTAGE')return route.fulfill({status:503,json:{title:'Dosya deposu şu anda kullanılamıyor.',code:'feature_unavailable'}})
   if(key==='BEFORE_NO_COPY')return route.fulfill({status:404,json:{title:'Bu sipariş, giydirilmiş önizleme kopyası saklanmadan önce verilmiş ve sipariş anında kopya oluşmamış; güncel tasarımla yeniden oluşturulmaz.',code:'order_composition_not_recorded'}})
   return route.fulfill(file(jpeg,'image/jpeg',`xinobi-OLD-${key}-satir-1-giydirilmis-onizleme-rev2.jpg`,legacy))
  }
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=orders');await page.getByRole('button',{name:`OLD-${key} detayını aç`}).click()
 const detail=page.getByRole('region',{name:'Sipariş tasarım detayı · 1. satır'});await detail.waitFor()
 const card=name=>detail.getByRole('article',{name})
 return {page,detail,paths,card,close:async()=>{
  assert.deepEqual(errors,[]);assert.equal(writes,0)
  assert.equal(paths.some(path=>/\/assets\/|\/media\/|\/admin\/designs\//.test(path)),false,'No catalogue photo or current design is fetched as a fallback')
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
  await context.close()}}
}
async function downloads(card,label,name){
 const button=card.getByRole('button',{name:label});const saved=card.page().waitForEvent('download');await button.click()
 assert.equal((await saved).suggestedFilename(),name);await card.getByRole('status').filter({hasText:'tarayıcıya indirme için verildi'}).waitFor()
}
const none=async(card,text)=>{await card.getByText(text).waitFor();assert.equal(await card.locator('button,img').count(),0,'An unavailable file offers no download')}
let checked=0
try{
 { const f=await open('PATTERN_ONLY')
  await f.card('Ham desen').getByText('Eski sipariş: desen sipariş anında kopyalandı, ancak doğrulama özeti kaydedilmedi.').waitFor()
  await downloads(f.card('Ham desen'),'Ham deseni indir','xinobi-OLD-PATTERN_ONLY-satir-1-desen.png')
  await f.detail.getByRole('region',{name:'Kayıtlı yerleşim'}).getByText('Bu eski siparişte yerleşim ayarları kaydedilmemiş; güncel tasarımdan tahmin edilmez.').waitFor()
  await none(f.card('Ürün kaynak görseli'),/kayıtlı yerleşim olmadığı için ürün kaynak görseli kopyası yok/)
  await none(f.card('Giydirilmiş önizleme'),/kayıtlı yerleşim olmadığı için giydirilmiş önizleme yok/)
  assert.equal(f.paths.some(path=>path.endsWith('/composition')),false,'Nothing to ask for without a placement')
  if(output)await f.page.screenshot({path:join(output,'legacy-pattern-only-390.png'),fullPage:false})
  await f.close();checked++ }
 { const f=await open('BEFORE_FILES')
  await none(f.card('Ürün kaynak görseli'),/saklanmadan önce verilmiş\. Güncel katalog fotoğrafı veya başka renk görseli yerine kullanılmaz/)
  const composed=f.card('Giydirilmiş önizleme');await composed.getByRole('img').waitFor()
  await composed.getByText('Eski sipariş: bu dosya sipariş anında kopyalandı, ancak doğrulama özeti kaydedilmedi.').waitFor()
  await downloads(composed,'Giydirilmiş önizlemeyi indir','xinobi-OLD-BEFORE_FILES-satir-1-giydirilmis-onizleme-rev2.jpg')
  await downloads(f.card('Ham desen'),'Ham deseni indir','xinobi-OLD-BEFORE_FILES-satir-1-desen.png')
  await f.close();checked++ }
 { const f=await open('BEFORE_NO_COPY'),composed=f.card('Giydirilmiş önizleme')
  await composed.getByRole('alert').filter({hasText:'sipariş anında kopya oluşmamış; güncel tasarımla yeniden oluşturulmaz'}).waitFor()
  assert.equal(await composed.locator('button,img').count(),0,'A record that was never kept has no retry or download')
  await downloads(f.card('Ham desen'),'Ham deseni indir','xinobi-OLD-BEFORE_NO_COPY-satir-1-desen.png')
  await f.close();checked++ }
 { const f=await open('NO_PREVIEW')
  await none(f.card('Giydirilmiş önizleme'),/sipariş anında giydirilmiş önizleme yüklenmemişti/)
  assert.equal(f.paths.some(path=>path.endsWith('/composition')),false)
  await downloads(f.card('Ürün kaynak görseli'),'Ürün kaynak görselini indir','xinobi-OLD-NO_PREVIEW-satir-1-urun-kaynak.png')
  assert.equal(await f.card('Ham desen').getByText(/doğrulama özeti kaydedilmedi/).count(),0,'Recorded copies are not called unverified')
  await f.close();checked++ }
 { const f=await open('NO_SOURCE')
  await none(f.card('Ürün kaynak görseli'),/Bu sipariş satırı için ürün kaynak görseli kopyası kaydedilmemiş/)
  await downloads(f.card('Giydirilmiş önizleme'),'Giydirilmiş önizlemeyi indir','xinobi-OLD-NO_SOURCE-satir-1-giydirilmis-onizleme-rev2.jpg')
  await f.close();checked++ }
 { const f=await open('FUTURE_SCHEMA')
  await f.detail.getByRole('region',{name:'Kayıtlı yerleşim'}).getByText(/99\. şema sürümüyle kaydedilmiş; bu ekran 1 ve 2\. sürümleri yorumlar/).waitFor()
  for(const [card,label] of [['Ham desen','Ham deseni indir'],['Ürün kaynak görseli','Ürün kaynak görselini indir'],['Giydirilmiş önizleme','Giydirilmiş önizlemeyi indir']])
   await f.card(card).getByRole('button',{name:label}).waitFor()
  await f.close();checked++ }
 { const f=await open('OUTAGE')
  await f.card('Ham desen').getByRole('alert').filter({hasText:'kaydın olup olmadığı bilinmiyor'}).waitFor()
  await f.card('Ham desen').getByRole('button',{name:'Deseni tekrar dene'}).waitFor()
  await f.card('Giydirilmiş önizleme').getByRole('alert').filter({hasText:'kaydın olup olmadığı bilinmiyor'}).waitFor()
  await f.card('Giydirilmiş önizleme').getByRole('button',{name:'Önizlemeyi tekrar dene'}).waitFor()
  assert.equal(await f.detail.getByText(/saklanmadan önce|kaydedilmemiş\.|yüklenmemişti/).count(),0,'A service error is never presented as a missing record')
  await downloads(f.card('Ürün kaynak görseli'),'Ürün kaynak görselini indir','xinobi-OLD-OUTAGE-satir-1-urun-kaynak.png')
  if(output)await f.page.screenshot({path:join(output,'legacy-outage-390.png'),fullPage:false})
  await f.close();checked++ }
 console.log(`PASS: ${checked} legacy/missing/partial record states: per-card messages and buttons, unverified older copies stay downloadable, never-kept files explained without retry, service errors retryable and not called missing, no catalogue/design fallback, no writes or overflow`)
}finally{await browser.close()}
