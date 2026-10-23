import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';
const entry='/xinobi-u/kendi-gorselin/';

test('all product colours retain an entry and the three design methods preserve identity',async({page})=>{
 const {state,requests}=await mockStore(page);const product=state.products.find(p=>p.id==='DEMO-P101')!;
 await page.goto('/urunler/detay?id='+product.id);await closeConsent(page);
 for(const variant of product.variants){
  await page.getByRole('button',{name:variant.color+' rengini seç',exact:true}).click();
  await expect(page.getByRole('link',{name:'XINOBI U ile kişiselleştir'})).toHaveAttribute('href',new RegExp('product='+product.id+'&variant='+variant.id));
 }
 await page.goto(entry+'?product=DEMO-P101&variant=DEMO-V101-B');
 const methods=page.getByRole('navigation',{name:'Kişiselleştirme yöntemi'});
 await expect(methods.getByRole('link')).toHaveCount(3);
 await expect(methods.getByRole('link',{name:'AI ile tasarla',exact:true})).toHaveAttribute('href',/\/xinobi-u\/sorular\/?\?product=DEMO-P101&variant=DEMO-V101-B/);
 await methods.getByRole('link',{name:'Desen yükle',exact:true}).click();await expect(page.getByLabel('Desen seç',{exact:true})).toBeVisible();
 await expect(page.locator('main')).toHaveAttribute('data-variant-reference','DEMO-V101-B');
 expect(requests.filter(r=>r.path.includes('/generation'))).toHaveLength(0);
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
for(const [product,variant] of [['DEMO-P101','DEMO-V101-R'],['DEMO-P101','DEMO-V101-S'],['DEMO-P101','DEMO-V101-G'],['DEMO-P102','DEMO-V102-R']])test('missing surface never borrows another colour: '+variant,async({page})=>{
 const {requests}=await mockStore(page);
 await page.goto(entry+'?product='+product+'&variant='+variant);
 await expect(page.locator('main section[role=status]')).toContainText('Bu renk için onaylı yüzey henüz hazır değil.');
 await expect(page.locator('main')).toHaveAttribute('data-product-reference',product);
 await expect(page.locator('main')).toHaveAttribute('data-variant-reference',variant);
 await expect(page.locator('input[type=file],canvas')).toHaveCount(0);
 expect(requests.filter(r=>r.path.includes('/generation'))).toHaveLength(0);
});
test('upload error can be retried; changing method asks before discarding a file',async({page})=>{
 await mockStore(page);let failing=true;
 await page.route('**/rendering-inputs',route=>failing?route.fulfill({status:503}):route.fallback());
 await page.goto(entry+'?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);
 await expect(page.getByRole('button',{name:'Önizlemeyi yeniden yükle'})).toBeVisible();failing=false;
 await page.getByRole('button',{name:'Önizlemeyi yeniden yükle'}).click();
 await page.getByLabel('Görsel seç',{exact:true}).setInputFiles('public/assets/personalization/sample-pattern.png');
 await expect(page.getByRole('button',{name:'Görseli kaldır',exact:true})).toBeVisible();
 page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('link',{name:'Desen yükle',exact:true}).click();
 await expect(page.getByRole('button',{name:'Görseli kaldır',exact:true})).toBeVisible();
});
test('missing identity and ineligible products cannot upload',async({page})=>{
 const {state}=await mockStore(page);
 await page.goto(entry);await expect(page.locator('main section[role=status]')).toContainText('bir ürün ve varyant seçin');
 const product=state.products[0];product.personalizable=false;
 await page.goto(entry+'?product='+product.id+'&variant='+product.variants[0].id);
 await expect(page.getByRole('alert').filter({hasText:'Bu ürün kişiselleştirme programında değil.'})).toBeVisible();
 await expect(page.locator('input[type=file],canvas')).toHaveCount(0);
});
