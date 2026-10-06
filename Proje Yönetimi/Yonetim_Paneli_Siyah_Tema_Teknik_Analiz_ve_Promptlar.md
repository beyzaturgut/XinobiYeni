# Yönetim Paneli — Siyah Tema Teknik Analizi ve Uygulama Promptları

**Tarih:** 2 Ekim 2026  
**Referans:** `yönetim paneli örnek,.zip` içindeki 61 PNG ekran görüntüsü  
**Hedef:** Referans panelin yerleşimini ve bileşen dilini başka bir projeye taşımak; arayüzdeki yeşil/petrol yeşili alanları siyah ve nötr gri tonlarıyla değiştirmek.  
**Teslim türü:** Teknik analiz, görsel uygulama şartnamesi, kapsam ve doğrulama planı, doğrudan kullanılabilir geliştirme promptları.

## 1. Analizin dayanağı ve sınırları

Arşivde 61 adet, her biri **2560 × 1664 piksel** ekran görüntüsü bulunuyor. Uygulama kaynak kodu, CSS, veritabanı şeması, API tanımı veya çalıştırılabilir proje bulunmuyor. Görsellerin tamamı incelendi; temel yerleşim, ürün formu, kampanya formu ve rapor ekranları ayrıca büyük ölçekte kontrol edildi.

Bu nedenle bu belge bir **ekranlardan çıkarılmış arayüz ve işlev analizi**dir. Kaynak uygulamanın React, Vue, Angular, jQuery, PHP, .NET, belirli bir veritabanı veya belirli bir bileşen kütüphanesi kullandığı söylenemez. Görünen editör veya grafik görünümü de kullanılan paketi kesinleştirmez.

Belgedeki ifadeler üç gruba ayrılır:

- **Gözlem:** Görselde doğrudan görülen başlık, alan, düzen veya açıklama.
- **Uygulama kararı:** Yeni projede referansı yeniden üretmek için önerilen davranış ve teknik çözüm.
- **Belirsizlik:** Görselde gösterilmediği için kaynak uygulama açısından doğrulanamayan bölüm.

**“Aynısı” tanımı:** Masaüstünde aynı bilgi hiyerarşisi, üst yatay menü, dar sol ikon şeridi, beyaz içerik alanı, kart düzeni, tablo yoğunluğu, sekmeler ve modal yapısı korunur. Yalnızca yeşil arayüz renkleri siyah/griye dönüşür; hedef projenin adı, logosu ve verileri kullanılır. Tüm sayfayı koyu temaya çevirmek, geniş bir sol menü tasarlamak veya kartları yeniden düzenlemek bu hedefe uygun değildir.

**Görsellerden çıkarılmaması gereken sonuçlar:** Açık olmayan menülerin tüm işlevlerinin çalıştığı, ekrandaki sayaçların canlı güncellendiği, kayıtların gerçekten kaydedildiği, ödeme/kargo bağlantılarının geçerli olduğu veya uygulamanın güvenli olduğu bu dosyalardan doğrulanamaz.

## 2. Kapsam kararı: tasarımı taşımak ile bütün sistemi taşımak

Asıl ihtiyaç başka projede aynı görsel yapıyı kullanmaktır. Bu nedenle iki teslim seviyesi ayrılmalıdır:

| Seviye | İçerik | Bu ihtiyaç için konumu |
| --- | --- | --- |
| A — Arayüz uyarlaması | Siyah tema, ortak kabuk, dashboard, tablo/form/modal/menü bileşenleri, hedef projenin ilgili ekranları | Temel kapsam |
| B — İşlevsel modüller | Sipariş, stok, kampanya, içerik, müşteri ve rapor işlemlerinin mevcut backend'e bağlanması | Hedef projede karşılığı varsa uygulanır |
| C — Yeni ticari entegrasyonlar | Yeni ödeme sağlayıcısı, pazaryeri, SMS, e-posta, ERP veya kargo entegrasyonu | Referansta görünmesi tek başına geliştirme talebi değildir |

Yalnızca bir ekran kullanılacaksa **dashboard ve ortak kabuk** ilk varsayılandır; bu belgenin tek ekran promptu kullanılabilir. Tüm panel taşınacaksa aşamalı promptlar sırayla uygulanır. Referansta bulunan bütün ticari modülleri sırf menüde görünüyor diye hedef projeye eklemek kapsamı gereksiz büyütür.

## 3. Genel tasarım analizi

### 3.1. Uygulama kabuğu

Görsellerdeki ortak yapı yukarıdan aşağıya şu şekildedir:

1. **İnce yardımcı üst şerit:** Solda “Döviz Kurları”; sağda “Hızlı Arama”, “JETCache”, “Siteyi Görüntüle”, “Yardım”.
2. **Ana yatay gezinme:** Solda marka logosu, ortada dokuz ana modül, sağda hızlı işlemler simgesi, bildirim zili ve kullanıcı alanı.
3. **Dar sol ikon şeridi:** Ana sayfa, mağaza ve başka işlevleri temsil eden çizgisel ikonlar. Metin etiketleri görünmüyor; tüm ikonların kesin hedefleri çıkarılamıyor.
4. **Beyaz ana içerik yüzeyi:** Sol üst köşesi yuvarlatılmış, ekranın kalan genişliğini kullanan alan.
5. **Sayfaya göre alt sekmeler:** Ürün yönetimi, sipariş durumları, kampanya alt modülleri veya rapor grupları.
6. **Çalışma alanı:** Filtre, arama, istatistik kartları, tablo veya form.
7. **Üst katmanlar:** Mega menü, işlemler menüsü, modal ve sağ bildirim çekmecesi.

Referansın karakterini oluşturan özellik, **üst yatay gezinme + dar sol ikon şeridi + geniş beyaz çalışma alanı** birleşimidir. Standart geniş sidebar kullanan bir hazır admin şablonu aynı tasarım değildir.

### 3.2. Yeniden üretimde ölçü yaklaşımı

2560 × 1664 dosya ölçüsü tarayıcı iç alanının CSS ölçüsü değildir. Görsellerde macOS menü çubuğu, Safari araç çubukları, sekmeler, Dock ve bazı karelerde sağ altta ekran görüntüsü küçük resmi vardır. Bunlar uygulamaya dahil edilmez. Tarayıcı yakınlaştırması ve cihaz piksel oranı bilinmiyor.

İlk ekranın dosya koordinatlarında uygulama yaklaşık y=272 civarında başlıyor, içerik alanı x=140 civarında başlıyor. Bunlar **görsel hizalama işaretleri**, CSS piksel değerleri değildir. Her ekranın uygulama alanı ayrı kırpılarak karşılaştırılmalıdır.

Aşağıdaki CSS değerleri ölçülmüş kaynak değerler değil, ilk uygulama için kalibrasyon başlangıcıdır:

| Öğe | Başlangıç aralığı | Korunacak özellik |
| --- | --- | --- |
| Yardımcı üst şerit | 30–36 px | Ana menüden daha kısa |
| Ana menü | 64–80 px | Logo, dokuz başlık ve sağ araçlar aynı satırda |
| Sol ikon şeridi | 64–72 px | Dar, metinsiz, beyaz çizgisel ikonlar |
| İçerik kenar boşluğu | 16–24 px | Yüksek bilgi yoğunluğu |
| Dashboard kolon boşluğu | 16–24 px | Üç eşit kolonlu ilk sıra |
| Kontrol yüksekliği | 32–38 px | Kompakt kurumsal form görünümü |
| Tablo satırı | 38–48 px | Birden fazla bilgi içeren hücrelerde esneyebilir |
| Küçük köşe yuvarlama | 4–6 px | Buton, input, etiket |
| Kart yuvarlama | 6–8 px | Hafif gölge ve ince sınır |
| Ana içerik sol üst köşesi | 12–16 px | Kabuktan ayrışma |
| Gövde yazısı | 13–14 px | Masaüstünde yoğun, okunabilir içerik |
| Kart/modal başlığı | 16–18 px | Aşırı büyük başlık kullanılmaz |

Font ailesi ekranlardan kesinleşmez. Hedef projede uygun mevcut sans-serif varsa korunur; yoksa sistem sans-serif kullanılır. Başlangıç değerleri ekran görüntüsü karşılaştırmasıyla ayarlanır.

### 3.3. Korunacak görsel dil

- Beyaz ve çok açık gri yüzeyler; ince gri çizgiler.
- Gri/laciverte yakın metin; ikincil metinde daha açık ton.
- Çizgisel ikonlar; kutucuk içindeki beyaz kart ikonları.
- Sıkışık olmayan ama yoğun tablo düzeni.
- Aktif sekmede beyaz yüzey ve hafif gölge.
- Birincil butonlarda ikon + kısa Türkçe metin.
- Açık mavi bilgi kutuları; kırmızı hata/pasif/iptal vurguları.
- Menüde çok sütunlu beyaz açılır paneller.
- Modal arkasında karartılmış sayfa; bildirim çekmecesi arkasında bulanıklık gözlemi.

## 4. Yeşilden siyaha dönüşüm şartnamesi

### 4.1. Referanstan alınan renk örnekleri

PNG'lerin uygulama alanındaki sık tekrarlanan piksel renkleri incelendi. Ana petrol yeşili **RGB(51,98,101) / #336265**, koyu üst şerit **RGB(38,74,77) / #264A4D** olarak örnekleniyor. Açık yeşil ürün sayacı yüzeyinde **#D3F4E6** görülüyor. Bunlar görüntü piksel örnekleridir; kaynak CSS değişkeni oldukları iddia edilmez.

### 4.2. Kesin hedef eşlemesi

| Referans öğesi | Siyah sürüm karşılığı |
| --- | --- |
| Ana petrol yeşili kabuk, ana menü, sol ikon şeridi | `#000000` |
| Koyu yeşil yardımcı üst şerit | `#111111` |
| Filtreleme Seçenekleri başlık şeridi | `#000000`, beyaz metin/ikon |
| Modal başlık şeridi | `#000000`, beyaz başlık/çarpı |
| Yeşil Kaydet / Yeni / Siparişi Oluştur butonları | Siyah zemin, beyaz metin |
| Yeşil Excel İşlemleri butonları | Siyah zemin, beyaz ikon/metin |
| Seçili tarih filtresi | Siyah zemin, beyaz metin |
| Ayarlarda seçili sol alt menü | Siyah zemin, beyaz metin |
| Dashboard kart başlığı ikon kutuları | Siyah zemin, beyaz ikon |
| Açık yeşil bilgi/KPI kartları | `#F3F4F6` yüzey, siyah değer, gri sınır |
| Yeşil Aktif / Teslim Edildi durum etiketleri | Açık gri yüzey, siyah metin + onay ikonu |
| Yeşil çizgi/ilerleme göstergesi | Siyah çizgi; ikincil seri gri ve kesikli |
| Yeşil link veya sayı | Siyah; linkte alt çizgi veya hover vurgusu |
| Yeşil seçim sınırı, toggle, checkbox | Siyah seçili durum; beyaz işaret |
| Yeşil gradient | Aynı doğrultuda gri–siyah geçiş; gerekirse düz siyah |

**Diğer renkler:** Kırmızı iptal/hata, sarı uyarı, mavi bilgi ve referanstaki mor durum rengi korunabilir. Kullanıcı tüm renkleri kaldırmayı istemedi. Arayüzün yeşil başarı durumları da yukarıdaki kurala göre nötrleştirilir; anlamı metin ve ikonla korunur.

**Resim istisnası:** Ürün fotoğrafı, yüklenen içerik ve üçüncü taraf marka logosu piksel piksel yeniden renklendirilmez. Renk dönüşümü arayüz bileşenleri içindir. Kaynak panelin logosu hedef proje logosuyla değiştirilir; hedef proje adı belirtilmediği için bu belge Xinobi veya başka bir markayı varsaymaz.

### 4.3. Önerilen tema tokenları

```css
/* Yalnızca yönetim paneli sınırı içinde uygulanır. */
.admin-theme-black {
  --admin-shell: #000000;
  --admin-utility: #111111;
  --admin-primary: #000000;
  --admin-primary-hover: #242424;
  --admin-primary-pressed: #3a3a3a;
  --admin-on-primary: #ffffff;
  --admin-canvas: #f6f8fa;
  --admin-surface: #ffffff;
  --admin-surface-muted: #f3f4f6;
  --admin-border: #e5e7eb;
  --admin-text: #111827;
  --admin-text-muted: #6b7280;
  --admin-success-bg: #f3f4f6;
  --admin-success-fg: #111111;
  --admin-overlay: rgb(0 0 0 / 50%);
  --admin-radius-control: 4px;
  --admin-radius-card: 8px;
}

.admin-theme-black .admin-primary-action {
  background: var(--admin-primary);
  color: var(--admin-on-primary);
}
.admin-theme-black .admin-primary-action:hover {
  background: var(--admin-primary-hover);
}
.admin-theme-black :focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
  box-shadow: 0 0 0 5px #111111;
}
```

Bunlar tema sözleşmesidir; mevcut projenin Tailwind, CSS Modules, SCSS veya bileşen teması yapısına uyarlanır. Körlemesine tüm “green”, “success” veya hex ifadelerini değiştirmek doğru değildir; önce hangi bileşene ait olduğu bulunur. Tema müşteri sitesi veya mobil uygulamaya sızmamalıdır.

## 5. Bilgi mimarisi ve gözlenen menüler

Ana menü sırası: **Siparişler → Ürünler → Kampanyalar → İçerikler → Müşteriler → Entegrasyonlar → Tasarım → Raporlar → Ayarlar**.

| Ana grup | Görsellerde görülen alt gruplar / örnek seçenekler | Kanıt düzeyi |
| --- | --- | --- |
| Siparişler | Yeni, hazırlanan, kargolanan, teslim edilen, sipariş talepleri, iptal, tamamlanmayan; hızlı satış, plasiyer, telefonla sipariş, aktif sepetler, havale/arızaya ilişkin bildirimler, satış terminalleri, toplu işlemler, hak ödemeleri | Menü + seçilmiş sayfalar |
| Ürünler | Ürün, kategori, marka, nitelik, özel alan, uyumluluk grupları, ürün etiketleri, arama eşleştirme, arama konsolu; yorumlar, soru-cevap, öneriler, sıralama/toplu işlemler | Menü + çok sayıda liste/form |
| Kampanyalar | Kupon, promosyon, üye indirimi, bayi indirimi, bayi komisyonu, sabit indirim, sipariş limitleri, fiyat limitleri, satış kotası, e-posta, SMS; sayfa sekmesinde Affiliate | Menü + seçilmiş formlar |
| İçerikler | Sayfalar, yardım içerikleri, sıkça sorulan sorular, blog, slayt, afiş, popup, görsel yükle; URL yönlendirme ve 404 raporları | Menü + seçilmiş sayfalar |
| Müşteriler | Müşteri, riskli müşteri, müşteri bakiyeleri, bayi, bayi grupları, bayi işlemleri | Menü + iki liste |
| Entegrasyonlar | Pazaryeri, muhasebe, hızlı Excel, XML içeri/dışarı aktarım, toplu pazaryeri, Hepsiburada işlemleri, pazaryeri monitörü | Yalnız menü; iç sayfa yok |
| Tasarım | Tema ayarları, modül yerleşimi, yazdırma şablonları, e-posta tasarımları | Menü + tema ayarlarının seçilmiş alanları |
| Raporlar | Sipariş, ürün, üye/bayi, sistem, affiliate raporları | Menü + rapor filtre formları; sonuç ekranı yok |
| Ayarlar | Genel, SEO, pazarlama, sözleşme, sipariş, ürün, ödeme, döviz, kargo, montaj noktaları, ülke/vergi/dil, SMS/e-posta, bakım, bayi, web servis, yönetici, güvenlik, site ayarları | Menü + ödeme/kargo sayfaları |

Menüde görünen bir başlığın varlığı, iç sayfa tasarımının bilindiği anlamına gelmez. Görülmeyen sayfalarda ortak bileşenler kullanılabilir; bu sayfalar “referanstan birebir doğrulandı” diye raporlanmamalıdır.

## 6. Modül bazında ayrıntılı analiz

### 6.1. Dashboard — S01–S03

**Gözlem:** Üstte dokuz tarih kısayolu var: Bugün, Dün, Bu Hafta, Geçen Hafta, Bu Ay, Geçen Ay, Bu Yıl, Geçen Yıl, Tüm Zamanlar. Referansta Geçen Hafta seçili. Altında kartların sürükle-bırak ile taşınabileceğini ve yerleşimin tarayıcı önbelleğine kaydedildiğini söyleyen bilgi mesajı bulunuyor.

Görülen kartlar:

| Kart | Görülen içerik | Yeni projedeki veri ihtiyacı |
| --- | --- | --- |
| Siparişler | Yeni/hazırlanan sayıları, oran şeridi, site ve pazaryeri satırları | Durum ve kanal bazlı sayım |
| Satış Performansı | Bugünkü ciro/sipariş, günlük/haftalık/aylık ortalamalar; tahmini ciro seçimi | Dönem ve metrik tanımı |
| Sepet Özeti | Sepet, fiyat, ürün ve adet ortalamaları | Hesaplama kapsamı belirlenmiş özet |
| Aktif Ziyaretçiler | Kullanıcı adedi, masaüstü/mobil oranı | Analitik sağlayıcısı varsa bağlanır |
| Satış Grafiği | Sipariş adedi ve sipariş tutarı; ayrı ölçekler | Tarih bazlı seri |
| Ödeme Yöntemleri / Kargo Firmaları | Dağılım kartları; boş görsel alanları | Sağlayıcı bazlı toplam |
| Müşteri İstatistikleri | Üye ve bayi sayıları | Müşteri türü özeti |
| Satış Kanalları | Kanal bazlı grafik alanı | Kanal toplamları |
| Dönüşüm Oranları | Ziyaret, sepet, ödeme ve satın alma adımları | Tanımlı funnel ölçümleri |
| Trafik Kaynakları | Kaynak, oturumlar, satışlar, dönüşüm oranı | Analitik kaynak tablosu |
| Çok Satanlar | Boş durum çizimi | Dönemde satılan ürün sıralaması |
| Kritik Stok Seviyeleri | Ürün, satış fiyatı, stok | Stok eşikleri |

**Uygulama kararları:**

- İlk sırada Siparişler / Satış Performansı / Sepet Özeti üçlüsü korunur. Satış grafiği geniş kart olarak ele alınır.
- Kart konumları kararlı `widgetId` ile tutulur. Yerel kayıt anahtarı kullanıcı ve şema sürümü içerir; çıkış yapan kullanıcının düzeni başka kullanıcıya karışmaz. Kaynakta hangi depolama API'sinin kullanıldığı bilinmiyor; `localStorage` bir yeni proje seçeneğidir.
- Tarih filtresinin kapsamı açık olmalıdır. Referanstaki kart içi “Bugün” etiketleri, üst tarih filtresiyle aynı dönemde olduklarını kanıtlamaz. API sözleşmesinde her karta uygulanan dönem tanımlanır.
- Sıfır sonuç, veri yokluğu ve API hatası ayrı gösterilir. Hata alınca ciroyu sıfır gösterme.
- “Tahmini ciro”, iade/iptal/vergi dahil olma kuralları belirlenmeden gerçek finansal metrik olarak sunulmaz.
- Grafiklerde sipariş adedi ve para birimi tek eksende karıştırılmaz. Siyah ve gri seriler etiket/çizgi deseniyle ayrılır.
- Kart sürükleme yalnız başlık/tutamaç üzerinden; iç link ve form kontrolleri sürüklemeyi tetiklemez. Klavyeyle sıralama alternatifi sağlanır.

### 6.2. Menüler, hızlı işlemler ve bildirim — S04–S15

Ana modüllerde beyaz çok sütunlu açılır menüler bulunuyor. Rapor menüsü uzundur ve aşağıdaki ekran görüntüsünde devam eder. Hızlı işlemler alanı sağdan açılan, simge + başlık + sayı içeren liste olarak görünür. Bildirim çekmecesi sağda beyaz bir paneldir; boş durumda “Bildirim bulunmamaktadır” mesajı vardır.

**Uygulama kararları:**

- Menü hover ile açılabilse de click ve klavye ile de kullanılmalı; Escape kapatmalı.
- Aynı anda tek mega menü açık kalmalı; menüden alt seçeneğe geçerken kapanma titremesi olmamalı.
- Uzun menü viewport içinde kaymalı. Kaynak ekrandaki taşmayı tekrar üretmek gerekmez.
- Sağ çekmece modal davranıyorsa odak içeride tutulmalı, arka plan etkileşimi kapanmalı ve kapatınca odak tetikleyiciye dönmeli.
- Rozetlerde örnek sayılar gerçek veri gibi sabitlenmemeli.
- “JETCache” kaynak ürüne özgü bir isimdir. Hedefte önbellek temizleme işlevi yoksa sahte işlev oluşturulmaz; araç görünürlüğü yapılandırmadan yönetilir.

### 6.3. Sipariş listeleri — S16–S20

**Gözlem:** Sekmeler yeni/hazırlanan/kargolanan/teslim edilen/talep/iptal/tamamlanmayan siparişleri ayırıyor. Altında tam genişlikte “Filtreleme Seçenekleri” şeridi var. Görülen tablo başlıkları seçim/sıra, Sipariş Bilgileri, Müşteri Bilgileri, Tutar, Durum, Kargo, Tarih, Yazdır ve İşlemler. Bazı durumlarda kayıt bulunmuyor; bazı ekranlarda dolu satırlar var. Durum etiketleri hazırlanan için mor, teslim edilen için yeşil/turkuaz, iptal için kırmızı.

**Uygulama kararları:**

- Durum sekmesi, arama, filtre ve sayfa URL parametreleriyle korunmalı; geri dönüşte liste konumu kaybolmamalı.
- Sipariş ve ödeme durumu farklı alanlardır. Teslim edilmiş olmak ödeme doğrulamasının yerine geçmez.
- İşlemler menüsü yetki ve mevcut duruma göre seçenek üretmeli. Görsellerde açık menü olmadığından ayrıntılı eylemler kaynak davranış gibi uydurulmamalı.
- Tablo mobilde kendi konteynerinde yatay kaymalı; tüm sayfa yatay taşmamalı.
- Yazdır ikonlarına erişilebilir ad verilmeli; yazdırma şablonları hedef projenin belgelerine bağlanmalı.
- Filtre barı kapalı/açık durum desteklemeli; filtre iç alanları görüntülerde açık olmadığı için mevcut projenin filtreleri kullanılmalı.

### 6.4. Hızlı satış — S21–S23

**Gözlem:** Solda geniş ürün alanı, sağda daha dar müşteri/sipariş formu var. Ürün adı, kod veya barkodla arama; ürün satırlarında ürün/kod/ad/KDV/miktar/fiyat/tutar sütunları bulunuyor. Alt bölümde indirim oranı, kargo ücreti, ara toplam, indirim, kargo ve genel toplam gösteriliyor.

Sağ formda görülen alanlar: satış terminali, müşteri tipi, ad soyad/unvan, kimlik numarası, telefon, e-posta, il, ilçe, adres, vergi numarası, vergi dairesi, ödeme yöntemi, sipariş durumu, kargo firması, takip numarası, müşteri notu, yönetici notu ve hediye çeki. Alt kısımda “Siparişi Oluştur” butonu var.

**Uygulama kararları:**

- Sol/sağ yerleşim yaklaşık %65–70 / %30–35 başlangıcıyla kurulup görsele göre ayarlanır.
- Toplamı istemci önizleyebilir; nihai fiyat, vergi, indirim ve stok sunucuda doğrulanır.
- Siparişi oluşturma tekrar tıklanması/istek tekrarında çift sipariş oluşturmamalı.
- Oluşturma sırasında buton bekleme durumuna geçmeli; hata halinde form içeriği korunmalı.
- Bu akış hedef projede yoksa dashboard uyarlamasının ön koşulu yapılmamalı.

### 6.5. Ürün ve katalog yönetimi — S24–S34

Ürün sekmeleri: Ürün Yönetimi, Kategori Yönetimi, Marka Yönetimi, Nitelik Yönetimi, Özel Alan Yönetimi, Uyumluluk Grupları, Ürün Etiketleri, Arama Eşleştirme ve Arama Konsolu.

**Ürün listesi:** Filtre barı, büyük hızlı arama satırı, toplam ürün/aktif-pasif/stoksuz ürün sayaçları, Yeni Ürün butonu ve pazaryeri ikonları var. Tablo başlıklarında Ürün No, Resim, Ürün Bilgileri, Site, Desi, Stok, İşlemler görülüyor. Liste gövdesi bu karede ekranın altında kaldığından tüm satır davranışları bilinmiyor. 120, 118–2, 53 gibi sayılar örnek anlık verilerdir; yeni uygulamaya sabitlenmez.

| Alt sayfa | Görülen yapı | Teknik karşılığı |
| --- | --- | --- |
| Kategori | Kategori no/adı, üst kategori, durum, pazaryeri eşleştirmeleri; ağaç/hızlı eşleştirme/Excel araçları | Hiyerarşik kategori modeli |
| Marka | Arama, Yeni Marka, Excel; marka no/adı, durum, sıra, işlemler | Sıralanabilir katalog sözlüğü |
| Nitelik | Nitelik no/adı/kodu, sıra, durum; boş tablo | Ürün özelliği tanımı |
| Özel alan | Ad, tip, durum, zorunluluk, sıra; boş tablo | Tipli dinamik alan tanımı |
| Uyumluluk | Grup adı/kodu, Auto List; yeni grup/hazır araç listesi | Hedefte gerekiyorsa bağımsız uyumluluk modeli |
| Ürün etiketi | Sol üst/sol alt/sağ üst/sağ alt aktiflikleri | Ürün kartı köşe etiketi yapılandırması |
| Arama eşleştirme | Aranan ve eşleştirilen kelime, bilgilendirme kutusu | Arama eşanlamlı/yazım eşleştirme sözlüğü |
| Arama konsolu | Aranan kelime, arama/sonuç sayısı, ilk/son tarih, eşleştirme | Arama analitiği; harici bir servis olduğu varsayılmaz |

**Yeni Ürün modalı — görünür alanlar:**

- Sekmeler: Genel Bilgiler, S.E.O Bilgileri, Fiyat/Kargo, Stok/Varyant, Resimler, Özellikler, Diğer.
- Genel Bilgiler üç kolon: Ürün Adı, Kısa Açıklama (Ön Detay), Fatura Adı; Site Durumu, Ürün Kaynağı, Sıralama Önceliği; Ürün Kodu, Barkod, Üretici Parça Numarası (MPN); Kategori, Listeleme Kategorileri, Marka.
- Alt bölüm: araç çubuklu zengin metin Ürün Açıklaması.
- Ürün Adı ve Site Durumu yanında zorunluluk gösterimi; sağ altta Kaydet.

Yalnız Genel Bilgiler sekmesinin içeriği görülüyor. Diğer sekmelerin alanları, stok hesaplama yöntemi, varyant modeli, görsel sıralama ve SEO detayları doğrulanamaz. Bunlar hedef projenin mevcut modeliyle uygulanır.

**Yeni Kategori modalı:** Genel Bilgiler / S.E.O Bilgileri / Pazaryeri Eşleştirmeleri / Diğer sekmeleri; kategori adı, durum, üst kategori, sıra, kategori açıklaması ve Kaydet.

**Uygulama kararları:** Ürün ana kaydı, fiyat, stok/varyant ve medya ayrı mantıksal bölümlerdir; form taslağı sekme geçişlerinde korunur. Stok değişiklikleri kayıt altına alınır. Ürün kaydı için kategori/marka seçimleri mevcut veriye bağlanır. Para ondalık güvenliği korunur. Fotoğraflar gerçek hedef proje varlıklarıyla gelir; kaynak müşterinin ürünleri taşınmaz.

### 6.6. Kampanyalar — S35–S43

| Ekran | Görünen alanlar ve davranış |
| --- | --- |
| Yeni Kupon | Genel Bilgiler/Koşullar/SEO/Açıklama; tanım, kupon kodu, raporlama referansı, durum, başlangıç-bitiş, maksimum kullanım, üye başı kullanım, indirim tipi ve miktarı |
| Yeni Promosyon | Oluşturmadan önce promosyon türü seçimi; sepette veya siparişte X al/Y öde, ürün indirimi ve ilgili ürün koşulu varyasyonları |
| Yeni Üye İndirimi | Kategori, marka, ürün; üye grubu/üye; indirim bilgileri |
| Yeni Bayi İndirimi | Kategori, marka, ürün; bayi grubu/bayi; indirim bilgileri |
| Yeni Komisyon Tanımla | Ürün, bayi grubu, bayi, komisyon tipi ve tutarı |
| Sabit İndirim | Sepet tutarına indirim yüzdesi; Kaydet |
| Yeni Satış Kotası | Ad, durum, öncelik, tarih aralığı, periyot, pazaryeri satışları, kota, kota kuralı, varyant kontrolü, üye grupları, ürün listesi, kategori/marka |
| E-posta Araçları | Sol alt menü: Bülten Listesi, Bülten Grupları, E-posta Gönderimi; arama/yeni kayıt/Excel; liste tablosu |
| SMS Araçları | Benzer alt menü; numara temelli bülten listesi |

**Uygulama kararları:**

- İndirim tipi tutar/yüzde ayrımıyla modellenmeli; yüzde aralığı, negatif değerler, tarih aralığı ve kullanım limitleri doğrulanmalı.
- Kupon kullanım sayacı eşzamanlı işlemlerde atomik olmalı; kampanya birleşme/öncelik kuralları ayrıca belirlenmeli.
- Kota kontrolü yalnız ekranda yapılmamalı; sipariş anında sunucu kontrolü gerekir.
- E-posta/SMS listesi göstermek ile gerçek gönderim yapmak ayrı işlerdir. Görsel prototip, gerçek kişilere ileti göndermez.
- Ekranlardaki gönderim süresi açıklamaları hedef sistemin garantisi olarak kopyalanmaz.
- Sipariş/fiyat limitleri ve Affiliate sekmeleri görünür; iç formları gösterilmemiştir.

### 6.7. İçerik ve medya — S44–S48

**Yeni Sayfa:** Genel Bilgiler/SEO/Diğer sekmeleri, sayfa başlığı, sıra ve zengin metin içerik alanı. **SSS:** soru listesi, sıra ve işlem alanları. **Görsel Yükle:** Ürün Resmi / Banner Resmi iki seçim kartı; seçilince alt tarafta sürükle-bırak yükleme alanı açılıyor. Üç farklı durum görüntülenmiş: seçim yok, ürün seçili, banner seçili.

**Uygulama kararları:**

- Ürün/banner seçimi gerçek form durumu olmalı; seçili kartın sınırı siyah olmalı.
- Yüklemede ilerleme, hata, iptal/tekrar dene ve tamamlanan dosya sonucu gösterilmeli.
- Dosya tipi, boyutu ve gerekli boyut oranları hedef proje politikasından alınmalı; görsellerde okunmayan limitler uydurulmamalı.
- Zengin metin içerikleri güvenli biçimde işlenmeli; ham script çalıştırılmamalı.
- SEO sekmesi görünür olsa da alanları gösterilmediğinden mevcut projeden devralınmalı.

### 6.8. Müşteri ve bayi — S49–S50

Müşteri listesinde arama, üye grubu filtresi; üye no, e-posta, ad soyad, telefon, bakiye, puan, müşteri grubu, durum ve giriş/kayıt tarihleri görülüyor. Riskli müşteri ekranında liste, “Riskli Müşteri Ekle” ve “Otomatik Risk Kriterleri” araçları var; kayıt yok.

**Uygulama kararları:** Gerçek müşteri iletişim bilgileri demo veri olarak kopyalanmaz. Bakiye/puan yönetimi hedef projede yoksa yeni finansal sistem kurulmaz. Risk kriterlerinin içeriği görünmediği için otomatik risk kararları tasarlanmış kabul edilmez. Hassas bilgilerin görünürlüğü mevcut rollerle sınırlandırılır.

### 6.9. Tasarım ayarları — S51–S53

Sayfa üstünde Tema Ayarları, Modül Yerleşimi, Yazdırma Şablonları, E-posta Tasarımları sekmeleri var. Tema ayarları içindeki sol menüde tema seçimi, logo, watermark, resim, çerez uyarısı, tarayıcı çubuğu uyarısı, Facebook Login ve Google Login görünüyor.

Tema seçiminde önizleme, aktif tema etiketi, sürüm/güncelleme bilgisi, özelleştirme, CSS/JS özelleştirme ve tema editörü araçları var. Logo ekranında ana/mobil logo yükleme alanları; tarayıcı çubuğu uyarısında aktiflik anahtarı ve sekme başlığı alanı görülüyor.

**Uygulama kararı:** Bu bölüm mağaza/site görünümünü yönetiyor gibi görünüyor; admin panelini siyaha çevirmek için bu tema motorunu yeniden geliştirmek gerekli değil. Özellikle CSS/JS editörü ve sosyal giriş yeni kapsam sayılır. Hedef projede varsa mevcut izinler ve yapılandırma sistemi korunur.

### 6.10. Raporlar — S54–S58

| Rapor ailesi | Görülen filtreler |
| --- | --- |
| Sipariş | Rapor tipi, durum, platform, mağaza, satış terminali, sipariş tarihi/saati, fatura/e-fatura/kargolanma tarihleri, tutar aralığı, ödeme yöntemi, ülke, üye/bayi no, hediye çeki kodu/referansı, promosyon, kargo firması, gelişmiş arama |
| Ürün | Rapor tipi, ürün kaynağı, kategori, marka, etiket, ürün no/kodu, barkod, gelişmiş filtreleme |
| Üye/Bayi | Rapor tipi, üye/bayi no, üyelik tarihi, rapor gruplama |
| Sistem | Rapor tipi, işlem tarihi aralığı, yönetici no |

Rapor formları kompakt üç kolonlu alanlardan oluşuyor; Temizle / Oluştur eylemleri sağ altta. Raporların sonuç tablosu veya dosya çıktısı gösterilmemiştir.

**Uygulama kararları:** Filtrelerin URL veya rapor taslağı olarak korunması; uzun raporlar için görev kimliği/durum takibi; aynı filtreyle tutarlı sonuç ve dışa aktarım. Bunlar yeni proje önerisidir, kaynakta varlığı doğrulanmamıştır. Tarih sınırları ve iş saat dilimi backend ile aynı olmalı.

### 6.11. Ödeme ve kargo ayarları — S59–S61

Ödeme yöntemlerinde aktif/pasif gruplar; aktif örneklerde kart sağlayıcısı ve Havale/EFT, taksit seçenekleri, kısıtlamalar, banka hesapları ve ayarlar araçları görülüyor. Kargo firmalarında ekleme alanı, firma satırı, aktiflik, teslimat saatleri ve ayarlar var. Kargo ayarlarında sabit/kategori/bayi grubu/desi/pazaryeri ücretleri ve kısıtlamalar sekmeleri; sabit ücret, ücret tipi ve ücretsiz kargo limiti alanları görülüyor.

**Uygulama kararları:** Görsel var diye sağlayıcı hesabı veya API anahtarı oluşturulmaz. Mevcut sağlayıcı adaptörleri kullanılır. Anahtarlar istemciye gönderilmez. Kargo kural öncelikleri ekrandaki metin kopyalanarak kodlanmaz; hedef projenin ticari kuralları doğrulanır.

## 7. Ortak bileşen ve durum sözleşmesi

| Bileşen | Sorumluluk | Asgari durumlar |
| --- | --- | --- |
| AdminShell | İki üst şerit + sol ikon şeridi + içerik alanı | Normal, dar ekran |
| TopNavigation / MegaMenu | Modül ve alt sayfa gezinmesi | Kapalı, açık, odaklı |
| ModuleTabs | Sayfa içi/route sekmeleri | Seçili, pasif, taşan |
| FilterAccordion | Siyah filtre başlığı ve açılır form | Açık, kapalı, uygulanmış |
| SearchToolbar | Arama ve Yeni/Excel gibi eylemler | Boş, yazılıyor, yükleniyor |
| DataTable | Kolonlar, seçim, hücre ve işlem alanları | Yükleniyor, dolu, boş, hata |
| StatusBadge | Anlamı metin + ikonla gösterme | Aktif, pasif, iptal, hazırlanıyor vb. |
| MetricCard / ChartCard | Sayısal özet ve grafik | Dolu, sıfır, veri yok, hata |
| FormField / FormSection | Etiket, yardım, zorunluluk ve hata | Normal, disabled, invalid |
| EntityModal | Siyah başlık, sekmeler, form ve footer | Açık, değişti, kaydediliyor, hata |
| RichTextField | Açıklama/içerik düzenleme | Boş, dolu, doğrulama hatası |
| MediaUploader | Tip seçimi ve yükleme | Seçilmedi, hazır, yükleniyor, hata, tamam |
| SideSettingsLayout | Sol alt menü + sağ form | Seçili sayfa, kaydediliyor |
| NotificationDrawer | Sağ bildirim paneli | Boş, dolu, yükleniyor |
| EmptyState | Kayıt yok durumunu anlatma | Filtre sonucu yok / ilk kayıt yok ayrımı |

Tabloya sayfalama/sıralama eklenmesi büyük veri için öneridir; tüm referans karelerinde sayfalama görünmüyor. Ortak bileşenler hedef projenin mevcut kütüphanesine göre oluşturulmalı; sırf yeniden kullanım adına her form tek bir aşırı soyut şemaya zorlanmamalıdır.

### 7.1. Modal davranışı

- Form yüksekliği viewport'u aşarsa modal gövdesi kayar; başlık ve Kaydet footer'ı erişilebilir kalır.
- Geniş ürün modalı yaklaşık %80–90, orta kampanya modalı %60–70, promosyon tipi seçici daha dar başlangıç oranıyla kurulabilir.
- Sekme değişimi form taslağını silmez.
- Değişiklik varken kapatma, veri kaybını önleyen mevcut proje davranışına uyar.
- Kaydet sırasında yinelenen istek engellenir; hata aynı modalda gösterilir.
- Başarı yalnız sunucu onayından sonra gösterilir; liste ve sayaçlar ilgili kayıtla güncellenir.
- Escape, odak yönetimi, erişilebilir başlık ve klavyeyle kullanım sağlanır.

### 7.2. Responsive uyarlama

Arşiv yalnız masaüstünü gösterir; mobil tasarım hakkında kanıt yoktur. Aşağıdakiler yeni proje kararıdır:

- Geniş masaüstü: referans yatay menü ve üç kolon korunur.
- Dar masaüstü/tablet: mega menü ve başlıklar kontrollü taşma/kompakt gezinmeyle erişilebilir kalır; kartlar iki kolona iner.
- Telefon: gezinme açılır panele dönüşebilir, kart/form kolonları tek olur, tablolar kendi içinde kayar; modal ekran genişliğine yaklaşır.
- 1440/1280/768/390 CSS px genişlikleri doğrulama noktalarıdır; kaynak uygulamanın breakpoint değerleri değildir.
- Desktop referans doğruluğu ile mobil erişilebilirlik ayrı kabul edilir; mobil ekran “birebir kaynak” diye sunulmaz.

## 8. Yeni projeye entegrasyon mimarisi

### 8.1. Önce mevcut proje

Uygulamaya başlamadan framework, router, admin layout, stil sistemi, oturum/yetki mekanizması, veri istemcisi, form altyapısı, ikon seti, tablo/grafik/editör bileşenleri ve test komutları incelenmelidir. Mevcut projeye uygun olan korunur. Yeni framework, yeni veritabanı, yeni auth sistemi veya yeni deployment altyapısı bu tasarım aktarımının gereği değildir.

Mantıksal katmanlar:

1. **Sunum:** Shell, kart, tablo, form, modal ve tema tokenları.
2. **Sayfa durumu:** Sekme, filtre, sıralama, seçim ve modal taslağı.
3. **Veri adaptörü:** Mevcut API cevaplarını ekran modeline dönüştürür.
4. **Mevcut iş servisleri:** Sipariş/stok/indirim/rapor kuralları ve yetki kontrolü.

Aşağıdaki yapı bir klasör önerisidir; hedef framework'e dayatma değildir:

```text
admin/
  shell/
  navigation/
  theme/
  components/
  features/
    dashboard/
    orders/
    catalog/
    campaigns/
    content/
    customers/
    reports/
    settings/
  adapters/
  tests/
```

### 8.2. Önerilen route haritası

Gerçek route'lar hedef projeden alınır. Aşağıdakiler yeni oluşturulacaksa kullanılabilecek örneklerdir:

| Görünüm | Örnek route |
| --- | --- |
| Dashboard | `/admin` |
| Siparişler | `/admin/orders?status=preparing` |
| Hızlı satış | `/admin/orders/quick-sale` |
| Katalog | `/admin/products`, `/admin/categories`, `/admin/brands` |
| Kuponlar | `/admin/campaigns/coupons` |
| İçerik / medya | `/admin/content/pages`, `/admin/content/media` |
| Müşteriler | `/admin/customers` |
| Raporlar | `/admin/reports/orders`, `/admin/reports/products` |
| Ayarlar | `/admin/settings/payments`, `/admin/settings/shipping` |

Sekmeler yalnız görsel buton olmamalı; uygun sayfa veya sorgu durumuna bağlanmalı. Yetkisiz route erişimi sunucuda engellenmeli; menü gizleme tek başına yetkilendirme değildir.

### 8.3. Veri sözleşmeleri — kaynak API değil, entegrasyon taslağı

| Ekran modeli | Temel alanlar |
| --- | --- |
| DashboardSummary | Dönem, para birimi, durum/kanal sayıları, satış özeti, stok özeti, güncellenme zamanı |
| SalesSeries | Tarih, sipariş adedi, sipariş tutarı |
| OrderListItem | ID/no, müşteri özeti, tutar/para birimi, sipariş ve ödeme durumu, kargo, tarih |
| ProductListItem | ID, ad, kod, küçük görsel, yayın durumu, desi, stok |
| ProductDraft | Genel bilgiler, kategori/marka referansları; diğer sekmeler mevcut modele göre |
| Category / Brand | ID, ad, durum, sıra; kategori için parentId |
| Coupon | Kod, tanım, durum, başlangıç/bitiş, limitler, indirim tipi/değeri |
| ContentPage | Başlık, içerik, sıra, hedef projedeki SEO alanları |
| ReportRequest | Rapor ailesi/tipi, filtreler, iş saat dilimi |
| UploadResult | Medya kimliği, URL, tip, boyut ve yükleme sonucu |

Örnek liste sözleşmesi:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 25,
  "total": 0
}
```

Örnek filtre: `status`, `query`, `from`, `to`, `page`, `pageSize`, `sort`. İsimler mevcut API ile eşleştirilir; sırf bu örneğe uymak için çalışan API değiştirilmez.

### 8.4. İşlevsel uygulamada gerekli teknik sınırlar

- Para değerleri backend'de güvenli ondalık türle veya en küçük para birimiyle tutulur; para birimi ayrı alan olur.
- İş zaman dilimi açıkça belirlenir; Türkçe tarih/para sunumu `tr-TR` olarak yapılabilir. Ekrandaki eski tarih/para biçimleri gerçek hesaplama formatı kabul edilmez.
- Arama isteği geciktirilir ve eski istek sonucu yeni sonucu ezmez; sayfalama sunucu tarafında yapılabilir.
- Kayıt güncellemesi sonrası ilgili liste/özet önbelleği yenilenir.
- Stok, kupon ve sipariş oluşturma eşzamanlılık açısından sunucuda korunur.
- API hata mesajları alan hatası/genel hata olarak ayrılır; gizli teknik ayrıntılar kullanıcıya dökülmez.
- Dosya yükleme, metin editörü, ödeme/kargo sırları ve dışa aktarımlar mevcut güvenlik mekanizmasına bağlanır.
- Önemli değişiklikler mevcut audit kayıtlarına eklenir; ayrı bir audit ürünü kurulması gerekmez.

## 9. Görsel ve işlevsel kabul kriterleri

### 9.1. Görsel kontrol

- [ ] İki üst şerit, yatay dokuz ana menü ve dar sol ikon şeridi korunuyor.
- [ ] İçerik beyaz/açık gri; yalnız yeşil arayüz yüzeyleri siyah/gri olmuş.
- [ ] Dashboard ilk sıra üçlüsü ve kart sırası referansla aynı.
- [ ] Filtre başlıkları, modal başlıkları, butonlar, seçili tarih ve ikon kutuları siyah.
- [ ] Açık yeşil KPI ve yeşil başarı etiketleri nötrleştirilmiş; anlamları yazıyla anlaşılır.
- [ ] Diğer semantik renkler ve ürün/marka görselleri gereksiz değiştirilmemiş.
- [ ] Tablo kolonları, form kolonları, sekme sırası ve buton konumları korunmuş.
- [ ] Kaynak logo yerine hedef projenin logosu var; kaynak müşteri verisi yok.
- [ ] Safari/macOS/Dock ve ekran görüntüsü küçük resmi kopyalanmamış.
- [ ] Belirlenen genişliklerde kırpılma ve sayfa düzeyinde yatay taşma yok.

Görsel karşılaştırmada kaynak uygulama bölgesi kırpılır ve aynı CSS viewport/ölçek ile değerlendirilir. Hedef uygulamanın dinamik verileri, kaynak gerçek kişisel verileri ve kasıtlı renk değişimi piksel karşılaştırmasında dışarıda tutulur. Kaynak CSS ölçüsü bilinmeden “piksel mükemmel eşleşme” iddiasında bulunulmaz; kabul edilen hizalama ölçütleri kalibrasyon sonrasında belirlenir.

### 9.2. İşlevsel kontrol

- [ ] Menü/sekme doğru sayfaya gidiyor; geri/ileri ve yenileme durumu koruyor.
- [ ] Arama/filtre sonuçları gerçekten değiştiriyor; boş veri ile hata ayrılıyor.
- [ ] Modal açılıp kapanıyor, form değerleri sekme değişiminde korunuyor.
- [ ] Kaydet bekleme/hata/başarı durumları gerçek servis sonucuna bağlı.
- [ ] Yetkisiz işlemler hem arayüzde hem sunucuda engelleniyor.
- [ ] Dashboard yerleşimi yeniden açılışta korunuyor; kullanıcılar arasında karışmıyor.
- [ ] Dosya tip seçimi ve yükleme durumları çalışıyor; gerçek gönderim olmayan prototip açıkça demo.
- [ ] Rapor filtreleri ve tarih aralıkları doğru modele aktarılıyor.
- [ ] Sipariş/stok/tutar hesaplaması mevcut iş kurallarını bozmuyor.
- [ ] Yönetim teması müşteri web arayüzünü veya başka uygulamaları değiştirmiyor.

### 9.3. Anlamlı test senaryoları

| Senaryo | Beklenen sonuç |
| --- | --- |
| Menü klavyeyle açılır, Escape basılır | Kapanır; odak mantıklı noktada kalır |
| Yeşil tema kalıntısı için ortak bileşenler incelenir | UI yeşili yok; gerçek görsel renkleri korunur |
| Sipariş filtresi sonuçsuz kalır | Kayıt bulunamadı; API hatası gibi gösterilmez |
| Ürün kaydı sunucuda reddedilir | Modal açık, alanlar korunmuş, hata görünür |
| Hızlı satış iki kez gönderilir | Çift kayıt oluşmaz |
| Kart taşınır ve sayfa yenilenir | Aynı kullanıcı için yerleşim korunur |
| Dar ekranda ürün modalı açılır | Footer ve tüm alanlar ulaşılabilir |
| Kaydet yetkisi olmayan kullanıcı istek gönderir | Sunucu işlemi reddeder |

Yalnız UI aktarımında backend'e ait senaryolar ancak ilgili işlev bağlanmışsa uygulanır. Değişmeyen backend'i gereksiz yeniden test kapsamına almak yerine etkilenen akışlar doğrulanır.

## 10. Uygulama sırası ve bitiş tanımı

| Aşama | İş | Çıkış kriteri |
| --- | --- | --- |
| 0 | Hedef repo ve referans eşleştirme | Mevcut stack, route ve kapsam net; gözlem/varsayım ayrımı kayıtlı |
| 1 | Tema tokenları ve kabuk | Siyah çerçeve, beyaz içerik, menüler ve sol ikon şeridi |
| 2 | Dashboard | Kart düzeni, tarih kontrolleri, boş/hata durumları |
| 3 | Liste ve modal şablonları | Ürün/sipariş örnekleri; tekrar kullanılabilir tablo/form |
| 4 | İlgili diğer modüller | Hedef projede gereken ekranlar referansla eşleşiyor |
| 5 | Veri bağlantısı | Mevcut API/yetki kurallarıyla çalışma |
| 6 | Görsel karşılaştırma ve düzeltme | Referansa göre fark listesi kapalı; kalan belirsizlikler açık |

“Tamamlandı” demek yalnız ekranın güzel görünmesi değildir: seçilen kapsamın etkileşimleri çalışmalı, gerçek bağlantılar ile demo alanlar ayırt edilmeli, tema sızıntısı olmamalı ve doğrulama sonucu belirtilmelidir. Yeni pazaryeri/ödeme/iletişim entegrasyonları bu tasarım çalışmasının otomatik devamı değildir.

## 11. Hazır promptlar

### Kullanım

Bu Markdown dosyasını ve orijinal ZIP'i hedef projenin Codex oturumuna ekleyin. Görsel referanslar olmadan yalnız metinle birebir tasarım eşleşmesi beklenmemelidir. Tek seferde genel uygulama için **Prompt 1**; yalnız bir dashboard ekranı için **Prompt 2**; kontrollü ilerlemek için **Prompt 3–9** kullanılabilir. Prompt 1 ile bütün aşamaları yaptıktan sonra aşamalı promptları yeniden çalıştırmak gerekmez.

### Prompt 1 — Ana uygulama promptu

```text
Bu repodaki yönetim panelini, ekteki “Yonetim_Paneli_Siyah_Tema_Teknik_Analiz_ve_Promptlar.md”
ve “yönetim paneli örnek” ZIP'indeki 61 ekran görüntüsünü referans alarak uyarla.

Hedefim referans panelin aynı yerleşim ve bileşen dilini kullanmak; yeşil/petrol yeşili
arayüz alanlarını siyah ve nötr griye çevirmek. Beyaz içerik alanları beyaz kalacak.
Bu bir tasarımı yeniden yorumlama görevi değildir.

Önce mevcut repoyu incele: talimat dosyaları, framework, router, admin layout,
stil sistemi, mevcut UI bileşenleri, auth/yetki, API istemcisi ve test komutlarını belirle.
Çalışan stack'i, veritabanını veya oturum mekanizmasını değiştirme.

Görseller kaynak kod değildir. Kaynak panelin backend, framework ve görünmeyen
alanları hakkında kesin iddia üretme. Görünen özellikleri ve yeni proje kararlarını ayır.
ZIP'teki Safari/macOS çubukları, Dock ve ekran görüntüsü küçük resmi uygulama değildir.

Tasarım kuralları:
- İki üst şerit, dokuz başlıklı yatay ana menü, dar sol ikon şeridi ve geniş beyaz
  içerik alanını koru. Geniş metinli sidebar tasarımına geçme.
- Ana kabuk #000000, yardımcı üst şerit #111111, beyaz içerik #FFFFFF olsun.
- Filtre ve modal başlıkları, birincil/Excel butonları, seçili tarih/alt menü,
  kart ikon kutuları siyah; üzerlerindeki yazı ve ikonlar beyaz olsun.
- Açık yeşil KPI kartları ve yeşil başarı etiketleri nötr gri/siyah olsun.
- Kırmızı hata/iptal, sarı uyarı, mavi bilgi gibi diğer anlam renklerini koru.
- Ürün görsellerini ve üçüncü taraf logolarını yeniden renklendirme.
- Kaynak marka ve gerçek müşteri verilerini kopyalama; hedef proje marka/verisini kullan.
- Tema yalnız admin kapsamına uygulansın; müşteri web/mobil tasarımını etkilemesin.

Önce ortak shell, tema tokenları, mega menü, sekme, filtre, tablo, modal ve durum
bileşenlerini oluştur/uyarla. Dashboard'un ilk sıra kartları Siparişler,
Satış Performansı, Sepet Özeti sırasıyla üç kolon olsun. Ardından hedef projede
karşılığı olan liste ve form ekranlarını bu sistemle eşleştir.

Hedefte olmayan pazaryeri, ödeme, SMS, ERP veya tema motorunu sırf referansta var diye
kurma. Görsel prototipte veri gerekiyorsa ayrı ve açıkça demo fixture kullan;
mock sonuçları gerçek entegrasyon gibi sunma. Var olan API'leri adaptörle bağla.

Menü, arama, filtre, modal, form doğrulama ve veri kaydı seçilen kapsamda çalışsın.
Boş/yükleniyor/hata durumlarını ayır. Kaydet yalnız gerçek servis başarısından sonra
başarı göstersin. Mevcut iş kuralları ve yetkilendirme korunsun.

Desktop görünümü referansla karşılaştır; 1440, 1280, 768 ve 390 px genişliklerde
kırpılma/taşmayı kontrol et. Görsellerdeki renk değişimi, marka ve dinamik verileri
karşılaştırmada beklenen fark olarak değerlendir.

İşi plan sunarak bırakma; repoda uygulanabilir kapsamı tamamla, mevcut ilgili
kontrolleri çalıştır. Sonuçta değişen dosyaları, tamamlanan ekranları, doğrulama
sonuçlarını, demo kalan alanları ve gerçek blokajları kısa ve dürüst biçimde bildir.
```

### Prompt 2 — Yalnız dashboard ekranı

```text
Ekteki teknik analiz ve ZIP'in S01–S15 referanslarını kullanarak mevcut projeye
referansla aynı kompozisyonda bir yönetim dashboard'u uygula.

Kapsam: ortak admin kabuğu, yatay ana menüler, dar sol ikon şeridi, sağ hızlı işlem
ve bildirim alanları, tarih filtreleri ve dashboard kartları. Diğer modüllerin
backend'lerini geliştirme. Menü hedeflerinde mevcut route'ları kullan; olmayanları
sahte çalışan sayfa gibi gösterme, yapılandırılabilir/pasif bırak.

Yeşil/petrol yeşili shell, buton, kart ikonu ve seçili durumlar siyah olsun.
Açık yeşil arayüz yüzeyleri gri olsun. İçerik beyaz; diğer semantik renkler korunsun.
Kaynak logo yerine hedef proje logosu kullan. macOS/Safari/Dock öğelerini kopyalama.

İlk sıra Siparişler / Satış Performansı / Sepet Özeti. Devamında aktif ziyaretçiler,
satış grafiği, ödeme/kargo/müşteri özetleri, kanallar, dönüşüm, trafik kaynakları,
çok satanlar ve kritik stok kartlarını referans sırası ve oranlarıyla yerleştir.

Mevcut veri kaynağı varsa bağla. Eksik analitik veriyi sıfırmış gibi gösterme;
açık veri-yok durumu kullan. Sadece prototip için ayrı demo verisi kullanılabilir.
Kart yerleşimini kullanıcı bazlı yerel tercihte koru; tarih filtresi kapsamını açık tut.
Tasarımı modernleştirme veya geniş sidebar'a çevirme. Görselle karşılaştırarak bitir.
```

### Prompt 3 — Repo keşfi ve uygulama eşleştirmesi

```text
Ekteki teknik analiz ve 61 referansı mevcut repoyla eşleştir. Bu aşamada kod değiştirme.
Framework/router/stil/auth/API/bileşen/test yapısını gerçekten dosyalardan tespit et.

Şu çıktıları hazırla:
1. Referans shell ve ortak bileşenlerin mevcut dosya karşılıkları.
2. Hangi ekranların hedef projede zaten bulunduğu.
3. Görsel uyarlama, mevcut API bağlantısı ve yeni kapsam gerektiren işleri ayıran tablo.
4. Kullanılacak admin tema sınırı ve token eşlemeleri.
5. Ekran bazlı uygulama sırası ve doğrulama komutları.

Kaynak görüntülerden backend teknolojisi çıkarsama. Referansta görünmeyen alanları
belirsiz diye işaretle. Yalnız uygulamayı gerçekten engelleyen eksikleri sor;
rutin stil/bileşen kararlarını mevcut repo düzenine göre ver.
```

### Prompt 4 — Siyah tema ve ortak kabuk

```text
Keşif sonucundaki mevcut admin yapısında ortak shell ve siyah temayı uygula.
Referanslar: S01, S04–S15, S24, S33.

Üst yardımcı şerit, yatay ana menü, dar sol ikon şeridi, beyaz içerik yüzeyi,
mega menüler, hızlı işlemler ve sağ bildirim çekmecesini aynı hiyerarşide kur.
Yeşil ana yüzeyleri #000000, koyu üst şeridi #111111 yap.
Tokenlar admin sınırında olsun. Yeşil KPI ve başarı durumları da nötrleştirilsin.

Hover, seçili, focus, disabled durumları okunur kalsın. Uzun mega menü ekrandan
çıkmasın; klavye/Escape ve odak yönetimi çalışsın. Hedef proje logosunu kullan.
İçerik kartlarını karartma, geniş sidebar ekleme, yeni bağımlılığı gerekçesiz ekleme.
Ortak shell'i farklı modül sayfalarında kontrol edip renk sızıntısını gider.
```

### Prompt 5 — Liste, ürün modalı ve form sistemi

```text
S16–S20 ve S24–S34 ekranlarını teknik analizdeki kolon/alanlarla eşleştir.
Mevcut hedef proje sipariş ve katalog sayfalarını referans görünümüne uyarla.

Modül sekmeleri, siyah Filtreleme Seçenekleri barı, arama/aksiyon satırı, kompakt
DataTable, seçim kutuları, durum etiketleri, İşlemler menüsü ve boş durumları kur.
Ürün modalında siyah başlık, sekme bandı, üç kolonlu Genel Bilgiler alanı,
açıklama editörü ve sağ altta Kaydet yapısını koru.

Görünür alanları analizden al. Açılmamış SEO/Fiyat/Stok/Resim sekmelerindeki alanları
kaynakta varmış gibi icat etme; hedef projenin mevcut alanlarını kullan.
Form taslağı sekmeler arasında korunsun. Kaydet mevcut API'ye bağlansın; hata
halinde alanlar kaybolmasın. Stok, fiyat ve yetki kurallarını değiştirme.
Liste ve modalı dolu/boş/yükleniyor/hata durumlarında doğrula.
```

### Prompt 6 — İlgili kampanya, içerik, müşteri ve ayar ekranları

```text
S35–S61 referanslarını kullanarak yalnız hedef projede bulunan veya açıkça kapsamda
olan kampanya, içerik, müşteri, rapor ve ayar sayfalarını ortak siyah temaya taşı.

Kampanya modallarında alan sırasını, iki/üç kolon düzenini ve alttaki Kaydet alanını
koru. Medyada Ürün Resmi/Banner Resmi seçimi ve seçim sonrası dropzone davranışını
kur. Rapor filtrelerinde referanstaki kompakt kolonları ve Temizle/Oluştur konumunu
koru. Ayarlarda sol alt menü + sağ içerik yapısını kullan.

Kaynakta yalnız menü adı görünen modülleri tam incelenmiş gibi uygulama.
Mevcut ödeme/kargo servisi varsa bağla; yoksa yeni sağlayıcı entegrasyonu başlatma.
Gerçek kişilere e-posta/SMS gönderme. Kaynak müşteri bilgilerini demo olarak kopyalama.
Her ekranın tamamlanma ve veri bağlantısı durumunu açıkça raporla.
```

### Prompt 7 — Veri ve etkileşim bağlantılarının tamamlanması

```text
Siyah temaya uyarlanan ekranların mevcut backend ile bağlantılarını tamamla.
Önce gerçek servisleri ve modelleri kontrol et; yeni API isimleri uydurup çalışıyor
iddiasında bulunma. Ekran modeli ile API arasında gerektiğinde adaptör kullan.

Liste filtresi/sayfalama, modal create/update, dashboard verileri, yükleme ve rapor
akışlarında yükleniyor/başarı/boş/hata durumlarını tamamla. Kaydet sonrası ilgili
verileri yenile. Sipariş/kupon/stok kurallarının otoritesi sunucu olsun.
Kullanıcı yetkisi yalnız buton gizleme ile sınırlı kalmasın.

İşlevi olmayan butonlara sahte başarı toast'ı koyma. Entegrasyonu eksik alanı
bağlantı eksikliği olarak göster. Görsel tasarımı bu aşamada yeniden düzenleme.
Değişen akışlar için anlamlı kontrolleri çalıştır ve gerçek sonuçları bildir.
```

### Prompt 8 — Görsel sadakat ve kalite düzeltmesi

```text
Uygulamayı ekteki 61 ekran referansı ve teknik analizin kabul kriterleriyle denetle.
Önce tarayıcı/macOS/Dock alanlarını dışarıda bırakarak aynı viewport/ölçekte karşılaştır.

Şunları incele: shell oranları, üst menü sırası, dar sol şerit, kart kolon/sırası,
sekme yoğunluğu, tablo başlıkları, modal genişliği, form hizaları, boşluklar,
buton konumları, yeşilden siyaha dönüşüm ve beyaz içerik yüzeyleri.
Renk değişimi, hedef marka ve farklı gerçek veriler beklenen farktır.

1440/1280/768/390 genişliklerinde taşma, kesilme ve erişilemeyen eylem kontrolü yap.
Klavyeyle menü/modal kullanımı, görünür focus ve boş/yükleniyor/hata durumlarını kontrol et.
Bulduğun kapsam içi sorunları düzelt; gereksiz yeniden tasarım yapma.
Sonuçta düzeltilen farkları ve doğrulanamayan noktaları ayrı bildir.
```

### Prompt 9 — Yarıda kalan işe devam

```text
Bu repoda referans panelin siyah temaya uyarlanması yarıda kalmış olabilir.
Teknik analiz dosyasını, mevcut kodu, git diff'i ve varsa ilerleme notlarını incele.
Tamamlanan işleri yeniden yazma; kullanıcıya ait mevcut değişiklikleri koru.

Ekranları şu durumlarla değerlendir: tamam / görsel eksik / veri bağlantısı eksik /
referansta görünmüyor / kapsam dışı. Sonra seçilmiş kapsam içindeki ilk eksikten
başlayarak ilerle. Siyah shell ve beyaz içerik kuralını bozma.
Görünürde tamam ama işlevsiz butonları gerçek çalışıyor gibi sayma.
Bitirdiğinde değişen dosyaları, doğrulama sonucunu ve kalan gerçek blokajları bildir.
```

## 12. Son kararlar ve açık kalan noktalar

**Kararlaştırılmış:** Yerleşim korunacak; yeşil arayüz siyah/gri olacak; içerik beyaz kalacak; hedef projenin marka/verisi kullanılacak; uygulama mevcut stack'e uyacak.

**Hedef repo görüldüğünde kesinleşecek:** Tek dashboard mu tüm ilgili panel mi taşınacağı, route eşlemeleri, gerçek API alanları, font/ölçü kalibrasyonu, role göre menüler, görünmeyen form sekmeleri ve entegrasyon kapsamı.

**Bu ZIP ile doğrulanamayacak:** Orijinal kaynak kodun kalitesi, altyapı teknolojileri, backend kuralları, güvenlik/performance seviyesi, çalışan entegrasyonlar ve mobil davranışlar.

Aşağıdaki envanterde S01–S61 kimlikleri dosya adındaki saat sırasına göre verilmiştir. Kimlikler bu belgenin referans anahtarıdır; ZIP'in kendi dosya adları korunmuştur.

## Ek A — 61 ekranın referans envanteri

| Kimlik | ZIP içindeki dosya adı | Görünen ekran |
| --- | --- | --- |
| S01 | `Ekran Resmi 2026-10-02 10.12.46.png` | Dashboard: tarih filtresi ve ilk kart sırası |
| S02 | `Ekran Resmi 2026-10-02 10.13.00.png` | Dashboard: ziyaretçiler, satış grafiği, ödeme/kargo/müşteri kartları |
| S03 | `Ekran Resmi 2026-10-02 10.13.04.png` | Dashboard: satış kanalları, dönüşüm, trafik, çok satanlar ve kritik stok |
| S04 | `Ekran Resmi 2026-10-02 10.13.13.png` | Siparişler mega menüsü |
| S05 | `Ekran Resmi 2026-10-02 10.13.15.png` | Ürünler mega menüsü |
| S06 | `Ekran Resmi 2026-10-02 10.13.18.png` | Kampanyalar mega menüsü |
| S07 | `Ekran Resmi 2026-10-02 10.13.24.png` | İçerikler mega menüsü |
| S08 | `Ekran Resmi 2026-10-02 10.13.28.png` | Müşteriler menüsü |
| S09 | `Ekran Resmi 2026-10-02 10.13.31.png` | Entegrasyonlar menüsü |
| S10 | `Ekran Resmi 2026-10-02 10.13.34.png` | Tasarım menüsü |
| S11 | `Ekran Resmi 2026-10-02 10.13.38.png` | Raporlar menüsü üst bölümü |
| S12 | `Ekran Resmi 2026-10-02 10.13.42.png` | Raporlar menüsü devamı |
| S13 | `Ekran Resmi 2026-10-02 10.13.48.png` | Ayarlar mega menüsü |
| S14 | `Ekran Resmi 2026-10-02 10.13.52.png` | Sağ hızlı işlemler listesi |
| S15 | `Ekran Resmi 2026-10-02 10.13.55.png` | Bildirim çekmecesi: boş durum |
| S16 | `Ekran Resmi 2026-10-02 10.14.05.png` | Yeni siparişler: boş liste |
| S17 | `Ekran Resmi 2026-10-02 10.14.10.png` | Hazırlanan siparişler: dolu liste |
| S18 | `Ekran Resmi 2026-10-02 10.14.14.png` | Kargolanan siparişler: boş liste |
| S19 | `Ekran Resmi 2026-10-02 10.14.19.png` | Teslim edilen siparişler: dolu liste |
| S20 | `Ekran Resmi 2026-10-02 10.14.52.png` | İptal edilen siparişler: dolu liste |
| S21 | `Ekran Resmi 2026-10-02 10.15.15.png` | Hızlı satış: ürün alanı ve müşteri formu |
| S22 | `Ekran Resmi 2026-10-02 10.15.20.png` | Hızlı satış: adres/vergi ve sipariş formu |
| S23 | `Ekran Resmi 2026-10-02 10.15.24.png` | Hızlı satış: notlar ve sipariş oluşturma |
| S24 | `Ekran Resmi 2026-10-02 10.15.56.png` | Ürün yönetimi: filtre, arama, sayaçlar, tablo başlangıcı |
| S25 | `Ekran Resmi 2026-10-02 10.16.01.png` | Kategori yönetimi |
| S26 | `Ekran Resmi 2026-10-02 10.16.06.png` | Marka yönetimi |
| S27 | `Ekran Resmi 2026-10-02 10.16.10.png` | Nitelik yönetimi: boş liste |
| S28 | `Ekran Resmi 2026-10-02 10.16.13.png` | Özel alan yönetimi: boş liste |
| S29 | `Ekran Resmi 2026-10-02 10.16.17.png` | Uyumluluk grupları: boş liste |
| S30 | `Ekran Resmi 2026-10-02 10.16.20.png` | Ürün etiketleri |
| S31 | `Ekran Resmi 2026-10-02 10.16.23.png` | Arama eşleştirme: boş liste |
| S32 | `Ekran Resmi 2026-10-02 10.16.30.png` | Arama konsolu |
| S33 | `Ekran Resmi 2026-10-02 10.16.40.png` | Yeni Ürün modalı: Genel Bilgiler |
| S34 | `Ekran Resmi 2026-10-02 10.16.51.png` | Yeni Kategori modalı: Genel Bilgiler |
| S35 | `Ekran Resmi 2026-10-02 10.18.03.png` | Yeni Kupon modalı |
| S36 | `Ekran Resmi 2026-10-02 10.18.12.png` | Yeni Promosyon: tür seçimi |
| S37 | `Ekran Resmi 2026-10-02 10.18.21.png` | Yeni Üye İndirimi modalı |
| S38 | `Ekran Resmi 2026-10-02 10.18.29.png` | Yeni Bayi İndirimi modalı |
| S39 | `Ekran Resmi 2026-10-02 10.18.38.png` | Yeni Komisyon Tanımla modalı |
| S40 | `Ekran Resmi 2026-10-02 10.18.48.png` | Sabit İndirim formu |
| S41 | `Ekran Resmi 2026-10-02 10.19.08.png` | Yeni Satış Kotası modalı |
| S42 | `Ekran Resmi 2026-10-02 10.19.29.png` | E-posta Araçları: Bülten Listesi |
| S43 | `Ekran Resmi 2026-10-02 10.19.31.png` | SMS Araçları: Bülten Listesi |
| S44 | `Ekran Resmi 2026-10-02 10.19.57.png` | Yeni Sayfa modalı |
| S45 | `Ekran Resmi 2026-10-02 10.20.07.png` | Sıkça Sorulan Sorular listesi |
| S46 | `Ekran Resmi 2026-10-02 10.20.49.png` | Görsel Yükle: tip seçilmemiş |
| S47 | `Ekran Resmi 2026-10-02 10.20.52.png` | Görsel Yükle: Ürün Resmi seçili |
| S48 | `Ekran Resmi 2026-10-02 10.20.54.png` | Görsel Yükle: Banner Resmi seçili |
| S49 | `Ekran Resmi 2026-10-02 10.21.10.png` | Müşteri Yönetimi listesi |
| S50 | `Ekran Resmi 2026-10-02 10.21.14.png` | Riskli Müşteri Yönetimi: boş liste |
| S51 | `Ekran Resmi 2026-10-02 10.22.06.png` | Tema Ayarları: Tema Seçimi |
| S52 | `Ekran Resmi 2026-10-02 10.22.09.png` | Tema Ayarları: Logo Ayarları |
| S53 | `Ekran Resmi 2026-10-02 10.23.02.png` | Tema Ayarları: Tarayıcı Çubuğu Uyarısı |
| S54 | `Ekran Resmi 2026-10-02 10.23.22.png` | Sipariş Raporları: üst filtreler |
| S55 | `Ekran Resmi 2026-10-02 10.23.25.png` | Sipariş Raporları: alt filtreler |
| S56 | `Ekran Resmi 2026-10-02 10.23.33.png` | Ürün Raporları |
| S57 | `Ekran Resmi 2026-10-02 10.23.37.png` | Üye/Bayi Raporları |
| S58 | `Ekran Resmi 2026-10-02 10.23.41.png` | Sistem Raporları |
| S59 | `Ekran Resmi 2026-10-02 10.26.07.png` | Ödeme Yöntemleri |
| S60 | `Ekran Resmi 2026-10-02 10.26.15.png` | Kargo Firmaları |
| S61 | `Ekran Resmi 2026-10-02 10.26.21.png` | Kargo Ayarları: sabit ücret |

## Ek B — Uygulayıcıya kısa tasarım özeti

Referansın iki katmanlı üst gezinmesini, dar sol ikon şeridini ve beyaz çalışma alanını koru. Yeşil kabuk, filtre, modal başlığı, buton ve seçili alanları siyah yap; açık yeşilleri griye çevir. Kompakt tablo ve çok kolonlu formları aynı düzende tut. Mevcut projenin marka, veri, route, yetki ve API yapısını kullan. Görünmeyen işlevleri doğrulanmış kabul etme. Yeni ticari modüller eklemeyi tasarım uyarlamasının şartı haline getirme.
