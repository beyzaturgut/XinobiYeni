import assert from 'node:assert/strict';
import {chromium} from '../node_modules/.pnpm/playwright@1.55.1/node_modules/playwright/index.mjs';

// Requires local API with Email:DeliveryMode=Preview; never sends email.
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {
  for(const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:1000}});
    page.setDefaultTimeout(15000);
    await page.goto('http://127.0.0.1:3000/hesap');
    const consent=page.getByRole('button',{name:'Çerez tercih panelini kapat',exact:true});
    if(await consent.isVisible())await consent.click();
    await page.getByRole('heading',{name:'Hesabım',exact:true}).waitFor();
    await page.getByText('Aktif oturum bulunamadı',{exact:true}).waitFor();
    const login=page.getByRole('button',{name:'Giriş yap',exact:true});
    await login.click();
    await page.getByRole('dialog',{name:'Giriş yap',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(),0);
    assert.equal(await login.evaluate(element=>element===document.activeElement),true);
    await page.getByRole('button',{name:'Hesap oluştur',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Hesap oluştur',exact:true});await dialog.waitFor();
    const email=`portal-${width}-${Date.now()}@example.test`;
    await dialog.getByLabel('Ad soyad',{exact:true}).fill('Portal Testi');
    await dialog.getByLabel('E-posta adresi',{exact:true}).fill(email);
    await dialog.getByLabel('Parola',{exact:true}).fill('test-only-password');
    await dialog.getByRole('button',{name:'Doğrulama kodu gönder',exact:true}).click();
    await dialog.getByRole('status').waitFor();
    const code=await dialog.getByRole('status').locator('strong').innerText();
    assert.match(code,/^[0-9]{6}$/);
    await dialog.getByLabel('Doğrulama kodu',{exact:true}).fill(code);
    await dialog.getByRole('button',{name:'E-postayı doğrula ve hesabı oluştur',exact:true}).click();
    await page.getByRole('heading',{name:'Portal Testi',exact:true}).waitFor();
    assert.equal(await page.getByRole('dialog').count(),0);
    await page.getByText('Oturum açık',{exact:true}).waitFor();
    assert.match(await page.getByRole('link',{name:'Siparişlerim',exact:true}).first().getAttribute('href'),/^\/hesap\/siparisler\/?$/);
    await page.reload();await page.getByRole('heading',{name:'Portal Testi',exact:true}).waitFor();
    await page.getByRole('button',{name:'Çıkış yap',exact:true}).click();
    await page.getByText('Aktif oturum bulunamadı',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Giriş yap',exact:true}).click();
    const access=page.getByRole('dialog',{name:'Giriş yap',exact:true});
    await access.getByLabel('E-posta adresi',{exact:true}).fill(email);
    await access.getByLabel('Parola',{exact:true}).fill('wrong-password');
    await access.getByRole('button',{name:'Giriş yap',exact:true}).click();
    await access.getByRole('alert').waitFor();
    await access.getByLabel('Parola',{exact:true}).fill('test-only-password');
    await access.getByRole('button',{name:'Giriş yap',exact:true}).click();
    await page.getByRole('heading',{name:'Portal Testi',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await page.getByRole('button',{name:'Çıkış yap',exact:true}).click();
    if(await consent.isVisible())await consent.click();
    await page.getByRole('heading',{name:'Hesabım',exact:true}).click();
    await page.screenshot({path:`/tmp/xinobi-account-${width}.png`,fullPage:true});
    await page.close();
  }
  console.log('PASS: account portal, modal Escape, preview registration, persistence, logout/login, invalid password, responsive desktop/mobile.');
}finally{await browser.close();}
