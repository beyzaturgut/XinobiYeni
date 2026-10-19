// Presentation/HTTP fixtures only. No SQL, existing profile, credentials or real audit writes.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
import {auditAction,auditDate,auditResult} from '../src/audit-presentation.ts'
import {navigationItems} from '../src/admin-navigation.ts'
for(const [code,label] of [[200,'Başarılı'],[201,'Başarılı'],[204,'Başarılı'],[202,'İşleme alındı'],[400,'İşlem gerçekleştirilemedi'],[401,'Oturum gerekli'],[403,'Yetki reddedildi'],[409,'İşlem çakışması'],[503,'Servis kullanılamıyor'],[500,'Sunucu hatası'],[302,'Yönlendirme'],[0,'Sonuç bilgisi yok']])assert.equal(auditResult(code),label)
assert.equal(auditAction('PUT local-commerce/prices/{id}'),'Ürün fiyatı güncelleme')
assert.equal(auditAction('POST /api/v1/admin/roles'),'Yönetici yetkisi değiştirme')
assert.equal(auditAction('POST admin/invitations'),'Yönetici daveti oluşturma')
assert.equal(auditAction('POST local-commerce/orders/{id}/shipment'),'Kargo bilgilerini güncelleme')
assert.equal(auditAction('POST local-commerce/orders/{id}/requests/{requestId}'),'İptal / iade talebini değerlendirme')
assert.equal(auditAction('POST unknown/provider'),'Diğer yönetim işlemi')
assert.ok(auditDate('2026-10-19T00:00:00Z').includes('03:00:00'))
assert.equal(auditDate('invalid'),'Tarih bilgisi geçersiz')
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true}),base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
try{
 for(const width of [1440,1280,768,390]){
  const page=await browser.newPage({viewport:{width,height:950}}),errors=[]
  page.setDefaultTimeout(10000)
  let mode='ok',permitted=true,auditRequests=0,release
  const entries=[200,201,400,401,403,409,202,503,0].map((status,index)=>({id:'audit-'+index,occurredAt:'2026-10-19T00:00:00Z',actorId:index?'actor-'+index:null,action:index===1?'POST admin/roles':index===2?'POST admin/invitations':'PUT local-commerce/prices/{id}',entityType:index?'admin':'pricing',entityId:'record-full-identifier-'+index,status,traceId:'trace-full-identifier-'+index,unexpectedBody:'DO_NOT_RENDER'}))
  page.on('pageerror',e=>errors.push(e.message))
  await page.route('**/api/**',async route=>{
   const url=new URL(route.request().url())
   if(url.pathname.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:permitted?[...new Set(navigationItems.map(x=>x.permission))]:['reports.read']}})
   if(url.pathname.endsWith('/audit')){
    auditRequests++;assert.equal(url.searchParams.get('limit'),'200');assert.equal(url.searchParams.has('status'),false)
    if(mode==='hold')await new Promise(resolve=>{release=resolve})
    if(mode==='error')return route.fulfill({status:503,json:{title:'Synthetic audit unavailable'}})
    if(mode==='forbidden')return route.fulfill({status:403,json:{title:'Forbidden'}})
    if(mode==='expired')return route.fulfill({status:401,json:{title:'Unauthorized'}})
    return route.fulfill({json:mode==='empty'?[]:entries.filter(x=>!url.searchParams.get('entityType')||x.entityType===url.searchParams.get('entityType'))})
   }
   if(url.pathname.endsWith('/auth/admin/refresh'))return route.fulfill({status:401,json:{title:'Unauthorized'}})
   return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
  })
  await page.goto(base+'?view=audit');await page.locator('.audit-table tbody tr').first().waitFor()
  assert.equal(await page.locator('.audit-table thead th').count(),5)
  assert.equal(await page.getByText('DO_NOT_RENDER',{exact:true}).count(),0)
  assert.equal(await page.locator('details[open]').count(),0)
  assert.equal(await page.locator('details code').first().isVisible(),false)
  const summary=page.locator('summary').first();await summary.focus();await page.keyboard.press('Enter')
  await page.locator('details[open]').waitFor()
  await page.getByText('trace-full-identifier-0',{exact:true}).waitFor()
  await page.getByText('record-full-identifier-0',{exact:true}).waitFor()
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Expanded audit table stays inside its scroll region')
  await page.keyboard.press('Enter');assert.equal(await page.locator('details[open]').count(),0)
  for(const label of ['Başarılı','İşlem gerçekleştirilemedi','Oturum gerekli','Yetki reddedildi','İşlem çakışması','İşleme alındı','Servis kullanılamıyor','Sonuç bilgisi yok'])assert.ok(await page.locator('.order-state').filter({hasText:label}).count())
  await page.getByLabel('Alan',{exact:true}).selectOption('pricing');await page.waitForFunction(()=>document.querySelectorAll('.audit-table tbody tr').length===1)
  mode='hold';await page.getByRole('button',{name:'Yenile',exact:true}).click();await page.getByText('İşlem geçmişi yükleniyor…',{exact:true}).waitFor()
  assert.equal(await page.locator('.audit-table tbody tr').count(),0,'Old snapshot must disappear while loading')
  await page.waitForFunction(()=>true);while(!release)await new Promise(resolve=>setTimeout(resolve,10));mode='error';release()
  await page.getByRole('alert').filter({hasText:'Synthetic audit unavailable'}).waitFor();assert.equal(await page.locator('.audit-table').count(),0)
  mode='empty';await page.getByRole('button',{name:'Tekrar dene'}).click();await page.getByText('Kayıt bulunamadı',{exact:true}).waitFor()
  mode='forbidden';await page.getByRole('button',{name:'Yenile',exact:true}).click();await page.getByRole('alert').filter({hasText:'Bu işlem için yetkiniz yok.'}).waitFor()
  mode='expired';await page.getByRole('button',{name:'Tekrar dene'}).click();await page.getByRole('heading',{name:'Yönetici girişi'}).waitFor()
  permitted=false;const count=auditRequests;await page.goto(base+'?view=audit');await page.locator('#panel-main').waitFor();assert.equal(auditRequests,count,'No audit request without audit.read')
  assert.equal(await page.locator('[data-nav-view=audit]').count(),0)
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
  assert.deepEqual(errors,[]);await page.close()
  console.log(width+'px PASS: Turkish labels/statuses/timezone, complete collapsed details, keyboard, filter, loading/stale/error/retry/empty/401/403 and audit permission')
 }
}finally{await browser.close()}
