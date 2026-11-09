import {readFileSync} from 'node:fs';
import {test,expect} from '@playwright/test';
import {mockStore} from './fixtures';
const image=readFileSync('public/assets/products/tea-maker-101-blue.webp');
test.beforeEach(async({page,baseURL})=>{const origin=new URL(baseURL!).origin;await page.context().route('**/*',route=>{const url=new URL(route.request().url());return url.origin===origin&&!url.pathname.startsWith('/api/')?route.continue():route.abort()})});
for(const width of [390,1440])for(const fallback of [false,true])test(`order composition and zoom at ${width}, saved revision fallback=${fallback}`,async({page})=>{
 await page.setViewportSize({width,height:900});
 const {order}=await mockStore(page,{signedIn:true});
 await page.addLocatorHandler(page.getByRole('button',{name:'Çerez tercih panelini kapat'}),async button=>{await button.click()});
 order.lines[0].personalization={designId:'design',kind:'upload',name:'Desen',mime:'image/png',imageUrl:'/api/v1/me/orders/test-order/lines/0/design',configurationId:'saved',configurationRevision:3};
 const requested:string[]=[];
 await page.route('**/api/v1/me/orders/*/lines/*/preview',route=>{requested.push('order');return fallback?route.fulfill({status:404}):route.fulfill({body:image,contentType:'image/webp'})});
 await page.route('**/api/v1/me/design-configurations/saved/revisions/3/preview',route=>{requested.push('revision');return route.fulfill({body:image,contentType:'image/webp'})});
 let raw=false;await page.route('**/api/v1/me/orders/*/lines/*/design',route=>{raw=true;return route.abort()});
 await page.goto('/hesap/siparisler');
 const thumbnail=page.getByRole('button',{name:/ürün önizlemesini büyüt/}).first();
 await expect(thumbnail.locator('img')).toHaveAttribute('alt',/tasarladığın ürün/);
 const src=await thumbnail.locator('img').getAttribute('src');
 await thumbnail.click();const viewer=page.getByRole('dialog');await expect(viewer).toBeVisible();
 await expect(viewer.locator('img')).toHaveAttribute('src',src!);
 const bounds=await viewer.boundingBox();expect(bounds!.x).toBe(0);expect(bounds!.y).toBe(0);expect(bounds!.width).toBe(width);expect(bounds!.height).toBe(900);
 expect(await viewer.evaluate(node=>node.parentElement===document.body)).toBe(true);
 const product=await viewer.locator('img').boundingBox();expect(product!.width).toBeGreaterThan(width*.9);expect(product!.height).toBeGreaterThan(600);
 await expect(viewer.getByText('Yakınlaştırmak için iki parmağınla büyüt.')).toBeVisible();
 const controls=viewer.getByRole('button',{name:'Yakınlaştır',exact:true});
 if(width===390)await expect(controls).toBeHidden();else await expect(controls).toBeVisible();
 await page.keyboard.press('+');await expect(viewer.locator('output')).toHaveText('%150');
 await page.keyboard.press('-');await expect(viewer.locator('output')).toHaveText('%100');
 const stage=viewer.locator('[data-zoom]');
 await stage.evaluate(node=>{
  const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const send=(type:string,id:number,dx:number,dy=0)=>node.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:id,pointerType:'touch',clientX:x+dx,clientY:y+dy}));
  send('pointerdown',31,-40);send('pointerdown',32,40);send('pointermove',31,-80);send('pointermove',32,80);
 });
 await expect(stage).toHaveAttribute('data-zoom','2');
 await stage.evaluate(node=>{
  const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  node.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:32,pointerType:'touch',clientX:x+80,clientY:y}));
  node.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:31,pointerType:'touch',clientX:x-50,clientY:y+30}));
 });
 await expect(stage.locator('div').first()).toHaveAttribute('style',/translate\(30px, 30px\) scale\(2\)/);
 await stage.dispatchEvent('pointercancel',{pointerId:31,pointerType:'touch'});
 await page.keyboard.press('0');await expect(stage).toHaveAttribute('data-zoom','1');
 await stage.evaluate(node=>{
  const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const send=(type:string,id:number,dx:number)=>node.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:id,pointerType:'touch',clientX:x+dx,clientY:y}));
  send('pointerdown',41,-40);send('pointerdown',42,40);send('pointermove',41,-400);send('pointermove',42,400);
 });
 await expect(stage).toHaveAttribute('data-zoom','5');
 await stage.evaluate(node=>{
  const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const send=(type:string,id:number,dx:number)=>node.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:id,pointerType:'touch',clientX:x+dx,clientY:y}));
  send('pointermove',41,-1);send('pointermove',42,1);send('pointerup',41,-1);send('pointerup',42,1);
 });
 await expect(stage).toHaveAttribute('data-zoom','1');
 await page.screenshot({path:`../../artifacts/order-product-viewer-${width}-${fallback}.png`});
 await viewer.getByRole('button',{name:'Önizlemeyi kapat'}).click();await expect(viewer).toHaveCount(0);
 await expect(thumbnail).toBeFocused();
 await thumbnail.click();await expect(page.getByRole('dialog').locator('[data-zoom]')).toHaveAttribute('data-zoom','1');
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 expect(requested).toEqual(fallback?['order','revision']:['order']);expect(raw).toBe(false);
});

for(const status of [404,503])test(`schema-2 order missing snapshot ${status} never uses configuration or live catalogue photo`,async({page})=>{
 const {order}=await mockStore(page,{signedIn:true});
 order.lines[0].color='YENİ-SİPARİŞTE-GİZLİ';
 order.lines[0].personalization={designId:'new-design',kind:'upload',name:'Yeni desen',mime:'image/png',schemaVersion:2,configurationId:'new-config',configurationRevision:1};
 let fallback=0;
 await page.route('**/api/v1/me/orders/*/lines/*/preview',route=>route.fulfill({status,json:{code:'snapshot_unavailable'}}));
 await page.route('**/api/v1/me/design-configurations/**',route=>{fallback++;return route.fulfill({body:image,contentType:'image/webp'})});
 await page.addLocatorHandler(page.getByRole('button',{name:'Çerez tercih panelini kapat'}),async button=>{await button.click()});
 await page.goto('/hesap/siparisler/');
 const thumbnail=page.getByRole('button',{name:/ürün önizlemesini büyüt/}).first();
 await expect(thumbnail.getByText('Tasarım önizlemesi mevcut değil')).toBeVisible();await expect(thumbnail.locator('img')).toHaveCount(0);
 await expect(page.getByText(/YENİ-SİPARİŞTE-GİZLİ/)).toHaveCount(0);expect(fallback).toBe(0);
 await thumbnail.click();await expect(page.getByRole('dialog').locator('img')).toHaveCount(0);
});

test('legacy order with a file manifest cannot replace a missing order copy with a live saved preview',async({page})=>{
 const {order}=await mockStore(page,{signedIn:true});
 order.lines[0].personalization={designId:'legacy-with-files',kind:'upload',name:'Eski kayıt',mime:'image/png',schemaVersion:1,configurationId:'old-config',configurationRevision:1,files:{pattern:{sha256:'a'.repeat(64),mime:'image/png',bytes:10},productSource:null,composition:{sha256:'b'.repeat(64),mime:'image/jpeg',bytes:10}}};
 let requests=0;await page.route('**/api/v1/me/orders/*/lines/*/preview',route=>route.fulfill({status:404}));
 await page.route('**/api/v1/me/design-configurations/**',route=>{requests++;return route.fulfill({body:image,contentType:'image/webp'})});
 await page.addLocatorHandler(page.getByRole('button',{name:'Çerez tercih panelini kapat'}),async button=>{await button.click()});
 await page.goto('/hesap/siparisler/');const button=page.getByRole('button',{name:/ürün önizlemesini büyüt/}).first();
 await expect(button.getByText('Tasarım önizlemesi mevcut değil')).toBeVisible();await expect(button.locator('img')).toHaveCount(0);expect(requests).toBe(0);
});
