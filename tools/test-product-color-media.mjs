import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const seed=JSON.parse(await readFile('services/api/LocalCommerce/seed.json','utf8'));
const product=seed.products[0];product.variants[0].hex='#123456';product.variants[0].originalImage='/assets/products/original-test.webp';
const photo=await readFile('apps/web/public'+product.variants[0].image);
const session={id:'test-preview',status:'ready',product,variant:product.variants[0],imageUrl:'/test-art.webp'};
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const admin=await browser.newPage();
 await admin.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:seed}));
 await admin.goto('http://127.0.0.1:5173');await admin.getByRole('button',{name:'Katalog',exact:true}).click();
 await admin.getByRole('button',{name:product.name+' ürününü düzenle',exact:true}).click();
 await admin.getByRole('button',{name:'Stok ve varyant',exact:true}).click();
 assert.equal(await admin.getByLabel('HEX kodu',{exact:true}).first().inputValue(),'#123456');
 await admin.getByRole('button',{name:'Medya',exact:true}).click();
 assert.equal(await admin.getByLabel('Orijinal görsel yükle',{exact:true}).count(),product.variants.length);
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1050}});let originalLoaded=false;let calls=0;const errors=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.method()==='POST')calls++});
 await page.addInitScript(()=>sessionStorage.setItem('xinobi-u-selected-session','test-preview'));
 await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:seed}));
 await page.route('**/api/v1/design-studio/sessions/test-preview',route=>route.fulfill({json:session}));
 await page.route('**/assets/products/original-test.webp',route=>{originalLoaded=true;return route.fulfill({body:photo,contentType:'image/webp'})});
 await page.route('**/test-art.webp',route=>route.fulfill({body:photo,contentType:'image/webp'}));
 await page.goto('http://127.0.0.1:3000/xinobi-u/onizleme');await page.locator('canvas').waitFor();
 const palette=page.getByRole('region',{name:'Ürün renk paleti'});await palette.waitFor();
 assert.equal(await palette.locator('li').count(),product.variants.length);assert.ok(await palette.getByText('#123456',{exact:true}).isVisible());
 assert.equal(await palette.locator('li').first().locator('span').first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(18, 52, 86)');
 assert.ok(originalLoaded);assert.equal(calls,0);assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:`/tmp/xinobi-color-media-${width}.png`,fullPage:true});await page.close();
 }
 console.log('PASS: Admin HEX/original upload fields; desktop/mobile product palette, correct HEX swatch, original preview image; no AI calls.');
}finally{await browser.close()}
