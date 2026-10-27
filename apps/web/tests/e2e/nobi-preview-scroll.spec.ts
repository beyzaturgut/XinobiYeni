import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';
import {openPlacement} from './own-image-flow';
test('checkout can scroll above Nobi on desktop and mobile',async({page})=>{
 await mockStore(page);
 await page.goto('/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);
 await page.getByRole('button',{name:'Örnek görselle dene'}).click();await openPlacement(page);
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:780});
  const button=page.getByRole('button',{name:'Sepete eklemek için giriş yap'});await expect(button).toBeVisible();
  await page.evaluate(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"}));
  const checkout=await button.boundingBox(),nobi=await page.getByRole('button',{name:/Nobi.*sor/i}).boundingBox();
  expect(checkout).not.toBeNull();expect(nobi).not.toBeNull();expect(checkout!.y+checkout!.height).toBeLessThan(nobi!.y);
 }
});
