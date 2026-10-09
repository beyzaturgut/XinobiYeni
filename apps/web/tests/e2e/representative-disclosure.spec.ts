import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
for(const flow of ['generated','own-image'])test(flow+' personalized preview has persistent shared disclosure',async({page})=>{
 if(flow==='generated'){
  const id='a'.repeat(64);await page.addInitScript(id=>sessionStorage.setItem('xinobi-u-selected-session',id),id);
  const state=JSON.parse(readFileSync('../../services/api/LocalCommerce/seed.json','utf8'));
  const product=state.products.find((p:{id:string})=>p.id==='DEMO-P101');
  await page.route('**/api/v1/design-studio/**',async r=>{
   expect(r.request().method()).toBe('GET');
   if(r.request().url().endsWith('/image'))await r.fulfill({contentType:'image/png',body:readFileSync('public/assets/personalization/sample-pattern.png')});
   else await r.fulfill({json:{id,status:'ready',product,variant:product.variants[0],imageUrl:'/api/v1/design-studio/sessions/'+id+'/image'}});
  });await page.goto('/xinobi-u/onizleme/');
 }else{
  await page.goto('/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-B');
  await page.getByLabel('Görsel seç',{exact:true}).setInputFiles('public/assets/personalization/sample-pattern.png');
 }
 await expect(page.locator('canvas[role=img]')).toBeVisible();await page.getByRole('button',{name:'Çerez tercih panelini kapat'}).click();
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});const badge=page.getByText('Temsilidir',{exact:true});await badge.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await expect(badge).toBeVisible();
  await expect(page.getByText('Temsili dijital çalışma alanı · Ürün üzerindeki fiziksel baskı konumu veya ölçüsü değildir.',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
// Owner decision 09.10.2026 (K-12): every personalised XINOBI U image is labelled, including the home sample.
test('home personalised sample is labelled; ordinary product-selection imagery is not',async({page})=>{
 await page.goto('/');await expect(page.locator('#xinobi-u').getByText('Ürün üzerinde önizleme',{exact:true})).toBeVisible();await expect(page.locator('#xinobi-u').getByText('Temsilidir',{exact:true})).toBeVisible();
 await page.goto('/xinobi-u/');await expect(page.getByText('Temsilidir',{exact:true})).toHaveCount(0);
});
