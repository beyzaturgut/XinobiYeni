// Real Chrome, intercepted synthetic API only; never writes owner's catalog or profiles.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5173/'
const state={products:[{id:'P1',name:'Synthetic bottle',active:true,personalizable:true,category:'Test',variants:[{id:'V1',sku:'TEST-1',color:'Siyah',stock:1,image:''}]}],prices:{},categories:[],content:{slides:[],xinobiBanner:'',buttonColor:'#000000'}}
try{
 for(const width of [1440,768,390]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];let rows=[],fail=true,writes=0
  page.setDefaultTimeout(10000);page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)})
  await page.route('**/api/**',async route=>{
   const path=new URL(route.request().url()).pathname,method=route.request().method()
   if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['print.read','print.write','print.operate']}})
   if(path.endsWith('/state'))return route.fulfill({json:state})
   if(path.endsWith('/admin/print-profiles')&&method==='GET')return route.fulfill({json:rows})
   if(path.endsWith('/admin/print-profiles')&&method==='POST'){
    writes++;if(fail)return route.fulfill({status:409,json:{title:'Synthetic revision conflict'}})
    const body=route.request().postDataJSON();assert.equal(body.definition.widthMm,null);assert.equal(body.definition.dpi,null)
    rows=[{id:'profile1',revision:1,status:'draft',sku:'TEST-1',definition:body.definition,actorId:'synthetic',createdAt:'2026-10-30T00:00:00Z'}]
    return route.fulfill({json:rows[0]})
   }
   return route.fulfill({json:{items:[],total:0,totalPages:0,page:1,pageSize:20}})
  })
  await page.goto(base+'?view=print')
  const panel=page.getByRole('region',{name:'Fiziksel baskı profilleri'})
  await panel.getByText('Henüz fiziksel baskı profili tanımlanmamış.').waitFor()
  await panel.getByRole('button',{name:'Yeni baskı profili',exact:true}).click()
  await panel.getByRole('combobox',{name:/^Ürün/}).selectOption('P1');await panel.getByRole('combobox',{name:/^Renk \/ SKU/}).selectOption('V1')
  await panel.getByRole('combobox',{name:/^Baskı yüzü/}).selectOption('front');await panel.getByLabel('Profil adı',{exact:true}).fill('Synthetic calibration')
  assert.equal(await panel.getByLabel('Alan genişliği (mm)',{exact:true}).inputValue(),'')
  assert.equal(await panel.getByLabel('Hedef DPI',{exact:true}).inputValue(),'')
  await panel.getByRole('button',{name:'Yeni taslak sürümü kaydet'}).click();await panel.getByRole('alert').filter({hasText:'Synthetic revision conflict'}).waitFor()
  assert.equal(await panel.getByLabel('Profil adı',{exact:true}).inputValue(),'Synthetic calibration');assert.equal(writes,1)
  fail=false;await panel.getByRole('button',{name:'Yeni taslak sürümü kaydet'}).click()
  await panel.getByText('Yeni taslak sürüm kaydedildi. Önceki onaylı sürüm değişmedi.').waitFor()
  assert.equal(writes,2);assert.equal(await panel.getByRole('button',{name:'Kaydedilmiş taslağı onayla'}).isDisabled(),true)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  assert.deepEqual(errors,[]);if(process.env.PRINT_PROFILE_SCREENSHOTS)await page.screenshot({path:`/tmp/xinobi-print-profiles-${width}.png`,fullPage:true});await page.close();console.log(`${width}px PASS: blank physical values, real catalog selection, conflict retains input, draft save, evidence required, no overflow/errors`)
 }
 const page=await browser.newPage();await page.route('**/api/**',route=>{
  const path=new URL(route.request().url()).pathname
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Reader'},permissions:['print.read']}})
  if(path.endsWith('/state'))return route.fulfill({json:state})
  if(path.endsWith('/admin/print-profiles'))return route.fulfill({json:[]})
  return route.fulfill({json:{items:[],total:0,totalPages:0,page:1,pageSize:20}})
 });await page.goto(base+'?view=print');await page.getByText('Henüz fiziksel baskı profili tanımlanmamış.').waitFor()
 assert.equal(await page.getByRole('button',{name:'Yeni baskı profili',exact:true}).isDisabled(),true)
 console.log('PASS: print.read cannot create profiles');await page.close()
}finally{await browser.close()}
