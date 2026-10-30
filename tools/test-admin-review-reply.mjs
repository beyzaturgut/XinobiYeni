// Fixture-only Admin regression. All API calls are intercepted; no SQL, real session or notification delivery.
import assert from 'node:assert/strict'
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'

const origin=process.env.REVIEW_UI_ORIGIN||'http://127.0.0.1:5188'
assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
const browser=await chromium.launch({channel:'chrome',headless:true})
const existing={id:'fixture-review',productId:'fixture-product',authorName:'Synthetic M.',rating:4,body:'Synthetic fixture review content.',
 createdAt:'2026-10-20T00:00:00Z',status:'approved',storeReply:'Existing store reply'}
const gate=()=>{let release;const promise=new Promise(resolve=>{release=resolve});return{promise,release}}
let scenarios=0
async function fixture({write=true,save,listing}={}){
 const context=await browser.newContext(),page=await context.newPage(),payloads=[],errors=[]
 let current={...existing},reads=0
 page.on('pageerror',error=>errors.push(error.message))
 await context.route('**/api/v1/**',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname
  const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
  if(path.endsWith('/admin/session'))return reply({account:{name:'Synthetic staff'},permissions:write?['content.read','content.write']:['content.read']})
  if(path.endsWith('/local-commerce/state'))return reply({title:'Katalog kullanılamıyor',code:'catalog_unavailable'},503)
  if(path.endsWith('/local-commerce/reviews')){
   assert.equal(request.method(),'GET');reads++
   if(listing){const result=await listing(url.searchParams.get('status'),reads);if(result)return reply(result.body,result.status)}
   const status=url.searchParams.get('status');return reply(!status||status===current.status?[current]:[])
  }
  if(path.endsWith('/reviews/fixture-review/moderation')){
   assert.equal(request.method(),'POST');assert.ok(write,'Read-only staff must not submit')
   const payload=request.postDataJSON();payloads.push(payload)
   const response=await save?.(payload,payloads.length)
   if(response)return reply(response.body,response.status)
   // Reflect the verified API Clean semantics in this isolated fixture, not an alternative backend.
   current={...current,status:payload.status,storeReply:payload.reply?.trim()||null,moderationNote:payload.note}
   return reply(current)
  }
  throw new Error('Unexpected request: '+path)
 })
 await page.goto(origin+'/?view=reviews')
 const section=page.getByRole('region',{name:'Ürün değerlendirmeleri'})
 await section.getByRole('combobox').selectOption('approved')
 const editor=section.getByLabel('Mağaza yanıtı (yayınlanır, isteğe bağlı)')
 return{page,section,editor,payloads,close:async()=>{assert.deepEqual(errors,[]);await context.close();scenarios++}}
}
async function until(fn){for(let i=0;i<100;i++){if(await fn())return;await new Promise(r=>setTimeout(r,20))}throw new Error('Expected fixture state not reached')}
try{
 {const f=await fixture();await f.editor.waitFor();await f.editor.fill('');await f.section.getByRole('button',{name:'Yanıtı güncelle'}).click()
  await until(()=>f.payloads.length===1);assert.deepEqual(f.payloads[0],{status:'approved',note:null,reply:''})
  await f.editor.waitFor();await f.section.getByRole('button',{name:'Yenile',exact:true}).click();await f.editor.waitFor()
  assert.equal(await f.editor.inputValue(),'');assert.equal(await f.section.getByText('Mağaza yanıtı: Existing store reply',{exact:true}).count(),0)
  await f.close()}
 {const f=await fixture();await f.editor.fill('Updated store reply');await f.section.getByRole('button',{name:'Yanıtı güncelle'}).click()
  await until(()=>f.payloads.length===1);assert.equal(f.payloads[0].reply,'Updated store reply');await f.editor.waitFor();assert.equal(await f.editor.inputValue(),'Updated store reply');await f.close()}
 {const f=await fixture();await f.editor.waitFor();await f.section.getByLabel('Ret nedeni (müşteriye iletilir)').fill('Synthetic note')
  await f.section.getByRole('button',{name:'Yanıtı güncelle'}).click();await until(()=>f.payloads.length===1)
  assert.equal(f.payloads[0].reply,'Existing store reply');assert.equal(f.payloads[0].note,'Synthetic note');await f.close()}
 for(const code of [403,503]){
  const f=await fixture({save:async(_,n)=>n===1?{status:code,body:{title:'Fixture save unavailable'}}:undefined})
  await f.editor.fill('Draft to preserve');await f.section.getByLabel('Ret nedeni (müşteriye iletilir)').fill('Keep note')
  await f.section.getByRole('button',{name:'Yanıtı güncelle'}).click();await f.section.getByRole('alert').waitFor()
  assert.equal(await f.section.getByRole('button',{name:'Yanıtı güncelle'}).isEnabled(),true)
  // A write failure keeps the editable draft visible; retry the operation directly.
  await f.editor.waitFor()
  assert.equal(await f.editor.inputValue(),'Draft to preserve');assert.equal(await f.section.getByLabel('Ret nedeni (müşteriye iletilir)').inputValue(),'Keep note')
  await f.section.getByRole('button',{name:'Yanıtı güncelle'}).click();await until(()=>f.payloads.length===2)
  assert.equal(f.payloads[1].reply,'Draft to preserve');await f.close()
 }
 {const hold=gate(),f=await fixture({save:async()=>{await hold.promise}});await f.editor.fill('One request')
  await f.section.getByRole('button',{name:'Yanıtı güncelle'}).evaluate(button=>{button.click();button.click()})
  await until(()=>f.payloads.length===1);assert.equal(await f.section.getByRole('button',{name:'Yanıtı güncelle'}).isDisabled(),true)
  assert.equal(f.payloads.length,1);hold.release();await f.editor.waitFor();await f.close()}
 {const f=await fixture({write:false});await f.editor.waitFor()
  assert.equal(await f.section.getByRole('button',{name:'Yanıtı güncelle'}).isDisabled(),true)
  assert.equal(await f.section.getByRole('button',{name:'Reddet',exact:true}).isDisabled(),true)
  await f.section.getByRole('button',{name:'Yanıtı güncelle'}).evaluate(button=>button.click());assert.equal(f.payloads.length,0);await f.close()}
 {const wait=gate();let approved=false;const f=await fixture({listing:async status=>{if(status==='approved'&&!approved){approved=true;await wait.promise;return{status:200,body:[existing]}}}})
  await f.section.getByText('Değerlendirmeler yükleniyor…',{exact:true}).waitFor()
  assert.equal(await f.section.getByText('Bu durumda değerlendirme yok',{exact:true}).count(),0)
  await f.section.getByRole('combobox').selectOption('rejected');await f.section.getByText('Bu durumda değerlendirme yok',{exact:true}).waitFor()
  wait.release();await new Promise(r=>setTimeout(r,100));assert.equal(await f.editor.count(),0);await f.close()}
 console.log(`PASS: ${scenarios} review reply fixture scenarios; clear/update/unchanged payload, 403/503 draft retry, double click, permission, loading/empty and stale filter; no real writes`)
}finally{await browser.close()}
