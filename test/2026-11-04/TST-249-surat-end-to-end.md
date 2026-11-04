# TST-249 | Sürat uçtan uca test ve kusur düzeltmeleri

04.11.2026 · KRG-SUR-01 / TIC-08 · Başlangıç `a24b1aa`, çalışma ağacı temiz. AGENTS.md, Faz00/Faz05, güncel task/kurulum/erişim ve TST-248 ile test/INDEX.md incelendi. Kaynak gönderi/takip PDF'leri (9/8 sayfa) PDFKit ile yeniden kontrol edildi. Gerçek müşteri, ödeme veya sağlayıcı kaydı değiştirilmedi. Deploy/APK/baskı operasyonu yapılmadı.

## Ortam ve gönderim onayı

**İzole ortam:** Development WebApplicationFactory/TestServer, her test için geçici dosya deposu, sentetik sipariş/adres, fixture hesabı. `SuratEndToEndTests` gerçek API → iş akışı → kalıcı depo → gerçek SuratKargoClient → bellek içi HttpMessageHandler zincirini çalıştırır; taşıyıcıya ağ bağlantısı yok. Bu zincir tarayıcı testinden ayrıdır: admin ve web tarayıcı testleri sahte API yanıtları kullanır. Gerçek SQL çoklu süreç testi değildir. Bildirim ve Sürat worker'ı fixture'da kapalıdır; worker iş seçimi/zamanlama depo testleriyle sınanır.

**Gerçek sağlayıcı:** onaylı test alıcı/adres/telefon/paket kaydı bulunamadı. SAGLAYICIYA-MESAJ.md içinde bu veri hâlâ isteniyor; taslak gönderilmemiş. Kullanıcıya onay kaydı soruldu; bu çalışma için onaylı veri iletilmedi. Fixture verileri sağlayıcı gönderimi için onaylı kabul edilmedi. Yerel güvenli ayarlarda ve süreç ortamında test hesabı tanımlı değil; özgün RTF'den parola kopyalanmadı veya yeni secret dosyası üretilmedi. Gerçek gönderi oluşturma yapılmadı.

**Canlı korumaları:** Enabled varsayılan kapalı, hesaplar ayrı ve hostlar sabit; AllowProduction tek başına siparişten canlı oluşturmayı açmaz. Ödeme almayan demo modelinde doğrulanmış tahsilat/operasyon kanıtı bulunmuyor; Production workflow engeli korunuyor. Test kolaylığı için bu kontroller kaldırılmadı.

## Bulunan kusurlar

| Bulgu | İlk gerçek sonuç | Düzeltme | Sonuç |
|---|---|---|---|
| Gönderim HTTP hatasından sonra form görünmez oluyor | başarısız: yeni Chrome testi Paket sayısı alanını bulamadı | Formu hata halinde görünür tut; alanları koru, kaydın yokluğunu iddia etme ve yenilemeye kadar create düğmesini kapat | geçti: dört alan aynı kaldı, yalnız bir create isteği |
| IsError=false / Gonderiler=[{}] geçerli takip sayılabiliyor | başarısız: kaynak incelemesinde boş belge Available üretiyordu | Belge nesne ve kimlik/takip/durum alanı gerektirir; bozuk yapı invalid_response | geçti: boş/null belge başarı değil, önceki veri korunur |
| Taşıyıcı hatalarının neden sınıfı kayboluyor | başarısız: HTTP kimlik/servis/bozuk yanıt tek sınıfsız Unavailable | Güvenli FailureKind: authentication_or_access, provider_http, provider_error, invalid_response, timeout_or_cancelled, connection_failure; snapshot'ta sakla | geçti: nedenler ayrılır, public DTO hâlâ güvenli genel unavailable; ham hata/URL paylaşılmaz |

HTTP 403 yalnız kimlik/erişim sınıfıdır; parolanın yanlışlığı veya IP engelinin kesin nedeni diye yorumlanmaz. Ham HTTP 200 IsError mesajından güvenilir hata kodu yoksa parola hatası tahmin edilmez, provider_error kalır.

## Senaryo matrisi

Tüm I satırları yukarıdaki izole ortam ve fixture verilerini kullanır. Gerçek sonuç sütunu bu koşuda yürütülen testleri anlatır; eski rapor sonuçları yeni kanıt sayılmaz. B: Chrome + sahte API; R: bu Mac'ten gerçek salt okunur erişim; D: dış bağımlılık.

| ID / ortam | Ön koşul / girdi | Beklenen | Gerçek sonuç | Kanıt |
|---|---|---|---|---|
| I01 | Sentetik sipariş, Tamam | registered; fiziksel sevk değil | geçti | Full_API_adapter_create_label_tracking_matches_order_and_never_ships_commercial_order(Tamam) |
| I02 | JSON string Kayıt Edildi | aynı kayıt kabulü | geçti | Aynı testin ikinci vakası |
| I03 | Türkçe adres, +90 telefon, iki koli, kesirli desi/kg, alıcı öder | tüm alanlar sipariş/formla eşleşir; kendi mağaza bayrakları 0/boş | geçti | Aynı test, gerçek adaptörün seri hale getirdiği alanlar |
| I04 | İki farklı sipariş | benzersiz ref; provider çağrısından önce kalıcı submitting | geçti | Different_orders_receive_unique_references_and_unapproved_labels_are_blocked + I01 |
| I05 | Aynı sipariş tekrar ve çift tıklama | tek provider POST, aynı ref | geçti | I01 + Concurrent_double_click_sends_once_and_persists_reference_before_network |
| I06 | HTTP üzerinden altı paralel tekrar, ilk yanıt bekliyor | hepsi submitting, tek provider çağrısı | geçti | Concurrent_HTTP_requests_and_cancellation_during_provider_write_are_guarded |
| I07 | Yanıt kabul sonrası kayboluyor/timeout | reconciliation_required; restartta yeni ref veya POST yok | geçti | Ambiguous_provider_result_survives_restart_without_second_write_or_label(lost-response) |
| I08 | Sağlayıcı Tamam sonrası yerel .tmp yazımı özellikle engelleniyor | ilk istek 500; kalıcı submitting; restart kör tekrar yapmaz | geçti | Lost_local_completion_keeps_submitting_after_restart_and_requires_reconciliation |
| I09 | Kesin yokluk kanıtı yok / boş kanıt / aktif gönderim | yeniden gönderim veya mutabakat izni yok | geçti | I06/I07 + Reconciliation_requires_evidence_never_resets_reference_or_active_attempt |
| I10 | Boş olmayan sentetik not_created teyidi | aynı ref, yeni attempt; eski kanıt korunur | geçti | I07 (dört hata varyantı) + Only_explicit_not_created_evidence_allows_same_reference_retry_with_attempt_history |
| I11 | İptal ile rezervasyon yarışı; received/preparing | tek kazanan; iptal/pending önceyse gönderim engelli; rezervasyon önceyse iptal ve manuel sevk 409 | geçti | Atomic_reservation_and_cancellation_have_only_one_winner_and_survive_reload (iki vaka) + I06 |
| I12 | Kayıtlı sipariş, etiket iki defa | aynı sipariş/ref/cari; aynı byte; yeni gönderi yok | geçti | I01, gerçek HTTP label uçları |
| I13 | Türkçe metin, sığan/taşan adres, iki koli | Unicode/XML korunur; taşma açık hata; koli sayısı doğru | geçti | Label_is_test_only_XML_escaped_and_deterministic_without_write + I01/I04 |
| I14 | Submitting, belirsiz veya Production etiket | 409; canlı şablon onaylı gösterilmez | geçti | I07/I08 + Label_is_test_only_XML_escaped_and_deterministic_without_write |
| I15 | Aynı özel ref ile takip | WebSiparisKodu create ref ile aynı | geçti | I01, gerçek adaptör query kontrolü |
| I16 | Tam Sipariş bulunamadı. + IsError=true + boş liste | awaiting_acceptance; yokluk kanıtı veya yeni POST değil | geçti | I07 + Tracking_separates_empty_and_failure |
| I17 | Normal boş, kimlik hatası, genel hata | boş kabul bekler; diğerleri unavailable, nedenler ayrıdır | geçti | Tracking_separates_empty_and_failure + Tracking_HTTP_failures_are_classified_without_provider_content |
| I18 | Çoklu koli/iade, eksilen belge ve aynı belge yeni yanıtı | tüm belgeler/önceki raw sürümler korunur | geçti | Empty_or_partial_tracking_keeps_prior_parcels_and_original_data_time + Repeated_parcel_responses_archive_all_movement_versions |
| I19 | Önceden geçerli veri ardından hata/boş | önceki bilgi ve LastSuccess korunur | geçti | Tracking_failure_preserves_last_success_and_shared_lease_throttles_queries + I18 |
| I20 | Kod6,12,7,99; 19 haneli sayısal ID | delivered/return_delivered/needs_review/unknown; ID string kayıpsız; ticari order/refund değişmez | geçti | I01 + Tracking_preserves_large_ids_and_all_documents |
| I21 | Bağlantı, timeout, 401/403/500, belirsiz create metni | başarı yok; write retry yok | geçti | I07 (dört vaka) + Http_errors_never_retry_or_become_success + Timeout_is_uncertain_not_retried |
| I22 | Bozuk JSON, boş/null belge, beklenmeyen yapı | unavailable/invalid_response | geçti | Invalid_or_provider_error_tracking_never_becomes_available (dört vaka) |
| I23 | Zamanı dolmamış sorgu/lease, eski lease, hata backoff | ikinci sorgu yok; eski yanıt yeniyi ezmez; bekleme artar | geçti | I01 + Expired_worker_cannot_overwrite_new_result_and_changed_account_is_blocked + Tracking_failure_preserves_last_success_and_shared_lease_throttles_queries |
| I24 | Worker due işi: pending/farklı hesap/ortam ve backoff | yalnız kayıtlı, zamanı gelen doğru hesap/ortam işi seçilir | geçti | Worker_due_selection_filters_pending_account_environment_and_backoff |
| I25 | Anonymous/müşteri admin create/reconcile/label/tracking | 401/403; yazma ve başkasının veri erişimi yok | geçti | All_operation_routes_deny_anonymous_requests + Customer_cannot_read_or_create_shipping_records |
| I26 | Müşteri kendi/başkasının siparişi; Sandbox/Production kayıtlı snapshot | yalnız kendi güvenli Production DTO; ham Source/adres/secret yok | geçti | Customer_tracking_enforces_ownership_and_hides_test_records + Customer_reads_only_safe_production_snapshot_without_provider_calls |
| B01 | Çift aktivasyon, etiket indirme | tek create; indirme yeni create yapmaz | geçti | apps/admin/tests/surat-shipment.mjs |
| B02 | Takip servisi hatası, kod7 | eski veri görünür; teslim iddiası yok | geçti | Aynı Chrome paketi |
| B03 | Read-only personel / eksik ayar | create devre dışı | geçti | Aynı paket, iki ayrı fixture |
| B04 | Belirsiz kayıt / bozuk takip yanıtı | form tekrar göndermez; mutabakat alanı/okunur hata; ekran çökmez | geçti | Aynı paket, iki ayrı fixture |
| B05 | Create HTTP503 | form ve dört değer korunur; yeniden create kapalı, kayıt yenileme yönlendirmesi | geçti | Aynı pakette yeni regresyon; önce başarısız, düzeltme sonrası geçti |
| B06 | Gecikmeli yükleme ve boş hareket | yükleniyor ardından şube kabulü bekleniyor | geçti | Aynı pakette yeni gecikmeli fixture |
| B07 | Müşteri ekranı 390/1440 px, stale iade ve hata/yenileme | iade teslimi ayrı, önceki veri korunur; yatay taşma yok | geçti | apps/web/tests/e2e/surat-tracking.spec.ts, 2/2 |
| B08 | Sentetik test SVG'si yüksek çözünürlükte render; Vision Code128 | bağımsız yazılımsal decode tam referansa eşit | geçti | tools/verify-surat-label-macos.swift; gerçek fiziksel okuyucu değildir |
| R01 | Kimliksiz gerçek ana adres GET, redirect izlenmiyor | güvenli bağlantı sonucu kaydedilir | geçti: test/canlı ana adresleri 302; redirect_blocked | surat-e2e-preflight.json |
| R02 | Güvenli test hesabı yapılandırılmamış | tracker isteği gönderilmez | çalıştırılamadı: not_configured; HTTP sonucu yok | Aynı JSON, sandboxAccountConfigured=false |
| R03 | Onaylı alıcı/paket yok | gerçek test gönderisi/etiket/takip zinciri çalıştırılmaz | çalıştırılamadı; kayıt oluşturulmadı | Onay incelemesi + createdShipment=false |
| D01 | Gerçek Windows/IIS ortamı yok | o sunucunun egress/erişim/redaksiyonu ayrı ölçülür | çalıştırılamadı | Aşağıdaki bağımlılık listesi |
| D02 | Onaylı şablon, fiziksel yazıcı/okuyucu/şube yok | fiziksel etiket ve kabul ayrı kanıtlanır | çalıştırılamadı | Aşağıdaki bağımlılık listesi |

## Gerçek servis sonucu ve sınırlar

[Yeni sanitize edilmiş ön kontrol](surat-e2e-preflight.json): 04.11.2026 bu Mac'ten kimliksiz test/canlı ana adres GET'leri 302; yönlendirme izlenmedi. `--with-test-account` seçeneğinde güvenli hesap bulunamadığından takip çağrısı gönderilmedi, komut exit1. Bu, entegrasyon kusuru veya hesap/IP engeli kanıtı değildir; eksik yerel yapılandırmadır. Canlı hesabı kullanma veya canlı kargo yazma yok. 03.11'deki HTTP200/Sipariş bulunamadı kaydı tarihsel kanıttır; bu görevde tekrar alınmış sayılmaz. Mac sonucu Windows/IIS sonucu değildir.

## Dış bağımlılıklar ve kapanış koşulları

| Sorumlu | Bağımlılık | Kapanış koşulu |
|---|---|---|
| Proje sahibi / Sürat | Sağlayıcıya gönderimi onaylı sentetik alıcı, adres, telefon, paket/desi/kg ve ücret politikası; test yazma yetkisi | Onay kaydı ve yalnız sunucu güvenli deposunda test hesabı; tek kontrollü Sandbox gönderimi için izin |
| Sürat / operasyon | Gerçek kayıt, şube kabulü ve çoklu koli/iade hareketleri | Onaylı ref ile tek kayıt, etiket ve takip zinciri; fiziksel kabul/hareket kanıtları; boş takipte tekrar oluşturma yok |
| Sürat / operasyon | Resmî etiket/cari barkodu/çoklu koli düzeni | Onaylı ölçü/şablon, doğru fiziksel baskı, bağımsız barkod okuyucu ve şube kabul kaydı |
| Sunucu yöneticisi | Windows/IIS hesabı/proxy/NAT/egress/APM | Asıl hostta preflight ve gerekli whitelist; query parola redaksiyonu kanıtı |
| DBA / test ortamı | İzole gerçek SQL çoklu API süreci | Aynı siparişte eş zamanlı claim/iptal, restart ve tamamlanma kaybında tek provider yazımı kanıtı |
| Ticari akış sahibi | Güvenilir ödeme/operasyon uygunluğu | Demo dışı tahsilat ve sevke uygunluk doğrulaması; sonra ayrı kontrollü canlı pilot izni. Canlı korumalar bu görevde açılmadı |

Rezervasyon otomatik bırakılmaz; not_created mutabakatı otomatik iptal anlamına gelmez. Önceden var olan denemelere rezervasyon uydurulmadı. Saat dilimi, kota ve raw arşiv saklama politikası sağlayıcı/operasyon kabulü ister; fixture testleri bunları teyit etmez.

## Komutlar ve kanıt

- `dotnet test tests/Xinobi.Architecture.Tests --no-restore -m:1 -p:UseSharedCompilation=false --verbosity quiet`: nihai sonuç aşağıda.
- `dotnet build services/api/Xinobi.Api.csproj --configuration Release --no-restore -m:1 -p:UseSharedCompilation=false`: PASS, 0 uyarı / 0 hata; OpenAPI değişmedi.
- `pnpm --filter admin lint`: PASS, kargo dışındaki AuditHistory/SurfaceMasks içinde önceden bulunan dört uyarı.
- `pnpm --filter admin build`: PASS (TypeScript ve Vite).
- `node apps/admin/tests/surat-shipment.mjs`: PASS, sekiz fixture senaryosu. Form regresyonunun ilk başarısız koşusu düzeltme sonrası tekrarlandı.
- `pnpm --filter web test:e2e surat-tracking.spec.ts`: gerçek Next üretim derlemesi ve 2/2 Chrome testi PASS; gerçek müşteri/sağlayıcı yok.
- Bağımsız Code128: fixture testinin SVG çıktısı Chrome'da 1200×1800 render edildi; `swift -module-cache-path /tmp/surat-swift-cache tools/verify-surat-label-macos.swift /tmp/surat-label-reader.png /tmp/xinobi-surat-test-label.svg`: PASS. İlk yardımcı denemede temp klasörü bulunamadı; dosya yolu düzeltilip okuma tekrarlanarak geçti. Sadece sentetik fixture, görüntüler Git dışında.
- Admin 390/1440 ekranları, müşteri ekranları ve test etiketi yerelde görsel incelendi. Gerçek kişisel veri görüntüsü alınmadı. Ham sağlayıcı yanıtı, secret veya gerçek hesap bilgisi bu rapora konmadı.
- İlk yeni .NET test derlemesinde HttpMessageHandler.Send ad çakışması çıktı; helper Respond olarak düzeltildi. İlk hata nihai başarı diye raporlanmadı.

**Kabul:** İzole API/adaptör ve tarayıcı senaryoları geçti; gerçek sağlayıcı gönderim zinciri, IIS ve fiziksel şube kabulü tamamlanmadı. TIC-08 kısmen yapıldı, gerçek uçtan uca kabul açık.

## Nihai test sonucu

- Tam API: **589 geçti / 29 atlandı / 0 başarısız**, toplam 618, süre 1 dk 16 sn. SQL/harici ortam atlamaları gerçek kabul değildir.
- Admin: **8/8 fixture senaryosu geçti**, lint 0 hata (4 mevcut uyarı), TypeScript/üretim derlemesi geçti.
- Web: **2/2 takip tarayıcı testi ve Next üretim derlemesi geçti**.
- API Release: **0 uyarı / 0 hata**. Bağımsız yazılımsal Code128 okuma geçti. `git diff --check` geçti.
- Gerçek sağlayıcı oluşturma/takip zinciri: **çalıştırılamadı** (onaylı veri ve güvenli test hesabı yok). Yeni gerçek kontrol yalnız kimliksiz edge 302 sonucudur. IIS/SQL çoklu süreç/fiziksel okuyucu/şube kabulü çalıştırılamadı.
