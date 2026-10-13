import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';
// Serve the unpacked production ZIP at http://127.0.0.1:3318/admin/ before running.
const state=JSON.parse(await readFile('tests/fixtures/demo-commerce.json','utf8'));
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
 const page=await browser.newPage();page.setDefaultTimeout(15000);let authenticated=false,staff=false;
 await page.route('**/api/v1/admin/session',r=>r.fulfill({status:!authenticated?401:!staff?403:200,json:!authenticated?{title:'Giriş yap'}:!staff?{title:'Yetki yok'}:{account:{name:'Yönetici Testi'},permissions:['catalog.read','catalog.write']}}));
 await page.route('**/api/v1/auth/web/refresh',r=>r.fulfill({status:401,json:{title:'Oturum yok'}}));
 await page.route('**/api/v1/auth/web/login',r=>{assert.equal(r.request().headers()['x-xinobi-csrf'],'1');authenticated=true;return r.fulfill({json:{name:'Yönetici Testi'}})});
 await page.route('**/api/v1/auth/web/logout',r=>{authenticated=false;return r.fulfill({status:204})});
 await page.route('**/api/v1/local-commerce/state',r=>r.fulfill({json:state}));
 await page.goto('http://127.0.0.1:3318/admin/');await page.getByRole('heading',{name:'Yönetici girişi'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Operasyon özeti'}).count(),0);
 await page.getByLabel('E-posta adresi').fill('admin@example.test');await page.getByLabel('Parola',{exact:true}).fill('test-only-password');await page.getByRole('button',{name:'Giriş yap',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Bu hesabın yönetim paneline erişim yetkisi yok.'}).waitFor();assert.equal(await page.getByRole('heading',{name:'Operasyon özeti'}).count(),0);
 staff=true;await page.getByRole('button',{name:'Giriş yap',exact:true}).click();await page.getByRole('heading',{name:'Operasyon özeti'}).waitFor();
 await page.getByRole('button',{name:'Çıkış yap',exact:true}).click();await page.getByRole('heading',{name:'Yönetici girişi'}).waitFor();
 assert.equal(await page.getByRole('heading',{name:'Operasyon özeti'}).count(),0);
 console.log('PASS: production package blocks anonymous/nonstaff users, admits staff session, logs out; no real credentials or accounts used.');
}finally{await browser.close();}
