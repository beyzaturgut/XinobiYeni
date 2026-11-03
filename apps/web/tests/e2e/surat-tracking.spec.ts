import {test,expect} from '@playwright/test';
import {mockStore} from './fixtures';
for(const width of [390,1440])test(`Sürat tracking distinguishes stale returns and retries at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await mockStore(page,{signedIn:true});
 let fail=false,requests=0;
 await page.route('**/api/v1/me/orders/*/surat-tracking',route=>{
  requests++;if(fail)return route.fulfill({status:503,json:{title:'Synthetic unavailable'}});
  return route.fulfill({json:{reference:'FIXTURE',registrationState:'registered',environment:'Production',result:'unavailable',lastSuccess:'2026-11-03T10:00:00Z',items:[{trackingNumber:'TEST-TRACK',state:'return_delivered'}]}});
 });
 await page.goto('/hesap/siparisler/');
 const region=page.getByRole('region',{name:'Sürat Kargo takibi'});await expect(region).toContainText('İade teslim alındı');await expect(region).toContainText('Son alınan bilgi');
 await expect(region.getByText('Teslim edildi',{exact:true})).toHaveCount(0);
 fail=true;await region.getByRole('button',{name:'Takip bilgisini yenile'}).click();await expect(region.getByRole('alert')).toContainText('alınamıyor');
 await expect(region).toContainText('TEST-TRACK');
 fail=false;await region.getByRole('button',{name:'Takip bilgisini yenile'}).click();await expect(region.getByRole('alert')).toHaveCount(0);expect(requests).toBe(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`../../artifacts/surat-web-${width}.png`,fullPage:true});
});
