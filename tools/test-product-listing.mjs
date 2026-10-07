import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('services/api/LocalCommerce/seed.json','utf8'));
state.categories=[...new Set(state.products.map(product=>product.category))];
const product=state.products[0];product.originalImage='/assets/products/original-listing-test.webp';
const photo=await readFile('apps/web/public'+product.variants[0].image);
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1050}});page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));
 await page.route('**/assets/products/original-listing-test.webp',route=>route.fulfill({body:photo,contentType:'image/webp'}));
 await page.goto('http://127.0.0.1:3000/urunler');await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 const catalog=page.locator('#catalog');await catalog.getByRole('heading',{name:product.name,exact:true}).waitFor();
 assert.equal(await catalog.locator('article').count(),state.products.filter(product=>product.active).length);
 const card=catalog.locator('article').filter({has:page.getByRole('heading',{name:product.name,exact:true})});assert.equal(await card.count(),1);
 assert.ok(decodeURIComponent(await card.locator('img').getAttribute('src')).includes(product.originalImage));
 assert.ok(await card.getByText('◉ '+product.variants.length+' renk',{exact:true}).isVisible());
 await card.locator('img').click();await page.waitForURL('**/urunler/detay/**');await page.getByRole('heading',{name:product.name,exact:true}).waitFor();
 assert.ok(await page.getByRole('link',{name:'Xinobi ana sayfa',exact:true}).isVisible());
 assert.ok(decodeURIComponent(await page.locator('main img').first().getAttribute('src')).includes(product.originalImage));
 await page.getByRole('button',{name:product.variants[1].color+' rengini seç',exact:true}).click();
 assert.ok(decodeURIComponent(await page.locator('main img').first().getAttribute('src')).includes(product.variants[1].image));
 await page.goto('http://127.0.0.1:3000/urunler');await catalog.getByRole('heading',{name:product.name,exact:true}).click();await page.waitForURL('**/urunler/detay/**');await page.getByRole('heading',{name:product.name,exact:true}).waitFor();assert.ok(page.url().includes('detay'));
 await page.goto('http://127.0.0.1:3000/');
 const featured=page.locator('#urunler').getByRole('link').filter({has:page.getByRole('heading',{name:product.name,exact:true})});await featured.waitFor();
 const image=featured.locator('img');assert.ok(decodeURIComponent(await image.getAttribute('src')).includes(product.originalImage));
 assert.deepEqual(await image.evaluate(image=>({fit:getComputedStyle(image).objectFit,transform:getComputedStyle(image).transform})),{fit:'contain',transform:'none'});
 assert.equal(await page.locator('#kategoriler img').first().evaluate(image=>getComputedStyle(image).objectFit),'contain');
 await featured.click();await page.waitForURL('**/urunler/detay/**');await page.getByRole('heading',{name:product.name,exact:true}).waitFor();assert.ok(page.url().includes('detay'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);await page.screenshot({path:`/tmp/xinobi-listing-fixes-${width}.png`,fullPage:true});await page.close();
 }
 console.log('PASS: Original cover on catalog/home/detail, one card per product, multicolor badge, image/title/home card navigation, shared header, uncropped images and mobile layout.');
}finally{await browser.close()}
