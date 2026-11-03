// SIP-TAS-09 final screen acceptance in real Chrome; synthetic API only. Not a screen reader, device or owner acceptance.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {join} from 'node:path'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/',output=process.env.ADMIN_CONSISTENCY_OUTPUT
const money={amountMinor:249900,currency:'TRY'}
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=','base64')
const pattern=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#f4efe6"/><circle cx="70" cy="80" r="44" fill="#d1495b"/><rect x="120" y="36" width="88" height="88" fill="#00798c"/></svg>')
const jpeg=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==','base64')
const ref=(sha,mime,bytes)=>({sha256:sha.repeat(64),mime,bytes})
const order={accountId:'synthetic',customerName:'Synthetic müşteri',customerEmail:'synthetic@example.invalid',order:{id:'ACC',number:'XN-261103-1001',createdAt:'2026-11-03T09:00:00Z',status:'received',
 address:{title:'Ev',fullName:'Synthetic',phone:'+905321234567',line:'Synthetic adres',district:'Kadıköy',city:'İstanbul'},total:money,history:[],requests:[],
 lines:[{productId:'P-TERMOS',variantId:'V-TERMOS-LACIVERT',name:'Çelik termos 500 ml',color:'Lacivert',quantity:2,unitPrice:money,lineTotal:money,
  personalization:{designId:'D-ACC',kind:'ai',name:'Lacivert dalga deseni ve uzun açıklamalı müşteri tasarım adı',imageUrl:'/api/v1/local-commerce/orders/ACC/lines/0/design',sku:'TRM-500-LCV',
   schemaVersion:1,configurationId:'CFG-ACC-0001',configurationRevision:1,sourceSha256:'a'.repeat(64),
   placement:{sourceWidth:1066,sourceHeight:1600,surfaceVersion:'b'.repeat(64),x:533,y:820,scale:1.1,rotation:5,curvatureStrength:.2,mode:'artwork',fillMask:true,bodyAdjustments:{'upper-body':{x:1,y:2,scale:.9,rotation:3}}},
   files:{pattern:ref('a','image/png',68),productSource:ref('c','image/webp',184320),composition:ref('d','image/jpeg',96000)}}},
  {productId:'P-KUPA',variantId:'V-KUPA-BEYAZ',name:'Kişiselleştirilmemiş kupa',color:'Beyaz',quantity:1,unitPrice:money,lineTotal:money}]}}
const attachment=(body,type,name)=>({body,contentType:type,headers:{'Access-Control-Expose-Headers':'Content-Disposition, X-Xinobi-File-Check','Content-Disposition':`attachment; filename=${name}`,'X-Xinobi-File-Check':'sha256'}})
async function open(width){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];let writes=0
 page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/**',route=>{
  const request=route.request(),path=new URL(request.url()).pathname
  if(request.method()!=='GET'){writes++;return route.fulfill({status:403,json:{title:'Read-only fixture'}})}
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['orders.read','orders.write','orders.cancel','print.read']}})
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:[order]})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['Synthetic kargo'],returnWindowDays:14}})
  if(path.endsWith('/lines/0/design'))return route.fulfill({body:pattern,contentType:'image/svg+xml'})
  if(path.endsWith('/lines/0/pattern'))return route.fulfill(attachment(png,'image/png','xinobi-XN-261103-1001-satir-1-desen-rev1.png'))
  if(path.endsWith('/lines/0/source'))return route.fulfill(attachment(png,'image/png','xinobi-XN-261103-1001-satir-1-urun-kaynak-TRM-500-LCV.png'))
  if(path.endsWith('/lines/0/composition'))return route.fulfill(attachment(jpeg,'image/jpeg','xinobi-XN-261103-1001-satir-1-giydirilmis-onizleme-rev1.jpg'))
  if(path.endsWith('/admin/designs'))return route.fulfill({json:{items:[{id:'D-ACC',kind:'ai',productId:'P-TERMOS',productName:'Çelik termos 500 ml',variantId:'V-TERMOS-LACIVERT',color:'Lacivert',createdAt:'2026-11-03T08:00:00Z'}],page:1,pageSize:20,total:1,totalPages:1}})
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=orders')
 const trigger=page.getByRole('button',{name:'XN-261103-1001 detayını aç'});await trigger.click()
 const dialog=page.getByRole('dialog'),detail=dialog.getByRole('region',{name:'Sipariş tasarım detayı · 1. satır'})
 await detail.getByRole('article',{name:'Ham desen'}).getByRole('img').evaluate(image=>image.decode())
 await detail.getByRole('article',{name:'Giydirilmiş önizleme'}).getByRole('img').evaluate(image=>image.decode())
 return {page,dialog,detail,trigger,close:async()=>{assert.deepEqual(errors,[]);assert.equal(writes,0);await context.close()}}
}
const production=/üretime gönder|üretim onay|üretimi reddet|baskı render|render kuyruğu|kalibrasyon|fiziksel baskı profil|baskı profili|baskıya hazır olarak/i
// Measured after two frames, so a font or image change has finished its layout.
const overflow=dialog=>dialog.evaluate(element=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>done(element.scrollWidth>element.clientWidth+1)))))
const offenders=dialog=>dialog.evaluate(element=>{const box=element.getBoundingClientRect();return [...element.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>box.right+1&&![...e.children].some(c=>c.getBoundingClientRect().right>box.right+1)).slice(0,8).map(e=>e.tagName+'.'+e.className+' w'+Math.round(e.getBoundingClientRect().width)+' '+getComputedStyle(e).whiteSpace+' '+e.textContent.slice(0,40))})
const matrix=[]
try{
 for(const width of [320,390,768,1440]){
  const f=await open(width)
  // Labels: three separated image areas, named images and downloads, placement and identity regions.
  for(const name of ['Sipariş ve ürün bilgileri','Kayıtlı yerleşim','Tasarım görselleri'])await f.detail.getByRole('region',{name}).waitFor()
  for(const [card,button] of [['Ham desen','Ham deseni indir'],['Ürün kaynak görseli','Ürün kaynak görselini indir'],['Giydirilmiş önizleme','Giydirilmiş önizlemeyi indir']])
   await f.detail.getByRole('article',{name:card}).getByRole('button',{name:button}).waitFor()
  assert.equal(await f.dialog.locator('img:not([alt]),img[alt=""]').count(),0,'Every image has a text alternative')
  for(const text of ['XN-261103-1001','TRM-500-LCV','V-TERMOS-LACIVERT','Lacivert','CFG-ACC-0001'])await f.detail.getByRole('region',{name:'Sipariş ve ürün bilgileri'}).getByText(text,{exact:true}).waitFor()
  await f.detail.getByText('XN-261103-1001 · 1. satır · konfigürasyon CFG-ACC-0001 · revizyon 1').waitFor()
  await f.detail.getByText('Temsilidir: sipariş anındaki 1. revizyon yerleşimin dijital önizlemesi. Baskıya hazır dosya değildir.').waitFor()
  // No production action anywhere in the new flow.
  assert.equal(await f.dialog.locator('button,a,[role=button]').filter({hasText:production}).count(),0)
  assert.equal(await f.dialog.getByRole('heading').filter({hasText:production}).count(),0)
  // Existing order actions remain.
  await f.dialog.getByRole('button',{name:'Hazırlanmaya başla'}).waitFor();await f.dialog.getByRole('heading',{name:'Kargoya ver'}).waitFor()
  const axe=await new AxeBuilder({page:f.page}).include('dialog[open]').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze()
  const serious=axe.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id)
  assert.deepEqual(serious,[],`axe ${width}px`)
  assert.equal(await overflow(f.dialog),false,`Dialog overflow ${width}px 1x`)
  // Keyboard: Tab from the close button reaches the three downloads in order, with a visible focus indicator.
  await f.dialog.getByRole('button',{name:'Sipariş detayını kapat'}).focus()
  const reached=[]
  for(let step=0;step<60&&reached.length<3;step++){
   await f.page.keyboard.press('Tab')
   const focused=await f.page.evaluate(()=>{const e=document.activeElement;return e?{name:e.textContent?.trim()??'',outline:getComputedStyle(e).outlineStyle,inDialog:Boolean(e.closest('dialog'))}:null})
   assert.equal(focused?.inDialog,true,'Focus stays inside the open dialog')
   if(/^(Ham deseni indir|Ürün kaynak görselini indir|Giydirilmiş önizlemeyi indir)$/.test(focused.name)){reached.push(focused.name);assert.notEqual(focused.outline,'none','Focus is visible')}
  }
  assert.deepEqual(reached,['Ham deseni indir','Ürün kaynak görselini indir','Giydirilmiş önizlemeyi indir'])
  // The focused composition download starts from the keyboard and is announced as handed over, not as saved.
  const saved=f.page.waitForEvent('download');await f.page.keyboard.press('Enter')
  assert.equal((await saved).suggestedFilename(),'xinobi-XN-261103-1001-satir-1-giydirilmis-onizleme-rev1.jpg')
  await f.detail.getByRole('article',{name:'Giydirilmiş önizleme'}).getByRole('status').filter({hasText:'tarayıcıya indirme için verildi'}).waitFor()
  if(output)for(const [part,target] of [['identity',f.detail.getByRole('heading',{level:3})],['images',f.detail.getByRole('heading',{name:'Görseller'})]]){await target.evaluate(element=>element.scrollIntoView({block:'center'}));await f.page.screenshot({path:join(output,`acceptance-${width}-1x-${part}.png`)})}
  // 200 % text on the dialog: still no overflow, every download still reachable.
  await f.page.evaluate(()=>{for(const e of document.querySelectorAll('dialog *'))e.style.setProperty('font-size',parseFloat(getComputedStyle(e).fontSize)*2+'px','important')})
  assert.deepEqual(await overflow(f.dialog)?await offenders(f.dialog):[],[],`Dialog overflow ${width}px 2x`)
  for(const button of ['Ham deseni indir','Ürün kaynak görselini indir'])assert.equal(await f.detail.getByRole('button',{name:button}).isVisible(),true)
  if(output&&(width===320||width===1440)){await f.detail.getByRole('heading',{name:'Görseller'}).evaluate(element=>element.scrollIntoView({block:'start'}));await f.page.screenshot({path:join(output,`acceptance-${width}-2x-images.png`)})}
  // Escape closes and returns focus to the order that was opened.
  await f.page.keyboard.press('Escape');await f.dialog.waitFor({state:'hidden'})
  assert.equal(await f.trigger.evaluate(element=>element===document.activeElement),true,'Focus returns to the order row')
  matrix.push({width,axe:serious.length,overflow1x:false,overflow2x:false,keyboard:reached.length});await f.close()
 }
 // The design screen keeps only design records and order links; the physical profile and production controls are gone.
 { const f=await open(1440);await f.page.keyboard.press('Escape');await f.page.goto(base+'?view=print')
  const section=f.page.getByRole('region',{name:'Tasarımlar ve sipariş bağlantıları'});await section.getByRole('button',{name:'İncele'}).waitFor()
  assert.equal(await f.page.locator('main').getByText(production).count(),0,'No profile, calibration or production wording on the design screen')
  assert.equal(await f.page.getByRole('region',{name:'Fiziksel baskı profilleri'}).count(),0)
  if(output)await f.page.screenshot({path:join(output,'acceptance-print-view-1440.png')})
  await f.close() }
 console.log('PASS:',JSON.stringify(matrix),'design screen without production/profile controls; no writes')
}finally{await browser.close()}
