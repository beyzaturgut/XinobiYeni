// Synthetic authentication only; no real credentials, mail, accounts or provider calls.
import assert from 'node:assert/strict'
import {createRequire} from 'node:module'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5175/'
try{
 const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage()
 page.setDefaultTimeout(10000)
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 let authenticated=false,denied=true,logins=0,verifies=0
 await page.route('**/api/**',async route=>{
  const r=route.request(),path=new URL(r.url()).pathname
  if(path.endsWith('/admin/session'))return route.fulfill(authenticated?{json:{account:{name:'Fixture staff'},permissions:['orders.read']}}:{status:401,json:{title:'Oturum yok'}})
  if(path.endsWith('/auth/admin/refresh'))return route.fulfill({status:401,json:{title:'Oturum yok'}})
  if(path.endsWith('/auth/admin/login')){
   logins++;assert.equal(r.headers()['x-xinobi-csrf'],'1')
   return route.fulfill(denied?{status:403,json:{title:'Yetkisiz hesap'}}:{json:{challengeId:'fixture-challenge',expiresAt:'2099-01-01T00:00:00Z'}})
  }
  if(path.endsWith('/auth/admin/mfa/verify')){
   verifies++;assert.equal(r.postDataJSON().challengeId,'fixture-challenge')
   if(r.postDataJSON().code!=='123456')return route.fulfill({status:400,json:{title:'Kod doğrulanamadı'}})
   authenticated=true;return route.fulfill({json:{account:{name:'Fixture staff'},permissions:['orders.read']}})
  }
  if(path.endsWith('/auth/admin/logout')){authenticated=false;return route.fulfill({status:204})}
  if(path.endsWith('/local-commerce/orders'))return route.fulfill({json:[]})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:['Fixture'],returnWindowDays:14}})
  // Never proxy unknown requests to a real service.
  return route.fulfill({status:503,json:{title:'Fixture unavailable'}})
 })
 await page.goto(base+'?view=orders')
 await page.getByRole('heading',{name:'Yönetici girişi',exact:true}).waitFor()
 assert.equal(await page.getByRole('heading',{name:'Sipariş yönetimi',exact:true}).count(),0)
 await page.getByLabel('E-posta adresi').fill('staff@example.invalid');await page.getByLabel('Parola',{exact:true}).fill('fixture-password')
 await page.getByRole('button',{name:'Giriş yap',exact:true}).click();await page.getByRole('alert').filter({hasText:'Bu işlem için yetkiniz yok.'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Sipariş yönetimi',exact:true}).count(),0)
 denied=false;await page.getByRole('button',{name:'Giriş yap',exact:true}).click();await page.getByRole('heading',{name:'E-posta doğrulaması',exact:true}).waitFor()
 assert.equal(await page.getByRole('heading',{name:'Sipariş yönetimi',exact:true}).count(),0)
 await page.getByLabel('Doğrulama kodu').fill('000000');await page.getByRole('button',{name:'Doğrula',exact:true}).click();await page.getByRole('alert').filter({hasText:'Kod doğrulanamadı'}).waitFor()
 await page.getByLabel('Doğrulama kodu').fill('123456');await page.getByRole('button',{name:'Doğrula',exact:true}).click();await page.getByRole('heading',{name:'Sipariş yönetimi',exact:true}).waitFor()
 assert.equal(await page.locator('[data-nav-view=catalog]').count(),0)
 await page.getByRole('button',{name:'Çıkış yap',exact:true}).click();await page.getByRole('heading',{name:'Yönetici girişi',exact:true}).waitFor()
 assert.equal(await page.getByRole('heading',{name:'Sipariş yönetimi',exact:true}).count(),0)
 assert.equal(logins,2);assert.equal(verifies,2);assert.deepEqual(errors,[])
 await context.close();console.log('PASS: anonymous/nonstaff gate, password alone cannot enter, invalid MFA remains gated, verified role access, logout; synthetic API only')
}finally{await browser.close()}
