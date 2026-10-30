import {readFileSync} from 'node:fs'
import {navigationItems} from '../src/admin-navigation.ts'
export const permissions=[...new Set(navigationItems.map(i=>i.permission)),'catalog.write','inventory.write','pricing.write','content.write','quotes.write','orders.write','orders.cancel','ai.write','settings.staff','notifications.write','print.write']
export const product={id:'UI-P1',name:'İzole tutarlılık ürünü',category:'Test',active:true,description:'',seoTitle:'',variants:[{id:'UI-V1',sku:'UI-SKU',color:'Siyah',stock:3,image:''}]}
export const store={products:[product],prices:{},categories:['Test'],announcements:[],content:{slides:[{id:1,name:'İzole banner',type:'Fotoğraf',src:'/assets/banners/slider-1.png',alt:'İzole banner',duration:6,active:true}],xinobiBanner:'',buttonColor:'#000000'}}
export const order={accountId:'UI-C1',customerName:'İzole müşteri',customerEmail:'test@example.invalid',order:{id:'UI-O1',number:'UI-ORDER',createdAt:'2026-10-30T00:00:00Z',status:'received',total:{amountMinor:10000,currency:'TRY'},address:{title:'Test',fullName:'İzole müşteri',phone:'',line:'Test',city:'Test',district:'Test'},lines:[],requests:[],history:[]}}
export const quote={id:'UI-Q1',code:'UI-QUOTE',company:'İzole firma',contactName:'İzole kişi',email:'quote@example.invalid',items:[{productId:product.id,productName:product.name,quantity:1}],status:'received',createdAt:'2026-10-30T00:00:00Z',messages:[],history:[]}
export const review={id:'UI-R1',productId:product.id,authorName:'İzole',rating:4,title:'İzole yorum',body:'İzole yorum metni',createdAt:'2026-10-30T00:00:00Z',status:'pending'}
export const policy={revision:1,systemPrompt:'İzole istem',greeting:'Merhaba',quickReplies:[],dailyAiLimit:0,maxMessagesPerConversation:10,model:'fixture',temperature:0,reason:'Test',createdAt:'2026-10-30T00:00:00Z'}
export function response(path,empty=false){
 if(path.endsWith('/state'))return {...store,products:empty?[]:store.products}
 if(path.endsWith('/admin/reports/summary'))return {fromInclusive:null,untilExclusive:'2026-10-31T00:00:00Z',generatedAt:'2026-10-30T00:00:00Z',timeZone:'UTC',orderCount:empty?0:1,registeredCustomerCount:empty?0:1,orderStatuses:empty?[]:[{status:'received',count:1}]}
 if(path.endsWith('/customers'))return {items:[],page:1,pageSize:20,total:0,totalPages:0}
 if(path.endsWith('/orders'))return empty?[]:[order]
 if(path.endsWith('/order-options'))return {carriers:['İzole kargo'],returnWindowDays:14}
 if(path.endsWith('/quotes'))return empty?[]:[quote]
 if(path.endsWith('/reviews'))return empty?[]:[review]
 if(path.endsWith('/notifications'))return {channels:[],items:[]}
 if(path.endsWith('/admin/designs'))return {items:[],page:1,pageSize:20,total:0,totalPages:0}
 if(path.endsWith('/admin/audit'))return {items:[],page:1,pageSize:20,total:0}
 if(path.endsWith('/policies'))return {modelConfigured:false,items:empty?[]:[policy]}
 if(path.endsWith('/usage'))return {days:[],aiCallsToday:0,dailyAiLimit:0,costRatesSet:false,note:'İzole veri'}
 return []
}
export async function mockPanel(page,options={}){
 // Reference images are bytes from this repo, independent of a running web storefront.
 for(const [asset,type]of [['banners/slider-1.png','image/png'],['products/tea-maker-101-red.webp','image/webp']]){
  const body=readFileSync(new URL('../public/assets/'+asset,import.meta.url))
  await page.route('**/assets/'+asset,route=>route.fulfill({contentType:type,body,headers:{'Access-Control-Allow-Origin':'*'}}))
 }

 await page.route('**/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname
  if(path.endsWith('/admin/session'))return route.fulfill({json:{account:{name:'İzole yönetici'},permissions:options.permissions??permissions}})
  if(options.handler&&await options.handler(route,path))return
  if(req.method()!=='GET')return route.fulfill({status:503,json:{title:'İzole beklenmeyen yazma engellendi'}})
  if(options.mode==='error'||options.mode==='denied')return route.fulfill({status:options.mode==='denied'?403:503,json:{title:'İzole servis kesintisi'}})
  if(options.delay)await new Promise(r=>setTimeout(r,options.delay))
  return route.fulfill({json:response(path,options.mode==='empty')})
 })
}
