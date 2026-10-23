import {readFileSync} from 'node:fs';
import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';
import type {MyDesignConfiguration} from '../../src/lib/demo-commerce';
const image=readFileSync('public/assets/personalization/sample-pattern.png');
const sha='a'.repeat(64),sourceSha='b'.repeat(64),id='d'.repeat(32),configuration='c'.repeat(32);
async function fixture(page:import('@playwright/test').Page){
 const {state}=await mockStore(page,{signedIn:true});
 const flat=Buffer.from(await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=100;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#cccccc';ctx.fillRect(0,0,100,100);return canvas.toDataURL().split(',')[1]}),'base64');
 await page.route('**/assets/personalization/sample-pattern.png*',route=>route.fulfill({body:flat,contentType:'image/png'}));const product=state.products[0],variant=product.variants[0];product.personalizable=true;
 const original:MyDesignConfiguration={id:configuration,designId:id,productId:product.id,variantId:variant.id,revision:1,schemaVersion:1,placement:{sourceWidth:100,sourceHeight:100,surfaceVersion:sha,x:25,y:35,scale:1,rotation:0,curvatureStrength:.5,mode:'artwork'},favorite:true,sourceSha256:sourceSha,createdAt:new Date().toISOString()};
 let current={...original};let saves=0;
 const design={id,kind:'upload',name:'Test placement',productId:product.id,productName:product.name,variantId:variant.id,color:variant.color,profile:[],imageUrl:'/api/v1/me/designs/'+id+'/image',createdAt:original.createdAt};
 await page.route(/\/api\/v1\/me\/designs(?:\/|$)/,async route=>{const url=new URL(route.request().url());if(url.pathname.endsWith('/image'))return route.fulfill({body:image,contentType:'image/png'});if(url.pathname.endsWith('/configurations')){const body=route.request().postDataJSON();saves++;current={...current,placement:body.placement,revision:current.revision+1,favorite:body.favorite};return route.fulfill({json:current})}return route.fulfill({json:[design]})});
 await page.route(/\/api\/v1\/me\/design-configurations(?:\/|$)/,route=>route.fulfill({json:new URL(route.request().url()).pathname.includes('/revisions/')?original:[current]}));
 await page.route('**/api/v1/dev/product-surfaces/commerce-mask/**/rendering-inputs',route=>route.fulfill({json:{scope:'development-preview',productReference:product.id,variantReference:variant.id,previewAvailable:true,inputs:{width:100,height:100,surfaceVersion:sha,sourceMediaVersion:sourceSha,brandingRequired:false,branding:null,source:{url:'/assets/personalization/sample-pattern.png?v='+sourceSha,sha256:sourceSha},mask:{url:'/api/v1/local-commerce/media/'+'f'.repeat(32)+'.png?v='+sha,sha256:sha}}}}));
 await page.route('**/api/v1/local-commerce/media/**',route=>route.fulfill({body:flat,contentType:'image/png'}));
 const row={productId:product.id,variantId:variant.id,quantity:2,designId:id,designName:design.name,designPlacement:original.placement,configurationId:configuration,configurationRevision:1};
 const other={...row,configurationId:'e'.repeat(32),quantity:1};
 await page.addInitScript(rows=>{if(!localStorage.getItem('xinobi-cart-v1'))localStorage.setItem('xinobi-cart-v1',JSON.stringify(rows))},[row,other]);
 const target=[row.productId,row.variantId,id,configuration,'1'].join(':');
 const url='/hesap/tasarimlarim/onizleme?'+new URLSearchParams({id,variant:variant.id,configuration,revision:'1',line:target});
 return {url,current:()=>current,saves:()=>saves};
}

test('editing one personalized cart line preserves quantity, other rows and server revision',async({page})=>{
 const f=await fixture(page);await page.goto(f.url);await closeConsent(page);
 const slider=page.locator('#pattern-x');await expect(slider).toHaveValue('25');
 await slider.fill('60');await page.getByRole('button',{name:'Sepet satırını kaydet',exact:true}).evaluate(button=>{const target=button as HTMLButtonElement;target.click();target.click()});
 await expect(page).toHaveURL(/\/sepet\/?$/);
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!));
 expect(rows).toHaveLength(2);expect(rows[0].quantity).toBe(2);expect(rows[0].designPlacement.x).toBe(60);expect(rows[0].configurationRevision).toBe(2);expect(rows[1].configurationRevision).toBe(1);expect(rows[1].designPlacement.x).toBe(25);expect(f.saves()).toBe(1);
});
test('cancel and removed target never silently rewrite the cart',async({page})=>{
 const f=await fixture(page);await page.goto(f.url);await closeConsent(page);
 await page.locator('#pattern-x').fill('70');await page.getByRole('link',{name:'İptal',exact:true}).click();await expect(page).toHaveURL(/\/sepet\/?$/);
 expect(f.saves()).toBe(0);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!)[0].designPlacement.x)).toBe(25);
 await page.goto(f.url);await expect(page.locator('#pattern-x')).toHaveValue('25');
 await page.evaluate(()=>{localStorage.setItem('xinobi-cart-v1','[]');window.dispatchEvent(new Event('xinobi-cart-changed'))});
 await expect(page.getByText('Düzenlediğin sepet satırı kaldırılmış. Satır yeniden oluşturulmaz.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Sepet satırını kaydet',exact:true})).toBeDisabled();expect(f.saves()).toBe(0);
});
test('personalized favorites reopen the saved variant and placement',async({page})=>{
 await fixture(page);await page.goto('/favoriler');await closeConsent(page);
 const favorite=page.getByRole('region',{name:'Kişisel tasarım favorileri'});
 await favorite.getByRole('link',{name:/Test placement/}).click();
 await expect(page.locator('#pattern-x')).toHaveValue('25');
 await expect(page.getByRole('combobox',{name:'Renk',exact:true})).toHaveValue('DEMO-V101-B');
});


test('saved configurations reopen from the server on My Designs',async({page})=>{
 await fixture(page);await page.goto('/hesap/tasarimlarim');await closeConsent(page);
 await page.getByRole('link',{name:'Kayıtlı yerleşimi aç · Revizyon 1',exact:true}).click();
 await expect(page.locator('#pattern-x')).toHaveValue('25');
});
test('different revisions of the same design are independent cart rows',async({page})=>{
 await fixture(page);await page.goto('/sepet');await closeConsent(page);
 await page.evaluate(()=>{const rows=JSON.parse(localStorage.getItem('xinobi-cart-v1')!);rows.push({...rows[0],configurationRevision:2,quantity:1});localStorage.setItem('xinobi-cart-v1',JSON.stringify(rows));window.dispatchEvent(new Event('xinobi-cart-changed'))});
 await expect(page.getByRole('button',{name:'Sepetten çıkar',exact:true})).toHaveCount(3);
 await page.getByRole('button',{name:'Sepetten çıkar',exact:true}).first().click();
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!));
 expect(rows).toHaveLength(2);expect(rows.some((row:{configurationId:string;configurationRevision:number})=>row.configurationId==='c'.repeat(32)&&row.configurationRevision===1)).toBe(false);
 expect(rows.some((row:{configurationId:string;configurationRevision:number})=>row.configurationId==='c'.repeat(32)&&row.configurationRevision===2)).toBe(true);
});
