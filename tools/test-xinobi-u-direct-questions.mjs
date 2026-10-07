import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
// XINOBI U has no colour step: the pattern covers the body, so a product card opens the questions directly and old /renk links redirect.
const state=JSON.parse(await readFile('services/api/LocalCommerce/seed.json','utf8'));const product=state.products[0];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});let generation=0;
 await page.route('**/api/v1/local-commerce/state',r=>r.fulfill({json:state}));
 await page.route('**/api/v1/design-studio/**',r=>{if(r.request().url().endsWith('/generation'))generation++;return r.fulfill({status:503,json:{message:'test'}})});
 await page.goto('http://127.0.0.1:3000/xinobi-u');
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 const card=page.getByRole('link',{name:product.name+' için tasarım oluştur',exact:true});
 const target=new URL(await card.getAttribute('href'),'http://localhost');
 assert.equal(target.pathname.replace(/\/$/,''),'/xinobi-u/sorular');assert.equal(target.searchParams.get('product'),product.id);assert.equal(target.searchParams.get('variant'),null);
 await card.click();await page.waitForURL('**/xinobi-u/sorular/**');
 await page.goto('http://127.0.0.1:3000/xinobi-u/renk?product='+encodeURIComponent(product.id));
 await page.waitForURL(url=>url.pathname.replace(/\/$/,'')==='/xinobi-u/sorular'&&url.searchParams.get('product')===product.id);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(generation,0);
 await page.close()}
 console.log('PASS: product card opens questions without a colour step; old /xinobi-u/renk links redirect; desktop/mobile; no AI calls.')}finally{await browser.close()}
