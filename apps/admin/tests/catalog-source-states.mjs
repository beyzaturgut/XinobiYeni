// Chrome with intercepted fixtures only: never writes to SQL or creates a real session.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {navigationItems} from '../src/admin-navigation.ts'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 for(const width of [1440,1280,768,390]){
  const page=await browser.newPage({viewport:{width,height:950}})
  let mode='unavailable',writes=0,writable=true
  const state={products:[],prices:{},categories:[],content:{slides:[],xinobiBanner:'',buttonColor:'#000000'}}
  await page.route('**/api/**',route=>{
   const path=new URL(route.request().url()).pathname
   if(route.request().method()!=='GET'){writes++;return route.fulfill({status:401,json:{title:'No test mutation allowed'}})}
   if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:[...new Set(navigationItems.map(item=>item.permission)),...(writable?['catalog.write','pricing.write']:[])]}})
   if(path.endsWith('/state')){
    if(mode==='network')return route.abort('failed')
    if(mode==='unavailable')return route.fulfill({status:503,json:{code:'catalog_unavailable',message:'Katalog şu anda kullanılamıyor.'}})
    if(mode==='forbidden')return route.fulfill({status:403,json:{title:'Forbidden'}})
    return route.fulfill({json:mode==='missing-categories'?{...state,categories:undefined}:state})
   }
   return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
  })
  for(const view of ['catalog','inventory','pricing','content']){
   for(const failure of ['unavailable','forbidden','network']){
    mode=failure
    await page.goto(base+'?view='+view)
    const boundary=page.getByRole('region',{name:'Katalog servis durumu'})
    await boundary.getByRole('alert').waitFor()
    assert.equal(await page.locator('.category-management-row,.catalog-summary,.content-editor').count(),0)
    assert.equal(await page.getByText('Örnek yüzde 10',{exact:true}).count(),0)
    assert.equal(await page.getByText('Local API bağlantısı gerekli.',{exact:true}).count(),0)
    if(failure==='forbidden')await boundary.getByText('Bu işlem için yetkiniz yok.').waitFor()
    if(failure==='unavailable')await boundary.getByText('Katalog şu anda kullanılamıyor.').waitFor()
    mode='empty'
    await boundary.getByRole('button',{name:'Tekrar dene'}).click()
    await boundary.waitFor({state:'detached'})
    if(view==='catalog'){
     await page.getByText('Katalogda ürün yok.',{exact:true}).waitFor()
     assert.equal(await page.locator('.category-management-row').count(),0)
    }
    if(view==='inventory'){
     await page.getByText('Katalogda varyant yok',{exact:true}).waitFor()
     await page.getByRole('textbox',{name:'Ürün, SKU veya renk ara'}).fill('missing')
     await page.getByRole('button',{name:'Filtreleri temizle'}).click()
     assert.equal(await page.getByRole('textbox',{name:'Ürün, SKU veya renk ara'}).inputValue(),'')
     await page.getByRole('button',{name:'Depo stokları',exact:true}).click()
     await page.getByText(/doğrulanmış depo ve hareket veri kaynağı bağlı değil/).waitFor()
     await page.getByRole('button',{name:'Web stokları',exact:true}).click()
    }
    if(view==='pricing'){
     await page.getByRole('button',{name:'Kampanyalar',exact:true}).click()
     assert.equal(await page.locator('tbody tr').count(),0)
     await page.getByRole('button',{name:'İndirim önizlemesi',exact:true}).click()
     const date=new Date(),today=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
     assert.equal(await page.getByLabel('Önizleme tarihi',{exact:true}).inputValue(),today)
     await page.getByText(/Kampanya taslakları yalnız bu oturumda tutulur/).waitFor()
    }
    if(view==='content')await page.locator('.content-editor').waitFor()
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No overflow: '+view)
   }
  }
  mode='missing-categories';writable=false
  await page.goto(base+'?view=catalog')
  await page.getByText('Katalogda ürün yok.',{exact:true}).waitFor()
  assert.equal(await page.locator('.category-management-row').count(),0,'Missing categories cannot load static defaults')
  assert.equal(await page.getByRole('button',{name:'Yeni ürün',exact:true}).isDisabled(),true)
  assert.equal(await page.getByRole('button',{name:'Yeni kategori',exact:true}).isDisabled(),true)
  assert.equal(writes,0,'Read/error/retry tests must not send mutations')
  await page.close()
  console.log(width+'px PASS: four modules distinguish 503/403/network from empty 200; retry, no fallback, inventory tabs and campaign source/date')
 }
}finally{await browser.close()}
