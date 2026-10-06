import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('services/api/LocalCommerce/seed.json','utf8'));
state.categories=['Çay makineleri','Kahve makineleri','Hava temizleme','Pişirme teknolojileri'];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const admin=await browser.newPage();
 await admin.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));
 await admin.route('**/api/v1/local-commerce/categories',route=>{
  const {name}=route.request().postDataJSON();assert.equal(name,'Blenderlar');state.categories.push(name);return route.fulfill({json:state});
 });
 await admin.goto('http://127.0.0.1:5173');await admin.getByRole('button',{name:'Katalog',exact:true}).click();
 await admin.getByLabel('Yeni kategori adı',{exact:true}).fill('Blenderlar');await admin.getByRole('button',{name:'Kategori ekle',exact:true}).click();
 await admin.getByRole('status').getByText('Blenderlar kategorisi eklendi.',{exact:true}).waitFor();
 await admin.getByRole('button',{name:'Yeni ürün',exact:true}).click();await admin.getByLabel('Ürün kategorisi',{exact:true}).selectOption('Blenderlar');
 assert.equal(await admin.getByLabel('Ürün kategorisi',{exact:true}).inputValue(),'Blenderlar');
 state.products[0].category='Blenderlar';
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:950}});
 await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));
 await page.goto('http://127.0.0.1:3000/urunler');
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();
 const filter=page.getByRole('button',{name:'Blenderlar',exact:true});await filter.click();assert.equal(await filter.getAttribute('aria-pressed'),'true');
 assert.ok(await page.getByRole('heading',{name:state.products[0].name,exact:true}).first().isVisible());await page.close();
 }
 console.log('PASS: Add category in admin, select on new product, desktop/mobile web filter. Test state mocked; local user data unchanged.');
}finally{await browser.close()}
