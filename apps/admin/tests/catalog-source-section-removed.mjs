// All data is synthetic; no local/SQL catalogue or source record can be changed.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {mkdir} from 'node:fs/promises'
import {mockPanel,store,product} from './consistency-fixtures.mjs'
const require=createRequire(new URL('../../web/package.json',import.meta.url)),{chromium}=require('@playwright/test')
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/',output=process.env.ADMIN_CONSISTENCY_OUTPUT||'/tmp/xinobi-catalog-source-removed'
await mkdir(output,{recursive:true})
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage()
  const sourceRequests=[],writes=[]
  await mockPanel(page,{handler:async(route,path)=>{
   if(path.includes('/personalization-sources/')){sourceRequests.push(path);await route.fulfill({status:503,json:{message:'Cancelled catalogue section must not request source data'}});return true}
   if(route.request().method()!=='GET')writes.push(path)
   if(path.endsWith('/state')){await route.fulfill({json:{...store,products:[{...product,personalizable:true}]}});return true}
   return false
  }})
  await page.goto(base+'?view=catalog')
  await page.getByRole('button',{name:product.name+' ürününü düzenle',exact:true}).waitFor()
  assert.equal(await page.locator('.personalization-source').count(),0)
  assert.equal(await page.getByText('XINOBI U · Tek kaynak fotoğraf',{exact:true}).count(),0)
  assert.ok(await page.getByRole('button',{name:'Yeni ürün',exact:true}).isVisible())
  assert.ok(await page.getByRole('button',{name:'Yeni kategori',exact:true}).isVisible())
  await page.getByRole('button',{name:product.name+' ürününü düzenle',exact:true}).click()
  await page.getByRole('button',{name:'Medya',exact:true}).click()
  await page.getByRole('heading',{name:'Orijinal ürün görseli',exact:true}).waitFor()
  assert.equal(await page.getByLabel('Tek kaynak fotoğraf yükle',{exact:true}).count(),0)
  await page.getByRole('button',{name:'Ürün düzenlemeyi kapat',exact:true}).click()
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false)
  assert.deepEqual(sourceRequests,[]);assert.deepEqual(writes,[])
  await page.screenshot({path:output+'/catalog-'+width+'.png',fullPage:true})
  await context.close()
 }
 console.log('PASS cancelled source section absent at 390/1440; no source/fulfillment requests or writes; normal product/category/media controls remain')
}finally{await browser.close()}
