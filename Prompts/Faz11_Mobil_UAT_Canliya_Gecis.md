# Faz11 — iOS/Android, çapraz kanal kabulü ve canlıya geçiş

## 03.11.2026 - Sürat gerçek takip erişimi ve bağımsız ön kontrol

.NET istemcisiyle test takip metodu HTTP 200 / `Sipariş bulunamadı.` / boş Gonderiler yanıtladı. Önceki istemcinin 403 sonucu genel IP/hesap blokajı sayılmaz. Bu dar yanıt AwaitingAcceptance olarak düzeltildi; diğer hatalar ayrılır ve boş sonuç tekrar gönderime izin vermez. [Sunucu ön kontrol komutu/paket yönergesi](../Entegrasyonlar/01-Surat-Kargo/ON-KONTROL.md), [sansürlenmiş kanıt](../Entegrasyonlar/01-Surat-Kargo/erisim-on-kontrol-2026-11-03.json). [TST-246](../test/2026-11-03/TST-246-surat-preflight-access.md): 51 odaklı PASS; tam API 565 PASS / 29 SKIP / 0 FAIL. Gerçek gönderi, asıl IIS egress/erişim, etiket/SQL/cihaz ve canlı uygunluk kabulleri açık.

## 03.11.2026 - Sürat sipariş ekranı, etiket ve takip teslimi

KRG-SUR-01: admin sipariş/entegrasyon ekranı, test Code128 etiketi, kanıtlı uzlaştırma ve kontrollü aynı-ref denemesi, lease/backoff takip işi, müşteri sahiplik kontrollü DTO ve web/Flutter gösterimi eklendi. Ticari sipariş statüsü/ödeme otomatik değiştirilmez. [Kurulum ve kabul kapıları](../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md). Salt okunur gerçek test erişimi HTTP 403; nedeni sağlayıcı teyidi bekliyor. [TST-245](../test/2026-11-03/TST-245-surat-shipment-delivery.md): 38 odaklı; tam API 552 PASS / 29 SKIP / 0 FAIL; admin 20/20, Flutter 283, web 2/2. Gerçek gönderi/Production açılışı/deploy yok. COD/pazaryeri/tarife ve gerçek SQL/cihaz/barkod kabulleri ayrı açık; TIC-08 tamamlandı sayılmaz.

## 03.11.2026 - Sürat Kargo entegrasyon hazırlığı (yalnız plan)

KRG-SUR-01 kabul planı: fixture testleri, sandbox, fiziksel Code128 okuyucu/şube kabulü, web ve Android/iOS salt okunur takip, kontrollü canlı pilot ve operasyon kabulü ayrı kaydedilecek. Hiçbiri bu plan çalışmasında çalıştırılmadı; deploy/APK yok. [Task, alan eşleştirmesi ve prompt](../docs/tasks/surat-kargo-integration-plan-2026-11-03.md). [PDF](../output/pdf/xinobi-surat-kargo-entegrasyon-task-ve-uygulama-plani-2026-11-03.pdf).


## 03.11.2026 - Sipariş tasarım detayı kapsam kararı (yalnız plan)

Kullanıcı üretime hazırlama/gönderme bölümü istemiyor. Teslim: sipariş satırındaki kayıtlı editör yerleşimi, ayrı ham desen, maskelemede kullanılan ürün kaynak görseli ve indirilebilir giydirilmiş dijital önizleme. [9 alt task ve kabul koşulları](../docs/tasks/order-design-detail-scope-2026-11-03.md). Uygulama başlamadı; eski planlarda çelişen fiziksel üretim şartları bu karar için geçerli değil. Tarihsel kod/test kayıtları silinmedi.

**Bu fazın işi:** SIP-TAS-09 ve UAT-04/08: web/mobilden oluşan siparişlerde aynı dosya/sürümün admin teslimi, kullanıcı kabulü ve inceleme/indirme eğitimi. Yeni mobil üretim modülü yok.

**03.11 SIP-TAS-09 son test/kabul kaydı:** SIP-TAS-01…08 kaynak ve test kayıtlarından doğrulandı. Kimlik, yerleşim ve üç dosyanın eşliği; düzenleme, silme, katalog/maske değişimi ve dosya deposunun yeniden başlatılmasından sonra da korunuyor. 320/390/768/1440 px'te normal ve %200 metin, axe (kritik/ciddi 0), klavye, odak ve duyuru kontrolleri geçti; üretim eylemi yok. Admin 18 test dosyası + 4 tools senaryosu, API 514 test (29 atlandı) PASS; web e2e 17/18 (1 bilinen kararsız test). Teknik kabul tamam; izole SQL, canlı IIS, ekran okuyucu/cihaz ve iş sahibi kabulü açık. [Kabul matrisi](../design/order-design-acceptance-2026-11-03.md), [TST-239](../test/2026-11-03/TST-239-sip-tas-09-order-design-acceptance.md). UAT-04/08 kullanıcı kabulü, canlı ve mobil kaynaklı sipariş kontrolü açık.


**03.11 Flutter–web görsel/durum uygulaması:** Flutter ekranları web istek durumlarıyla karşılaştırıldı: favoriler hesap API'sine taşındı, hata/tekrar dene/teyitli başarı/taslak/işlem kilidi eklendi, 192 hücrelik widget matrisi (32 rota × 3 genişlik × 1x/2x) ve Android 14 doğrusal olmayan ölçek testi geçti; 280/280 Flutter testi. Android emülatörde oturum kapalı akışlar ve OS %200 yazı denendi; iOS Bloke (Xcode yok). [Ekran/kusur matrisi](../design/flutter-consistency-audit-2026-11-03.md), [TST-196](../test/2026-11-03/TST-196-flutter-web-consistency.md). Gerçek telefon, oturum açık cihaz akışı, TalkBack/VoiceOver ve handoff kabulü açık; faz onayı/yüzde değiştirilmedi.

## Güncel durum ve tüm açık işler - 30.10.2026

**Durum:** Devam - Flutter eşliği düzeltildi; kurulum, cihaz, push, mağaza ve final UAT açık. Kaynak kesiti `main / de99958`; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

**Yapılan son işler:** de99958 Flutter önizleme satır düzeni ve Temsilidir: 320/390/700px, 1x/2x metin, CTA testi; 79/79 Flutter ve analiz temiz. Yeni APK veya telefon kurulumu yok. Son kayıtlı release xinobi-799e1af (DEPLOY-016); güncel HEAD için IIS kurulumu kanıtlanmadı.

**Müşteriden / iş sahibinden beklenenler:** Firebase/APNs, mağaza/signing hesap sahipleri, hedef cihazlar; platform/işletim/UAT sahipleri, yayın takvimi, SLA/devir ve GO/NO-GO onayları.

### Teknik ekipte ve kabulde kalan ana görevler

Aşağıdaki tablo bu fazın ana sorumluluğundaki tüm kapanış tasklarını içerir; tamamlanan teknik kapsamlar da kaybolmaması için listede korunur. Hedef iş, mevcut temel, kapanış kanıtı, bağımlılık ve önerilen sorumlu task bağlantısındadır.

| Task / konu | Durum | Yapılmadı / kapanış için kalan |
|---|---|---|
| [MOB-01](../docs/tasks/project-closure-2026-10-30.md#mob-01) - Üretim ortamı ve HTTPS yapılandırmasını hazırla | Yapılmadı - kapanış açık | Release HTTPS/origin matrisi ve localhost/debug istisnalarının kapatılması üretim ortamında doğrulanmalı. |
| [MOB-02](../docs/tasks/project-closure-2026-10-30.md#mob-02) - Native ödeme ve 3DS dönüşünü tamamla | Yapılmadı - kapanış açık | Gerçek mobil ödeme/3DS, dış tarayıcı dönüşü, uygulama yeniden açılışı ve sunucudan ödeme doğrulama eksik. |
| [MOB-03](../docs/tasks/project-closure-2026-10-30.md#mob-03) - Firebase SDK ve cihaz token kaydını bağla | Yapılmadı - kapanış açık | Firebase SDK/APNs, izin isteme, token kayıt/yenileme ve hesap çıkışında cihaz bağını kaldırma mobilde tamamlanmadı. |
| [MOB-04](../docs/tasks/project-closure-2026-10-30.md#mob-04) - Push teslimini ve derin bağlantıyı tamamla | Yapılmadı - kapanış açık | Gerçek push teslimi ve ön/arka plan/kapalı uygulama deep link kabulü Android ve iOS için yapılmadı. |
| [MOB-05](../docs/tasks/project-closure-2026-10-30.md#mob-05) - Native-WebView editör köprüsünü cihazda kabul et | Yapılmadı - kapanış açık | Her iki platformda gerçek cihaz oturum/yenileme/dosya/geri tuşu ve kesinti matrisiyle güncel kabul açık. |
| [MOB-06](../docs/tasks/project-closure-2026-10-30.md#mob-06) - Mobil katalog ve hesap eşliğini kabul et | Yapılmadı - kapanış açık | Web ile aynı gerçek hesap/favori/teklif ve ticari akış eşliği Android/iOS cihazlarında ayrıca kabul edilmeli. |
| [MOB-07](../docs/tasks/project-closure-2026-10-30.md#mob-07) - Cihaz performansı ve kesinti deneyimini düzelt | Yapılmadı - kapanış açık | Hedef düşük bellekli cihaz, yavaş ağ/uçak modu, büyük görsel, izin/döndürme ve uygulama öldürme matrisi eksik. |
| [MOB-08](../docs/tasks/project-closure-2026-10-30.md#mob-08) - İmzalı Android ve iOS dağıtımını hazırla | Yapılmadı - kapanış açık | İmzalı üretim AAB, iOS archive, TestFlight/kapalı test ve güvenli signing kabulü tamamlanmadı; yeni APK üretilmedi. Son ana sayfa düzeltmesinin telefona kurulumu da bekliyor (MOB-HOME-02). |
| [OPS-05](../docs/tasks/project-closure-2026-10-30.md#ops-05) - Sürüm uyumu ve son release kurulumunu doğrula | Yapılmadı - kapanış açık | Son kodun yeni release paketlemesi/IIS kurulumu ve deployment.json + mobil bridge sürüm eşliği doğrulanmadı. |
| [OPS-06](../docs/tasks/project-closure-2026-10-30.md#ops-06) - Deploy ve rollback provasını tamamla | Yapılmadı - kapanış açık | Güncel staging sürümünde gerçek deploy/rollback/readiness provasıyla uçtan uca kabul eksik. |
| [OPS-08](../docs/tasks/project-closure-2026-10-30.md#ops-08) - İşletim runbook ve erişim devrini tamamla | Yapılmadı - kapanış açık | Runtime/migration hesap ayrımı, sır yenileme, olay/ikame/SLA/maliyet ve yetkili erişim devri tamamlanmadı. |
| [QA-05](../docs/tasks/project-closure-2026-10-30.md#qa-05) - Android ve iOS cihaz regresyonunu otomatikleştir | Yapılmadı - kapanış açık | Android+iOS fiziksel cihaz/simülatörde ödeme/push/deep link ve köprü kabulünün otomasyon kapsamı açık. |
| [QA-06](../docs/tasks/project-closure-2026-10-30.md#qa-06) - Sağlayıcı sandbox uçtan uca paketini çalıştır | Yapılmadı - kapanış açık | Ödeme/kargo/e-posta/SMS/push/AI/Mikro/üç kanalın izinli sandbox uçtan uca ve mutabakat paketi kapanmadı. |
| [UAT-01](../docs/tasks/project-closure-2026-10-30.md#uat-01) - Takvim, sorumlu ve kapasiteyi kesinleştir | Yapılmadı - kapanış açık | Kişi bazlı kapasite/tahmin/hedef tarih, dış bekleme süreleri ve imzalı sprint/milestone planı yok. |
| [UAT-02](../docs/tasks/project-closure-2026-10-30.md#uat-02) - Web ve admin iş sahibi UAT'sini tamamla | Yapılmadı - kapanış açık | Gerçek ödeme-kargo-iade ve panel finans/rol/destek akışlarının ürün/operasyon sahibi imzalı UAT’si eksik. |
| [UAT-03](../docs/tasks/project-closure-2026-10-30.md#uat-03) - Mobil iş sahibi UAT'sini tamamla | Yapılmadı - kapanış açık | Her iki gerçek platformda ödeme/editör/push/deep link/erişilebilirlik için iş sahibi imzalı UAT yok. |
| [UAT-04](../docs/tasks/project-closure-2026-10-30.md#uat-04) - Sipariş tasarım dosyaları ve entegrasyon operasyonunu kabul ettir | Yapılmadı - kapanış açık | Sipariş tasarım dosyası/yerleşim ve entegrasyon/muhasebe/kanal kabulleri açık; üretime hazırlık ve fiziksel numune bu yazılım tesliminde yok. |
| [UAT-05](../docs/tasks/project-closure-2026-10-30.md#uat-05) - GO/NO-GO ve veri geçiş planını imzala | Yapılmadı - kapanış açık | Final katalog, açık kusurlar, güvenlik/yük/restore, sağlayıcılar ve rollback eşikleriyle imzalı GO/NO-GO eksik. |
| [UAT-06](../docs/tasks/project-closure-2026-10-30.md#uat-06) - Mağaza başvurularını ve yayınını tamamla | Yapılmadı - kapanış açık | Google Play/App Store hesap-beyan-inceleme ve onaylı erişilebilir mağaza sürümleri tamamlanmadı. |
| [UAT-07](../docs/tasks/project-closure-2026-10-30.md#uat-07) - Canlı cutover ve yayın sonrası smoke yap | Yapılmadı - kapanış açık | Güncel sürüm için onaylı canlı cutover, deployment.json/health smoke ve yayın sonrası izleme kabulü eksik. |
| [UAT-08](../docs/tasks/project-closure-2026-10-30.md#uat-08) - Eğitim, bakım ve nihai teslimi kapat | Yapılmadı - kapanış açık | Panel/sipariş dosyası inceleme-indirme/entegrasyon eğitimi, erişim devri, bakım/SLA/maliyet/garanti ve nihai imzalı teslim kapanmadı. |

### Açık alt işler ve özel kabul kayıtları

| Alt iş | Ana task | Durum | Kalan / kanıt |
|---|---|---|---|
| MOB-HOME-01 | MOB-06, QA-03 | Yapıldı - teknik | de99958 web düzenine native Flutter eşlik, ürün-kart örtüşmesi giderildi; 7 odaklı/79 tam test. |
| MOB-PARITY-01 | MOB-06, QA-03 | Kısmen yapıldı | 03.11 Flutter–web durum/tasarım eşliği: hesap favorisi, M01–M11 düzeltmeleri, 280/280 test; Android emülatör oturum kapalı + OS %200; iOS Bloke (Xcode yok), oturum açık cihaz/telefon kabulü açık. [Matris](../design/flutter-consistency-audit-2026-11-03.md). |
| MOB-HOME-02 | MOB-08, QA-05, OPS-05 | Açık | Yetkili paket/dağıtım adımında güncel uygulamayı telefona kur ve görsel kabulü kaydet. Bu dokümantasyon oturumunda APK/kurulum yapılmaz. |

**Çapraz bağımlılıklar (tekrar sayılmaz):** [WEB-07](../docs/tasks/project-closure-2026-10-30.md#web-07), [KIS-01](../docs/tasks/project-closure-2026-10-30.md#kis-01), [KIS-03](../docs/tasks/project-closure-2026-10-30.md#kis-03), [TIC-04](../docs/tasks/project-closure-2026-10-30.md#tic-04), [TIC-05](../docs/tasks/project-closure-2026-10-30.md#tic-05), [SEC-01](../docs/tasks/project-closure-2026-10-30.md#sec-01), [OPS-01](../docs/tasks/project-closure-2026-10-30.md#ops-01), [OPS-02](../docs/tasks/project-closure-2026-10-30.md#ops-02), [OPS-04](../docs/tasks/project-closure-2026-10-30.md#ops-04), [QA-03](../docs/tasks/project-closure-2026-10-30.md#qa-03), [QA-04](../docs/tasks/project-closure-2026-10-30.md#qa-04).

**Kapanış kuralı:** Teknik ekip geliştirme/test kanıtını, müşteri/operasyon gerekli girdiyi sağlar; gerçek SQL, sağlayıcı, fiziksel cihaz, üretim numunesi ve resmi UAT ayrı kapılardır. Bu belge güncellemesinde uygulama testi tekrar koşulmadı. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

---


**27.10 son üretim tercihi:** Ek yerel denetim ve bağlı kurulum kullanıcı isteğiyle kaldırıldı; tek aday üretimi geri geldi. Prompt v5 her isteme açık yazı/imza/logo/ürün/eşya yasakları ekler, rafine çizim kuralları korunur. [Test kaydı](../test/2026-10-27/TST-art-direction-v5.md).

## Tarihsel uygulama durumu — 27.10.2026

**Durum:** Devam — birleşik yayın var; UAT/mağaza kabulü açık. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Bu kayıt 27.10 kesitidir; güncel 30.10 durumu yukarıdadır. 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| 11.01–11.06 mobil eşlik | Uygulandı; kabul kısmi | 62d4daf, b5518a4, 47d8016, 6f2fc13, 72808e9: ortak web editörü ve native hesap/sepet köprüsü. Bearer/refresh token WebView JS/URL/storage içine verilmez; köprü origin ve izinli yollarla sınırlı. 95ad560 APK yapılandırmasında web preview origin; 902066f boş editör ekranı ve büyütülebilir sipariş ürün önizlemesi düzeltmesi. |
| 11.09–11.11 dağıtım altyapısı | Kısmi | 4333eda birleşik web/admin/API indirilebilir GitHub Release; SHA256, yedek, sağlık kontrolü, geri dönüş ve deployment.json. 94c9e26 localhost readiness, IIS bekleme/yeniden deneme ve kurtarma. 096b267 dış ayarlar korunur; deployment doğrudan veri migration çalıştırmaz. |
| Gerçek sunucu kanıtı | Kullanıcı bildirimi | 25.10 görüşmesinde xinobi-4333eda ve xinobi-902066f için Deployment successful çıktıları alındı; 4333eda sonrası sayfalar kullanıcı tarafından kontrol edildi. Önceki rollback başarısızlığı/manüel kurtarma tarihi korunur. Bu, tüm modüllerin UAT onayı değildir. |
| En son yayımlanan sürüm | IIS kurulumu doğrulanmadı | DEPLOY-013 xinobi-d54c13c, DEPLOY-014 xinobi-e2131e7 GitHub üzerinde yayımlandı. Son kaynak e2131e7; üç asset ve build kayıtlı. Yeni IIS kurulumu/sonrası smoke kaydı yok. APK bu son web release için üretilmedi; release yayını fiziksel telefon güncellemesi değildir. |
| 11.07–11.16 kalan işler | Açık / bloke | Gerçek Android/iOS cihaz regresyonu, push/deep link, mağaza yayını, ödeme, güvenlik/yük testi, restore provası, eğitim/devir, cutover ve D09/D10/D14 kabulü bekliyor. Runbook ve paketleme varlığı bu işlerin tamamını kapatmaz. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


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


## 06.11.2026 — Kişiselleştirmede tek kaynak fotoğraf/maske planı

Kullanıcı kararı: desenli ürünler için çoklu renk ve renkler arası hizalama gerekmiyor. Maske kaynağı indirme, fotoğraf üretim promptu ve kaynağa bağlı maskeleme promptu korunur; maskenin kendi fotoğrafıyla örtüşmesi ve sipariş yerleşim/dosya güvenliği sürer. [12 tasklık değişiklik planı](../docs/tasks/personalization-single-source-tasks-2026-11-06.md); bu fazla ilişkili tasklar: **KIS-TEK-08,12**. Hepsi açık; yalnız plan hazırlandı, uygulama/veri geçişi/deploy yapılmadı. Normal ürün renkleri ve tarihsel siparişler korunacak.
