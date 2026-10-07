# Faz02 tasarım kararları

Sürüm: `0.2.0` · Tarih: 01.10.2026 · Durum: Web yönü uygulandı, geniş kapsam incelemesi bekliyor

## Geri bildirim kaydı

- 30.09.2026: Proje sahibi WEB-001 yerel tasarımını inceledikten sonra “gayet iyi” geri bildirimi verdi ve devam edilmesini istedi. Bu geri bildirim yaratıcı yönün sürdürülmesine izin verir; Faz02'nin yedi rol/PM nihai kabul kapısı yerine geçmez.
- 01.10.2026: WCAG A/AA axe taramasındaki kontrast bulguları sonrası yardımcı metin tokeni `#52605D` olarak koyulaştırıldı. Yirmi web rotası final taramada kritik/ciddi ihlal olmadan geçti; bu otomasyon manuel ekran okuyucu kabulü yerine geçmez.

## Yaratıcı yön

`Sessiz teknoloji`: ürün fotoğrafını merkeze alan, açık yüzeyler ve koyu teknik alanlarla dengelenen, gereksiz dekorasyondan kaçınan premium ev teknolojisi dili.

## Kaynaklar

- Yetkili Xinobi logo kaynağı: `design/logo/xinobi logo beyaz.pdf`.
- Demo ürün kaynağı: `demo ürünler/`; ürün adları ve ticari bilgiler temsili olarak işaretlenir.
- Referans: Dyson Türkiye. Alınan ilkeler büyük ürün görseli, açık bilgi hiyerarşisi, kısa CTA metni ve kategori keşfidir. Dyson varlıkları, kodu veya özel fontu kopyalanmaz.

## Tipografi kararı

Dyson'ın marka tipi kamuya açık bir font lisansı olarak doğrulanamadığı için kullanılmadı. Türkçe karakter kapsamı, okunabilirlik, değişken ağırlık ve web optimizasyonu nedeniyle `Inter` seçildi; Next.js tarafından self-host edilir ve istemciden Google'a istek gönderilmez.

## Görsel kararlar

- Beyaz Xinobi logo yalnız koyu yüzeylerde kullanılır.
- Ürün fotoğraflarındaki gerçek metal/renk dokusu korunur; yapay baskı alanı uydurulmaz.
- Fiyat, indirim, teslimat ve stok iddiası gerçek API verisi olmadan gösterilmez.
- D04 kapanmadığı için kişiselleştirme alanı prototip açıklaması taşır, üretim ölçüsü vaat etmez.

## İlk uygulama kapsamı

- Responsive global header ve footer.
- Ana sayfa hero, değer şeridi, öne çıkan ürünler, kategori keşfi, kişiselleştirme tanıtımı ve marka hikâyesi.
- Klavye odağı, içeriğe geç bağlantısı, semantik başlıklar, azaltılmış hareket desteği ve açıklayıcı görsel alternatifleri.

## Açık incelemeler

- Marka sahibi logo kullanım boşluğu ve renk yönünü onaylamalı.
- Demo ürünlerin satış adları, varyantları ve kullanım hakkı doğrulanmalı.
- D02 gelince ürün/varyant verisi; D04 gelince kişiselleştirme/baskı alanı gerçek sözleşmeye bağlanmalı.
- Dar telefon, tablet ve masaüstü görsel regresyonu TST raporuyla tamamlanmalı.

## DES-HDR-01 — Header ölçüleri dyson.com.tr ile eşlendi (07.10.2026)

- **Karar sahibi:** Proje sahibi (sohbet talebi: "header alanının font ve puntolarını … aynısı olsun; şerit kalınlığı ve her şeyin boyutu aynı olsun").
- **Önceki kural ile ilişki:** Faz02, Dyson'ı yalnız ilke referansı sayıyor ve birebir düzen kopyalanmasını yasaklıyordu. Proje sahibi bu kuralı **yalnız global header için** değiştirdi. Dyson'ın logosu, metinleri, görselleri ve lisanslı font dosyası kullanılmadı; yalnız ölçüler eşlendi.
- **Ölçüm:** 07.10.2026'da Chrome headless ile dyson.com.tr hesaplanmış stilleri; 1920–390 px arasında 13 genişlik.
- **Uygulanan değerler:** üst şerit 53 px (52 + 1 px `#333` çizgi); ana şerit 64 px; içerik en fazla 1270 px, en az 64 px kenar; üst bağlantılar 14/18 px, ağırlık 300, aralık 24 px; menü 16/24 px, ağırlık 300, açılır ok 10×6 px, aralık 22/12 px; logo yüksekliği 28 px (mobil 24 px); arama kutusu 245×34 px, beyaz, köşe 4 px, ikon 18 px, yer tutucu `#757575` 16 px; ikonlar 24 px, aralık 24 px. ≤1024 px: tek 64 px şerit, kenar 50 px (≤600 px'de 25 px), 16 px hamburger.
- **Font:** Dyson Futura lisanslı ve kullanılamaz; header için açık lisanslı, Futura'dan esinlenen **Jost** (Google Fonts, latin-ext) kullanıldı. Sayfa gövdesi Inter'de kaldı. K-10 "sayfalarda aynı font" ilkesi açısından header'ın farklı font kullanması proje sahibinin onayına sunuldu; tüm siteye geçiş ayrıca kararlaştırılabilir.
- **Bilinçli farklar:** Xinobi logosu kare oranlı olduğu için 28 px yükseklikte genişliği 32 px (Dyson 74 px). Hesap, favori ve duyuru ikonları korundu; mobilde hesap ve favori hamburger menüye taşındı, duyuru ikonu kaldı; bu yüzden 390 px'de arama kutusu 157 px (Dyson 173 px). İkonlar görsel olarak 24 px, dokunma alanı 44 px (HND-02).

### DES-HDR-01 revizyon 1 — Tek şerit header (07.10.2026)

- **Karar sahibi:** Proje sahibi ("üst header alanını tek şeride indir, logoyu en sola koy, Xinobi dünyasını XINOBI U yanına yaz, üst satırdaki diğer şeyleri sil; logo çok küçük kaldı").
- Üst şerit (53 px) kaldırıldı; header tek 64 px şerit (Dyson ana şerit ölçüsü korunur).
- Sıra: logo (en solda, 44 px yükseklik; mobil 40 px) → Ürünler · Kategoriler · XINOBI U · Xinobi dünyası → arama ve ikonlar sağda. Logo ile menü arası 40 px.
- "Kurumsal teklif" ve "Destek" header'dan çıkarıldı. Erişim: ana sayfa footer bağlantıları ve Nobi asistan düğmesi; footer'ın tüm sayfalara eklenmesi web tasarım onayında ayrıca kararlaştırılacak.
- Menü, arama kutusu, ikon ve mobil ölçüleri DES-HDR-01 ile aynı kalır.

## DES-MOB-01 — Mobil arayüz web tasarımından türetildi (07.10.2026)

- **Bağlam:** Proje sahibi mobil işe başlamak istedi; WEB TASARIM ONAY müşteri değişiklikleri nedeniyle ertelendi (F02-A17) ve ayrı iOS/Android tasarımı (F02-A10) henüz yok.
- **Karar:** Flutter ekranları onay bekleyen mevcut web tasarımından türetildi: tek şerit siyah header (64 px, logo 40 px, beyaz arama kutusu), Jost başlık + Inter gövde, web renk paleti, ürün kartı (◉ N renk rozeti, kısaltılmış ad, fiyat), web ana sayfa sırası. Mobil gezinme için web'in hamburger menüsü yerine platforma uygun alt sekme çubuğu (Ana sayfa, Ürünler, XINOBI U) kullanıldı.
- **Tek kaynak:** Renk, font ve header ölçüleri `design/tokens.json` (v0.3.0) içinde; `pnpm tokens:mobile` Dart tokenlarını üretir, Flutter testi uyumu denetler. Müşteri tasarım değişikliği geldiğinde önce tokenlar değişir, web ve mobil birlikte güncellenir.
- **Bilinen sınır:** Admin'deki slider ve XINOBI U görselleri yazı içeren geniş masaüstü bannerları (~2,5:1). Mobil bunları 2,4:1 kadrajda gösterir; dikey mobil görsel alanı Faz04 slider medyası işiyle eklenmelidir.
- **Durum:** Geçici; F02-A10 mobil tasarım teslimi ve web tasarım onayıyla birlikte yeniden değerlendirilir.
- **rev.1 (07.10.2026, proje sahibi):** Mobil header'dan arama kutusu kaldırıldı; sağda Favorilerim (kalp) ve Haber ve duyurular (zarf, okunmamış sayısı rozetiyle) düğmeleri var. Arama Ürünler sekmesindeki arama alanında. Web header'ı değişmedi.

## DES-XU-01 — XINOBI U'da renk seçimi kaldırıldı (07.10.2026)

- **Karar sahibi:** Proje sahibi ("hangi renkten devam edersiniz kısmını hem web hem mobil için kaldır; üzerine uygulanan desenden ötürü renk fark etmiyor").
- Ürün kartı doğrudan beş soruya gider. Oturum açılırken renk gönderilmezse sunucu, önizleme fotoğrafı için ürünün görseli olan ilk rengini kullanır. Ürün detayından "XINOBI U ile kişiselleştir" ile gelinirse orada seçili renk kullanılır; bu ayrı bir adım değildir.
- Soru ekranında renk adı gösterilmez. Eski `/xinobi-u/renk` bağlantıları sorulara yönlenir.
- Sözleşme: `CreateXinobiUSession.variantId` ve web'in `/api/v1/design-studio/sessions` isteğindeki `variantId` isteğe bağlı.
