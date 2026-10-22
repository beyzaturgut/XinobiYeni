import {test,expect} from '@playwright/test';
import {mockStore,closeConsent} from './fixtures';

test('category URL, cart unit badge and explicit comparison selection',async({page})=>{
 const {state}=await mockStore(page);
 const template=state.products[0];
 for(let i=0;i<10;i++)state.products.push({...template,id:'UX-'+i,name:'UX Test '+i,category:i%2?'Kahve makineleri':'Çay makineleri'});
 await page.goto('/urunler');await closeConsent(page);
 await expect(page.getByRole('navigation',{name:'Mobil menü',includeHidden:true})).toBeAttached();
 await page.locator('#catalog').getByRole('button',{name:'Kahve',exact:true}).click();
 await expect(page).toHaveURL(/category=/);
 await expect(page.locator('#catalog').getByRole('button',{name:'Kahve',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('#catalog').getByRole('button',{name:'Çay',exact:true}).click();
 await expect(page.locator('#catalog').getByRole('button',{name:'Çay',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.goBack({waitUntil:'domcontentloaded'});
 await expect(page.locator('#catalog').getByRole('button',{name:'Kahve',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.evaluate(()=>{localStorage.setItem('xinobi-cart-v1',JSON.stringify([{productId:'P',variantId:'V',quantity:2},{productId:'Q',variantId:'W',quantity:1}]));window.dispatchEvent(new Event('xinobi-cart-changed'))});
 await expect(page.getByRole('link',{name:'Sepet, 3 ürün',exact:true})).toBeVisible();
 await page.goto('/karsilastir?view=select');
 const picker=page.getByRole('region',{name:'Karşılaştırılacak ürünleri seç'});
 await expect(picker.getByRole('button',{name:/UX Test/})).toHaveCount(10);
 const buttons=picker.getByRole('button',{name:/UX Test/});
 for(let i=0;i<4;i++)await buttons.nth(i).click();
 await expect(page.getByRole('region',{name:'Seçilen ürünlerin karşılaştırma tablosu'})).toHaveCount(0);
 await buttons.nth(4).click();await expect(picker.getByRole('status')).toContainText('En fazla 4');
 await picker.getByRole('searchbox',{name:'Ürün ara'}).fill('UX Test 9');await expect(picker.getByRole('button',{name:/UX Test/})).toHaveCount(1);
 await picker.getByRole('button',{name:'Seçilen ürünleri karşılaştır (4)'}).click();
 await expect(page.getByRole('region',{name:'Seçilen ürünlerin karşılaştırma tablosu'})).toBeVisible();
 await page.getByRole('button',{name:'Seçimleri düzenle / Bir ürün daha ekle'}).click();
 await picker.getByRole('searchbox',{name:'Ürün ara'}).fill('');
 await expect(picker.getByRole('button',{pressed:true})).toHaveCount(4);
});

test('review service error remains visible and can be retried',async({page})=>{
 const {state}=await mockStore(page);let failed=true;
 await page.route('**/api/v1/catalog/products/*/reviews**',route=>failed?route.fulfill({status:503,json:{title:'Synthetic unavailable'}}):route.fulfill({json:{summary:{count:0,average:0,distribution:[0,0,0,0,0]},items:[],page:1,pageSize:10}}));
 await page.goto('/urunler/detay?id='+state.products[0].id);await closeConsent(page);
 await expect(page.getByRole('heading',{name:'Müşteri değerlendirmeleri'})).toBeVisible();
 await expect(page.getByText('Değerlendirmeler şu anda yüklenemedi.')).toBeVisible();failed=false;
 await page.getByRole('button',{name:'Değerlendirmeleri yeniden yükle'}).click();
 await expect(page.getByText('Bu ürün için henüz yayınlanmış değerlendirme yok.')).toBeVisible();
 await expect(page.getByRole('link',{name:'Sepetim →',exact:true})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Karşılaştırmayı aç →',exact:true})).toHaveCount(0);
});
