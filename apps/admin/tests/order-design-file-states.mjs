// Real Chrome, synthetic API only (SIP-TAS-07): every order design file download in the admin order detail, one state at a time.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
const money={amountMinor:1000,currency:'TRY'}
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aAc0AAAAASUVORK5CYII=','base64')
const jpeg=Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==','base64')
const file=(sha,mime)=>({sha256:sha.repeat(64),mime,bytes:100})
const order={accountId:'synthetic',customerName:'Synthetic',customerEmail:'synthetic@example.invalid',order:{id:'ORDA',number:'SEC-A',createdAt:'2026-11-03T09:00:00Z',status:'received',
 address:{title:'Ev',fullName:'Synthetic',phone:'+905321234567',line:'Synthetic adres',district:'Test',city:'Test'},total:money,history:[],requests:[],
 lines:[{productId:'P',variantId:'V',name:'Synthetic ürün',color:'Mavi',quantity:1,unitPrice:money,lineTotal:money,personalization:{designId:'D',kind:'upload',name:'Synthetic desen',
  imageUrl:'/api/v1/local-commerce/orders/ORDA/lines/0/design',sku:'SKU-A',schemaVersion:1,configurationId:'CFG',configurationRevision:2,sourceSha256:'a'.repeat(64),
  placement:{sourceWidth:100,sourceHeight:100,surfaceVersion:'b'.repeat(64),x:1,y:1,scale:1,rotation:0,curvatureStrength:0},
  files:{pattern:file('a','image/png'),productSource:file('c','image/png'),composition:file('d','image/jpeg')}}}]}}
const kinds=[{route:'pattern',card:'Ham desen',idle:'Ham deseni indir',busy:'Ham desen indiriliyor…',done:'Ham desen tarayıcıya indirme için verildi'},
 {route:'source',card:'Ürün kaynak görseli',idle:'Ürün kaynak görselini indir',busy:'Ürün kaynak görseli indiriliyor…',done:'Ürün kaynak görseli tarayıcıya indirme için verildi'},
 {route:'composition',card:'Giydirilmiş önizleme',idle:'Giydirilmiş önizlemeyi indir',busy:'Giydirilmiş önizleme indiriliyor…',done:'Giydirilmiş önizleme tarayıcıya indirme için verildi'}]
const gate=()=>{let release;const promise=new Promise(resolve=>{release=resolve});return{promise,release}}
async function fixture(kind,respond){
 const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage(),errors=[],downloads=[];let writes=0,refreshes=0,armed=false
 page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname
  if(path.endsWith('/auth/admin/refresh')){refreshes++;return route.fulfill({status:401,json:{title:'Session expired'}})}
  if(request.method()!=='GET'){writes++;return route.fulfill({status:403,json:{title:'Read-only fixture'}})}
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['orders.read']}})
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:[order]})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['K'],returnWindowDays:14}})
  if(path.endsWith('/lines/0/design'))return route.fulfill({body:png,contentType:'image/png'})
  const match=/\/admin\/orders\/([^/]+)\/lines\/(\d+)\/(pattern|source|composition)$/.exec(path)
  if(match){
   assert.deepEqual([match[1],match[2]],['ORDA','0'],'The UI only asks for the shown order and line')
   const served=match[3]==='composition'?{body:jpeg,contentType:'image/jpeg'}:{body:png,contentType:'image/png'}
   // The composition card also shows the file on open; only requests after the button is used are the download under test.
   if(match[3]!==kind.route||!armed)return route.fulfill(served)
   downloads.push(Date.now())
   const result=await respond(downloads.length)
   if(result?.abort)return route.abort('failed')
   if(result?.status)return route.fulfill({status:result.status,json:{title:result.title??'Synthetic error',code:result.code??'synthetic'}})
   return route.fulfill({...served,headers:{'Access-Control-Expose-Headers':'Content-Disposition','Content-Disposition':`attachment; filename=xinobi-SEC-A-satir-1-${kind.route}.bin`}})
  }
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=orders');await page.getByRole('button',{name:'SEC-A detayını aç'}).click()
 const card=page.getByRole('region',{name:'Sipariş tasarım detayı · 1. satır'}).getByRole('article',{name:kind.card})
 await card.getByRole('button',{name:kind.idle}).waitFor()
 if(kind.route==='composition')await card.getByRole('img').waitFor()
 armed=true
 return {page,card,downloads,refreshes:()=>refreshes,close:async()=>{assert.deepEqual(errors,[]);assert.equal(writes,0);await context.close()}}
}
let scenarios=0
try{
 for(const kind of kinds){
  // Rapid repeat: three activations while the first request runs send one request; focus stays on the button.
  { const slow=gate(),f=await fixture(kind,async()=>{await slow.promise;return{}})
   const button=f.card.getByRole('button',{name:kind.idle});await button.focus();await f.page.keyboard.press('Enter')
   const busy=f.card.getByRole('button',{name:kind.busy});await busy.waitFor()
   await f.page.keyboard.press('Enter');await busy.click({force:true});await busy.click({force:true})
   assert.equal(await busy.evaluate(element=>element===document.activeElement),true,'Focus is kept while the download runs')
   const saved=f.page.waitForEvent('download');slow.release();await saved
   await f.card.getByRole('status').filter({hasText:kind.done}).waitFor()
   assert.match(await f.card.getByRole('status').filter({hasText:kind.done}).innerText(),/indirmeler listesinden kontrol edin/,'No claim that the file reached the disk')
   assert.equal(f.downloads.length,1);await f.close();scenarios++ }
  // 404 / 403: explained, no retry, focus moved to the explanation; never reported as done.
  for(const [result,text] of [[{status:404,code:'order_'+kind.route+'_not_recorded',title:'Bu sipariş satırında bu dosyanın kaydı yok.'},/kaydı yok|bulunamadı/],[{status:404},/bulunamadı; indirilecek dosya yok/],[{status:403},/yetkiniz yok/]]){
   const f=await fixture(kind,()=>result);await f.card.getByRole('button',{name:kind.idle}).click()
   const alert=f.card.getByRole('alert').filter({hasText:text});await alert.waitFor()
   assert.equal(await alert.evaluate(element=>element===document.activeElement),true,'Focus moves to the failure message')
   assert.equal(await f.card.getByRole('button',{name:/indir|tekrar dene/i}).count(),0)
   assert.equal(await f.card.getByRole('status').filter({hasText:'verildi'}).count(),0);await f.close();scenarios++
  }
  // 503 and a dropped connection: retry offered and kept in focus; the retry succeeds only after a real response.
  for(const result of [{status:503,code:'feature_unavailable'},{abort:true}]){
   let fail=true;const f=await fixture(kind,()=>fail?result:{});await f.card.getByRole('button',{name:kind.idle}).click()
   await f.card.getByRole('alert').filter({hasText:/şu anda indirilemedi/}).waitFor()
   const retry=f.card.getByRole('button',{name:'İndirmeyi tekrar dene'});await retry.waitFor()
   assert.equal(await f.card.getByRole('status').filter({hasText:'verildi'}).count(),0)
   fail=false;const saved=f.page.waitForEvent('download');await retry.click();await saved
   await f.card.getByRole('status').filter({hasText:kind.done}).waitFor();assert.equal(await f.card.getByRole('alert').count(),0);await f.close();scenarios++
  }
  // Expired session: one refresh attempt, then the panel asks to sign in; nothing is reported as downloaded.
  { const f=await fixture(kind,()=>({status:401}));await f.card.getByRole('button',{name:kind.idle}).click()
   await f.page.getByRole('heading',{name:/giriş/i}).waitFor();assert.equal(f.refreshes(),1)
   assert.equal(await f.page.getByText(/tarayıcıya indirme için verildi/).count(),0);await f.close();scenarios++ }
 }
 console.log(`PASS: ${scenarios} admin file download scenarios (pattern/source/composition): rapid repeat lock with kept focus, honest handed-over status, 404 not-recorded/404/403 focus and no retry, 503/network retry, expired session sign-in; only the shown order/line requested; no writes`)
}finally{await browser.close()}
