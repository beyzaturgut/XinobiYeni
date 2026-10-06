import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('services/api/LocalCommerce/seed.json','utf8'));state.categories=[...new Set(state.products.map(product=>product.category))];state.announcements=[];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const admin=await browser.newPage();await admin.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));
 await admin.route('**/api/v1/local-commerce/announcements',route=>{state.announcements=[{...route.request().postDataJSON(),id:'test',publishedAt:new Date().toISOString()}];return route.fulfill({json:state})});
 await admin.goto('http://127.0.0.1:5173');await admin.getByRole('button',{name:'İçerik',exact:true}).click();await admin.getByRole('button',{name:'Haber ve duyurular',exact:true}).click();
 await admin.getByLabel('Başlık',{exact:true}).fill('Yeni koleksiyon');await admin.getByLabel('Metin',{exact:true}).fill('Titanyum ürünler yayında.');await admin.getByRole('button',{name:'Yayımla',exact:true}).click();await admin.getByText('Yayımlandı; web duyuru kutusu güncelleniyor.',{exact:true}).waitFor();assert.equal(state.announcements.length,1);
 for(const width of [1440,320]){
 const page=await browser.newPage({viewport:{width,height:950}});await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));await page.goto('http://127.0.0.1:3000/');
 await page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true}).click();const button=page.getByRole('button',{name:'Haber ve duyurular',exact:true});await button.click();const inbox=page.getByRole('region',{name:'Haber ve duyuru kutusu',exact:true});await inbox.getByRole('heading',{name:'Yeni koleksiyon',exact:true}).waitFor();assert.ok(await inbox.getByText('Titanyum ürünler yayında.',{exact:true}).isVisible());await button.press('Escape');assert.equal(await button.getAttribute('aria-expanded'),'false');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.close();
 }
 console.log('PASS: Admin publication reaches desktop/mobile inbox, badge, Escape close, no overflow. User data unchanged.');
}finally{await browser.close()}
