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

- Durum: Uygulandı; istisnanın proje sahibince yazılı onayı bekliyor
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
