// Real Chrome + intercepted HTTP fixtures only. Never mutates real SQL/prices.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {navigationItems} from '../src/admin-navigation.ts'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
try{
 for(const width of [1440,1280,768,390]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[]
  let fail=false,writable=true,writes=0,cents=1000
  page.on('pageerror',error=>errors.push(error.message))
  const state=()=>({products:[{id:'P',name:'Synthetic product',category:'Synthetic',active:true,description:'',seoTitle:'',variants:[{id:'V',sku:'SKU-P',color:'Siyah',stock:2,image:''}]}],prices:{V:cents},categories:['Synthetic'],content:{slides:[],xinobiBanner:'',buttonColor:'#000000'}})
  await page.route('**/api/**',async route=>{
   const path=new URL(route.request().url()).pathname
   if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:[...new Set(navigationItems.map(item=>item.permission)),...(writable?['pricing.write']:[])]}})
   if(path.endsWith('/prices/V')&&route.request().method()==='PUT'){
    writes++;assert.equal(route.request().headers()['x-xinobi-csrf'],'1')
    await new Promise(resolve=>setTimeout(resolve,80))
    if(fail)return route.fulfill({status:503,json:{title:'Synthetic price failure'}})
    cents=route.request().postDataJSON().cents;return route.fulfill({json:state()})
   }
   if(path.endsWith('/state'))return route.fulfill({json:state()})
   return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
  })
  await page.goto(base+'?view=pricing')
  await page.getByRole('button',{name:'SKU-P fiyatını düzenle'}).click()
  const amount=page.getByRole('textbox',{name:'Fiyat (TRY)',exact:true})
  await amount.fill('12,50');await page.getByRole('button',{name:'Fiyatı kaydet',exact:true}).click()
  await page.getByText('Fiyat sunucu tarafından kaydedildi.',{exact:true}).waitFor()
  assert.equal(cents,1250);assert.equal(writes,1)
  fail=true;await amount.fill('14,00')
  await page.getByRole('button',{name:'Fiyatı kaydet',exact:true}).evaluate(button=>{button.click();button.click()})
  await page.getByRole('alert').filter({hasText:'Synthetic price failure'}).waitFor()
  assert.equal(writes,2);assert.equal(await amount.inputValue(),'14,00')
  assert.equal(await page.getByText('Fiyat sunucu tarafından kaydedildi.',{exact:true}).count(),0)
  await amount.fill('invalid');await page.getByRole('button',{name:'Fiyatı kaydet',exact:true}).click()
  assert.equal(writes,2)
  writable=false;await page.reload();await page.getByRole('button',{name:'SKU-P fiyatını düzenle'}).waitFor()
  assert.equal(await page.getByRole('button',{name:'SKU-P fiyatını düzenle'}).isDisabled(),true)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  assert.deepEqual(errors,[]);await page.close()
  console.log(`${width}px PASS: server-confirmed price success, no stale success after failure, draft retained, duplicate/invalid input blocked, read-only permission and no overflow`)
 }
}finally{await browser.close()}
