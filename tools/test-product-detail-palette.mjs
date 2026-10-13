import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('tests/fixtures/demo-commerce.json','utf8'));
const product=state.products[0];product.variants[0].hex='#123456';product.variants[1].hex='#CC3344';state.prices[product.variants[1].id]=120000;product.variants[1].stock=10;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 for(const path of ['/urunler/detay?id='+encodeURIComponent(product.id)])for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));await page.goto('http://127.0.0.1:3000'+path);
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 const first=page.getByRole('button',{name:product.variants[0].color+' rengini seç',exact:true});await first.waitFor();
 assert.equal(await first.locator('span').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(18, 52, 86)');
 const second=page.getByRole('button',{name:product.variants[1].color+' rengini seç',exact:true});await second.click();
 assert.equal(await second.getAttribute('aria-pressed'),'true');assert.equal(await second.locator('span').evaluate(el=>getComputedStyle(el).borderRadius),'50%');
 assert.ok(await page.getByRole('img',{name:new RegExp(product.variants[1].color)}).first().isVisible());
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
 if(path.includes('detay'))await page.screenshot({path:`/tmp/xinobi-product-palette-${width}.png`,fullPage:true});await page.close();
 }
 console.log('PASS: Generic and tea product detail, HEX colors, circular swatches, variant image switching, desktop/mobile layout.');
}finally{await browser.close()}
