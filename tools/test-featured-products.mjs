import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('tests/fixtures/demo-commerce.json','utf8'));state.categories=[...new Set(state.products.map(product=>product.category))];
const selected=state.products.filter(product=>product.active).slice(0,4).reverse();assert.equal(selected.length,4);
state.content.featuredProducts=[];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const admin=await browser.newPage();await admin.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));await admin.route('**/api/v1/local-commerce/content',route=>{state.content=route.request().postDataJSON();return route.fulfill({json:state})});
 await admin.goto('http://127.0.0.1:5173');await admin.getByRole('button',{name:'İçerik',exact:true}).click();await admin.getByRole('button',{name:'Öne çıkanlar',exact:true}).click();
 for(let index=0;index<4;index++)await admin.getByLabel(`${index+1}. öne çıkan ürün`,{exact:true}).selectOption(selected[index].id);
 await admin.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();await admin.getByText('İçerik kaydedildi; local web güncelleniyor.',{exact:true}).waitFor();assert.deepEqual(state.content.featuredProducts,selected.map(product=>product.id));
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:950}});await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));await page.goto('http://127.0.0.1:3000/');const section=page.locator('#urunler');await section.getByRole('heading',{name:selected[0].name,exact:true}).waitFor();assert.deepEqual(await section.locator('h3').allTextContents(),selected.map(product=>product.name));
 if(width===1440){const boxes=await section.locator('h3').evaluateAll(items=>items.map(item=>item.getBoundingClientRect().top));assert.ok(Math.max(...boxes)-Math.min(...boxes)<2)}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.close();
 }
 console.log('PASS: Admin chooses four featured products in order; four desktop columns and mobile layout. User data unchanged.');
}finally{await browser.close()}
