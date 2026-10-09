const {chromium}=require('../apps/web/node_modules/@playwright/test'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const page=await browser.newPage();let posts=0;
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(!['127.0.0.1','localhost'].includes(u.hostname))return route.abort();
 if(u.pathname==='/api/v1/admin/dev/cm101-candidate'){posts++;assert.equal(route.request().method(),'POST');const body=route.request().postDataJSON();assert.equal(body.target,'lower kettle body');assert.equal(body.sha256,'f913955d929df14547253de31a69402cbb6e0a47b36d062be70ffd1b39ffc935');assert.equal(body.acknowledgeCredits,true);return route.fulfill({json:{status:'pending',directory:'MOCK ONLY',approved:false}});}return route.continue();});
 await page.goto('http://127.0.0.1:5176/');await page.getByRole('button',{name:/yüzeyi incele/}).click();
 await page.getByRole('combobox',{name:'Ürün',exact:true}).selectOption('DEMO-ada5b793-37af-44b6-8e99-73492d4b7da6');
 await page.getByRole('combobox',{name:'Varyant',exact:true}).selectOption('DEMO-V-d616c2bf-7dd0-4c2f-981e-ebf212fb66a1');
 const button=page.getByRole('button',{name:'Yeni maske oluştur',exact:true});await button.waitFor();assert.equal(posts,0);
 page.once('dialog',dialog=>dialog.dismiss());await button.click();assert.equal(posts,0);
 page.once('dialog',dialog=>dialog.accept());await button.click();await page.getByRole('status').filter({hasText:'MOCK ONLY'}).waitFor();assert.equal(posts,1);assert.ok(await button.isDisabled());
 console.log('PASS Admin selection/startup zero POST; consent cancellation zero POST; explicit consent one mocked pending request; duplicate disabled.');
}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1});
