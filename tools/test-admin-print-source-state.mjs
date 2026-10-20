// Fixture-only Admin test: every API request is intercepted; no real account, print job or SQL.
import assert from 'node:assert/strict'
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'

const origin=process.env.PRINT_UI_ORIGIN||'http://127.0.0.1:5192'
assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
const browser=await chromium.launch({channel:'chrome',headless:true})
let scenarios=0
async function fixture(permissions){
 const context=await browser.newContext(),page=await context.newPage(),errors=[],writes=[]
 page.on('pageerror',error=>errors.push(error.message))
 await context.route('**/api/v1/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname
  if(request.method()!=='GET')writes.push(path)
  assert.equal(request.method(),'GET','No print/save/download action may issue a write')
  const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
  if(path.endsWith('/admin/session'))return reply({account:{name:'Synthetic operator'},permissions})
  if(path.endsWith('/local-commerce/state'))return reply({title:'Katalog kullanılamıyor',code:'catalog_unavailable'},503)
  if(path.endsWith('/local-commerce/notifications'))return reply({channels:[],items:[]})
  throw new Error('Unexpected API dependency: '+path)
 })
 await page.goto(origin+'/?view=print')
 return{page,close:async()=>{assert.deepEqual(errors,[]);assert.deepEqual(writes,[]);await context.close();scenarios++}}
}
try{
 for(const width of [1440,1280,768,390]){
  const f=await fixture(['print.read']);await f.page.setViewportSize({width,height:900})
  const section=f.page.getByRole('region',{name:'Tasarım ve baskı operasyonları'})
  await section.getByRole('status').waitFor()
  assert.match(await section.getByRole('status').textContent(),/veri kaynağı henüz bağlı değil/)
  assert.match(await section.getByRole('status').textContent(),/kayıt bulunmadığı anlamına gelmez/)
  assert.equal(await section.getByText('Filtrelere uygun tasarım yok.',{exact:true}).count(),0)
  const search=section.getByLabel('Tasarım veya sipariş ara'),filter=section.getByLabel('Çıktı durum filtresi'),clear=section.getByRole('button',{name:'Filtreleri temizle'})
  assert.equal(await search.isDisabled(),true);assert.equal(await filter.isDisabled(),true);assert.equal(await clear.isDisabled(),true)
  assert.equal(await search.getAttribute('aria-describedby'),'print-source-status')
  assert.equal(await filter.getAttribute('aria-describedby'),'print-source-status')
  await clear.evaluate(button=>button.click());assert.equal(await search.inputValue(),'')
  assert.equal(await section.locator('tbody tr').count(),0)
  assert.equal(await section.getByRole('button',{name:/sakla|geçici tut|Üretime onayla|dosyası oluştur|indir/i}).count(),0)
  assert.equal(await section.locator('a[download],a[href*="/print"],a[href*="/designs"]').count(),0)
  assert.equal(await section.getByText(/Not .*tutuldu|kayıt başarılı|üretim tamamlandı/i).count(),0)
  assert.equal(await f.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow at ${width}`)
  await f.page.keyboard.press('Tab')
  assert.equal(await f.page.evaluate(()=>document.activeElement?.matches(':disabled')),false)
  await f.page.keyboard.press('Escape');assert.equal(await section.getByRole('status').count(),1)
  await f.page.reload();await section.getByRole('status').waitFor()
  assert.equal(await f.page.locator('.page-heading h1').textContent(),'Tasarım ve baskı operasyonları')
  await f.close()
 }
 {const f=await fixture(['notifications.read'])
  await f.page.getByRole('region',{name:'Bildirim kayıtları'}).waitFor()
  assert.equal(await f.page.getByRole('region',{name:'Tasarım ve baskı operasyonları'}).count(),0)
  assert.equal(await f.page.locator('[data-nav-view="print"]').count(),0)
  assert.notEqual(new URL(f.page.url()).searchParams.get('view'),'print');await f.close()}
 console.log(`PASS: ${scenarios} print source fixture scenarios; unavailable vs empty, disabled controls, no fake persistence/output, keyboard/reload/permission and 4 widths; no real writes`)
}finally{await browser.close()}
