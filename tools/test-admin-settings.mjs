import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4190/');
 const open=()=>page.getByRole('button',{name:'Rol, ayar ve denetim',exact:true}).click();await open();
 await page.getByLabel('orders write',{exact:true}).check();await page.getByRole('button',{name:'Demo rolü kaydet',exact:true}).click();
 await page.getByLabel('Demo rol',{exact:true}).selectOption('admin');assert.equal(await page.getByRole('button',{name:'Demo rolü kaydet',exact:true}).isDisabled(),true);
 await page.getByRole('button',{name:'Sistem ayarları',exact:true}).click();await page.getByLabel('Düşük stok eşiği').fill('-1');await page.getByRole('button',{name:'Demo ayarları kaydet'}).click();assert.equal(await page.getByRole('alert').isVisible(),true);
 await page.getByLabel('Düşük stok eşiği').fill('8');await page.getByRole('button',{name:'Demo ayarları kaydet'}).click();assert.equal(await page.getByRole('status').isVisible(),true);
 await page.getByRole('button',{name:'Dashboard',exact:true}).click();await open();await page.getByLabel('orders write',{exact:true}).isChecked().then(v=>assert.equal(v,true));
 await page.getByRole('button',{name:'Sistem ayarları',exact:true}).click();assert.equal(await page.getByLabel('Düşük stok eşiği').inputValue(),'8');
 await page.getByRole('button',{name:'Denetim geçmişi',exact:true}).click();assert.equal(await page.getByRole('button',{name:/denetim detayını aç/}).count(),2);await page.getByRole('button',{name:'DEMO-AUDIT-2 denetim detayını aç'}).click();assert.match(await page.locator('.audit-json').last().textContent(),/"lowStock": 8/);
 await page.screenshot({path:'test/2026-10-03/TST-086-settings-desktop.png',fullPage:true});await page.getByLabel('Denetim araması').fill('absent');assert.equal(await page.getByText('Aramaya uygun kayıt yok.').isVisible(),true);await page.getByLabel('Denetim araması').fill('');
 for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:900});for(const tab of ['Rol ve yetkiler','Sistem ayarları','Denetim geçmişi']){await page.getByRole('button',{name:tab,exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth),false,`${width} ${tab}`)}}
 await page.setViewportSize({width:390,height:900});await page.screenshot({path:'test/2026-10-03/TST-086-settings-mobile.png',fullPage:true});await page.reload();await open();await page.getByRole('button',{name:'Denetim geçmişi',exact:true}).click();assert.equal(await page.getByText('Henüz demo değişikliği yok.').isVisible(),true);assert.deepEqual(errors,[]);
 console.log('Settings UI: locked role, validation, session state, audit details/filter, reload reset, 3 tabs x 4 widths OK');
} finally {await browser.close()}
