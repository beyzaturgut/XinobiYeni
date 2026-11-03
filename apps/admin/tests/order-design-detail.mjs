// Real Chrome, synthetic API only: no account, order, catalog or file is read or written.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {join} from 'node:path'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/',output=process.env.ADMIN_CONSISTENCY_OUTPUT
const pattern='<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#f4efe6"/><circle cx="70" cy="80" r="44" fill="#d1495b"/><rect x="120" y="36" width="88" height="88" fill="#00798c" transform="rotate(12 164 80)"/></svg>'
const money={amountMinor:125000,currency:'TRY'}
const placement={sourceWidth:1024,sourceHeight:1536,surfaceVersion:'c'.repeat(64),x:512.5,y:700,scale:.85,rotation:-12,curvatureStrength:0,mode:'artwork',fillMask:false,bodyAdjustments:{'upper-body':{x:4,y:null,scale:1.1,rotation:0}}}
const line=(id,legacy)=>({productId:'P-SYN',variantId:'V-SYN-BLUE',name:'Synthetic termos',color:'Mavi',quantity:1,unitPrice:money,lineTotal:money,personalization:{designId:'D-SYN',kind:legacy?'upload':'ai',name:'Synthetic çok uzun adlı müşteri tasarımı ve deseni',imageUrl:`/api/v1/local-commerce/orders/${id}/lines/0/design`,...(legacy?{}:{placement,schemaVersion:1,configurationId:'CFG-SYN',configurationRevision:3,sourceSha256:'d'.repeat(64),sku:'SYN-SKU-BLUE'})}})
const order=(id,legacy=false)=>({accountId:'synthetic',customerName:'Synthetic müşteri',customerEmail:'synthetic@example.invalid',order:{id,number:'SYN-'+id,createdAt:'2026-11-03T09:00:00Z',status:'received',address:{title:'Ev',fullName:'Synthetic',phone:'+905321234567',line:'Synthetic adres',district:'Test',city:'Test'},lines:[line(id,legacy),{productId:'P2',variantId:'V2',name:'Kişiselleştirilmemiş ürün',color:'Siyah',quantity:1,unitPrice:money,lineTotal:money}],total:money,history:[],requests:[]}})
const gate=()=>{let release;const promise=new Promise(resolve=>{release=resolve});return{promise,release}}
async function fixture({width=1440,design}={}){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[],paths=[];let writes=0,designReads=0
 page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname;paths.push(path)
  if(request.method()!=='GET'){writes++;return route.fulfill({status:403,json:{title:'Read-only fixture'}})}
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['orders.read','orders.write','orders.cancel','print.read']}})
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:[order('NEW'),order('OLD',true)]})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['Synthetic kargo'],returnWindowDays:14}})
  if(path.endsWith('/design')){const result=await design?.(++designReads);if(result?.status)return route.fulfill({status:result.status,json:{title:'Synthetic file error'}})
   return route.fulfill(result?.bytes?{body:result.bytes,contentType:'image/png'}:{body:pattern,contentType:'image/svg+xml'})}
  if(path.endsWith('/admin/designs'))return route.fulfill({json:{items:[],page:1,pageSize:20,total:0,totalPages:0}})
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=orders')
 return {page,paths,async open(number){await page.getByRole('button',{name:`${number} detayını aç`}).click();return page.getByRole('region',{name:'Sipariş tasarım detayı · 1. satır'})},
  close:async()=>{assert.deepEqual(errors,[]);assert.equal(writes,0);await context.close()}}
}
const card=(detail,name)=>detail.getByRole('article',{name})
try{
 for(const width of [1440,768,390,320]){
  const f=await fixture({width});let detail=await f.open('SYN-NEW');const dialog=f.page.getByRole('dialog')
  const product=detail.getByRole('region',{name:'Sipariş ve ürün bilgileri'})
  for(const text of ['SYN-NEW','SYN-SKU-BLUE','V-SYN-BLUE','Mavi','AI tasarımı','CFG-SYN'])await product.getByText(text,{exact:true}).waitFor()
  const layout=detail.getByRole('region',{name:'Kayıtlı yerleşim'})
  await layout.getByText('Yatay konum (desen merkezi)',{exact:true}).waitFor();await layout.getByText('Üst gövde',{exact:true}).waitFor()
  assert.equal(await layout.locator('dd.order-design-missing').count(),1,'The unsaved body Y value is shown as missing, not zero')
  const raw=card(detail,'Ham desen');await raw.getByRole('img').evaluate(image=>image.decode())
  assert.match(await raw.getByRole('link',{name:'Ham deseni indir'}).getAttribute('href'),/\/orders\/NEW\/lines\/0\/design\?download=true$/)
  for(const name of ['Ürün kaynak görseli','Giydirilmiş önizleme']){
   const item=card(detail,name);await item.getByText(/İndirme hazır değil\./).waitFor()
   assert.equal(await item.locator('img,a,button').count(),0,`${name} must not offer a file it does not have`)
  }
  assert.equal(await dialog.getByRole('button',{name:'Hazırlanmaya başla'}).count(),1,'Existing order actions stay')
  await dialog.getByRole('heading',{name:'Kargoya ver'}).waitFor()
  assert.equal(await dialog.locator('button,a').filter({hasText:/üretim|baskıya|kalibrasyon|render|profil/i}).count(),0)
  assert.equal(await f.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Page overflow ${width}`)
  assert.equal(await dialog.evaluate(element=>element.scrollWidth>element.clientWidth),false,`Dialog overflow ${width}`)
  if(width===390){const axe=await new AxeBuilder({page:f.page}).include('dialog[open]').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(axe.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' '+n.any.map(a=>a.message).join(';'))})),[])}
  if(width===320){await f.page.evaluate(()=>{for(const e of document.querySelectorAll('dialog *'))e.style.setProperty('font-size',parseFloat(getComputedStyle(e).fontSize)*2+'px','important')});assert.deepEqual(await dialog.evaluate(element=>{const box=element.getBoundingClientRect();return element.scrollWidth>element.clientWidth+1?[...element.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().width>box.width).slice(-8).map(e=>e.tagName+'.'+e.className+' w'+e.clientWidth+'/'+e.scrollWidth+' '+getComputedStyle(e).whiteSpace+' '+e.textContent.slice(0,30)):[]}),[],'Dialog overflow at 200% text');await f.page.reload();detail=await f.open('SYN-NEW')}
  await raw.getByRole('link',{name:'Ham deseni indir'}).focus();assert.equal(await raw.getByRole('link',{name:'Ham deseni indir'}).evaluate(link=>link===document.activeElement),true)
  if(output)for(const [part,target] of [['top',detail.getByRole('heading',{level:3})],['images',detail.getByRole('heading',{name:'Görseller'})]]){await target.evaluate(element=>element.scrollIntoView({block:'start'}));await f.page.screenshot({path:join(output,`order-design-detail-${width}-${part}.png`)})}
  await f.close()
 }
 { const f=await fixture(),detail=await f.open('SYN-OLD')
  await detail.getByText(/Bu eski siparişte yerleşim ayarları kaydedilmemiş; güncel tasarımdan tahmin edilmez\./).waitFor()
  const product=detail.getByRole('region',{name:'Sipariş ve ürün bilgileri'})
  assert.equal(await product.getByText('Bu siparişte kaydedilmemiş',{exact:true}).count(),4,'SKU, configuration, revision and schema are missing, not guessed')
  assert.equal(await detail.getByText(/^0$/).count(),0);await card(detail,'Ham desen').getByRole('img').waitFor();await f.close() }
 for(const [status,text,retry] of [[404,/bulunamadı\. İndirme kapalı/,false],[403,/görme yetkiniz yok/,false],[503,/şu anda alınamadı/,true],['invalid',/görüntülenemedi\. İndirme kapalı/,true]]){
  // React development mode runs the first effect twice, so the failure lasts until the retry is chosen.
  let fail=true;const f=await fixture({design:()=>fail?(status==='invalid'?{bytes:Buffer.from('not an image')}:{status}):{}}),raw=card(await f.open('SYN-NEW'),'Ham desen')
  await raw.getByRole('alert').filter({hasText:text}).waitFor()
  assert.equal(await raw.locator('img,a').count(),0,'No preview or download for a file that did not load')
  assert.equal(await raw.getByRole('button',{name:'Deseni tekrar dene'}).count(),retry?1:0)
  fail=false;if(retry){await raw.getByRole('button',{name:'Deseni tekrar dene'}).click();await raw.getByRole('link',{name:'Ham deseni indir'}).waitFor()}
  await f.close()
 }
 { const slow=gate(),f=await fixture({design:async()=>{await slow.promise;return{}}}),raw=card(await f.open('SYN-NEW'),'Ham desen')
  await raw.getByText('Desen dosyası yükleniyor…').waitFor();assert.equal(await raw.locator('a').count(),0);slow.release();await raw.getByRole('img').waitFor();await f.close() }
 { const f=await fixture();await f.page.goto(base+'?view=print')
  await f.page.getByRole('region',{name:'Tasarımlar ve sipariş bağlantıları'}).waitFor()
  assert.equal(await f.page.getByText(/Fiziksel baskı profil|Kalibrasyon|Üretime gönder/i).count(),0)
  assert.equal(f.paths.some(path=>path.includes('print-profiles')),false,'The removed profile screen must not load profile data')
  await f.close() }
 console.log('PASS: order design detail product/placement/three image cards at 4 widths, legacy/missing values, raw file loading/404/403/503/invalid/retry, 390 px axe, 320 px 200 % text, no production controls, existing order actions, no writes')
}finally{await browser.close()}
