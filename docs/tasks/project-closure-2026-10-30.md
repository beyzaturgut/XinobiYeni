# Xinobi - Fazlara işlenmiş tam kapanış listesi / 30.10.2026

**03.11 kapsam değişikliği:** [Sipariş tasarım detayı ve 9 alt task](order-design-detail-scope-2026-11-03.md); KIS-01/05/06 yeni kapsam dışında, KIS-07 sipariş detayı/dosyalar olarak revize. 120 ana ID korundu; kod uygulanmadı.

Kaynak kesiti: `main / de99958`. Aynı 120 task kimliği korunur. Önceki PDF durumları, 30 Ekim uygulama kayıtları ve tarihli test raporları birleştirildi; müşteri girdisi ve teknik iş aynı kayıtta ayrı izlenir. [Makine okunur liste](project-closure-2026-10-30.json).

Bu çalışma dokümantasyon güncellemesidir: kod/SQL/hosting değişmedi, testler yeniden koşulmadı, APK/release/deploy veya gerçek posta/AI/ödeme çağrısı yok. Hiçbir faz için rol/PM/kullanıcı/üretim kabulü verilmedi; eski yüzdeler güncel ölçüm değildir.

**Yeni kapsam durumları:** Kapsam dışı = kullanıcı bu teslimi istemiyor, tamamlandı sayılmaz; Yapıldı - kapsam kararı = yalnız kapsam tanımı verildi, uygulama yapılmadı.

**Durum dili:** Yapıldı - teknik = sınırlı teknik kapsamın kanıtı; Kısmen yapıldı = somut alt işler var; Yapılmadı - kapanış açık = hedef geliştirme/karar/kabul bütünü kapanmadı. Mevcut temel özellikler tamamen yok sayılmaz. QA-01 farklı kaynaklarda son ilgili regresyonları birleştirir; tüm testlerin bu dokümantasyon HEAD’inde koşulduğu iddia edilmez.

| Ana faz | Task sayısı | Güncel kapı |
|---|---|---|
| [Faz01](../../Prompts/Faz01_Kesif_ve_Kararlar.md) | 8 | Bloke - iş kararları ve müşteri girdileri açık |
| [Faz02](../../Prompts/Faz02_Tasarim_ve_UIUX.md) | 3 | Devam - web ve Flutter düzeltildi; manuel erişilebilirlik/handoff kabulü açık |
| [Faz03](../../Prompts/Faz03_Teknik_Altyapi_Kimlik_Veritabani.md) | 21 | Devam - temel regresyon kayıtlı; SQL/güvenlik/posta/işletim kabulü açık |
| [Faz04](../../Prompts/Faz04_Katalog_Stok_Fiyat_Icerik_SEO.md) | 14 | Devam - katalog teknik kabulü var; veri ve ticari altyapı eksikleri açık |
| [Faz05](../../Prompts/Faz05_ETicaret_Odeme_Siparis.md) | 13 | Bloke - gerçek ödeme, rezervasyon, kargo ve ticari kabul açık |
| [Faz06](../../Prompts/Faz06_Kisisellestirme_Editor_Baski.md) | 8 | Planlandı - sipariş yerleşimi ve üç görsel teslimi; üretim hazırlığı kapsam dışı |
| [Faz07](../../Prompts/Faz07_Kurumsal_Teklif_Toplu_Siparis.md) | 8 | Bloke - D07 ve firma/teklif-sipariş teslimleri açık |
| [Faz08](../../Prompts/Faz08_Mikro_Muhasebe_Entegrasyonu.md) | 8 | Bloke - Mikro erişim/alan sözleşmesi ve gerçek adaptörler açık |
| [Faz09](../../Prompts/Faz09_Pazaryerleri_Merkezi_Siparis.md) | 8 | Bloke - üç kanalın erişimi, adaptörleri ve mutabakatı açık |
| [Faz10](../../Prompts/Faz10_AI_Tasarim_Satis_Asistani.md) | 8 | Devam - üretim mevcut; SQL/kota/moderasyon/kalite kabulü açık |
| [Faz11](../../Prompts/Faz11_Mobil_UAT_Canliya_Gecis.md) | 21 | Devam - Flutter eşliği düzeltildi; kurulum, cihaz, push, mağaza ve final UAT açık |

Her taskın bir ana fazı var; ortak görevler fazların Çapraz bağımlılıklar satırında tekrar sayılmadan bağlanır. Faz00 genel kayıt/karar/takvim ve kapı sahibidir. Alt işler 120 ana taska ek bağımsız kapsam sayılmaz.

## Güncel kanıtlar

- WEB-01 `358d42d`: [task](web-01-catalog-navigation-2026-10-30.md), [TST-136-141](../../test/2026-10-30/TST-136-web01-catalog-navigation.md).
- WEB-02 `c1ba427`: [task ve 23 ürün listesi](web-02-product-detail-2026-10-30.md), [TST-142-149](../../test/2026-10-30/TST-142-web02-product-detail.md).
- WEB-07 `4d32780`: [task](web-07-accessibility-2026-10-30.md), [TST-150-156](../../test/2026-10-30/TST-150-web07-accessibility.md).
- KIS-01 `42bee88`: [task](kis-01-print-profiles-2026-10-30.md), [TST-157-166](../../test/2026-10-30/TST-157-kis01-print-profiles.md).
- Canlı admin `f4f9046`: [TST-167-169](../../test/2026-10-30/TST-167-live-admin-login-diagnosis.md).
- Flutter ana sayfa `de99958`: [TST-170-174](../../test/2026-10-30/TST-170-flutter-home-web-parity.md).
- Son kayıtlı release: [DEPLOY-016 / xinobi-799e1af](../../deployments/DEPLOY-016-admin-category-dialog-prompt-release.md); güncel kaynağın IIS/telefon kurulumu kanıtlanmadı. Canlı admin erişilebilir ama deployment.json 404 olduğu için kaynak sürümü bu kontrolden bilinmiyor.
- Önceki kapsam temeli: [27.10 denetimi](phase-audit-2026-10-27.md), ilgili fazların tarihsel tabloları. Diğer tasklar için yeni canlı doğrulama yapılmadı.

## Faz01 / Keşif, kararlar ve uygulanabilir teslim temeli

**Müşteri/işletme girdileri:** KAR-01...08: kapsam, veri sahipliği, ticaret, sağlayıcı erişimi, baskı şartnamesi, kurumsal satış, AI/mobil, hukuk/işletim kararları; gerçek kişi, tarih ve kabul kaydı.

**Son değişiklik:** 120 task ve güncel as-is envanteri eşlendi. Teknik tercihten iş sahibi onayı üretilmedi; müşteri kararları/atamalar/takvim hâlâ bekliyor.

### KAR-01

**Güncel kapsamı ve teslim sınırını onayla** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D01/D12/D13 kapsamında Market hesabı, Desenler ve kapsam dışı panel modüllerini karara bağla; eski kayıtları mevcut web, Flutter ve ortak WebView yapısıyla düzelt.

**Yapıldı / mevcut temel:** Mevcut web/API/Flutter ve ortak WebView yaklaşımı kaynaklarda kayıtlı; 120 maddelik kapanış planı var.

**Yapılmadı / açık kalan:** Kapsam dahil/hariç listesi ve D01/D12/D13 için iş sahibi imzalı güncel karar eksik.

**Kapanış kanıtı:** Her kapsam maddesi dahil/hariç, karar sahibi, tarih ve kabul senaryosuyla eşlenmiş; sessiz kapsam daraltma yok.

**Bağımlılıklar:** Yok.

### KAR-02

**Veri sahipliğini alan bazında belirle** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D02 için ürün, SKU, fiyat, kanal fiyatı, stok, depo, cari, sipariş ve faturanın ana kaynağını; yazma yönü ve çakışma önceliğini belirle.

**Yapıldı / mevcut temel:** Katalog ve hesaplar için SQL depoları, panel kayıt yolları ve mevcut veri akışı bulunuyor.

**Yapılmadı / açık kalan:** Ürün, fiyat, stok, depo, cari, sipariş ve fatura için ana kaynak/yazma yönü/çakışma kararı onaylanmadı.

**Kapanış kanıtı:** Web, panel, Mikro ve pazaryeri arasında her alanın tek yetkili yazıcısı veya açık uzlaştırma kuralı var.

**Bağımlılıklar:** KAR-01.

### KAR-03

**Ticaret durum makinesini kesinleştir** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D03 kapsamında sipariş kesinleşmesi, rezervasyon süresi, eksi stok, vergi, kargo, taksit, havale, iptal ve kişiselleştirilmiş iade kurallarını tanımla.

**Yapıldı / mevcut temel:** Sunucu fiyatıyla sipariş, yinelenen sipariş isteğini önleme ve temel iptal/iade durumları mevcut.

**Yapılmadı / açık kalan:** Rezervasyon, tahsilat kesinleşmesi, vergi/kargo/taksit/havale ve kişiselleştirilmiş iade kararları açık.

**Kapanış kanıtı:** Başarılı, başarısız, zaman aşımı ve yinelenen işlem için onaylı geçiş tablosu var; geçici 14 gün kuralı ayrıca değerlendirilmiş.

**Bağımlılıklar:** KAR-02.

### KAR-04

**Sağlayıcı ve sandbox erişimlerini tamamla** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D05/D06 için ödeme, kargo, e-posta, SMS, AI, Mikro ve üç pazaryeri erişim/sözleşme/limit envanterini tamamla; sırları güvenli ortamda tut.

**Yapıldı / mevcut temel:** Bazı sağlayıcı istemcileri ve mevcut yapılandırma yolları kodda var; Cloudflare/Nobi geçmiş kayıtları bulunuyor.

**Yapılmadı / açık kalan:** Tüm sağlayıcılar için sahipli erişim, sandbox, limit ve test hesabı envanteri tamamlanmadı; kodun varlığı erişim kanıtı değil.

**Kapanış kanıtı:** Her bağlantının teknik muhatabı, test ortamı, yetkisi, kota bilgisi ve erişim kontrol kanıtı var.

**Bağımlılıklar:** KAR-01.

### KAR-05

**Sipariş tasarım dosyası teslim sınırını kaydet** — P0 / Karar / kabul / **Yapıldı - kapsam kararı**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** 03.11 kullanıcı kararını uygula: kayıtlı editör yerleşimi, ayrı desen ve ürün kaynak görseli indirmesi, gösterilebilir/indirilebilir giydirilmiş dijital önizleme; üretime hazırlık/gönderim yok.

**Yapıldı / mevcut temel:** KIS-01 ile mm/DPI/taşma/renk/format alanları, sürümlü profil ve kalibrasyon SVG altyapısı eklendi. 03.11: Kullanıcı üretim hazırlığı istemediğini ve yalnız sipariş yerleşimi/üç görsel teslimini açıkça belirtti; planlama istendi.

**Yapılmadı / açık kalan:** Kapsam kararı kaydedildi; ekran ve dosya teslim uygulaması KIS-03/KIS-07 altında açık. Fiziksel mm/DPI/ICC/numune bilgisi bu bölümün önkoşulu değil.

**Kapanış kanıtı:** Kapsam kararı faz/tasklarda tutarlı; SIP-TAS-01...09 uygulama ve kabulü ayrıca kapanır.

**Bağımlılıklar:** KAR-01

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KAR-06

**Kurumsal satış modelini netleştir** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D07 için firma başvurusu, teklif sürümü, geçerlilik, onay, ödeme, toplu sipariş ve fatura modelini kararlaştır.

**Yapıldı / mevcut temel:** Kurumsal talep, mesaj, teklif sunma ve kabul/red akışları mevcut.

**Yapılmadı / açık kalan:** Firma modeli, teklifin siparişe hangi koşulda dönüşeceği, ödeme/fatura ve toplu sipariş modeli için D07 onayı eksik.

**Kapanış kanıtı:** Kabul edilen teklifin hangi koşulda ve kimin eylemiyle tek siparişe dönüştüğü yazılı.

**Bağımlılıklar:** KAR-03.

### KAR-07

**AI ve mobil ürün sınırlarını onayla** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D08/D09 için AI alternatif sayısı, kota/maliyet, içerik politikası, editör eşliği, cihaz matrisi, push ve mağaza hesaplarını belirle.

**Yapıldı / mevcut temel:** Tek aday AI üretimi tercihi kaydedildi; web/mobil ortak editör yaklaşımı uygulanmış durumda.

**Yapılmadı / açık kalan:** Kota/bütçe, içerik/lisans politikası, alternatif kapsamı, hedef cihazlar, push ve mağaza sorumluluklarının tamamı kabul edilmedi.

**Kapanış kanıtı:** Ürün sahibi kabul hedefleri, izin verilen özellikler ve maliyet tavanını imzalamış; WebView yaklaşımı güncel kayıtta yer alıyor.

**Bağımlılıklar:** KAR-04.

### KAR-08

**Hukuk, işletim ve kalite girdilerini kapat** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Ürün sahibi + PM + ilgili operasyon sahibi. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D10/D11/D14 için hukuk/muhasebe değerlendirmelerini, saklama/silme, ticari izin, fatura sorumluluğu, SLA, RPO/RTO ve bakım bütçesini topla.

**Yapıldı / mevcut temel:** Politika/işletim taslakları, yasal ekranlar ve dağıtım runbook kayıtları mevcut.

**Yapılmadı / açık kalan:** Hukuk/muhasebe onaylı metinler, saklama/silme, SLA, RPO/RTO, maliyet ve bakım sorumluları kesinleşmedi.

**Kapanış kanıtı:** Uzman onaylı metin ve politika sürümleri, ölçülebilir hedefler ve sorumlular kayıtlı; bu task hukuki uygunluk beyanı değildir.

**Bağımlılıklar:** KAR-01.

## Faz02 / Xinobi yaratıcı yön, UI/UX ve tasarım teslimi

**Müşteri/işletme girdileri:** Onaylı görsel yön/hi-fi/handoff ve hedef cihaz/erişilebilirlik matrisi. Teknik ekip manuel klavye/ekran okuyucu/zoom ve tasarım kusuru kapatmalarını ayrıca yürütür.

**Son değişiklik:** WEB-07 (4d32780): 52 rota/boyut, 27 benzersiz test ve 15 ek axe taraması. Flutter ana sayfa önizlemesi (de99958): ürün ayrı satır, soru kartı altta, desen sağında; 7 odaklı test ve 79 tam mobil test. Bu sonuçlar VoiceOver/TalkBack veya tasarım teslim onayı değil.

### WEB-07

**30.10 ek teknik kanıt:** [Web görsel/durum matrisi](../../design/web-consistency-audit-2026-10-30.md), [TST-179](../../test/2026-10-30/TST-179-web-consistency.md). 264 rota/boyut/metin kontrolü; gerçek cihaz/handoff kabulü açık.

**Duyarlı tasarım ve erişilebilirlik kusurlarını kapat** — P1 / Doğrulama / **Kısmen yapıldı**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Klavye, ekran okuyucu, odak dönüşü, modal, hata duyurusu, kontrast, büyük metin ve küçük ekran kontrollerini tamamla.

**Yapıldı / mevcut temel:** Klavye/odak/dialog, mobil menü, Nobi canlı günlük, kontrast ve %200 metin düzeltildi. 52 rota/boyut kontrolü, 27 benzersiz test ve 15 ek axe taraması geçti.

**Yapılmadı / açık kalan:** Gerçek Safari/VoiceOver, iOS/Android VoiceOver/TalkBack, tarayıcı zoom/OS ölçeği ve Creative/UX-handoff kabulü açık.

**Kapanış kanıtı:** Manuel cihaz/ekran okuyucu kayıtları var; kritik akışlarda taşma, erişilemeyen CTA veya odak tuzağı kalmamış.

**Bağımlılıklar:** QA-03.

### ADM-08

**Panel veri dili ve kullanıcı deneyimini temizle** — P1 / Doğrulama / **Kısmen yapıldı**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Gerçek SQL kataloğunda kalan örnek/demo etiketlerini veri kaynağına göre düzelt; taslak koruma, onay penceresi, toplu işlem ve dar ekranı kabul et.

**Yapıldı / mevcut temel:** Sahte metrik/depo/entegrasyon başarıları kaldırıldı; kategori onay penceresi ve fotoğraf prompt alanı iyileştirildi. KIS-01 gerçek profil ekranı eklendi.

**Yapılmadı / açık kalan:** Global navigasyonda taslak/toplu işlem politikası ve gerçek SQL/rol/operasyon/cihaz/handoff kabulü açık.

**Kapanış kanıtı:** Gerçek işlem sahte başarı göstermiyor; kaydedilmemiş değişiklik kaybolmuyor; son kategori penceresi ve prompt alanı regresyondan geçiyor.

**Bağımlılıklar:** QA-04.


**30.10 ek kanıt:** [16 modül tutarlılık matrisi](../../design/admin-consistency-audit-2026-10-30.md), [TST-188](../../test/2026-10-30/TST-188-admin-consistency.md). Hata/başarı, taslak, readonly içerik/yüzey, tablo/pencere/kontrast ve bilinmeyen sayaç düzeltildi.

### QA-03

**03.11 SIP-TAS-09:** [Admin sipariş tasarım detayı kabul matrisi](../../design/order-design-acceptance-2026-11-03.md): 4 genişlik × normal/%200 metin, axe, klavye/odak/duyuru otomasyonu; ekran okuyucu/cihaz açık.

**03.11 ek teknik kanıt:** [Flutter 32 rota × 3 genişlik × 2 metin ölçeği matrisi](../../design/flutter-consistency-audit-2026-11-03.md); Android emülatör OS %200 yazı kontrolü. TalkBack/VoiceOver ve iOS açık.

**30.10 ek teknik kanıt:** [33 ekran görsel/durum denetimi](../../design/web-consistency-audit-2026-10-30.md); Chrome/fixture kanıtı manuel ekran okuyucu kabulü değildir.

**Erişilebilirlik ve tasarım teslimini kabul et** — P1 / Doğrulama / **Kısmen yapıldı**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Web/admin/Android/iOS ekran matrisi, hi-fi/handoff, klavye ve VoiceOver/TalkBack tutanaklarını tamamla.

**Yapıldı / mevcut temel:** WEB-07 otomatik tarama, klavye/odak ve %200 metin düzeltmeleri; tarihli test/audit kaydı var. de99958 native Flutter ana sayfa yerleşimi 7 odaklı testle doğrulandı; fiziksel cihaz değil.

**Yapılmadı / açık kalan:** Web/admin/Android/iOS tam matris, gerçek VoiceOver/TalkBack ve Creative/UX/handoff imzaları eksik.

**Kapanış kanıtı:** Creative/UX/Frontend onayı var; otomatik tarama yanında manuel cihaz kanıtı bulunuyor; kritik erişilebilirlik kusuru kalmamış.

**Bağımlılıklar:** KAR-01.

### Alt işler (ana taskı parçalar; yeni ana task sayılmaz)

| Alt iş | Ana task | Durum | Kapanış / kalan |
|---|---|---|---|
| WEB-07-UAT-01 | WEB-07, QA-03 | Açık | Safari/macOS VoiceOver ile gerçek duyurular, hata, başlık ve odak kontrolü. |
| WEB-07-UAT-02 | WEB-07, QA-03 | Açık | Gerçek Android/iOS: TalkBack/VoiceOver, sanal klavye, büyük metin ve yön değişimi. |
| WEB-07-UAT-03 | WEB-07, QA-03 | Açık | Gerçek tarayıcı zoom/OS metin ölçeği ile Creative/UX/handoff kabul kaydı. |

## Faz03 / Teknik temel, kimlik ve veritabanı iskeleti

**Müşteri/işletme girdileri:** İzinli gerçek posta test alıcısı ve SMTP/Resend yapılandırması; domain/sertifika ve DBA restore yetkisi; hukuk onaylı saklama/izin metinleri. Parola/anahtar rapora yazılmaz.

**Son değişiklik:** 42bee88: profil sürüm/CAS/yetki/sipariş snapshot testleri; API 496 başarılı, 29 opt-in test atlandı. f4f9046: canlı /admin/ giriş formu ve girişsiz oturum/katalog/tasarım 401 doğrulandı; yeni auth kodu eklenmedi, gerçek parola/MFA/e-posta teslimi denenmedi.

### ADM-01

**Kalıcı rol ve yetki yönetimini tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut salt okunur izin görünümüne onaylı rol CRUD, kullanıcı atama/geri alma ve sunucu politikası ekle; son yönetici korumasını tasarla.

**Yapıldı / mevcut temel:** Personel oturumu/MFA, rota izinleri ve gerçek oturum izinlerinin salt okunur gösterimi var.

**Yapılmadı / açık kalan:** Kalıcı rol CRUD, atama/geri alma, son yönetici koruması ve bütün izin değişimlerinin audit kabulü eksik.

**Kapanış kanıtı:** UI gizleme tek güvenlik değil; API yetkisiz yazımı reddediyor; izin değişimi ve geri alma audit ile izleniyor.

**Bağımlılıklar:** KAR-01, SEC-01.

### ADM-06

**Tüm kayıtlar için sunucu aramasını tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Teklif, tasarım, AI kullanım ve ihtiyaç duyulan sipariş ekranlarında mevcut sayfa/yüklenen kayıt filtresi yerine gerçek sorgu uygula.

**Yapıldı / mevcut temel:** Bazı listelerde sayfalama ve yüklenmiş kayıt araması var; tek sipariş detayına liste dışından erişim düzeltildi.

**Yapılmadı / açık kalan:** Teklif/tasarım/AI ve gerekli sipariş aramalarında tüm geçmişi kapsayan sunucu sorgusu tamamlanmadı.

**Kapanış kanıtı:** Eski tarihli ve ilk sayfa dışındaki kayıt bulunuyor; sayfalama toplamı ve tarih filtresi tutarlı; yetki korunuyor.

**Bağımlılıklar:** SEC-04.

### ADM-07

**Bildirim ve hata işi operasyonunu bağla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kuyrukta/bekliyor/gönderildi/teslim/red ayrımını sağlayıcı kimliğiyle göster; dead-letter inceleme ve kontrollü tekrar ekle.

**Yapıldı / mevcut temel:** Bildirim kuyruğu ve mevcut panel inceleme/tekrar parçaları var.

**Yapılmadı / açık kalan:** Gerçek teslim/red sağlayıcı kimlikleri, dead-letter, sınırlandırılmış retry ve operatör alarm kabulü açık.

**Kapanış kanıtı:** Yeniden kuyruğa alma teslim diye gösterilmiyor; retry sınırı ve audit var; kritik başarısızlık operatöre bildiriliyor.

**Bağımlılıklar:** SEC-06, OPS-04.

### SEC-01

**Gerçek SQL oturum ve admin MFA kabulü yap** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Müşteri/personel ayrımı, davet, kod teslimi, eşzamanlı refresh, iptal, logout ve yetki geri alımını gerçek izole oturumla dene.

**Yapıldı / mevcut temel:** Personel/müşteri ayrımı, MFA/davet, yetki, refresh/logout altyapısı ve izole testler mevcut. f4f9046 canlı giriş formu/anonim 401 kontrolü var; gerçek MFA teslimi doğrulanmadı.

**Yapılmadı / açık kalan:** Güncel izole SQL + gerçek kod teslimli oturum/eşzamanlı refresh/yetki geri alımı kabul paketi açık.

**Kapanış kanıtı:** Mock dışı kanıt var; yetkisiz 401/403 tutarlı; MFA atlanamıyor; e-posta teslimi gerçek test alıcısında doğrulanmış.

**Bağımlılıklar:** KAR-04, QA-02.

### SEC-02

**Sürümlü yasal onay ve ileti iznini kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Hukukça verilen metin sürümü, ödeme öncesi onay, izin/geri alma, İYS bağlantısı ve anonim tercih kaydını uygula.

**Yapıldı / mevcut temel:** Yasal ekranlar ve tercih arayüzünün mevcut parçaları var.

**Yapılmadı / açık kalan:** Hukuk onaylı metin sürümü, ödeme onay kaydı, ileti izin/geri alma ve İYS bağlantısı tamamlanmadı.

**Kapanış kanıtı:** Sipariş anındaki onay kanıtı saklı; zorunlu olmayan izin satın alma şartı değil; tercih tüm gönderim kanallarına uygulanıyor.

**Bağımlılıklar:** KAR-08.

### SEC-03

**Saklama, dışa aktarma ve silmeyi uçtan uca tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Hesap, oturum, AI konuşma, tasarım, preview, log, dosya ve yedek saklama/silme kurallarını otomatik işlere bağla.

**Yapıldı / mevcut temel:** Hesap silme, oturum temizliği ve bazı dosya yaşam döngüsü kontrolleri var.

**Yapılmadı / açık kalan:** AI konuşmaları, loglar, önizlemeler, dosyalar ve yedekler dahil politika tabanlı tam saklama/silme/dışa aktarma açık.

**Kapanış kanıtı:** Silme testi veriyi izin verilen kapsamda temizliyor; yasal saklama kapsamı ve sipariş kopyası politikası belgeli; iş sonucu izlenebilir.

**Bağımlılıklar:** KAR-08, SEC-06.

### SEC-04

**Nesne ve rol yetkilerini tüm uçlarda tara** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Müşteri, firma, admin, görsel, indirme, teklif, sipariş ve bridge için farklı hesap/rolle erişim matrisi çıkar.

**Yapıldı / mevcut temel:** Sahiplik/rota izni ve özel görsel kontrolleri var; KIS-01 girişsiz/yazma yetkisi sınırları da testli.

**Yapılmadı / açık kalan:** Tüm müşteri/firma/admin/dosya/bridge uçları için eksiksiz farklı hesap/rol matrisi kapanmadı.

**Kapanış kanıtı:** Başkasının kimliğiyle okuma/yazma/indirme reddediliyor; liste ve tekil uç aynı sınırı uyguluyor; stok/iptal yetkileri ayrı.

**Bağımlılıklar:** ADM-01, QA-02.

### SEC-05

**Audit kapsamı ve transaction bağını doğrula** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Fiyat, stok, rol, ayar, sipariş, teklif, iade ve entegrasyon değişimlerini güvenli önce/sonra farklarıyla denetle.

**Yapıldı / mevcut temel:** Audit temeli ve kritik stok/iptal yetki ayrımı bulunuyor.

**Yapılmadı / açık kalan:** Tüm fiyat/stok/rol/ayar/sipariş/teklif/iade/entegrasyon işlemlerinin güvenli farkı ve transaction bağı kabul edilmeli.

**Kapanış kanıtı:** Kritik işlem başarısızsa iş verisi/audit tutarsız kalmıyor; sır/kişisel gövde loglanmıyor; aktör/istek/sonuç izlenebilir.

**Bağımlılıklar:** QA-02.

### SEC-06

**Inbox, outbox ve hata kuyruğunu tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut bildirim claim yapısının üstüne olay tekilleştirme, atomik iş+olay, lease, retry/backoff ve dead-letter yönetimi kur; ayrı worker ihtiyacını ADR ile kapat.

**Yapıldı / mevcut temel:** Bildirim claim/worker ve mevcut idempotent sipariş yolu var.

**Yapılmadı / açık kalan:** Genel atomik iş+olay outbox/inbox, lease/backoff, dead-letter ve worker mimari kararı eksik.

**Kapanış kanıtı:** Çökme ve tekrar senaryosunda iş kaybolmuyor/iki kez yürümüyor; mevcut API hosted service modeli açıkça belgeli.

**Bağımlılıklar:** KAR-03, QA-02.

### SEC-07

**Güvenli upload ve dosya erişim sözleşmesini tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** MIME/imza/boyut kontrollerini koruyarak finalize, zararlı içerik taraması, özel indirme ve imzalı/kısa ömürlü erişim ihtiyacını uygula.

**Yapıldı / mevcut temel:** MIME/boyut kontrolleri, IFileStore ve korumalı tasarım/önizleme okuma mevcut. 03.11 SIP-TAS-07: sipariş tasarım dosyalarında personel+MFA+`orders.read`, sipariş/satır bağlı çözüm, yol aşımı/keyfi URL ve açık medya sızıntısı testleri PASS ([TST-231](../../test/2026-11-03/TST-231-sip-tas-07-file-access.md)).

**Yapılmadı / açık kalan:** Genel finalize ve zararlı içerik taraması; özel indirme/süreli erişim/sahipsiz dosya sözleşmesi tamamlanmadı.

**Kapanış kanıtı:** Dosya türü taklidi, yol aşımı, yarım yükleme ve yetkisiz erişim testleri geçiyor; güvenli erişim ve içerik kontrolü olmadan indirme/işleme açılmıyor.

**Bağımlılıklar:** KAR-08

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### SEC-08

**Güvenlik taraması ve bağımlılık incelemesini kapat** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + güvenlik + hukuk. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Sır taraması, bağımlılık/SAST/DAST, rate limit, HTTPS/cookie/CORS/CSP ve abuse kontrollerini staging sürümünde çalıştır.

**Yapıldı / mevcut temel:** CSRF, yetki, MFA ve mevcut güvenlik yapılandırma/test temeli var.

**Yapılmadı / açık kalan:** Güncel staging’de sır/bağımlılık/SAST/DAST ve HTTPS/cookie/CORS/CSP/rate-limit bütünsel kabulü eksik.

**Kapanış kanıtı:** Kritik/yüksek bulgular kapalı veya sahipli kabul kaydı var; temizleme düzeltmeleri yeniden doğrulanmış.

**Bağımlılıklar:** OPS-01, SEC-04, SEC-07.

### OPS-01

**Alan adı, HTTPS ve ortam ayrımını kapat** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut IIS hosting yapısında domain/TLS, reverse proxy, origin/CORS ve staging/production ayar ayrımını doğrula; yetkileri daralt.

**Yapıldı / mevcut temel:** Mevcut IIS ve dış yapılandırma/deploy yaklaşımı korunuyor.

**Yapılmadı / açık kalan:** Domain/TLS, reverse proxy, origin/CORS, ortam ayrımı ve minimum runtime yetkileri son ortamda kabul edilmeli.

**Kapanış kanıtı:** Web/admin/API ve mobil editör aynı güvenli ortamı kullanıyor; HTTP yayın varsayımları kaldırılmış; staging indeks dışı.

**Bağımlılıklar:** KAR-08.

### OPS-02

**SQL ve medya yedeğini geri yükleyerek doğrula** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** DBA hesabıyla CHECKSUM/VERIFYONLY ve ayrı hedefe restore provası yap; dosya deposu ve DB'nin tutarlı yedek noktasını test et.

**Yapıldı / mevcut temel:** Yedek/restore runbook ve geçmiş bağlantı/migration kayıtları var.

**Yapılmadı / açık kalan:** SQL CHECKSUM/VERIFYONLY ve ayrı hedefe gerçek restore; DB-medya tutarlı geri dönüş provası açık.

**Kapanış kanıtı:** Ölçülen RPO/RTO hedefe uyuyor; örnek sipariş/tasarım dosyası geri geliyor; yalnız yedek dosyası oluşması başarı sayılmıyor.

**Bağımlılıklar:** KAR-08.

### OPS-03

**Dosya deposu ve kapasite işletimini tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut IFileStore için yerel kalıcılık/izin/yedek/kapasiteyi kapat; R2/S3 geçişini yalnız onaylı ihtiyaç varsa planla.

**Yapıldı / mevcut temel:** IFileStore soyutlaması, yerel Storage:LocalRoot ve medya koruyan paketleme yolları mevcut.

**Yapılmadı / açık kalan:** İzin/kapasite/yedek/saklama işletim kabulü tamamlanmadı; R2/S3 yalnız onaylı ihtiyaçla ayrı planlanır.

**Kapanış kanıtı:** Deploy medya üzerine yazmıyor; disk doluluğu alarmı var; özel dosyalar public değil; storage sağlayıcı kararı kayıtlı.

**Bağımlılıklar:** OPS-02, SEC-07.

### OPS-04

**Gerçek bildirim kanallarını kabul et** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** SMTP/Resend, Netgsm ve FCM için kimlik, şablon, izinli alıcı, retry ve teslim/ret durumlarını yapılandırıp test et.

**Yapıldı / mevcut temel:** E-posta/SMS/push sağlayıcıları için mevcut kod/yapılandırma parçaları var.

**Yapılmadı / açık kalan:** İzinli alıcılarda gerçek teslim/red/retry kanıtı ve kanal şablon kabulü tüm kanallar için kapanmadı. Yönetici davet/MFA/sıfırlama gerçek mail kabulü ADM-MAIL-01 altında açık.

**Kapanış kanıtı:** Kanal başına gerçek teslim kanıtı var; Preview modu üretimde açılmıyor; izin ve rate limit uygulanıyor.

**Bağımlılıklar:** KAR-04, SEC-02, MOB-03.

### OPS-07

**Log, alarm ve servis gözlemini tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** API hata/p95, ödeme/webhook, kuyruk, AI maliyet, bildirim, disk ve yedek alarmlarını anlamlı eşiklerle kur.

**Yapıldı / mevcut temel:** İstek korelasyonu, log ve readiness temeli var.

**Yapılmadı / açık kalan:** API p95/hata, ödeme/webhook, kuyruk, maliyet, disk ve yedek için sahipli/eşikli gerçek alarm kabulü eksik.

**Kapanış kanıtı:** Deneme arızası yetkili ekibe ulaşıyor; correlation ID ile istemci-API-provider izi kuruluyor; sır/kişisel veri maskeli.

**Bağımlılıklar:** KAR-08, SEC-06.

### QA-01

**Güncel HEAD için temel regresyonu çalıştır** — P0 / Doğrulama / **Yapıldı - teknik**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** 325ce60 başlangıcından sonra teslim sürümünde .NET, contracts, web/admin lint-build ve Flutter analyze/test koş; atlamaları sınıflandır.

**Yapıldı / mevcut temel:** 42bee88 API: 496 PASS/29 SKIP; contracts drift yok, web/admin lint-build, Dart 9/9. de99958 Flutter: analiz temiz, 79/79 test. Koşular kaynak/ortama göre ayrı kayıtlı; bu dokümantasyon oturumunda yeniden koşulmadı.

**Yapılmadı / açık kalan:** Temel teknik regresyon kapandı. 29 opt-in SQL/dış test atlandı; sağlayıcı, fiziksel numune ve resmi kabul bu taskın sonucu değildir.

**Kapanış kanıtı:** Commit/ortam/komut/tarih/sonuç kayıtlı; atlanan SQL/sağlayıcı testleri başarı diye sayılmıyor; gerçek iş verisi değişmiyor.

**Bağımlılıklar:** Yok.

### QA-02

**İzole SQL entegrasyon test ortamını kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ayrı silinebilir test DB'sinde migration, rollback, transaction, idempotency, rezervasyon ve kalıcılık testlerini kur.

**Yapıldı / mevcut temel:** İzole dosya/HTTP test altyapısı ve isteğe bağlı SQL test kaynakları var; restart fixture izolasyonu düzeltildi.

**Yapılmadı / açık kalan:** Ayrı silinebilir SQL test DB’sinde tüm gerekli transaction/rezervasyon/idempotency/kalıcılık kapıları çalıştırılmadı.

**Kapanış kanıtı:** Canlı XinobiYeniDB test hedefi değil; paralel testler ayrılmış; SQL atlamalarının hangi kapıyı açık bıraktığı raporlu.

**Bağımlılıklar:** KAR-08.

### QA-04

**Web ve admin E2E'yi CI'ya ekle** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut Playwright ve admin tarayıcı testlerini deterministik fixture/sunucu yaşam döngüsüyle CI adımına bağla; artifact/screenshot sakla.

**Yapıldı / mevcut temel:** Playwright/admin tarayıcı test kaynakları ve yerelde çalışan kritik fixture paketleri var.

**Yapılmadı / açık kalan:** Deterministik E2E sunucu yaşam döngüsü, CI adımı ve kalıcı screenshot/artifact saklama pipeline’a tamamlanmadı.

**Kapanış kanıtı:** PR'da kritik alışveriş/editör/izin testleri otomatik çalışıyor; mock ile gerçek sağlayıcı sonuçları ayrı raporlanıyor.

**Bağımlılıklar:** QA-01.

### QA-07

**Yük ve arıza dayanıklılığını ölç** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı eşzamanlı kullanıcı/p95/hata hedefinde katalog, checkout, editör ve kuyruk yükünü; provider/DB kesintisini ölç.

**Yapıldı / mevcut temel:** Bazı yarış/idempotency kontrolleri ve KIS-01 sürüm çakışması izole testlerde var.

**Yapılmadı / açık kalan:** Onaylı p95/yük hedefi, son stok/webhook/worker crash ve DB/sağlayıcı kesinti test matrisi eksik.

**Kapanış kanıtı:** Darboğaz ve kapasite sonucu raporlu; son stok/çift webhook/worker crash testlerinde veri kaybı veya çift tahsilat yok.

**Bağımlılıklar:** KAR-08, SEC-06, OPS-07.

### QA-08

**Tek kabul matrisi ve kusur triage'ı oluştur** — P1 / Geliştirme / **Kısmen yapıldı**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Gereksinim-faz-task-test-sürüm bağını tek listede tut; kritik/yüksek/normal hata sahibi, tekrar adımı ve kapanış kanıtı ekle.

**Yapıldı / mevcut temel:** 120 görev kimliği, bağımlılık/kabul ölçütleri ve tarihli test indeksleri var; bu PDF yapılan/açık ayrımını güncelliyor.

**Yapılmadı / açık kalan:** Atanmış kişi/hedef tarih, tüm gereksinim-test-sürüm bağları ve sahipli kusur triage kapanışı eksik.

**Kapanış kanıtı:** Her kalan işin kapalı/bloke durumu kanıtla anlaşılır; eski faz yüzdeleri güncel tamamlanma oranı diye sunulmuyor.

**Bağımlılıklar:** QA-01.

### Alt işler (ana taskı parçalar; yeni ana task sayılmaz)

| Alt iş | Ana task | Durum | Kapanış / kalan |
|---|---|---|---|
| ADM-MAIL-01 | OPS-04, SEC-01 | Açık | İzinli gerçek alıcıda yönetici daveti, kabul, parola sonrası MFA, parola sıfırlama ve çıkış/yenileme akışını canlıya uygun ortamda doğrula; gönderim/teslim sonucunu kaydet. Formun açılması mail teslimi değildir. |

## Faz04 / Ürün kataloğu, içerik ve yayın

**Müşteri/işletme girdileri:** 23 ürün için onaylı açıklama/teknik özellik dosyası ve SKU 117 fiyatı; ana veri/kanal fiyatı ve desen lisans/kapsam kararı. Kullanıcının içerik dosyası gelene kadar açık bırakma talebi korunur.

**Son değişiklik:** 358d42d: WEB-01 yerel teknik kabul, 24 ürün/8 kategori ve üç boyut. c1ba427: WEB-02 237 renk/boyut kontrolü, 110/110 medya ve 30/30 önizleme yanıtı; yerel üç dosya kurtarıldı. 35a4326/799e1af: kategori penceresi ve tam genişlik katalog promptu. Bunlar canlı ticari veri tamlığı değil.

### WEB-01

**Katalog gezinmesini gerçek veriyle kabul et** — P1 / Doğrulama / **Yapıldı - teknik**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kategori URL, filtre, arama, 2-4 ürün karşılaştırma, geri/ileri ve boş/hata durumlarını tam katalogda denetle.

**Yapıldı / mevcut temel:** Kategori/arama/sıralama URL durumu, geri-ileri, boş/hata/retry ve 2-4 ürün karşılaştırma düzeltildi. 24 ürün/8 kategori ve üç boyutta yerel kabul geçti.

**Yapılmadı / açık kalan:** Bu taskın yerel teknik kontrolü kapalı. CAT-01 veri tamlığı, canlı kurulum ve resmi iş sahibi UAT bu sonuçla kapanmaz.

**Kapanış kanıtı:** 390/768/1440 px boyutlarında seçim korunur; kaldırılan ürün bozuk bağlantı veya sahte stok göstermez.

**Bağımlılıklar:** CAT-01.

### WEB-02

**Ürün detayını satışa hazır doğrula** — P1 / Doğrulama / **Kısmen yapıldı**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Her renk için görsel, fiyat, stok, teknik özellik, galeri, değerlendirme ve kişiselleştirme uygunluğunu kontrol et.

**Yapıldı / mevcut temel:** Renk/SKU URL-geçmişi, doğru sepet satırı, fiyat/stok koruması, galeri hatası ve maske kapısı doğrulandı. 237 renk/boyut kontrolü, 110/110 medya ve 30/30 yüzey yanıtı başarılı.

**Yapılmadı / açık kalan:** 23 ürünün açıklama/teknik özellik dosyası bekleniyor. SKU 117 fiyatı eksik; alım kapalı. Kullanıcı içerik kısmını dosya gelene kadar açık bıraktı.

**Kapanış kanıtı:** Eksik fiyat/maske ile yanlış satın alma açılmaz; SKU ve seçili renk sepete doğru gider; medya 404 listesi kapanmış.

**Bağımlılıklar:** CAT-01, KIS-02.

### WEB-06

**CMS, destek ve iletişim deneyimini tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Yönetilebilir SSS/blog/iletişim sayfalarını webde sun; mesaj teslimi, spam sınırı ve açık başarı/hata geri bildirimi ekle.

**Yapıldı / mevcut temel:** Ana sayfa içerik/banner ve duyuru yönetiminin mevcut parçaları korunuyor.

**Yapılmadı / açık kalan:** Tam CMS destekli SSS/blog/iletişim, mesaj teslimi/spam sınırı ve yayın-taslak indeksleme akışı tamamlanmadı.

**Kapanış kanıtı:** Panelde yayınlanan içerik mağazada görünür; iletişim formu gerçek kayıt/teslim üretir; boş ve taslak içerik indekslenmez.

**Bağımlılıklar:** CAT-05, KAR-08.

### WEB-08

**SEO ve ölçüm kurulumunu tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Gerçek ürün URL'leri, ürün sitemap'i, canonical/breadcrumb, 301 haritası ve onaylı analitik olaylarını uygula.

**Yapıldı / mevcut temel:** Temel SEO/noindex ve sitemap altyapısı var.

**Yapılmadı / açık kalan:** Gerçek ürün sitemap/URL/canonical-breadcrumb, eski URL 301 haritası ve izinli analitik satın alma tekilliği yayın alan adında kabul edilmedi.

**Kapanış kanıtı:** Yayın alan adında sitemap ürünleri kapsıyor; özel sayfalar indeks dışı; izin verilmeden analitik çalışmıyor; satın alma olayı tekil.

**Bağımlılıklar:** CAT-08, SEC-02.

### ADM-02

**Sistem ayarlarını kalıcı ve sürümlü yap** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Para birimi, saat dilimi, düşük stok ve bildirim tercihleri için onaylı alanlar, doğrulama, sürüm çakışması ve ayar API'si oluştur.

**Yapıldı / mevcut temel:** Panel ayar görünümü mevcut; kalıcı olmayan eylemler sahte başarı vermiyor.

**Yapılmadı / açık kalan:** Sürümlü kalıcı ayar API/deposu, eşzamanlı kayıt kontrolü ve onaylı ayar alanları tamamlanmadı.

**Kapanış kanıtı:** Sayfa yenilemede değerler korunuyor; eşzamanlı kayıt sessizce ezilmiyor; sırlar genel ayar yanıtına çıkmıyor.

**Bağımlılıklar:** KAR-08, SEC-05.

### ADM-03

**Dashboard metriklerini gerçek kaynaklara bağla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut sipariş/müşteri sayımlarını koru; ciro/net iade/ödeme, stok ve dönüşüm tanımlarını onaylı veriyle tamamla.

**Yapıldı / mevcut temel:** Gerçek SQL sipariş/müşteri sayımları ve tarih aralığı temeli var; bilinmeyen finans rakamları uydurulmuyor.

**Yapılmadı / açık kalan:** Ciro/net iade/tahsilat, stok ve dönüşüm tanımları ile gerçek kaynak ve finans mutabakatı açık.

**Kapanış kanıtı:** Her metrik formülü, zaman dilimi ve kaynağı açıklı; eksik veri sıfır diye sunulmuyor; finans rakamları mutabık.

**Bağımlılıklar:** TIC-05, TIC-07, WEB-08.

### CAT-01

**Gerçek katalog veri kalitesini kapat** — P0 / Doğrulama / **Kısmen yapıldı**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Tüm aktif ürün/renklerde benzersiz SKU, fiyat, stok, teknik özellik, kategori, açıklama, galeri ve okunabilir medya envanterini çıkar.

**Yapıldı / mevcut temel:** 24 ürün/79 renk teknik kontrolü; yerel üç medya dosyası kurtarıldı, 110 medya referansı erişilebilir. Eksik fiyatla satın alma korunuyor.

**Yapılmadı / açık kalan:** 23 ürünün onaylı açıklama/teknik özellikleri ve SKU 117 fiyatı bekleniyor; tüm ticari veri kalite kapısı açık.

**Kapanış kanıtı:** Eksik alan/404 dosya/SKU çakışması raporu kapanmış; yayına hazır olmayan ürün aktif edilmiyor; titanyum kategorisi gerçek kayda bağlı.

**Bağımlılıklar:** KAR-02.

### CAT-02

**Depo ve stok hareket defterini kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Depo bakiyesi, giriş/çıkış/sayım/düzeltme, negatif stok ve rezervasyonla kullanılabilir stok sözleşmesini uygula.

**Yapıldı / mevcut temel:** Varyant web stok kaydı ve inventory.write yetkisi var.

**Yapılmadı / açık kalan:** Depo bazlı hareket defteri, giriş/çıkış/sayım/düzeltme, rezervasyon ve negatif stok uzlaştırması eksik.

**Kapanış kanıtı:** Her değişiklik gerekçeli hareket oluşturuyor; eşzamanlı güncelleme bakiye bozmaz; yetkisiz stok yazımı API'de reddediliyor.

**Bağımlılıklar:** KAR-02, KAR-03.

### CAT-03

**Kalıcı kampanya ve kupon motorunu kur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Oturum içi taslağı kalıcı kampanya, kupon limiti, tarih/kanal/varyant koşulları, birleşme kuralı ve checkout hesabına dönüştür.

**Yapıldı / mevcut temel:** Panel kampanya taslağının mevcut görünümü bulunuyor.

**Yapılmadı / açık kalan:** Kalıcı kupon/kampanya motoru, limit yarışı, kanal/varyant koşulları ve checkout/iade hesabı eksik.

**Kapanış kanıtı:** Aynı kupon yarışta limiti aşmıyor; iptal/iade tüketim kuralı testli; web ve mobil aynı indirimi gösteriyor.

**Bağımlılıklar:** KAR-03.

### CAT-04

**Marka, doküman ve kanal fiyatını tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı kapsam için marka ilişkisi, kullanım kılavuzu/teknik dosya ve kanal fiyat modeli/API/panel alanlarını ekle.

**Yapıldı / mevcut temel:** Ürün/varyant/kategori ve temel fiyat modeli var.

**Yapılmadı / açık kalan:** Marka, teknik doküman/kılavuz yaşam döngüsü ve kanal fiyatı sözleşmesi tamamlanmadı.

**Kapanış kanıtı:** Dosya izinleri ve sürümleri kontrollü; kanal fiyatı yanlış mağazaya yayılmıyor; fiyat ana kaynağı kararı uygulanmış.

**Bağımlılıklar:** KAR-02.

### CAT-05

**CMS yayınlama ve içerik yönetimini kur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Sayfa/blog/SSS/iletişim içerikleri için taslak-yayın, slug, sürüm, editör yetkisi ve önizleme oluştur; ana sayfa banner yönetimini koru.

**Yapıldı / mevcut temel:** Ana sayfa banner/duyuru içerik yönetimi mevcut.

**Yapılmadı / açık kalan:** Tam sayfa/blog/SSS/iletişim CMS, taslak-yayın, slug, geçmiş ve güvenli içerik kabulü eksik.

**Kapanış kanıtı:** Taslak herkese açılmıyor; yayın sonrası web güncelleniyor; HTML güvenli; içerik geçmişi ve sorumlusu görülebiliyor.

**Bağımlılıklar:** KAR-01, KAR-08.

### CAT-06

**Medya kütüphanesini ve dosya yaşam döngüsünü kur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Arama, seçme, kullanım ilişkisi, alt metin, yetki, kullanılmayan dosya ve güvenli silme ekranlarını ekle.

**Yapıldı / mevcut temel:** Medya yükleme ve IFileStore; özel tasarım/önizleme ve sipariş kopyası temeli var.

**Yapılmadı / açık kalan:** Aranabilir medya kütüphanesi, kullanım ilişkisi/alt metin, genel finalize/temizleme ve güvenli silme kapsamı açık.

**Kapanış kanıtı:** Sipariş/tasarımda kullanılan medya yanlışlıkla silinmiyor; özel dosya public olmuyor; yükleme hatası yetim dosya bırakmıyor.

**Bağımlılıklar:** SEC-07.

### CAT-07

**İlk katalog aktarımı ve değişiklik geçmişini tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** CSV şeması, önizleme/dry-run, satır hatası, tekrarlanabilir import, geri alma ve kritik katalog işlemi audit'ini uygula.

**Yapıldı / mevcut temel:** Yerel veriyi SQL’e aktarabilen mevcut aktarım araçları ve audit temeli bulunuyor.

**Yapılmadı / açık kalan:** İşletim için CSV önizleme/satır hatası/dry-run/geri alma ve tam katalog değişim geçmişi eksik.

**Kapanış kanıtı:** Aynı dosya tekrarında mükerrer ürün oluşmuyor; hatalı satır izlenebilir; fiyat/stok geçmişi kaynak ve aktörle saklanıyor.

**Bağımlılıklar:** KAR-02, SEC-05.

### CAT-08

**Desenler ve ürün keşif modelini uygula** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Admin + içerik/operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D13'e göre desen lisans/içerik/satın alma modelini; ürün slug ve eski URL eşleme listesini oluştur.

**Yapıldı / mevcut temel:** Ürün keşfi ve gerçek kategoriye bağlanan titanyum alanı var.

**Yapılmadı / açık kalan:** Desen lisans/satın alma kararı D13, tam ürün slug/301 haritası ve desenler kapsam kabulü açık.

**Kapanış kanıtı:** Karara uygun Desenler ekranı var veya açık kapsam kararı kaydedilmiş; ürün URL'leri tekil, yönlendirme haritası testli.

**Bağımlılıklar:** KAR-01.

### Alt işler (ana taskı parçalar; yeni ana task sayılmaz)

| Alt iş | Ana task | Durum | Kapanış / kalan |
|---|---|---|---|
| WEB-02-DATA-01 | WEB-02, CAT-01 | Müşteri dosyası bekliyor | 23 ürünün açıklama/teknik özellikleri; dosya geldiğinde onaylı kaynaktan doldur ve tekrar doğrula. |
| WEB-02-DATA-02 | WEB-02, CAT-01 | Onaylı fiyat bekliyor | Elektrikli Çay Makinesi 116120 / Metalik Lacivert / SKU 117; fiyat gelene kadar sepete ekleme kapalı. |

## Faz05 / B2C satış, müşteri hesabı ve sipariş sonrası işlemler

**Müşteri/işletme girdileri:** D03 ticaret/iptal-iade/kişiselleştirme fiyatı, vergi-fatura-kargo-havale; seçilen ödeme/kargo test erişimleri ve yasal onaylı metinler.

**Son değişiklik:** Mevcut sunucu fiyatlı demo sipariş, sahiplik/revizyon ve bağımsız sipariş görseli korunur. 42bee88 siparişe tam profil kopyası/SHA ekler; gerçek tahsilat, rezervasyon veya para iadesi eklemez.

### TIC-01

**Sunucu sepeti ve hesap birleştirmesini kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Cihaz sepetini hesap sepetine taşı; misafir/giriş birleştirme, revizyon çatışması ve web-mobil eşitlemesini tanımla; tasarım revizyon anahtarını koru.

**Yapıldı / mevcut temel:** Web ve mobil cihaz sepetleri ürün/renk/tasarım revizyon anahtarını koruyor; hesapta tasarım favorileri var.

**Yapılmadı / açık kalan:** Ortak sunucu sepeti, misafir-hesap birleştirme ve iki cihaz arasındaki eşzamanlı sepet senkronu yapılmadı.

**Kapanış kanıtı:** İki cihazda aynı hesap tutarlı liste görür; eşzamanlı değişiklik veri kaybetmez; girişte mükerrer satır oluşmaz.

**Bağımlılıklar:** KAR-03.

### TIC-02

**Checkout fiyat teklifini sunucuda üret** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ürün, kupon, kişiselleştirme, vergi ve kargoyu tek checkout/quote sonucu üzerinden hesapla; geçerlilik ve yeniden fiyatlama kuralı uygula.

**Yapıldı / mevcut temel:** Siparişte fiyat sunucudan okunuyor; istemcinin gönderdiği tutar sipariş fiyatı olarak kabul edilmiyor.

**Yapılmadı / açık kalan:** Kupon, kişiselleştirme, vergi, kargo ve geçerlilik süresini kapsayan tek sunucu checkout/quote motoru eksik.

**Kapanış kanıtı:** İstemci tutarı değiştirilemez; fiyat/stok değişimi kullanıcıya onaylatılır; kuruş ve yuvarlama sonuçları testli.

**Bağımlılıklar:** KAR-03, CAT-03.

### TIC-03

**Stok rezervasyonu ve kesinleşmeyi atomik yap** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Rezervasyon, süre dolması, tahsilat sonrası stok hareketi ve iptalde serbest bırakmayı transaction ve tekil anahtarlarla uygula.

**Yapıldı / mevcut temel:** Katalog stok alanı ve yetkili web stok güncellemesi mevcut.

**Yapılmadı / açık kalan:** Atomik rezervasyon, süre sonu bırakma, tahsilatla kesinleştirme ve son stok yarışı iş kuralı tamamlanmadı.

**Kapanış kanıtı:** Son stok için yarışta yalnız izin verilen sipariş kesinleşir; yinelenen callback ikinci stok hareketi yaratmaz.

**Bağımlılıklar:** KAR-02, KAR-03.

### TIC-04

**Kart ve 3DS ödeme akışını bağla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Seçilen sağlayıcı sandbox'ında başlatma, yönlendirme, dönüş, bekleme, hata ve taksit kapsamını uygula; kart verisini uygulamada tutma.

**Yapıldı / mevcut temel:** Sipariş oluşturma ve sonuç ekranlarının temel yolu mevcut; demo sipariş tahsilat yapmıyor.

**Yapılmadı / açık kalan:** Gerçek kart/3DS/taksit sağlayıcı akışı ve başarı/red/iptal/dönüş için işlem kimlikli kabul yok.

**Kapanış kanıtı:** Web ve mobilde başarı/red/iptal/geri dönüş senaryosu sağlayıcı işlem kimliğiyle eşleşiyor.

**Bağımlılıklar:** KAR-04, TIC-02, TIC-03.

### TIC-05

**Ödeme webhook ve mutabakatını kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** İmza, tekrar oynatma, sıra dışı/çift bildirim, zaman aşımı ve sunucu sorgusuyla ödeme durumunu doğrula; tahsilat-sipariş farklarını raporla.

**Yapıldı / mevcut temel:** Sipariş oluşturma idempotency temeli bulunuyor.

**Yapılmadı / açık kalan:** Ödeme webhook imzası, olay tekilleştirme, sıra dışı bildirim ve tahsilat-sipariş mutabakatı uçtan uca eksik.

**Kapanış kanıtı:** Aynı olay bir kez işlenir; dönüş sayfası tek başına ödeme başarısı sayılmaz; belirsiz işlem operatöre düşer.

**Bağımlılıklar:** TIC-04, SEC-06.

### TIC-06

**Havale ve ödeme bekleyen siparişi tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Havale referansı, son tarih, operatör doğrulaması ve süre aşımında rezervasyon bırakmayı; kapsam dışıysa açık karar kaydını uygula.

**Yapıldı / mevcut temel:** Sipariş durumu gösterilebiliyor; finansal havale kabul akışı tamamlanmış sayılmıyor.

**Yapılmadı / açık kalan:** Havale referansı, son tarih, finans yetkisi, tutar kontrolü ve süresi dolan rezervasyonu bırakma uygulanmalı.

**Kapanış kanıtı:** Eksik/yanlış tutar ve mükerrer onay kontrol altında; yalnız yetkili finans onayı siparişi ilerletir.

**Bağımlılıklar:** KAR-03, TIC-03.

### TIC-07

**İptal ve iadeyi gerçek geri ödemeye bağla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Tam/kısmi iade, sağlayıcı işlem kimliği, tutar sınırı, kişiselleştirilmiş ürün kuralı ve stok geri alımını uygula.

**Yapıldı / mevcut temel:** Müşteri iptal/iade talebi ve panel durum/iptal yetkileri mevcut.

**Yapılmadı / açık kalan:** Tam/kısmi gerçek para iadesi, sağlayıcı işlem kimliği, fazla iade önleme ve stokla uzlaştırma tamamlanmadı.

**Kapanış kanıtı:** İkinci istek fazla ödeme iadesi yapmaz; para ve ürün durumları ayrı izlenir; başarısız iade yeniden yönetilebilir.

**Bağımlılıklar:** KAR-03, TIC-05.

### TIC-08

**Kargo fiyatı ve gönderiyi entegre et** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + DBA + Web/Mobil + finans. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Adres/bölge/desi kuralları, ücretsiz kargo eşiği, etiket/gönderi, takip güncellemesi ve taşıyıcı hatalarını bağla.

**Yapıldı / mevcut temel:** Adresler ve sipariş gönderi bilgisi için temel ekran/model bulunuyor.

**Yapılmadı / açık kalan:** Gerçek taşıyıcı fiyatı, desi/bölge kuralları, etiket/gönderi, takip ve yinelenen gönderi kontrolü kabul edilmedi.

**Kapanış kanıtı:** Checkout ücreti siparişte sabit; tek sipariş için yinelenen gönderi önleniyor; gerçek test gönderisi takip ediliyor.

**Bağımlılıklar:** KAR-04, TIC-02.

### WEB-03

**Gerçek checkout ve sonuç ekranını tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kayıtlı/yeni adres, fatura bilgisi, ücret özeti, ödeme seçimi ve bekleyen/başarısız/başarılı sonucu gerçek API durumlarına bağla.

**Yapıldı / mevcut temel:** Adres, sepet, sunucu fiyatıyla demo sipariş ve sonuç sayfası temeli var.

**Yapılmadı / açık kalan:** Gerçek ödeme durumları, fatura/ücret özeti ve sağlayıcı dönüşlerinin checkout/quote üzerinden tamamlanması bekliyor.

**Kapanış kanıtı:** Ödemeden geri dönüşte sayfa yenileme veya çift tıklama ikinci sipariş yaratmaz; demo metni yalnız gerçek kapsam açılınca kaldırılır.

**Bağımlılıklar:** TIC-02, TIC-05, TIC-08, SEC-02.

### WEB-04

**Hesap yaşam döngüsünü gerçek e-postayla kabul et** — P1 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kayıt, doğrulama, giriş, parola sıfırlama, adres, e-posta değişimi, hesap silme ve çoklu sekme oturumunu dene.

**Yapıldı / mevcut temel:** Kayıt/giriş/doğrulama/sıfırlama, adres ve hesap yaşam döngüsü ekranları; izole otomatik testler mevcut.

**Yapılmadı / açık kalan:** İzinli gerçek alıcıyla e-posta teslimi, çoklu sekme ve gerçek ortam uçtan uca hesap kabulü bu task için kapanmadı.

**Kapanış kanıtı:** Gerçek izinli alıcıyla kod teslimi ve süre aşımı doğrulanmış; CSRF/yenileme/çıkış sonrasında özel veri görünmüyor.

**Bağımlılıklar:** SEC-01, SEC-03.

### WEB-05

**Satış sonrası ve tasarım ekranlarını doğrula** — P1 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web geliştirici + UX + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Sipariş detayı, birleşik önizleme, iptal/iade, bildirim, değerlendirme ve Tasarımlarım'ı gerçek hesapla baştan sona dene.

**Yapıldı / mevcut temel:** Sipariş/tasarım/önizleme/iptal-iade/bildirim/değerlendirme ekranları var. Siparişin tasarım silinmesinden bağımsızlığı sentetik HTTP testlerinde doğrulandı.

**Yapılmadı / açık kalan:** Gerçek hesap ve SQL ile satış sonrası uçtan uca kabul; gerçek geri ödeme durumunun doğru gösterimi açık.

**Kapanış kanıtı:** Tasarım silinse bile sipariş snapshot'ı korunuyor; başka hesabın görseli erişilemiyor; gerçek geri ödeme durumu doğru.

**Bağımlılıklar:** TIC-07, KIS-03.

### ADM-04

**Müşteri ve firma operasyon ekranını tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Yetkili müşteri arama/detay, adres/sipariş ilişkisi, kurumsal profil ve destek geçmişi için mevcut API kapsamını doğrula; eksik parçaları uygula.

**Yapıldı / mevcut temel:** Yetkili müşteri ve sipariş ilişkisi ekran/API parçaları mevcut.

**Yapılmadı / açık kalan:** Firma/kurumsal profil, destek geçmişi ve tüm sunucu filtre/sayfalama alanlarının kabul matrisi kapanmadı.

**Kapanış kanıtı:** Sunucu sayfalama/filtre var; erişim minimizasyonu uygulanıyor; bu checkout'taki kullanıcı profilinin yeniden yazımı değil.

**Bağımlılıklar:** KAR-06, SEC-04.

### ADM-05

**Sipariş finans ve kargo eylemlerini tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Admin geliştirici + Backend + operasyon. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Tahsilat, bekleyen ödeme, geri ödeme ve gönderi operasyonlarını gerçek sağlayıcı sonucuna bağla; yazma/iptal yetkilerini ayrı tut.

**Yapıldı / mevcut temel:** Sipariş detayı, tasarıma bağlı siparişler ve ayrı iptal yetkisi mevcut.

**Yapılmadı / açık kalan:** Gerçek tahsilat/geri ödeme/kargo sağlayıcısı sonuçları ve yinelenmeyen operasyon eylemleri eksik.

**Kapanış kanıtı:** Operatör sağlayıcı işlem numarasını ve hata nedenini görüyor; çift tıklama/yenileme mükerrer finans veya kargo işlemi yapmıyor.

**Bağımlılıklar:** TIC-05, TIC-07, TIC-08.

## Faz06 / Kişiselleştirme, gelişmiş editör ve baskı dosyası

**03.11 güncel teslim sınırı:** Siparişe bağlı yerleşim ve ayrı desen/ürün kaynak görseli/giydirilmiş önizleme indirmeleri. Fiziksel üretim profili/numune girdisi bu bölümün önkoşulu değil; [yeni plan](order-design-detail-scope-2026-11-03.md).

**Son değişiklik:** 42bee88: ürün/renk/yüz bazlı mm-DPI-taşma-renk-format, boş ölçülü taslak, kanıtlı onay/kaldırma ve geçmiş; düzlemsel mm/DPI/korunan bölge ölçümü ve fiziksel kalibrasyon SVG. Yeni yerleşim/sipariş profil kopyası ve SHA alır. Gerçek SKU profili oluşturulmadı; productionReady=false.

### KIS-01

**Fiziksel PrintArea ve üretim profilini kur** — P0 / Geliştirme / **Kapsam dışı - 03.11.2026 kararı**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı mm/DPI/taşma/renk/format bilgisini ürün-varyant-yüz bazında sürümle; piksel yerleşimini fiziksel koordinata bağla.

**Yapıldı / mevcut temel:** Sürümlü ürün/renk/yüz profili, boş ölçülü taslak, kanıtlı onay/kaldırma, kalibrasyon SVG ve düzlemsel mm/DPI hesabı eklendi. Profil sürümü/SHA yerleşim ve siparişe kopyalanıyor.

**Yapılmadı / açık kalan:** Bu üretime hazırlık teslimi yeni kapsamda istenmiyor; tamamlandı sayılmaz. Mevcut kod/veri korunur. Sade sipariş tasarım detayı ve dosya indirmeleri KIS-03/KIS-07 altında planlandı.

**Kapanış kanıtı:** Yeni kapsam için bu üretim teslimi kapanış koşulu değildir; eski geliştirme/test kaydı tarihsel olarak korunur.

**Bağımlılıklar:** Yeni kapsamda zorunlu bağımlılık değil

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KIS-02

**Tüm gerçek renklerin maske kabulünü yap** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kaynak fotoğraf, alfa maske, geometri, logo/kenar/handle koruması, checksum ve renk bağını SKU bazında denetle. Kabul dijital önizleme içindir; fiziksel baskı uygunluğu onayı değildir.

**Yapıldı / mevcut temel:** Onaylı yüzey/maske okuma ve checksum/renk bağı kontrolleri var; 30/30 kişiselleştirilebilir renk teknik önizleme yanıtı hazır.

**Yapılmadı / açık kalan:** Her gerçek renk için logo/kenar/kulp ve geometriyi insanın görsel inceleyip SKU bazında imzalı kabul etmesi eksik.

**Kapanış kanıtı:** Her kişiselleştirilebilir aktif renk için insan onaylı örnek var; eksik/stale maske açık hata veriyor; başka renk maskesi kullanılmıyor.

**Bağımlılıklar:** CAT-01

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KIS-03

**Revizyon ve sipariş bağımsızlığını SQL'de doğrula** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kaydet/yeniden aç, renk/kaynak değişimi, favori/sepet ayrımı, hesap sahipliği ve sipariş kopyasını izole gerçek SQL ile test et. SIP-TAS-02/03/08/09: desen, ürün kaynak görseli ve kompozisyon sipariş satırının aynı revizyonuna bağlanır.

**Yapıldı / mevcut temel:** Konfigürasyon revizyonu, sahiplik, kaynak kontrolü, sipariş kopyası ve tasarım silme bağımsızlığı izole dosya/HTTP testlerinde doğrulandı.

**Yapılmadı / açık kalan:** Bu senaryoların izole gerçek SQL üzerinde restart/eşzamanlılık ve kalıcılık kabulü bu task için yapılmadı. Üç görselin siparişe bağlı korunması ve eski/eksik kayıt davranışı ayrıca tamamlanmalı.

**Kapanış kanıtı:** Servis yeniden başlatılınca revizyon aynı; tasarım silinmesi sipariş dosyasını bozmaz; başka kullanıcı kaydı okunamaz.

**Bağımlılıklar:** QA-02, KIS-02

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KIS-04

**Kaynak kapsamdaki editör araçlarını tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Metin/font, şekil, katman sırası/kilit, şablon kategorisi, çoklu yüz ve hizalama araçlarını onaylı kapsamla uygula; mevcut undo/redo'yu yeniden iş sayma.

**Yapıldı / mevcut temel:** Ortak görsel/desen yerleşimi, konum/ölçek/dönüş/kavis, yakınlaştırma ve undo/redo mevcut.

**Yapılmadı / açık kalan:** Onaylı kapsamın metin/font/şekil/katman-kilit/şablon/çoklu yüz araçları ve font lisansı kabulü eksik. Bu karar genel editör araçlarını iptal etmez; sade sipariş tasarım detayının önkoşulu da değildir.

**Kapanış kanıtı:** Web ve mobilde onaylı araç matrisi çalışıyor; font lisansı ve çoklu yüz kayıtları sürümlü; kapsam azaltımı yazılı karar gerektiriyor.

**Bağımlılıklar:** KAR-01

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KIS-05

**Değişmez üretim sürümü ve insan onayı ekle** — P0 / Geliştirme / **Kapsam dışı - 03.11.2026 kararı**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Yerleşim revizyonundan ayrı üretim DesignVersion, baskı ön kontrolü, müşteri/operatör onayı ve yeniden onay koşullarını oluştur.

**Yapıldı / mevcut temel:** Yerleşim revizyonu ve KIS-01 profil snapshot/checksum temeli var.

**Yapılmadı / açık kalan:** Bu üretime hazırlık teslimi yeni kapsamda istenmiyor; tamamlandı sayılmaz. Mevcut kod/veri korunur. Sade sipariş tasarım detayı ve dosya indirmeleri KIS-03/KIS-07 altında planlandı.

**Kapanış kanıtı:** Yeni kapsam için bu üretim teslimi kapanış koşulu değildir; eski geliştirme/test kaydı tarihsel olarak korunur.

**Bağımlılıklar:** Yeni kapsamda zorunlu bağımlılık değil

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KIS-06

**Baskı render kuyruğunu uygula** — P0 / Geliştirme / **Kapsam dışı - 03.11.2026 kararı**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Yüksek çözünürlüklü üretim dosyasını profilden deterministik üret; retry, iş kimliği, kaynak bütünlüğü ve arızadan kurtarma ekle.

**Yapıldı / mevcut temel:** Dijital önizleme ve kalibrasyon referansı üretilebiliyor.

**Yapılmadı / açık kalan:** Bu üretime hazırlık teslimi yeni kapsamda istenmiyor; tamamlandı sayılmaz. Mevcut kod/veri korunur. Sade sipariş tasarım detayı ve dosya indirmeleri KIS-03/KIS-07 altında planlandı.

**Kapanış kanıtı:** Yeni kapsam için bu üretim teslimi kapanış koşulu değildir; eski geliştirme/test kaydı tarihsel olarak korunur.

**Bağımlılıklar:** Yeni kapsamda zorunlu bağımlılık değil

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KIS-07

**Sipariş tasarım detayını ve ayrı görsel indirmelerini tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** SIP-TAS-01...09: sade sipariş satırı detayı, kayıtlı editör yerleşimi, ayrı ham desen/ürün kaynak görseli/giydirilmiş önizleme ve güvenli indirme. Üretime hazırlık/gönderim/onay kuyruğu ekleme.

**Yapıldı / mevcut temel:** Panelde metadata, korumalı ham görsel ve sipariş bağı var. **SIP-TAS-01 (03.11):** sipariş satırı tasarım detayı (ürün/tasarım/yerleşim + ayrı üç görsel kartı) uygulandı; fiziksel profil/kalibrasyon ekranı panelden kaldırıldı, API/veri korunur ([TST-207](../../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md)).

**SIP-TAS-02 (03.11):** siparişe bağlı üç dosya referansı (SHA-256/tür/bayt), doğrulanmış ürün kaynak görseli kopyası ve okuma bütünlüğü ([TST-211](../../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md)); SQL kabulü açık.

**SIP-TAS-03 (03.11):** kayıtlı yerleşimin salt okunur, birimli sunumu ([TST-215](../../test/2026-11-03/TST-215-sip-tas-03-order-placement.md)).

**SIP-TAS-04 (03.11):** ham desenin yetkili, doğrulanmış ayrı indirmesi ([TST-219](../../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md)).

**SIP-TAS-05 (03.11):** maskelenen ürün kaynak görselinin yetkili, doğrulanmış ayrı indirmesi ([TST-223](../../test/2026-11-03/TST-223-sip-tas-05-source-download.md)).

**SIP-TAS-06 (03.11):** giydirilmiş temsili önizlemenin gösterimi ve yetkili, doğrulanmış indirmesi ([TST-227](../../test/2026-11-03/TST-227-sip-tas-06-composition.md)).

**SIP-TAS-07 (03.11):** dosya erişim yetkisi ve indirme durumları uçtan uca doğrulandı ([TST-231](../../test/2026-11-03/TST-231-sip-tas-07-file-access.md)).

**SIP-TAS-08 (03.11):** eski/eksik kayıtların kart bazında dürüst sunumu ve salt okunur dry-run envanteri ([TST-235](../../test/2026-11-03/TST-235-sip-tas-08-legacy-records.md)).

**SIP-TAS-09 (03.11):** teknik kabul kaydı ve [ekran/senaryo matrisi](../../design/order-design-acceptance-2026-11-03.md) ([TST-239](../../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md)).

**Yapılmadı / açık kalan:** gerçek kabul (izole SQL, canlı IIS, ekran okuyucu/cihaz, iş sahibi/rol/PM); gerçek veride envanter ve geri doldurma kararı; SIP-TAS-01 rol/PM ekran kabulü.

**Kapanış kanıtı:** Doğru sipariş revizyonunun yerleşimi ve üç görseli görülebilir/indirilebilir; kaynak eksikse dürüst durum; yetkisiz erişim yok; üretim işlemi yok.

**Bağımlılıklar:** KIS-03, SEC-07, QA-04; mevcut sipariş okuma izinleri

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### KIS-08

**Kişiselleştirme fiyatı ve sipariş dosya teslimini kabul et** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Web/Mobil + Backend + üretim + Creative. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kişiselleştirme fiyatının checkout/iade kuralı ve sipariş snapshot bağı devam eder; sade sipariş tasarım detayındaki yerleşim/üç indirme için kullanıcı kabulü al. Fiziksel baskı numunesi ve üretim onayı bu yazılım teslimine dahil değil.

**Yapıldı / mevcut temel:** Ürün kompozisyonu ve profil sınırları ekranda temsil ediliyor.

**Yapılmadı / açık kalan:** Kişiselleştirme fiyatlandırma/checkout-iade kabulü ve SIP-TAS dosya teslim kabulü açık; fiziksel numune yazılım kapısı olarak beklenmiyor.

**Kapanış kanıtı:** Üç dosya ve yerleşim sipariş revizyonuyla eşleşiyor; varsa kişiselleştirme tutarı sunucuda doğru hesaplanıp saklanıyor.

**Bağımlılıklar:** KIS-07, TIC-02, KAR-03

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### Alt işler (ana taskı parçalar; yeni ana task sayılmaz)

| Alt iş | Ana task | Durum | Kapanış / kalan |
|---|---|---|---|
| KIS-01-DATA-01 | KIS-01, KAR-05 | Kapsam dışı - 03.11.2026 kararı | Fiziksel üretim bilgisi/numunesi yeni yazılım tesliminin şartı değil; eski kayıt tarihsel olarak korunur. |
| KIS-01-UAT-01 | KIS-01, KIS-08 | Kapsam dışı - 03.11.2026 kararı | Fiziksel üretim bilgisi/numunesi yeni yazılım tesliminin şartı değil; eski kayıt tarihsel olarak korunur. |
| KIS-01-SQL-01 | KIS-03, QA-02 | Revize - planlandı | SIP-TAS-02/09: sipariş yerleşimi ve üç görsel dosyasının sürüm/kalıcılık bağı; fiziksel profil kalibrasyonu değil. |
| SIP-TAS-01 | KIS-07 | Uygulandı - kabul açık ([TST-207](../../test/2026-11-03/TST-207-sip-tas-01-order-design-detail.md)) | [Baskı alanını sipariş tasarım detayına sadeleştir](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-02 | KIS-03, KIS-07 | Uygulandı - SQL kabulü açık ([TST-211](../../test/2026-11-03/TST-211-sip-tas-02-order-design-files.md)) | [Siparişe bağlı görsel ve revizyon paketini tanımla](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-03 | KIS-03, KIS-07 | Uygulandı - kabul açık ([TST-215](../../test/2026-11-03/TST-215-sip-tas-03-order-placement.md)) | [Müşterinin kaydettiği yerleşim detaylarını göster](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-04 | KIS-07 | Uygulandı - kabul açık ([TST-219](../../test/2026-11-03/TST-219-sip-tas-04-pattern-download.md)) | [Ham deseni ayrı indir](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-05 | KIS-07 | Uygulandı - kabul açık ([TST-223](../../test/2026-11-03/TST-223-sip-tas-05-source-download.md)) | [Maskelemede kullanılan ürün görselini ayrı indir](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-06 | KIS-07 | Uygulandı - kabul açık ([TST-227](../../test/2026-11-03/TST-227-sip-tas-06-composition.md)) | [Giydirilmiş görseli göster ve indir](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-07 | SEC-07, KIS-07 | Uygulandı - canlı/SQL kabulü açık ([TST-231](../../test/2026-11-03/TST-231-sip-tas-07-file-access.md)) | [Yetki, dosya erişimi ve işlem durumlarını tamamla](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-08 | KIS-03, KIS-07 | Uygulandı - gerçek envanter/karar açık ([TST-235](../../test/2026-11-03/TST-235-sip-tas-08-legacy-records.md)) | [Eski ve eksik sipariş kayıtlarını dürüst ele al](order-design-detail-scope-2026-11-03.md) |
| SIP-TAS-09 | KIS-03, KIS-07, QA-03 | Teknik kabul tamam - gerçek kabul açık ([TST-239](../../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md)) | [Sipariş tasarım detayını test et ve kabul kaydını yaz](order-design-detail-scope-2026-11-03.md) |

## Faz07 / Kurumsal teklif ve toplu sipariş

**Müşteri/işletme girdileri:** D07 firma alanları, teklif geçerliliği/fiyat-vergi kuralları, tek siparişe dönüşüm ve toplu satış modeli; kurumsal e-posta şablonları.

**Son değişiklik:** Mevcut talep/mesaj/teklif/kabul-red ve yetkili panel devam eder. Son commitler firma başvurusu, ek dosya, teklifsiz toplu sipariş veya tekliften gerçek sipariş üretimini tamamlamadı.

### B2B-01

**Firma başvurusu ve kurumsal profil oluştur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı alanlarla firma, vergi/fatura bilgisi, başvuru/onay/red ve firma kullanıcı ilişkisini kur.

**Yapıldı / mevcut temel:** Temel kurumsal teklif talebi ve hesap ilişkisi mevcut.

**Yapılmadı / açık kalan:** Firma başvurusu, vergi/fatura profili, onay/red ve firma-kullanıcı modeli tamamlanmadı.

**Kapanış kanıtı:** Firma verisi hesaplar arasında sızmıyor; başvuru durumu web/mobil/panelde tutarlı; onay yetkisi kayıtlı.

**Bağımlılıklar:** KAR-06, KAR-08.

### B2B-02

**Teklifin sürüm ve geçerlilik modelini tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Fiyat/adet/vergiler/kişiselleştirme, son tarih ve müzakereyi sürümlü teklife bağla; eski teklif kabulünü önle.

**Yapıldı / mevcut temel:** Talep/mesaj, teklif sunma ve kabul/red mevcut.

**Yapılmadı / açık kalan:** Sürümlü fiyat/adet/vergi/kişiselleştirme, geçerlilik ve eski sürüm kabulünü engelleme modeli eksik.

**Kapanış kanıtı:** Kullanıcı hangi sürümü kabul ettiğini görüyor; süresi dolmuş veya değiştirilmiş teklif sessizce kabul edilmiyor.

**Bağımlılıklar:** KAR-06.

### B2B-03

**Teklif ek dosya akışını güvenli kur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Talep ve mesaj ekleri için izinli tür/boyut, tarama, sahiplik ve indirme süresi uygula.

**Yapıldı / mevcut temel:** Talep/mesaj metin akışı var.

**Yapılmadı / açık kalan:** Güvenli ek dosya tür/boyut/tarama, sahiplik ve süreli indirme uçtan uca eksik.

**Kapanış kanıtı:** Yetkisiz firma ekini okuyamaz; hatalı/zararlı dosya reddediliyor; başarısız gönderimde metin taslağı korunuyor.

**Bağımlılıklar:** SEC-07, B2B-01.

### B2B-04

**Kabul edilen teklifi tek siparişe dönüştür** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı D07 kuralıyla fiyat snapshot'ı, stok, ödeme ve firma faturasını tek dönüşüm işlemine bağla.

**Yapıldı / mevcut temel:** Teklif kabul durumu kayıt altına alınabiliyor.

**Yapılmadı / açık kalan:** Kabulden tek siparişe atomik dönüşüm, fiyat snapshot’ı, stok/ödeme ve firma faturası açık.

**Kapanış kanıtı:** Çift kabul veya yeniden deneme tek sipariş yaratıyor; teklif-sipariş-ödeme izi çift yönlü izlenebilir.

**Bağımlılıklar:** B2B-02, TIC-03, TIC-05.

### B2B-05

**Teklifsiz toplu sipariş yolunu uygula** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** D07'de seçilen modele göre SKU/adet listesi, minimum adet, kurumsal fiyat, dosya yükleme ve checkout'u kur.

**Yapıldı / mevcut temel:** Normal ürün/SKU sepet ve teklif talep yolları var.

**Yapılmadı / açık kalan:** Teklifsiz toplu SKU/adet yükleme, minimum adet/kurumsal fiyat ve checkout yolu tamamlanmadı.

**Kapanış kanıtı:** Hatalı SKU/adet satır bazında açıklanıyor; fiyat sunucudan geliyor; aynı liste tekrarında çift sipariş oluşmuyor.

**Bağımlılıklar:** KAR-06, TIC-02.

### B2B-06

**Kurumsal bildirim şablonlarını onayla ve bağla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Talep alındı, yeni mesaj, teklif, süre sonu, kabul/red için sürümlü e-posta ve izinli kanal şablonları hazırla.

**Yapıldı / mevcut temel:** Bildirim ve temel teklif durumları için mevcut altyapı var.

**Yapılmadı / açık kalan:** Kurumsal olayların onaylı, sürümlü e-posta/izinli kanal şablonları ve gerçek teslim kanıtı eksik.

**Kapanış kanıtı:** Gerçek izinli alıcıda teslim/ret izleniyor; firma/teklif bağlantısı yetkiyle açılıyor; kuyruk teslim sanılmıyor.

**Bağımlılıklar:** OPS-04, KAR-08.

### B2B-07

**Kurumsal satış raporunu oluştur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Talep adedi, cevap süresi, kabul oranı, kayıp nedeni ve siparişe dönüşümü yetkili sunucu raporuna bağla.

**Yapıldı / mevcut temel:** Teklif listesi/detayı ve temel durum verileri var.

**Yapılmadı / açık kalan:** Cevap süresi, kabul oranı, kayıp nedeni ve siparişe dönüşüm sunucu raporu eksik.

**Kapanış kanıtı:** Tarih/temsilci/firma filtresi tüm kayıtlarda çalışıyor; dönüşen siparişler finans raporuyla tutarlı.

**Bağımlılıklar:** B2B-04, ADM-06.

### B2B-08

**Teklif ve toplu siparişi üç kanalda kabul et** — P1 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + Web/Mobil + Admin + kurumsal satış. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Web, Android, iOS ve panelde başvuru-mesaj-teklif-kabul-sipariş yolunu; yetki, süre sonu ve ağ kesintisini dene.

**Yapıldı / mevcut temel:** Web/mobil/panel teklif arayüzleri ve mevcut izole testler var.

**Yapılmadı / açık kalan:** Firma başvurusundan gerçek siparişe kadar web/Android/iOS/panel uçtan uca iş kabulü açık.

**Kapanış kanıtı:** Kurumsal satış sahibi gerçek test firmasıyla UAT tutanağı imzalıyor; mükerrer talep/mesaj/sipariş yok.

**Bağımlılıklar:** B2B-01, B2B-03, B2B-04, B2B-05.

## Faz08 / Mikro muhasebe entegrasyonu ve mutabakat

**Müşteri/işletme girdileri:** Mikro sürümü/API/ara katman, test şirketi, örnek stok/cari/depo/vergi/birim/döviz ve fatura sorumlusu; veri yönü/çatışma önceliği.

**Son değişiklik:** Son commitlerde Mikro adaptörü veya gerçek senkron/mutabakat teslimi yok. Panel prototipi ve ortak veritabanı yapısı, Mikro bağlantı kabulü sayılmaz.

### ERP-01

**Mikro sürüm ve alan sözleşmesini kesinleştir** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kullanılan sürüm/API/ara katman, test şirketi, depo, vergi, birim, döviz ve cari kod örneklerini sahipleriyle doğrula.

**Yapıldı / mevcut temel:** İç ürün/SKU, sipariş ve ortak veri modeli temelleri mevcut.

**Yapılmadı / açık kalan:** Mikro sürümü, API/ara katman, test şirketi, depo/vergi/birim/döviz/cari kodları için alan sözleşmesi bekleniyor.

**Kapanış kanıtı:** D02/D06/D11'e bağlı imzalı eşleme ve erişim matrisi var; test/canlı şirketleri kesin ayrılmış.

**Bağımlılıklar:** KAR-02, KAR-04, KAR-08.

### ERP-02

**Mikro istemcisi ve bağlantı sağlık kontrolünü yaz** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Yetkilendirme, zaman aşımı, rate limit, hata sınıflama ve erişim kontrolü olan sağlayıcı adaptörünü kur.

**Yapıldı / mevcut temel:** Panel entegrasyon görünümü var; gerçek bağlı Mikro servisi olarak sunulmuyor.

**Yapılmadı / açık kalan:** Kimlik doğrulamalı Mikro istemcisi, timeout/limit/hata sınıflaması ve gerçek sağlık kontrolü eksik.

**Kapanış kanıtı:** Sandbox bağlantı testi gerçek yanıt veriyor; parolalar log/DB genel alanlarına yazılmıyor; hatada sahte bağlı durumu yok.

**Bağımlılıklar:** ERP-01.

### ERP-03

**Ürün ve varyant kod eşlemesini uygula** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** İç ürün/SKU ile Mikro stok kodu, birim, vergi ve kategori alanlarını sürümlü eşle; ilk senkronu dry-run ile başlat.

**Yapıldı / mevcut temel:** İç ürün/varyant/SKU kimlikleri var.

**Yapılmadı / açık kalan:** Mikro stok kodu/birim/vergi/kategoriyle sürümlü eşleme ve ilk senkron dry-run yapılmadı.

**Kapanış kanıtı:** Eşleşmeyen/çift kod operatöre düşüyor; aynı aktarım mükerrer ürün yaratmıyor; alan sahipliği korunuyor.

**Bağımlılıklar:** ERP-02, CAT-07.

### ERP-04

**Depo stok ve fiyat senkronunu tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı yön ve periyotla stok/fiyat oku-yaz; rezervasyon ve kanal kullanılabilirliğiyle uzlaştır.

**Yapıldı / mevcut temel:** Web stok/fiyat alanları ve yetkili panel kaydı mevcut.

**Yapılmadı / açık kalan:** Mikro depo stok/fiyat okuma-yazma yönü, senkron periyodu ve rezervasyon/kanal uzlaştırması eksik.

**Kapanış kanıtı:** Gecikme ve son başarılı çalışma görünür; kısmi hata veri ezmiyor; çift yazıcı çatışması testli.

**Bağımlılıklar:** ERP-03, CAT-02, TIC-03.

### ERP-05

**Cari ve adres aktarımını uygula** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Firma/bireysel cari bulma/oluşturma, vergi ve teslimat/fatura adres eşlemesini veri minimizasyonuyla kur.

**Yapıldı / mevcut temel:** Müşteri adres ve temel hesap verileri var.

**Yapılmadı / açık kalan:** Mikro cari bulma/oluşturma, vergi ve fatura/teslimat adres eşlemesi eksik.

**Kapanış kanıtı:** Aynı müşteri tekrarında tek cari var; hatalı zorunlu alan siparişi kaybetmeden operatöre yönleniyor.

**Bağımlılıklar:** ERP-02, B2B-01.

### ERP-06

**Sipariş ve fatura bağlantısını tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kesinleşmiş siparişin Mikro belgesine dönüşümü, e-Fatura/e-Arşiv sorumluluğu ve belge numarası geri okumasını uygula.

**Yapıldı / mevcut temel:** İç sipariş kaydı ve kişiselleştirme kopyası var.

**Yapılmadı / açık kalan:** Kesinleşmiş siparişi Mikro belgesine dönüştürme ve fatura/belge numarası geri okuma tamamlanmadı.

**Kapanış kanıtı:** Ödeme/sipariş tekrarında tek muhasebe belgesi oluşuyor; fatura tutarı ve vergi toplamı siparişle mutabık.

**Bağımlılıklar:** ERP-04, ERP-05, TIC-05.

### ERP-07

**İptal, iade ve entegrasyon izleme akışını kur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Muhasebe belge iptali/iadesi, retry/dead-letter, manuel eşleme ve mutabakat farkını panelden yönet.

**Yapıldı / mevcut temel:** Panelde entegrasyon alanı ve ortak iş/audit temelleri var.

**Yapılmadı / açık kalan:** Gerçek muhasebe iptal/iadesi, retry/dead-letter, manuel eşleme ve fark yönetimi eksik.

**Kapanış kanıtı:** Dış belge hatası kaybolmuyor; operatör yetkili ve audit'li tekrar yapıyor; geri ödeme/fatura ayrı izleniyor.

**Bağımlılıklar:** ERP-06, TIC-07, SEC-06.

### ERP-08

**Mikro uçtan uca mutabakat ve işletim kabulü yap** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + Mikro uzmanı + muhasebe. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Test şirketinde ürün-stok-fiyat-cari-sipariş-fatura-iade zincirini kesinti ve tekrarlarla doğrula; ilk aktarım planını hazırla.

**Yapıldı / mevcut temel:** Mikro entegrasyonu için kapsam/task planı var.

**Yapılmadı / açık kalan:** Test şirketinde ürün-stok-fiyat-cari-sipariş-fatura-iade mutabakatı ve işletim kabulü yapılmadı.

**Kapanış kanıtı:** Mikro uzmanı ve muhasebe toplam/adet/vergi mutabakatını onaylamış; canlı geçiş ve geri dönüş adımı yazılı.

**Bağımlılıklar:** ERP-07.

## Faz09 / Trendyol, Hepsiburada ve N11 ile merkezi sipariş

**Müşteri/işletme girdileri:** Üç mağaza/test erişimi, kanal kategori/özellik/barkod ve komisyon/fatura/kargo sözleşmeleri; veri sahipliği ve kanal açılış kabul sahipleri.

**Son değişiklik:** Son commitlerde Trendyol/Hepsiburada/N11 gerçek adaptörleri eklenmedi. Panelin doğrulanmamış bağlantıyı açık göstermesi korunur; sahte başarılı senkron sonucu yok.

### PAZ-01

**Üç kanalın erişim ve eşleme sözleşmesini tamamla** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mağaza/test hesapları, kategori/özellik/barkod, görsel, komisyon, kargo, fatura ve API kısıtlarını kanal bazında doğrula.

**Yapıldı / mevcut temel:** Üç pazaryeri için panel başlıkları ve iç ürün/SKU modeli mevcut.

**Yapılmadı / açık kalan:** Her kanalın mağaza/test erişimi, kategori/özellik/barkod ve operasyon/API sözleşmeleri bekleniyor.

**Kapanış kanıtı:** Her kanal için alan sahipliği, izinler, test veri seti ve teknik muhatap kayıtlı; sırlar güvenli depoda.

**Bağımlılıklar:** KAR-02, KAR-04.

### PAZ-02

**Trendyol adaptörünü uygula** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ürün eşleme/yayın, stok-fiyat, sipariş, durum/kargo ve hata okuma yeteneklerini sandbox sözleşmesine göre geliştir.

**Yapıldı / mevcut temel:** Trendyol panel alanı gerçek bağlantı doğrulanmadı şeklinde sunuluyor.

**Yapılmadı / açık kalan:** Gerçek Trendyol ürün, fiyat/stok, sipariş ve kargo/durum adaptörü ve sandbox kabulü eksik.

**Kapanış kanıtı:** Tek ürün ve sipariş döngüsü gerçek test yanıtıyla çalışıyor; tekrar/idempotency ve rate limit kontrollü.

**Bağımlılıklar:** PAZ-01, SEC-06.

### PAZ-03

**Hepsiburada adaptörünü uygula** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kanalın kendi kategori, listeleme, sipariş ve gönderi sözleşmesine uygun adaptör ve hata eşlemesini kur.

**Yapıldı / mevcut temel:** Hepsiburada panel alanı var; bağlı sağlayıcı iddiası yok.

**Yapılmadı / açık kalan:** Kanala özel kategori/listeleme/sipariş/gönderi adaptörü ve hata eşlemesi eksik.

**Kapanış kanıtı:** Trendyol varsayımları taşınmadan kendi test seti geçiyor; dış kimlikler izlenebilir; tekrar veri üretmiyor.

**Bağımlılıklar:** PAZ-01, SEC-06.

### PAZ-04

**N11 adaptörünü uygula** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kanalın gerçek API yeteneğiyle ürün, stok/fiyat, sipariş, durum ve gönderi akışlarını kur.

**Yapıldı / mevcut temel:** N11 panel alanı var; başarılı senkron uydurulmuyor.

**Yapılmadı / açık kalan:** Gerçek N11 API adaptörü, stok/fiyat/sipariş/durum/gönderi ve kabul eksik.

**Kapanış kanıtı:** Yetki, zaman aşımı, kısmi batch hata ve tekrar testleri geçiyor; kanal sonuçları ayrı izleniyor.

**Bağımlılıklar:** PAZ-01, SEC-06.

### PAZ-05

**Merkezi sipariş ve kanal stok dağıtımını kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Webhook/polling siparişlerini tekilleştir, ortak rezervasyona al, kanal fiyat/stok yayını ve senkron gecikmesini yönet.

**Yapıldı / mevcut temel:** İç sipariş kimliği ve temel stok/fiyat alanları var.

**Yapılmadı / açık kalan:** Kanal sipariş tekilleştirme, ortak rezervasyon, kanal fiyat/stok yayını ve gecikme yönetimi eksik.

**Kapanış kanıtı:** Aynı sipariş iki yoldan gelse tek kayıt var; son stok çok kanalda fazla satılmıyor veya onaylı politika uygulanıyor.

**Bağımlılıklar:** PAZ-02, PAZ-03, PAZ-04, TIC-03.

### PAZ-06

**Kanal kargo, iptal/iade ve faturayı bağla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kanal durumunu iç duruma eşle; etiket/takip, müşteri iptali, iade ve fatura bağlantısını tamamla.

**Yapıldı / mevcut temel:** İç iptal/iade ve gönderi alanlarının mevcut temeli var.

**Yapılmadı / açık kalan:** Kanal durum eşlemesi, etiket/takip, müşteri iptali/iadesi ve fatura bağlantısı eksik.

**Kapanış kanıtı:** Geçersiz durum sırası güvenli reddediliyor; kanal ve iç sipariş farkı görünür; muhasebe belgesi mükerrer değil.

**Bağımlılıklar:** PAZ-05, TIC-08, ERP-06.

### PAZ-07

**Panel eşleme, iş geçmişi ve fark yönetimini kur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ürün eşleme, son senkron, job detayı, hatalı satır, retry ve stok/fiyat/sipariş mutabakatını gerçek API'ye bağla.

**Yapıldı / mevcut temel:** Panel entegrasyon görünümü gerçek iş verisi yokken başarı veya örnek iş üretmiyor.

**Yapılmadı / açık kalan:** Gerçek ürün eşleme, son senkron/job/hatalı satır/retry ve stok-fiyat-sipariş fark ekranları açık.

**Kapanış kanıtı:** Operatör hangi kanalda hangi kaydın neden başarısız olduğunu görüyor; manuel tekrar yetkili ve audit'li.

**Bağımlılıklar:** PAZ-05, PAZ-06, ADM-07.

### PAZ-08

**Her kanalı ayrı kabul edip kontrollü aç** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Entegrasyon geliştirici + kanal operasyonu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ürün yayınından sipariş/iade mutabakatına sandbox UAT, ilk yükleme dry-run ve sınırlı canlı açılış planı hazırla.

**Yapıldı / mevcut temel:** Her kanal için ayrı task ve kabul hedefi tanımlı.

**Yapılmadı / açık kalan:** Trendyol/Hepsiburada/N11 ayrı sandbox UAT, ilk yükleme dry-run ve sınırlı canlı açılış yapılmadı.

**Kapanış kanıtı:** Üç kanal için ayrı kanıt/tutanak var; biri geçti diye diğerleri tamam sayılmıyor; durdurma/geri alma planı testli.

**Bağımlılıklar:** PAZ-07.

## Faz10 / AI tasarım üretimi, satış asistanı ve AI yönetim paneli

**Müşteri/işletme girdileri:** AI kota/bütçe, içerik/lisans ve insan inceleme politikası; alternatif/yeniden üretim ve ek düzenleme kapsamı, WhatsApp muhatabı ve kalite kabul matrisi.

**Son değişiklik:** 27.10 son tercihi dda85b6: tek aday üretimi ve prompt v5; ek yerel inceleme kaldırıldı. Prompt kuralları moderasyon/garanti değildir. Önceki 5f7792a incelemesi mevcut özellik olarak sayılmaz. de99958 ana sayfa tanıtım yerleşimidir; soru motoru/AI kalitesi değişmedi.

### AI-01

**AI oturum ve iş durumunu kalıcı SQL'e taşı** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Dosya tabanlı DesignSessionStore oturum/soru geçmişi ve üretim işlerini kalıcı, süreli ve yarış güvenli kaynağa al; geçişi kontrollü tasarla.

**Yapıldı / mevcut temel:** Soru/üretim oturumu ve durum takibi için mevcut DesignSessionStore bulunuyor.

**Yapılmadı / açık kalan:** XINOBI U oturum/iş/soru geçmişinin süreli, yarış güvenli SQL geçişi tamamlanmadı.

**Kapanış kanıtı:** Restart ve eşzamanlı worker aynı işi iki kez üretmiyor; geçmiş kaybolmuyor; migration/geri alma planı testli.

**Bağımlılıklar:** SEC-06, KAR-07.

### AI-02

**Atomik kota, maliyet ve kötüye kullanım kontrolü kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Hesap/anonim oturum, günlük kota, bütçe rezervasyonu, harcanan/başarısız iş ve gerçek sağlayıcı kullanımını ilişkilendir.

**Yapıldı / mevcut temel:** Mevcut kullanım/maliyet ve politika parçaları var.

**Yapılmadı / açık kalan:** Atomik hesap/anonim kota, bütçe rezervasyonu, başarısız iş ve gerçek sağlayıcı kullanım uzlaştırması kabul edilmedi.

**Kapanış kanıtı:** Paralel istek limiti aşmıyor; belirsiz çağrı otomatik ücretli tekrara dönüşmüyor; operatör maliyet farkını görebiliyor.

**Bağımlılıklar:** KAR-07, AI-01.

### AI-03

**AI girdi ve çıktı güvenlik denetimini kur** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı içerik/lisans politikasına göre prompt girdisi, yüklenen dosya ve üretilen çıktı için moderasyon ve red/inceleme yolunu uygula.

**Yapıldı / mevcut temel:** Prompt içerik kuralları bulunuyor; yerel ek çıktı incelemesi kullanıcı tercihiyle kaldırıldı.

**Yapılmadı / açık kalan:** Prompt yasakları moderasyon değildir. Onaylı girdi/çıktı güvenlik politikası ve red/insan inceleme yolu açık.

**Kapanış kanıtı:** Yasak içerik ve istenmeyen yazı/ürün mockup'ı için ölçülen kabul seti var; yalnız prompt yasağı yeterli sayılmıyor.

**Bağımlılıklar:** KAR-07, KAR-08.

### AI-04

**Prompt kalitesi ve alternatif üretimini kabul et** — P1 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Güncel sanat yönünü ürün/renk/stil matrisiyle değerlendir; alternatif sayısı, yeniden üretim ve başarısız sonuç davranışını D08'e göre tamamla.

**Yapıldı / mevcut temel:** Sanat yönü prompt v5 ve tek aday üretimi tercihi uygulanmış; tarihsel hedefli prompt testleri var.

**Yapılmadı / açık kalan:** Gerçek ürün/renk/stil kalite matrisi, başarısız çıktı ve alternatif/yeniden üretim iş kabulü kapanmadı.

**Kapanış kanıtı:** Creative/ürün onaylı örnek seti, hata oranı ve gecikme kaydı var; ücretli deneme onaylı bütçeyle sınırlı.

**Bağımlılıklar:** AI-02, AI-03.

### AI-05

**AI ek düzenleme ve şablon kapsamını tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kaynak kapsamındaki arka plan kaldırma/genişletme ve çıktı seçeneklerini lisans/sağlayıcı yeteneğiyle doğrula; eksikleri uygula veya kapsam kararına bağla.

**Yapıldı / mevcut temel:** Yükleme, AI üretim ve ortak yerleşim akışları mevcut.

**Yapılmadı / açık kalan:** Arka plan kaldırma/genişletme, şablon/çıktı seçenekleri ve lisans/sağlayıcı yetenek kabulü eksik.

**Kapanış kanıtı:** Özellik ilanı gerçek yeteneğe dayanıyor; web/mobil aynı sonuç revizyonunu kaydedip önizliyor.

**Bağımlılıklar:** KAR-01, AI-04.

### AI-06

**Soru havuzu ve özellik bayrağı yönetimini kur** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut 500 soruluk sürümlü havuza yetkili panel düzenleme/yayın/geri alma ve ortam/hesap bazlı güvenli bayrak yönetimi ekle.

**Yapıldı / mevcut temel:** 500 soruluk sürümlü havuz ve mevcut AI yönetim ekranı parçaları var.

**Yapılmadı / açık kalan:** Yetkili soru düzenleme/yayın/geri alma ve ortam/hesap bazlı güvenli özellik bayrakları tamamlanmadı.

**Kapanış kanıtı:** Yayınlanan soru sürümü oturumda sabit; aktif anket ortasında değişmiyor; üretim kapatma anahtarı yeni işleri durduruyor.

**Bağımlılıklar:** ADM-01, AI-01.

### AI-07

**Nobi gerçek yanıt ve insan devrini kabul et** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Katalog temelli fiyat/stok, kaynak doğruluğu, sağlayıcı hata/fallback ve WhatsApp/lead devrini gerçek yapılandırmada dene.

**Yapıldı / mevcut temel:** Katalog temelli Nobi, Cloudflare metin modeli ve kural tabanlı fallback var; geçmişte kullanıcı doğrulama kaydı bulunuyor.

**Yapılmadı / açık kalan:** Güncel gerçek yapılandırmada kaynak doğruluğu/hata/WhatsApp veya lead devri uçtan uca kabul edilmeli.

**Kapanış kanıtı:** İzinli testte gerçek yanıt kanıtı var; uydurma fiyat/sipariş işlemi yok; canlı destek hattı ve saklama politikası onaylı.

**Bağımlılıklar:** KAR-04, KAR-08.

### AI-08

**AI operasyon raporunu ve yaşam döngüsünü tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Backend + AI ürün sahibi + Admin + QA. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Tüm geçmişte tarih/hesap/model sorgusu, gerçek kullanım/maliyet, başarısızlık alarmı, saklama/silme ve sağlayıcı çıkış planı oluştur.

**Yapıldı / mevcut temel:** AI kullanım/politika/kaynak/konuşma yönetim parçaları var.

**Yapılmadı / açık kalan:** Tüm geçmişi kapsayan sunucu sorgusu, gerçek maliyet mutabakatı, alarm, saklama/silme ve sağlayıcı çıkış planı açık.

**Kapanış kanıtı:** Panel yalnız yüklenmiş kayıtları filtrelemiyor; silme işi özel görselleri kapsıyor; CTO/ürün kalite ve maliyet kabulü kayıtlı.

**Bağımlılıklar:** AI-02, SEC-03, ADM-06.

## Faz11 / iOS/Android, çapraz kanal kabulü ve canlıya geçiş

**Müşteri/işletme girdileri:** Firebase/APNs, mağaza/signing hesap sahipleri, hedef cihazlar; platform/işletim/UAT sahipleri, yayın takvimi, SLA/devir ve GO/NO-GO onayları.

**Son değişiklik:** de99958 Flutter önizleme satır düzeni ve Temsilidir: 320/390/700px, 1x/2x metin, CTA testi; 79/79 Flutter ve analiz temiz. Yeni APK veya telefon kurulumu yok. Son kayıtlı release xinobi-799e1af (DEPLOY-016); güncel HEAD için IIS kurulumu kanıtlanmadı.

### MOB-01

**Üretim ortamı ve HTTPS yapılandırmasını hazırla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** API_BASE_URL ve XINOBI_WEB_PREVIEW_URL değerlerini aynı hesap/katalog ortamına sabitle; debug HTTP istisnalarını yayın profilinde kapat.

**Yapıldı / mevcut temel:** API ve ortak web önizleme adresleri yapılandırılabiliyor; mevcut Flutter istemcisi ve köprü var.

**Yapılmadı / açık kalan:** Release HTTPS/origin matrisi ve localhost/debug istisnalarının kapatılması üretim ortamında doğrulanmalı.

**Kapanış kanıtı:** Release uygulaması emülatör/localhost adresine gitmiyor; API ve editör sürümü uyumlu; yanlış origin köprü açamıyor.

**Bağımlılıklar:** OPS-01, OPS-05.

### MOB-02

**Native ödeme ve 3DS dönüşünü tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ödeme sağlayıcısının seçilen mobil yolunu uygula; uygulama arka plana geçişi, dış tarayıcı ve dönüşte sunucudan durumu yenile.

**Yapıldı / mevcut temel:** Native sepet ve demo sipariş yolu var.

**Yapılmadı / açık kalan:** Gerçek mobil ödeme/3DS, dış tarayıcı dönüşü, uygulama yeniden açılışı ve sunucudan ödeme doğrulama eksik.

**Kapanış kanıtı:** Android/iOS'ta başarı, iptal, kesilen bağlantı ve uygulama yeniden açılışında tek sipariş/tek ödeme korunuyor.

**Bağımlılıklar:** TIC-04, TIC-05.

### MOB-03

**Firebase SDK ve cihaz token kaydını bağla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Firebase/APNs girdileriyle izin ekranı, token ilk kayıt/yenileme, kullanıcı değişimi ve çıkışta cihaz bağını kaldırmayı uygula.

**Yapıldı / mevcut temel:** Sunucuda bildirim/cihaz altyapısının mevcut parçaları var.

**Yapılmadı / açık kalan:** Firebase SDK/APNs, izin isteme, token kayıt/yenileme ve hesap çıkışında cihaz bağını kaldırma mobilde tamamlanmadı.

**Kapanış kanıtı:** İzin reddi uygulamayı engellemez; yenilenen token sunucuya gider; eski hesaba bildirim sızmaz.

**Bağımlılıklar:** KAR-07, KAR-04.

### MOB-04

**Push teslimini ve derin bağlantıyı tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ön plan/arka plan/kapalı uygulama bildirimi ve sipariş/teklif/tasarım bağlantılarını güvenli rotalara bağla.

**Yapıldı / mevcut temel:** Uygulama içi bildirim listeleme temeli mevcut.

**Yapılmadı / açık kalan:** Gerçek push teslimi ve ön/arka plan/kapalı uygulama deep link kabulü Android ve iOS için yapılmadı.

**Kapanış kanıtı:** İzinli gerçek Android ve iOS cihazda teslim kanıtı var; yetkisiz kayda yönlendirme reddediliyor; aynı bildirim çift işlem yapmıyor.

**Bağımlılıklar:** MOB-03, SEC-04.

### MOB-05

**Native-WebView editör köprüsünü cihazda kabul et** — P1 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Giriş, token yenileme, dosya seçimi, renk değişimi, kayıt/iptal, sepet çakışması ve geri tuşunu gerçek cihazda dene.

**Yapıldı / mevcut temel:** Ortak WebView editörü ve güvenli hesap köprüsü mevcut; geçmiş Android emülatör kontrolleri kayıtlı.

**Yapılmadı / açık kalan:** Her iki platformda gerçek cihaz oturum/yenileme/dosya/geri tuşu ve kesinti matrisiyle güncel kabul açık.

**Kapanış kanıtı:** Token URL/JS/storage/loglarda yok; aynı revizyon/adet geri dönüyor; harici origin hesap proxy'si kullanamıyor.

**Bağımlılıklar:** KIS-03, QA-05.

### MOB-06

**03.11 ek teknik kanıt:** [Flutter–web eşlik matrisi](../../design/flutter-consistency-audit-2026-11-03.md), [TST-196](../../test/2026-11-03/TST-196-flutter-web-consistency.md). Favoriler web ile aynı hesap API'sinde; 192 hücre widget matrisi ve 280/280 Flutter testi; Android emülatör oturum kapalı/OS %200; iOS Bloke (Xcode yok). Gerçek hesapla cihaz eşitleme kabulü açık.

**Mobil katalog ve hesap eşliğini kabul et** — P1 / Doğrulama / **Kısmen yapıldı**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Arama, karşılaştırma, normal/tasarım favorileri, adres, hesap silme, sipariş/iade ve teklif akışlarını web ile karşılaştır.

**Yapıldı / mevcut temel:** Katalog/arama/karşılaştırma, hesap/adres/tasarımlar ve sipariş ekranları var; son Flutter paketi 72/72 geçti. de99958 sonrası Flutter ana sayfa düzeni düzeltildi; tam mobil paket 79/79.

**Yapılmadı / açık kalan:** Web ile aynı gerçek hesap/favori/teklif ve ticari akış eşliği Android/iOS cihazlarında ayrıca kabul edilmeli.

**Kapanış kanıtı:** Seçilen ürün/rengin bilgisi tutarlı; gerçek hesap favori eşitlemesi doğrulanmış; cihaz sepeti politikası kullanıcıya açık.

**Bağımlılıklar:** TIC-01, WEB-04, B2B-08.

### MOB-07

**Cihaz performansı ve kesinti deneyimini düzelt** — P1 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Düşük bellek, yavaş ağ, uçak modu, döndürme, kamera/galeri izni, büyük görsel ve uygulama öldürme testlerini yap.

**Yapıldı / mevcut temel:** Yükleme iptali ve yerleşim etkileşimleri için mevcut düzeltme/test kayıtları var.

**Yapılmadı / açık kalan:** Hedef düşük bellekli cihaz, yavaş ağ/uçak modu, büyük görsel, izin/döndürme ve uygulama öldürme matrisi eksik.

**Kapanış kanıtı:** Taslak kaybı politikası açık; süresiz yüklenme/çökme yok; uzun listeler ve editör onaylı hedef cihazda akıcı.

**Bağımlılıklar:** KAR-07, QA-05.

### MOB-08

**İmzalı Android ve iOS dağıtımını hazırla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** Mobil geliştirici + QA + yayın sorumlusu. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Paket/bundle kimliği, signing, sürüm numarası, izin açıklamaları, ikon/splash ve test dağıtım kanallarını tamamla.

**Yapıldı / mevcut temel:** Geçmiş Android geliştirme APK/emülatör kayıtları mevcut.

**Yapılmadı / açık kalan:** İmzalı üretim AAB, iOS archive, TestFlight/kapalı test ve güvenli signing kabulü tamamlanmadı; yeni APK üretilmedi. Son ana sayfa düzeltmesinin telefona kurulumu da bekliyor (MOB-HOME-02).

**Kapanış kanıtı:** AAB ve iOS archive kurulabilir; anahtarlar güvenli saklanmış; TestFlight/kapalı test kanıtı var; mağaza yayını UAT-06'ya bağlı.

**Bağımlılıklar:** KAR-07, MOB-01.

### OPS-05

**Sürüm uyumu ve son release kurulumunu doğrula** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Kaynak HEAD, release kaynak commit'i, deployment.json ve mobil bridge sürümünü eşle; son yayının gerçek IIS durumunu kaydet.

**Yapıldı / mevcut temel:** Birleşik release yöntemi var; son kayıtlı paket xinobi-799e1af. Güncel kaynak HEAD 42bee88 ve yerel servislerde çalışıyor.

**Yapılmadı / açık kalan:** Son kodun yeni release paketlemesi/IIS kurulumu ve deployment.json + mobil bridge sürüm eşliği doğrulanmadı.

**Kapanış kanıtı:** Web/admin/API kurulu sürümü kanıtlı; 799e1af release kaydı otomatik kurulu sayılmıyor; uyumsuz istemci güvenli hata veriyor.

**Bağımlılıklar:** QA-01.

### OPS-06

**Deploy ve rollback provasını tamamla** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut tek komut GitHub Release/IIS yolunda checksum, dış ayar koruma, stop/start, readiness ve geri dönüşü staging'de dene.

**Yapıldı / mevcut temel:** Checksum, dış ayar koruma ve IIS stop/start/rollback araçları/runbook mevcut.

**Yapılmadı / açık kalan:** Güncel staging sürümünde gerçek deploy/rollback/readiness provasıyla uçtan uca kabul eksik.

**Kapanış kanıtı:** Başarısız health check eski sürüme dönebiliyor; medya/SQL korunuyor; migration ayrı kontrollü adım olarak belgeli.

**Bağımlılıklar:** OPS-02, OPS-05.

### OPS-08

**İşletim runbook ve erişim devrini tamamla** — P1 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** DevOps/işletim + DBA + Backend. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Migration/runtime hesap ayrımı, sır yenileme, servis yeniden başlatma, olay yönetimi, maliyet ve sorumlu/ikame listesini güncelle.

**Yapıldı / mevcut temel:** Tek komut deploy ve mevcut işletim dokümanları var.

**Yapılmadı / açık kalan:** Runtime/migration hesap ayrımı, sır yenileme, olay/ikame/SLA/maliyet ve yetkili erişim devri tamamlanmadı.

**Kapanış kanıtı:** Yeni operatör deploy/restore/iş tekrarını dokümanla yapabiliyor; yönetim anahtarları güvenli devredilmiş; Docker/hosting değişimi eklenmemiş.

**Bağımlılıklar:** OPS-06, OPS-07.

### QA-05

**Android ve iOS cihaz regresyonunu otomatikleştir** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Mevcut Flutter testlerine fiziksel cihaz/simülatör oturum, ödeme, editör köprüsü, push ve deep link senaryolarını ekle.

**Yapıldı / mevcut temel:** Flutter 72 test ve geçmiş Android emülatör editör kanıtları var. de99958 sonrası Flutter ana sayfa düzeni düzeltildi; tam mobil paket 79/79.

**Yapılmadı / açık kalan:** Android+iOS fiziksel cihaz/simülatörde ödeme/push/deep link ve köprü kabulünün otomasyon kapsamı açık.

**Kapanış kanıtı:** Her iki platform için build ve cihaz kanıtı var; bir Android emülatörü tüm mobil kabulü temsil etmiyor.

**Bağımlılıklar:** MOB-02, MOB-04, MOB-08.

### QA-06

**Sağlayıcı sandbox uçtan uca paketini çalıştır** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** QA + tüm geliştirme sorumluları. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Ödeme, kargo, e-posta/SMS/push, AI, Mikro ve üç pazaryerini izinli test verisiyle ayrı ayrı doğrula.

**Yapıldı / mevcut temel:** İzole sağlayıcı fixture ve test yapılandırmalarının mevcut parçaları var.

**Yapılmadı / açık kalan:** Ödeme/kargo/e-posta/SMS/push/AI/Mikro/üç kanalın izinli sandbox uçtan uca ve mutabakat paketi kapanmadı.

**Kapanış kanıtı:** İstek/sonuç kimliği ve mutabakat kanıtı saklı; ücretli/dış yazım yalnız tanımlı test kapsamında; fixture sonucu canlı kabul sayılmıyor.

**Bağımlılıklar:** TIC-05, ERP-08, PAZ-08, AI-04.

### UAT-01

**Takvim, sorumlu ve kapasiteyi kesinleştir** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Her task için atanmış kişi, tahmin, hedef tarih, dış bağımlılık ve kabul sahibi ekle; P1 kapsamını sessizce erteleme.

**Yapıldı / mevcut temel:** 120 görev ve rol bazlı önerilen sorumlular mevcut.

**Yapılmadı / açık kalan:** Kişi bazlı kapasite/tahmin/hedef tarih, dış bekleme süreleri ve imzalı sprint/milestone planı yok.

**Kapanış kanıtı:** Onaylı sprint/kilometre taşı planı var; erişim/karar bekleme süreleri geliştirme tahmininden ayrı.

**Bağımlılıklar:** KAR-01, KAR-08.

### UAT-02

**Web ve admin iş sahibi UAT'sini tamamla** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Gerçek test hesabıyla kayıt-alışveriş-ödeme-kargo-iade, katalog-fiyat-stok-rol-rapor ve destek akışını kabul ettir.

**Yapıldı / mevcut temel:** Yerel teknik katalog/ürün/erişilebilirlik ve admin test kanıtları var.

**Yapılmadı / açık kalan:** Gerçek ödeme-kargo-iade ve panel finans/rol/destek akışlarının ürün/operasyon sahibi imzalı UAT’si eksik.

**Kapanış kanıtı:** Her senaryo geçer veya kusur kaydına bağlı; operasyon sahibi ve ürün sahibi sürüm/tarih belirterek imzalamış.

**Bağımlılıklar:** WEB-03, ADM-05, QA-04, QA-06.

### UAT-03

**Mobil iş sahibi UAT'sini tamamla** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Android/iOS gerçek cihazda ödeme, dosya/AI editörü, sepet/favori, push/deep link ve erişilebilirliği kabul ettir.

**Yapıldı / mevcut temel:** Mobil kod, Flutter testleri ve geçmiş Android emülatör kontrolleri var.

**Yapılmadı / açık kalan:** Her iki gerçek platformda ödeme/editör/push/deep link/erişilebilirlik için iş sahibi imzalı UAT yok.

**Kapanış kanıtı:** Platform başına imzalı tutanak var; canlı API/editor ortamı doğrulanmış; kritik çökme ve satın alma engeli yok.

**Bağımlılıklar:** MOB-05, MOB-06, MOB-07, QA-05.

### UAT-04

**Sipariş tasarım dosyaları ve entegrasyon operasyonunu kabul ettir** — P0 / Doğrulama / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Sipariş tasarım detayında yerleşim ve üç görsel indirmesini; teklif-sipariş, Mikro ve üç pazaryeri mutabakatlarını ilgili iş sahipleriyle kabul et.

**Yapıldı / mevcut temel:** Profil/teklif ve entegrasyon temelleri için task/kod kayıtları mevcut.

**Yapılmadı / açık kalan:** Sipariş tasarım dosyası/yerleşim ve entegrasyon/muhasebe/kanal kabulleri açık; üretime hazırlık ve fiziksel numune bu yazılım tesliminde yok.

**Kapanış kanıtı:** Yetkili iş sahibi dosya-sipariş revizyon eşliğini ve ilgili entegrasyon sonuçlarını kabul etmiş; üretime gönderme adımı şart koşulmamış.

**Bağımlılıklar:** KIS-08, B2B-08, ERP-08, PAZ-08

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### UAT-05

**GO/NO-GO ve veri geçiş planını imzala** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Açık kusurlar, güvenlik/yük/restore sonucu, final katalog, domain, sağlayıcılar ve geri dönüş sorumlularını birlikte değerlendir.

**Yapıldı / mevcut temel:** Release/deploy ve geri dönüş araçları mevcut.

**Yapılmadı / açık kalan:** Final katalog, açık kusurlar, güvenlik/yük/restore, sağlayıcılar ve rollback eşikleriyle imzalı GO/NO-GO eksik.

**Kapanış kanıtı:** Kritik açık yok; kabul edilen istisna sahipli/süreli; veri dondurma, son eşitleme ve rollback eşiği belli.

**Bağımlılıklar:** UAT-02, UAT-03, UAT-04, SEC-08, OPS-06, QA-07.

### UAT-06

**Mağaza başvurularını ve yayınını tamamla** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Google Play/App Store hesap, ekran görüntüsü, açıklama, gizlilik/veri beyanı, hesap silme yolu ve inceleme erişimini hazırla; onay sonrası yayımla.

**Yapıldı / mevcut temel:** Mobil geliştirme ve geçmiş Android paket kayıtları var.

**Yapılmadı / açık kalan:** Google Play/App Store hesap-beyan-inceleme ve onaylı erişilebilir mağaza sürümleri tamamlanmadı.

**Kapanış kanıtı:** İki mağaza için başvuru/sonuç ve erişilebilir sürüm kaydı var; APK üretmek mağaza yayını sayılmıyor.

**Bağımlılıklar:** MOB-08, UAT-03, KAR-08.

### UAT-07

**Canlı cutover ve yayın sonrası smoke yap** — P0 / Geliştirme / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Onaylı mevcut deploy yoluyla web/admin/API kur; mobil uyum ve sağlayıcıları aç; minimum yetkili canlı kontrol ve izleme penceresini yürüt.

**Yapıldı / mevcut temel:** Birleşik GitHub Release/IIS yolu ve yerel web/admin/API çalışma kontrolü var.

**Yapılmadı / açık kalan:** Güncel sürüm için onaylı canlı cutover, deployment.json/health smoke ve yayın sonrası izleme kabulü eksik.

**Kapanış kanıtı:** deployment.json/health ile sürüm doğruluğu ve temel akış kanıtlı; arızada geri dönüş uygulanabilir; son durum kayda işlenmiş.

**Bağımlılıklar:** UAT-05, UAT-06, OPS-07.

### UAT-08

**Eğitim, bakım ve nihai teslimi kapat** — P0 / Karar / kabul / **Yapılmadı - kapanış açık**

**Önerilen sorumlu:** PM + ürün/operasyon + teknik lider. Atanmış kişi ve hedef tarih: belirlenmedi (UAT-01).

**Hedef iş:** Panel/sipariş dosyası inceleme-indirme/entegrasyon eğitimi, teknik doküman, erişim devri, destek/SLA, maliyet ve garanti koşullarını imzalı teslim paketine al.

**Yapıldı / mevcut temel:** Kaynak kod, mevcut runbook ve tarihli test dokümanları var.

**Yapılmadı / açık kalan:** Panel/sipariş dosyası inceleme-indirme/entegrasyon eğitimi, erişim devri, bakım/SLA/maliyet/garanti ve nihai imzalı teslim kapanmadı.

**Kapanış kanıtı:** Açık task yok veya açıkça onaylı kapsam değişikliği var; tüm üç kanal ve ortak servisler için kapanış tutanağı tamam.

**Bağımlılıklar:** UAT-07, OPS-08, QA-08

**03.11 kapsam kararı:** [Sipariş tasarım detayı task planı](order-design-detail-scope-2026-11-03.md). Yalnız planlama; önceki fiziksel üretim hedefleri tarihsel kayıt, yeni karar öncelikli.

### Alt işler (ana taskı parçalar; yeni ana task sayılmaz)

| Alt iş | Ana task | Durum | Kapanış / kalan |
|---|---|---|---|
| MOB-HOME-01 | MOB-06, QA-03 | Yapıldı - teknik | de99958 web düzenine native Flutter eşlik, ürün-kart örtüşmesi giderildi; 7 odaklı/79 tam test. |
| MOB-PARITY-01 | MOB-06, QA-03 | Kısmen yapıldı | 03.11 Flutter–web durum/tasarım eşliği ve hesap favorisi; 280/280 test, Android emülatör; iOS Bloke, oturum açık cihaz kabulü açık. |
| MOB-HOME-02 | MOB-08, QA-05, OPS-05 | Açık | Yetkili paket/dağıtım adımında güncel uygulamayı telefona kur ve görsel kabulü kaydet. Bu dokümantasyon oturumunda APK/kurulum yapılmaz. |
