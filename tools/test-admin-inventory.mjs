import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4190/');await page.getByRole('button',{name:'Stok ve depolar',exact:true}).click();
 assert.equal(await page.locator('tbody tr').count(),5);
 await page.getByLabel('Depo filtresi').selectOption('DEMO-W2');assert.equal(await page.locator('tbody tr').count(),2);
 await page.getByLabel('Ürün, SKU veya renk ara').fill('DEMO-TEA-BLUE');assert.equal(await page.locator('tbody tr').count(),1);
 await page.getByRole('button',{name:'Filtreleri temizle'}).click();
 await page.screenshot({path:'test/2026-10-03/TST-080-inventory-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Hareket geçmişi',exact:true}).click();assert.equal(await page.locator('tbody tr').count(),2);
 await page.getByLabel('Depo filtresi').selectOption('DEMO-W2');assert.equal(await page.getByText('Filtrelere uygun hareket yok.',{exact:true}).isVisible(),true);
 await page.getByRole('button',{name:'Filtreleri temizle'}).click();
 await page.getByRole('button',{name:'Mutabakat',exact:true}).click();assert.equal(await page.locator('tbody tr').count(),4);
 await page.getByLabel('Yalnız farkları ve eksik eşlemeleri göster').check();assert.equal(await page.locator('tbody tr').count(),1);
 assert.match(await page.locator('tbody tr').textContent(),/DEMO-COFFEE-RED/);
 await page.getByRole('button',{name:'Sayım önizlemesi',exact:true}).click();await page.getByRole('button',{name:'Farkı önizle',exact:true}).click();assert.match(await page.getByRole('alert').textContent(),/ürün ve depo/);
 await page.getByLabel('Sayım ürün ve depo').selectOption('DEMO-V101-B:DEMO-W1');await page.getByLabel('Sayılan fiziksel adet').fill('-1');await page.getByRole('button',{name:'Farkı önizle',exact:true}).click();assert.match(await page.getByRole('alert').textContent(),/tam sayı/);
 await page.getByLabel('Sayılan fiziksel adet').fill('1');await page.getByRole('button',{name:'Farkı önizle',exact:true}).click();assert.match(await page.getByRole('alert').textContent(),/açıklama/);
 await page.getByLabel('Sayım açıklaması').fill('Örnek kontrol');await page.getByRole('button',{name:'Farkı önizle',exact:true}).click();assert.equal(await page.getByText(/Sayım farkı: -7/).isVisible(),true);assert.equal(await page.getByText(/Sayım rezervasyondan düşük/).isVisible(),true);
 await page.getByRole('button',{name:'Depo stokları',exact:true}).click();assert.match(await page.locator('tbody tr').first().textContent(),/826/);
 await page.getByRole('button',{name:'Katalog',exact:true}).click();await page.getByRole('button',{name:'Yeni demo ürün'}).click();await page.getByLabel('Ürün adı',{exact:true}).fill('Depo eşlemesiz ürün');await page.getByRole('button',{name:'Stok ve varyant',exact:true}).click();await page.getByRole('button',{name:'Varyant ekle',exact:true}).click();await page.getByLabel('SKU',{exact:true}).fill('DEMO-UNMAPPED');await page.getByLabel('Renk',{exact:true}).fill('Gri');await page.getByRole('button',{name:'Demo taslağı uygula'}).click();
 await page.getByRole('button',{name:'Stok ve depolar',exact:true}).click();await page.getByRole('button',{name:'Mutabakat',exact:true}).click();assert.equal(await page.getByText('Depo eşlemesi yok',{exact:true}).isVisible(),true);assert.equal(await page.getByText('Bilinmiyor',{exact:true}).isVisible(),true);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});for(const tab of ['Depo stokları','Hareket geçmişi','Mutabakat','Sayım önizlemesi']){await page.getByRole('button',{name:tab,exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,`${width} ${tab}`)}}
 await page.setViewportSize({width:390,height:900});await page.getByRole('button',{name:'Mutabakat',exact:true}).click();await page.screenshot({path:'test/2026-10-03/TST-080-inventory-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('inventory: depot filters, history, mismatch, count validation/preview, no mutation, unmapped variant, 4 widths = OK');
}finally{await browser.close()}
