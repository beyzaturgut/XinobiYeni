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
async function fixture(read,write,permissions=['ai.read','ai.write']){
 const context=await browser.newContext(),page=await context.newPage(),counts={},errors=[];let posts=0
 page.on('pageerror',e=>errors.push(e.message))
 await context.route('**/api/v1/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;let result
  if(path.endsWith('/auth/admin/refresh'))result={status:401,body:{}}
  else if(req.method()!=='GET'){assert.ok(permissions.includes('ai.write'),'Read-only mutation forbidden');assert.ok(write,'Unexpected mutation');posts++;result=await write(path,req.postDataJSON())}
  else if(path.endsWith('/admin/session'))result=ok({account:{name:'Synthetic'},permissions})
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
 for(const permissions of [['ai.read'],['ai.read','ai.write']]){
  let reads=0
  const report={days:[{day:'2026-10-19',feature:'assistant',calls:11,failures:1,inputTokens:10,outputTokens:20,estimatedCost:0.1},{day:'2026-10-20',feature:'assistant',calls:22,failures:0,inputTokens:20,outputTokens:30,estimatedCost:0.2},{day:'2026-10-21',feature:'xinobi_u',calls:33,failures:2,inputTokens:0,outputTokens:0,estimatedCost:null}],aiCallsToday:7,dailyAiLimit:10,costRatesSet:true,note:'Fixture estimate; not an invoice'}
  const f=await fixture(async path=>{if(path.endsWith('/usage')){reads++;return ok(report)}return defaults(path)},undefined,permissions)
  await f.tab('Kullanım ve maliyet');await f.section.getByText('7 / 10',{exact:true}).waitFor()
  const from=f.section.getByLabel('Başlangıç tarihi',{exact:true}),to=f.section.getByLabel('Bitiş tarihi',{exact:true}),table=f.section.getByRole('table')
  const count=async n=>assert.equal(await table.locator('tbody tr').count(),n)
  await count(3);await from.fill('2026-10-20');await count(2);await to.fill('2026-10-20');await count(1)
  await table.getByRole('cell',{name:'22',exact:true}).waitFor()
  await from.fill('');await count(2);await to.fill('2026-10-19');await count(1)
  await from.fill('2026-10-21');await f.section.getByText('Başlangıç tarihi bitiş tarihinden sonra olamaz.',{exact:true}).waitFor();assert.equal(await table.count(),0)
  await f.section.getByRole('button',{name:'Tarihleri temizle'}).click();await count(3)
  await from.fill('2027-01-01');await f.section.getByText('Seçilen tarih aralığında kayıt yok.',{exact:true}).waitFor();await count(0)
  await f.section.getByText('7 / 10',{exact:true}).waitFor();assert.equal(reads,1);assert.equal(f.posts(),0)
  for(const width of [1440,1280,768,390]){await f.page.setViewportSize({width,height:900});await from.focus();await f.page.keyboard.press('Tab');assert.ok(await f.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
  await f.section.getByRole('button',{name:'Tarihleri temizle'}).click();await count(3);assert.equal(reads,1);await f.close()
 }
 {const slow=gate(),started=gate();let reads=0
  const report={days:[{day:'2026-10-21',feature:'assistant',calls:1,failures:0,inputTokens:0,outputTokens:0}],aiCallsToday:1,dailyAiLimit:10,costRatesSet:false,note:'Fixture'}
  const f=await fixture(async path=>{if(!path.endsWith('/usage'))return defaults(path);reads++;if(reads===1){started.release();await slow.promise;return ok(report)}if(reads===2)return {status:503,body:{title:'Fixture usage unavailable'}};return ok(report)})
  await f.tab('Kullanım ve maliyet');await started.promise;await f.tab('Konuşmalar');await f.section.getByText('Konuşma kaydı yok.').waitFor();slow.release();await f.tab('Kullanım ve maliyet')
  await f.section.getByRole('alert').waitFor();assert.equal(await f.section.getByRole('table').count(),0)
  await f.section.getByRole('button',{name:'Tekrar dene'}).click();await f.section.getByLabel('Başlangıç tarihi',{exact:true}).waitFor();await f.section.getByLabel('Başlangıç tarihi',{exact:true}).fill('2026-10-21');assert.equal(reads,3);await f.close()
 }
 const lead={id:'l',conversationId:'c',name:'Fixture lead',email:'fixture@example.invalid',topic:'Fixture topic',createdAt:policy.createdAt,status:'new'}
 const conversation={id:'c',channel:'web',createdAt:policy.createdAt,updatedAt:policy.createdAt,messages:[{id:'m',role:'user',text:'Fixture conversation text',productIds:[],at:policy.createdAt}],leadSent:false,handedOff:false}
 const records=path=>path.endsWith('/knowledge')?ok([source]):path.endsWith('/leads')?ok([lead]):path.endsWith('/conversations')?ok([conversation]):defaults(path)
 {const f=await fixture(async path=>records(path),undefined,['ai.read'])
  const disabled=async name=>{const b=f.section.getByRole('button',{name,exact:true});assert.equal(await b.isEnabled(),false);await b.evaluate(el=>el.click());assert.equal(f.posts(),0)}
  await f.section.getByText('Yürürlükteki politika · sürüm 1',{exact:true}).waitFor();await disabled('Yeni sürüm hazırla')
  await f.tab('Bilgi kaynakları');await f.section.getByText('Source A',{exact:true}).waitFor();for(const name of ['+ Yeni kaynak','Onayla','Arşivle','Düzenle'])await disabled(name)
  await f.tab('Konuşmalar');await f.section.getByRole('button',{name:'Oku',exact:true}).click();await f.section.getByText('Fixture conversation text',{exact:true}).waitFor()
  await f.tab('Talepler');await f.section.getByText('Fixture lead',{exact:true}).waitFor();await disabled('İletişime geçildi');await disabled('Kapat')
  await f.tab('Kullanım ve maliyet');await f.section.getByText('Kullanım kaydı yok.',{exact:true}).waitFor();assert.equal(f.posts(),0);await f.close()
 }
 for(const action of ['policy','create','edit','approve','archive','contact','close']){
  const wait=gate(),started=gate();let payload
  const f=await fixture(async path=>records(path),async(path,body)=>{payload={path,body};started.release();await wait.promise;return ok({})})
  let button
  if(action==='policy'){await f.section.getByRole('button',{name:'Yeni sürüm hazırla'}).click();await f.section.getByLabel('Değişiklik gerekçesi',{exact:true}).fill('Fixture reason');button=f.section.getByRole('button',{name:'Yürürlüğe al'})}
  else if(['create','edit','approve','archive'].includes(action)){
   await f.tab('Bilgi kaynakları')
   if(action==='create'||action==='edit'){await f.section.getByRole('button',{name:action==='create'?'+ Yeni kaynak':'Düzenle',exact:true}).click();await f.section.getByLabel('Başlık',{exact:true}).fill('Fixture updated');await f.section.getByRole('textbox',{name:/^Metin/}).fill('Fixture updated body');button=f.section.getByRole('button',{name:'Taslağı kaydet'})}
   else button=f.section.getByRole('button',{name:action==='approve'?'Onayla':'Arşivle',exact:true})
  }else{await f.tab('Talepler');f.page.on('dialog',dialog=>dialog.accept('Fixture note'));button=f.section.getByRole('button',{name:action==='contact'?'İletişime geçildi':'Kapat',exact:true})}
  await button.focus();await f.page.keyboard.press('Enter');await started.promise;assert.equal(await button.isEnabled(),false)
  if(['policy','create','edit'].includes(action))await button.evaluate(el=>{el.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));el.form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))})
  else await button.evaluate(el=>{el.click();el.click()})
  assert.equal(f.posts(),1);assert.ok(payload.path.includes('/assistant/'))
  if(action==='policy')assert.equal(payload.body.baseRevision,1)
  wait.release();await f.section.getByRole('status').filter({hasText:/yürürlükte|kaydedildi|onaylandı|arşivlendi|güncellendi|kapatıldı/}).waitFor();assert.equal(f.posts(),1);await f.close()
 }
 {const f=await fixture(async path=>records(path),async()=>({status:503,body:{title:'Fixture write unavailable'}}))
  await f.tab('Bilgi kaynakları');await f.section.getByRole('button',{name:'Düzenle',exact:true}).click();await f.section.getByLabel('Başlık',{exact:true}).fill('Keep failed mutation draft');await f.section.getByRole('button',{name:'Taslağı kaydet'}).click()
  await f.section.getByText('Fixture write unavailable',{exact:true}).waitFor();assert.equal(await f.section.getByLabel('Başlık',{exact:true}).inputValue(),'Keep failed mutation draft');assert.equal(await f.section.getByRole('button',{name:'Taslağı kaydet'}).isEnabled(),true);await f.close()
 }
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
