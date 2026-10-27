import {expect,test} from '@playwright/test';
import {closeConsent,mockStore,checkCartTotal} from './fixtures';

test('çerez tercih paneli kapatılır, yeniden açılır ve kategoriler gösterilir',async({page})=>{
 await mockStore(page);await page.goto('/');await closeConsent(page);
 await page.getByRole('button',{name:'Çerez tercihleri',exact:true}).click();
 await page.getByRole('button',{name:'Ayarları yönet'}).click();
 await expect(page.getByRole('group',{name:'Tercih kategorileri'})).toBeVisible();
 await expect(page.getByLabel('Zorunlu')).toBeChecked();await page.getByLabel('Analitik').check();
 await page.getByRole('button',{name:'Tercihi uygula'}).click();
 await expect(page.getByText(/yalnızca bu prototip ekranında gösterildi/)).toBeVisible();
});

test('arama Escape ile temizlenir ve karşılaştırma dört ürünle sınırlanır',async({page})=>{
 const {state}=await mockStore(page);await page.goto('/arama/');await closeConsent(page);
 const search=page.getByRole('searchbox',{name:'Ürün, kategori veya özellik ara'});
 await search.fill('kahve');await expect(page.getByRole('heading',{name:/kahve.*2 sonuç/i})).toBeVisible();
 await search.press('Escape');await expect(search).toHaveValue('');
 for(const product of state.products.slice(0,4))await page.getByRole('article').filter({has:page.getByRole('heading',{name:product.name,exact:true})}).getByRole('button',{name:'Karşılaştır',exact:true}).click();
 await expect(page.getByRole('button',{name:'En fazla 4 ürün'})).toHaveCount(2);
 await expect(page.getByRole('button',{name:'En fazla 4 ürün'}).first()).toBeDisabled();
 await page.goto('/karsilastir/');await page.getByRole('button',{name:'Seçilen ürünleri karşılaştır (4)'}).click();await expect(page.getByRole('checkbox',{name:'Yalnız farkları göster'})).toBeVisible();
});

test('ödeme sonucunda oturumsuz kullanıcıya sipariş gösterilmez',async({page})=>{
 await mockStore(page);await page.goto('/odeme/sonuc/?siparis=unknown');await closeConsent(page);
 await expect(page.getByRole('heading',{name:'Gösterilecek sipariş yok'})).toBeVisible();
 await expect(page.getByText(/ödeme alınmadı/)).toBeVisible();
});

test('sepet adedi değişir, yenilemede korunur ve ürün kaldırılır',async({page})=>{
 await mockStore(page,{cart:true});await page.goto('/sepet/');await closeConsent(page);
 await page.getByRole('button',{name:/adedini artır/}).click();await checkCartTotal(page,2);
 await page.reload();await checkCartTotal(page,2);
 await page.getByRole('button',{name:'Sepetten çıkar'}).click();
 await expect(page.getByRole('heading',{name:'Sepetin şu an boş.'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Önce sepeti kontrol et'})).toBeDisabled();
});

test('hesap profili ve adres kaydı güncel sunucu sözleşmesine gönderilir',async({page})=>{
 const {requests}=await mockStore(page,{signedIn:true});await page.goto('/hesap/');await closeConsent(page);
 await page.getByLabel('Ad soyad',{exact:true}).fill('Yeni Kullanıcı');
 await page.getByRole('button',{name:'Kaydet',exact:true}).click();
 await expect.poll(()=>requests.find(r=>r.path==='/me'&&r.method==='PATCH')?.body.name).toBe('Yeni Kullanıcı');
 await page.goto('/hesap/adresler/');await page.getByRole('button',{name:'Adres ekle'}).click();
 await page.getByLabel('Adres başlığı').fill('İş');await page.getByLabel('Telefon',{exact:true}).fill('05321234567');
 await page.getByLabel('İl',{exact:true}).fill('İstanbul');await page.getByLabel('İlçe',{exact:true}).fill('Kadıköy');await page.getByLabel('Açık adres').fill('Test adresi 2');
 await page.getByRole('button',{name:'Kaydet',exact:true}).click();
 await expect.poll(()=>requests.find(r=>r.path==='/me/addresses'&&r.method==='POST')?.body.title).toBe('İş');
 await expect(page.getByText('İş',{exact:true})).toBeVisible();
});

test('kurumsal teklif ürün, adet ve kişiselleştirme bilgisini gönderir',async({page})=>{
 const {requests}=await mockStore(page);await page.goto('/kurumsal/teklif/');await closeConsent(page);
 await page.getByLabel('Firma adı').fill('Test Firma');await page.getByLabel('Yetkili kişi').fill('Test Yetkili');await page.getByLabel('Kurumsal e-posta').fill('test@example.com');
 await page.getByRole('combobox',{name:'Ürün',exact:true}).selectOption('DEMO-P102');await page.getByLabel('Adet',{exact:true}).fill('50');await page.getByLabel('Kurumsal kişiselleştirme istiyorum').check();
 await page.getByLabel('Kişiselleştirme notu').fill('Tek renk logo');await page.getByRole('button',{name:'Teklif talebini gönder'}).click();
 await expect(page.getByRole('heading',{name:'Talebin alındı.'})).toBeVisible();
 const sent=requests.find(r=>r.path==='/quotes')!;expect(sent.body.items).toEqual([{productId:'DEMO-P102',quantity:50}]);expect(sent.body.personalization).toBe(true);
});

test('eski AI tasarım adresi güncel ürün seçimine yönlendirir',async({page})=>{
 const {requests}=await mockStore(page);await page.goto('/studio/ai/');await closeConsent(page);
 await page.getByRole('link',{name:'Kişiselleştirilebilir ürünleri keşfet →'}).click();
 await expect(page).toHaveURL(/\/xinobi-u\/?$/);expect(requests.filter(r=>r.path.includes('design-studio'))).toEqual([]);
});

test('Nobi mesaj yanıtını gösterir ve yeni konuşma başlatır',async({page})=>{
 const {requests}=await mockStore(page);await page.goto('/asistan/');await closeConsent(page);
 await page.getByRole('button',{name:'Kahve seçenekleri'}).click();
 await expect(page.getByText('Kahve Makinesi 101 seçeneklerini inceleyebilirsin.')).toBeVisible();
 await page.getByLabel('Nobi’ye mesajın').fill('Ofis için seçenek arıyorum');await page.getByRole('button',{name:'Mesajı gönder'}).click();
 await expect.poll(()=>requests.filter(r=>r.path==='/assistant/messages').length).toBe(2);
 await page.getByRole('button',{name:'Yeni konuşma',exact:true}).click();
 await expect(page.getByRole('button',{name:'Kahve seçenekleri'})).toBeVisible();
});

test('üyelik modları, parola görünürlüğü ve e-posta doğrulaması çalışır',async({page})=>{
 const {requests}=await mockStore(page);await page.goto('/hesap/');await closeConsent(page);await page.getByRole('button',{name:'Giriş yap',exact:true}).click();
 await page.getByRole('button',{name:'Yeni hesap',exact:true}).click();await expect(page.getByRole('heading',{name:'Hesap oluştur',exact:true})).toBeVisible();
 await page.getByLabel('Ad soyad').fill('Test Kullanıcı');await page.getByLabel('E-posta adresi').fill('test@example.com');const password=page.getByLabel('Parola',{exact:true});await password.fill('test-parola-123');
 await page.getByRole('button',{name:'Parolayı göster'}).click();await expect(password).toHaveAttribute('type','text');
 await page.getByRole('button',{name:'Doğrulama kodu gönder'}).click();await expect(page.getByRole('heading',{name:'E-postanı doğrula'})).toBeVisible();
 await page.getByLabel('Doğrulama kodu').fill('123456');await page.getByRole('button',{name:'E-postayı doğrula ve hesabı oluştur'}).click();
 await expect(page).toHaveURL(/\/hesap\/?$/);expect(requests.find(r=>r.path==='/auth/web/register')?.body.verificationCode).toBe('123456');
});

test('parolamı unuttum kodla yeni parola belirler ve girişe döner',async({page})=>{
 const {requests}=await mockStore(page);await page.goto('/hesap/');await closeConsent(page);await page.getByRole('button',{name:'Giriş yap',exact:true}).click();
 await page.getByRole('button',{name:'Parolamı unuttum'}).click();await expect(page.getByRole('heading',{name:'Parolanı sıfırla'})).toBeVisible();
 await page.getByLabel('E-posta adresi').fill('Test@Example.com');await page.getByRole('button',{name:'Sıfırlama kodu gönder'}).click();
 await expect(page.getByText('654321')).toBeVisible();
 await page.getByLabel('Sıfırlama kodu').fill('111111');await page.getByLabel('Yeni parola').fill('yeni-parola-123');await page.getByRole('button',{name:'Parolayı değiştir'}).click();
 await expect(page.getByText('Doğrulama kodu hatalı.')).toBeVisible();
 await page.getByLabel('Sıfırlama kodu').fill('654321');await page.getByRole('button',{name:'Parolayı değiştir'}).click();
 await expect(page.getByRole('heading',{name:'Giriş yap',exact:true})).toBeVisible();await expect(page.getByRole('status')).toContainText('Parolan değiştirildi');
 expect(requests.find(r=>r.path==='/auth/password-reset')?.body.email).toBe('test@example.com');
 expect(requests.filter(r=>r.path==='/auth/password-reset/confirm').at(-1)?.body).toEqual({email:'test@example.com',verificationId:'test-reset',verificationCode:'654321',newPassword:'yeni-parola-123'});
});

test('sipariş takibi teslimat adımlarını ve takip numarasını gösterir',async({page})=>{
 await mockStore(page,{signedIn:true});await page.goto('/hesap/siparisler/');await closeConsent(page);
 await expect(page.getByRole('heading',{name:'TEST-ORDER-1'})).toBeVisible();await expect(page.getByText('TEST123',{exact:true})).toBeVisible();
 await expect(page.getByRole('list',{name:'Sipariş durumu'}).locator('[aria-current=step]')).toContainText('Teslim edildi');
});

test('teslim edilmiş sipariş için seçilen adetle iade talebi gönderilir',async({page})=>{
 const {requests}=await mockStore(page,{signedIn:true});await page.goto('/hesap/siparisler/iade/?siparis=test-order');await closeConsent(page);
 await page.getByRole('checkbox').check();await page.getByLabel('Çay Makinesi 101 iade adedi').selectOption('2');await page.getByRole('combobox',{name:'Neden',exact:true}).selectOption('Ürün hasarlı');
 await page.getByRole('button',{name:'İade talebini gönder'}).click();await expect(page.getByRole('heading',{name:'Talebin alındı.'})).toBeVisible();
 expect(requests.find(r=>r.path.endsWith('/returns'))?.body.lines).toEqual([{variantId:'DEMO-V101-B',quantity:2}]);
});

test('teklif takibinde mesaj ve kabul kararı güncellenir',async({page})=>{
 const {requests}=await mockStore(page);await page.goto('/kurumsal/teklif/takip/?kod=Q-TEST-1&eposta=test@example.com');await closeConsent(page);
 await page.getByLabel('Mesajınız').fill('Termin bilgisini paylaşır mısınız?');await page.getByRole('button',{name:'Mesaj gönder'}).click();
 await expect(page.getByText('Termin bilgisini paylaşır mısınız?',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Teklifi kabul et'}).click();await expect(page.getByRole('heading',{name:'Kabul edildi',exact:true})).toBeVisible();
 expect(requests.find(r=>r.path.endsWith('/decision'))?.body.decision).toBe('accept');
});

test('reference preview keeps placement but removes retired demo controls',async({page})=>{
 await mockStore(page);await page.goto('/urunler/cay-makinesi-101/editor/');await closeConsent(page);
 const canvas=page.locator('canvas[role=img]');await expect(canvas).toBeVisible();
 await expect(page.getByRole('button',{name:'Metin',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Arka yüz',exact:true})).toHaveCount(0);
 const original=await canvas.evaluate((node:HTMLCanvasElement)=>node.toDataURL());
 await page.locator('#pattern-scale').fill('1.5');await expect.poll(()=>canvas.evaluate((node:HTMLCanvasElement)=>node.toDataURL())).not.toBe(original);
});

test('katalog kategori, arama, sıralama ve filtre temizleme akışını çalıştırır',async({page})=>{
 await mockStore(page);await page.goto('/urunler/');await closeConsent(page);
 await page.getByRole('button',{name:'Kahve',exact:true}).click();await expect(page.getByText('2 ürün',{exact:true})).toBeVisible();
 await page.getByLabel('Ürünlerde ara').fill('102');await expect(page.getByText('1 ürün',{exact:true})).toBeVisible();await page.getByLabel('Sırala').selectOption('name');
 await page.getByLabel('Ürünlerde ara').fill('bulunmayan ürün');await expect(page.getByRole('heading',{name:'Aradığınız ürün bulunamadı.'})).toBeVisible();
 await page.getByRole('button',{name:'Filtreleri temizle'}).click();await expect(page.getByText('6 ürün',{exact:true})).toBeVisible();
});

test('ürün detayında renk varyantı, görsel ve seçili durum değişir',async({page})=>{
 await mockStore(page);await page.goto('/urunler/detay/?id=DEMO-P101');await closeConsent(page);
 const red=page.getByRole('button',{name:'Kırmızı rengini seç'});await red.click();await expect(red).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('group',{name:'Renk: Kırmızı'})).toBeVisible();await expect(page.getByRole('img',{name:/Çay Makinesi 101, Kırmızı/})).toBeVisible();
 await expect(page.getByRole('button',{name:'Sepete ekle',exact:true})).toBeEnabled();
 await expect(page.getByRole('link',{name:/XINOBI U ile kişiselleştir/})).toHaveAttribute('href',/product=DEMO-P101&variant=DEMO-V101-R/);
});

test('katalog favorisi hesap listesine taşınır ve listeden kaldırılır',async({page})=>{
 await mockStore(page,{signedIn:true});await page.goto('/urunler/');await closeConsent(page);
 await page.getByRole('button',{name:/^Çay Makinesi 101 .*ürününü favorilere ekle$/}).click();await page.goto('/favoriler/');
 await expect(page.getByText('1 favori ürün',{exact:true})).toBeVisible();await page.getByRole('button',{name:/^Çay Makinesi 101 .*ürününü favorilerden çıkar$/}).click();
 await expect(page.getByRole('heading',{name:'Favori listeniz henüz boş.'})).toBeVisible();
});

test('deneme ödeme reddedilince sipariş oluşmaz; tekrarında sipariş kaydedilir',async({page})=>{
 const {requests}=await mockStore(page,{signedIn:true,cart:true});await page.goto('/odeme/');await closeConsent(page);
 await page.getByLabel('Başarısız ödeme',{exact:true}).check();await page.getByRole('button',{name:'Ödemeyi tamamla'}).click();await expect(page.getByRole('alert').filter({hasText:'Ödeme reddedildi'})).toBeVisible();
 expect(requests.filter(r=>r.path==='/me/orders'&&r.method==='POST')).toEqual([]);
 await page.getByLabel('Başarılı ödeme',{exact:true}).check();await page.getByRole('button',{name:'Ödemeyi tamamla'}).click();await expect(page.getByRole('heading',{name:'Siparişin oluşturuldu'})).toBeVisible();
 expect(requests.find(r=>r.path==='/me/orders'&&r.method==='POST')?.body.addressId).toBe('test-address');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('xinobi-cart-v1')!))).toEqual([]);
});

// The fixed Tea Maker demo pages were retired (2bb0b6d); old bookmarks must lead to the live XINOBI U flow, never a preview.
test('kaldırılan demo ürün ve kişiselleştirme adresleri güncel ürünlere yönlendirir',async({page})=>{
 const {requests}=await mockStore(page);
 for(const [route,target] of [['/urunler/cay-makinesi-101/','/urunler'],['/urunler/cay-makinesi-101/kisisellestir/?product=DEMO-P101&variant=DEMO-V101-B','/xinobi-u']]){
  await page.goto(route);await expect(page.getByRole('status')).toContainText('Bu örnek ürün artık katalogda yer almıyor.');
  await expect(page.locator('main').getByRole('link').first()).toHaveAttribute('href',new RegExp('^'+target+'/?$'));await expect(page.locator('canvas[role=img]')).toHaveCount(0);
 }
 expect(requests.filter(r=>r.path.includes('design-studio'))).toEqual([]);
});
