// Fixture UI regression: intercepts every API request; never uses an owner's session or SQL.
import assert from 'node:assert/strict'
import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'

const origin = process.env.CRM_UI_ORIGIN || 'http://127.0.0.1:5185'
assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(origin))
const browser = await chromium.launch({channel:'chrome',headless:true})
const permissions = ['customers.read','quotes.read','reports.read','orders.read','audit.read','catalog.read','inventory.read','content.read','pricing.read','print.read','integration.read','ai.read','settings.read','notifications.read']
const row = {id:'11111111-1111-1111-1111-111111111111',name:'S*** C***',email:'c***@***',phone:'***67',status:'active',createdAt:'2026-10-20T00:00:00Z',orderCount:0}
try {
 const context=await browser.newContext(),page=await context.newPage()
 let allowed=true, failure=false, detailFailure=false, lastQuery, customerCalls=0
 const errors=[];page.on('pageerror',error=>errors.push(error.message))
 await context.route('**/api/v1/**',async route=>{
  const url=new URL(route.request().url()),path=url.pathname
  assert.equal(route.request().method(),'GET','Customer directory must be read-only')
  const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)})
  if(path.endsWith('/admin/session')) return reply({account:{name:'Synthetic staff'},permissions:allowed?permissions:permissions.filter(value=>value!=='customers.read')})
  if(path.endsWith('/local-commerce/state')) return reply({title:'Katalog kullanılamıyor',code:'catalog_unavailable'},503)
  if(path.endsWith('/admin/customers')){
   customerCalls++;lastQuery=url.searchParams
   if(failure)return reply({title:'SQL müşteri veri kaynağı kullanılamıyor.',code:'admin_sql_unavailable'},503)
   const page=Number(url.searchParams.get('page')||1),query=url.searchParams.get('query')
   const items=query==='absent'?[]:[{...row,id:page===2?'22222222-2222-2222-2222-222222222222':row.id}]
   return reply({items,page,pageSize:20,total:query==='absent'?0:21,totalPages:query==='absent'?0:2})
  }
  if(path.endsWith('/admin/customers/'+row.id))return detailFailure?reply({title:'Müşteri bulunamadı.'},404):reply({customer:row,addressCount:0,favoriteCount:1})
  return reply({title:'Fixture route not provided'},503)
 })
 for(const width of [1440,1280,768,390]){
  await page.setViewportSize({width,height:900});await page.goto(origin+'/?view=customers')
  await page.getByRole('button',{name:'İncele',exact:true}).waitFor()
  assert.equal(await page.locator('.page-heading h1').textContent(),'Müşteri yönetimi')
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Overflow ${width}`)
  await page.getByRole('button',{name:'İncele',exact:true}).click()
  await page.getByRole('dialog').waitFor();assert.ok(await page.getByRole('dialog').textContent().then(value=>value.includes('c***@***')))
  await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0)
  assert.equal(await page.getByRole('button',{name:'İncele',exact:true}).evaluate(el=>el===document.activeElement),true)
 }
 await page.getByRole('button',{name:'Sonraki',exact:false}).click()
 await page.getByText('21 müşteri · Sayfa 2/2',{exact:true}).waitFor()
 assert.equal(lastQuery.get('page'),'2');assert.equal(lastQuery.get('pageSize'),'20')
 await page.getByLabel('Müşteri ara').fill('absent');await page.getByRole('button',{name:'Ara',exact:true}).click()
 await page.getByText('Aramaya uygun müşteri yok',{exact:true}).waitFor();assert.equal(lastQuery.get('page'),'1')
 await page.getByRole('button',{name:'Aramayı temizle'}).click();await page.getByRole('button',{name:'İncele',exact:true}).waitFor()
 failure=true;await page.reload();await page.getByRole('alert').filter({hasText:'SQL müşteri'}).waitFor()
 assert.equal(await page.getByRole('button',{name:'İncele',exact:true}).count(),0)
 failure=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await page.getByRole('button',{name:'İncele',exact:true}).waitFor()
 detailFailure=true;await page.getByRole('button',{name:'İncele',exact:true}).click()
 await page.getByRole('alert').filter({hasText:'Müşteri bulunamadı.'}).waitFor();assert.equal(await page.getByRole('dialog').count(),0)
 detailFailure=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await page.getByRole('button',{name:'İncele',exact:true}).waitFor()
 await page.reload();await page.getByRole('button',{name:'İncele',exact:true}).waitFor()
 const {navigationItems,topNavigation,sideNavigation,initialView,categoryForView}=await import('../apps/admin/src/admin-navigation.ts')
 assert.equal(navigationItems.length,16);assert.equal(new Set(navigationItems.map(x=>x.view)).size,16)
 const top=topNavigation.flatMap(x=>x.links.map(item=>item.view)),side=sideNavigation.flatMap(x=>x.items.map(item=>item.view))
 assert.equal(top.filter(view=>side.includes(view)).length,0);assert.equal(top.filter(view=>view==='customers').length,1)
 assert.equal(initialView('?view=customers',()=>true),'customers');assert.notEqual(initialView('?view=customers',p=>p!=='customers.read'),'customers')
 for(const item of navigationItems)assert.equal(initialView('?view='+item.view,permission=>permission===item.permission),item.view)
 assert.equal(categoryForView('customers'),'Müşteriler')
 const before=customerCalls;allowed=false;await page.goto(origin+'/?view=customers')
 await page.locator('.page-heading h1').waitFor();assert.notEqual(await page.locator('.page-heading h1').textContent(),'Müşteri yönetimi')
 await page.getByRole('button',{name:'Müşteriler',exact:true}).click()
 assert.equal(await page.locator('[data-nav-view=customers]').count(),0);assert.equal(customerCalls,before)
 assert.deepEqual(errors,[])
 console.log('PASS fixture Chrome: 4 widths, modal/Escape/focus, search/pagination/empty, 503/retry, permission, reload and 16 unique views')
 await context.close()
} finally {await browser.close()}
