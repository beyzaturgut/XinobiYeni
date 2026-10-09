# ADR-002 — AI görsel sağlayıcısı: Cloudflare Workers AI

- Tarih: 01.10.2026
- Durum: Kabul edildi
- Karar sahibi: Proje sahibi
- Uygulama fazı: Faz10

## Karar

Xinobi'nin AI destekli görsel üretimi için sağlayıcı **Cloudflare Workers AI** olacaktır. Sağlayıcı seçimi onaylanmıştır; hesap, kimlik bilgisi, SDK/REST adaptörü, model ve ücretli çağrı henüz eklenmemiştir. Entegrasyon Faz10 sırası ve D05/D08/D10 karar kapılarıyla yapılır.

## Mimari sınır

- Web ve Flutter Cloudflare'ı doğrudan çağırmaz; çağrılar ASP.NET Core API/worker üzerinden yürür.
- Sağlayıcı `IImageGenerationProvider` ve `IImageEditingProvider` arkasında tutulur.
- Dış API sözleşmesi Cloudflare model adını istemciye taşımaz; uygulama `draft`, `variation`, `edit` gibi yetenek ister.
- Her işte dahili `jobId`, idempotency anahtarı, provider request ID, model/sürüm, prompt sürümü, asset checksum, maliyet/kullanım, moderasyon, retry ve hata kaydı tutulur.
- Ham prompt veya müşteri görseli normal uygulama loguna yazılmaz; secret yalnız sunucu tarafındaki güvenli yapılandırmada tutulur.

## Faz10 uygulama öncesi doğrulama

Güncel Cloudflare model ve fiyatları değişebileceği için entegrasyon gününde resmi belgeler yeniden incelenir. PoC en az Türkçe istem, ürün referansına sadakat, dört kullanılabilir alternatif, renk varyasyonu, seçili alanı koruyan edit, çıktı çözünürlüğü, p50/p95 süre, tekrar oranı, kabul edilen çıktı başına maliyet, moderasyon, ticari lisans ve veri işleme koşullarını ölçer.

Başlangıç araştırma kaynakları:

- Workers AI model kataloğu: <https://developers.cloudflare.com/workers-ai/models/>
- FLUX.2 Klein 4B: <https://developers.cloudflare.com/workers-ai/models/flux-2-klein-4b/>
- Workers AI fiyatlandırma: <https://developers.cloudflare.com/workers-ai/platform/pricing/>
- Workers AI veri kullanımı: <https://developers.cloudflare.com/workers-ai/platform/data-usage/>

## Sonuçlar ve açık sınırlar

- Sağlayıcı seçimi tamamlandı; kesin model ve kapasite PoC sonucunda sabitlenir.
- Cloudflare'ın desteklemediği bir düzenleme yeteneği varmış gibi vaat edilmez; gerekiyorsa kapsam kullanıcı kararına geri taşınır.
- AI çıktısı doğrudan baskıya gitmez; Faz06 baskı alanı, çözünürlük, taşma ve insan kalite kapısından geçer.
- Bu ADR, D05 erişim/sözleşme, D08 kota/maliyet/içerik ve D10 rıza/saklama kararlarını kendiliğinden kapatmaz.

## Ek A — Faz10 öncesi yerel entegrasyon istisnası (07.10.2026)

- Durum: Kabul edildi · proje sahibi onayı 07.10.2026 (sohbet onayı: "onaylıyorum"); yalnız Development denemesi kapsamında
- Uygulama: 06.10.2026, `3db452e` (API), `d7870f0` (web); kanıt `test/2026-10-06/TST-XINOBI-U-live.md`

**Ne oldu:** Bu ADR'deki "adaptör ve ücretli çağrı Faz10 sırasıyla eklenir" sınırına rağmen, XINOBI U akışının gerçek görselle denenmesi için kullanıcı isteğiyle Cloudflare Workers AI REST adaptörü eklendi ve iki gerçek üretim çağrısı yapıldı. D05/D08/D10 kararları ve Faz10 10.01A PoC henüz yapılmadı.

**Mevcut sınırlar (kodla doğrulandı):**

- `CloudflareImageProvider`, `IImageGenerationProvider` arkasındadır; model `@cf/black-forest-labs/flux-1-schnell` yalnız adaptör içinde sabittir, istemciye ve dış sözleşmeye çıkmaz. `IImageEditingProvider` henüz yoktur.
- Uçlar yalnız `Development` ortamında kayıtlıdır ve loopback dışı isteğe 403 döner; production'da bulunmaz.
- Kimlik bilgileri git dışı `appsettings.Local.json` veya ortam değişkeninde, yalnız sunucu tarafında tutulur; yoksa gerçek üretim kapalı gösterilir.
- Yerel günlük limit 30 üretim, tek worker sıralı işleme, 120 saniye sağlayıcı zaman aşımı; iş anket ve yanıt hash'iyle idempotenttir, belirsiz çağrı otomatik tekrarlanmaz.
- İstemciden serbest prompt alınmaz; yanıtlar sunucuda izinli semantik tercihlere eşlenir.

**Bu istisnanın kapsamadığı ve Faz10'da kapatılacaklar:** gerçek kullanıcı kimliği ve sahiplik (şu an 256-bit oturum anahtarı), girdi/çıktı moderasyonu, D10 saklama ve silme politikası, kullanıcı bazlı limit ve maliyet kaydı (`AiUsage`), panel yönetimi, ticari lisans/veri kullanımı doğrulaması ve PoC ile model seçimi. ADR-002'de araştırma adayı olarak FLUX.2 Klein 4B geçerken uygulamada flux-1-schnell kullanıldı; seçim PoC'de yeniden değerlendirilir.

**Karar (önerilen):** Yerel adaptör Development denemesi olarak kalabilir; production'a, staging'e ya da müşteri verisine açılması Faz10 kapısından geçmeden yapılmaz. Proje sahibi bu istisnayı onaylamazsa adaptör özellik bayrağıyla (Faz00 T-09) kapatılır.

## Ek B — Test sunucusunda XINOBI U istisnası (08.10.2026)

- Durum: Kabul edildi · proje sahibi onayı 08.10.2026 (sohbet: "xinobi u yu aç"); yalnız test sunucusu `109.104.120.91` (web `:8014`, API `:8024`) kapsamında
- Gerekçe: Ek A uçları yalnız Development'ta açıktı; web ve APK test sunucusunda XINOBI U'yu deneyemiyordu (anket dahil 503).

**Sınırlar (kodla doğrulandı, `DesignStudioAccess`):**

- Production'da varsayılan kapalıdır; yalnız `XinobiU:Enabled=true` ile açılır. Bayrak yoksa davranış Ek A ile aynıdır (503 / uç yok).
- Açıkken loopback zorunluluğu kalkar; tarayıcı `Origin` başlığı yalnız `XinobiU:AllowedOrigins` listesindeyse (test web sitesi) kabul edilir, CORS da yalnız bu kökene açılır. Origin göndermeyen istemciler (mobil uygulama) kabul edilir; bu bir kimlik doğrulaması değildir.
- Maliyet sınırı: sunucu genelinde günlük 30 üretim (`DesignStudio:DailyGenerationLimit`), adres başına dakikada 120 istek, tek worker, 120 sn zaman aşımı, idempotent üretim (Ek A ile aynı).
- Ürünler test sunucusundaki katalog anlık görüntüsünden okunur; oturum ve görseller API klasörü dışındaki `DesignStudio:DataDirectory` klasöründe tutulur.
- Cloudflare kimlik bilgileri paket veya Git'e girmez; sunucuda `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` makine ortam değişkenleridir.

**Kabul edilen risk:** Uçlar kimliksiz ve internetten erişilebilir; herkes günlük limite kadar üretim tetikleyebilir ve moderasyon yoktur. Ek A'daki Faz10 maddeleri (kimlik, moderasyon, saklama, kullanıcı bazlı limit/maliyet kaydı) bu istisnayla kapanmış sayılmaz. Gerçek müşteri trafiğine açılmadan önce bayrak kapatılır veya Faz10 kapısı tamamlanır.

## Ek C — Nobi satış asistanında metin modeli (09.10.2026)

- Durum: Uygulandı; proje sahibinin 09.10.2026 talebiyle ("AI satış asistanı (Nobi): gerçek yanıt … yap"). Development'ta açık; test sunucusu ve production için ayrıca karar gerekir.
- Uygulama: `services/api/Assistant/*` (`d800931`), web `components/nobi/*`; doğrulama: .NET `AssistantTests` (sahte model) ve 09.10.2026'da yerel API üzerinden tek gerçek çağrı (`@cf/meta/llama-3.1-8b-instruct`, yanıt AI kaynağıyla döndü).

**Sınırlar (kodla doğrulandı):**

- Model aynı Cloudflare hesabını kullanır (`Cloudflare:AccountId/ApiToken`, git dışı); `Assistant:ExternalInferenceEnabled=false` kapatır. Model adı panel politikasından gelir ve `@cf/üretici/model` biçimi dışında URL'ye girmez.
- Modele yalnız sunucunun kurduğu yönerge, katalogdan seçilen en fazla 6 ürünün olgusu (ad, kategori, fiyat, stok metni, renk, özellik), onaylı ve süresi geçmemiş bilgi kaynakları, son 6 mesaj ve müşterinin mesajı gider. Fiyat, stok ve ürün kartları her zaman katalogdan üretilir; modelin andığı ama verilmeyen ürün kimlikleri atılır.
- Günlük AI yanıt sınırı (varsayılan 200), konuşma başına 30 ve cihaz başına günde 100 mesaj; sınırda veya hata halinde kural tabanlı yanıt verilir. Her çağrı `AiUsage` kaydına token sayısıyla yazılır; maliyet panelde girilen birim fiyatlarla tahmin edilir, fatura değildir.
- Konuşmalar cihaz kimliğine (veya oturum açmış hesaba) bağlıdır, 90 gün tutulur; saklanan metinde kart/kimlik numarası benzeri rakam dizileri ve e-postalar maskelenir. İletişim bırakma açık onay ister.

**Açık kalanlar (Faz10 / D08 / D10):** içerik moderasyonu, saklama süresinin ve aydınlatma metninin hukuken onayı, test sunucusunda açılması (Ek B benzeri bayrak ve köken listesi), model seçimi PoC'si ve gerçek birim maliyetin sağlayıcı faturasıyla doğrulanması, WhatsApp numarası (D05).
