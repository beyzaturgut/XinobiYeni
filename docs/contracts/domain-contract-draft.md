# Faz01 — Modül API ve veri sözleşmesi taslağı

Durum: Karar girdileri bekleyen taslak · Son güncelleme: 06.10.2026 (ProductSurfaces sınırları)

## ProductSurfaces Step 5B — development accepted rendering seam

- Yalnız Development + `ProductSurfaces:DevelopmentStorefrontPreview:Enabled` opt-in. Read-only `/api/v1/dev/product-surfaces/{productReference}/{variantReference}/rendering-inputs`; loopback, no-store. `blue` production variant ID değildir. Asset/Product/Variant persistence eklenmedi.
- Manuel Tea Maker maskesi daha önce kabul edilmiş prototype referansıdır; AI `ReviewDecision` oluşturulmaz. Pending/rejected/refined/corrected onboarding adayları bu seam'e girmez. Source/mask/required branding decode, exact dimensions ve sabit SHA doğrulanır; hata/unsupported variant için `previewAvailable:false`, `inputs:null`.
- Dış sözleşme yalnız development preview availability, source dimensions/version, surface cache version ve checksum-versioned same-origin source/mask/branding URL'leridir. Provider/history/reviewer/secret yok. Renderer aynı Canvas transform/warp/lighting/mask/branding sırasını sürdürür; fetching ve source resolution adapter'dadır. Fabric.js müşteri DesignDocument sorumluluğu korunur.
- Web development proxy yalnız bu GET seam'ine ve loopback API'ye yönelir; production static export proxy içermez. Dosyalar kopyalanmaz. Cache query identity development kolaylığıdır; üretimde shared Asset değişmez sürümleri gerekir.
- Gelecek değişim: development fixture resolver → gerçek Catalog variant/media association + shared Asset + approved-surface resolver. SQL/object storage/auth/publication bu adımda yok. Preview availability ticari personalizationEnabled, PrintArea, DPI veya imalat onayı değildir. D02/D04/D05/D08/D10 açık.

| Modül | Örnek kaynaklar/komutlar | Temel veri | Yetki sınırı | İdempotency | Açık karar |
|---|---|---|---|---|---|
| Kimlik/rol | kayıt, oturum, parola sıfırlama, profil, adres | User, Role, Permission, Customer, Address | Kendi hesabı / panel rolü / nesne sahipliği | kayıt ve token yenileme tekrar güvenliği | D10 |
| Katalog | ürün/kategori/varyant/medya okuma; panel yayın komutları | Brand, Category, Product, Variant, Asset, PrintArea | Yayınlanan katalog / panel yetkisi | yayın komutunda sürüm | D02, D04 |
| Fiyat/stok | fiyat-kampanya-kupon sorgusu; rezervasyon ve stok hareketi | Price, ChannelPrice, Campaign, Inventory, Reservation | Sunucu hesaplama; panel/entegrasyon yazma yetkisi | rezervasyon ve hareket benzersizliği | D02, D03 |
| Sepet/checkout | sepet satırı, kupon, checkout kesinleştirme | Cart, CartLine, CheckoutIdempotency | Yalnız kendi sepeti | `Idempotency-Key` zorunlu | D03, D05 |
| Sipariş/ödeme | sipariş geçmişi, ödeme girişimi/webhook, kargo, iptal/iade | Order, OrderLine, PaymentAttempt, Shipment, ReturnRequest | Müşteri kendi kaydı; operatör rolü | sağlayıcı işlem/olay ID ve durum geçişi | D03, D05, D10 |
| Tasarım/baskı | DesignDocument kaydet/aç; çıktı işi ve indirme | Design, DesignVersion, GeneratedAsset, PrintOutput | Tasarım sahibi; baskı operatörü | sürüm ve render işi hash'i | D04, D09 |
| Teklif | talep oluşturma, not/durum, onaylı dönüşüm | QuoteRequest, QuoteLine, QuoteHistory | Talep sahibi; teklif sorumlusu | talep ve dönüşüm anahtarı | D07 |
| CMS/SEO | sayfa/blog/menü/meta yayınlama | Page, BlogPost, Menu, SeoMetadata | Yayınlanan içerik; içerik rolü | optimistic concurrency | D10 |
| Mikro | ürün/stok/fiyat/cari/sipariş/fatura/tahsilat/iade işleri | ExternalMapping, SyncJob, SyncAttempt | Entegrasyon rolü | alan+harici ID+iş türü | D02, D06 |
| Pazaryerleri | kanal ürün/fiyat/stok; sipariş/kargo/iptal/iade | ExternalOrderRef, ExternalMapping, ProviderEvent | Kanal bazlı entegrasyon rolü | kanal+dış ID+olay | D02, D03, D06 |
| AI tasarım | istem, kuyruk, sonuç, editöre aktarım | AiJob, GeneratedAsset, AiUsage | Kullanıcı kotası; AI yönetim rolü | istek hash'i ve job ID | D05, D08, D10 |
| AI asistan | konuşma, öneri, teklif/lead, insan devri | AiConversation, Lead, KnowledgeSource | Konuşma sahibi; destek/AI rolü | mesaj/iş kimliği | D05, D08, D10 |
| Bildirim/rapor | bildirim tercihleri, gönderim işleri, temel rapor | Notification, OutboxEvent, AuditLog | Kendi bildirimleri; yetkili rapor | bildirim işi kimliği | D05, D10 |

## Değişmezler

- `variantId` katalogdan editör, sepet ve siparişe değişmeden taşınır.
- Sipariş satırı satış anındaki ürün/varyant/tutar/vergi/indirim/tasarım sürümü anlık görüntüsüdür.
- Büyük medya ve baskı dosyaları SQL Server içine gömülmez; yalnız güvenli referans ve checksum tutulur.
- Dış sağlayıcı gecikmesi yerel sipariş kaydını kaybettirmez; outbox/inbox ve mutabakat kullanılır.
- D02/D03/D04/D07 açıkken ilgili fiziksel şema ve durum değerleri kesin kabul edilmez.

## ProductSurfaces — kavram ve sorumluluk sınırları

Bu bölüm ProductSurfaces Step 1 temelinin proje sözlüğüne eşlemesidir; yeni fiziksel şema, sağlayıcı veya üretim onayı değildir. Konuşmadaki Phase 1/2/3 adları bu özelliğin uygulama alt adımlarıdır; repository genelindeki Faz01/Faz02/Faz03 ile aynı değildir. İzlemede `ProductSurfaces Step 1`, `ProductSurfaces Step 2` kullanılır. Özellik Faz04 ürün/varyant/medya onboarding ve Faz06 önizleme ile ilişkilidir; ortak kimlik, medya ve audit temeli Faz03 sorumluluğundadır.

| Proje kavramı | ProductSurfaces sınırı |
|---|---|
| `Asset` | Paylaşılan medya kavramıdır. Ayrı ürün/medya sahipliği modeli kurulmaz. `SourceMediaIdentity` yalnız segmentation için kullanılan tam, değişmez medya sürümünü tanımlayan/doğrulayan değer nesnesidir. Gelecekte kalıcı kaynak ilişkisi ortak Asset/medya altyapısına bağlanır. |
| `PrintArea` | Ürün/varyant fiziksel baskı alanı ve kurallarıdır. Kaynak hizalı alpha maske bir PrintArea değildir; belirli fotoğraftaki hangi piksellerin mevcut görsel önizleme/projeksiyonda kullanılabileceğini belirtir. Maske onayı fiziksel alan, DPI, üretim veya imalat onayı vermez; D04 yetkisi korunur. |
| `Design`, `DesignVersion`, `DesignLayer` | Müşterinin kişiselleştirme belgesini temsil eder. `SegmentationRevision` bir DesignVersion değildir; ürün/medya onboarding analiz geçmişidir. |
| `Variant` | Yüzey yapılandırması doğru ürün/varyant/medya birleşimine bağlanmalıdır. Tam kaynak görüntü veya varyant değişince eski maske/onay başka renk, crop, yön, çözünürlük veya benzer görüntüye sessizce taşınmaz. |
| `ReviewDecision` | Tam revision/candidate ve kaynak için segmentation inceleme kararıdır; ortak AuditLog'un yerine geçmez. Kimlik/audit altyapısı bağlandığında reviewer doğrulanmış principal'dan alınır; istemcinin serbest metni otorite olmaz. |

### Görselleştirme ve sağlayıcı sınırı

- Mevcut Canvas 2D ürün önizleme renderer'ı görselleştirme/projeksiyon bileşenidir; yalnız onaylı, kaynak görüntüyle aynı boyut/crop/yön/koordinatta designable mask tüketir. Transform, warp, ışık/gölge ve en son branding compositing onun sorumluluğudur. Segmentation sağlayıcısını bilmez.
- Bu Canvas bileşeni ADR-001'deki Fabric.js müşteri tasarım editörü/katman-etkileşim adaptörünü değiştirmez veya onun yerine geçmez. Ortak gelecekteki müşteri belgesi DesignDocument sınırı korunur. Bu kayıt iki uygulamada kod değişikliği yapmaz.
- Roboflow-hosted SAM 3, kullanıcı tarafından bildirilen segmentation PoC sağlayıcısıdır; Cloudflare Workers AI görsel üretimi/düzenleme kararı olan ADR-002'den ayrı yetenektir. ADR-002 değiştirilmez. Gerçek adapter `ISurfaceSegmentationProvider` arkasında kalır; domain/application Roboflow DTO, URL, endpoint veya secret taşımaz.
- Production sağlayıcı seçimi, açık/configurable medya aktarımı, saklama/veri işleme, lisans, maliyet tavanı ve güvenlik koşulları ayrıca doğrulanacaktır. PoC veya fake testi bu kapıları kapatmaz; D04/D05/D08/D10 ve diğer açık kararlar açık kalır.
- Step 1'in Task tabanlı süreç içi provider arayüzü durable job, retry, outbox veya worker yürütmesi değildir. Gerçek dış servisler için belgelenmiş güvenilir background processing yönü korunur. Hosted segmentation yürütme stratejisi gerçek adapter adımında ölçülen gecikme/provider davranışı ve ortak worker/job altyapısıyla kararlaştırılır; şimdiden yeni job sistemi kurulmaz.

### Step 1 mevcut kapsamı

`services/api/Features/ProductSurfaces` içinde provider bağımsız automatic/interactive request-result, source kimliği, surface intent, candidate metadata/provenance/isteğe bağlı anlamı korunmuş provider score, yeni revision/lineage ve açık approve/reject bulunur. Interactive sonuç önceki maskeyi değiştirmez; önceki candidate yalnız lineage bağlamıdır. Keep/Exclude noktaları kaynak piksellerindedir; negatif/sınır dışı/sonlu olmayan değerler reddedilir. Candidate otomatik onaylanmaz; yeni candidate mevcut onayı değiştirmez. Onay tam candidate/revision ve kaynak kimliğini hedefler; stale kaynak kullanılamaz.

Kimlik doğrulaması bu adımda media version + SHA-256 + boyut metadata eşitliğidir; yetkili güncel kimliği ortak medya katmanı ileride sağlamalıdır. Gerçek PNG decode/alpha/alignment doğrulaması henüz yoktur. Fake provider yalnız testlerdedir. Roboflow adapter, HTTP/Admin UI, persistence, storage, migration ve job uygulaması yoktur. Kanıt: TST-074–076; sonuçlar geriye dönük kaydedilmiş UNIT/MOCK ve BUILD kanıtıdır, gerçek entegrasyon veya faz kabulü değildir.

### ProductSurfaces Step 2 — development medya ve gerçek maske doğrulaması

06.10.2026: `services/api/Infrastructure/MediaValidation` içinde SkiaSharp 4.153.1 decoder/inspector eklendi. Skia tipleri domain/application sözleşmelerinde yoktur. SHA-256 orijinal dosya byte'larından .NET cryptography ile üretilir; dosya re-encode/resize/crop/rotate edilmez. API hedefi net10.0 olarak korunur. Tek doğrudan paket SkiaSharp'tır; NuGet net10.0 grubu Win32 ve macOS native 4.153.1 paketlerini zorunlu transitif getirir. Bu adım win-x64 üzerinde doğrulandı; Linux/mobil/UI native paketleri eklenmedi.

`DevelopmentTeaMakerMedia`, repo kökü açıkça verilen, uygulamaya otomatik kaydedilmeyen yerel fixture'dır; dosya kopyası/manifest/persistence yoktur. Mevcut Tea Maker WebP ve reference PNG kullanılır. Asset referansı `dev:tea-maker-101:blue:source`, medya sürümü `:v1`, ürün referansı `cay-makinesi-101`, ürün kapsamında mevcut storefront demo varyant anahtarı `blue` kullanılır. Bunlar production Asset/Variant kimliği değildir; gelecekte shared catalog/media resolver'a bağlanmalıdır. Resolve tam üçlü eşleşmesini ve yeniden okunan authoritative source checksum/boyutlarını doğrular; kayıt sonrasında değişen source reddedilir. Version + checksum birlikte kimliktir; değişen dosya v1 adıyla sessizce geçerli kalmaz.

`AlignedImageInspector` tam decode başarısı, RGBA PNG, exact source kimliği/boyut ve alpha kontrolü yapar; 32 MiB encoded / 20 milyon decoded piksel limiti vardır. Alpha istatistikleri 8-bit RGBA inspection üzerinden alınır; orijinal byte'lar/checksum ve intermediate alpha dosyada aynen korunur. Ortalama alpha <=1/255 efektif coverage boş, >=254/255 dolu sayılır; alpha=0 pikseli olmayan tasarlanabilir-her-yerde maskeler de reddedilir. Bunlar yalnız muhafazakâr yapısal prototype guard değerleridir; PrintArea/iş kuralı eşikleri değildir.

`ValidatedAlignedMask.ForSource` başka source/version/checksum için candidate metadata kullanımını reddeder. Test fixture provider'ı doğrulanmış metadata'yı Step 1 automatic/interactive akışına verir; yeni revision/candidate pending kalır, önceki candidate/onay değiştirilmez. PNG'nin kendi içinde source provenance bilgisi yoktur: boundSource güvenilir onboarding çağıranından gelmelidir. Aynı boyut tek başına semantik crop/yön/doğru ürün geometry kanıtı değildir; insan incelemesi ve exact Asset ilişkilendirmesi gerekir. Step 2 structural/source-bound doğrulaması D04 veya production onayı vermez.

Kanıt TST-077–079: Step 1 + Step 2 toplam 39/39 UNIT/MOCK test, Release API build 0 uyarı/0 hata. HTTP/Admin, Roboflow/SAM, jobs, persistence/storage ve üretim Asset/PrintArea/Design uygulaması eklenmedi; renderer/Fabric.js değişmedi. Açık D kararları ve sağlayıcı yürütme stratejisi açık kalır.

# ProductSurfaces Step 3 — yerel inceleme dikey dilimi

Yalnız `Development` ortamı ve `ProductSurfaces:DevelopmentReview:Enabled=true` birlikte etkinse HTTP grubu açılır. Yerel kullanımda `ProductSurfaces__DevelopmentReview__Enabled=true` ortam değişkeni kullanılabilir; proje kökü standart API content root'tan çözülür, gerekirse `ProductSurfaces__DevelopmentReview__RepositoryRoot` ile açıkça belirtilir. Admin Vite proxy yalnız `/api/v1/admin/dev/product-surfaces` grubunu API `http://localhost:5003` adresine iletir (`PRODUCT_SURFACES_API_URL` yerel hedef override). CORS açılmadı. Admin'deki “Ürün yüzeyi incele (geliştirme)” erişimi yalnız Vite development modunda görünür, mobilde de kullanılabilir.

- Tek Tea Maker fixture oturumu süreç belleğindedir; API restart session/history/approval'ı sıfırlar. En fazla 100 revizyon ve istek başına 100 nokta desteklenir. Kalıcı/shared Asset sistemi kurulmadı.
- Başlangıçta doğrulanmış source ve RGBA mask byte snapshot'larıyla tek automatic pending aday oluşturulur. GET yeni aday üretmez. Runtime `DevelopmentReferenceMaskProvider`, test-assembly fake'ini kullanmaz; interactive çağrı yeni revision/candidate ve Keep/Exclude lineage kaydeder fakat aynı maskeyi döndürür. AI düzeltme kalitesi iddiası yoktur.
- Mutasyonlar exact session + expectedStateVersion + güncel revision/candidate hedefini ister. Süreç içi kilit altında kaynak kimliği tekrar doğrulanır, işlem uygulanır ve version artırılır. Stale işlemler 409 döner; Admin güncel durumu yükler, kararı otomatik tekrar göndermez.
- Reviewer sabit `development-local-reviewer`; istemciden kimlik alınmaz. Loopback/yerel Host ve mutasyonlarda izinli yerel Origin kontrolü ek geliştirme korumasıdır, production authentication değildir. Gelecek reviewer authenticated principal'dan gelmelidir.
- Admin noktaları yalnız React state'te toplar. Açık “Adayı yeniden oluştur” tek POST gönderir. Hata halinde noktalar korunur; başarıda yeni pending aday görüntülenir. Gönderilmemiş correction modunda approve/reject kapalıdır.
- Responsive contain dikdörtgeninde kaynak koordinat dönüşümü kullanılır; letterbox tıklamaları reddedilir, DPR kullanılmaz. PNG alpha CSS overlay ve HTML marker'lar aynı image rectangle içindedir. Test Chrome'unda `mask-mode` desteği yoktur; PNG için alpha kullanan WebKit CSS masking doğrulanmıştır. Canvas editor eklenmedi.
- Feature-local typed fetch adapter geçicidir; generated client ve tracked OpenAPI değiştirilmedi. Gerçek sağlayıcı, durable jobs, persistence, auth ve genel AuditLog sonraki ayrı işlerdir.
- Onay yalnız exact ürün/varyant/Asset media sürümünün görsel önizleme maskesine ilişkindir; PrintArea/DPI/üretim/D04 onayı değildir. SegmentationRevision müşteri DesignVersion değildir. Storefront Canvas renderer ve Fabric.js sorumluluğu değişmedi; bu dilim storefront'a bağlanmadı. D04/D05/D08/D10 ve diğer açık kararlar kapanmadı.

HTTP kökü: `/api/v1/admin/dev/product-surfaces/tea-maker-101-blue`.
GET `/review`, POST `/revisions`, POST `/revisions/{revisionId}/candidates/{candidateId}/review`, GET `/source`, GET `/revisions/{revisionId}/candidates/{candidateId}/mask`.
Malformed JSON/izin verilmeyen client alanları 400; semantik koordinat/istem hataları 422; bilinmeyen fixture/hedef 404; stale source/session/version/decision 409. Problem Details `requestId` ve `timestampUtc` taşır. Dosya yolları ve stack trace dönmez.

Kanıt: TST-080–086. Yeni paket yok. Production auth veya AI entegrasyonu kabulü yapılmadı.

## ProductSurfaces Step 4B-1 — yalnız mocked HTTP Roboflow adapter

`ISurfaceSegmentationProvider` ve domain/application sözleşmeleri değiştirilmedi. Infrastructure adapter PCS `/sam3/concept_segment` text prompt ve PVS `/sam3/visual_segment` source-pixel Keep/Exclude noktalarını JSON/base64 olarak serileştirir. Test authentication değeri yalnız sentetik placeholder'dır; gerçek credential kullanılmadı, görsel dışarı gönderilmedi, gerçek inference ve kasıtlı kredi tüketimi sıfırdır.

- Seçilen wire contract: PCS tek `prompt_results[0]` (`prompt_index=0`), PVS top-level `predictions`, prediction `format=rle`, `masks={size:[height,width],counts:...}`. COCO compressed counts ve integer runs desteklenir. Belgelerdeki farklı envelope/şema sürümleri otomatik tahmin edilmez. Deployed wire shape, WebP/orientation, decimal point kabulü ve billing/privacy davranışı ileride açık onaylı smoke testle doğrulanmalıdır; mock kanıt gerçek sağlayıcı kabulü değildir.
- COCO column-major membership RGBA PNG alpha 0/255'e dönüştürülür; exact size, run/overflow/allocation sınırları ve Step 2 structural validation uygulanır. SHA-256 .NET üzerinden hesaplanır. Representation conversion cleanup değildir; resize/crop/rotate/smoothing/morphology yoktur. Çoklu PCS sonuçlarında gerçek supplied score en yüksek olan, eşitlikte provider sırası seçilir; skor yoksa sıra kullanılır. Seçilen sıra/toplam sonuç/skor infrastructure evidence'ında tutulur; ticari approval değildir.
- `DevelopmentMaskBuffer` exact source + revision/candidate için immutable validated byte snapshot verir. Yalnız process memory'dir, API restart'ta kaybolur; ortak Asset/Variant sahipliği veya production storage değildir. Maske PrintArea/DPI/üretim onayı, revision DesignVersion değildir. Storefront renderer/Fabric.js/asset'ler değiştirilmedi veya bu akışa bağlanmadı.
- Mevcut development gate korunur. Yeni non-secret seçim anahtarları: `ProductSurfaces:Segmentation:Provider` (default `reference`), `ExternalInferenceEnabled` (default false), `Roboflow:BaseUrl` (default `https://serverless.roboflow.com`), `Roboflow:TimeoutSeconds` (default 60; 1–120). `Roboflow:ApiKey` yalnız options'ta gelecekteki server-secret alanıdır; Program bunu okumaz/bind etmez. Appsettings/.env/Vite key eklenmedi.
- Step 4B-1 runtime transport socket açamayan `OutboundDisabledHandler`'dır; enabled flag true olsa bile gerçek adapter activation yoktur. Adapter testlerinde HttpClient yalnız kontrollü fake handler ile inject edilir; default transport/fallback/retry yoktur. Eksik key reference modunu bozmaz. Gerçek HTTP composition/credential kullanımı bu adımda yapılmadı.
- Reference modunda convenient automatic candidate korunur. Roboflow seçiminde startup/GET/page-load yalnız source-only review oluşturur; inference çağrılmaz. “Aday oluştur” explicit automatic POST'tur; mevcut runtime'da güvenli disabled hatası döner. Başarılı mock sonuçları gerçek AI olarak gösterilmez.
- Short critical section state/source/input kontrolü ve revision başlangıcını yapar; provider çağrısı gate çıktıktan sonra başlar. HTTP await lock tutmaz; in-flight mutasyonlar 409 verir. Completion source/state tekrar doğrular, byte binding/display commit yapar. Başarı/hata/cancellation version ilerletir; önceki approval değişmez. Admin hata sonrası read-only refresh yapar, noktaları korur; karar/inference otomatik tekrar gönderilmez.
- Bounded 60 saniye deadline, cancellation, safe provider error kodları ve response limitleri vardır. Raw error body/key/base64/header exception veya Problem Details'e taşınmaz; adapter request loglamaz. Provider timeout önerisi/SLA doğrulanmış değildir. Production auth/jobs/persistence yoktur.

Kanıt TST-087: 111/111 backend/API regresyon; 5/5 Admin Playwright; Release 0 uyarı/0 hata; Admin typecheck/build/lint başarılı; OpenAPI unchanged. D04/D05/D08/D10 açık kaldı. Gelecekte gerçek execution exact source image'ı dış sağlayıcıya aktarır; retention/training koşulları henüz teyitli değildir. Credential configuration/use, dış medya transferi ve kredi tüketebilecek inference için kullanıcıdan ayrı açık onay gerekir. Smoke-test entry point eklenmedi.

### ProductSurfaces Step 4B-2 — single automatic Roboflow smoke test

Kullanıcı ayrı açık izinle yalnız Tea Maker source, `lower kettle body` prompt ve en fazla bir automatic çağrıyı yetkilendirdi; user-secrets kurulumunu ayrıca onayladı. Normal non-secret UserSecretsId API projesine eklendi. Key yerel/server-side kaldı; value okunup çıktılanmadı, config/secrets listelenmedi, Admin'e taşınmadı. Dış görsel aktarımı yalnız bu tek yetkili kaynak için yapıldı.

- Yeni `ProductSurfaces:Segmentation:SingleAutomaticSmokeEnabled` default false; live composition ayrıca Development review gate, Roboflow provider, ExternalInferenceEnabled ve secret ister. Normal reference startup değişmedi. Startup/GET/page-load inference yapmaz. Yalnız explicit automatic POST guarded transport'a ulaşır; source/version/dimension/SHA/prompt ve HTTP method/host/path/payload guard tarafından doğrulanır. Interactive provider operation yasaktır. Redirect/cookie/negotiated credential/retry middleware yok; process-local atomic sayaç ilk denemeden sonra kapanır. Restart yeni bütçe yetkisi değildir ve açık kullanıcı izni olmadan smoke yeniden çalıştırılamaz.
- Tek gerçek POST HTTP 200 / 1529 ms döndü; istek sayacı 1. PCS `prompt_results`, prediction `format:rle`, mask dictionary `size:[1600,1066]`, compressed `counts` String varsayımları doğrulandı. Parser düzeltmesi veya ikinci inference gerekmedi. 1 sonuç, seçilen index 0, gerçek supplied confidence 0.83984375; ticari correctness/onay skoru değildir.
- Normalize RGBA PNG 1066×1600; SHA-256 `6a7fe88baf2d0b5223476f1921650433443395e917c221fc396c6f75d7d7c3db`. Alpha min/max 0/255; transparent 1422315, opaque 283285, intermediate 0. Existing Step 2 empty/full/source validation geçti. Representation conversion dışında source re-encode/resize/crop/rotate/smoothing/morphology yapılmadı.
- Exactly one automatic pending revision/candidate development byte buffer'a bağlandı; active approval null. Review source `dev:tea-maker-101:blue:source:v1`, SHA `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414`; ürün/varyant/Asset fixture sınırı korundu. Teknik desktop/390px mobile alignment ve overflow kontrolleri geçti. Görsel kalite: lower body iyi ayrıldı, spout da dahil; alt boundary hafif pürüzlü. Bu candidate insan approval'ı almadı, PrintArea/üretim/D04 onayı değildir.
- GET-only safe `/smoke-evidence` yalnız enabled smoke development oturumunda bulunur; key/header/image payload/raw provider response içermez. Credential presence boolean, source identity, HTTP/shape/selection/mask/alpha kanıtı vardır. Exact credit consumption was not confirmed by the inference response.
- TST-088: smoke sonrası 120/120 mocked/local backend/API, 5/5 reference/mock Admin Playwright, API Release 0 uyarı/0 hata ve Admin type/build/lint başarılı. Test config smoke/external flags false, provider reference; SingleAutomaticSmokeTests yalnız explicit mock transport kullanır. OpenAPI korunmuştur. Yeni paket, production persistence/auth/jobs veya renderer bağlantısı yok.

Interactive PVS deployed wire contract henüz doğrulanmadı. Interactive deneyi, noktalar, yeni request budget ve dış transfer için yeni açık kullanıcı onayı gerekir; bu adımda interactive/ikinci automatic/retry yapılmadı. D04/D05/D08/D10 açık, retention/training şartları çözülmedi.
