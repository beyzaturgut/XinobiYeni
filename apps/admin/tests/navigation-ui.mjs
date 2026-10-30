// Visual/navigation regression only: all API traffic is intercepted; no SQL or external service is used.
// Uses a synthetic permitted session; ADMIN_UI_URL can target the existing local admin.
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import {navigateTo} from './navigation-helper.mjs'
import {navigationItems,topNavigation,sideNavigation} from '../src/admin-navigation.ts'
const require = createRequire(new URL('../../web/package.json', import.meta.url))
const { chromium } = require('@playwright/test')
const fixture = { products: [{ id: 'UI-P1', name: 'UI test ürünü', category: 'Test', active: true, description: 'İzole görsel test', seoTitle: 'UI test', variants: [{ id: 'UI-V1', sku: 'UI-TEST', color: 'Siyah', stock: 3, image: '' }] }], prices: { 'UI-V1': 10000 }, categories: ['Test'], announcements: [], content: { slides: [], xinobiBanner: '', buttonColor: '#000000' } }
const browser = await chromium.launch({ channel: 'chrome', headless: true })
try {
  const page = await browser.newPage()
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/**', route => {
    const url = new URL(route.request().url())
    const data = url.pathname.endsWith('/admin/session') ? {account:{id:'navigation-test',name:'Yönetici'},permissions:[...new Set(navigationItems.map(item=>item.permission)),'catalog.write']}
      : url.pathname.endsWith('/state') ? fixture
      : url.pathname.endsWith('/orders') ? []
      : url.pathname.endsWith('/order-options') ? {carriers:['Synthetic'],returnWindowDays:14}
      : url.pathname.endsWith('/dashboard') ? {orderCount:0,customerCount:0,statuses:[],days:[],recordedAmounts:[]}
      : url.pathname.endsWith('/customers') ? { items: [], page: 1, pageSize: 20, total: 0, totalPages: 0 }
      : url.pathname.endsWith('/inventory') ? { items: [], page: 1, pageSize: 20, total: 0, totalAvailableToSell: 0, lowStockCount: 0, outOfStockCount: 0 }
      : url.pathname.endsWith('/admin/audit') ? {items:[],page:1,pageSize:20,total:0}
      : url.pathname.endsWith('/audit') ? []
      : null
    return data ? route.fulfill({ json: data }) : route.fulfill({ status: 503, json: { message: 'İzole UI testi: servis kullanılamıyor.' } })
  })
  const base=process.env.ADMIN_UI_URL || 'http://127.0.0.1:5174/'
  const headings={customers:'Müşteri yönetimi',dashboard:'Operasyon özeti',orders:'Sipariş yönetimi',catalog:'Katalog ve varyantlar',inventory:'Stok ve depo yönetimi',surfaces:'Ürün yüzeyi inceleme',reviews:'Ürün değerlendirmeleri',pricing:'Fiyat ve kampanya yönetimi',content:'İçerik yönetimi',print:'Tasarım ve baskı operasyonları',integrations:'Entegrasyon izleme',settings:'Rol, ayar ve denetim',ai:'AI yönetimi',quotes:'Kurumsal teklif yönetimi',notifications:'Bildirim kayıtları',audit:'Denetim kaydı'}
  const sideOrder=sideNavigation.flatMap(group=>group.items.map(item=>item.view))
  assert.deepEqual([...sideOrder].sort(),['audit','dashboard','notifications'])
  const topViews=topNavigation.flatMap(group=>group.links.map(item=>item.view))
  assert.equal(topViews.length,13)
  assert.equal(new Set([...topViews,...sideOrder]).size,16)
  assert.ok(topViews.every(view=>!sideOrder.includes(view)),'Ownership partitions must never overlap')
  assert.deepEqual([...topViews,...sideOrder].sort(),Object.keys(headings).sort(),'No existing screen may be lost')
  for(const width of [1440,1280,768,390]){
    await page.setViewportSize({width,height:1000})
    await page.goto(base)
    await page.locator('#panel-main').waitFor()
    const top=page.getByRole('navigation',{name:'Ana modüller'})
    const sidebar=page.getByRole('complementary',{name:'Sol navigasyon',exact:true})
    assert.equal(await top.locator(':scope>button').count(),8,'No empty Reports category when its only screen belongs to the side')
    assert.equal(await top.locator('svg').count(),0)
    assert.equal(await sidebar.locator('svg,.rail-toggle').count(),0)
    assert.equal(await sidebar.locator('[aria-current=page]').count(),1)
    assert.equal(await top.locator('[aria-current=true]').count(),0,'Side-owned dashboard cannot select an unrelated top category')
    assert.deepEqual(await sidebar.locator('[data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView)),sideOrder)
    await page.evaluate(()=>{
      window.sideNodes=Array.from(document.querySelectorAll('#rail-links [data-nav-view]'))
      window.topNodes=Array.from(document.querySelectorAll('.panel-header nav>button'))
    })
    const stable=async()=>{
      assert.deepEqual(await sidebar.locator('[data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView)),sideOrder)
      assert.ok(await page.evaluate(()=>window.sideNodes.every((node,index)=>node===document.querySelectorAll('#rail-links [data-nav-view]')[index])),'Top navigation cannot rebuild side links')
      assert.ok(await page.evaluate(()=>window.topNodes.every((node,index)=>node===document.querySelectorAll('.panel-header nav>button')[index])),'Side navigation cannot rebuild top categories')
    }
    const homes=[]
    for(const item of navigationItems){
      await navigateTo(page,item.label)
      await page.waitForURL(url=>url.searchParams.get('view')===item.view)
      assert.equal(await page.locator('#panel-main>.page-heading h1').innerText(),headings[item.view])
      const copy=await page.locator('#panel-main').innerText()
      for(const removed of ['Ürün, görsel, fiyat, stok ve sipariş kayıtları local web ve mobil ile paylaşılır.','Ödeme ve dış entegrasyon modülleri örnek veridir.','Ürün yüzeyi incele (geliştirme)','Demo siparişlerde ödeme alınmaz']) assert.ok(!copy.includes(removed),item.view+': removed shared development copy')
      assert.equal(await page.locator('.surface-access').count(),0)
      if(item.view==='orders') await page.getByText('Bu ekran ödeme tahsilatı gerçekleştirmez.',{exact:false}).waitFor()
      assert.equal(await sidebar.locator('[aria-current=page]').count(),item.owner==='side'?1:0)
      assert.equal(await top.locator(':scope>button[aria-current=true]').count(),item.owner==='top'?1:0)
      if(item.owner==='top')assert.equal(await top.getByRole('button',{name:item.category,exact:true}).getAttribute('aria-current'),'true')
      await stable()
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),width+'px overflow: '+item.view)
      homes.push(item.view)
    }
    assert.equal(new Set(homes).size,16,'16/16 existing screens reached')
    // Enumerate visible primary links, including dropdowns, rather than trusting only the definition.
    const visibleHomes=await sidebar.locator('[data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView))
    visibleHomes.push(...await top.locator('[data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView)))
    for(const group of topNavigation.filter(group=>group.links.length>1)){
      const button=top.getByRole('button',{name:group.name,exact:true})
      await button.focus();await button.press('ArrowDown')
      const popup=page.locator('#admin-header-popup')
      await popup.waitFor()
      const ids=await popup.locator('[data-nav-view]').evaluateAll(nodes=>nodes.map(node=>node.dataset.navView))
      assert.deepEqual(ids,group.links.map(link=>link.view))
      visibleHomes.push(...ids)
      assert.equal(ids.filter(id=>sideOrder.includes(id)).length,0)
      const bounds=await popup.boundingBox()
      assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y>=0&&bounds.y+bounds.height<=1000)
      await page.keyboard.press('Escape')
      assert.ok(await button.evaluate(node=>node===document.activeElement))
    }
    assert.equal(visibleHomes.length,16)
    assert.equal(new Set(visibleHomes).size,16,'Zero duplicate primary page links across the two menus')
    await navigateTo(page,'Stok ve depolar')
    await page.reload()
    await page.waitForURL(url=>url.searchParams.get('view')==='inventory')
    await page.locator('#panel-main').waitFor()
    const products=top.getByRole('button',{name:'Ürünler',exact:true})
    assert.equal(await products.getAttribute('aria-current'),'true')
    assert.equal(await sidebar.locator('[aria-current=page]').count(),0)
    // Real browser history must cross owners in both directions.
    await navigateTo(page,'Bildirim kayıtları')
    await page.goBack()
    await page.waitForURL(url=>url.searchParams.get('view')==='inventory')
    assert.equal(await products.getAttribute('aria-current'),'true')
    await page.goForward()
    await page.waitForURL(url=>url.searchParams.get('view')==='notifications')
    await sidebar.locator('[data-nav-view=notifications][aria-current=page]').waitFor()
    assert.equal(await top.locator('[aria-current=true]').count(),0)
    await products.focus();await page.keyboard.press('ArrowRight')
    assert.ok(await top.getByRole('button',{name:topNavigation[(topNavigation.findIndex(group=>group.name==='Ürünler')+1)%topNavigation.length].name,exact:true}).evaluate(node=>node===document.activeElement))
    await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowDown')
    await page.waitForFunction(()=>document.activeElement?.getAttribute('data-nav-view')==='catalog')
    assert.equal(await page.locator('#admin-header-popup [data-nav-view=catalog]').evaluate(node=>getComputedStyle(node).outlineStyle),'solid')
    await page.keyboard.press('End')
    assert.ok(await page.locator('#admin-header-popup [data-nav-view=reviews]').evaluate(node=>node===document.activeElement))
    await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter')
    await page.waitForURL(url=>url.searchParams.get('view')==='inventory')
    assert.equal(await page.locator('#admin-header-popup').count(),0)
    assert.ok(await products.evaluate(node=>node===document.activeElement))
    await products.press('ArrowUp')
    await page.waitForFunction(()=>document.activeElement?.getAttribute('data-nav-view')==='reviews')
    await page.keyboard.press('Escape')
    assert.ok(await products.evaluate(node=>node===document.activeElement))
    await products.hover()
    await page.locator('#admin-header-popup').waitFor()
    await products.click();await products.click()
    assert.equal(await page.locator('#admin-header-popup').count(),0,'Hover-open menu can be pinned then closed')
    const notifications=page.getByRole('button',{name:'Bildirim menüsü',exact:true})
    const profile=page.getByRole('button',{name:'Profil menüsü',exact:true})
    await notifications.click();await profile.click()
    assert.equal(await page.locator('#admin-header-popup').count(),1)
    await page.keyboard.press('Escape')
    assert.ok(await profile.evaluate(node=>node===document.activeElement))
    if(width>700){
      await navigateTo(page,'Operasyon özeti')
      await page.evaluate(()=>window.scrollTo(0,300))
      await page.waitForFunction(()=>Math.abs(document.querySelector('.panel-header').getBoundingClientRect().top)<1)
      assert.equal(await top.locator('[aria-current=true]').count(),0)
      assert.equal(await sidebar.evaluate(node=>getComputedStyle(node).position),'sticky')
      assert.ok((await sidebar.boundingBox()).y>=(await page.locator('.panel-header').boundingBox()).height)
      await page.evaluate(()=>window.scrollTo(0,0))
      await page.setViewportSize({width,height:400})
      await sidebar.hover()
      // At 400px height the header now flows with the page, leaving room for all operation links.
      assert.equal(await page.locator('.panel-header').evaluate(node=>getComputedStyle(node).position),'static')
      const rail=await sidebar.boundingBox()
      assert.ok(rail.height<=400,'Short viewport navigation remains bounded')
      for(const button of await sidebar.locator('[data-nav-view]').all()){
        await button.focus();const rect=await button.boundingBox()
        assert.ok(rect.y>=0&&rect.y+rect.height<=400,'Every short-viewport operation link is reachable')
      }
      await page.setViewportSize({width,height:1000})
      await sidebar.evaluate(node=>node.scrollTop=0)
    }
    await navigateTo(page,'Stok ve depolar')
    await page.evaluate(()=>document.activeElement?.blur())
    await page.screenshot({path:join(tmpdir(),'xinobi-independent-navigation-'+width+'.png')})
    await navigateTo(page,'Katalog')
    await page.getByRole('button',{name:/Yeni ürün/}).first().click()
    const dialog=page.locator('dialog[open]')
    await dialog.waitFor()
    assert.ok((await dialog.boundingBox()).width<=width)
    await page.keyboard.press('Escape')
    assert.equal(await dialog.count(),0)
    console.log(width+'px PASS: 16/16 unique owners, independent menus, active states, history/reload, keyboard/Escape, hover, scrolling and overflow')
  }
  await page.goto(base+'?view=unknown')
  await page.locator('#rail-links [data-nav-view=dashboard][aria-current=page]').waitFor()
  assert.deepEqual(errors,[],'Browser runtime errors')
}finally{await browser.close()}
