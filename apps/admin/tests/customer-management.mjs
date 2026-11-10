// Synthetic customer lifecycle only. The isolation guard blocks real API/provider access.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {mockPanel,permissions} from './consistency-fixtures.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/',output=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-customer-management'
await mkdir(output,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
const id='11111111-1111-1111-1111-111111111111'
async function fixture(width=390,access=['customers.write','customers.delete']){
 const context=await browser.newContext({viewport:{width,height:1100}}),page=await context.newPage();let version=1,writes=0,fail=false,malformed=false
 let customer={id,name:'İ*** M***',email:'m***@***',phone:'***67',status:'active',createdAt:'2026-10-20T10:00:00Z',orderCount:2,lastOrderAt:'2026-11-01T10:00:00Z',version:'v1'}
 const details=()=>({customer:{...customer},addressCount:1,favoriteCount:1})
 await mockPanel(page,{permissions:[...permissions.filter(p=>!p.startsWith('customers.')||p==='customers.read'),...access],handler:async(route,path)=>{
  if(path==='/api/v1/admin/customers'){await route.fulfill({json:{items:[customer],page:1,pageSize:20,total:1,totalPages:1}});return true}
  if(path==='/api/v1/admin/customers/'+id){await route.fulfill({json:details()});return true}
  if(path.startsWith('/api/v1/admin/customers/'+id+'/')){
   writes++;const body=route.request().postDataJSON();assert.equal(body.expectedVersion,customer.version)
   await new Promise(r=>setTimeout(r,80))
   if(fail){await route.fulfill({status:503,json:{title:'İzole müşteri kayıt hatası'}});return true}
   customer={...customer,status:path.endsWith('/delete')?'deleted':body.status,version:'v'+(++version)}
   await route.fulfill({json:malformed?{customer:{...customer,id:'wrong-account'}}:details()});return true
  }
  return false
 }})
 await page.goto(base+'?view=customers');await page.getByRole('button',{name:'İncele',exact:true}).click();await page.getByRole('heading',{name:'Müşteri detayı',exact:true}).waitFor()
 return {context,page,get writes(){return writes},fail:v=>{fail=v},malformed:v=>{malformed=v}}
}
try{
 for(const width of [320,390,768,1440]){
  const f=await fixture(width),p=f.page,dialog=p.locator('dialog[open]')
  await p.getByRole('button',{name:'Askıya al',exact:true}).click()
  assert.equal(await p.getByRole('button',{name:'İşlemi onayla',exact:true}).isDisabled(),true)
  await p.getByLabel('Bu müşteri için işlemi onaylıyorum',{exact:true}).check()
  await p.getByRole('button',{name:'İşlemi onayla',exact:true}).evaluate(button=>{button.click();button.click()})
  assert.equal(await p.evaluate(()=>window.dispatchEvent(new Event('xinobi:before-navigation',{cancelable:true}))),false)
  await p.getByRole('status').filter({hasText:'Müşteri askıya alındı; mevcut oturumları kapatıldı.'}).waitFor();assert.equal(f.writes,1)
  await p.getByRole('button',{name:'Yeniden etkinleştir',exact:true}).click();await p.getByLabel('Bu müşteri için işlemi onaylıyorum',{exact:true}).check();await p.getByRole('button',{name:'İşlemi onayla',exact:true}).click()
  await p.getByRole('status').filter({hasText:'Müşteri yeniden etkinleştirildi.'}).waitFor()
  await p.getByRole('button',{name:'Hesabı sil',exact:true}).click();await p.getByLabel('Bu müşteri için işlemi onaylıyorum',{exact:true}).check();await p.getByLabel('Onay için SİL yazın',{exact:true}).fill('SIL')
  assert.equal(await p.getByRole('button',{name:'İşlemi onayla',exact:true}).isDisabled(),true)
  await p.getByLabel('Onay için SİL yazın',{exact:true}).fill('SİL')
  if(width===390){const a=await new AxeBuilder({page:p}).include('dialog[open]').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();assert.deepEqual(a.violations.filter(x=>['critical','serious'].includes(x.impact)).map(x=>x.id),[])}
  if(width===320){await p.evaluate(()=>{const values=[...document.querySelectorAll('dialog *')].filter(e=>!e.closest('svg')).map(e=>[e,parseFloat(getComputedStyle(e).fontSize)]);for(const [e,n]of values)if(n)e.style.fontSize=n*2+'px'})}
  assert.equal(await dialog.evaluate(e=>e.scrollWidth>e.clientWidth+1),false,'modal overflow '+width)
  if(width===390||width===1440)await p.screenshot({path:output+'/customer-confirmation-'+width+'.png',fullPage:true})
  await p.getByRole('button',{name:'İşlemi onayla',exact:true}).click();await p.getByRole('status').filter({hasText:'Müşteri hesabı silindi. Sipariş geçmişi ve dosyaları korundu.'}).waitFor()
  assert.equal(f.writes,3);assert.equal(await p.getByRole('button',{name:'Yeniden etkinleştir',exact:true}).count(),0);assert.equal(await p.getByRole('button',{name:'Hesabı sil',exact:true}).count(),0)
  await f.context.close()
 }
 for(const access of [[],['customers.write']]){const f=await fixture(390,access);assert.equal(await f.page.getByRole('button',{name:'Hesabı sil',exact:true}).count(),0);assert.equal(await f.page.getByRole('button',{name:'Askıya al',exact:true}).count(),access.length?1:0);assert.equal(f.writes,0);await f.context.close()}
 for(const mode of ['failure','unverified']){
  const f=await fixture(),p=f.page;if(mode==='failure')f.fail(true);else f.malformed(true)
  await p.getByRole('button',{name:'Askıya al',exact:true}).click();await p.getByLabel('Bu müşteri için işlemi onaylıyorum',{exact:true}).check();await p.getByRole('button',{name:'İşlemi onayla',exact:true}).click()
  await p.getByRole('alert').filter({hasText:mode==='failure'?'İzole müşteri kayıt hatası':'İşlem sonucu doğrulanamadı'}).waitFor();assert.equal(await p.getByRole('button',{name:'İşlemi onayla',exact:true}).isDisabled(),true)
  assert.equal(await p.getByLabel('Bu müşteri için işlemi onaylıyorum',{exact:true}).isChecked(),true);assert.equal(f.writes,1)
  f.fail(false);f.malformed(false);await p.getByRole('button',{name:'Güncel müşteri kaydını yükle',exact:true}).click();await p.getByRole('button',{name:mode==='failure'?'Askıya al':'Yeniden etkinleştir',exact:true}).waitFor();assert.equal(f.writes,1)
  await f.context.close()
 }
 console.log('PASS customer suspend/reactivate/delete, independent permissions, explicit confirmation, duplicate/navigation guards, failures/unverified result refresh, 4 widths/200%/axe; no real writes')
}finally{await browser.close()}
