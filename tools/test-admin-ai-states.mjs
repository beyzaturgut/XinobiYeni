// Synthetic intercepted requests only: no real AI, SQL or account writes.
import assert from 'node:assert/strict'
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'
const origin=process.env.AI_UI_ORIGIN||'http://127.0.0.1:5198'
assert.match(origin,/^http:\/\/127\.0\.0\.1:\d+$/)
const browser=await chromium.launch({channel:'chrome',headless:true})
const gate=()=>{let release;const promise=new Promise(r=>{release=r});return{promise,release}}
const policy={revision:1,systemPrompt:'Fixture prompt',greeting:'Fixture hello',quickReplies:[],dailyAiLimit:0,maxMessagesPerConversation:10,model:'fixture',temperature:0,reason:'Fixture',createdAt:'2026-10-21T00:00:00Z'}
const source={id:'a',title:'Source A',body:'Fixture body',keywords:[],status:'draft',version:1,updatedAt:policy.createdAt}
const ok=body=>({status:200,body})
let passed=0
async function fixture(read,write){
 const context=await browser.newContext(),page=await context.newPage(),counts={},errors=[];let posts=0
 page.on('pageerror',e=>errors.push(e.message))
 await context.route('**/api/v1/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;let result
  if(path.endsWith('/auth/admin/refresh'))result={status:401,body:{}}
  else if(req.method()!=='GET'){assert.ok(write,'Unexpected mutation');posts++;result=await write(path,req.postDataJSON())}
  else if(path.endsWith('/admin/session'))result=ok({account:{name:'Synthetic'},permissions:['ai.read','ai.write']})
  else if(path.endsWith('/local-commerce/state'))result={status:503,body:{title:'Fixture catalog'}}
  else {counts[path]=(counts[path]||0)+1;result=await read(path,counts[path])}
  if(result.abort)return route.abort('failed')
  return route.fulfill({status:result.status,contentType:'application/json',body:JSON.stringify(result.body)})
 })
 await page.goto(origin+'/?view=ai');const section=page.getByRole('region',{name:'AI yönetimi'})
 return{page,section,posts:()=>posts,tab:async name=>section.getByRole('button',{name,exact:true}).click(),close:async()=>{assert.deepEqual(errors,[]);await context.close();passed++}}
}
const defaults=path=>ok(path.endsWith('/policies')?{modelConfigured:false,items:[policy]}:path.endsWith('/usage')?{days:[],aiCallsToday:0,dailyAiLimit:0,costRatesSet:false,note:'Fixture'}:[])
try{
 for(const [tab,end,empty] of [['Politika ve istem','policies','Politika kaydı yok.'],['Bilgi kaynakları','knowledge','Bilgi kaynağı yok.'],['Konuşmalar','conversations','Konuşma kaydı yok.'],['Talepler','leads','Talep yok'],['Kullanım ve maliyet','usage','Kullanım kaydı yok.']]){
  const wait=gate(),f=await fixture(async path=>{if(path.endsWith('/'+end)){await wait.promise;return end==='policies'?ok({modelConfigured:false,items:[]}):defaults(path)}return defaults(path)})
  if(end!=='policies')await f.tab(tab)
  await f.section.getByText('AI yönetim verileri yükleniyor…',{exact:true}).waitFor();assert.equal(await f.section.getByText(empty,{exact:true}).count(),0)
  wait.release();await f.section.getByText(empty,{exact:true}).waitFor();await f.close()
 }
 for(const failure of [{status:403,body:{}},{status:503,body:{title:'Fixture unavailable'}},{abort:true}]){
  const wait=gate(),f=await fixture(async(path,n)=>{if(path.endsWith('/knowledge')){if(n===1)return failure;await wait.promise;return ok([])}return defaults(path)})
  await f.tab('Bilgi kaynakları');await f.section.getByRole('alert').waitFor();assert.equal(await f.section.getByText('0 kaynak',{exact:true}).count(),0)
  if(failure.status===403)assert.equal(await f.section.getByRole('button',{name:'Tekrar dene'}).count(),0)
  else{await f.section.getByRole('button',{name:'Tekrar dene'}).click();await f.section.getByText('AI yönetim verileri yükleniyor…').waitFor();assert.equal(await f.section.getByRole('alert').count(),0);wait.release();await f.section.getByText('Bilgi kaynağı yok.').waitFor()}
  await f.close()
 }
 {const f=await fixture(async path=>path.endsWith('/knowledge')?{status:401,body:{}}:defaults(path));await f.tab('Bilgi kaynakları');await f.page.getByText('Yönetici girişi',{exact:false}).first().waitFor();await f.close()}
 {const slow=gate(),started=gate(),f=await fixture(async(path,n)=>{if(path.endsWith('/knowledge')){if(n===1)return ok([source]);if(n===2){started.release();await slow.promise;return ok([{...source,title:'STALE SOURCE'}])}return ok([source])}return defaults(path)})
  await f.tab('Bilgi kaynakları');await f.section.getByRole('button',{name:'Düzenle',exact:true}).click();await f.section.getByLabel('Başlık',{exact:true}).fill('Retained source draft')
  await f.tab('Konuşmalar');await f.section.getByText('Konuşma kaydı yok.').waitFor();await f.tab('Bilgi kaynakları');await started.promise
  assert.equal(await f.section.getByRole('button',{name:'Taslağı kaydet'}).count(),0)
  await f.tab('Talepler');await f.section.getByText('Talep yok',{exact:true}).waitFor();slow.release();await f.tab('Bilgi kaynakları')
  await f.section.getByLabel('Başlık',{exact:true}).waitFor();assert.equal(await f.section.getByLabel('Başlık',{exact:true}).inputValue(),'Retained source draft');assert.equal(await f.section.getByText('STALE SOURCE',{exact:true}).count(),0);assert.equal(f.posts(),0);await f.close()
 }
 {const f=await fixture(async(path,n)=>path.endsWith('/knowledge')?(n===1?ok([source]):n===2?{status:503,body:{title:'Fixture source unavailable'}}:ok([])):defaults(path))
  await f.tab('Bilgi kaynakları');await f.section.getByRole('button',{name:'Düzenle',exact:true}).click();await f.section.getByLabel('Başlık',{exact:true}).fill('Source draft after failure')
  await f.tab('Konuşmalar');await f.tab('Bilgi kaynakları');await f.section.getByRole('alert').waitFor();assert.equal(await f.section.getByRole('button',{name:'Taslağı kaydet'}).count(),0)
  await f.section.getByRole('button',{name:'Tekrar dene'}).click();await f.section.getByLabel('Başlık',{exact:true}).waitFor();assert.equal(await f.section.getByLabel('Başlık',{exact:true}).inputValue(),'Source draft after failure');assert.equal(await f.section.getByRole('button',{name:'Taslağı kaydet'}).isEnabled(),false);assert.equal(f.posts(),0);await f.close()
 }
 {let rev=1;const f=await fixture(async(path,n)=>path.endsWith('/policies')&&n===2?{status:503,body:{title:'Fixture unavailable'}}:path.endsWith('/policies')?ok({modelConfigured:false,items:[{...policy,revision:rev}]}):defaults(path))
  await f.section.getByRole('button',{name:'Yeni sürüm hazırla'}).click();await f.section.getByLabel('Karşılama',{exact:true}).fill('Retained policy draft')
  await f.tab('Konuşmalar');await f.tab('Politika ve istem');await f.section.getByRole('alert').waitFor();assert.equal(await f.section.getByRole('button',{name:'Yürürlüğe al'}).count(),0)
  rev=2;await f.section.getByRole('button',{name:'Tekrar dene'}).click();await f.section.getByLabel('Karşılama',{exact:true}).waitFor();assert.equal(await f.section.getByLabel('Karşılama',{exact:true}).inputValue(),'Retained policy draft');assert.equal(await f.section.getByRole('button',{name:'Yürürlüğe al'}).isEnabled(),false);await f.close()
 }
 {const f=await fixture(async path=>path.endsWith('/knowledge')?ok([source]):defaults(path),async(path,body)=>{assert.ok(path.endsWith('/knowledge/a'));assert.equal(body.title,'Updated fixture');return ok(source)})
  await f.tab('Bilgi kaynakları');await f.section.getByRole('button',{name:'Düzenle',exact:true}).click();await f.section.getByLabel('Başlık',{exact:true}).fill('Updated fixture');await f.section.getByRole('button',{name:'Taslağı kaydet'}).click();await f.section.getByText('Kaynak taslak olarak kaydedildi; yayın için onaylayın.').waitFor();assert.equal(f.posts(),1);await f.close()
 }
 for(const width of [1440,1280,768,390]){const f=await fixture(async path=>defaults(path));await f.page.setViewportSize({width,height:900});const tab=f.section.getByRole('button',{name:'Bilgi kaynakları',exact:true});await tab.focus();await f.page.keyboard.press('Enter');await f.section.getByText('Bilgi kaynağı yok.').waitFor();assert.ok(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await f.close()}
 console.log(`PASS: ${passed} Chrome AI fixture scenarios; no real writes/provider calls`)
}finally{await browser.close()}
