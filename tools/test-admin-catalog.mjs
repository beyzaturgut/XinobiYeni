import { chromium } from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4190/');await page.getByRole('button',{name:'Katalog',exact:true}).click();
 assert.equal(await page.locator('tbody tr').count(),3);
 await page.getByLabel('Ürün veya SKU ara').fill('DEMO-TEA-RED');assert.equal(await page.locator('tbody tr').count(),1);
 await page.getByRole('button',{name:'Filtreleri temizle'}).click();
 await page.getByLabel('Ürün durum filtresi').selectOption('Stoksuz');assert.equal(await page.locator('tbody tr').count(),1);
 await page.getByRole('button',{name:'Filtreleri temizle'}).click();
 await page.getByLabel('Kategori filtresi').selectOption('Kahve makineleri');assert.equal(await page.locator('tbody tr').count(),1);
 await page.getByRole('button',{name:'Filtreleri temizle'}).click();
 await page.screenshot({path:'test/2026-10-03/TST-079-catalog-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Çay Makinesi 101 ürününü düzenle'}).click();
 await page.getByLabel('Ürün adı',{exact:true}).fill('');await page.getByRole('button',{name:'Demo taslağı uygula'}).click();
 assert.equal(await page.getByRole('alert').textContent(),'Ürün adı zorunludur.');
 await page.getByLabel('Ürün adı',{exact:true}).fill('Çay Makinesi 101 Güncel');
 await page.getByRole('button',{name:'Stok ve varyant',exact:true}).click();
 const stocks=page.getByLabel('Örnek stok',{exact:true});await stocks.first().fill('-1');await page.getByRole('button',{name:'Demo taslağı uygula'}).click();
 assert.match(await page.getByRole('alert').textContent(),/tam sayı stok/);
 await stocks.first().fill('11');const skus=page.getByLabel('SKU',{exact:true});await skus.nth(1).fill('DEMO-TEA-BLUE');await page.getByRole('button',{name:'Demo taslağı uygula'}).click();assert.match(await page.getByRole('alert').textContent(),/benzersiz/);
 await skus.nth(1).fill('DEMO-TEA-RED');await page.getByRole('button',{name:'Genel bilgiler',exact:true}).click();assert.equal(await page.getByLabel('Ürün adı',{exact:true}).inputValue(),'Çay Makinesi 101 Güncel');
 await page.getByRole('button',{name:'SEO',exact:true}).click();await page.getByLabel('SEO başlığı').fill('Yeni başlık');await page.getByRole('button',{name:'Medya',exact:true}).click();assert.equal(await page.locator('.catalog-media img').count(),2);
 await page.getByRole('button',{name:'Demo taslağı uygula'}).click();assert.equal(await page.getByRole('dialog').isVisible(),false);
 await page.getByRole('button',{name:'Dashboard',exact:true}).click();await page.getByRole('button',{name:'Katalog',exact:true}).click();
 const edit=page.getByRole('button',{name:'Çay Makinesi 101 Güncel ürününü düzenle'});await edit.click();await page.getByRole('button',{name:'SEO',exact:true}).click();assert.equal(await page.getByLabel('SEO başlığı').inputValue(),'Yeni başlık');
 await page.keyboard.press('Escape');assert.equal(await edit.evaluate(el=>document.activeElement===el),true);
 await page.getByRole('button',{name:'Yeni demo ürün'}).click();await page.getByLabel('Ürün adı',{exact:true}).fill('Yeni Ürün');await page.getByRole('button',{name:'Stok ve varyant',exact:true}).click();await page.getByRole('button',{name:'Varyant ekle',exact:true}).click();await page.getByLabel('SKU',{exact:true}).fill('DEMO-NEW');await page.getByLabel('Renk',{exact:true}).fill('Beyaz');await page.getByRole('button',{name:'Demo taslağı uygula'}).click();assert.equal(await page.locator('tbody tr').count(),4);
 await edit.click();await page.getByLabel('Ürün adı',{exact:true}).fill('Silinecek');page.once('dialog',d=>d.accept());await page.keyboard.press('Escape');assert.equal(await page.getByRole('button',{name:'Silinecek ürününü düzenle'}).count(),0);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false);await edit.click();await page.getByRole('button',{name:'Stok ve varyant',exact:true}).click();assert.equal(await page.getByRole('dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false);await page.keyboard.press('Escape');}
 await page.setViewportSize({width:390,height:900});await page.screenshot({path:'test/2026-10-03/TST-079-catalog-mobile.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('catalog: filters, validation, variant identity/media, tab draft, save/navigation, create/cancel, focus, 4 widths = OK');
}finally{await browser.close()}
