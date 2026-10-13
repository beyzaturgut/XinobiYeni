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
  let quote:Quote={id:'test-quote',code:'Q-TEST-1',company:'Test Firma',contactName:user.name,email:user.email,items:[{productId:'DEMO-P101',productName:'Çay Makinesi 101',quantity:20}],personalization:false,status:'offered',createdAt:now,offer:{total:{amountMinor:4800000,currency:'TRY'},validUntil:new Date(Date.now()+86400000).toISOString(),at:now},messages:[],history:[]};
  const requests:{path:string;method:string;body:Record<string,unknown>}[]=[];
  if(cart)await page.addInitScript(line=>{if(!localStorage.getItem('xinobi-cart-v1'))localStorage.setItem('xinobi-cart-v1',JSON.stringify([line]));},{productId:'DEMO-P101',variantId:blue.id,quantity:1});
  await page.route('**/api/v1/**',async route=>{
    const req=route.request(),path=new URL(req.url()).pathname.replace('/api/v1',''),method=req.method();
    const body=req.postData()?req.postDataJSON():{};
    if(method!=='GET')requests.push({path,method,body});
    const json=(data:unknown,status=200)=>route.fulfill({json:data,status});
    if(path==='/local-commerce/state')return json(state);
    if(path==='/me'&&method==='GET')return signedIn?json(user):json({title:'Oturum yok'},401);
    if(path==='/auth/web/refresh')return signedIn?json(user):json({title:'Oturum yok'},401);
    if(path==='/email-verification/start')return json({id:'test-verification',email:body.email,expiresAt:new Date(Date.now()+600000).toISOString(),previewCode:'123456'});
    if(path==='/auth/web/register'||path==='/auth/web/login'){signedIn=true;user={...user,...(path.endsWith('register')?{name:String(body.name)}:{}),email:String(body.email)};return json(user);}
    if(path==='/me'&&method==='PATCH'){user={...user,name:String(body.name)};return json(user);}
    if(path==='/me/addresses'){
      if(method==='POST'){addresses.push({...body,id:'new-address'} as CustomerAddress);return json(addresses.at(-1));}
      return json(addresses);
    }
    if(path.startsWith('/me/addresses/')&&method==='PUT'){addresses=addresses.map(a=>a.id===path.split('/').at(-1)?{...a,...body}:a);return json(addresses.find(a=>a.id===path.split('/').at(-1)));}
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
