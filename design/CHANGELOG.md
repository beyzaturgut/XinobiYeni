# Faz02 tasarım değişiklikleri

## 0.23.0 - 01.10.2026

- WEB-001 ortak yönü, üretim uygulamasından ayrı yüksek doğruluklu HTML/CSS tasarım prototipine dönüştürüldü.
- Gerçek Xinobi logo/demo ürün varlıklarıyla 1440, 1024, 768, 390 ve 320 px tam sayfa PNG çıktıları üretildi.
- Creative/Web Designer ilk QA'sındaki mobil “Temsilidir”, Nobi simgesi, logo boşluğu, XINOBI U ürün çerçevesi ve yatay ray kullanılabilirliği bulguları düzeltildi.
- Desenler ve XINOBI U özel kategori girişleri, görünür focus stili ve responsive scroll-snap eklendi.
- Beş kırılımda 14/14 görsel yüklendi; yatay sayfa taşması yok, tek `h1`/`main` doğrulandı. Üretim web kodu ve deploy değiştirilmedi.

## 0.22.0 - 01.10.2026

- Proje sahibi ortak tek tasarım çalışmasının başlamasını onayladı; Creative Designer ve Web Designer alternatif yönler yerine aynı brief üzerinde birleşti.
- Analiz2 K-01–K-21 fark matrisi, `Sessiz teknoloji / kişisel imza` creative brief ve art direction üretildi.
- İçerik hiyerarşisi ile ürün fotoğrafı, responsive crop, slider/video ve XINOBI U medya kuralları belgelendi.
- WEB-001 için karma hero → XINOBI U → kategoriler → ürün sliderı → keşfet → destek/hikâye/footer ve sabit Nobi sırasını taşıyan responsive wireframe oluşturuldu.
- F02-A11 kapatıldı; F02-A12 kullanıcı `ORTAK TASARIM ONAY` ve yüksek doğruluklu görsel kaynak/çıktı bekliyor. Üretim web kodu değiştirilmedi.

## 0.21.0 - 01.10.2026

- F02-A04 kapsamında `design/flows.md` oluşturuldu; WEB-001–020, ADM-001–012 ve MOB-001–006 bağlantıları tanımlandı.
- Alışveriş, hesap/iade, kurumsal teklif, kişiselleştirme/baskı, AI, panel operasyonu ve mobil eşlik akışlarında hata/yeniden deneme ve sunucu otoritesi sınırları belgelendi.
- D02–D10 karar bağımlılıkları ile Faz03–11 uygulama ve kabul sahipliği eşlendi; panel ve mobil sözleşmeler tamamlanmış ekran olarak gösterilmedi.
- F02-A04 kapatıldı; sıradaki bağımsız teslim F02-A05 `design/editor-spec.md` ve `design/ai-spec.md` olarak belirlendi.

## 0.20.9 - 01.10.2026

- F02-A03 kapsamında çalışan web arayüzüyle eşlenmiş `design/components.md` oluşturuldu.
- Eylem, form, seçim, geri bildirim, navigasyon, ürün, sepet, editör, AI ve çerez bileşenlerinin durum/semantik/klavye/veri sınırları belgelendi.
- Axe düzeltmeleri sonrası gerçek uygulamadaki yardımcı metin rengi `design/tokens.json` 0.2.0 ile eşitlendi; karar kaydına gerekçesi eklendi.
- F02-A03 kapatıldı; sıradaki bağımsız teslim F02-A04 `design/flows.md` olarak belirlendi.

## 0.20.8 - 01.10.2026

- Ana sayfa, Xinobi dünyası ve yasal merkez için iç hedef ve rota bağlantısı smoke testleri eklendi.
- Faz02 planı mevcut kanıtla karşılaştırılarak `design/faz02-open-acceptance.md` açık kabul listesi oluşturuldu.
- Web prototip kanıtları ile panel, mobil, handoff, gerçek cihaz, karar ve gerçek rol/PM eksikleri birbirinden ayrıldı; Faz02 yanlış biçimde tamamlandı işaretlenmedi.

## 0.20.7 - 01.10.2026

- Katalog kategori/arama/sıralama/boş durum, ürün renk varyantı, katalog-favori geçişi, ödeme yöntemi ve basit kişiselleştirme Playwright kapsamına eklendi.
- İlk genişletilmiş koşudaki üç dinamik erişilebilir ad seçicisi daraltıldı; uygulama davranışı değiştirilmedi.
- Kritik etkileşim paketi 18/18, axe/klavye dahil birleşik paket 40/40 ve lint başarılı; deploy yapılmadı.

## 0.20.6 - 01.10.2026

- 20 web rotasına WCAG 2 A/AA ve 2.1 A/AA axe taraması eklendi.
- Açık zeminlerdeki yardımcı gri/amber metin renkleri AA kontrastı sağlayan koyu karşılıklarla güncellendi; iki koyu bölümün vurgu renkleri açıldı.
- Editördeki görsel şekil katmanı düğmesine erişilebilir ad eklendi.
- Üyelik ve ödeme sonucu için ileri/geri Tab odak testleri; tüm paket için tek worker kararlılığı eklendi.
- Final erişilebilirlik paketi 22/22, birleşik Playwright regresyonu 35/35, lint ve 23 rota build başarılı; deploy yapılmadı.

## 0.20.5 - 01.10.2026

- Playwright kritik etkileşim paketi 13 senaryoya genişletildi.
- Üyelik/parola, sipariş seçimi, iade özeti, teklif revizyonu ve gelişmiş editör akışları gerçek Chrome üzerinde otomatik doğrulandı.
- İki belirsiz seçici ve editör araç seçicisi daraltıldı; final regresyon 13/13 geçti.
- Lint ve ağ erişimli temiz production build 23 statik rota ile başarılı oldu; canlı deploy değiştirilmedi.

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

## 0.11.0 - 30.09.2026

- WEB-011 `/hesap/giris` giriş, yeni hesap ve parola yenileme kabuğu eklendi.
- Parola görünürlüğü, autocomplete semantiği ve D10 rıza bekleme durumu tasarlandı.
- Kimlik API'si olmadan form gönderimi ve gerçek oturum/hesap oluşturma devre dışı bırakıldı.
- Ana sayfa hesap ikonu yeni rotaya bağlandı.

## 0.12.0 - 30.09.2026

- WEB-012 `/hesap` profil ve adres yönetimi kabuğu eklendi.
- Profil görüntüleme/düzenleme, iletişim tercihi, adres listesi ve yeni adres demo durumları hazırlandı.
- Tüm müşteri bilgileri örnek olarak etiketlendi; API olmadan kalıcı kayıt veya gerçek müşteri verisi iddiası kurulmadı.
- D10 veri saklama, hesap silme ve iletişim rızası blokajları görünür tutuldu.

## 0.13.0 - 30.09.2026

- WEB-013 `/hesap/siparisler` sipariş listesi, detay ve teslimat zaman çizelgesi eklendi.
- Hazırlanıyor ve kargoda durumları etkileşimli demo senaryoları olarak ayrıldı.
- Gerçek sipariş/kargo/takip numarası, fiyat anlık görüntüsü ve canlı takip iddiası oluşturulmadı.

## 0.14.0 - 30.09.2026

- WEB-014 `/hesap/siparisler/iade` iptal/iade talebi form kabuğu eklendi.
- İşlem türü, ürün, neden, açıklama, dosya bekleme ve demo özet durumları tasarlandı.
- Gerçek talep, uygunluk veya geri ödeme sözü üretilmedi; D03/D10 blokajları görünür tutuldu.
- Sipariş detayındaki iade eylemi yeni rotaya bağlandı.

## 0.15.0 - 30.09.2026

- WEB-015 `/kurumsal/teklif` firma, iletişim, ürün/adet, termin ve proje notu formu eklendi.
- Ürün seçimi görsel önizlemeye, kişiselleştirme tercihi demo özete bağlandı.
- D07 olmadan minimum adet, fiyat, termin veya gerçek teklif üretimi açılmadı.
- Ana sayfanın kurumsal bağlantıları yeni rotaya bağlandı.

## 0.16.0 - 30.09.2026

- WEB-016 `/kurumsal/teklif/takip` teklif durumu, zaman çizelgesi ve revizyon geçmişi eklendi.
- İki demo sürüm arasında geçiş ve oturum içi revizyon notu önizlemesi uygulandı.
- Yetkili teklif, toplam, termin, PDF, onay ve sipariş dönüşümü D07/API gelene kadar kapalı tutuldu.

## 0.17.0 - 30.09.2026

- WEB-017 `/studio/ai` istem, tema, palet, demo alternatif ve hata durumu kabuğu eklendi.
- Üç deterministik görsel düzen seçimi ve temsili ürün önizlemesi hazırlandı; gerçek AI çıktısı iddia edilmedi.
- Kota, sağlayıcı, içerik politikası, veri saklama, baskı uygunluğu ve editöre aktarım D08/D10/D04 gelene kadar kapalı tutuldu.
- Gelişmiş editörden AI fikir ekranına bağlantı eklendi.

## 0.18.0 - 30.09.2026

- WEB-018 `/asistan` ürün keşfi, karşılaştırma ve kurumsal yönlendirme konuşma kabuğu eklendi.
- Sabit demo yanıtlar, ürün kartı ve mesaj gönderilmedi geri bildirimi hazırlandı.
- AI üretimi, hassas veri, konuşma saklama, canlı destek/WhatsApp devri ve kesin ürün önerisi iddiaları engellendi.
- Ana sayfa hikâye eylemi asistana bağlandı.

## 0.19.0 - 30.09.2026

- WEB-019 `/xinobi` kurumsal hikâye ve içerik önizleme sayfası eklendi.
- Marka yaklaşımı, tasarım ilkeleri, malzeme anlatısı, içerik kartları ve ürün/asistan yönlendirmeleri hazırlandı.
- Henüz CMS'de yayınlanmayan metin ve içerikler prototip olarak işaretlendi; nihai kurumsal içerik iddiası engellendi.
- Ana ve mobil menü ile footer bağlantıları yeni kurumsal rotaya bağlandı.

## 0.19.1 - 30.09.2026

- `/xinobi` üst menü bağlantıları ana sayfadaki `0.86rem` navigasyon ölçüsüyle eşitlendi.
- `/xinobi` footer menüsü ana sayfadaki `0.82rem` bağlantı ölçüsüyle eşitlendi.

## 0.20.0 - 30.09.2026

- WEB-020 `/yasal` gizlilik, çerez, kullanım ve mesafeli satış belge alanları eklendi.
- Tüm web rotalarında erişilebilen responsive çerez tercih paneli hazırlandı.
- Zorunlu, analitik ve pazarlama kategori durumları gösterildi; gerçek çerez, analitik, pazarlama veya kalıcı rıza kaydı oluşturulmadı.
- D10, hukuk metni, üçüncü taraf envanteri ve iletişim kanalı blokajları kullanıcıya görünür kılındı.

## 0.20.1 - 30.09.2026

- Ana sayfa, katalog ve ürün detayı gerçek Chrome render görüntüleriyle ilk görsel QA grubundan geçirildi.
- Katalog mobil başlık ölçüsü ve yatay taşma koruması dar ekran için iyileştirildi.
- Global çerez paneli metninin grid içinde güvenli küçülmesi sağlandı.
- macOS headless Chrome'un 390 px ekran görüntüsünde minimum layout viewport farkı kaydedildi; 500 px dar ekran geçti, 390 px gerçek cihaz testi açık bırakıldı.

## 0.20.2 - 01.10.2026

- Favori, giriş, hesap, sipariş, iade ve kurumsal teklif/takip ekranları 500 px Chrome görsel QA grubundan geçirildi.
- Üç öğeli mobil üst menülerde kapatma bağlantısının ikinci satıra düşmesine neden olan ortak grid sorunu düzeltildi.
- Giriş, iade, AI tasarım ve satış asistanı başlıkları düzeltme sonrası yeniden render edilerek doğrulandı.

## 0.20.3 - 01.10.2026

- Sistem Chrome'u üzerinde çalışan Playwright etkileşim/klavye test altyapısı eklendi.
- Çerez panelinin kapatma, yeniden açma, kategori ve prototip tercih geri bildirimi otomatikleştirildi.
- Arama, Escape ile temizleme ve en fazla üç ürün karşılaştırma sınırı otomatikleştirildi.
- Ödeme sonucu başarısız/başarılı durumları Enter ve Space klavye girdileriyle doğrulandı.
- Arama alanındaki görünür ESC ipucu gerçek davranışa bağlandı.

## 0.20.4 - 01.10.2026

- Playwright kritik etkileşim paketi 3 senaryodan 8 senaryoya genişletildi.
- Sepet adet/kaldırma/boş durum, hesap profil/adres demo kaydı ve kurumsal teklif özet akışları eklendi.
- AI tasarım alternatif/seçim/hata dönüşü ve satış asistanı konu/mesaj/temizleme akışları otomatikleştirildi.
