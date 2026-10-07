import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4190/');
 assert.equal(await page.locator('.widget').count(),13);
 await page.getByRole('button',{name:'Siparişler kartını aşağı taşı',exact:true}).click();
 assert.equal(await page.locator('.widget h2').first().textContent(),'Satış Performansı');
 await page.reload(); assert.equal(await page.locator('.widget h2').first().textContent(),'Satış Performansı');
 await page.getByLabel('Veri görünümü').selectOption('error');
 assert.equal(await page.getByText('Özet yüklenemedi',{exact:true}).count(),13);
 assert.equal(await page.locator('.metric').count(),0);
 await page.getByLabel('Veri görünümü').selectOption('empty');
 assert.equal(await page.getByText('Bu dönemde kayıt yok',{exact:true}).count(),13);
 await page.getByLabel('Veri görünümü').selectOption('demo');
 await page.screenshot({path:'test/2026-10-02/TST-078-admin-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Siparişler',exact:true}).click();
 await page.getByLabel('Sipariş veya müşteri ara').fill('DEMO-1002');
 assert.equal(await page.locator('tbody tr').count(),1);
 const open=page.getByRole('button',{name:'DEMO-1002 detayını aç'}); await open.click();
 assert.equal(await page.getByRole('dialog').isVisible(),true);
 await page.keyboard.press('Escape'); assert.equal(await page.getByRole('dialog').isVisible(),false);
 assert.equal(await open.evaluate(el=>el===document.activeElement),true);
 await page.getByLabel('Sipariş veya müşteri ara').fill('bulunamayan');
 assert.equal(await page.getByText('Filtrelere uygun sipariş yok',{exact:true}).isVisible(),true);
 await page.getByRole('button',{name:'Filtreleri temizle'}).click();assert.equal(await page.locator('tbody tr').count(),3);
 await page.getByLabel('Durum',{exact:true}).selectOption('Yeni');assert.equal(await page.locator('tbody tr').count(),1);
 await page.screenshot({path:'test/2026-10-02/TST-078-admin-orders.png',fullPage:true});
 await page.getByRole('button',{name:'İçerik',exact:true}).click();
 await page.getByRole('button',{name:'XINOBI U',exact:true}).click();
 assert.equal(await page.getByRole('heading',{name:'Görsel ve sabit buton'}).isVisible(),true);
 for(const width of [320,390,768,1440]) {
  await page.setViewportSize({width,height:900});
  for(const view of ['Dashboard','Siparişler','İçerik']) {
   await page.getByRole('button',{name:view,exact:true}).click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,`${width}px ${view} overflow`);
  }
 }
 await page.setViewportSize({width:390,height:900});await page.getByRole('button',{name:'Dashboard',exact:true}).click();
 await page.screenshot({path:'test/2026-10-02/TST-078-admin-mobile.png',fullPage:true});
 const menu=page.getByRole('button',{name:'Ürünler ⌄',exact:true});await menu.click();await page.keyboard.press('Escape');
 assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await menu.evaluate(el=>el===document.activeElement),true);
 await page.evaluate(()=>localStorage.setItem('xinobi:admin:demo:dashboard-layout:v1','["bad"]'));await page.reload();
 assert.equal(await page.locator('.widget h2').first().textContent(),'Siparişler');
 assert.deepEqual(errors,[]);
 console.log('admin panel: 13 widgets, layout persistence/recovery, empty/error, filters, modal focus, CMS, 4 breakpoints = OK');
} finally {await browser.close()}
