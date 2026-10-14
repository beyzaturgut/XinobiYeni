# Faz10 — AI tasarım üretimi, satış asistanı ve AI yönetim paneli

**Bağlayıcı kaynak:** `Xinobi_Proje_Kapsami(4).md` AI maddeleri ve `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §2, §3.1, §4/D05–D08/D10, §5–6, §8. **Tek yürütme ve kesinti kaydı:** `Faz00_Proje_Takip_ve_Kesintiden_Devam.md`. Bu fazdaki örnek yollar ve uçlar gerçek repo keşfine göre Faz00'da eşlenir. Model/sağlayıcı, fiyat, seçenek sayısı veya sabit kapasite ürün sahibinin D05/D08 kararı olmadan kesin kabul edilmez.

## 1. Başlama kapısı ve akış

Faz03 kimlik/rol, API, worker, kontrollü medya depolama; Faz04 yayınlanmış ürün/varyant, fiyat/stok/kampanya ve CMS; Faz06 sürümlü editör ve baskı alanı; Faz07 teklif/lead hedefi gerekir. D05 AI hizmeti ve destek/WhatsApp erişimi, D08 seçenek sayısı/limit/içerik/maliyet/düz görsel-katman biçimi, D04 baskı standardı, D07 kurumsal yönlendirme, D10 rıza/saklama müşteri kayıtları görülür. Erişim yoksa sağlayıcı arayüzü ve fixture çalışılır; gerçek AI çıktısı veya destek devri kabulü yazılmaz. Tüm üretim kullanıcının açık tasarım talebiyle başlar; asistan yalnız onaylı kaynaklardan bilgi verir. AI içeriği kullanıcıya düzenlenebilir görsel varlık olarak editöre girer; katmanlara ayırma sağlanmıyorsa vaat edilmez.

**Sınır:** Yeni görüntü modeli eğitimi, CRM ürünü veya ayrı çağrı merkezi eklenmez. Maliyet/limit ve bilgi güvenliği bu iki işlevin parçasıdır.

**AI-P01 — Cloudflare Workers AI onaylandı:** Proje sahibi 01.10.2026'da Cloudflare Workers AI'ı AI görsel sağlayıcısı olarak seçti. Entegrasyon `IImageGenerationProvider` ve `IImageEditingProvider` arkasında kalır; istemciler Cloudflare'ı doğrudan çağırmaz. Faz10 başlangıcında FLUX ailesindeki güncel uygun model, ticari lisans, image-to-image/edit sınırı, dört aday kalitesi, moderasyon, veri kullanımı/bölgesi, fiyat/kota, gecikme ve çıktı formatı resmi doküman ve PoC ile doğrulanır. Model adı şimdiden kalıcı kod sözleşmesine gömülmez. API hesabı, secret, adaptör ve ücretli çağrı yalnız 10.01–10.05 sırası ve D05/D08/D10 kapılarıyla eklenir.

**Sıra dışı erken entegrasyon (2026-10-06, `3db452e`):** Cloudflare Workers AI REST adaptörü (`@cf/black-forest-labs/flux-1-schnell`), yerel günlük 30 üretim limiti ve ücretli çağrı bu kapılardan önce, yalnız Development/loopback için eklendi. Bu kod Faz10 kabulü değildir. Faz10 başlarken 10.01A PoC ve D05/D08/D10 kararlarıyla yeniden değerlendirilir; model adının sözleşmeye gömülmemesi, sahiplik, moderasyon ve saklama eksikleri kapatılır. İstisna kararı Faz00 §6'da ADR-002 eki olarak yazılmalıdır.

## 2. Sözleşme, veri ve tasarım handoff'u

Örnek yerleşim: `services/api/Modules/AiDesign`, `services/api/Modules/AiAssistant`, `services/worker/AiJobs`, `apps/web/features/ai-design`, `apps/web/features/assistant`, `apps/admin/features/ai`, `packages/contracts/openapi`, `tests/ai`; Faz00 gerçek yolları taşır. Backend sağlayıcıya göre `IImageGenerationProvider`, `IImageEditingProvider`, `IAssistantProvider` adaptörlerini ayırır; yönetim paneli sır değil ayar referansı gösterir. Prompt sürümleri, model seçimi, sağlayıcı cevap referansları ve izleme alanları soyut sözleşmeyle tutulur; müşteri girdisi beklenmedik şekilde sağlayıcıya sınırsız veri göndermez.

| Kavram | Asgari alan ve bütünlük |
|---|---|
| `AiJob` | `id, userId, designId?, variantId, printAreaId, type, requestHash, status, promptVersion, providerRef, createdAt, finishedAt, errorCode`; durumu `queued/running/succeeded/failed/cancelled`, sahiplik kontrolü ve aynı anahtarla çift üretim koruması |
| `GeneratedAsset` | `jobId, sourceAssetId?, mediaRef, type, mime, pixelSize, moderationStatus, providerRef`; dosya nesne depoda, erişim süreli/yetkili; düzenleme sonucu önceki dosyayı silmez |
| `AiUsage` ve limit | `userId, jobId, feature, units, currency, estimatedCost, billedCost?, period, policyVersion`; rezerve/kesinleştir/iade hareketleri; çift callback çift kota tüketmez |
| `KnowledgeSource` | `kind, sourceRef, version, approvedBy, approvedAt, publishedAt, status, lastSyncAt`; taslak veya süresi dolmuş kaynak yanıt üretimine girmez |
| `QuestionBank` / `Question` / `AnswerOption` / `AnswerMapping` | XINOBI U beş eksenli soru havuzu: `bankVersion, axis, questionId, contextVariant, status`; seçenek anlam grubu ve ifade varyasyonları; seçenekten izinli semantik tasarım tercihine eşleme. Yayınlanmış sürüm değişmez, kimlikler korunur; `AiJob` hangi havuz sürümüyle üretildiğini taşır |
| `SurveySession` | `sessionId, userId?, variantId, bankVersion, selectedQuestionIds, selectedOptionIds, answersHash, expiresAt`; aynı oturum ve yanıt hash'i aynı işi döndürür |
| `AiConversation` / `AiMessage` / `Lead` | Kanal, kullanıcı/anonim oturum, görünürlük, kaynak referansları, geri bildirim, lead rıza ve asistan-insan devir durumu; gerçek kişisel veri ve saklama D10'a göre |

API önerisi: `POST /api/v1/ai/design-jobs` (prompt, tema, renk, stil, sektör, kullanım alanı, ürün tipi/`variantId`, `printAreaId`, `idempotencyKey`); `GET /ai/design-jobs/{id}`, `GET /ai/design-jobs?mine`, `POST /ai/design-jobs/{id}/variations`, `POST /ai/assets/{id}/edits` (`remove-background|enhance|extend|color-variation`, doğrulanmış parametrelerle), `POST /designs/{id}/assets` (AI varlığını yeni tasarım sürümüne aktar). `POST /ai/conversations`, `POST /ai/conversations/{id}/messages`, `POST /ai/conversations/{id}/handoff`, `POST /ai/conversations/{id}/lead`, `POST /ai/conversations/{id}/feedback`. Panel için rol korumalı `GET/PUT /api/v1/admin/ai/settings`, `/prompts`, `/knowledge-sources`, `/usage`, `/costs`, `/failures`, `/conversations`, `/leads`, `/handoffs`; gerekli denetim kaydı ve sayfalama. İsimler taslak OpenAPI sözleşmesidir; Faz03 konvansiyonu geçerlidir. `POST /messages` asistan cevabı için `messageId`, kaynak ID'leri, ürün/varyant ID ve doğrulama zamanı taşır; güncel stok/fiyat son sunucu sorgusuna bağlıdır.

**Creative → UI/UX/Frontend:** Creative; web ve mobil için istem formu (tema/renk/stil vb.), alternatif galerisi, yükleniyor/kuyruk/yeniden dene/limit/moderasyon/hata, kaynak/AI uyarısı, editöre aktarım, asistan arama ve ürün kartı, karşılaştırma, teklif/lead/rıza ve insan devri, panel rapor/ayar tasarımını token, asset, durum ve etkileşim açıklamalarıyla teslim eder. Frontend handoff kabulü/eksikleri Faz00'a kaydeder, responsive ve klavye/ekran okuyucu akışını uygular; mobil uyarlama Faz11'de aynı API ile tamamlanır.

## 3. Sıralı uygulama işleri

| ID | Görev ve çıktı | Doğrulama |
|---|---|---|
| 10.01 | BA ve PM D05/D08/D10'u, prompt ve bilgi yayını yetkilisini, kullanıcı limit dönemi/ücretsiz hak/yenileme, maliyet tavanı, uygunsuz içerik politikası, sağlayıcı veri kullanımını ve handoff adreslerini iş sahibiyle kaydeder. | D kararlarının sahibi/kanıtı, örnek kabul senaryoları ve blokaj Faz00'da. |
| 10.01A | CTO Advisor seçilmiş Cloudflare Workers AI için güncel model/yetenek/lisans/veri/fiyat doğrulamasını, PoC test setini ve sağlayıcıdan çıkış planını sunar. | `AI-P01 ONAY` Faz00/ADR-002'de; gerçek adaptör ancak D05/D08/D10 ve PoC kapılarıyla. |
| 10.02 | Creative tasarım paketi üretir; FE UI/UX etkileşim ve erişilebilirlik kabulünü kaydeder. | Her AI işi bekliyor, çalışıyor, başarı, hata, tekrar, uygunsuz ve kota dolu görünür; tutar/teslimat kesin vaat edilmez. |
| 10.03 | DBA migration ile AI tablolarını, kullanıcı sahiplik ve referans bütünlüğünü, geçmiş ve kullanım indekslerini kurar; medya depolama yaşam döngüsü D10'a bağlanır. | Migration geri alınabilir, aynı job/callback iki varlık veya iki tüketim yaratmaz. |
| 10.04 | BE prompt/parametre doğrulama, moderasyon (girdi ve çıktı), kullanıcı ve servis limitini transaction ile ayırma, worker kuyruğu, başarısızlıkta kota iadesi ve ücret ölçümünü kurar. | Eşzamanlı talepler kotayı aşmaz; iş tekrarında ikinci sağlayıcı isteği/ücret engellenir veya mevcut durum sorgulanır. |
| 10.05 | BE metin, kullanım alanı, sektör, tema, renk, stil ve ürün tipinden tasarım işini; D08 sayıda alternatif ve tasarım varyasyonunu uygular. Arka plan kaldırma, iyileştirme, genişletme ve renk varyasyonunu ayrı izlenen işler yapar. | Her çıktı öncesi/sonrası medya ID ile izlenir; uygun olmayan görsel reddedilir; sağlayıcı hatası ve zaman aşımı açıkça görünür. |
| 10.06 | Full Stack + FE üretileni seçili ürün/varyant ve fiziksel baskı alanında önizler, yeni DesignVersion'a ekler, kaydeder ve Faz06 baskı kontrolüyle onaylar. | Sepet/sipariş aynı değişmez sürüme referans verir; AI varlığı yoksa sipariş tamamlanmış görünmez. |
| 10.07 | BE onaylı CMS/katalog/iade/sipariş içerikleriyle sürümlü bilgi kaynağı yönetimini, ürün veri senkronizasyonunu ve kaynak bağlantılı cevaplamayı kurar. Anlık fiyat/stok/kampanya/teslimat sorgusunu yalnız yetkili API'den alır. | Taslak/eski içerik sızmaz; uydurma ürün, indirim veya kesin termin önerilmez; yetkisiz sipariş sorgusu reddedilir. |
| 10.08 | FE/BE doğal dil arama, ihtiyaca/amaç/bütçe/adede göre öneri, kişiselleştirilebilir/alternatif/tamamlayıcı/kampanyalı ürün, karşılaştırma, kurumsal teklif formuna aktarım, açık rızalı lead, WhatsApp bağlantısı ve mevcut canlı desteğe insan devrini uygular. | Kaynak ürün ID'si geçerli; teklif formu Faz07 kayıtlarına bağlanır; devredilmiş sohbet açıkça kullanıcıya bildirilir; kanal erişimi yoksa sadece test bağlantısı. |
| 10.09 | Admin paneli prompt/model-servis ayarları, bilgi onay/yayın, senkron durumu, limit, görüşme/lead/geri bildirim/handoff, kullanım, maliyet ve başarısız yanıt raporunu yetkiye bağlar. | Gizli anahtar ve ham kişisel veri görünmez; ayar değişimi audit ve sürüm taşır; rapor dönem/kullanıcı filtresi gerçek kullanım hareketleriyle uyuşur. |
| 10.09A | BE + FE XINOBI U soru havuzu yönetimini panele taşır: eksen, soru, bağlam varyasyonu, seçenek anlam grubu/ifade varyasyonu ve semantik eşleme düzenleme; taslak → önizleme → yayın sürümleme; havuz yeterliliği (eksen başına asgari soru, her soruda dört seçenek) doğrulaması. Bugünkü `services/api/DesignStudio/question-bank.json` (`xinobi-u-1`, 500 soru) ilk yayın sürümü olarak içe aktarılır. | Yayınlanmış sürüm düzenlenemez, yeni sürüm açılır; eşlemesi eksik seçenek yayınlanamaz; serbest prompt metni eşlemeye giremez; değişiklik audit taşır. |
| 10.09B | Full Stack XINOBI U ve Nobi'yi Faz00 T-09 özellik bayrağına bağlar (Analiz2 §22.3). | Bayrak kapalıyken giriş noktaları gizlenir, API iş kabul etmez, katalog ve ticaret etkilenmez; sağlayıcı kesintisinde bayrak kapatılabilir. |
| 10.10 | Full Stack web uçtan uca ve mobil sözleşme testlerini çalıştırır; PM rol kanıtlarını, müşteri kararı ve kullanım/maliyet kontrolünü ayrı kapatır. | Aşağıdaki kabul kanıtı Faz00'da dosya/komut/sonuç olarak yer alır. |

## 4. Test ve kabul kanıtı

- **Mock:** deterministik sağlayıcı fixture'ında alternatifler, varyasyon ve dört düzenleme işlemi, seçim ve editör aktarımı; içerik reddi, 429/5xx, sağlayıcı timeout, worker restart, aynı callback/istek tekrarları, kota yarışını doğrula. `MOCK` etiketi koy.
- **Gerçek sandbox/deneme:** D05/D08 erişiminde onaylı bir ürün ve baskı alanı için çıktı üret, arka plan kaldır/iyileştir/genişlet/renk varyasyonu, editörde kaydet/yeniden aç, baskı dosyasını D04 standardıyla kontrol et; gerçek sağlayıcı kullanım/maliyetini limit ve panelle karşılaştır. Veri işleme ve gizlilik kararı olmadan gerçek müşteri verisini gönderme.
- **Asistan:** stok bitmiş, fiyat değişmiş, geçersiz kampanya, kaynak dışı teslim vaadi, başka kişinin siparişi, zararlı prompt injection, boş sonuç, satış/kurumsal niyet, WhatsApp ve canlı destek devri; web ve mobil için sözleşme/ekran. Yanıt kaynakları izlenir, canlı veriyle çelişirse link ve yönlendirme verilir.
- **Yönetim:** yetkisiz kişi prompt/lead/kayıt göremez; yayın onayı olmadan içerik yanıtlanmaz; limit, rapor ve hata analizi ile audit eşleşir. D10 saklama/silme örnekleri doğrulanır.

Kanıt paketi: müşteri D05/D08/D10 kayıtları; Creative handoff ve FE kabulü; migration ve OpenAPI farkı; otomatik test komutları/sonuçları; gerçek sağlayıcı iş/ücret referansları maskelenmiş örnek; ürün-tasarım-sipariş sürümü; asistan kaynak/lead/devir UAT ekranları; güvenlik ve yetki testleri. Gerçek servis yoksa bu faz `Bloke` kalır; mock çıktısı canlı kabul yerine yazılmaz.

## Uygulama durumu — 14.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~50 % · kalan ~50 % · Statü: Devam (D05/D08/D10 açık)**

| ID | Durum | Kanıt / eksik |
|---|---|---|
| 10.01 | Bloke | D05/D08/D10 kararları yok |
| 10.01A | Kısmi | ADR-002 + Ek A/B/C; CTO PoC ve çıkış planı kaydı yok |
| 10.02 | Kısmi | `design/ai-spec.md`, `docs/xinobi-u-art-direction.md` (`324d129`); FE kabul kaydı yok |
| 10.03 | Kısmi | AI verisi özellik belgelerinde (0004); XINOBI U oturumları SQL’de değil |
| 10.04 | Kısmi | Günlük üretim sınırı (30/gün); moderasyon, transaction’lı kota ve ücret ölçümü yok |
| 10.05 | Kısmi | Anket → Cloudflare üretim (web+mobil); alternatif sayısı D08, arka plan kaldırma/genişletme yok |
| 10.06 | Kısmi | Onaylı yüzeyde önizleme, hesaba kaydet, sepete ekle (`49d3f35`); `DesignVersion`/baskı kontrolü Faz06’ya bağlı |
| 10.07 | Kısmi | Nobi katalog bilgisi, bilgi kaynağı yönetimi; canlıda 503 (DEPLOY-010 bekliyor) |
| 10.08 | Kısmi | Öneri, lead, insana devir; WhatsApp numarası yok |
| 10.09 | Kısmi | Panel AI politika/bilgi/konuşma/lead/kullanım ekranları |
| 10.09A | Yok | Soru havuzu yönetimi panelde yok |
| 10.09B | Kısmi | `XinobiU:Enabled` ve `Features:*` ayarları; T-09 resmi bayrak mekanizması yok |
| 10.10 | Yok | Rol/PM kapısı ve maliyet kontrolü |

## 5. Kesintiden devam ve rol kapıları

Faz00'a son doğrulanmış commit/test, aktif iş ID/job status, kota rezervasyonu, providerRef, worker son deneme ve hata, prompt/kaynak sürümü, açık D kararı, sonraki **tek** güvenli işlem yaz. Yeniden başlarken `git status`, migration, iş DB kaydı ve sağlayıcı durumunu kontrol et; aynı üretim isteğini kör tekrar edip çift masraf çıkarma. Sağlayıcı sonuç vermiş ama callback kaybolmuşsa durumunu uzlaştır, sonra kota kesinleştir/iade et. Görüşme/lead tekrarında mevcut ID'yi sorgula. Gizli anahtar, prompt içine konmuş kişisel veri ve müşteri konuşması Faz00'a yapıştırılmaz.

| Rol | Faz10 uygulama incelemesi; gerçek kişi/tarih/kanıt Faz00'a | Karar |
|---|---|---|
| İş Analisti | AI kapsamı, karar, rıza, öneri/teklif ve kullanıcı UAT | BEKLİYOR |
| Sr. Creative Designer | Tasarım/AI kullanıcı ve panel handoff; UI/UX durumları | BEKLİYOR |
| Sr. Frontend Developer | Handoff kabulü, web/panel etkileşimi, editör bağlantısı | BEKLİYOR |
| Sr. Backend Developer | Moderasyon/limit, sağlayıcı ve bilgi kaynağı güvenliği | BEKLİYOR |
| DB Admin | Migration, kayıt/limit atomikliği, yetki ve saklama | BEKLİYOR |
| Sr. Full Stack Developer | Web-mobil sözleşme, gerçek uçtan uca, maliyet/devir | BEKLİYOR |
| CTO Advisor (ek zorunlu rol) | AI-P01 PoC, model/lisans/veri/fiyat doğrulaması, erken entegrasyonun yeniden değerlendirilmesi ve çıkış planı | BEKLİYOR |
| **Proje Yöneticisi — zorunlu son kapı** | **Altı inceleme, gerçek servis kanıtı, D05/D08/D10, Creative handoff, müşteri UAT ve Faz00; eksikte RED** | **BEKLİYOR** |

Belge incelemesi gerçek uygulama onayı değildir; bu kutular şimdiden işaretlenmez.
