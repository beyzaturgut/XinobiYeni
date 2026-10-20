// Run against the built Admin preview (StrictMode development effect replays are not request counts).
// Isolated UI fixtures only. Every API request is intercepted; no real session, SQL or business writes.
import assert from 'node:assert/strict'
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'

const origin=process.env.ORDER_UI_ORIGIN||'http://127.0.0.1:5187'
assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
const browser=await chromium.launch({channel:'chrome',headless:true})
const money={amountMinor:12500,currency:'TRY'}
const order={order:{id:'fixture-order',number:'TEST-ORDER',createdAt:'2026-10-20T00:00:00Z',status:'received',
 address:{title:'Fixture',fullName:'Synthetic',phone:'5551234567',city:'Test',district:'Test',line:'Synthetic address'},
 lines:[{productId:'fixture-product',variantId:'fixture-variant',name:'Synthetic product',color:'Siyah',quantity:1,unitPrice:money,lineTotal:money}],total:money,history:[],requests:[]},
 accountId:'fixture-customer',customerName:'Synthetic customer',customerEmail:'synthetic@example.invalid'}
const options={carriers:['Fixture Carrier'],returnWindowDays:14}
const permissions=['orders.read','orders.write','orders.cancel']
const gate=()=>{let release;const promise=new Promise(resolve=>{release=resolve});return{promise,release}}
const ok=body=>({body,status:200})
let count=0
async function fixture({orders=async()=>ok([order]),choices=async()=>ok(options),refresh=false,allowed=permissions}={}){
 const context=await browser.newContext(),page=await context.newPage(),calls={orders:0,choices:0,refresh:0},errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.clock.install({time:new Date('2026-10-20T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-20T12:00:00Z'))
 await context.route('**/api/v1/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname
  const reply=result=>result.abort?route.abort('failed'):route.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(result.body)})
  if(path.endsWith('/auth/admin/refresh')){calls.refresh++;return reply({status:refresh?200:401,body:{}})}
  assert.equal(request.method(),'GET','No business write is allowed in this test')
  if(path.endsWith('/admin/session'))return reply(ok({account:{name:'Synthetic operator'},permissions:allowed}))
  if(path.endsWith('/local-commerce/state'))return reply({status:503,body:{code:'catalog_unavailable',title:'Katalog kullanılamıyor'}})
  if(path.endsWith('/local-commerce/orders'))return reply(await orders(++calls.orders))
  if(path.endsWith('/local-commerce/order-options'))return reply(await choices(++calls.choices))
  throw new Error('Unexpected API request: '+path)
 })
 await page.goto(origin+'/?view=orders')
 const section=page.getByRole('region',{name:'Sipariş listesi'})
 return{page,section,calls,close:async()=>{assert.deepEqual(errors,[]);await context.close();count++}}
}
async function until(fn){for(let i=0;i<100;i++){if(await fn())return;await new Promise(r=>setTimeout(r,20))}throw new Error('Expected request or UI state not observed')}
try{
 // Initial unresolved request is loading, not an empty/zero result.
 {const wait=gate(),f=await fixture({orders:async()=>{await wait.promise;return ok([])}})
  await f.section.getByText('Siparişler yükleniyor…',{exact:true}).waitFor()
  assert.equal(await f.section.getByText('Henüz sipariş yok',{exact:true}).count(),0)
  assert.equal(await f.section.getByText(/^0 sipariş/).count(),0)
  wait.release();await f.section.getByText('Henüz sipariş yok',{exact:true}).waitFor();await f.close()}
 // An older response/finally cannot end a newer loading state or replace its data.
 {const first=gate(),second=gate(),f=await fixture({orders:async n=>{await(n===1?first:second).promise;return ok(n===1?[]:[order])}})
  await until(()=>f.calls.orders===1);await f.section.getByRole('button',{name:'Yenile',exact:true}).click();await until(()=>f.calls.orders===2)
  first.release();await new Promise(r=>setTimeout(r,100));assert.equal(await f.section.getByText('Siparişler yükleniyor…',{exact:true}).count(),1)
  second.release();await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).waitFor();await f.close()}
 for(const late of [ok([]),{status:503,body:{title:'Old failure'}}]){const first=gate(),f=await fixture({orders:async n=>{if(n===1){await first.promise;return late}return ok([order])}})
  await until(()=>f.calls.orders===1);await f.section.getByRole('button',{name:'Yenile',exact:true}).click();await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).waitFor()
  first.release();await new Promise(r=>setTimeout(r,100));assert.equal(await f.section.getByRole('alert').count(),0);await f.close()}
 // List failure is not empty; retry restores genuine data. Common 403/503/network messages remain intact.
 for(const error of [{status:403,body:{}},{status:503,body:{title:'Sipariş kaynağı kullanılamıyor.'}},{abort:true}]){
  const f=await fixture({orders:async n=>n===1?error:ok([order])})
  await f.section.getByRole('button',{name:'Siparişleri tekrar dene'}).waitFor()
  assert.equal(await f.section.getByText('Henüz sipariş yok',{exact:true}).count(),0);assert.equal(await f.section.getByText(/^0 sipariş/).count(),0)
  await f.section.getByRole('button',{name:'Siparişleri tekrar dene'}).click();await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).waitFor();await f.close()
 }
 // Existing shared staff refresh handles 401. Failure returns to login; success retries once.
 {const f=await fixture({orders:async()=>({status:401,body:{}})})
  await f.page.getByRole('heading',{name:'Yönetici girişi',exact:true}).waitFor();assert.equal(f.calls.refresh,1);await f.close()}
 {const f=await fixture({orders:async n=>n===1?{status:401,body:{}}:ok([order]),refresh:true})
  await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).waitFor();assert.equal(f.calls.refresh,1);assert.equal(f.calls.orders,2);await f.close()}
 // Missing options only block shipping, surface an accessible retry and preserve drafts.
 for(const error of [{status:403,body:{}},{status:503,body:{title:'Seçenek kaynağı kullanılamıyor.'}},{abort:true},ok({...options,carriers:[]})]){
  const f=await fixture({choices:async n=>n===1?error:ok(options)})
  await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).click();const dialog=f.page.getByRole('dialog')
  await dialog.getByRole('button',{name:'Seçenekleri tekrar dene'}).waitFor()
  assert.equal(await dialog.getByRole('button',{name:'Kargoya verildi olarak işaretle'}).isDisabled(),true)
  assert.equal(await dialog.getByRole('button',{name:'Hazırlanmaya başla'}).isEnabled(),true)
  await dialog.getByLabel('Not (müşteriye iletilir, isteğe bağlı)').fill('Preserved draft')
  await dialog.getByLabel('Takip numarası',{exact:true}).fill('TRACK-123')
  await dialog.getByRole('button',{name:'Seçenekleri tekrar dene'}).click()
  await dialog.getByRole('option',{name:'Fixture Carrier'}).waitFor({state:'attached'})
  assert.equal(await dialog.getByLabel('Not (müşteriye iletilir, isteğe bağlı)').inputValue(),'Preserved draft')
  assert.equal(await dialog.getByLabel('Takip numarası',{exact:true}).inputValue(),'TRACK-123')
  assert.equal(await dialog.getByRole('button',{name:'Kargoya verildi olarak işaretle'}).isEnabled(),true)
  await f.page.keyboard.press('Escape');assert.equal(await f.page.getByRole('dialog').count(),0)
  assert.equal(await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).evaluate(el=>el===document.activeElement),true)
  await f.close()
 }
 // Polling failure disables all order changes without dropping a modal draft; retry recovers.
 {const f=await fixture({orders:async n=>n===2?{status:503,body:{title:'Temporary order failure'}}:ok([order])})
  await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).click();const d=f.page.getByRole('dialog')
  await d.getByLabel('Not (müşteriye iletilir, isteğe bağlı)').fill('Keep my note')
  await f.page.clock.fastForward(15000);await d.getByRole('button',{name:'Siparişleri tekrar dene'}).waitFor()
  assert.equal(await d.getByRole('button',{name:'Hazırlanmaya başla'}).isDisabled(),true)
  assert.equal(await d.getByRole('button',{name:'Siparişi iptal et'}).isDisabled(),true)
  await d.getByRole('button',{name:'Siparişleri tekrar dene'}).click();await until(()=>f.calls.orders===3)
  await d.getByRole('button',{name:'Hazırlanmaya başla'}).waitFor()
  await until(()=>d.getByRole('button',{name:'Hazırlanmaya başla'}).isEnabled())
  assert.equal(await d.getByLabel('Not (müşteriye iletilir, isteğe bağlı)').inputValue(),'Keep my note')
  await f.page.keyboard.press('Escape');assert.equal(await f.section.getByRole('button',{name:'Yenile',exact:true}).evaluate(el=>el===document.activeElement),true);await f.close()
 }
 // Filters and responsive presentation remain usable; read-only staff cannot mutate.
 {const f=await fixture({allowed:['orders.read']});await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).waitFor()
  await f.section.getByLabel('Sipariş veya müşteri ara').fill('absent');await f.section.getByText('Filtrelere uygun sipariş yok',{exact:true}).waitFor()
  await f.section.getByRole('button',{name:'Filtreleri temizle'}).click()
  await f.section.locator('#order-status').selectOption('Hazırlanıyor');await f.section.getByText('Filtrelere uygun sipariş yok',{exact:true}).waitFor()
  await f.section.getByRole('button',{name:'Filtreleri temizle'}).click()
  for(const width of [1440,1280,768,390]){await f.page.setViewportSize({width,height:900});assert.equal(await f.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
  await f.section.getByRole('button',{name:'TEST-ORDER detayını aç'}).click();assert.equal(await f.page.getByRole('button',{name:'Hazırlanmaya başla'}).isDisabled(),true)
  await f.page.keyboard.press('Escape');await f.close()}
 console.log(`PASS: ${count} isolated order UI scenarios; loading/empty/error/retry, 401/403/503/network, stale responses, options, drafts, permissions, modal/Escape, 4 widths; no real writes`)
}finally{await browser.close()}
