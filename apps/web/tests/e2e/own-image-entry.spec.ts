import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';
import {openPlacement} from './own-image-flow';
const entry='/xinobi-u/kendi-gorselin/';

test('product colours lead to the method step and every method keeps the product identity',async({page})=>{
 const {state,requests}=await mockStore(page);const product=state.products.find(p=>p.id==='DEMO-P101')!;
 await page.goto('/urunler/detay?id='+product.id);await closeConsent(page);
 for(const variant of product.variants){
  await page.getByRole('button',{name:variant.color+' rengini seç',exact:true}).click();
  await expect(page.getByRole('link',{name:'XINOBI U ile kişiselleştir'})).toHaveAttribute('href',new RegExp('/xinobi-u/renk/?\\?product='+product.id+'&variant='+variant.id));
 }
 await page.goto('/xinobi-u/renk/?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);
 await expect(page.getByRole('heading',{name:'Tasarımını nasıl oluşturmak istersin?'})).toBeVisible();
 await expect(page.getByRole('link',{name:'Görsel yükle →'})).toHaveAttribute('href','/xinobi-u/kendi-gorselin/?product=DEMO-P101&variant=DEMO-V101-B');
 await page.locator('label').filter({hasText:'Sorularla tasarla'}).click();await expect(page.getByRole('radio',{name:/Sorularla tasarla/})).toBeChecked();
 await expect(page.getByRole('link',{name:'Sorulara başla →'})).toHaveAttribute('href','/xinobi-u/sorular/?product=DEMO-P101&variant=DEMO-V101-B');
 await page.locator('label').filter({hasText:'Kendi desenini yükle'}).click();await expect(page.getByRole('radio',{name:/Kendi desenini yükle/})).toBeChecked();
 await page.getByRole('link',{name:'Desen yükle →'}).click();
 await expect(page.getByRole('heading',{name:'Desenini yükle'})).toBeVisible();await expect(page.getByLabel('Dosya seç',{exact:true})).toBeEnabled();
 await expect(page.getByRole('button',{name:'Desen',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Görsel',exact:true}).click();await expect(page.getByRole('heading',{name:'Görselini yükle'})).toBeVisible();
 await expect(page.locator('main')).toHaveAttribute('data-variant-reference','DEMO-V101-B');
 expect(requests.filter(r=>r.path.includes('/generation'))).toHaveLength(0);
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
// A colour without its own accepted surface is never offered and never borrows another colour's mask.
for(const variant of ['DEMO-V101-R','DEMO-V101-S','DEMO-V101-G'])test('requested colour without a surface starts from an accepted colour: '+variant,async({page})=>{
 await mockStore(page);
 await page.goto(entry+'?product=DEMO-P101&variant='+variant);await closeConsent(page);
 await expect(page.locator('main')).toHaveAttribute('data-variant-reference','DEMO-V101-B');
 await page.getByLabel('Dosya seç',{exact:true}).setInputFiles('public/assets/personalization/sample-pattern.png');
 await openPlacement(page);
 const colours=page.getByRole('group',{name:/Ürün rengi/});
 await expect(colours.getByRole('button')).toHaveCount(1);await expect(colours.getByRole('button',{name:'Lacivert rengini seç'})).toHaveAttribute('aria-pressed','true');
});
test('a product without any accepted surface cannot upload',async({page})=>{
 const {requests}=await mockStore(page);
 await page.goto(entry+'?product=DEMO-P102&variant=DEMO-V102-R');
 await expect(page.locator('main section[role=status]')).toContainText('Bu ürün için onaylı yüzey henüz hazır değil.');
 await expect(page.locator('main')).toHaveAttribute('data-product-reference','DEMO-P102');
 await expect(page.locator('input[type=file],canvas')).toHaveCount(0);
 expect(requests.filter(r=>r.path.includes('/generation'))).toHaveLength(0);
});
test('surface error can be retried; the selected file survives the type switch and the step change',async({page})=>{
 await mockStore(page);let failing=true;
 await page.route('**/rendering-inputs',route=>failing?route.fulfill({status:503}):route.fallback());
 await page.goto(entry+'?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);
 await expect(page.getByRole('button',{name:'Önizlemeyi yeniden yükle'})).toBeVisible();failing=false;
 await page.getByRole('button',{name:'Önizlemeyi yeniden yükle'}).click();
 await page.getByLabel('Dosya seç',{exact:true}).setInputFiles('public/assets/personalization/sample-pattern.png');
 await expect(page.getByRole('button',{name:'Görseli kaldır',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Desen',exact:true}).click();
 await expect(page.getByRole('button',{name:'Deseni kaldır',exact:true})).toBeVisible();await expect(page).toHaveURL(/mode=pattern/);
 await openPlacement(page);await expect(page.getByRole('heading',{name:'Tasarımını yerleştir'})).toBeVisible();
 await page.getByRole('link',{name:'Değiştir',exact:true}).click();
 await expect(page.getByRole('button',{name:'Deseni kaldır',exact:true})).toBeVisible();
});
test('placement step undoes, zooms and resets the placement',async({page})=>{
 await mockStore(page);
 await page.goto(entry+'?product=DEMO-P101&variant=DEMO-V101-B');await closeConsent(page);
 await page.getByRole('button',{name:'Örnek görselle dene'}).click();
 await openPlacement(page);
 const x=page.locator('#pattern-x');await expect(x).toHaveValue('533');await expect(page.getByRole('button',{name:'Geri al'})).toBeDisabled();
 await x.fill('600');await expect(page.getByText('+6 %',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Geri al'}).click();await expect(x).toHaveValue('533');
 await page.getByRole('button',{name:'Yinele'}).click();await expect(x).toHaveValue('600');
 await page.getByRole('button',{name:'Ortala'}).click();await expect(x).toHaveValue('533');
 await page.getByRole('button',{name:'Yakınlaştır'}).click();await expect(page.getByText('125%',{exact:true})).toBeVisible();
 await page.getByLabel('Baskı alanını göster').uncheck();await page.locator('#pattern-scale').fill('1.5');
 await page.getByRole('button',{name:'Sıfırla'}).click();await expect(page.locator('#pattern-scale')).toHaveValue('1');
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
});
test('missing identity and ineligible products cannot upload',async({page})=>{
 const {state}=await mockStore(page);
 await page.goto(entry);await expect(page.locator('main section[role=status]')).toContainText('önce bir ürün seçin');
 const product=state.products[0];product.personalizable=false;
 await page.goto(entry+'?product='+product.id+'&variant='+product.variants[0].id);
 await expect(page.getByRole('alert').filter({hasText:'Bu ürün kişiselleştirme programında değil.'})).toBeVisible();
 await expect(page.locator('input[type=file],canvas')).toHaveCount(0);
});
