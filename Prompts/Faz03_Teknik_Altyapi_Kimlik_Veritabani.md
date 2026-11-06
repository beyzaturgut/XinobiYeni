# Faz03 — Teknik temel, kimlik ve veritabanı iskeleti

## 04.11.2026 - Sürat uçtan uca test (TST-249)

Gerçek API/adaptör/depo zinciri bellek içi sağlayıcıyla ve admin/müşteri ekranları sahte API ile test edildi. Formun hata sonrası kaybolması ve boş takip belgesinin başarı sayılması düzeltildi; güvenli hata neden sınıfları kalıcı kayda eklendi. Nihai API 589 geçti / 29 atlandı / 0 başarısız; API Release 0 uyarı/hata, admin lint/build ve 8 Chrome fixture senaryosu, web üretim derlemesi ve 2 takip testi, bağımsız yazılımsal Code128 okuma geçti. [Senaryo bazlı sonuç ve bağımlılıklar](../test/2026-11-04/TST-249-surat-end-to-end.md). Onaylı test alıcı/paket verisi ve güvenli yerel test hesabı yok: gerçek gönderi/takip zinciri çalıştırılamadı. Yeni gerçek ön kontrol yalnız kimliksiz edge 302; Windows/IIS sonucu değildir. Production koruması korunuyor; gerçek SQL çoklu süreç ve fiziksel barkod/şube kabulü açık. Deploy/APK yok; TIC-08 kısmen yapıldı.

## 04.11.2026 - Sürat iptal yarışı ve takip geçmişi

KRG-SUR-01 / TIC-08: admin gönderiminden önce atomik sipariş rezervasyonu; müşteri/panel iptali ve manuel sevk çakışmasının engellenmesi; aynı parça için eski sağlayıcı yanıtlarının kalıcı arşivi eklendi. Sipariş/ödeme statüsü değiştirilmez. Gerçek tahsilat/operasyon verisi olmayan demo modelinde Production oluşturma kapalı kalır. [TST-248](../test/2026-11-04/TST-248-surat-hardening.md): nihai API 572 PASS / 29 SKIP / 0 FAIL, Release 0 uyarı/hata; admin build/lint (4 mevcut uyarı) ve altı Chrome senaryosu PASS. Rezervasyon otomatik bırakılmaz; eski denemelere rezervasyon uydurulmaz. Sağlayıcı/etiket/fiziksel kabul, IIS erişimi ve gerçek SQL çoklu süreç kabulü açık. Güncel açık matrisi ve sonraki uçtan uca senaryolar raporda; gerçek sağlayıcı çağrısı, deploy ve APK yok. Entegrasyon tamamen tamamlandı sayılmaz.

## 03.11.2026 - Sürat gerçek takip erişimi ve bağımsız ön kontrol

.NET istemcisiyle test takip metodu HTTP 200 / `Sipariş bulunamadı.` / boş Gonderiler yanıtladı. Önceki istemcinin 403 sonucu genel IP/hesap blokajı sayılmaz. Bu dar yanıt AwaitingAcceptance olarak düzeltildi; diğer hatalar ayrılır ve boş sonuç tekrar gönderime izin vermez. [Sunucu ön kontrol komutu/paket yönergesi](../Entegrasyonlar/01-Surat-Kargo/ON-KONTROL.md), [sansürlenmiş kanıt](../Entegrasyonlar/01-Surat-Kargo/erisim-on-kontrol-2026-11-03.json). [TST-246](../test/2026-11-03/TST-246-surat-preflight-access.md): 51 odaklı PASS; tam API 565 PASS / 29 SKIP / 0 FAIL. Gerçek gönderi, asıl IIS egress/erişim, etiket/SQL/cihaz ve canlı uygunluk kabulleri açık.

## 03.11.2026 - Sürat sipariş ekranı, etiket ve takip teslimi

KRG-SUR-01: admin sipariş/entegrasyon ekranı, test Code128 etiketi, kanıtlı uzlaştırma ve kontrollü aynı-ref denemesi, lease/backoff takip işi, müşteri sahiplik kontrollü DTO ve web/Flutter gösterimi eklendi. Ticari sipariş statüsü/ödeme otomatik değiştirilmez. [Kurulum ve kabul kapıları](../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md). Salt okunur gerçek test erişimi HTTP 403; nedeni sağlayıcı teyidi bekliyor. [TST-245](../test/2026-11-03/TST-245-surat-shipment-delivery.md): 38 odaklı; tam API 552 PASS / 29 SKIP / 0 FAIL; admin 20/20, Flutter 283, web 2/2. Gerçek gönderi/Production açılışı/deploy yok. COD/pazaryeri/tarife ve gerçek SQL/cihaz/barkod kabulleri ayrı açık; TIC-08 tamamlandı sayılmaz.

## 03.11.2026 - Sürat kalıcı gönderi ve admin API

Ortak FeatureDocuments transaction/kilidiyle kalıcı referans, attempt, paket/adres kopyası ve sonuç kaydı; çift istek/yeniden başlatmada write tekrarını engelleme eklendi. GET/POST admin orders/{id}/surat-shipment, sunucu orders.read/write kontrolüyle açık. Canlı mod uygunluk doğrulanmadığından engelli; sipariş statüsü değişmez. Admin ekranı, uzlaştırma, etiket ve polling açık. [TST-244](../test/2026-11-03/TST-244-surat-persistent-admin-api.md): 26 odaklı PASS; tam API 540 PASS / 29 SKIP / 0 FAIL; TS/Dart PASS. [Kurulum/sınırlar](../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md).

## 03.11.2026 - Sürat Kargo ilk sunucu adaptörü

KRG-SUR-01 başladı: kapalı varsayılan/test-canlı ayrımı, doğrudan taşıyıcı JSON istemcisi, katı kabul yanıtı, write retry olmadan belirsizlik, takip belge/ID/durum ayrımı eklendi. [Kurulum ve sınırlar](../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md). Kalıcı idempotency, admin sipariş bağlantısı, Code128 etiket ve takip işi henüz yok; entegrasyon tamamlandı sayılmaz. Gerçek çağrı/secret/deploy yok. [TST-243](../test/2026-11-03/TST-243-surat-server-adapter.md): 17/17 odaklı; tam API 531 PASS / 29 SKIP / 0 FAIL.

## 03.11.2026 - Sürat Kargo entegrasyon hazırlığı (yalnız plan)

KRG-SUR-01.2/03/04/06 planı: sunucu secret deposu, test/canlı ayrımı, egress IP whitelist, kalıcı gönderi/deneme/parça/hareket modeli, idempotency ve takip işçisi. Henüz uygulanmadı; query parola redaksiyonu zorunlu. [Task, alan eşleştirmesi ve prompt](../docs/tasks/surat-kargo-integration-plan-2026-11-03.md). [PDF](../output/pdf/xinobi-surat-kargo-entegrasyon-task-ve-uygulama-plani-2026-11-03.pdf).


## 03.11.2026 - Sipariş tasarım detayı kapsam kararı (yalnız plan)

Kullanıcı üretime hazırlama/gönderme bölümü istemiyor. Teslim: sipariş satırındaki kayıtlı editör yerleşimi, ayrı ham desen, maskelemede kullanılan ürün kaynak görseli ve indirilebilir giydirilmiş dijital önizleme. [9 alt task ve kabul koşulları](../docs/tasks/order-design-detail-scope-2026-11-03.md). Uygulama başlamadı; eski planlarda çelişen fiziksel üretim şartları bu karar için geçerli değil. Tarihsel kod/test kayıtları silinmedi.

**03.11 SIP-TAS-07 uygulaması:** Desen, ürün kaynak görseli ve kompozisyon uçları ile müşteri, panel ve açık medya yolları uçtan uca denetlendi. Her istekte personel+MFA+`orders.read` kontrolü yapılıyor; dosya saklı sipariş/satır referansından çözülüyor, hata gövdeleri iç bilgi sızdırmıyor. İzole API matrisi PASS: anonim, müşteri, başka müşteri, izinsiz, MFA'sız ve süresi dolmuş personel; başka sipariş/satır; 404/503. Admin indirmesi: `aria-disabled` kilidi odak koruyarak çalışıyor, hata açıklamasına odak taşınıyor, 503 ve bağlantı kesintisinde tekrar dene var; başarı mesajı yalnız “tarayıcıya verildi” diyor (21 Chrome senaryosu PASS). API 511 test PASS (29 atlandı). İndirmelerin audit kaydı mevcut yaklaşımda yok; ayrı karar açık. [TST-231](../test/2026-11-03/TST-231-sip-tas-07-file-access.md). SEC-07'nin genel upload, süreli erişim ve tarama işleri açık.

**Bu fazın işi:** SIP-TAS-02/07/09: sipariş/satır/sürüm dosya bağı, sunucu yetkisi ve izole kalıcılık/erişim testleri. Genel finans/kargo yetkileri korunur.


## Güncel durum ve tüm açık işler - 30.10.2026

**Durum:** Devam - temel regresyon kayıtlı; SQL/güvenlik/posta/işletim kabulü açık. Kaynak kesiti `main / de99958`; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

**Yapılan son işler:** 42bee88: profil sürüm/CAS/yetki/sipariş snapshot testleri; API 496 başarılı, 29 opt-in test atlandı. f4f9046: canlı /admin/ giriş formu ve girişsiz oturum/katalog/tasarım 401 doğrulandı; yeni auth kodu eklenmedi, gerçek parola/MFA/e-posta teslimi denenmedi.

**Müşteriden / iş sahibinden beklenenler:** İzinli gerçek posta test alıcısı ve SMTP/Resend yapılandırması; domain/sertifika ve DBA restore yetkisi; hukuk onaylı saklama/izin metinleri. Parola/anahtar rapora yazılmaz.

### Teknik ekipte ve kabulde kalan ana görevler

Aşağıdaki tablo bu fazın ana sorumluluğundaki tüm kapanış tasklarını içerir; tamamlanan teknik kapsamlar da kaybolmaması için listede korunur. Hedef iş, mevcut temel, kapanış kanıtı, bağımlılık ve önerilen sorumlu task bağlantısındadır.

| Task / konu | Durum | Yapılmadı / kapanış için kalan |
|---|---|---|
| [ADM-01](../docs/tasks/project-closure-2026-10-30.md#adm-01) - Kalıcı rol ve yetki yönetimini tamamla | Yapılmadı - kapanış açık | Kalıcı rol CRUD, atama/geri alma, son yönetici koruması ve bütün izin değişimlerinin audit kabulü eksik. |
| [ADM-06](../docs/tasks/project-closure-2026-10-30.md#adm-06) - Tüm kayıtlar için sunucu aramasını tamamla | Yapılmadı - kapanış açık | Teklif/tasarım/AI ve gerekli sipariş aramalarında tüm geçmişi kapsayan sunucu sorgusu tamamlanmadı. |
| [ADM-07](../docs/tasks/project-closure-2026-10-30.md#adm-07) - Bildirim ve hata işi operasyonunu bağla | Yapılmadı - kapanış açık | Gerçek teslim/red sağlayıcı kimlikleri, dead-letter, sınırlandırılmış retry ve operatör alarm kabulü açık. |
| [SEC-01](../docs/tasks/project-closure-2026-10-30.md#sec-01) - Gerçek SQL oturum ve admin MFA kabulü yap | Yapılmadı - kapanış açık | Güncel izole SQL + gerçek kod teslimli oturum/eşzamanlı refresh/yetki geri alımı kabul paketi açık. |
| [SEC-02](../docs/tasks/project-closure-2026-10-30.md#sec-02) - Sürümlü yasal onay ve ileti iznini kur | Yapılmadı - kapanış açık | Hukuk onaylı metin sürümü, ödeme onay kaydı, ileti izin/geri alma ve İYS bağlantısı tamamlanmadı. |
| [SEC-03](../docs/tasks/project-closure-2026-10-30.md#sec-03) - Saklama, dışa aktarma ve silmeyi uçtan uca tamamla | Yapılmadı - kapanış açık | AI konuşmaları, loglar, önizlemeler, dosyalar ve yedekler dahil politika tabanlı tam saklama/silme/dışa aktarma açık. |
| [SEC-04](../docs/tasks/project-closure-2026-10-30.md#sec-04) - Nesne ve rol yetkilerini tüm uçlarda tara | Yapılmadı - kapanış açık | Tüm müşteri/firma/admin/dosya/bridge uçları için eksiksiz farklı hesap/rol matrisi kapanmadı. |
| [SEC-05](../docs/tasks/project-closure-2026-10-30.md#sec-05) - Audit kapsamı ve transaction bağını doğrula | Yapılmadı - kapanış açık | Tüm fiyat/stok/rol/ayar/sipariş/teklif/iade/entegrasyon işlemlerinin güvenli farkı ve transaction bağı kabul edilmeli. |
| [SEC-06](../docs/tasks/project-closure-2026-10-30.md#sec-06) - Inbox, outbox ve hata kuyruğunu tamamla | Yapılmadı - kapanış açık | Genel atomik iş+olay outbox/inbox, lease/backoff, dead-letter ve worker mimari kararı eksik. |
| [SEC-07](../docs/tasks/project-closure-2026-10-30.md#sec-07) - Güvenli upload ve dosya erişim sözleşmesini tamamla | Yapılmadı - kapanış açık | Genel finalize ve zararlı içerik taraması; özel indirme/süreli erişim/sahipsiz dosya sözleşmesi tamamlanmadı. |
| [SEC-08](../docs/tasks/project-closure-2026-10-30.md#sec-08) - Güvenlik taraması ve bağımlılık incelemesini kapat | Yapılmadı - kapanış açık | Güncel staging’de sır/bağımlılık/SAST/DAST ve HTTPS/cookie/CORS/CSP/rate-limit bütünsel kabulü eksik. |
| [OPS-01](../docs/tasks/project-closure-2026-10-30.md#ops-01) - Alan adı, HTTPS ve ortam ayrımını kapat | Yapılmadı - kapanış açık | Domain/TLS, reverse proxy, origin/CORS, ortam ayrımı ve minimum runtime yetkileri son ortamda kabul edilmeli. |
| [OPS-02](../docs/tasks/project-closure-2026-10-30.md#ops-02) - SQL ve medya yedeğini geri yükleyerek doğrula | Yapılmadı - kapanış açık | SQL CHECKSUM/VERIFYONLY ve ayrı hedefe gerçek restore; DB-medya tutarlı geri dönüş provası açık. |
| [OPS-03](../docs/tasks/project-closure-2026-10-30.md#ops-03) - Dosya deposu ve kapasite işletimini tamamla | Yapılmadı - kapanış açık | İzin/kapasite/yedek/saklama işletim kabulü tamamlanmadı; R2/S3 yalnız onaylı ihtiyaçla ayrı planlanır. |
| [OPS-04](../docs/tasks/project-closure-2026-10-30.md#ops-04) - Gerçek bildirim kanallarını kabul et | Yapılmadı - kapanış açık | İzinli alıcılarda gerçek teslim/red/retry kanıtı ve kanal şablon kabulü tüm kanallar için kapanmadı. Yönetici davet/MFA/sıfırlama gerçek mail kabulü ADM-MAIL-01 altında açık. |
| [OPS-07](../docs/tasks/project-closure-2026-10-30.md#ops-07) - Log, alarm ve servis gözlemini tamamla | Yapılmadı - kapanış açık | API p95/hata, ödeme/webhook, kuyruk, maliyet, disk ve yedek için sahipli/eşikli gerçek alarm kabulü eksik. |
| [QA-01](../docs/tasks/project-closure-2026-10-30.md#qa-01) - Güncel HEAD için temel regresyonu çalıştır | Yapıldı - teknik | Temel teknik regresyon kapandı. 29 opt-in SQL/dış test atlandı; sağlayıcı, fiziksel numune ve resmi kabul bu taskın sonucu değildir. |
| [QA-02](../docs/tasks/project-closure-2026-10-30.md#qa-02) - İzole SQL entegrasyon test ortamını kur | Yapılmadı - kapanış açık | Ayrı silinebilir SQL test DB’sinde tüm gerekli transaction/rezervasyon/idempotency/kalıcılık kapıları çalıştırılmadı. |
| [QA-04](../docs/tasks/project-closure-2026-10-30.md#qa-04) - Web ve admin E2E'yi CI'ya ekle | Yapılmadı - kapanış açık | Deterministik E2E sunucu yaşam döngüsü, CI adımı ve kalıcı screenshot/artifact saklama pipeline’a tamamlanmadı. |
| [QA-07](../docs/tasks/project-closure-2026-10-30.md#qa-07) - Yük ve arıza dayanıklılığını ölç | Yapılmadı - kapanış açık | Onaylı p95/yük hedefi, son stok/webhook/worker crash ve DB/sağlayıcı kesinti test matrisi eksik. |
| [QA-08](../docs/tasks/project-closure-2026-10-30.md#qa-08) - Tek kabul matrisi ve kusur triage'ı oluştur | Kısmen yapıldı | Atanmış kişi/hedef tarih, tüm gereksinim-test-sürüm bağları ve sahipli kusur triage kapanışı eksik. |

### Açık alt işler ve özel kabul kayıtları

| Alt iş | Ana task | Durum | Kalan / kanıt |
|---|---|---|---|
| ADM-MAIL-01 | OPS-04, SEC-01 | Açık | İzinli gerçek alıcıda yönetici daveti, kabul, parola sonrası MFA, parola sıfırlama ve çıkış/yenileme akışını canlıya uygun ortamda doğrula; gönderim/teslim sonucunu kaydet. Formun açılması mail teslimi değildir. |

**Çapraz bağımlılıklar (tekrar sayılmaz):** [TIC-03](../docs/tasks/project-closure-2026-10-30.md#tic-03), [KIS-03](../docs/tasks/project-closure-2026-10-30.md#kis-03), [AI-01](../docs/tasks/project-closure-2026-10-30.md#ai-01), [ADM-02](../docs/tasks/project-closure-2026-10-30.md#adm-02), [UAT-05](../docs/tasks/project-closure-2026-10-30.md#uat-05).

**Kapanış kuralı:** Teknik ekip geliştirme/test kanıtını, müşteri/operasyon gerekli girdiyi sağlar; gerçek SQL, sağlayıcı, fiziksel cihaz, üretim numunesi ve resmi UAT ayrı kapılardır. Bu belge güncellemesinde uygulama testi tekrar koşulmadı. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

---


## Tarihsel uygulama durumu — 27.10.2026

**Durum:** Devam — güvenlik ve işletim doğrulamaları kısmi. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Bu kayıt 27.10 kesitidir; güncel 30.10 durumu yukarıdadır. 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| 03.02 / 03.04 kamuya açık önizleme | Düzeltildi | 9e69a74 ve TST-135: rendering-inputs salt okunur anonim listeye alındı; OnlyListedAreasArePublic geçti (434 geçti/25 atlandı/0 hata). Önceki 20.10 test hatası güncel açık değildir. |
| 03.04 personel / nesne yetkisi | Uygulandı | 34556fa, 503fe50, 6fd16c0, 681daeb: salt okunur tasarım metadata ve korumalı görsel, tasarıma bağlı sayfalı sipariş referansları, liste limiti dışındaki tek siparişi okuma. 88e99f9/b9b63f3 teklif/AI yazma kontrollerini yetkiye bağlar. |
| 03.04 iptal ve stok ayrımı | Düzeltildi | aa6069f: sipariş status üzerinden iptal için orders.cancel sunucuda da zorunlu; stok yazımı inventory.write ve yalnız stok güncelleme yoluyla yapılır. Katalog yazma yetkisi stok yetkisi yerine geçmez. DEPLOY-014: 26 AuthorizationTests geçti. |
| 03.08 / 03.11 revizyon ve medya | Kısmi | 9933fef, 47d8016, 902066f: sahiplik kontrollü konfigürasyon revizyonu, özel JPEG ve siparişe bağımsız kompozisyon kopyası. Mevcut FeatureDocuments/PersonalizationJson kullanılır; yeni fiziksel SQL migration yok. İzole SQL kalıcılık doğrulaması atlandı; malware taraması ve genel upload/finalize sözleşmesi açık. |
| 03.10 sırlar / kurulum | Kısmi | 096b267, 982436b, 4333eda, 94c9e26: harici sunucu ayarları, aynı dizine kurulum reddi, checksum ile birleşik paket, IIS durdurma/bekleme/yeniden deneme ve geri dönüş. localhost:8024 readiness kullanılır. VERIFYONLY/restore provası, RPO/RTO ve güvenlik taramaları kapanmadı. |
| 03.07 / 03.12 sınırlar | Açık | Inbox/dead-letter, ayrı worker, kalıcı genel panel ayarları ve teknik kararların açık bölümleri sürer. Cihaz sepeti sunucu sepetine dönüşmedi; XINOBI U oturumları tümüyle SQL olarak doğrulanmadı. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


> **Durum (16.10.2026):** Devam · geliştirme ~75 %; ayrıntı "Uygulama durumu — 16.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Plan / uygulanmadı. Bu dosyadaki yedi rol değerlendirmesi bir kontrol listesidir; gerçek kişilerin onayı değildir. Uygulama tamamlanınca kanıt yollarını ve ayrı ayrı kararları doldurun. Son geçişi her koşulda PM verir.

## 1. Bağlayıcı kaynak, sınır ve ön koşullar

- Kaynak: `Xinobi_Kavramsal_ve_Teknik_Analiz.md`, özellikle §2, §3, §4.1 D01–D03/D05/D06/D10, §6.1–6.5, §8. Müşterinin doğrudan kapsamı `Xinobi_Proje_Kapsami(4).md` ile çelişen bir durum varsa PM bunu Faz00 karar kaydında açar ve müşteri kararı alır.
- Ön koşul: Faz00'da kaynak sürümü ve mevcut kod envanteri (D01), ana veri sahipliği (D02) ve bu fazın başladığı commit yazılıdır. D01'de çalışan kod/altyapı bulunduysa repo, DB motoru ve framework değiştirilmez; burada verilen yollar mantıksal örnek olarak eşlenir ve fark Faz00'da belgelenir. Onaylanmış yeni repo omurgası: Next.js + TypeScript web, React + Vite + TypeScript panel, Flutter + Dart iOS/Android, ASP.NET Core Web API + worker, SQL Server ve nesne depolama. Mevcut kod veya barındırma buna uymuyorsa somut ADR ve PM kapısı olmadan yığın değiştirilmez.
- Burada gerçek ödeme, canlı müşteri verisi, Mikro veya pazaryeri transferi yapılmaz. Kimlik, veri ve asenkron çalışma temeli kurulur; e-ticaret iş kuralları sonraki fazlarda kesinleştirilir. `D02` stok/fiyat için alan bazlı sahip kararı alınmamışsa okuma/yazma yalnız örnek veriyle çalışır.
- Çıktı: tekrarlanabilir yerel ve test ortamı, sürümlü sözleşme, yetki altyapısı, migration geçmişi, audit/outbox/job/media omurgası, minimal panel kabuğu, CI doğrulaması ve geri yükleme kanıtı.

## 2. Dosya sözleşmesi ve fazdan devam etme

Yeni repo için önerilen yollar; mevcut projede eşdeğerleri Faz00'da birebir eşleyin:

```text
apps/web/                  Next.js müşteri sitesi
apps/admin/                React + Vite yetkili yönetim paneli
apps/mobile/               Flutter iOS/Android
services/api/              ASP.NET Core HTTP API, modüller ve yetki
services/worker/           outbox, zamanlanmış işler, retry
packages/contracts/        OpenAPI'den üretilen TS istemci/tipler ve sözleşme sürümü
infra/db/migrations/       EF Core veya eşdeğer sürümlü SQL migration ve açıklama
infra/dev/                 yerel SQL Server ve gerekli servisleri başlatma
docs/decisions/            teknoloji, D01/D02 ve kimlik/medya ADR kararları
docs/runbooks/             yerel kurulum, migration, restore, kuyruk yeniden işleme
tests/                     API, veri, sözleşme ve duman testleri
```

Her görev sonunda Faz00'a `faz=03`, iş maddesi, commit, değişen yollar, çalıştırılan komut/sonuç, ortam, göç sürümü, açık risk ve **sonraki tek adım** yazılır. Çalışma durursa önce Faz00, sonra çalışma ağacı ve migration geçmişi karşılaştırılır; başarılı olduğu kanıtlanmayan komut tekrar güvenle çalıştırılır. Ortam sırları veya kişisel veri Faz00'a yazılmaz.

## 3. Sırayla uygulama görevleri

| ID | İş ve uygulama yeri | Somut çıktı / bitiş kanıtı |
|---|---|---|
| 03.01 | D01 envanterini okuyup repo/DB/API seçimini `docs/decisions/ADR-001.md` içinde gerekçelendir; yeni repoda workspace, format/lint, backend çözümü ve komutları kur. | `README` tek komutla yerel kurulum ve servis başlangıcını, sürüm gereksinimlerini, portları açıklar; mevcut kod korunur. |
| 03.02 | `services/api` içinde `/api/v1/health/live` ve `/api/v1/health/ready`, modül sınırları, hata cevabı (`code`, `message`, `traceId`, alan hataları), UTC zaman, sayfalama/sıralama, correlation ID ve OpenAPI kur. | Başarısız DB'de liveness 200, readiness başarısız; hatada sır ve stack trace istemciye çıkmaz. |
| 03.03 | Kimlik: müşteri kayıt/giriş/parola sıfırlama ve doğrulama altyapısı; yönetici davet/rol atama; parola güçlü tek yönlü karma, token/oturum yenileme ve iptal. Platform/web kimlik taşıma yöntemi ve CSRF/XSS korunumu ADR'de seçilir. | Kayıt → doğrulama → giriş → oturum sonu; aynı e-postanın tekrarına açık hesap ifşası yok; yönetici kendi yetkisini yükseltemez. Gerçek e-posta servisi yoksa yerel sink. |
| 03.04 | `Role`, `Permission`, `UserRole`, rol-yetki bağlantısı ve merkezi authorization policy oluştur. Panel kaynakları için `catalog`, `content`, `media`, `pricing`, `inventory`, `promotions` (kampanya/kupon), `customers`, `orders`, `payments` (havale/EFT onayı ve iade), `quotes`, `print` (baskı operatörü), `integration`, `ai`, `reports`, `notifications`, `settings`, `audit` işlem izinleri; müşteri kendi nesneleri için sahiplik kontrolü. | API'de default deny, yetkisiz 401/403, başka müşterinin kaydı 404/403 politikaya göre; yalnız menü gizlemek yetki kabul edilmez. İlk süper yönetici güvenli bootstrap prosedürüyle kurulur. |
| 03.05 | DB ilk göçü: kimlik/rol, audit, outbox/inbox, job/attempt, dış eşleme, medya metadata çekirdeğini kur; iş modüllerinin göçleri sonraki faza kalır. SQL script/göç sırası ve indeksleri aşağıdaki modelde tanımla. | Boş veritabanında `migrate up` çalışır, tekrar çalıştırma durumu bozmaz, sürüm kaydı okunur; `migrate down` veya forward fix stratejisi belgeli. |
| 03.06 | `AuditLog`: actor, rol, işlem, entity, entity ID, before/after farkı için yalnız güvenli alanlar, timestamp, correlation ID; rol/fiyat/stok/sipariş/integration retry gibi kritik olaylara çağrı arayüzü. | Başarılı/başarısız yetkili değişiklik denemesi politika uyarınca izlenir, parola/token/ham ödeme ve PII dump yazılmaz; log yalnız denetçi yetkisiyle okunur. |
| 03.07 | `OutboxEvent` aynı DB transaction'ında iş kaydıyla yazılır, worker claim/lease ile teslim eder. `InboxEvent` tekil dış olay anahtarı ve işlenme durumu sunar; hata/backoff/dead-letter, idempotent handler şablonu kur. | Worker kapalıyken olay kaybolmaz; yeniden açılınca bir iş sonucu; iki worker aynı olayı yarışsa tek etki; terminal hata panelde görünür. |
| 03.08 | Medya soyutlaması: veride `Asset` metadata; dosya nesne depoda, kısa süreli yükleme/indirme izinleri, MIME/içerik/boyut kontrolü ve zararlı dosya taraması stratejisi. `POST /api/v1/media/uploads` ve finalize/GET metadata sözleşmesi; yüklenmiş dosya ile yetkili sahip ayrımı. | Geçersiz dosya reddi, sahipsiz/başka kullanıcının dosyası erişilemez; SQL'de ikili büyük dosya yok; yetkisiz açık bucket yok. |
| 03.09 | `apps/admin` içinde minimal `/login` ve boş dashboard, rol bazlı navigasyon, yükleme/boş/hata durumları; yaratıcı tasarımcının Faz02 tasarım tokenları ve UI/UX aktarımını uygula. `apps/mobile` API istemcisi ve kimlik kabuğu; gereksiz ürün ekranı yapılmaz. | Creative Designer → UI/UX → Frontend teslim izi `design/handoff.md`; responsive/klavye odak ve basit ekran okuyucu denetimi. |
| 03.10 | Ortamlar/işletim: `.env.example` yalnız anahtar adları, secret store, dev/test/prod ayrımı; TLS, en az yetkili SQL/nesne depo hesapları, CORS, rate limit, güvenli log; CI format, derleme, migration ve test. Yedek alma, saklama, nokta-in-time imkânı ve ayrı restore prova prosedürü. | CI yeşil; boş test DB'de göç ve restore denemesi kaydı; üretim sırrı repoda yok. RPO/RTO iş sahibi ile kararlaştırılıp Faz00'a yazılmadıysa değer uydurulmaz. |
| 03.11 | **Geçici dosya deposundan SQL Server'a geçiş.** `services/api/LocalCommerce` (`App_Data/local-commerce/state.json` + `media/`) ve tarayıcı localStorage demo hesap/sipariş kayıtları (`xinobi-demo-commerce-v1`, `xinobi-cart-v1`) için önce ADR-003 yazılır. Sonra EF Core DbContext ve ilk migration'lar kurulur, ticaret verisi SQL Server'a taşınır, yerel medya T-06 nesne depolamaya geçer, demo kimlik 03.03 gerçek kimliğiyle değiştirilir. Dosya deposu yalnız Development seed/fixture olarak kalabilir. | Aynı seed ile dosya deposu ve SQL Server API yanıtları eşleşir; `pnpm test:local-commerce` SQL Server'a karşı geçer; production'da dosya deposu ve localStorage kimlik yolu bulunmaz; geçiş ve geri dönüş adımları `docs/runbooks/` altında. |
| 03.12 | **Faz00 §3.1 teknik kararları:** T-03 oturum taşıma, T-05 barındırma, T-06 nesne depolama/CDN, T-07 zararlı dosya taraması, T-08 gözlemlenebilirlik, T-09 özellik bayrağı, T-10 CI güvenlik taraması ve T-12 yol eşlemesi ADR olarak kapatılır, ilk uygulaması yapılır. | Her karar ADR + Faz00 satırıyla kapalı; CI'da SAST, bağımlılık ve sır taraması çalışır; örnek bayrak XINOBI U'yu kapatıp açabilir; yapılandırılmış log ve correlation ID seçilen araca ulaşır. |

## 4. Asgari şema ve API sözleşmeleri

Model adları örnektir; fiziksel tablo adı farklıysa migration ve sözleşme haritasında karşılığı tutulur. `User(id, normalizedEmail UNIQUE, passwordHash, status, createdAt, rowVersion)`, `Role(id, code UNIQUE)`, `Permission(id, resource, action UNIQUE)`, `UserRole(userId,roleId UNIQUE)`, `RolePermission(roleId,permissionId UNIQUE)`. Müşteri hesabı ile yönetici rolü varsayılan ayrıdır. `AuditLog(id, actorId?, action, entityType, entityId, safeDiff, traceId, at)` append-only ve yalnız gerektiği kadar kişisel veri içerir.

`OutboxEvent(id, eventType, aggregateType, aggregateId, payloadVersion, payload, state, attempts, nextAttemptAt, leaseUntil, createdAt, processedAt)`; `(aggregateType,aggregateId,id)` ile sıralama ihtiyacı belgelenir. `InboxEvent(provider, externalEventId, eventType, payloadHash, state, receivedAt)` birleşik benzersizdir; sağlayıcı olayı ID sağlamıyorsa kanonik hash ve dönem kuralı Faz08'de karara bağlanır. `SyncJob(id, source, direction, objectType, objectId, state, attempts, nextAttemptAt, lastErrorCode, correlationId)` ve `SyncAttempt` geçmişi. `ExternalMapping(system, entityType, localId, externalId, mappingVersion)` için `(system,entityType,localId)` ve `(system,entityType,externalId)` benzersizdir. `Asset(id, ownerType, ownerId, storageKey, mime, bytes, checksum, status, createdAt)`; yalnız storageKey, açık URL tutulmaz.

API: `/api/v1/auth/register|login|refresh|logout|password-reset`, `/api/v1/admin/users|roles|permissions`, `/api/v1/admin/audit`, `/api/v1/admin/integrations/jobs` için kapsamlı auth; `/api/v1/media/uploads` ve `/api/v1/media/{id}` için nesne sahipliği. Değişiklik istekleri için sürüm/ETag veya concurrency token; OpenAPI'den TS istemci üretimi ve uyumluluk kontrolü kurulur. İstek/cevap örneklerini `packages/contracts/examples/` altında tut; sırlar örneğe girmez.

## 5. Göç, geri alma ve kurtarma

1. Her migration için önceki sürüm, SQL öncesi etki, yeni indeks/kısıt, tahmini kilit etkisi, veri dönüşümü ve idempotency varsayımını PR'a yaz. Test DB'de temiz kurulum **ve** önceki sürümden yükseltme ayrı denenir.
2. Geri uyumlu şema → uygulama → veri taşıma → eski kolonun sonraki güvenli teslimde çıkarılması sırasını kullan. Silici göçten önce doğrulanmış yedek al. Uygulama geri dönüşünün eski şemada çalışacağı yalnız test edildiyse `down` uygula; aksi durumda forward-fix ve yedekten geri yükleme kararını PM verir.
3. Restore provasında yeni boş ortamda yedekten aç, migration sürümünü ve örnek tutarlılığı kontrol et; prod verisi kullanılıyorsa maskeleme/kısıtlı erişim. Sırları restore çıktısına kopyalama.
4. Yarıda kalmada Faz00 son başarılı migration ID'sini DB migration tablosuyla kıyasla; kaydı olmayan SQL'i el yordamıyla tekrar uygulama. Son temiz yedeği ve tam hata kodunu kayda geçir.

## 6. Doğrulama ve kabul kapısı

| Kanıt | Yerel/mock sınaması | Gerçek erişim gerektiren kapı |
|---|---|---|
| Temiz kurulum ve yükseltme | Temiz SQL Server test verisi, migration/rollback veya forward-fix prova | Gerçek barındırmada yedek/restore ve izin kontrolleri, canlıya geçmeden önce |
| Kimlik/yetki | Negatif API testleri; başka kullanıcıya erişim, rol yükseltme, refresh iptali | Gerçek e-posta/SMS sağlayıcısında bağlantı ve gönderim izni sonraki entegrasyon fazında |
| Job/outbox/medya | Fake dış sağlayıcıyla kesinti, tekrar, iki worker, imzasız/bozuk dosya | Seçilen nesne depo ve işleyici ortamında erişim/restore prova |
| Web/panel/mobil temel | Tasarım el teslimi ve ortak API istemcisi; cihaz duman testi | Gerçek mobil sertifikalar ve dağıtım hedefi sonraki fazlarda |

**Mevcut durum notu (2026-10-07):** 03.01, 03.02 ve CI kısmen yapıldı. **03.05 kod tarafı tamam** (TST-091): `services/shared/Xinobi.Persistence`, migration `InitialCore`, `infra/db/migrations/0001_InitialCore.{idempotent,rollback}.sql`; XinobiYeniDB'ye uygulama SQL portu erişimi açılınca yapılacak. Oturum, barındırma ve depolama kararları ADR-004'te. **03.04 kod tarafı tamam** (TST-100): izin kataloğu, `super_admin`, merkezi `RequirePermission` politikası, varsayılan ret, konsoldan ilk süper yönetici (`docs/runbooks/super-admin-bootstrap.md`); panel uçlarının yetkiye geçmesi ve rol yönetim ekranı SQL kimlik deposuyla (03.11). 03.03 geliştirme deposuyla çalışıyor (TST-098/099); 03.06–03.08 henüz yok. Faz04–06/10 için yazılan demo kod bu çekirdeğe bağlanmadan ilgili faz kabulüne girmez.

**Geçiş:** 03.01–03.12 kanıtları, CI, migration/restore sonucu, OpenAPI sürümü, kullanıcı sahipliği negatif testleri, `docs/decisions` ve Faz00 kaldığı yerden devam kaydı tamamlanır. Test erişimi olmayan bir sağlayıcıyı gerçek çalışıyor saymayın; erişim sahibi, eksik izin, bloklanan test ve plan Faz00'a yazılır. D01 nedeniyle değişen yollar açıklanır. D02/D10 açık ise ilgili gerçek veri yazımı ve saklama politikasına bağımlı iş koşullu tutulur.

**09.10.2026 uygulama güncellemesi:** 03.05 artık gerçek `XinobiYeniDB` üzerinde uygulanmıştır ([TST-110](../test/2026-10-09/TST-110-initial-core-migration-application.md)). Boş hedef ön kontrolü, model/script testleri 12/12, 12 çekirdek tablo ve 1 migration sürümü, ikinci uygulamada aynı metadata ve API SQL readiness başarılı. Önceki SQL erişim blokajı son kontrolde yoktur. İş modülleri ve SQL depoları henüz bağlanmadı; restore provası ve hesap ayrımı bu kanıtla kapanmaz, faz kabulü verilmez.

**09.10.2026 katalog hazırlığı:** [TST-111](../test/2026-10-09/TST-111-sql-catalog-preparation.md): 0002 katalog migration'ı, SQL depo, mevcut sözleşmeyi koruyan facade ve doğrulamalı aktarım hazır; tam .NET 315 geçti / 1 gerçek SQL testi atlandı, Release 0/0. COPY_ONLY/CHECKSUM yedeği alındı; `RESTORE VERIFYONLY` Msg262 sunucu yetkisi nedeniyle başarısız olduğundan DBA kontrolü bekleniyor. Katalog migration'ı, gerçek SQL entegrasyon testi ve yerel aktarım henüz yapılmadı; Development mevcut dosya deposuyla devam eder. Hesap/sipariş ve diğer modüllerin SQL bağlantısı ayrı sonraki işlerdir.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~75 % · kalan ~25 % · Statü: Devam**

**16.10 güncellemesi (kod/commit incelemesi):** Yönetici daveti/rol atama, ayrı personel-müşteri oturumları, e-posta MFA ve yönetici kurtarma eklendi (`fc715ec`, `c618feb`); 0006–0009 migration dosyaları mevcut, hedef SQL uygulama kanıtı bu denetimde doğrulanmadı. Audit için güvenli alanların önce/sonra farkı ve roller `TransactionalAudit` içinde var; tüm kritik modül kapsamı ayrıca doğrulanmalı. CI Dart SDK/izole fixture ve bağımlılık düzeltmeleri eklendi (`18888a4`, `5cbe7da`, `ef66c03`, `456444e`). Ayrıntılı kayıt: [faz denetimi](../docs/tasks/phase-audit-2026-10-16.md). Yeni uygulama test koşusu yapılmadı; önceki testler tarihsel kanıttır.

**20.10 güncellemesi:** Panel isteklerinde ortak personel oturum yenilemesi, API’nin verdiği gerçek yetkilerin gösterilmesi, eski/ yetkisiz işlemlerin engellenmesi ve audit kayıtlarının Türkçe sunumu (`697ec23`, `51eca15`, `7a84da0`, `9ecc480`, `ccb5d22`); maskeli salt okunur müşteri dizini (`b4d37ca`). İzole kabul: .NET 429/24/0 ([admin-technical-acceptance](../test/2026-10-19/admin-technical-acceptance.md)); gerçek oturum açmış tarayıcı kabulü yapılmadı. **Yeni açık:** `AuthorizationTests.OnlyListedAreasArePublic` başarısız (anonim `commerce-mask/.../rendering-inputs`, TST-130) — izinli listeye ekleme veya anonim erişimi geri alma kararı. Kalıcı ayar yazma sözleşmesi/şeması yok. Oran değişmedi. [faz denetimi 20.10](../docs/tasks/phase-audit-2026-10-20.md)

| ID | Durum | Kanıt / eksik |
|---|---|---|
| 03.01 | Tamam | README, pnpm/dotnet araç zinciri, `pnpm dev:local:background` |
| 03.02 | Tamam | `/api/v1/health/live|ready`, `RequestCorrelationMiddleware`, OpenAPI + TS/Dart istemcileri |
| 03.03 | Tamam (kod) | Kayıt/giriş/yenileme/çıkış, e-posta doğrulama kodu, web cookie+CSRF, mobil refresh (TST-098/099); **parola sıfırlama 14.10’da eklendi** (hesap ifşa etmez, tüm oturumları kapatır; web+mobil, [TST-117](../test/2026-10-14/TST-117-password-reset.md)). Yönetici daveti/rol atama ve MFA eklendi (`fc715ec`, `c618feb`); güncel uçtan uca test bu denetimde çalıştırılmadı |
| 03.04 | Tamam | İzin kataloğu, `RequirePermission`, panel uçları personel oturumuna bağlı (`12f543c`, TST-100/114) |
| 03.05 | Tamam | 0001 XinobiYeniDB’ye uygulandı (TST-110) |
| 03.06 | Kısmi (14.10) | `AuditMiddleware` panel/yönetim değişiklik denemelerini (başarılı, 4xx, 401/403, 5xx) aktör/işlem/kayıt/sonuç/istek no ile `ops.AuditLogs`’a yazar, gövde saklanmaz; `GET /local-commerce/audit` yalnız `audit.read`; panelde Denetim kaydı ([TST-116](../test/2026-10-14/TST-116-audit-trail.md)). Güvenli alan bazlı önce/sonra farkı ve rol eklendi (`fc715ec`, `TransactionalAudit`); tüm kritik modüllerin kapsam doğrulaması açık |
| 03.07 | Kısmi | Outbox sahiplenme ve SQL’de işçiler (`7db18d6`); inbox yalnız tablo; dead-letter/panel yok; `services/worker` hâlâ şablon döngü |
| 03.08 | Kısmi | `IFileStore` (`fa8d720`), MIME/görüntü doğrulama; kısa ömürlü imzalı URL, `/api/v1/media/uploads` finalize sözleşmesi ve zararlı içerik taraması (T-07) yok |
| 03.09 | Tamam | Panel girişi/rota izinleri, mobil kimlik kabuğu |
| 03.10 | Kısmi | CI (`.github/workflows/ci.yml`), rate limit, HTTPS ARR (`c88ea3e`); yedek VERIFYONLY Msg262, restore provası ve RPO/RTO yok |
| 03.11 | Kısmi | Katalog, hesap, sipariş, özellik belgeleri SQL’de (TST-113); canlı IIS SQL katalog (DEPLOY-008 hazırlandı). Sepet tarayıcıda (`xinobi-cart-v1`), XINOBI U oturumları SQL’de değil, `state.json` Development’ta duruyor |
| 03.12 | Kısmi | T-03/T-05/T-06 kapandı (ADR-004); T-07, T-08, T-09 (yalnız `XinobiU:Enabled`/`Features:*` ayarları), T-10, T-11 açık |

**Sonraki adım:** yönetici yaşam döngüsünü güncel SQL ortamında doğrulamak; 03.10 restore provası.

## 7. Yedi rol kontrolü ve PM son kararı

**09.10.2026 devam güncellemesi:** [TST-112](../test/2026-10-09/TST-112-customer-schema-and-backup-retry.md): VERIFYONLY tekrarında sunucu yetkisi hatası sürüyor. 0003 hesap profili, hash oturumları, adres ve sipariş şeması/migration'ı hazırlandı, .NET 321 geçti / 1 gerçek SQL testi atlandı. 0002/0003 gerçek SQL'e uygulanmadı; yerel veri ve mevcut IAccountStore değiştirilmedi. SQL hesap deposu/aktarımı, yedek doğrulama, yetki ayrımı ve restore provası hâlâ açık.

Her rol ayrı bir kayıt ekler: `rol | karar: bekliyor/onay/revizyon | kanıt bağlantısı/commit | açık nokta | tarih`. Bu doküman yazıldığında tamamı **BEKLİYOR** durumundadır; otomatik veya hayali imza yoktur.

| Rol | Gözden geçirilecek ölçüt | Karar |
|---|---|---|
| İş Analisti | Aktör, D01/D02/D10 ve faz sınırı kaynakla uyumlu | Bekliyor |
| Sr. Creative Designer | Panel kabuğu görsel yönü ve UI/UX teslimi uygulanabilir | Bekliyor |
| Sr. Frontend Developer | Web/mobil istemci, durumlar, erişilebilirlik ve sözleşme | Bekliyor |
| Sr. Backend Developer | API, auth, outbox, concurrency ve hata modeli | Bekliyor |
| DB Admin | Anahtarlar, migration, yedek/restore, sorgu indeksleri | Bekliyor |
| Sr. Full Stack Developer | Ortam/CI ve web–mobil–API birlikte açılıyor | Bekliyor |
| CTO Advisor (ek zorunlu rol) | Barındırma, nesne depolama, gözlemlenebilirlik ve güvenlik taraması kararları; dosya deposundan çıkış | Bekliyor |
| Proje Yöneticisi (SON KAPI) | Altı rolün kanıtı, müşteri kararları, riskler ve Faz00 güncel | Bekliyor |

Herhangi bir rol `revizyon` derse görev sahibi düzeltir ve rol tekrar bakar. Altı rolün onayı ve gereken müşteri kararları olmadan PM onay veremez; PM onayı olmadan sonraki fazın bağımlı işi başlamaz. Faz00 karar tablosu gerçek uygulama sırasında doldurulur.


## 06.11.2026 — Kişiselleştirmede tek kaynak fotoğraf/maske planı

Kullanıcı kararı: desenli ürünler için çoklu renk ve renkler arası hizalama gerekmiyor. Güncel revizyon: fotoğraf üretim promptu kaldırılacak; doğrudan yüklenen tek görsel kaynak olacak ve sabit piksel boyutu/en-boy oranı şartı olmayacak. Kaynak indirme ve maskeleme promptu korunacak; prompt boyutu kaynağın gerçek ölçüsünden alınacak, diğer maskeleme kuralları aynen kalacak. Birden fazla görsele aynı maskeyi uygulama/toplu renk onayı kaldırılacak. Maskenin kendi fotoğrafıyla ölçü/koordinat eşliği ve sipariş dosya güvenliği sürecek. Task 01–03 aynı; 04–12 revize edildi. [12 tasklık değişiklik planı](../docs/tasks/personalization-single-source-tasks-2026-11-06.md); bu fazla ilişkili tasklar: **KIS-TEK-02 (06/09 sözleşme etkisi)**. Hepsi açık; yalnız plan hazırlandı, uygulama/veri geçişi/deploy yapılmadı. Normal ürün renkleri ve tarihsel siparişler korunacak.


## 06.11.2026 — KIS-TEK-02 salt okunur envanter ve geçiş planı

[Envanter/plan](../docs/reports/personalization-migration-plan-2026-11-06.md): SQL 24 ürün/79 varyant/39 tasarım/19 revizyon; 7 kişiselleştirilebilir ürünün kaynak ve SKU seçimleri boş bırakıldı. 2 taslak ve 8 published önizleme güncel varyantlardan kopuk. 28 tasarım dosyası yerelde yok; IIS kaybı diye yorumlanmaz. Manifestli 2 sipariş satırında 6 dosya hash/boyut PASS; 7 legacy satır korunur. Eski SourceSha256 desen hash’idir; ürün kaynağı hash’ine dönüştürülmeyecek. Task 02 planlama tamam; seçim, restore/apply ve IIS karşı kontrolü yapılmadı. Gerçek veriye yazma/deploy yok.
