# AI tasarım ve asistan davranış sözleşmesi

Sürüm: 0.1.0 · 02.10.2026 · F02-A05

Durum: Belge taslağı tamamlandı; uygulama/sağlayıcı PoC ve rol kabulü açık. Kaynak: Faz10 §1–5, Faz06, `analysis2-gap-matrix.md` K-14–K-21 ve ADR-002. Bu teslim gerçek AI çağrısı başlatmaz.

## Mevcut uygulama ve hedef akış

WEB-017 `/studio/ai/` 10–500 karakter demo istemi, tema/palet ve üç deterministik görsel düzen gösterir; sağlayıcı, kota, upload ve editöre aktarım bağlı değildir. WEB-018 `/asistan/` ve ana sayfa Nobi paneli temsili öneri sunar. Bunlar gerçek üretim veya destek devri kanıtı değildir.

Analiz2 hedefi: ürün/varyant seç → beş eksende beş soru → her soruda dört seçenek → dört kullanılabilir AI adayı → temsili ürün önizlemesi → seçili Asset'i editöre aktar. Beş eksenin metni/seçenekleri içerik onayı gerektirir; bu belge uydurmaz. Geri dönme seçimleri korur; önceki yanıt değişirse bağımlı cevaplar yeniden doğrulanır. Üretim kendiliğinden başlamaz, özet sonrası açık eylem gerekir. Mevcut üç demo kartının dört gerçek aday koşulunu karşılamadığı açık teslimdir.

İkinci yol ürün/varyant seç → kendi görselini yükle → güvenli medya doğrulaması → aynı önizleme/editör akışıdır. Kendi görselini yüklemek AI üretim kotasını otomatik tüketmez; ücretli düzenleme ayrı açık eylemdir.

## İş, sonuç ve aktarım sözleşmesi

| Alan | Davranış |
|---|---|
| İstek | `variantId,printAreaId,prompt?,answers,questionnaireVersion,policyVersion,idempotencyKey` önerisi; OpenAPI aşamasında kesinleşir |
| İş | `jobId,status,requestHash,promptVersion,errorCode`; sağlayıcı kimliği istemci sırrı değildir |
| Aday | `assetId,jobId,mime,pixelSize,moderationStatus`; yetkili kısa ömürlü medya erişimi |
| Kullanım | Sunucunun dönem/limit ve maliyet bilgisi; kota rezerve/kesinleştir/iade politikası D08'e bağlı |
| Aktarım | Seçili `assetId`, hedef design/variant/area ve baseVersion; yeni değişmez tasarım sürümü |

Cloudflare Workers AI seçimi AI-P01 ile onaylıdır. Model, fiyat, lisans, veri bölgesi ve düzenleme yeteneği burada kesinlenmez; Faz10 resmi doküman/PoC ile doğrular. Sunucu `IImageGenerationProvider` ve `IImageEditingProvider` sınırını korur; tarayıcı sağlayıcı secret'ı almaz.

Üretim önerisi `POST /api/v1/ai/design-jobs`, izleme `GET /api/v1/ai/design-jobs/{id}`; varyasyon ve edit ayrı işlerdir. Sahiplik, moderasyon, limit ve request hash sunucuda doğrulanır. İstek yanıtı kaybolunca yeni anahtarla üretim yerine mevcut iş sorgulanır. Aynı anahtar farklı içerikle gönderilirse çatışma gösterilir. Polling durdurulması sağlayıcı işini iptal etmiş sayılmaz; iptal yalnız sunucu onayıyla gösterilir.

## Durum matrisi

| Durum | Kullanıcıya gösterilen sonuç / eylem |
|---|---|
| İlk / eksik giriş | Sorular ve eksik alan açıklaması; üretim kapalı |
| Gönderiliyor / queued / running | Busy, iş durumu; ikinci maliyetli istek engellenir |
| Uzun sürüyor | Gerçek iş durumu, güvenli ayrılma/yeniden sorgulama; sahte yüzde verilmez |
| Kısmi sonuç | Hazır adaylar ve eksik sayı açıklanır; dört kullanılabilir aday kabulü kapanmaz |
| Başarılı | Kullanılabilir adaylar seçilebilir; AI ve “Temsilidir” açıklamaları görünür |
| Limit / içerik reddi | Açık neden ve izinli düzeltme; otomatik yeniden üretim yapılmaz |
| Sağlayıcı hatası / belirsiz sonuç | Taslak korunur; önce iş sorgula, sonra izinli güvenli retry |
| İptal istendi / cancelled | Sunucu teyidi ayrılır; maliyet iadesi yalnız doğrulanmış politika ile gösterilir |
| Aktarılıyor / aktarım hatası | Aynı Asset korunur; üretim yeniden başlatılmaz |

Aktarım yalnız hazır, moderasyondan geçmiş ve sahipliği doğrulanmış Asset içindir. AI çıktısı düz görsel katmanıdır; otomatik katman ayrıştırma vaat edilmez. Baskı uygunluğu sunucuda D04 ile ayrıca değerlendirilir. Varyant değişikliği önceki çıktının uyumluluğunu yeniden kontrol eder. Background removal/enhance/extend/color-variation ancak seçili model yeteneği ve politika doğrulanınca etkinleşir; her düzenleme yeni Asset üretir.

## Nobi ve satış asistanı

WEB-018/Nobi ihtiyaç sorusu → onaylı kaynaklardan öneri → katalog/ürün veya WEB-015 teklif yönlendirmesi sağlar. Fiyat/stok/teslimat bilgisi güncel sunucu verisi ve doğrulama zamanı taşır; eksik bilgiyle kesin söz verilmez. Taslak/süresi dolmuş bilgi kaynağı yanıta girmez. Kullanıcı metni araç/yetki talimatı olarak çalıştırılmaz.

Durumlar boş, mesaj gönderiliyor, yanıt, kaynak bulunamadı, hata, limit, insan devri bekliyor ve devir tamamlandıdır. Mesaj tekrarında aynı message kimliği kullanılır. Destek erişimi yokken çalışan devir düğmesi sunulmaz. Lead için gerekli alanlar ve D10 rızası ayrı toplanır; konuşma kendiliğinden ticari lead sayılmaz. ADM-012 yalnız yetkili kullanıcıya politika/prompt sürümü, kullanım/maliyet, hata ve devir kuyruğu gösterir; secret değeri gösterilmez, mutasyon auditlidir.

## Erişilebilirlik, mobil ve açık kararlar

Sorular `fieldset/legend` ve dört adlandırılmış seçimle; adım “3/5” metniyle sunulur. Aday seçimi `aria-pressed`; sonuç güncellemesi `aria-live=polite`, odak kendiliğinden karta atlamaz. Hata özetinden alana gidilir. 320/390 px tek kolon, 768 px esnek galeri, 1024/1440 px giriş ve sonuç kolonları hedeflenir. Yükleme animasyonu reduced-motion'a uyar. MOB-006 arka plandan dönüşte jobId ile durumu sorgular; push/deep-link D09 ve sahiplik doğrulaması gerektirir.

D05 erişim ve destek; D08 soru içeriği, dört adayın kalite tanımı, kota/maliyet ve moderasyon; D10 veri aktarımı/saklama/rıza; D04 baskı; D09 mobil izinler kapanmalıdır. Soru akışı ve dört aday Analiz2 tasarım hedefidir; fiyat/kota veya müşteri politika onayı yerine geçmez.

## Kabul vektörleri

1. Beş sorunun her biri dört seçenek sunar; geri/ileri ve yanıt değişimi doğru özet verir.
2. Çift tıklama veya cevap kaybı tek sağlayıcı işi ve tek kota hareketine çözülür.
3. Dört kullanılabilir aday tamamlanmadan kısmi sonuç tamamlandı diye gösterilmez.
4. İçerik reddi/limit/hata ayrı açıklanır; hiçbirinde otomatik ücretli tekrar olmaz.
5. Aktarım hatasında aynı Asset yeniden kullanılır; farklı müşterinin Asset'i reddedilir.
6. AI aktarımı baskı onayı sayılmaz; siparişe bağlanan önceki tasarım sürümü değişmez.
7. Kaynaksız fiyat/stok sorusunda Nobi belirsizliği açıklar; izinsiz devir/lead oluşturmaz.
8. Mobil arka plan/bağlantı kesintisi sonrası mevcut jobId sorgulanır; yeni üretim başlamaz.

Bu vektörler Faz10 uygulama kabulü içindir; mevcut demo veya bu belgeyle başarılı ilan edilmez.
