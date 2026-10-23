import {readFileSync} from 'node:fs';
import {test,expect} from '@playwright/test';
import {mockStore} from './fixtures';
import type {MyDesignConfiguration} from '../../src/lib/demo-commerce';
const image=readFileSync('public/assets/personalization/sample-pattern.png');
const sha='a'.repeat(64),sourceSha='b'.repeat(64),id='d'.repeat(32),configuration='c'.repeat(32);
async function fixture(page:import('@playwright/test').Page,{empty=false,kind='upload',signedIn=true,storedPreview=false,name='Test placement'}:{name?:string;empty?:boolean;kind?:'ai'|'upload';signedIn?:boolean;storedPreview?:boolean}={}){
 const {state}=await mockStore(page,{signedIn});
 // Consent is a non-persistent prototype. Dismiss it on every route, as a shopper can,
 // rather than letting the bottom banner intercept placement/cart actions.
 await page.addLocatorHandler(page.getByRole('button',{name:'Çerez tercih panelini kapat'}),async button=>{await button.click()});
 const flat=Buffer.from(await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=100;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#cccccc';ctx.fillRect(0,0,100,100);return canvas.toDataURL().split(',')[1]}),'base64');
 await page.route('**/assets/personalization/sample-pattern.png*',route=>route.fulfill({body:flat,contentType:'image/png'}));const product=state.products[0],variant=product.variants[0];product.personalizable=true;
 const mask=Buffer.from(await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=100;const context=canvas.getContext('2d')!;context.fillRect(10,10,80,80);return canvas.toDataURL().split(',')[1]}),'base64');
 const original:MyDesignConfiguration={id:configuration,designId:id,productId:product.id,variantId:variant.id,revision:1,schemaVersion:1,placement:{sourceWidth:100,sourceHeight:100,surfaceVersion:sha,x:25,y:35,scale:1,rotation:0,curvatureStrength:.5,mode:'artwork'},favorite:true,sourceSha256:sourceSha,createdAt:new Date().toISOString()};
 let current={...original};let saves=0,previews=0;let lastRequest:Record<string,unknown>={};const thumbnails=new Map<string,Buffer>();
 const design={id,kind,name,productId:product.id,productName:product.name,variantId:variant.id,color:variant.color,profile:[],imageUrl:'/api/v1/me/designs/'+id+'/image',createdAt:original.createdAt};
 await page.route(/\/api\/v1\/me\/designs(?:\/|$)/,async route=>{const url=new URL(route.request().url());if(url.pathname.endsWith('/image'))return route.fulfill({body:image,contentType:'image/png'});if(url.pathname.endsWith('/configurations')){const body=route.request().postDataJSON();lastRequest=body;saves++;current={...current,placement:body.placement,revision:current.revision+1,favorite:body.favorite};return route.fulfill({json:current})}return route.fulfill({json:route.request().method()==='POST'?design:[design]})});
 await page.route(/\/api\/v1\/me\/design-configurations(?:\/|$)/,route=>{const path=new URL(route.request().url()).pathname;if(path.endsWith('/preview')){if(route.request().method()==='PUT'){previews++;const bytes=route.request().postDataBuffer()!;thumbnails.set(path,bytes.subarray(bytes.indexOf('\r\n\r\n')+4,bytes.lastIndexOf('\r\n--')));return route.fulfill({status:204})}const thumbnail=thumbnails.get(path);return storedPreview&&thumbnail?route.fulfill({body:thumbnail,contentType:'image/jpeg'}):route.fulfill({status:204})}if(path.endsWith('/favorite')){current={...current,favorite:route.request().postDataJSON().favorite};return route.fulfill({status:204})}return route.fulfill({json:path.includes('/revisions/1')?original:path.includes('/revisions/')?current:[current]})});
 await page.route('**/api/v1/dev/product-surfaces/commerce-mask/**/rendering-inputs',route=>route.fulfill({json:{scope:'development-preview',productReference:product.id,variantReference:variant.id,previewAvailable:true,inputs:{width:100,height:100,surfaceVersion:sha,sourceMediaVersion:sourceSha,brandingRequired:false,branding:null,source:{url:'/assets/personalization/sample-pattern.png?v='+sourceSha,sha256:sourceSha},mask:{url:'/api/v1/local-commerce/media/'+'f'.repeat(32)+'.png?v='+sha,sha256:sha}}}}));
 await page.route('**/api/v1/local-commerce/media/**',route=>route.fulfill({body:mask,contentType:'image/png'}));
 const row={productId:product.id,variantId:variant.id,quantity:2,designId:id,designName:design.name,designPlacement:original.placement,configurationId:configuration,configurationRevision:1};
 const other={...row,configurationId:'e'.repeat(32),quantity:1};
 await page.addInitScript(rows=>{if(!localStorage.getItem('xinobi-cart-v1'))localStorage.setItem('xinobi-cart-v1',JSON.stringify(rows))},empty?[]:[row,other]);
 const target=[row.productId,row.variantId,id,configuration,'1'].join(':');
 const url='/hesap/tasarimlarim/onizleme?'+new URLSearchParams({id,variant:variant.id,configuration,revision:'1',line:target});
 return {url,product,variant,design,current:()=>current,saves:()=>saves,previews:()=>previews,thumbnails,lastRequest:()=>lastRequest};
}

test('editing one personalized cart line preserves quantity, other rows and server revision',async({page})=>{
 const f=await fixture(page);await page.goto(f.url);
 const slider=page.locator('#pattern-x');await expect(slider).toHaveValue('25');
 await slider.fill('60');await page.getByRole('button',{name:'Sepet satırını kaydet',exact:true}).evaluate(button=>{const target=button as HTMLButtonElement;target.click();target.click()});
 await expect(page).toHaveURL(/\/sepet\/?$/);
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!));
 expect(rows).toHaveLength(2);expect(rows[0].quantity).toBe(2);expect(rows[0].designPlacement.x).toBe(60);expect(rows[0].configurationRevision).toBe(2);expect(rows[1].configurationRevision).toBe(1);expect(rows[1].designPlacement.x).toBe(25);expect(f.saves()).toBe(1);
});
test('cancel and removed target never silently rewrite the cart',async({page})=>{
 const f=await fixture(page);await page.goto(f.url);
 await page.locator('#pattern-x').fill('70');await page.getByRole('link',{name:'İptal',exact:true}).click();await expect(page).toHaveURL(/\/sepet\/?$/);
 expect(f.saves()).toBe(0);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!)[0].designPlacement.x)).toBe(25);
 await page.goto(f.url);await expect(page.locator('#pattern-x')).toHaveValue('25');
 await page.evaluate(()=>{localStorage.setItem('xinobi-cart-v1','[]');window.dispatchEvent(new Event('xinobi-cart-changed'))});
 await expect(page.getByText('Düzenlediğin sepet satırı kaldırılmış. Satır yeniden oluşturulmaz.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Sepet satırını kaydet',exact:true})).toBeDisabled();expect(f.saves()).toBe(0);
});
test('personalized favorites reopen the saved variant and placement',async({page})=>{
 await fixture(page);await page.goto('/favoriler');
 const favorite=page.getByRole('region',{name:'Kişisel tasarım favorileri'});
 await favorite.getByRole('link',{name:/Test placement/}).click();
 await expect(page.locator('#pattern-x')).toHaveValue('25');
 await expect(page.getByRole('combobox',{name:'Renk',exact:true})).toHaveValue('DEMO-V101-B');
});


test('saved configurations reopen from the server on My Designs',async({page})=>{
 await fixture(page);await page.goto('/hesap/tasarimlarim');
 await page.getByRole('link',{name:'Kayıtlı yerleşimi aç · Revizyon 1',exact:true}).click();
 await expect(page.locator('#pattern-x')).toHaveValue('25');
});
test('different revisions of the same design are independent cart rows',async({page})=>{
 await fixture(page);await page.goto('/sepet');
 await page.evaluate(()=>{const rows=JSON.parse(localStorage.getItem('xinobi-cart-v1')!);rows.push({...rows[0],configurationRevision:2,quantity:1});localStorage.setItem('xinobi-cart-v1',JSON.stringify(rows));window.dispatchEvent(new Event('xinobi-cart-changed'))});
 await expect(page.getByRole('button',{name:'Sepetten çıkar',exact:true})).toHaveCount(3);
 await page.getByRole('button',{name:'Sepetten çıkar',exact:true}).first().click();
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!));
 expect(rows).toHaveLength(2);expect(rows.some((row:{configurationId:string;configurationRevision:number})=>row.configurationId==='c'.repeat(32)&&row.configurationRevision===1)).toBe(false);
 expect(rows.some((row:{configurationId:string;configurationRevision:number})=>row.configurationId==='c'.repeat(32)&&row.configurationRevision===2)).toBe(true);
});

for(const mode of ['artwork','pattern'] as const)test(`${mode} can be added, previewed in cart, reopened and edited without losing quantity`,async({page})=>{
 const f=await fixture(page,{empty:true,...(mode==='pattern'?{name:'Kişiye özel uzun tasarım adı '.repeat(4)}:{})});
 await page.goto(`/xinobi-u/kendi-gorselin/?product=${f.product.id}&variant=${f.variant.id}&mode=${mode}`);
 await page.locator('input[type=file]').setInputFiles({name:'customer.png',mimeType:'image/png',buffer:image});
 await page.getByRole('button',{name:'Önizlemeye geç →'}).click();
 const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();
 await page.locator('#pattern-x').fill('60');
 await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();
 await expect(page.getByRole('link',{name:'Sepete git →'})).toBeVisible();
 const expected=await canvas.evaluate((value:HTMLCanvasElement)=>value.toDataURL());
 expect(f.current().placement.mode).toBe(mode);expect(f.current().placement.fillMask).toBe(mode==='pattern');expect(f.previews()).toBe(1);
 await page.getByRole('link',{name:'Sepete git →'}).click();
 await expect(page.locator('canvas[role=img]')).toBeVisible();
 expect(await page.locator('canvas[role=img]').evaluate((value:HTMLCanvasElement)=>value.toDataURL())).toBe(expected);
 await page.getByRole('button',{name:/adedini artır/}).click();
 await page.locator('article').getByRole('link').first().click();
 await expect(page.locator('#pattern-x')).toHaveValue('60');
 await expect(page.getByRole('button',{name:'Yakınlaştır',exact:true})).toBeVisible();
 await expect(page.getByText('Metin',{exact:true})).toHaveCount(0);
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
 await page.locator('#pattern-x').fill('70');
 await page.getByRole('button',{name:'Sepet satırını kaydet',exact:true}).click();
 await expect(page).toHaveURL(/\/sepet\/?$/);
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!));
 expect(rows).toHaveLength(1);expect(rows[0].quantity).toBe(2);expect(rows[0].designPlacement.x).toBe(70);expect(rows[0].designName.length).toBeLessThanOrEqual(60);
 expect(f.lastRequest().configurationId).toBeNull(); // Fork an immutable cart snapshot, even if favorites already advanced.
});

test('AI placement is saved directly from its chosen preview colour and can be favorited',async({page})=>{
 const f=await fixture(page,{empty:true,kind:'ai'});
 await page.addInitScript(()=>sessionStorage.setItem('xinobi-u-selected-session','abcdef'));
 await page.route('**/api/v1/design-studio/sessions/abcdef',route=>route.fulfill({json:{id:'abcdef',status:'ready',product:{id:f.product.id,name:f.product.name},variant:{id:f.variant.id,color:f.variant.color},questions:[],answers:[],imageUrl:'/api/v1/design-studio/sessions/abcdef/image'}}));
 await page.route('**/api/v1/design-studio/sessions/abcdef/image',route=>route.fulfill({body:image,contentType:'image/png'}));
 await page.goto('/xinobi-u/onizleme');
 await expect(page.locator('canvas[role=img]')).toBeVisible();await page.locator('#pattern-x').fill('63');
 await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();
 await expect(page.getByRole('link',{name:'Sepete git →'})).toBeVisible();
 expect(f.current().placement.x).toBe(63);expect(f.current().variantId).toBe(f.variant.id);
 await page.getByRole('button',{name:'Favorilere ekle',exact:true}).click();
 await page.getByRole('link',{name:'Favorilere git →'}).click();
 await page.getByRole('region',{name:'Kişisel tasarım favorileri'}).getByRole('link').click();
 await expect(page.locator('#pattern-x')).toHaveValue('63');
 await page.locator('#pattern-x').fill('77');await page.getByRole('button',{name:'Yerleşimi kaydet',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Yerleşim kaydedildi.'})).toBeVisible();
 expect(f.current().placement.x).toBe(77);
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!));expect(rows[0].designPlacement.x).toBe(63);
});

test('sign-in keeps the uploaded file and placement on screen',async({page})=>{
 const f=await fixture(page,{empty:true,signedIn:false});
 await page.goto(`/xinobi-u/kendi-gorselin/?product=${f.product.id}&variant=${f.variant.id}`);
 await page.locator('input[type=file]').setInputFiles({name:'customer.png',mimeType:'image/png',buffer:image});
 await page.getByRole('button',{name:'Önizlemeye geç →'}).click();await expect(page.locator('canvas[role=img]')).toBeVisible();
 await page.locator('#pattern-x').fill('67');
 await page.getByRole('button',{name:'Sepete eklemek için giriş yap',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Giriş yap',exact:true});
 await dialog.getByLabel('E-posta adresi',{exact:true}).fill('test@example.com');await dialog.getByLabel('Parola',{exact:true}).fill('guclu-parola-1');
 await dialog.getByRole('button',{name:'Giriş yap',exact:true}).click();
 await expect(dialog).toHaveCount(0);await expect(page.locator('#pattern-x')).toHaveValue('67');
 await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();
 await expect(page.getByRole('link',{name:'Sepete git →'})).toBeVisible();expect(f.current().placement.x).toBe(67);
});

test('embedded placement uses the app session and writes the native cart without losing an empty initial cart',async({page})=>{
 const f=await fixture(page,{empty:true});
 await page.addInitScript(()=>{
  let rows:unknown[]=[];
  Object.assign(window,{nativeCartRows:rows});
  window.XinobiCommerce={postMessage:async(raw:string)=>{
   const request=JSON.parse(raw),{id,action,payload}=request;
   const reply:Record<string,unknown>={id};
   if(action==='cart.read')reply.body=rows;
   else if(action==='cart.write'){rows=payload.rows;Object.assign(window,{nativeCartRows:rows});reply.status=204}
   else if(action==='account'){
    let body=payload.body;const headers:Record<string,string>={};
    if(body?.form){const form=new FormData();for(const [key,value] of Object.entries(body.form)){
     if(typeof value==='string')form.append(key,value);else{const file=value as {base64:string;name:string;type:string};form.append(key,new Blob([Uint8Array.from(atob(file.base64),c=>c.charCodeAt(0))],{type:file.type}),file.name)}
    }body=form}else if(body)headers['Content-Type']='application/json';
    const response=await fetch('/api/v1'+payload.path,{method:payload.method,body,headers});reply.status=response.status;
    if(payload.binary){const bytes=new Uint8Array(await response.arrayBuffer());let content='';for(const byte of bytes)content+=String.fromCharCode(byte);reply.base64=btoa(content);reply.contentType=response.headers.get('content-type')}
    else if(response.status!==204)reply.body=await response.json();
   }
   window.dispatchEvent(new CustomEvent('xinobi-commerce-response',{detail:reply}));
  }};
 });
 await page.goto(`/xinobi-u/kendi-gorselin/?product=${f.product.id}&variant=${f.variant.id}&mobile=1`);
 await page.locator('input[type=file]').setInputFiles({name:'mobile-photo.png',mimeType:'image/png',buffer:image});
 await page.getByRole('button',{name:'Önizlemeye geç →'}).click();await expect(page.locator('canvas[role=img]')).toBeVisible();
 await page.locator('#pattern-rotation').fill('35');await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();
 await expect(page.getByRole('link',{name:'Sepete git →'})).toBeVisible();
 const rows=await page.evaluate(()=>(window as unknown as {nativeCartRows:{configurationId:string;configurationRevision:number;designPlacement:{rotation:number}}[]}).nativeCartRows);
 expect(rows).toHaveLength(1);expect(rows[0].configurationId).toBe(configuration);expect(rows[0].configurationRevision).toBe(f.current().revision);expect(rows[0].designPlacement.rotation).toBe(35);
});

test('the cart displays the protected saved product composite instead of the raw pattern',async({page})=>{
 const f=await fixture(page,{storedPreview:true});await page.goto(f.url);
 await expect(page.locator('canvas[role=img]')).toBeVisible();await page.locator('#pattern-x').fill('64');
 await page.getByRole('button',{name:'Sepet satırını kaydet',exact:true}).click();await expect(page).toHaveURL(/\/sepet\/?$/);
 const card=page.locator('article').first(),thumbnail=card.locator('img');await expect(thumbnail).toBeVisible();
 await expect(card.locator('canvas')).toHaveCount(0);
 const bytes=Buffer.from(await thumbnail.evaluate(async(node:HTMLImageElement)=>[...new Uint8Array(await(await fetch(node.src)).arrayBuffer())]));
 expect([...bytes.subarray(0,3)]).toEqual([255,216,255]);
 expect(bytes).toEqual([...f.thumbnails.values()][0]);
 await card.getByRole('link').click();await expect(page.locator('#pattern-x')).toHaveValue('64');
});

test('expired private cart images refresh the cookie session once and retry both reads',async({page})=>{
 await fixture(page);
 const seen=new Set<string>();let refreshes=0;
 await page.route('**/api/v1/me/design-configurations/*/revisions/*/preview',route=>{
  const path=new URL(route.request().url()).pathname;
  if(!seen.has(path)){seen.add(path);return route.fulfill({status:401,json:{title:'Oturum sona erdi'}})}
  return route.fulfill({body:image,contentType:'image/png'});
 });
 await page.route('**/api/v1/auth/web/refresh',async route=>{refreshes++;await new Promise(resolve=>setTimeout(resolve,100));return route.fulfill({json:{id:'test-user',name:'Test Kullanıcı',email:'test@example.com'}})});
 await page.goto('/sepet');
 await expect(page.locator('article img')).toHaveCount(2);
 await expect(page.locator('article img').first()).toBeVisible();await expect(page.locator('article img').last()).toBeVisible();
 expect(seen.size).toBe(2);expect(refreshes).toBe(1);
});
