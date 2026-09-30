# Faz02 tasarım değişiklikleri

## 0.1.0 - 30.09.2026

- Xinobi logosu ve demo ürün görselleri envanterlendi.
- Dyson Türkiye referansından ürün merkezli hiyerarşi, kategori keşfi ve kısa CTA ilkeleri alındı; marka varlığı ve özel font kopyalanmadı.
- Türkçe desteği ve lisansı uygun `Inter` tipografi ailesi seçildi.
- `Sessiz teknoloji` token seti ve tasarım kararları oluşturuldu.
- WEB-001 ana sayfa için responsive header/footer, hero, ürün, kategori, kişiselleştirme ve marka hikâyesi uygulandı.
- D02/D04 gerektiren fiyat, stok ve baskı iddiaları prototipte kesin veri olarak gösterilmedi.

## 0.2.0 - 30.09.2026

- Proje sahibinin olumlu WEB-001 geri bildirimi kaydedildi.
- WEB-002 `/urunler` kategori/liste rotası eklendi.
- On demo ürün varyantı, Türkçe metin araması, kategori filtresi, sıralama, sonuç sayacı ve boş sonuç durumu uygulandı.
- Ana sayfadaki ürün CTA ve navigasyonu gerçek katalog rotasına bağlandı.
- Fiyat ve stok alanları D02/API verisi gelene kadar açıkça bekleyen bilgi olarak bırakıldı.

## 0.3.0 - 30.09.2026

- WEB-004 `/urunler/cay-makinesi-101` ürün detay rotası eklendi.
- Lacivert, gümüş gri, kırmızı ve rose gold varyant seçimi ürün fotoğrafına bağlandı.
- Özellik anlatımı ve D04'e bağlı Xinobi Studio bekleme alanı eklendi.
- Fiyat/stok doğrulanmadan satın alma eylemi bilinçli olarak devre dışı bırakıldı.
- Çay Makinesi 101 katalog kartları detay sayfasına; hazır olmayan diğer ürünler açık `Hazırlanıyor` durumuna bağlandı.

## 0.4.0 - 30.09.2026

- WEB-005 `/urunler/cay-makinesi-101/kisisellestir` basit kişiselleştirme rotası eklendi.
- Metin, üç yazı stili ve üç renk seçeneği canlı temsili önizlemeye bağlandı.
- D04 kesinleşmeden ürün fotoğrafı üzerinde fiziksel baskı alanı uydurulmadı; önizleme bunun yerine açıkça temsili ayrı bir kartta sunuldu.
- Demo taslağı yalnız oturum içi durum olarak işaretlendi; gerçek kaydetme ve satın alma eylemleri API, fiyat, stok ve üretim kararı gelene kadar sınırlandı.
- Ürün detayı ve ana sayfa Studio bağlantıları kişiselleştirme rotasına bağlandı.

## 0.5.0 - 30.09.2026

- WEB-006 `/urunler/cay-makinesi-101/editor` gelişmiş editör rotası eklendi.
- Metin ve şekil ekleme, katman seçme, görünürlük/kilit durumu ile ön/arka yüz seçimi etkileşimli tasarım kabuğuna bağlandı.
- Medya yükleme, şablon, gerçek konum/boyut, baskı kontrolü ve sepete aktarım bağımlılıkları açık devre dışı durumlarla gösterildi.
- Masaüstünde araç/tuval/katman üçlüsü; tablet ve telefonda sıralı responsive çalışma düzeni hazırlandı.
- Basit kişiselleştirmeden gelişmiş editöre ve geri dönüş bağlantıları kuruldu.
- Yetkili logo kaynağı `design/logo/` altına taşındı ve tasarım kararı yolu güncellendi.

## 0.6.0 - 30.09.2026

- WEB-003 `/arama` arama ve ürün karşılaştırma rotası eklendi.
- Canlı metin araması, hızlı arama terimleri, boş sonuç ve en fazla üç ürün seçimi uygulandı.
- Seçilen ürünler erişilebilir, yatay kaydırılabilir özellik tablosunda karşılaştırıldı.
- D02/API olmadan fiyat veya stok değeri uydurulmadı; bekleme durumu açık gösterildi.
- Ana sayfa arama eylemi ve katalog navigasyonu yeni rotaya bağlandı.

## 0.7.0 - 30.09.2026

- WEB-007 `/favoriler` rotası, boş/yükleniyor/dolu durumlarıyla eklendi.
- Katalog kartlarına erişilebilir favoriye ekleme/çıkarma kontrolü bağlandı.
- Üyelik/API olmadığı için seçimler yalnız tarayıcıda `demo saklama` etiketiyle tutuldu.
- Favori kartlarında fiyat/stok ve hazır olmayan detay rotaları güvenli bekleme durumunda bırakıldı.

## 0.8.0 - 30.09.2026

- WEB-008 `/sepet` rotası demo satır, adet kontrolü, çıkarma ve boş sepet durumuyla eklendi.
- D02/D03 kesinleşmeden fiyat, toplam, stok rezervasyonu veya teslimat vaadi üretilmedi.
- Ödeme eylemi gerekçeli biçimde devre dışı bırakıldı; sunucuda sipariş/ödeme oluşturulmadığı açıklandı.
- Ana sayfa sepet ikonu gerçek rotaya bağlandı.

## 0.9.0 - 30.09.2026

- WEB-009 `/odeme` teslimat ve ödeme yöntemi form kabuğu eklendi.
- Kart/havale seçenekleri gösterildi; gerçek hassas ödeme alanları ve işlem eylemi kapalı tutuldu.
- D02/D03/D05 bağımlılıkları ve verinin gönderilmediği açıkça belirtildi.

## 0.10.0 - 30.09.2026

- WEB-010 `/odeme/sonuc` bekleyen, başarısız ve başarılı ödeme sonucu senaryoları eklendi.
- Tüm durumlar tasarım önizlemesi olarak etiketlendi; gerçek tahsilat veya sipariş numarası üretilmedi.
- Sağlayıcı dönüşü, sunucu doğrulaması ve sipariş kesinleştirme sırası görünür kılındı.
