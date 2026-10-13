import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
const state=JSON.parse(await readFile('tests/fixtures/demo-commerce.json','utf8'));
state.announcements=[{id:'header-test',title:'Yeni koleksiyon',body:'Test duyurusu',kind:'Haber',publishedAt:'2026-10-07T10:00:00Z'}];
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 for(const width of [1440,390]) {
  const page=await browser.newPage({viewport:{width,height:1000}});
  await page.route('**/api/v1/local-commerce/state',route=>route.fulfill({json:state}));
  for(const path of ['/arama','/favoriler','/hesap','/hesap/giris','/hesap/siparisler','/yasal','/asistan','/xinobi-u']) {
   await page.goto('http://127.0.0.1:3000'+path);
   const consent=page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true});
   if(await consent.isVisible())await consent.click();
   const header=page.locator('header').first();
   assert.equal(await header.getByRole('link',{name:'Sepet',exact:true}).getAttribute('href'),'/sepet/');
   await header.getByRole('button',{name:'Haber ve duyurular',exact:true}).click();
   await header.getByRole('heading',{name:'Yeni koleksiyon',exact:true}).waitFor();
   await page.keyboard.press('Escape');
   assert.equal(await header.getByRole('button',{name:'Haber ve duyurular',exact:true}).getAttribute('aria-expanded'),'false');
   if(width===390)await header.locator('summary').click();
   const nav=header.getByRole('navigation',{name:width===390?'Mobil menü':'Ana menü',exact:true});
   assert.equal(await nav.getByRole('link',{name:'Ürünler',exact:true}).getAttribute('href'),'/urunler/');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path+' overflow');
  }
  await page.close();
 }
 console.log('PASS: shared navigation, basket link, announcements, Escape and no overflow on 8 routes; desktop/mobile.');
} finally {await browser.close()}
