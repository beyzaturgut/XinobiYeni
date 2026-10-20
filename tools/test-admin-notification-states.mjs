// Built Admin preview only; API traffic is fully intercepted. No real session, SQL or notification sending.
import assert from 'node:assert/strict'
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'
const origin=process.env.NOTIFICATION_UI_ORIGIN||'http://127.0.0.1:5191'
assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
const browser=await chromium.launch({channel:'chrome',headless:true})
const item={id:'fixture-notification',channel:'email',recipient:'synthetic@example.invalid',kind:'fixture',title:'Fixture notification',body:'Synthetic body',
 createdAt:'2026-10-20T00:00:00Z',status:'failed',attempts:5,lastError:'Fixture delivery error'}
const channels=[{channel:'email',configured:false},{channel:'sms',configured:false},{channel:'push',configured:false}]
const ok=body=>({status:200,body})
const gate=()=>{let release;const promise=new Promise(resolve=>{release=resolve});return{promise,release}}
let scenarios=0
async function fixture({write=true,listing,save,refresh=false}={}){
 const context=await browser.newContext(),page=await context.newPage(),calls={get:0,post:0,refresh:0,queries:[]},errors=[]
 let current={...item}
 const queued=()=>{current={...current,status:'pending',attempts:0,lastError:null}}
 const data=(rows=[current])=>({channels,items:rows})
 page.on('pageerror',error=>errors.push(error.message))
 await page.clock.install({time:new Date('2026-10-20T12:00:00Z')});await page.clock.pauseAt(new Date('2026-10-20T12:00:00Z'))
 await context.route('**/api/v1/**',async route=>{
  const request=route.request(),url=new URL(request.url()),path=url.pathname
  const reply=value=>value.abort?route.abort('failed'):route.fulfill({status:value.status,contentType:'application/json',body:JSON.stringify(value.body)})
  if(path.endsWith('/auth/admin/refresh')){calls.refresh++;return reply({status:refresh?200:401,body:{}})}
  if(path.endsWith('/admin/session'))return reply(ok({account:{name:'Synthetic operator'},permissions:write?['notifications.read','notifications.write']:['notifications.read']}))
  if(path.endsWith('/local-commerce/state'))return reply({status:503,body:{title:'Katalog kullanılamıyor',code:'catalog_unavailable'}})
  if(path.endsWith('/local-commerce/notifications')){
   assert.equal(request.method(),'GET');calls.get++;calls.queries.push(Object.fromEntries(url.searchParams))
   const result=await listing?.({n:calls.get,query:url.searchParams,data,queued});if(result)return reply(result)
   return reply(ok(data([current].filter(row=>(!url.searchParams.get('channel')||row.channel===url.searchParams.get('channel'))&&(!url.searchParams.get('status')||row.status===url.searchParams.get('status'))))))
  }
  if(path.endsWith('/notifications/fixture-notification/retry')){
   assert.equal(request.method(),'POST');assert.ok(write,'No POST for read-only staff');assert.deepEqual(request.postDataJSON(),{})
   calls.post++;const result=await save?.({n:calls.post,queued});if(result)return reply(result)
   queued();return reply(ok(current))
  }
  throw new Error('Unexpected API traffic: '+path)
 })
 await page.goto(origin+'/?view=notifications')
 const section=page.getByRole('region',{name:'Bildirim kayıtları'}),retry=section.getByRole('button',{name:'Yeniden dene',exact:true})
 return{page,section,retry,calls,close:async()=>{assert.deepEqual(errors,[]);await context.close();scenarios++}}
}
async function until(fn){for(let i=0;i<100;i++){if(await fn())return;await new Promise(r=>setTimeout(r,20))}throw new Error('Expected fixture state not reached')}
try{
 {const f=await fixture({write:false});await f.retry.waitFor();assert.equal(await f.retry.isDisabled(),true)
  await f.retry.evaluate(button=>button.click());assert.equal(f.calls.post,0);await f.close()}
 {const hold=gate(),f=await fixture({save:async()=>{await hold.promise}});await f.retry.waitFor()
  await f.retry.evaluate(button=>{button.click();button.click()});await until(()=>f.calls.post===1)
  assert.equal(await f.section.getByRole('button',{name:'Kuyruğa alınıyor…',exact:true}).isDisabled(),true)
  await f.page.clock.fastForward(10000);assert.equal(f.calls.get,1,'Polling must not reopen retry during a POST')
  hold.release();await f.section.getByText('Yeniden kuyruğa alındı; teslim henüz doğrulanmadı.',{exact:true}).waitFor()
  await f.section.getByRole('cell',{name:'Sırada',exact:true}).waitFor();assert.equal(await f.section.getByRole('cell',{name:'Gönderildi',exact:true}).count(),0)
  assert.equal(f.calls.post,1);assert.equal(await f.retry.count(),0);await f.close()}
 {const hold=gate(),f=await fixture({listing:async({data})=>{await hold.promise;return ok(data([]))}})
  await f.section.getByText('Bildirimler yükleniyor…',{exact:true}).waitFor();assert.equal(await f.section.getByText('Kayıt yok',{exact:true}).count(),0)
  assert.equal(await f.retry.count(),0);hold.release();await f.section.getByText('Kayıt yok',{exact:true}).waitFor();await f.close()}
 for(const failure of [{status:403,body:{}},{status:503,body:{title:'Bildirim kaynağı kullanılamıyor.'}},{abort:true}]){
  const f=await fixture({listing:async({n})=>n===1?failure:undefined});await f.section.getByRole('alert').waitFor()
  assert.equal(await f.retry.count(),0);assert.equal(await f.section.getByText('Kayıt yok',{exact:true}).count(),0)
  await f.section.getByRole('button',{name:'Tekrar dene',exact:true}).click();await f.retry.waitFor();await f.close()
 }
 for(const code of [403,409,503,'network']){
  const f=await fixture({save:async({n})=>n===1?(code==='network'?{abort:true}:{status:code,body:{title:'Fixture retry rejected'}}):undefined})
  await f.retry.click();await f.section.getByRole('alert').waitFor();assert.equal(await f.retry.count(),0)
  assert.equal(await f.section.getByText('Yeniden kuyruğa alındı; teslim henüz doğrulanmadı.',{exact:true}).count(),0)
  await f.section.getByRole('button',{name:'Tekrar dene',exact:true}).click();await f.retry.waitFor();await f.retry.click()
  await f.section.getByRole('cell',{name:'Sırada',exact:true}).waitFor();assert.equal(f.calls.post,2);await f.close()
 }
 // A lost response may have queued the item: refresh before offering another POST, never claim idempotency.
 {const f=await fixture({save:async({queued})=>{queued();return{abort:true}}})
  await f.retry.click();await f.section.getByRole('alert').waitFor();await f.section.getByRole('button',{name:'Tekrar dene',exact:true}).click()
  await f.section.getByRole('cell',{name:'Sırada',exact:true}).waitFor();assert.equal(await f.retry.count(),0);assert.equal(f.calls.post,1);await f.close()}
 {const f=await fixture({listing:async()=>({status:401,body:{}})})
  await f.page.getByRole('heading',{name:'Yönetici girişi',exact:true}).waitFor();assert.equal(f.calls.refresh,1);await f.close()}
 {const f=await fixture({save:async()=>({status:401,body:{}})})
  await f.retry.click();await f.page.getByRole('heading',{name:'Yönetici girişi',exact:true}).waitFor();assert.equal(f.calls.refresh,1);await f.close()}
 {const f=await fixture({save:async({n})=>n===1?{status:401,body:{}}:undefined,refresh:true})
  await f.retry.click();await f.section.getByRole('cell',{name:'Sırada',exact:true}).waitFor();assert.equal(f.calls.refresh,1);assert.equal(f.calls.post,2);await f.close()}
 for(const failure of [false,true]){
  const hold=gate(),f=await fixture({listing:async({n,data})=>{if(n===1){await hold.promise;return failure?{status:503,body:{title:'Old failure'}}:ok(data([{...item,title:'Old snapshot'}]))}return ok(data([{...item,title:'Latest snapshot'}]))}})
  await until(()=>f.calls.get===1);await f.section.getByRole('button',{name:'Yenile',exact:true}).click();await f.section.getByText('Latest snapshot',{exact:true}).waitFor()
  hold.release();await new Promise(r=>setTimeout(r,100));assert.equal(await f.section.getByText('Old snapshot',{exact:true}).count(),0);assert.equal(await f.section.getByRole('alert').count(),0);await f.close()
 }
 // New filter snapshots are hidden until read succeeds; old rows cannot be retried during polling.
 {const hold=gate(),f=await fixture({listing:async({n})=>{if(n===2){await hold.promise}return undefined}})
  await f.retry.waitFor();await f.page.clock.fastForward(10000);await f.section.getByText('Bildirimler yükleniyor…',{exact:true}).waitFor()
  assert.equal(await f.retry.isDisabled(),true);await f.retry.evaluate(button=>button.click());assert.equal(f.calls.post,0)
  hold.release();await until(()=>f.retry.isEnabled());await f.section.getByRole('combobox').nth(0).selectOption('sms')
  await f.section.getByText('Kayıt yok',{exact:true}).waitFor();assert.equal(f.calls.queries.at(-1).channel,'sms');await f.close()}
 // A filter change during POST must not expose a pre-commit failed snapshot after the POST completes.
 {const hold=gate(),f=await fixture({save:async()=>{await hold.promise}});await f.retry.click();await until(()=>f.calls.post===1)
  await f.section.getByRole('combobox').nth(1).selectOption('failed');await until(()=>f.calls.get===2)
  hold.release();await f.section.getByText('Kayıt yok',{exact:true}).waitFor();assert.equal(f.calls.post,1);assert.equal(await f.retry.count(),0);await f.close()}
 console.log(`PASS: ${scenarios} notification UI fixture scenarios; permissions/double-click/loading/stale/filter/poll, 401/403/409/503/network/retry, queue vs delivery; no real sending`)
}finally{await browser.close()}
