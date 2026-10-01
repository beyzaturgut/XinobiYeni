# Xinobi web bileşen sözleşmesi

Sürüm: `0.1.0`  
Tarih: 01.10.2026  
Kapsam: Faz02 müşteri web prototipi (WEB-001–020)  
Durum: **Web uygulamasıyla eşlendi; panel ve Flutter genişletmesi açık**

Bu belge, çalışan web ekranlarındaki bileşenlerin görünüm, durum, semantik, klavye ve veri sınırlarını tanımlar. Kaynak değerler `design/tokens.json`, ekran eşlemesi `design/screen-inventory.md`, otomatik kanıtlar `test/INDEX.md` içindedir. Buradaki demo davranışı gerçek API veya müşteri iş kuralı değildir.

## 1. Temel kurallar

- Ana metin `color.ink`, yardımcı metin WCAG AA taramasından geçen `color.muted`, yüzey `color.surface`, sayfa zemini `color.canvas` kullanır.
- `color.line` yalnız sınır/bölücü içindir; metin rengi değildir.
- Teal marka/eylem rengi yalnız yeterli kontrast sağlanan zeminde kullanılır. Koyu zeminde açık `#8CD5CD` vurgu tercih edilir.
- Tüm etkileşimli öğeler doğal `button`, `a`, `input`, `select` veya `textarea` semantiği taşır.
- Genel `:focus-visible`, 3 px `color.focus` dış çizgi ve 3 px offset kullanır; odak yalnız renk/gölge ile anlatılmaz.
- `prefers-reduced-motion: reduce` durumunda animasyon ve geçişler yaklaşık sıfıra indirilir; içerik veya işlev kaybolmaz.
- Gerçek veri yoksa kesin fiyat, stok, termin, indirim, ödeme sonucu veya baskı uygunluğu gösterilmez. Eylem kapalıysa nedeni görünür metin ve gerektiğinde `aria-describedby` ile bağlanır.

## 2. Boyut ve responsive sözleşmesi

| Alan | Sözleşme |
|---|---|
| İçerik genişliği | En fazla 1440 px; sayfaya göre 1100–1500 px kontrollü varyasyon olabilir |
| Yatay boşluk | Masaüstünde 48 px temel; dar ekranda 18–20 px |
| Kırılımlar | İçerik taşmasına göre yaklaşık 1050/900/850/760/700/600/500/460 px |
| Dokunma hedefi | Birincil kontroller en az 44–48 px; küçük yardımcı kontroller gerçek cihaz QA'da ayrıca ölçülecek |
| Dar ekran | Çok kolon tek kolona döner; yatay tablo/sekme gerekirse kontrollü kaydırılır; kritik eylem gizlenmez |
| Mobil header | `data-mobile-three-column`: logo / esnek başlık / geri-kapat eylemi |

390 px fiziksel cihaz, tablet ve ekran okuyucu doğrulaması F02-A01/A02 olarak açıktır.

## 3. Eylem bileşenleri

### 3.1 Birincil düğme

- Kullanım: demo özeti/taslağı hazırlama, form içi ana eylem.
- Varsayılan: teal veya koyu zemin, yüksek kontrastlı beyaz metin.
- Hover: `color.tealHover`; klavye karşılığı Enter/Space.
- Focus: global görünür odak halkası.
- Disabled: gerçek iş bağımlılığı eksikse `disabled`; soluk görünüm yanında açıklayıcı metin zorunlu.
- Busy: web prototipinde uygulanmadı; gerçek API aşamasında `aria-busy`, tekrar tıklama koruması ve durum metni gerekir.
- Error: yalnız renk kullanılmaz; hata özeti, alan mesajı ve ilk hataya odak gerekir.

### 3.2 İkincil düğme ve metin bağlantısı

- İkincil düğme sınır çizgili/şeffaf olabilir; birincil eylemle görsel hiyerarşiyi paylaşmaz.
- Sayfa/rota geçişi her zaman `a`/`Link`; yalnız yerel durum değiştiren eylem `button` olur.
- Hazır olmayan rota, çalışan bağlantı gibi gösterilmez; `disabled` düğme ve “Hazırlanıyor” açıklaması kullanılır.

### 3.3 Simge düğmesi

- Görsel simge `aria-hidden="true"`; düğme anlamı görünür metin veya `aria-label` taşır.
- Favori, varyant, katman görünürlük/kilit, geri/ileri ve kapatma kontrolleri bu sözleşmeye uyar.
- Durum seçimi `aria-pressed`; simgenin değişmesi tek durum göstergesi değildir.

## 4. Form bileşenleri

### 4.1 Metin alanı, textarea ve select

- Her alan görünür `label` veya `htmlFor/id` ilişkisi taşır.
- Tarayıcı otomatik doldurma anlamlı alanlarda `autocomplete` ile belirtilir.
- Karakter limiti hem `maxLength`/kod sınırı hem görünür sayaçla gösterilir.
- Yardım ve hata metni `aria-describedby` ile ilişkilendirilir.
- Boş/geçersiz alan nedeniyle eylem kapalıysa koşul görünür kalır; gerçek API doğrulaması eklenince alan bazlı ve form özeti birlikte kullanılacaktır.

### 4.2 Checkbox ve radio

- Etiketin tamamı tıklanabilir alan oluşturur.
- Seçili durum native `checked` ile; görsel kart sınırı yalnız destekleyici işaret olarak kullanılır.
- Zorunlu fakat değiştirilemez tercih `checked disabled`; nedeni aynı panelde açıklanır.
- Gerçek rıza D10 metni ve sürümü gelmeden sunucuya kaydedilmiş sayılmaz.

### 4.3 Sekme ve seçim grubu

- Hesap giriş/yeni hesap kontrolü `tablist` / `tab` / `aria-selected` kullanır.
- Varyant, senaryo, revizyon, tema, palet ve ürün yüzü seçimleri `aria-pressed` düğme grubudur.
- Seçim sonucu canlı içerik değişiyorsa uygun kapsayıcı `aria-live="polite"` taşır.
- Ok tuşlu tam ARIA tab davranışı henüz uygulanmadı; F02 klavye genişletme listesinde kalır. Mevcut kontroller Tab + Enter/Space ile kullanılabilir.

## 5. Geri bildirim ve durum bileşenleri

| Bileşen | Semantik/davranış | Durumlar |
|---|---|---|
| Demo bilgi kutusu | İşlemin kalıcı/gerçek olmadığını eylemden önce açıklar | info, güvenlik sınırı |
| Canlı durum metni | `aria-live="polite"`; kullanıcı eylemi sonrası kısa sonuç | hazırlandı, temizlendi, kaydedilmedi |
| Durum etiketi | Metin + renk; renk tek başına anlam taşımaz | hazırlanıyor, kargoda, revizyon bekliyor |
| Ödeme sonucu kartı | Başlık, açıklama, ikon ve sonraki eylem birlikte değişir | pending, failed, success |
| Boş durum | Başlık, neden ve güvenli çıkış/temizleme eylemi | favori, sepet, arama, AI |
| Hata durumu | Açık başlık/açıklama ve geri dön/yeniden dene yolu | AI demo hatası; gerçek kodlar D05/D08 sonrası |
| Disabled işlem | Native `disabled` + görünür gerekçe | ödeme, sipariş, PDF, destek devri, dosya |

Toast bileşeni kullanılmaz; kritik bilgi ekrandan kendiliğinden kaybolmaz.

## 6. İçerik ve alışveriş bileşenleri

### 6.1 Header, footer ve navigasyon

- Sayfa başlangıcında görünür olduğunda semantik `header`; menüler adlandırılmış `nav` kullanır.
- Ana içerik için skip-link hedefi bulunur.
- Mobilde görünmeyen masaüstü menünün karşılığı `details/summary` veya sayfaya özgü üç kolon header ile sağlanır.
- İç anchor ve dahili rota hedefleri Playwright navigasyon smoke testinde doğrulanır.

### 6.2 Ürün/kategori kartı

- Ürün adı başlık, aile yardımcı metin, varyant adı yazılı metin ve swatch birlikte gösterilir.
- Görsel alt metni ürün + renk içerir; dekoratif kategori görseli boş alt kullanabilir.
- Fiyat/stok D02 gelmeden “yakında/bekleniyor” durumudur.
- Favori düğmesi ürün ve varyantı erişilebilir adında taşır; tarayıcı demo saklaması gerçek hesap kaydı değildir.

### 6.3 Varyant seçici

- Her seçenek metin etiketi, renk örneği ve `aria-pressed` taşır.
- Seçim ürün görseli ve legend metnini birlikte günceller.
- Gelecekte aynı `variantId` editör, sepet ve siparişe taşınmalıdır; mevcut prototip bunu gerçek API ile kanıtlamaz.
- Stok yoksa sepete ekleme kapalı ve gerekçe görünür olmalıdır.

### 6.4 Sepet satırı ve adet kontrolü

- Adet kontrolü adlandırılmış `group`; azalt/artır düğmeleri ayrı erişilebilir ad taşır.
- Güncel adet `output aria-live="polite"` ile açıklanır.
- 1 adette azaltma ürünü kaldırır; üst sınır 9 olduğunda artırma kapanır.
- Sunucu fiyat/stok otoritesi D02/D03 sonrası uygulanacaktır.

### 6.5 Liste–detay, timeline ve adım göstergesi

- Sipariş/teklif listesi seçimi `aria-pressed`; detay başlığı seçili kaydı taşır.
- Timeline sıralı `ol`; tamamlanan/aktif durum metin ve işaretle birlikte görünür.
- Checkout adımları yalnız mevcut prototip durumunu gösterir; gerçek yönlendirme ve doğrulama Faz05 işidir.

## 7. Özel bileşenler

### 7.1 Basit kişiselleştirme

- Metin en fazla 24 karakter; boş metinde taslak eylemi kapanır.
- Stil ve renk seçenekleri `aria-pressed`; önizleme `aria-live` ile güncellenir.
- Fiziksel baskı alanı/ölçüsü gösterilmez; D04 kapanmadan sipariş aktarımı kapalıdır.

### 7.2 Gelişmiş editör

- Araçlar doğal düğme; medya/şablon gibi hazır olmayanlar native `disabled`.
- Katman seçimi, görünürlük ve kilit kontrolleri erişilebilir ada sahiptir.
- Ön/arka yüz `aria-pressed` grubu; durum çubuğu `aria-live`.
- Undo/redo, gerçek koordinat, baskı alanı, geçmiş ve kalıcı kayıt F02-A05/D04/Faz06 kapsamındadır.

### 7.3 AI tasarım ve satış asistanı

- İstem minimum 10, maksimum 500 karakter; alternatif seçimi `aria-pressed`.
- Boş, hazır ve hata durumları aynı sonuç bölgesinde açıklanır.
- Asistan sabit demo önerileri ve oturum içi mesaj gösterir; gerçek sağlayıcıya veri göndermez.
- Limit, içerik reddi, retry, maliyet ve insan devri D05/D08/D10 sonrasında tamamlanacaktır.

### 7.4 Çerez tercih paneli

- Panel adlandırılmış `aside`, tercih kategorileri `fieldset/legend` yapısındadır.
- Zorunlu kategori değiştirilemez; analitik/pazarlama varsayılan kapalıdır.
- Mevcut seçim yalnız prototip oturumudur; CMP, kanıt ve kalıcı rıza D10/Faz04–05 işidir.

## 8. Dosya ve medya yükleme

- Mevcut upload alanları bilinçli olarak disabled durumdadır.
- Gerçek açılışta izinli MIME/uzantı, boyut, virüs taraması, erişim kontrolü, saklama ve silme politikası birlikte uygulanmalıdır.
- Dosya adı tek başına güvenilmez; hata/ilerleme/başarı metinsel olarak bildirilir.

## 9. Test ve kabul eşlemesi

| Kanıt | Kapsam |
|---|---|
| TST-043–046 | Masaüstü/500 px Chrome görsel QA |
| TST-047–049 | İlk 13 kritik etkileşim ve klavye |
| TST-050 | 20 rota axe WCAG A/AA, odak ve kontrast |
| TST-051 | Katalog, varyant, favori, ödeme, basit kişiselleştirme |
| TST-052 | Ana/Xinobi/yasal iç hedef ve rota navigasyonu |

Otomatik final regresyon: 43/43 Playwright testi. Açık gerçek cihaz, ekran okuyucu, panel, Flutter ve gerçek iş/API kabulü `design/faz02-open-acceptance.md` içinde izlenir.

## 10. Değişiklik yönetimi

- Yeni bir durum veya varyant eklenirse bu belge, `screen-inventory.md`, ilgili test ve `CHANGELOG.md` aynı değişiklikte güncellenir.
- API alanı kesinleşince demo metni sessizce gerçek veri sayılmaz; sözleşme ID'si ve hata/boş/loading durumları eklenir.
- Ortak bileşen paketi çıkarılana kadar modül CSS tekrarları teknik borçtur; görsel davranış bu sözleşmeyle korunur.
- Panel ve Flutter bileşenleri bu sözleşmeyi temel alabilir ancak platform davranışları ayrıca belgelenmeden “eş” kabul edilmez.
