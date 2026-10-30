import {navigateTo} from './navigation-helper.mjs'
import {navigationItems} from '../src/admin-navigation.ts'
// Run against the normal Development admin on 5174 (do not disable AdminAccess).
// Navigation-only permission coverage for current main; existing write controllers are not changed.
// Every API request is intercepted; no real SQL/session or delivery is used.
import {createRequire} from 'node:module'
import assert from 'node:assert/strict'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
try{
 const page=await browser.newPage(),errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.route('**/api/**',route=>{
  assert.equal(route.request().method(),'GET','Read permission must never cause a mutation')
  const path=new URL(route.request().url()).pathname
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{id:'reader',name:'Read only'},permissions:['reports.read','quotes.read','content.read','notifications.read','ai.read']}})
  if(path.endsWith('/dashboard'))return route.fulfill({json:{orderCount:0,customerCount:0,statuses:[],days:[],recordedAmounts:[]}})
  if(path.endsWith('/reviews'))return route.fulfill({json:[{id:'review',productId:'product',rating:5,body:'Test review',authorName:'T.',status:'pending',createdAt:'2026-10-16T00:00:00Z'}]})
  if(path.endsWith('/quotes'))return route.fulfill({json:[{id:'quote',code:'Q-TEST',company:'Synthetic',contactName:'Test',email:'test@example.invalid',items:[],status:'received',createdAt:'2026-10-16T00:00:00Z',messages:[],history:[]}]})
  if(path.endsWith('/notifications'))return route.fulfill({json:{channels:[],items:[{id:'notice',channel:'email',recipient:'test@example.invalid',title:'Synthetic',status:'failed',createdAt:'2026-10-16T00:00:00Z',attempts:1}]}})
  if(path.endsWith('/assistant/knowledge'))return route.fulfill({json:[{id:'source',title:'Synthetic source',keywords:[],status:'draft',version:1,updatedAt:'2026-10-16T00:00:00Z'}]})
  return route.fulfill({status:503,json:{title:'Isolated unavailable'}})
 })
 await page.goto('http://127.0.0.1:5174/')
 await page.locator('#panel-main').waitFor()
 assert.equal(await page.locator('#rail-links button').count(),2,'Only permitted side-owned screens belong in the sidebar')
 for(const name of ['Müşteriler','Katalog','Stok ve depolar','Rol, ayar ve denetim','İşlem geçmişi'])
  assert.equal(await page.locator('#rail-links').getByRole('button',{name,exact:true}).count(),0)
 const allowed=new Set(['dashboard','quotes','reviews','notifications','ai','content'])
 const destinations=await page.locator('#rail-links [data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView))
 const sideDestinations=[...destinations]
 destinations.push(...await page.locator('.panel-header nav [data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView)))
 for(const category of await page.locator('.panel-header nav>button').all()){
  await category.click()
  assert.deepEqual(await page.locator('#rail-links [data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView)),sideDestinations,'Top navigation cannot change the permitted side-owned links')
 }
 assert.deepEqual([...destinations].sort(),[...allowed].sort(),'Top and sidebar must expose only permitted screens, once each')
 assert.equal(await page.locator('.panel-header nav>button').count(),4,'Empty and forbidden top categories stay hidden')
 assert.equal(await page.locator('#rail-links .rail-group').count(),1,'Empty side groups stay hidden')
 assert.equal(new Set(navigationItems.map(item=>item.view)).size,16,'Central definition cannot duplicate a screen')
 await page.goto('http://127.0.0.1:5174/?view=settings')
 await page.locator('#rail-links [data-nav-view=dashboard][aria-current=page]').waitFor()
 assert.equal(await page.locator('[data-nav-view=settings]').count(),0,'A URL cannot expose a forbidden view')
 for(const width of [1440,1280,768,390]){
  await page.setViewportSize({width,height:1000})
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page must not overflow horizontally')
 }
 for(const item of navigationItems.filter(item=>allowed.has(item.view))){
  await navigateTo(page,item.label)
  await page.waitForURL(url=>url.searchParams.get('view')===item.view)
  assert.equal(await page.locator('#rail-links [aria-current=page]').count(),item.owner==='side'?1:0)
  assert.equal(await page.locator('.panel-header nav>button[aria-current=true]').count(),item.owner==='top'?1:0)
 }
 assert.deepEqual(errors,[])
 console.log('PASS: permitted screens have one owner; forbidden links/empty groups stay hidden; URL permissions and responsive navigation')
}finally{await browser.close()}
