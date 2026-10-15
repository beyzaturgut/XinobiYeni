import assert from 'node:assert/strict'
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs'
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'})
try{
 const context=await browser.newContext(),page=await context.newPage()
 let ids=[],writes=0,fail=false,signedIn=true
 const state={categories:['Kahve makineleri'],products:[{id:'DEMO-P101',name:'Test Coffee',category:'Kahve makineleri',active:true,description:'Test',seoTitle:'Test',personalizable:true,variants:[{id:'DEMO-V101-B',sku:'TEST-1',color:'Black',hex:'#000000',stock:3,image:''}]}],prices:{'DEMO-V101-B':10000},content:{slides:[],xinobiBanner:'',buttonColor:'#000000'}}
 await context.route('**/api/v1/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname
  const headers={'Access-Control-Allow-Origin':'http://127.0.0.1:5320','Access-Control-Allow-Credentials':'true','Access-Control-Allow-Headers':'Content-Type,X-Xinobi-Csrf','Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS'}
  const reply=(status,data)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(data)})
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers})
  if(path.endsWith('/local-commerce/state'))return reply(200,state)
  if(path.endsWith('/me'))return reply(signedIn?200:401,{id:'test-user',name:'Test User',email:'test@example.invalid'})
  if(path.endsWith('/auth/web/refresh'))return reply(401,{})
  if(path.endsWith('/me/favorites')&&req.method()==='GET')return reply(200,ids)
  if(path.endsWith('/me/favorites')&&req.method()==='POST'){
   assert.equal(req.headers()['x-xinobi-csrf'],'1');writes++
   if(fail)return reply(503,{title:'Temporary favorite failure'})
   const id=req.postDataJSON().productId;if(!ids.includes(id))ids.push(id)
   return route.fulfill({status:201,headers})
  }
  if(path.includes('/me/favorites/')&&req.method()==='DELETE'){
   assert.equal(req.headers()['x-xinobi-csrf'],'1');writes++
   if(fail)return reply(503,{title:'Temporary favorite failure'})
   ids=ids.filter(id=>id!==decodeURIComponent(path.split('/').at(-1)))
   return route.fulfill({status:204,headers})
  }
  if(path.endsWith('/me/notifications'))return reply(200,{items:[],unread:0})
  return reply(200,[])
 })
 await page.goto('http://127.0.0.1:5320/urunler/')
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilere ekle/}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilerden çıkar/}).waitFor()
 assert.deepEqual(ids,['DEMO-P101'])
 await page.goto('http://127.0.0.1:5320/xinobi-u/')
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilerden çıkar/}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilere ekle/}).waitFor()
 assert.deepEqual(ids,[])
 await page.getByRole('button',{name:/Test Coffee.*favorilere ekle/}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilerden çıkar/}).waitFor()
 assert.deepEqual(ids,['DEMO-P101'])
 await page.goto('http://127.0.0.1:5320/xinobi-u/')
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilerden çıkar/}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilere ekle/}).waitFor()
 assert.deepEqual(ids,[])
 await page.getByRole('button',{name:/Test Coffee.*favorilere ekle/}).click()
 await page.getByRole('button',{name:/Test Coffee.*favorilerden çıkar/}).waitFor()
 assert.deepEqual(ids,['DEMO-P101'])
 await page.goto('http://127.0.0.1:5320/favoriler/')
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click()
 await page.getByRole('heading',{name:'Test Coffee',exact:true}).waitFor()
 await page.reload()
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click()
 await page.getByRole('heading',{name:'Test Coffee',exact:true}).waitFor()
 fail=true
 await page.getByRole('button',{name:/Test Coffee.*favorilerden çıkar/}).click()
 await page.getByRole('alert').filter({hasText:'Temporary favorite failure'}).waitFor()
 assert.deepEqual(ids,['DEMO-P101'])
 fail=false
 await page.getByRole('button',{name:/Test Coffee.*favorilerden çıkar/}).click()
 await page.getByRole('heading',{name:'Favori listeniz henüz boş.'}).waitFor()
 assert.deepEqual(ids,[])
 signedIn=false;const before=writes
 await page.reload()
 await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click()
 await page.getByRole('heading',{name:'Favorilerinizi görmek için giriş yapın.'}).waitFor()
 assert.equal(writes,before)
 console.log('PASS isolated favorites UI (mock API): catalog add, reload/list persistence, error retention, remove, anonymous no writes')
}finally{await browser.close()}
