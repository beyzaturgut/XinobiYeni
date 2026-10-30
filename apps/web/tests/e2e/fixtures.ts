import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {expect, type Page} from '@playwright/test';
import type {CommerceState} from '../../../../packages/commerce/client';
import type {CustomerOrder, CustomerAddress, DemoUser} from '../../src/lib/demo-commerce';
import type {Quote} from '../../src/lib/quotes';

export async function closeConsent(page:Page) {
  await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click();
}

/** Browser-only contract fixtures. No request can reach real accounts, mail or inference. */
export async function mockStore(page:Page,{signedIn=false,cart=false}:{signedIn?:boolean;cart?:boolean}={}) {
  const state:CommerceState=JSON.parse(readFileSync('../../tests/fixtures/demo-commerce.json','utf8'));
  for(const product of state.products){product.active=true;for(const variant of product.variants){variant.stock=8;state.prices[variant.id]=240000;}}
  const blue=state.products[0].variants[0];
  Object.assign(blue,{surfaceMask:'/assets/personalization/tea-maker-101-blue-designable.png',surfaceImage:blue.image});
  let user:DemoUser={id:'test-user',name:'Test Kullanıcı',email:'test@example.com'};
  const address:CustomerAddress={id:'test-address',title:'Ev',fullName:user.name,phone:'05321234567',city:'İstanbul',district:'Kadıköy',line:'Test Sokak 1',isDefault:true};
  let addresses=[address];
  const now=new Date().toISOString();
  const order:CustomerOrder={id:'test-order',number:'TEST-ORDER-1',createdAt:now,status:'delivered',address,lines:[{productId:'DEMO-P101',variantId:blue.id,name:'Çay Makinesi 101',color:blue.color,quantity:2,unitPrice:{amountMinor:240000,currency:'TRY'},lineTotal:{amountMinor:480000,currency:'TRY'}}],total:{amountMinor:480000,currency:'TRY'},shipment:{carrier:'Test Kargo',trackingNumber:'TEST123',shippedAt:now,deliveredAt:now},history:['received','preparing','shipped','delivered'].map(status=>({status,at:now,actor:'store'})),requests:[]};
  let orders=[order];
  const favorites=new Set<string>();
  let quote:Quote={id:'test-quote',code:'Q-TEST-1',company:'Test Firma',contactName:user.name,email:user.email,items:[{productId:'DEMO-P101',productName:'Çay Makinesi 101',quantity:20}],personalization:false,status:'offered',createdAt:now,offer:{total:{amountMinor:4800000,currency:'TRY'},validUntil:new Date(Date.now()+86400000).toISOString(),at:now},messages:[],history:[]};
  const requests:{path:string;method:string;body:Record<string,unknown>}[]=[];
  if(cart)await page.addInitScript(line=>{if(!localStorage.getItem('xinobi-cart-v1'))localStorage.setItem('xinobi-cart-v1',JSON.stringify([line]));},{productId:'DEMO-P101',variantId:blue.id,quantity:1});
  await page.route('**/api/v1/**',async route=>{
    const req=route.request(),path=new URL(req.url()).pathname.replace('/api/v1',''),method=req.method();
    const body=req.postData()?req.postDataJSON():{};
    if(method!=='GET')requests.push({path,method,body});
    const json=(data:unknown,status=200)=>route.fulfill({json:data,status});
    // Production builds read the public storefront (active products only); the fixture marks every product active.
    if(path==='/local-commerce/state'||path==='/catalog/storefront')return json(state);
    if(path==='/me'&&method==='GET')return signedIn?json(user):json({title:'Oturum yok'},401);
    if(path==='/auth/web/refresh')return signedIn?json(user):json({title:'Oturum yok'},401);
    if(path==='/auth/email-verification')return json({verificationId:'test-verification',email:body.email,expiresAt:new Date(Date.now()+600000).toISOString(),previewCode:'123456'});
    if(path==='/auth/web/register'||path==='/auth/web/login'){signedIn=true;user={...user,...(path.endsWith('register')?{name:String(body.name)}:{}),email:String(body.email)};return json(user);}
    if(path==='/auth/password-reset')return json({verificationId:'test-reset',email:String(body.email),expiresAt:new Date(Date.now()+600000).toISOString(),previewCode:'654321'});
    if(path==='/auth/password-reset/confirm')return body.verificationCode==='654321'?route.fulfill({status:204}):json({title:'Doğrulama kodu hatalı.',code:'verification_failed'},400);
    if(path==='/me'&&method==='PATCH'){user={...user,name:String(body.name)};return json(user);}
    if(path==='/me/addresses'){
      if(method==='POST'){addresses.push({...body,id:'new-address'} as CustomerAddress);return json(addresses.at(-1));}
      return json(addresses);
    }
    if(path.startsWith('/me/addresses/')&&method==='PUT'){addresses=addresses.map(a=>a.id===path.split('/').at(-1)?{...a,...body}:a);return json(addresses.find(a=>a.id===path.split('/').at(-1)));}
    if(path==='/me/favorites'){
      if(method==='POST'){favorites.add(String(body.productId));return route.fulfill({status:201});}
      return json([...favorites]);
    }
    if(path.startsWith('/me/favorites/')&&method==='DELETE'){favorites.delete(decodeURIComponent(path.split('/').at(-1)!));return route.fulfill({status:204});}
    if(path==='/me/designs'||path==='/me/design-configurations')return json([]);
    if(path==='/me/inbox')return json({items:[],unread:0});
    if(path==='/me/order-options')return json({cancelReasons:['Yanlış ürün seçtim'],returnReasons:['Ürün hasarlı'],carriers:['Test Kargo'],returnWindowDays:14});
    if(path==='/me/orders'){
      if(method==='POST'){const placed={...order,id:'placed-order',number:'TEST-ORDER-2',status:'received',shipment:null,history:[],lines:order.lines.map(l=>({...l,quantity:1}))};orders=[placed,...orders];return json(placed);}
      return json(orders);
    }
    if(path.endsWith('/returns')){order.requests=[{id:'test-return',type:'return',status:'requested',reason:String(body.reason),lines:body.lines as {variantId:string;quantity:number}[],createdAt:now}];return json(order);}
    if(path==='/quotes/options')return json({purposes:['Kurumsal hediye'],minQuantity:10,maxQuantity:10000,maxItems:10});
    if(path==='/quotes'&&method==='POST'){quote={...quote,...body,items:(body.items as {productId:string;quantity:number}[]).map(item=>({...item,productName:state.products.find(p=>p.id===item.productId)!.name})),status:'received',offer:null} as Quote;return json(quote);}
    if(path.startsWith('/quotes/')){
      if(path.endsWith('/messages'))quote.messages.push({from:'customer',text:String(body.text),at:now});
      if(path.endsWith('/decision'))quote.status=body.decision==='accept'?'accepted':'rejected';
      return json(quote);
    }
    if(path==='/assistant/config')return json({enabled:true,aiAnswers:false,greeting:'Merhaba, test kataloğundan yardımcı olabilirim.',quickReplies:['Kahve seçenekleri'],whatsAppAvailable:false,disclaimer:'Test kataloğu'});
    if(path==='/assistant/messages')return json({conversationId:'test-conversation',remaining:10,reply:{id:'test-message',role:'assistant',text:'Kahve Makinesi 101 seçeneklerini inceleyebilirsin.',products:[],actions:[],at:now}});
    // Surface-specific tests can use the narrow, read-only development bridge.
    if(path.startsWith('/dev/product-surfaces/'))return route.fallback();
    return json({title:'Testte tanımlanmayan uç: '+method+' '+path},404);
  });
  return {state,order,requests};
}

export async function checkCartTotal(page:Page,count:number) {
  await expect(page.getByText(`${count} ürün`,{exact:true})).toBeVisible();
}

/** Fixed public reference bytes only: no real API acceptance, account or provider call. */
export async function mockReferenceSurface(page:Page){
 const sourcePath='/assets/products/tea-maker-101-blue.webp',maskPath='/assets/personalization/tea-maker-101-blue-designable.png',brandPath='/assets/personalization/tea-maker-101-blue-branding-overlay.png';
 const bytes=(url:string)=>readFileSync('public'+url),hash=(url:string)=>createHash('sha256').update(bytes(url)).digest('hex');
 const media=(url:string)=>({url:url+'?v='+hash(url),sha256:hash(url)});
 await page.route('**/api/v1/dev/product-surfaces/**',route=>{
  const p=new URL(route.request().url()).pathname;
  if(p.endsWith('/cay-makinesi-101/blue/rendering-inputs'))return route.fulfill({json:{scope:'development-preview',productReference:'cay-makinesi-101',variantReference:'blue',previewAvailable:true,inputs:{width:1066,height:1600,surfaceVersion:hash(maskPath),sourceMediaVersion:hash(sourcePath),source:media(sourcePath),mask:media(maskPath),brandingRequired:true,branding:media(brandPath)}}});
  if(p.endsWith('/commerce-mask/DEMO-P101/DEMO-V101-B/rendering-inputs'))return route.fulfill({json:{scope:'development-preview',productReference:'DEMO-P101',variantReference:'DEMO-V101-B',previewAvailable:true,inputs:{width:1066,height:1600,surfaceVersion:hash(maskPath),sourceMediaVersion:hash(sourcePath),source:{url:'/api/v1/local-commerce/media/'+'a'.repeat(32)+'.webp?v='+hash(sourcePath),sha256:hash(sourcePath)},mask:{url:'/api/v1/local-commerce/media/'+ 'b'.repeat(32)+'.png?v='+hash(maskPath),sha256:hash(maskPath)},brandingRequired:false,branding:null}}});
  return route.fulfill({status:404});
 });
 await page.route('**/api/v1/local-commerce/media/'+ 'a'.repeat(32)+'.webp*',route=>route.fulfill({contentType:'image/webp',headers:{'Access-Control-Allow-Origin':'*'},body:bytes(sourcePath)}));
 await page.route('**/api/v1/local-commerce/media/'+ 'b'.repeat(32)+'.png*',route=>route.fulfill({contentType:'image/png',headers:{'Access-Control-Allow-Origin':'*'},body:bytes(maskPath)}));
}
