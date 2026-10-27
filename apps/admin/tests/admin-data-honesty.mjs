// Real Chrome UI; every API call is intercepted. No real SQL/account/provider is used.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {navigationItems} from '../src/admin-navigation.ts'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
const product=(id,name,sku)=>({id,name,category:'Synthetic',description:'',seoTitle:'',active:true,variants:[{id:'V-'+id,sku,color:'Siyah',stock:4,image:''}]})
const state={products:[product('P1','Synthetic Alpha','SKU-A'),product('P2','Synthetic Beta','SKU-B')],prices:{},categories:[],content:{slides:[],xinobiBanner:'',buttonColor:'#000000'}}
try{
 for(const width of [1440,1280,768,390]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[]
  let writes=0
  page.on('pageerror',error=>errors.push(error.message))
  await page.route('**/api/**',route=>{
   if(route.request().method()!=='GET'){writes++;return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})}
   const path=new URL(route.request().url()).pathname
   if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:[...new Set(navigationItems.map(item=>item.permission)),'settings.staff','catalog.write']}})
   if(path.endsWith('/state'))return route.fulfill({json:state})
   return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
  })
  await page.goto(base+'?view=dashboard');await page.getByRole('region',{name:'Dashboard',exact:true}).waitFor()
  assert.equal(await page.locator('.widget').count(),13)
  assert.equal(await page.locator('.metric,.demo-bars,#dashboard-mode').count(),0)
  assert.equal(await page.getByRole('group',{name:'Rapor dönemi'}).locator('button:enabled').count(),9)
  await page.getByRole('alert').filter({hasText:'Synthetic unavailable'}).waitFor()
  await page.goto(base+'?view=inventory');await page.getByRole('spinbutton',{name:'SKU-A web stoğu'}).waitFor()
  await page.getByRole('textbox',{name:'Ürün, SKU veya renk ara'}).fill('SKU-B')
  assert.equal(await page.getByRole('spinbutton',{name:'SKU-A web stoğu'}).count(),0)
  assert.equal(await page.getByRole('spinbutton',{name:'SKU-B web stoğu'}).count(),1)
  await page.getByRole('button',{name:'Filtreleri temizle'}).click()
  assert.equal(await page.getByRole('spinbutton',{name:'SKU-A web stoğu'}).count(),1)
  await page.getByRole('button',{name:'Depo stokları',exact:true}).click()
  await page.getByText(/doğrulanmış depo ve hareket veri kaynağı bağlı değil/).waitFor()
  assert.equal(await page.getByText('Merkez depo',{exact:true}).count(),0)
  await page.goto(base+'?view=settings');await page.getByRole('button',{name:'Rol kaydı kullanılamıyor'}).waitFor()
  assert.equal(await page.getByRole('button',{name:'Rol kaydı kullanılamıyor'}).isDisabled(),true)
  const permissions=await page.locator('.session-permissions code').allTextContents()
  assert.deepEqual(permissions,[...new Set(navigationItems.map(item=>item.permission)),'settings.staff','catalog.write'].sort())
  assert.equal(await page.getByRole('combobox',{name:'Demo rol'}).count(),0)
  assert.equal(await page.getByRole('button',{name:'Yönetici daveti gönder'}).count(),1)
  await page.getByRole('button',{name:'Sistem ayarları',exact:true}).click()
  assert.equal(await page.getByRole('button',{name:'Ayar kaydı kullanılamıyor'}).isDisabled(),true)
  assert.equal(await page.getByRole('spinbutton',{name:'Düşük stok eşiği (önizleme)'}).isDisabled(),true)
  await page.goto(base+'?view=integrations');await page.getByText('Bağlantı doğrulanmadı',{exact:true}).waitFor()
  assert.equal(await page.getByRole('button',{name:'Yeni eşleme taslağı'}).count(),0)
  for(const provider of ['Mikro','Trendyol','Hepsiburada','N11']){
   await page.getByRole('button',{name:provider,exact:true}).click()
   await page.getByRole('button',{name:'İşler ve hatalar',exact:true}).click()
   assert.equal(await page.getByRole('table').count(),0)
  }
  assert.equal(writes,0)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  assert.deepEqual(errors,[])
  await page.close();console.log(`${width}px PASS: no fabricated KPI/depot/provider records, stock search/clear, disabled nonpersistent settings, real invite retained, zero writes and no overflow`)
 }
 // Inventory-only save contract: failure keeps input, success requires
 // the returned server state. Double-click protection is UI-only, not a claim
 // of server idempotency. All writes below are intercepted fixtures.
 const page=await browser.newPage();let writes=0,fail=true
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:['inventory.read','inventory.write']}})
  if(route.request().method()!=='GET'){
   writes++;await new Promise(resolve=>setTimeout(resolve,80))
   assert.equal(route.request().method(),'PUT')
   assert.equal(path,'/api/v1/local-commerce/inventory/V-P1')
   if(fail)return route.fulfill({status:503,json:{title:'Synthetic stock failure'}})
   const saved=route.request().postDataJSON()
   assert.deepEqual(saved,{stock:9})
   return route.fulfill({json:{...state,products:[{...state.products[0],variants:[{...state.products[0].variants[0],stock:9}]},state.products[1]]}})
  }
  return route.fulfill({json:state})
 })
 await page.goto(base+'?view=inventory')
 const stock=page.getByRole('spinbutton',{name:'SKU-A web stoğu'})
 await stock.fill('9');await page.getByRole('button',{name:'Stoğu kaydet'}).first().click()
 await page.getByRole('alert').filter({hasText:'Synthetic stock failure'}).waitFor()
 assert.equal(await stock.inputValue(),'9');assert.equal(writes,1)
 fail=false
 await page.getByRole('button',{name:'Stoğu kaydet'}).first().evaluate(button=>{button.click();button.click()})
 await page.getByText('SKU-A stoğu kaydedildi.',{exact:true}).waitFor()
 assert.equal(writes,2);assert.equal(await stock.inputValue(),'9')
 await page.close();console.log('PASS: existing stock save retains failed input, confirmed state updates value, duplicate click sends one fixture request')
 const denied=await browser.newPage();let deniedWrites=0
 await denied.route('**/api/**',route=>{
  if(route.request().method()!=='GET'){deniedWrites++;return route.fulfill({status:403,json:{title:'Forbidden'}})}
  if(new URL(route.request().url()).pathname.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Catalog editor'},permissions:['inventory.read','catalog.write']}})
  return route.fulfill({json:state})
 })
 await denied.goto(base+'?view=inventory')
 await denied.getByRole('spinbutton',{name:'SKU-A web stoğu'}).waitFor()
 assert.equal(await denied.getByRole('spinbutton',{name:'SKU-A web stoğu'}).isDisabled(),true)
 assert.equal(await denied.getByRole('button',{name:'Stoğu kaydet'}).first().isDisabled(),true)
 assert.equal(deniedWrites,0)
 await denied.close();console.log('PASS: catalog.write alone cannot edit inventory')
}finally{await browser.close()}
