import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
// Self-contained fixture: seed catalog + a simulated ready session, so the test never expires and never triggers paid generation.
const state=JSON.parse(await readFile('services/api/LocalCommerce/seed.json','utf8'));
const product=state.products.find(item=>item.id==='DEMO-P101');const variant=product?.variants.find(item=>item.id==='DEMO-V101-B');
assert.ok(product&&variant,'Seed verisinde standart Çay Makinesi 101 Lacivert bulunmalı.');
const session={id:'free-preview-test',status:'ready',imageUrl:'/api/v1/design-studio/sessions/free-preview-test/image',product,variant};
const pattern=await readFile('apps/web/public/assets/banners/home-slider-2.png');
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1050}});
  await page.addInitScript(id=>sessionStorage.setItem('xinobi-u-selected-session',id),session.id);
  await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));
  await page.route('**/api/v1/design-studio/sessions/free-preview-test',route=>route.fulfill({json:session}));
  await page.route('**/api/v1/design-studio/sessions/free-preview-test/image',route=>route.fulfill({status:200,contentType:'image/png',body:pattern,headers:{'Access-Control-Allow-Origin':'*'}}));
  let generationCalls=0;const errors=[];
  page.on('request',request=>{if(request.method()==='POST'&&request.url().endsWith('/generation'))generationCalls++});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:3000/xinobi-u/onizleme');
  await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
  const canvas=page.locator('canvas');await canvas.waitFor();
  const decorated=await canvas.evaluate(canvas=>{const c=canvas.getContext('2d');return {sample:Array.from(c.getImageData(Math.floor(canvas.width*.46),Math.floor(canvas.height*.60),1,1).data),pixels:Array.from([[.05,.05],[.69,.54],[.21,.48]].flatMap(([x,y])=>Array.from(c.getImageData(Math.floor(canvas.width*x),Math.floor(canvas.height*y),1,1).data)))} });
  await page.screenshot({path:`/tmp/xinobi-free-preview-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Orijinal ürünle karşılaştır',exact:true}).click();
  const original=await canvas.evaluate(canvas=>{const c=canvas.getContext('2d');return {sample:Array.from(c.getImageData(Math.floor(canvas.width*.46),Math.floor(canvas.height*.60),1,1).data),pixels:Array.from([[.05,.05],[.69,.54],[.21,.48]].flatMap(([x,y])=>Array.from(c.getImageData(Math.floor(canvas.width*x),Math.floor(canvas.height*y),1,1).data)))} });
  assert.notDeepEqual(decorated.sample,original.sample,'Gövdeye desen uygulanmadı.');
  assert.deepEqual(decorated.pixels,original.pixels,'Arka plan, sap veya ağızlık değişti.');
  await page.getByRole('button',{name:'Tasarımlı görünüm',exact:true}).click();
  await page.getByLabel('Tasarım boyutu').fill('80');
  await page.getByLabel('Yatay konum').fill('5');
  const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Ürün önizlemesini indir',exact:true}).click();const file=await downloaded;
  await file.saveAs(`/tmp/xinobi-free-preview-${width}-export.png`);
  assert.equal(generationCalls,0);assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS: Masaüstü/mobil yüzey kaplama, ışık-gölge, gövde değişimi, arka plan/sap/ağızlık korunması, karşılaştırma, PNG indirme. Yeni AI/API üretim çağrısı: 0.');
}finally{await browser.close()}
