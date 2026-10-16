# Faz11 — iOS/Android, çapraz kanal kabulü ve canlıya geçiş

**Bağlayıcı kaynak:** `Xinobi_Proje_Kapsami(4).md` iOS, Android, teslim ve yayın maddeleri; `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §2, §3.1, §4/D03–D10, §5, §6.5, §7/K5–K6, §8. Yürütmenin tek kaydı `Faz00_Proje_Takip_ve_Kesintiden_Devam.md`; bu dosya final fazın çalışma talimatı ve kontrol listesidir. İlk on faz bitmiş görünüyor diye platformlar, gerçek erişimler ve müşteri UAT'si atlanmaz.

## 1. Başlama ve erken mobil hazırlık

**Erken başlat:** Faz02'de Creative iOS/Android ekranları, tokenlar, erişilebilirlik, mobil editör jestleri, izin ve hata durumlarını UI/UX+FE'ye verir; Faz03'te mobil proje iskeleti, oturum, API istemcisi, ortam yapılandırması, gerçek cihaz build ve CI kurulur. Faz06 editör API/koordinat sözleşmesiyle mobil editör prototipini gerçek cihazda ölç. Bunlar Faz11 sonunda sıfırdan inşa edilmez; ilgili erken iş Faz00'da görev/commit olarak görünür. D09: kütüphane/native performans, görüntü yükleme, push izinleri ve Apple/Google mağaza hesapları ürün sahibiyle kayıtlı karardır. Faz03, 04, 05, 06, 07, 10 API sözleşmeleri, D03/D04/D05/D07/D08/D10, Creative teslimleri kapanmadan bağımlı gerçek kullanım onayı alınmaz. Faz08/09 canlı entegrasyon mutabakatı final çıkışa girer.

Web Designer ve Creative Designer, Analiz2 ana sayfa/XINOBI U/Nobi hiyerarşisini Flutter'ın iOS ve Android bileşenlerine ayrı referanslarla taşır. Ana slider/video, XINOBI U bannerı, kategori/ürün yatay keşfi, sabit Nobi erişimi, beş soruluk tek-soru ekranı, dört AI adayı, kendi görselini yükleme ve “Temsilidir” önizlemesi; güvenli alan, sistem geri, klavye, izin reddi, düşük bağlantı ve uygulamaya geri dönüş durumlarıyla teslim edilir. Kullanıcı web yönünü onaylamadan mobil hi-fi yönü kilitlenmez; mağaza ekran görüntüleri ayrıca gerçek build ile üretilir.

**Teknik karar:** Faz00/ADR-001 ve proje sahibinin açık kararı gereği mobil uygulama **Flutter + Dart** ile geliştirilir; `apps/mobile`, `packages/contracts` ve gerekliyse native iOS/Android kaynakları kullanılır. Analiz2'deki React Native yalnız aday öneridir ve bu kararı değiştirmez. Ayrı sahte mobil veri deposu veya ikinci iş kuralı kurma; web/panel/mobil aynı `/api/v1` ve katalog/checkout/sipariş/tasarım referanslarıyla çalışır. App Store/Play Console, push ve ödeme sağlayıcısı kuralları yayın hazırlığında resmi sağlayıcı kaynakları ve erişimle doğrulanır; mağaza onayı garanti edilmez. Mobil ödeme türü ve yönlendirme D05 ile uyumlu, ödeme sonucu sunucu webhook/durum sorgusuyla doğrulanır; uygulama ekranı tahsilatı kesinleştirmez.

## 2. Ekran ve sözleşme matrisi (iOS ve Android ayrı işaretlenir)

| Akış | Paylaşılan API/iş kuralı | iOS kanıtı | Android kanıtı |
|---|---|---|---|
| Üyelik/giriş, profil/adres | Faz03 kimlik ve müşteri nesne yetkisi | Bekliyor | Bekliyor |
| Kategori, liste, arama/filtre, detay, favori | Faz04 Product/Variant; seçili renge karşılık doğru görsel/fiyat/stok | Bekliyor | Bekliyor |
| Kampanya ve medya | Faz04–05 merkezi kampanya, yayın ve varlık | Bekliyor | Bekliyor |
| Basit kişiselleştirme ve tam editör | Faz06 DesignVersion/PrintArea/Asset; ön/arka, katman metin-görsel-şekil, konum/ölçek/döndürme, sıra/kilit/görünürlük, font, şablon, hizalama, geri/ileri, kaydet/aç/geçmiş, taşma/çözünürlük/baskı | Bekliyor | Bekliyor |
| Sepet, ödeme, sipariş/takip/geçmiş | Faz05 kesinleştirme, idempotency, sipariş/ödeme/kargo/iade durumu | Bekliyor | Bekliyor |
| Kurumsal teklif ve toplu talep | Faz07 firma, ürün, adet, tasarım, termin, dosya, durum | Bekliyor | Bekliyor |
| AI tasarım, varyasyon/editör ve satış asistanı | Faz10 işler, limit, görüşme, öneri, lead, insan/WhatsApp devri | Bekliyor | Bekliyor |
| Bildirim ve push | Ortak bildirim/olay API'si, izin, hedef hesabın nesne yetkisi | Bekliyor | Bekliyor |

`apps/mobile` ekranları Creative tasarım paketine dayanır; FE/UIUX handoff kabulü Faz00'a girer. Erişilebilirlikte metin boyutu, kontrast, ekran okuyucu etiketleri, dokunma hedefleri; dar ekran/klavye/boş-hata-yükleme ve çevrimdışı durumlar doğrulanır. Mobil editörün bütün kaynak işlevleri iki işletim sisteminde korunur. Cihaz performansı yetersizse özelliği sessizce çıkarma: sorunu D09'a, iyileştirmeyi ve PM kararını Faz00'a yaz; gerekli beceri/kapasiteyi ayrıca planla.

## 3. Sıralı uygulama ve final teslim işleri

| ID | Uygulama adımı | Bitiş kanıtı |
|---|---|---|
| 11.01 | PM D09 ve Faz02–03 erken mobil hazırlığı inceler; Creative iki platformun bütün ekran durumlarını teslim eder, FE ve mobil uygulama sorumlusu handoff kabul/eksik kaydeder. | Ekran/API matrisi, cihaz listesi, build imzası ve mağaza erişimi Faz00'dadır. |
| 11.02 | Full Stack mobil proje ve otomatik dağıtımı doğrular; BE token yenileme/sonlandırma ve cihaz kaydını yetki sınırına bağlar. | Temiz iOS/Android kurulum, giriş/çıkış, başka hesaba geçiş; sır build içine gömülmez. |
| 11.03 | FE + Full Stack katalog, arama/filtre, favori, profil/adres, kampanya ve erişilebilir akışları iki platformda uygular. | Aynı varyant web ve mobilde aynı görsel, stok, fiyat; hata/boş/ağ kesintisi durumları gösterilir. |
| 11.04 | FE + BE tasarım editörü, medya yükleme/iş bekleme, sürüm ve baskı uyarısını iki platformda uygular; D04 koordinat ve fiziksel dosya karşılaştırması yapar. | Kaydet-aç-geçmiş-ön/arka, katman/geri/ileri ve sipariş sürümü aynı; baskı dosyası eşleşir. |
| 11.05 | BE + Full Stack sepet, ödeme denemesi, sunucu kesinleştirme, sipariş/kargo/iade ve kurumsal formları bağlar. | Gerçek sağlayıcı testinde iki tıklama/timeout/webhook tekrarı tek tahsilat ve stok hareketi; teklif otomatik tahsilata dönüşmez. |
| 11.06 | Faz10 AI üretim/edits ve asistanı; push izni, opt-out, olay->hedef kullanıcı eşlemesi, uygulama içi bildirim ve deep linkleri uygular. | Her platformda üretim bekliyor/hata/limit, editöre aktarım, lead/devir; başka kullanıcının push veya sipariş ayrıntısı açılmaz. |
| 11.07 | BA senaryo bazlı web-iOS-Android ve panel, Mikro, Trendyol/Hepsiburada/N11 çapraz kanal UAT yürütür. DBA veri mutabakatı; BE/FE hata giderimi. | Aşağıdaki matris gerçek kanıtla doldurulur; kritik açık hata kalmaz. |
| 11.08 | Güvenlik, kapasite/performans, erişilebilirlik, gözlemleme, yedek-geri yükleme ve migrasyon/geri alma provası yapılır. | Hedefler müşteri/PM ile ölçülmüş ve Faz00'da kayıtlıdır; felaket geri yükleme somut ortamda denenmiştir. |
| 11.09 | Creative/UIUX onaylı üretim varlıkları, içerik ve yasal metinler yüklenir; SEO/analytics ve rıza D10'a göre kontrol edilir. | Ürün/kategori/blog sitemap, canonical, metadata, yapılandırılmış veri; analitik yalnız geçerli rızayla, test siparişi dönüşümü çift sayılmadan. |
| 11.10 | Staging verisi ve sağlayıcı test durumu teyit edilir, Xinobi gerçek iş sahibi UAT imzalar; dağıtım/rollback runbook ile web/API/worker/mobil üretim sürümleri hazırlanır. | Üretim checklist'i, imza, migration/yedek, sır referansları, sağlık ve geri alma eşiği Faz00'da. |
| 11.11 | PM'nin ayrı üretim öncesi `GO/NO-GO` yetkilendirmesi sonrasında kontrollü canlı dağıtım, smoke ve sağlayıcı mutabakatı; mağaza metin/görsel/izin, gizlilik ve release teslimi. | Web/API/worker canlı; iOS/Android mağaza gönderimi ve yayın/onay bağlantıları/sonuçları ayrı kanıtlı, red varsa düzeltilip yeniden gönderilmiş. |
| 11.12 | Operasyon eğitimi, panel/ürün/AI/entegrasyon/sipariş/baskı kullanım rehberi, erişim devri, bakım ve hata devralma; Faz00 kapanışı. | Eğitime katılım ve runbook, gerçek ekip yedi onayı ve PM zorunlu nihai karar. |
| 11.13 | **Teknik dokümantasyon teslimi** (kapsam teslim kalemi): mimari genel bakış ve ADR dizini, OpenAPI referansı ve istemci üretimi, veri modeli ve migration geçmişi, kurulum/ortam ve sır yönetimi, dağıtım/rollback, yedek/restore, kuyruk yeniden işleme, Mikro ve pazaryeri runbook'ları, AI sağlayıcı ve limit yönetimi, güvenlik ve erişim devri, panel kullanıcı kılavuzu. | Her belge repoda sürümlü, sahibi ve son doğrulama tarihi var; iş sahibi teslim alındığını imzalar. |
| 11.14 | **Geçiş günü (cutover) planı:** Faz01 01.17 envanterine göre ilk veri yüklemesi, Faz08/09 eşleme mutabakatı, pazaryeri stok yazma devri ve dondurma penceresi, eski site URL 301 haritası, DNS/TLS geçişi, özellik bayraklarıyla kademeli açılış ve geri dönüş eşiği. | Staging'de tam prova; geçiş günü kontrol listesi ve sorumlular Faz00'da; çift satış ve kayıp sipariş olmadığı mutabakatla gösterilir. |
| 11.15 | **Güvenlik ve yük testleri:** Faz00 T-10/T-11 araçlarıyla OWASP ASVS hedef seviyesine göre güvenlik doğrulaması, bağımsız sızma testi (iş sahibi kararıyla iç veya dış), D14/Faz01 01.18 hedeflerine karşı yük testi. | Kritik/yüksek bulgular kapalı veya PM risk kabulüyle kayıtlı; yük testi raporu hedeflerle karşılaştırmalı. |
| 11.16 | **Bakım ve destek devri (D14):** Garanti süresi, hata öncelik sınıfları ve yanıt/düzeltme süreleri, sürüm ve bağımlılık güncelleme takvimi, aylık işletim maliyet raporu. | D14 kararı ve imzalı destek sözleşmesi Faz00'da; karar yoksa proje kapanış kapısı bloke. |

Üretim öncesi `GO/NO-GO` operasyonel dağıtım iznidir; Faz11'in **nihai PM KABUL/RED kararı** canlı ve iki mağaza yayın kanıtı, UAT ve altı rol incelemesi tamamlandıktan sonra ayrıca verilir. İlk izin nihai kabul yerine geçmez.

## 4. UAT, negatif ve operasyon testleri

| Alan | Zorunlu çapraz kontrol ve kanıt |
|---|---|
| Tek müşteri/tek veri | Web'de açılan hesap/favori/adres/tasarım iOS ve Android'de aynı kullanıcıya görünür; başka kullanıcıya görünmez. |
| Varyant ve stok | Renk görseli/variantId editör, sepet, sipariş ve panelde eş; stoksuz ürün sepete/checkout'a alınmaz; son stok yarışında tek sipariş. |
| Ödeme ve iade | Gerçek ödeme sandbox'ı ve sunucu doğrulaması; webhook/çift basma/ağ kesintisi tek sipariş/ödeme/stok; havale elle onay, kargo, iptal/iade ayrı geçiş. |
| Tasarım/baskı | Seçili varyant ve ölçüde iki yüzde, katman, geri/ileri, kaydet/aç/geçmiş, AI asset, taşma/DPI; siparişe bağlı değişmez sürüm ve üretimce kabul edilen çıktı. |
| Kurumsal ve müşteri yönetimi | Her kanalda teklif/toplu talep, dosya, e-posta, panel not/geçmiş; firma/müşteri profil arama, düzeltme, maskeleme ve yetki; D07 onaylı dönüşüm dışında ücretli sipariş oluşmaz. |
| Değerlendirme/bildirim/panel | Ürün ve sipariş değerlendirmeleri ayrı; moderasyon ve sahiplik; e-posta/SMS gerçek sandbox ve hata/yeniden deneme; panel bildirim yönetimi, sistem ayarları, işlevsel dashboard/temel rapor ve audit gerçek kayıtlarla çalışır. |
| AI | Her kanalda iş limit/moderasyon/alternatif/dört düzenleme/timeout, asistan kaynaklı öneri/lead/devir; maliyet ve başarısız yanıt paneli. |
| Entegrasyon | Mikro ve üç pazaryerinde her biri için gerçek erişim, SKU/sipariş/stok/fiyat/kargo/iade aktarımı ve merkezî sipariş mutabakatı; mock işaretleri gerçek kabul yerine geçmez. |
| Mobil yaşam döngüsü | Temiz yükleme, izin ret/kabul, foreground/background, kesilen ağ ve geri dönüş, düşük bellek/bağlantı, push açılışı; gerçek iOS ve Android cihazda test. |
| Güvenlik | API/panel rol ve nesne yetkisi, dosya erişimi, upload tür/boyut, webhook doğrulama, CSRF/oturum, sır taraması, log maskeleme, bağımlılık ve uygulama güvenliği kontrolü; kritik açıklar kapanır. |
| Performans ve kurtarma | Müşteri onaylı trafik ve eşzamanlı checkout/editör/AI senaryosu, p95/hata hedefleri D01 kapasite kararıyla ölçülür; gözlemlenebilir alarmlar, backup, restore, RPO/RTO ve rollback provası kayıtlıdır. |
| Yasal yükümlülük (D11) | Her kanalda sözleşme onayı sürümüyle siparişte; İYS izni olmayan kullanıcıya ticari ileti yok; ETBİS kaydı ve e-Fatura/e-Arşiv akışı gerçek test belgesiyle doğrulanmış. |
| İçerik ve erişim | Responsive web, SEO canonical/sitemap, analitik rıza, ekran okuyucu/klavye/kontrast, kurumsal/yasal metinler ve mobil mağaza veri açıklamaları D10'a uygun. |

**Ayrım:** Sözleşme fixture testleri `MOCK`, erişimli sağlayıcı testleri `SANDBOX`, canlı smoke `LIVE` olarak kaydedilir. Bir sağlayıcı, mağaza hesabı veya gerçek mobil cihaz yoksa ilgili satır `Bloke`, sahibi ve etkilediği kabul Faz00'dadır. Gerçek kredi kartı, müşteri verisi veya üretim API anahtarı test loglarına alınmaz.

## 5. Dağıtım, geri alma ve devralma sırası

1. **Hazırlık:** D01–D10 gereken kararların gerçek sahibi/kanıtı, fazların uygulama ve rol kapıları, iş sahibi UAT, mağaza erişimleri, bakım aralığı/iletişimi, üretim yedeği, migration ileri/geri stratejisi ve sürüm etiketleri Faz00'da. Dış sistem mutabakatı ve kuyruk derinliği ölçülür.
2. **Staging provası:** Üretime benzeyen ortamda restore kopyası veya güvenli test verisiyle aynı artefaktları, migration'ı, smoke ve geri alma prosedürünü çalıştır; ödeme, stok, AI ücret, dış sipariş ve faturanın replay güvenliğini kanıtla. Veritabanı geri dönüşü mümkün değilse ileri düzeltme ve devre dışı bırakma yöntemi ADR ve PM kaydına yazılır.
3. **Üretim:** Sırlar yöneticiden okunur; API/worker/web sırayla sağlık denetimli açılır; eski/yeni sözleşme uyumu kontrol edilir, kuyruk kademeli çalışır. Sipariş, ödeme, baskı, AI, entegrasyon ve push smoke testlerini maskeli işlem referansıyla kaydet. Başarısızlıkta müşteri verisini silmeden giriş trafiğini/worker'ı durdur, sağlayıcı işlem durumunu sorgula, onaylı geri alma/ileri düzeltme uygula.
4. **Mobil mağaza:** İmzalı paket ve yasal varlıklarla iOS/Android başvurularını ayrı izle. Onay/reddin tarihi, build ve mağaza bağlantısını Faz00'a yaz; reddi düzeltip yeniden gönder. Uygulama eski sürümünün API ile çalışma penceresi ve zorunlu güncelleme kararı belgelenir. Proje tam kabulü her iki mağaza yayını ve smoke doğrulamasına bağlıdır.
5. **Devir:** Katalog, fiyat/stok, ödeme/iade, teklif, baskı, AI ayarı, Mikro/pazaryeri hata düzeltme, yedek/restore ve müşteri destek yolları için adım adım rehber ve eğitim kaydı verilir; erişim en az yetkiyle sahiplerine aktarılır.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~22 % · kalan ~78 % · Statü: Devam (yalnız mobil geliştirme)**

**16.10 güncellemesi (kod/commit incelemesi):** Mobilde fotoğraf yerleşiminin kaydetme/sepet boyunca korunması, ana sayfa ürün boyutu ve Türkçe Material bileşenleri iyileştirildi (`8d99783`, `fc706b4`, `1b5cde5`, `f4adc49`). HTTP IIS hazırlığı DEPLOY-011 ile kayıtlı; uzak uygulama/smoke, iOS, UAT ve mağaza kabulü kanıtlanmadı. Ayrıntılı kayıt: [faz denetimi](../docs/tasks/phase-audit-2026-10-16.md). Yeni uygulama test koşusu yapılmadı; önceki testler tarihsel kanıttır.

| ID | Durum | Kanıt / eksik |
|---|---|---|
| 11.01 | Kısmi | DES-MOB-01; platform bazlı ekran paketi ve handoff kabulü yok |
| 11.02 | Kısmi | Android emülatör; giriş/çıkış/refresh; iOS kurulum ve otomatik dağıtım yok |
| 11.03 | Kısmi | Katalog, favori, profil/adres, karşılaştırma, duyurular (Android); kampanya yok |
| 11.04 | Kısmi | Mobil editör, yükleme, onaylı yüzey (`b1573d0`); D04 karşılaştırması yok |
| 11.05 | Kısmi | Sepet, ödemesiz sipariş, iptal/iade, teklif; ödeme yok (D03/D05) |
| 11.06 | Kısmi | XINOBI U ve Nobi mobilde; push (Firebase) ve deep link yok |
| 11.07–11.11 | Yok | UAT, güvenlik/performans, yayın, GO/NO-GO, mağaza |
| 11.12–11.16 | Yok | Eğitim, teknik doküman (yalnız runbook’lar var), cutover, güvenlik/yük testi, bakım (D14) |

Ekran matrisi (§2): Android sütununda üyelik, katalog/favori, kişiselleştirme, sepet/sipariş, teklif ve AI için emülatör kanıtı var (TST-095–107); iOS sütunu tamamen `Bekliyor`.

## 6. Kesintiden devam, kanıt ve zorunlu onay

Faz00'dan son doğrulanmış commit, iOS/Android build numarası ve dağıtım kanalı, API/DB migration, yedek kimliği/geri yükleme provası, her mağaza inceleme durumu, erişimli sağlayıcıların son başarılı olay/cursor'u, bekleyen outbox ve açık müşteri kararı okunur. `git status` ve servis sağlıklarını kontrol et. Son canlı ödeme/sipariş/AI/Mikro/pazaryeri işlemini tekrar etmeden önce iç ve dış işlem ID/durumunu uzlaştır. Başarısız yayın sürümünü yeniden yollamadan önce ret gerekçesi ve değişikliği Faz00'a yaz. Bir sonraki güvenli tek adımı, gerçek komut, beklenen/elde edilen sonucu kaydet.

**Kanıt paketi:** çift platform gerçek cihaz video/ekran ve build; Creative handoff; web/panel/API OpenAPI ve CI; tüm UAT satırları; erişimli provider testleri; güvenlik/perf/restore raporu; SEO/analytics ve rıza; staging provası ile rollback; live smoke; App Store ve Play Store yayın kayıtları; eğitim/iş sahibi UAT; Faz00 durum/karar ve tutanakları. Gerçek iş sahibi onayı PM incelemesine girdi sağlar; PM yerine geçmez.

| Rol | Faz11 uygulama incelemesi; gerçek kişi/tarih/kanıt Faz00'a | Karar |
|---|---|---|
| İş Analisti | Müşteri kapsamı, iki platform matrisi, UAT ve eğitim | BEKLİYOR |
| Sr. Creative Designer | iOS/Android ürün ve editör tasarım uyumu, handoff | BEKLİYOR |
| Sr. Frontend Developer | UI/UX, mobil erişilebilirlik, web-mobil ekran eşliği | BEKLİYOR |
| Sr. Backend Developer | API, ödeme ve entegrasyon/AI güvenli tutarlılık | BEKLİYOR |
| DB Admin | Migration, mutabakat, yedek-restore, veri erişimi | BEKLİYOR |
| Sr. Full Stack Developer | İki cihaz, üç kanal, staging-canlı smoke/rollback | BEKLİYOR |
| Web Designer (ek zorunlu rol) | Analiz2 hiyerarşisinin iOS/Android ve canlı web'e uygulanışı | BEKLİYOR |
| CTO Advisor (ek zorunlu rol) | Barındırma, güvenlik/yük testi sonucu, işletim maliyeti ve bakım devri | BEKLİYOR |
| **Proje Yöneticisi — zorunlu nihai kapı** | **Altı onay, müşteri UAT, tüm D kararları, canlı/mağaza kanıtı ve Faz00; eksikte RED ve düzeltme** | **BEKLİYOR** |

Plan belgesi incelemesi uygulama veya müşteri onayı sayılmaz. Faz11 ve proje ancak gerçek kanıt ve **ayrı PM kararı** ile `Tamamlandı` durumuna geçer.
