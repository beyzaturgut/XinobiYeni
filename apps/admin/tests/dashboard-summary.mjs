// UTC range + real Chrome race/error tests with intercepted API only, not real SQL/session.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {reportPeriods,reportRange} from '../src/report-periods.ts'
import {navigationItems} from '../src/admin-navigation.ts'
const dates=[['Bugün','2026-01-01','2026-01-01','2026-01-02'],['Dün','2026-01-01','2025-12-31','2026-01-01'],['Bu Hafta','2026-01-01','2025-12-29','2026-01-05'],['Geçen Hafta','2026-01-01','2025-12-22','2025-12-29'],['Bu Ay','2026-12-31','2026-12-01','2027-01-01'],['Geçen Ay','2024-03-01','2024-02-01','2024-03-01'],['Bu Yıl','2026-12-31','2026-01-01','2027-01-01'],['Geçen Yıl','2026-01-01','2025-01-01','2026-01-01']]
for(const [period,today,from,until] of dates){const query=new URLSearchParams(reportRange(period,today).query);assert.equal(query.get('from'),from);assert.equal(query.get('until'),until)}
assert.equal(reportRange('Tüm Zamanlar','2026-01-01').query,'');assert.equal(reportPeriods.length,9)
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
const summary=count=>({fromInclusive:null,untilExclusive:'2026-10-20T00:00:00Z',generatedAt:'2026-10-19T00:00:00Z',timeZone:'UTC',orderCount:count,registeredCustomerCount:count,orderStatuses:count?[{status:'received',count}]:[]})
try{
 for(const width of [1440,1280,768,390]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];let requests=0,mode='race',release,initialQuery
  const held=new Promise(resolve=>{release=resolve})
  page.on('pageerror',error=>errors.push(error.message))
  await page.route('**/api/**',async route=>{
   const url=new URL(route.request().url()),path=url.pathname
   if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:[...new Set(navigationItems.map(item=>item.permission))]}})
   if(path.endsWith('/reports/summary')){
    requests++;initialQuery??=url.search;if(url.search===initialQuery&&mode==='race'){await held;return route.fulfill({json:summary(99)})}
    return mode==='error'?route.fulfill({status:503,json:{title:'SQL report unavailable',code:'report_sql_unavailable'}}):route.fulfill({json:summary(mode==='empty'?0:2)})
   }
   return route.fulfill({status:503,json:{title:'Synthetic source unavailable'}})
  })
  const firstRequest=page.waitForRequest(request=>request.url().includes('/reports/summary'))
  await page.goto(base+'?view=dashboard');await firstRequest
  await page.getByRole('button',{name:'Bugün',exact:true}).click()
  await page.locator('#widget-orders').locator('xpath=ancestor::section[1]').locator('.metric strong').filter({hasText:'2'}).waitFor()
  release();await page.waitForTimeout(150)
  assert.equal(await page.locator('#widget-orders').locator('xpath=ancestor::section[1]').locator('.metric strong').textContent(),'2')
  mode='error';await page.getByRole('button',{name:'Yenile',exact:true}).click()
  await page.getByRole('alert').filter({hasText:'SQL report unavailable'}).waitFor()
  assert.equal(await page.locator('.metric').count(),0)
  mode='empty';await page.getByRole('button',{name:'Tekrar dene',exact:true}).click()
  await page.getByText('Seçilen aralıkta kayıt yok.',{exact:true}).first().waitFor()
  assert.equal(await page.locator('.metric strong').first().textContent(),'0')
  assert.equal(await page.locator('.demo-bars').count(),0)
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
  assert.deepEqual(errors,[]);await page.close()
  console.log(`${width}px PASS: latest date wins over old response, loading settles, 503 hides metrics, retry/real-zero distinct, no overflow`)
 }
}finally{await browser.close()}
console.log('PASS: UTC year/month/week/leap boundaries and all-time semantics')
