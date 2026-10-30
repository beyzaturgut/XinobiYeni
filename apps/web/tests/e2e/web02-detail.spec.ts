import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';
import {mockAcceptedSurfaces} from './preview-readiness-fixtures';
test('maskesiz renk normal sepete gider; kişiselleştirmede renk sessizce değişmez',async({page})=>{
 const {requests}=await mockStore(page);await mockAcceptedSurfaces(page);
 await page.goto('/urunler/detay/?id=DEMO-P101&variant=DEMO-V101-R');await closeConsent(page);
 await expect(page.getByRole('button',{name:'Kırmızı rengini seç'})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('[data-preview-readiness]')).toHaveAttribute('data-preview-readiness','unavailable');
 await page.getByRole('button',{name:'Sepete ekle',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')||'[]'))).toEqual([{productId:'DEMO-P101',variantId:'DEMO-V101-R',quantity:1}]);
 await page.getByRole('link',{name:'XINOBI U ile kişiselleştir'}).click();
 await expect(page.locator('[data-preview-readiness]')).toHaveAttribute('data-preview-readiness','unavailable');
 await expect(page.getByRole('link',{name:'Görsel yükle →'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Kişiselleştirme kullanılamıyor'})).toBeDisabled();
 await page.getByRole('button',{name:'Lacivert rengini kullan'}).click();
 await expect(page.getByRole('link',{name:'Görsel yükle →'})).toHaveAttribute('href',/variant=DEMO-V101-B/);
 expect(requests.filter(r=>r.path.includes('design-studio')||r.path.includes('xinobi-u'))).toHaveLength(0);
});
test('ürün renk URLsi yenileme ve geri ileride doğru SKUyu korur',async({page})=>{
 await mockStore(page);await mockAcceptedSurfaces(page,false);
 await page.goto('/urunler/detay/?id=DEMO-P101');await closeConsent(page);
 await page.getByRole('button',{name:'Kırmızı rengini seç'}).click();
 await page.getByRole('button',{name:'Gümüş gri rengini seç'}).click();
 await page.goBack();await expect(page.getByRole('button',{name:'Kırmızı rengini seç'})).toHaveAttribute('aria-pressed','true');
 await page.goForward();await expect(page.getByRole('button',{name:'Gümüş gri rengini seç'})).toHaveAttribute('aria-pressed','true');
 await page.reload();await closeConsent(page);await expect(page.getByRole('button',{name:'Gümüş gri rengini seç'})).toHaveAttribute('aria-pressed','true');
});

test('yöntem adımında katalog kesilirse eski uygunlukla devam edilmez',async({page})=>{
 await mockStore(page);await mockAcceptedSurfaces(page);
 let failed=false;
 await page.route('**/api/v1/local-commerce/state',route=>failed?route.fulfill({status:503}):route.fallback());
 await page.route('**/api/v1/catalog/storefront',route=>failed?route.fulfill({status:503}):route.fallback());
 await page.goto('/xinobi-u/renk/?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);
 await expect(page.getByRole('link',{name:'Görsel yükle →'})).toBeVisible();
 failed=true;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await expect(page.getByRole('button',{name:'Ürünü yeniden yükle'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Görsel yükle →'})).toHaveCount(0);
 failed=false;await page.getByRole('button',{name:'Ürünü yeniden yükle'}).click();
 await expect(page.getByRole('link',{name:'Görsel yükle →'})).toBeVisible();
});
