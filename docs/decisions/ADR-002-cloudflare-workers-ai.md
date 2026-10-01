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
