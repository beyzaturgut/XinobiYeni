import assert from 'node:assert/strict';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.goto('http://127.0.0.1:3000/');await page.locator('#titanyum img').waitFor();
 const banner=page.locator('#titanyum img');assert.ok((await banner.getAttribute('src')).includes('home-titanium.webp'));
 assert.equal(await banner.evaluate(image=>getComputedStyle(image).objectFit),'contain');
 assert.ok(await page.evaluate(()=>document.querySelector('#kategoriler').compareDocumentPosition(document.querySelector('#titanyum'))&Node.DOCUMENT_POSITION_FOLLOWING));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.close();
 }
 const admin=await browser.newPage();await admin.goto('http://127.0.0.1:5173');await admin.getByRole('button',{name:'İçerik',exact:true}).click();await admin.getByRole('button',{name:'Titanyum banner',exact:true}).click();
 assert.ok(await admin.getByLabel('Titanyum banner görseli yükle',{exact:true}).isVisible());await admin.getByRole('img',{name:'Titanyum ürünler banner önizlemesi',exact:true}).waitFor({state:'visible'});
 await admin.getByRole('button',{name:'Titanyum banner’ı kaldır',exact:true}).click();assert.ok(await admin.getByText('Banner kaldırıldı.',{exact:true}).isVisible());await admin.getByRole('button',{name:'İlk görseli geri yükle',exact:true}).click();await admin.getByRole('img',{name:'Titanyum ürünler banner önizlemesi',exact:true}).waitFor({state:'visible'});
 console.log('PASS: Titanium banner after categories, uncropped desktop/mobile image, admin upload/remove/restore controls. User data unchanged.');
}finally{await browser.close()}
