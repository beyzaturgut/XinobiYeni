// Chrome UI with intercepted API fixtures, never a real session/SQL/write.
import {createRequire} from 'node:module'
import assert from 'node:assert/strict'
import {navigationItems} from '../src/admin-navigation.ts'
const {chromium}=createRequire(new URL('../../web/package.json',import.meta.url))('@playwright/test')
const browser=await chromium.launch({channel:'chrome',headless:true})
const base=process.env.ADMIN_UI_URL||'http://127.0.0.1:5174/'
const quote={id:'synthetic-quote',code:'Q-UI',company:'Synthetic',contactName:'Test',email:'test@example.invalid',items:[],status:'received',createdAt:'2026-10-19T00:00:00Z',messages:[],history:[]}
const review={id:'synthetic-review',productId:'P-UI',authorName:'T.',rating:5,body:'Synthetic review',createdAt:'2026-10-19T00:00:00Z',status:'pending'}
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message))
 let failure=false,writeCount=0,readFailure=false,writable=true,expired=false
 await page.route('**/api/**',async route=>{
  const url=new URL(route.request().url()),path=url.pathname
  if(expired)return route.fulfill({status:401,json:{title:'Synthetic expired'}})
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'Synthetic'},permissions:[...new Set(navigationItems.map(i=>i.permission)),...(writable?['quotes.write','content.write']:[])]}})
  if(route.request().method()!=='GET'){writeCount++;return route.fulfill(failure?{status:409,json:{title:'Synthetic conflict'}}:{json:{}})}
  if(readFailure)return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
  if(path.endsWith('/quotes'))return route.fulfill({json:[quote]})
  if(path.endsWith('/reviews'))return route.fulfill({json:[review]})
  if(path.endsWith('/order-options'))return route.fulfill({json:{carriers:[]}})
  if(path.endsWith('/orders'))return route.fulfill({json:[{customerName:'Synthetic',customerEmail:'test@example.invalid',order:{id:'UI-order',number:'UI-ORDER',status:'received',createdAt:'2026-10-19T00:00:00Z',total:{amountMinor:100,currency:'TRY'},address:{fullName:'Synthetic',phone:'',line:'Synthetic',district:'Test',city:'Test'},lines:[],requests:[{id:'UI-request',type:'cancel',status:'requested',reason:'Synthetic',lines:[]}],history:[]}}]})
  if(path.endsWith('/state'))return route.fulfill({status:503,json:{code:'catalog_unavailable',title:'Katalog kullanılamıyor'}})
  return route.fulfill({status:503,json:{title:'Synthetic unavailable'}})
 })
 await page.goto(base+'?view=quotes');await page.getByRole('button',{name:'Aç',exact:true}).click()
 const field=page.getByRole('textbox',{name:'Firmaya mesaj'});await field.fill('Do not lose this draft')
 failure=true;await page.getByRole('button',{name:'Gönder',exact:true}).click();await page.getByText('Synthetic conflict',{exact:true}).waitFor()
 assert.equal(await field.inputValue(),'Do not lose this draft');assert.equal(writeCount,1)
 failure=false;await page.getByRole('button',{name:'Gönder',exact:true}).click();await page.getByText('Mesaj kaydedildi; bildirim kuyruğa alındı.',{exact:true}).waitFor()
 await field.waitFor();assert.equal(await field.inputValue(),'');assert.equal(writeCount,2)
 readFailure=true;await page.getByRole('button',{name:'Yenile',exact:true}).click();await page.getByRole('alert').waitFor()
 assert.equal(await page.getByRole('textbox',{name:'Firmaya mesaj'}).count(),0)
 readFailure=false;await page.getByRole('button',{name:'Tekrar dene',exact:true}).click();await page.getByRole('button',{name:'Aç',exact:true}).waitFor()
 await page.goto(base+'?view=reviews');await page.getByRole('button',{name:'Onayla ve yayınla'}).waitFor()
 readFailure=true;await page.getByRole('button',{name:'Yenile',exact:true}).click();await page.getByRole('alert').waitFor()
 assert.equal(await page.getByRole('button',{name:'Onayla ve yayınla'}).count(),0)
 readFailure=false;writable=false
 await page.goto(base+'?view=reviews');await page.getByRole('button',{name:'Onayla ve yayınla'}).waitFor()
 assert.equal(await page.getByRole('button',{name:'Onayla ve yayınla'}).isDisabled(),true)
 await page.goto(base+'?view=orders');await page.getByRole('button',{name:'UI-ORDER detayını aç'}).click()
 assert.equal(await page.getByRole('button',{name:'Hazırlanmaya başla'}).isDisabled(),true)
 assert.equal(await page.getByRole('button',{name:'İptali onayla'}).isDisabled(),true)
 await page.getByRole('button',{name:'Sipariş detayını kapat'}).click()
 await page.goto(base+'?view=reviews');await page.getByRole('button',{name:'Onayla ve yayınla'}).waitFor()
 expired=true;await page.getByRole('button',{name:'Yenile',exact:true}).click()
 await page.getByRole('button',{name:'Giriş yap',exact:true}).waitFor()
 assert.deepEqual(errors,[])
 console.log('PASS: draft preservation, server-confirmed success, queue-not-delivery wording, stale data blocked, retry, read-only moderation and expired-session login')
}finally{await browser.close()}
