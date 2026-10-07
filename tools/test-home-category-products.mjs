import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('services/api/LocalCommerce/seed.json','utf8'));
state.categories=['Çay makineleri','Kahve makineleri','Hava temizleme','Pişirme teknolojileri'];
const product=state.products[0],variant=product.variants[1];
product.originalImage=product.variants[0].image;
const originalContent=structuredClone(state.content);
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const admin=await browser.newPage();admin.setDefaultTimeout(10000);
 await admin.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));
 await admin.route('**/api/v1/local-commerce/content',route=>{state.content=route.request().postDataJSON();return route.fulfill({json:state})});
 console.log('Checking admin');await admin.goto('http://127.0.0.1:5173');await admin.getByRole('button',{name:'İçerik',exact:true}).click();
 await admin.getByRole('button',{name:'Kategoriler',exact:true}).click();
 await admin.getByLabel(product.category+' için ürün',{exact:true}).selectOption(variant.id);
 await admin.getByLabel('Kahve makineleri için ürün',{exact:true}).selectOption('');
 await admin.getByRole('button',{name:'Kaydet ve web’i güncelle',exact:true}).click();
 await admin.getByText('İçerik kaydedildi; local web güncelleniyor.',{exact:true}).waitFor();
 assert.equal(state.content.categoryProducts[product.category],variant.id);assert.deepEqual(state.content.slides,originalContent.slides);assert.equal(state.content.xinobiBanner,originalContent.xinobiBanner);
 await admin.reload();await admin.getByRole('button',{name:'İçerik',exact:true}).click();await admin.getByRole('button',{name:'Kategoriler',exact:true}).click();
 assert.equal(await admin.getByLabel(product.category+' için ürün',{exact:true}).inputValue(),variant.id);
 for(const width of [1440,390]){
 console.log('Checking homepage',width);const page=await browser.newPage({viewport:{width,height:1000}});page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));await page.goto('http://127.0.0.1:3000/');
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 if(width===1440){
   await page.getByRole('button',{name:'Kategoriler',exact:true}).hover();
   const menu=page.locator('#home-category-menu');await menu.waitFor({state:'visible'});
   assert.equal(await menu.getByRole('link',{name:'XINOBI U',exact:true}).count(),0);
   assert.equal(await menu.getByRole('link').count(),state.categories.length);
   const coffee=menu.getByRole('link',{name:'Kahve makineleri',exact:true});assert.ok(await coffee.isVisible());
   await coffee.click();await page.locator('button[aria-pressed="true"]').filter({hasText:'Kahve'}).waitFor();
   const catalog=page.locator('#catalog');assert.equal(await catalog.getByRole('heading',{name:product.name,exact:true}).count(),0);
   assert.ok(await catalog.getByRole('heading',{name:state.products[1].name,exact:true}).first().isVisible());
   await page.goto('http://127.0.0.1:3000/');
 }
 const cards=page.locator('#kategoriler');const image=cards.getByRole('img',{name:product.name+' · '+variant.color,exact:true});await image.waitFor();
 assert.ok(decodeURIComponent(await image.getAttribute('src')).includes(variant.image));
 assert.equal(await cards.getByRole('link',{name:'Kahve makineleri',exact:true}).count(),0);
 const link=cards.getByRole('link').filter({has:page.getByRole('img',{name:product.name+' · '+variant.color,exact:true})});assert.equal(await link.count(),1);const target=new URL(await link.getAttribute('href'),'http://127.0.0.1:3000');assert.equal(target.pathname.replace(/\/$/,''),'/urunler');assert.equal(target.searchParams.get('category'),product.category);
 await page.screenshot({path:`/tmp/xinobi-home-categories-${width}.png`,fullPage:true});await link.click();
 await page.locator('button[aria-pressed="true"]').filter({hasText:'Çay'}).waitFor();assert.equal(await page.getByRole('button',{name:'Çay',exact:true}).getAttribute('aria-pressed'),'true');assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: Admin category variant choice, hide category, preserve banners, reload selection, desktop/mobile homepage image and category link. Local user data unchanged.');
}finally{await browser.close()}
