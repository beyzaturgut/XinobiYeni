# Faz07 — Kurumsal teklif ve toplu sipariş

## Güncel durum ve tüm açık işler - 30.10.2026

**Durum:** Bloke - D07 ve firma/teklif-sipariş teslimleri açık. Kaynak kesiti `main / de99958`; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

**Yapılan son işler:** Mevcut talep/mesaj/teklif/kabul-red ve yetkili panel devam eder. Son commitler firma başvurusu, ek dosya, teklifsiz toplu sipariş veya tekliften gerçek sipariş üretimini tamamlamadı.

**Müşteriden / iş sahibinden beklenenler:** D07 firma alanları, teklif geçerliliği/fiyat-vergi kuralları, tek siparişe dönüşüm ve toplu satış modeli; kurumsal e-posta şablonları.

### Teknik ekipte ve kabulde kalan ana görevler

Aşağıdaki tablo bu fazın ana sorumluluğundaki tüm kapanış tasklarını içerir; tamamlanan teknik kapsamlar da kaybolmaması için listede korunur. Hedef iş, mevcut temel, kapanış kanıtı, bağımlılık ve önerilen sorumlu task bağlantısındadır.

| Task / konu | Durum | Yapılmadı / kapanış için kalan |
|---|---|---|
| [B2B-01](../docs/tasks/project-closure-2026-10-30.md#b2b-01) - Firma başvurusu ve kurumsal profil oluştur | Yapılmadı - kapanış açık | Firma başvurusu, vergi/fatura profili, onay/red ve firma-kullanıcı modeli tamamlanmadı. |
| [B2B-02](../docs/tasks/project-closure-2026-10-30.md#b2b-02) - Teklifin sürüm ve geçerlilik modelini tamamla | Yapılmadı - kapanış açık | Sürümlü fiyat/adet/vergi/kişiselleştirme, geçerlilik ve eski sürüm kabulünü engelleme modeli eksik. |
| [B2B-03](../docs/tasks/project-closure-2026-10-30.md#b2b-03) - Teklif ek dosya akışını güvenli kur | Yapılmadı - kapanış açık | Güvenli ek dosya tür/boyut/tarama, sahiplik ve süreli indirme uçtan uca eksik. |
| [B2B-04](../docs/tasks/project-closure-2026-10-30.md#b2b-04) - Kabul edilen teklifi tek siparişe dönüştür | Yapılmadı - kapanış açık | Kabulden tek siparişe atomik dönüşüm, fiyat snapshot’ı, stok/ödeme ve firma faturası açık. |
| [B2B-05](../docs/tasks/project-closure-2026-10-30.md#b2b-05) - Teklifsiz toplu sipariş yolunu uygula | Yapılmadı - kapanış açık | Teklifsiz toplu SKU/adet yükleme, minimum adet/kurumsal fiyat ve checkout yolu tamamlanmadı. |
| [B2B-06](../docs/tasks/project-closure-2026-10-30.md#b2b-06) - Kurumsal bildirim şablonlarını onayla ve bağla | Yapılmadı - kapanış açık | Kurumsal olayların onaylı, sürümlü e-posta/izinli kanal şablonları ve gerçek teslim kanıtı eksik. |
| [B2B-07](../docs/tasks/project-closure-2026-10-30.md#b2b-07) - Kurumsal satış raporunu oluştur | Yapılmadı - kapanış açık | Cevap süresi, kabul oranı, kayıp nedeni ve siparişe dönüşüm sunucu raporu eksik. |
| [B2B-08](../docs/tasks/project-closure-2026-10-30.md#b2b-08) - Teklif ve toplu siparişi üç kanalda kabul et | Yapılmadı - kapanış açık | Firma başvurusundan gerçek siparişe kadar web/Android/iOS/panel uçtan uca iş kabulü açık. |

**Çapraz bağımlılıklar (tekrar sayılmaz):** [ADM-04](../docs/tasks/project-closure-2026-10-30.md#adm-04), [ADM-06](../docs/tasks/project-closure-2026-10-30.md#adm-06), [SEC-07](../docs/tasks/project-closure-2026-10-30.md#sec-07), [TIC-02](../docs/tasks/project-closure-2026-10-30.md#tic-02), [TIC-03](../docs/tasks/project-closure-2026-10-30.md#tic-03).

**Kapanış kuralı:** Teknik ekip geliştirme/test kanıtını, müşteri/operasyon gerekli girdiyi sağlar; gerçek SQL, sağlayıcı, fiziksel cihaz, üretim numunesi ve resmi UAT ayrı kapılardır. Bu belge güncellemesinde uygulama testi tekrar koşulmadı. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

---


## Tarihsel uygulama durumu — 27.10.2026

**Durum:** Bloke — D07; panel akışı iyileştirildi. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Bu kayıt 27.10 kesitidir; güncel 30.10 durumu yukarıdadır. 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| 5 Panel teklif listesi/detayı | Uygulandı | 2df83fe yükleniyor/boş/hata/tekrar ayrımı; 88e99f9 status eylemlerinde quotes.write; 72aff5d kayıtlı teklif özetini düzenleme izninden bağımsız salt okunur sunum; a544fde arama/sayfalama. Arama yalnız yüklenmiş kayıtları kapsar, sunucu tarafı eksiksiz arama değildir. |
| 3 API / 7 dönüşüm / 9–11 | Kısmi / bloke | Mevcut talep/mesaj/teklif/kabul-ret korunur. Teklif → sipariş, firma başvurusu, teklifsiz toplu sipariş, ek dosya, onaylı e-posta şablonu ve rapor bu commitlerle tamamlanmadı. D07 ve gerçek UAT açık. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


**Durum (16.10.2026):** Bloke (D07) · geliştirme ~45 %; ayrıntı "Uygulama durumu — 16.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Planlandı · **Sorumlu:** Proje yöneticisi (PM) · **Kaynak:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §§2–5, 6.2–6.3, 7–8; müşteri kapsamı `Xinobi_Proje_Kapsami(4).md`; Faz01 D07 kararı. Durum ve kanıtlar Faz00'da tutulur.

## Amaç ve sınır

Kurumsal müşterinin ürün, adet, logo/tasarım, termin ve teslimat gereksinimiyle teklif/toplu sipariş talebi iletmesini; yetkili personelin talebi panelde işlemesini, teklifin kayıtlı yöntemle paylaşılmasını, onaylı teklifin gerçek toplu siparişe dönüşmesini ve sonraki sipariş akışında izlenmesini sağlamak. Talep tek başına sipariş veya tahsilat değildir. Üretim, ERP, B2B bayi fiyat listesi ya da yeni kurumsal ödeme modeli müşteri kapsamına eklenmez.

## Önkoşullar ve bağımlılıklar

1. Faz01 D07 müşteri kararı, teklif hesabı (misafir/üye/kurumsal hesap), yetkili onay, fiyat/vergi/kargo, geçerlilik, dosya, revizyon ve sipariş dönüşümü yönünden kapanmış olmalı. Açık bir kural varsa yalnız bağımsız form/panel alt işleri yapılır; dönüşüm bloke kalır.
2. Katalog/varyant, müşteri/firma, kimlik-rol, medya yükleme ve merkezi siparişin sözleşmeleri ile D02 (fiyat/stok kaynağı), D03 (sipariş/ödeme/stok), D04 (baskı) ilgili kısımları netleşmiş olmalı. B2C ödeme yöntemini kurumsal siparişe otomatik taşımak müşteri kararı gerektirir.
3. E-posta sağlayıcısı D05 kapsamında test ortamında hazır olmalı. Sağlayıcı yoksa outbox ve test adapter'ı geliştirilebilir; gerçek teslimat kabulü bekler. D10'daki kişisel veri metinleri ve iletişim izni ilgili yayında onaylanmalı.
4. Sr. Creative Designer kurumsal teklif akışını, formu, yükleme durumu, panel tablo/detay/teklif görüntüsü ve mobil kırılımları UI/UX ile Sr. Frontend'e sürümlü tasarım olarak teslim eder. Yedi rolden bağımsız UI/UX icracısı görevlendirilecekse PM gerçek kapasite ve teslim alımını Faz00'a kaydeder.

## Sıralı uygulama listesi

1. **D07'yi yürütülebilir sözleşmeye çevir:** Kurumsal satışla `taslak → iletildi → inceleniyor → bilgi bekliyor → teklif hazırlandı/gönderildi → revizyon → kabul/red/süre doldu → toplu siparişe dönüştü` geçişlerini, bunları kimlerin yapacağını ve her geçişte bildirim/kayıt kuralını kesinleştir. Bu değerler örnek şemadır; iş sahibi onayladığı nihai geçiş tablosu kodlanır. Müşterinin teklif fiyatını kimin belirleyeceğini, geçerliliği, adet ve birim fiyatı, ödeme/teslimat koşullarını, onay kanıtını ve değişiklik sonrası yeniden onay kuralını ayrıca imzalat.
2. **Kamu webi ve mobil uyumlu form:** Ürün/varyant, ürün satırları ve adet, şirket/ticari ünvan, ilgili kişi, iletişim, vergi bilgisi D07 gerekliyse, istenen termin/teslimat, açıklama ve logo/tasarım dosyası alanlarını tasarla. Dosya türü/boyutu/yetkisi doğrulanır; alan bazlı hata, kaydet/yeniden dene, başarıda talep numarası ve alındı durumu gösterilir. Kurumsal hesabın kendi talep görünümü D07'de onaylandığı ölçüde açılır; yetkisi olmayan başka firmanın kaydına erişemez.
3. **API sözleşmesi:** `POST /quote-requests` talep açma; `GET /quote-requests/{id}` yalnız sahip/yetkili görünüm; panelde `GET /admin/quote-requests` filtre/sayfalama, `GET /admin/quote-requests/{id}`, `POST /admin/quote-requests/{id}/notes`, `POST /admin/quote-requests/{id}/transitions`, `POST /admin/quote-requests/{id}/offers`, `POST /admin/quote-requests/{id}/convert-to-order` önerilen kaynak uçlarıdır. Nihai URL/sürüm mevcut API standardına uyar. Mutasyonlarda yetki, beklenen sürüm veya ETag, idempotency anahtarı gereken dönüşüm, sunucu tarafı geçiş doğrulaması ve standart hata kodu uygulanır. Kamuya açık formda bot ve oran sınırı D10 veri ilkeleriyle uyumlu tasarlanır.
4. **Veri modeli ve migration:** `Company`, `QuoteRequest`, `QuoteLine`, `QuoteAttachment`, `QuoteOffer`/revizyon, `QuoteNote`, `QuoteStatusHistory`, `CorporateOrderLink`, `Notification` ve `AuditLog` mantıksal varlıklarını uygun fiziksel şemaya dönüştür. Talep satırı ürün/varyant kimliğini ve başvuru anındaki açıklamayı taşır; teklifte geçerli para birimi, vergi, birim fiyat, toplam, koşullar, sürüm, gönderim zamanı ve geçerlilik sonu değişmez kaydedilir. Firma ve talep erişimi kimlik sınırına bağlıdır. `CorporateOrderLink` teklif sürümü ve gerçek `Order` kimliğini bağlar; aynı onay sürümü ikinci kez sipariş yaratamaz. Dosyanın kendisi nesne depoda, güvenli medya referansı ilişkisel veridedir. Gereken FK, benzersizlik, indeks ve geçiş geçmişini DBA inceler.
5. **Panel iş akışı ve kurumsal müşteri yönetimi:** İzinli kullanıcılar için talep listesi (durum, firma, tarih, ürün, termin), filtre/arama/sayfalama, detay, ek/dosya indirme, iç not, durum geçmişi, teklif oluşturma/revizyon, gönderim sonucu, kabul/red kaydı ve toplu sipariş bağı göster. Kurumsal müşteri panelinde firma profili, vergi/yetkili/iletişim bilgileri, talep ve toplu sipariş ilişkisi, arama/filtre, yetkili düzeltme ve izin/erişim geçmişi bulunur; başka şirketin verisi açılmaz. Teklif sorumlusu ile katalog/finans/süper yönetici yetkileri ayrılır. Her işlem kullanıcı, zaman, önceki/sonraki durum ve gerekçeyle audit'e girer; yanlış/eksik alan hata olarak görünür.
6. **E-posta ve teslim izi:** Talep alındı, bilgi talebi, teklif gönderildi/revizyon, kabul ve gerekiyorsa toplu sipariş teyidi için müşteri onaylı şablon ve tetikleyicileri hazırla. E-posta işini yerel işlemle outbox'a yaz; arka plan işleyicisi sağlayıcı kimliği, deneme, hata, yeniden gönderim ve teslim bilgisini izlesin. Başarısız e-posta talebi/siparişi yok etmez; panel uyarısı ve yetkili tekrar deneme sunar. Şablonda kişisel veri ve ek indirme bağlantısının ömrü D10'a tabidir.
7. **Onaylı teklif → sipariş:** D07'de tanımlanan kabul kanıtını ve teklif sürümünü doğrula; tutarı sipariş servisinin sunucu hesaplama kuralları ve D02/D03 ile uyumlu olarak yeniden teyit et. Miktar, stok/üretim/termin, teslimat, vergi ve ödeme koşullarında fark varsa belirlenmiş onay akışına geri dön; gizlice sipariş oluşturma. Başarılı komut tek `Order` ve `CorporateOrderLink` oluşturur; kanal `kurumsal`, teklif sürümü ve satır anlık görüntüsü korunur. Tekrarlı istek / ağ kesintisi / eşzamanlı iki operatör aynı sonucu döndürür. Siparişe dönüşümden sonraki kargo, muhasebe, iptal/iade merkezi sipariş ve entegrasyon aşamalarının aynı kurallarıyla izlenir; kapsamdaki toplu sipariş listesi panelde yer alır.
8. **Mobil ve kanal doğrulaması:** Kaynaktaki iOS/Android kurumsal talep akışları ortak API'ye bağlanır; bekleyen yükleme, hata ve yeniden dene hallerini gösterir. Pazaryerinden gelen bir alıcıyı talep sahibi üye hesabına otomatik bağlama. Mobil teslim diğer fazda planlandıysa Faz00'da bağımlılık açık kalır ve Faz07 bütün proje kapanışı için gereken çapraz test işaretlenir.
9. **Kurumsal müşteri başvurusu:** Kapsamdaki "kurumsal müşteri başvurusu" için firma, yetkili ve vergi bilgileriyle hesap başvurusu; panelde `başvuru → inceleniyor → onaylandı/reddedildi/bilgi bekleniyor` akışı, onaylanan başvurudan `Company` kaydı ve yetkili kullanıcının firmaya bağlanması. Onaysız başvuru teklif talebi açmayı engellemez (D07'ye göre misafir talep de mümkün olabilir) ama kurumsal hesap görünümünü açmaz. Vergi numarası biçim doğrulaması yapılır; aynı vergi numarasıyla mükerrer firma oluşmaz.
10. **Teklifsiz toplu sipariş talebi:** Kapsam "toplu sipariş talebi", "toplu sipariş yönetimi" ve "toplu sipariş sistemi"ni teklif talebinden ayrı kalem olarak sayar. D07'de şu iki model arasında karar alınır: (a) liste/kurumsal fiyattan doğrudan çok satırlı toplu sipariş talebi, operatör teyidiyle siparişe dönüşür; (b) her toplu sipariş zorunlu olarak teklif sürecinden geçer. Karar (a) ise ayrı `BulkOrderRequest` akışı, adet bazlı fiyat/stok/termin kontrolü ve panelde toplu sipariş talep listesi uygulanır; (b) ise web ve mobilde "toplu sipariş talebi" girişi teklif formuna önceden doldurulmuş biçimde yönlenir ve bu Faz00'a karar olarak yazılır. Hiçbir modelde talep otomatik tahsilat yaratmaz.
11. **İşletim/rapor:** Talep, gönderilen teklif, revizyon, kabul/red ve dönüşen toplu siparişin temel adetlerini/yaşını panelde göster. E-posta başarısızlığı, uzun süre bekleyen talep ve yinelenen dönüşüm denemeleri izlenebilir olsun. Bu raporlar temel operasyon ihtiyacıyla sınırlıdır.

## Test ve UAT senaryoları

| ID | Girdi / eylem | Beklenen sonuç |
|---|---|---|
| F07-T01 | Kurumsal başvuran çok satırlı ürün/varyant, adet, termin, adres ve logo ile başvurur | Tek talep ID'si, doğru satırlar/medya referansı, alındı ekranı ve panel kaydı |
| F07-T02 | Eksik adet, yanlış dosya türü/boyutu, çift tıklama veya ağ kesilmesi | Alan hatası; yetkisiz dosya reddi; aynı başvuru anahtarıyla mükerrer talep yok |
| F07-T03 | Başka şirketin talebi/profili ve izinsiz panel durum değişikliği çağrılır | 403/404 ile nesne düzeyi erişim engeli; veri açığa çıkmaz; audit izi |
| F07-T03a | Yetkili kurumsal müşteri profili/izin düzeltir, firma/talep arar | Arama doğru şirkete gider, yetki ve audit işler, kişisel/vergi verisi maskeli gösterilir |
| F07-T04 | Operatör not, revizyon ve teklif gönderimi yapar | Sürümlü teklif, durum geçmişi, gönderim denemesi ve yetkili panel görünümü |
| F07-T05 | Sağlayıcı e-postayı reddeder veya iki kez bildirim yollar | Talep korunur; hata/tekrar kaydı görünür; çift/yanlış durum yok |
| F07-T06 | Talep yalnız iletildi; kabul onayı yokken dönüşüm istenir | Sipariş ve ödeme oluşmaz; kural hatası ve gerekçe görünür |
| F07-T07 | Onaylı sürüm iki operatörden eşzamanlı dönüştürülür; ağ nedeniyle yeniden gönderilir | Aynı `Order` ID'si, tek kurumsal bağlantı, tek stok/ödeme sonucu |
| F07-T08 | Onay sonrası fiyat/stok/termin değişir veya teklif süresi biter | D03/D07 onay/geçiş kuralı çalışır; sessizce eski tutarla sipariş açılmaz |
| F07-T09 | Web ve gerçek iOS/Android cihazında talep açılır | Aynı API, talep ID ve dosya durumu; kanal bazlı ekran/erişim kanıtı |
| F07-T10 | Siparişe dönüşen teklifte kargo, Mikro ve iptal/iade ilerler | Merkezi siparişten aynı kayıt izlenir; ilgili sonraki fazın bütünleşik testi bağlanır |
| F07-T11 | Kurumsal başvuru yapılır, aynı vergi numarasıyla ikinci başvuru gelir | Tek firma kaydı; onay/red auditli; onaysız hesapta kurumsal görünüm kapalı |
| F07-T12 | Toplu sipariş talebi D07 modeline göre açılır | (a) modelinde tek talep ve operatör teyidiyle tek sipariş; (b) modelinde teklif formuna doğru ön doldurma; iki modelde de otomatik tahsilat yok |

## Teslim kanıtları

- D07 müşteri kararı, iş kuralları/durum geçişleri ve kabul örnekleri; D02/D03/D04/D05/D10 bağımlılık kayıtları.
- Sr. Creative Designer'ın sürümlü kurumsal tasarım teslimi; UI/UX ve Sr. Frontend alım kaydı; web/panel ve mobil ekranlarının durum/erişilebilirlik görüntüleri.
- Sürümlü API şeması, migration/indeks/benzersizlik incelemesi, dosya yükleme güvenlik kanıtı, e-posta outbox ve hata yeniden deneme kaydı.
- F07-T01–T10 otomatik/manuel test sonuçları, müşteri UAT görüşü, teklif ve sipariş ID zincirinin maskelenmiş örneği. Sonraki faz bağımlılığı varsa Faz00'daki açık test olarak bırakılır.

## Karar ve engeller

| Konu | Sahip | Açıkken etkisi |
|---|---|---|
| D07 onay, fiyat, geçerlilik, hesap ve dönüşüm; toplu sipariş modeli (a/b) ve kurumsal başvuru onayı | Kurumsal satış | Dönüşüm API'si, toplu sipariş akışı ve kabulü blokeli |
| D11 kurumsal siparişte e-Fatura ve sözleşme yükümlülüğü | Hukuk + muhasebe | Kurumsal siparişin canlı kabulü blokeli |
| D02/D03 stok, fiyat ve sipariş ödeme koşulu | Operasyon/satış | Sipariş kesinleştirme blokeli |
| D04 logo/baskı kalitesi ve insan onayı | Ürün/üretim | Baskılı kurumsal satırın üretim kabulü blokeli |
| D05 e-posta sağlayıcısı | Xinobi + PM | Gerçek e-posta teslimatı blokeli |
| D10 KVKK/satış metni ve saklama | Xinobi hukuk/operasyon | İlgili kamu formu ve canlı yayın blokeli |
| Mobil teslim/entegrasyon takvimi | PM + Sr. Full Stack | İki platformda çapraz kabul açık kalır |

Her engel Faz00'da sahibi, hangi testin engellendiği, güvenli ilerlenebilecek işler ve sonraki tarih/eylemle tutulur. Test adapter'ı veya temsili tasarım, gerçek müşteri kararı ve gerçek sağlayıcı kabulünün yerine geçmez.

## Bitiş ölçütü

- Web ve panel akışları, teklif sürümü, e-posta sonucu, onaylı dönüşüm ve toplu sipariş bağlantısı F07-T01–T08'de doğrulanmıştır; kaynakta istenen mobil talep F07-T09 ve merkezi operasyon F07-T10 için açık bağımlılık varsa proje geneli bitmiş sayılmaz.
- Talep yanlışlıkla ücretli siparişe dönüşmez; onaylı sürümden dönüşüm tekrarında tek sipariş üretilir; firma ve panel yetki sınırları korunur.
- Yedi rolün gerçek inceleme kayıtları alınır; müşteri D07/UAT kararı ayrı belgelenir; PM son kapıyı açık kanıtlara göre onaylar veya blokeyi bildirir.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~45 % · kalan ~55 % · Statü: Bloke (D07)**

| Madde | Durum | Kanıt / eksik |
|---|---|---|
| 1 D07 sözleşmesi | Bloke | Geçiş tablosu iş sahibince onaylanmadı |
| 2 Web/mobil talep formu | Tamam | `/kurumsal/teklif`, mobil teklif ekranları |
| 3 API | Kısmi | Talep/takip/mesaj/teklif/kabul-ret; `convert-to-order` yok |
| 4 Veri modeli | Kısmi | Özellik belgesi deposunda (0004); `Company`, ek dosya ve ilişkisel tablolar yok |
| 5 Panel iş akışı | Kısmi | Teklif listesi/detay/teklif verme; kurumsal müşteri profili yok |
| 6 E-posta izi | Kısmi | Bildirim kuyruğu; onaylı şablonlar yok |
| 7 Teklif → sipariş | Bloke | D07 |
| 8 Mobil | Kısmi | Android emülatör; iOS yok |
| 9 Kurumsal başvuru | Yok | — |
| 10 Teklifsiz toplu sipariş | Bloke | D07 model seçimi |
| 11 Rapor | Yok | — |

## Yedi rolün inceleme/onay kaydı

Bu tablo gerçek ekip ve insan imzası yerine geçmez; tüm durumlar ilk oluşturma anında beklemededir.

| Rol | Denetleyeceği kanıt | Durum | İsim/tarih/kanıt |
|---|---|---|---|
| Proje yöneticisi (PM) | D07 kararı, faz bağımlılığı, UAT ve nihai geçiş | Beklemede | — |
| İş analisti | Teklif/toplu sipariş iş akışı ve kabul ölçütleri | Beklemede | — |
| Sr. Creative Designer | Form/panel/teklif tasarım teslimi ve erişilebilirlik | Beklemede | — |
| Sr. Frontend Developer | Web, panel, dosya, durum ve mobil kırılımı | Beklemede | — |
| Sr. Backend Developer | Teklif API'si, e-posta, dönüşüm ve tekrar güvenliği | Beklemede | — |
| DBA | Firma izolasyonu, teklif sürümü ve tekil sipariş bağı | Beklemede | — |
| Sr. Full Stack Developer | Web/mobil/API/e-posta/sipariş uçtan uca doğrulama | Beklemede | — |

**PM nihai onay kapısı:** Yedi rolün inceleme görüşleri ile D07 müşteri kararı ve UAT kanıtları Faz00'a işlendiğinde PM `KABUL / RED`, tarih ve kanıt referansı verir. Şu an **beklemede**; PM onayı olmadan Faz07 tamamlandı olarak işaretlenmez.
