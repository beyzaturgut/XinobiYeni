# Faz01 — API sözleşme kuralları

Durum: Taslak · Sürüm: 1 · Son güncelleme: 29.09.2026

Bu belge iş sahibi tarafından açık D kararları verilmeden durum, fiyat veya veri sahipliği uydurmaz. Kodun ortak teknik sözleşmesidir; modül alanları ilgili karar kapısında kesinleşir.

## Temel sözleşme

- Kök yol `/api/v1`; kırıcı değişiklik yeni majör API sürümü gerektirir.
- JSON alanları `camelCase`, zamanlar ISO-8601 UTC, kimlikler tahmin edilemez UUID biçimindedir.
- Parasal değer, decimal tutar ve ISO-4217 para birimiyle taşınır; istemci toplamı otorite değildir.
- Her istek ve yanıtta `X-Request-Id` bulunur. Geçerli istemci değeri korunur; yok/geçersizse sunucu üretir.
- Hatalar `application/problem+json` ve RFC Problem Details biçimindedir; `requestId` ve `timestampUtc` uzantıları zorunludur.
- Log, problem cevabı ve denetim kayıtları sır, parola, token, kart veya gereksiz kişisel veri içermez.

## Hata alanları

| Alan | Zorunlu | Açıklama |
|---|---|---|
| `type` | Evet | Kararlı hata dokümanı/kodu URI'si |
| `title` | Evet | Kullanıcıya doğrudan iç hata vermeyen kısa başlık |
| `status` | Evet | HTTP durum kodu |
| `detail` | Koşullu | Güvenli, eyleme dönük açıklama |
| `instance` | Koşullu | İstek yolu veya hata örneği referansı |
| `requestId` | Evet | Log ve trace korelasyonu |
| `timestampUtc` | Evet | Sunucu hata zamanı |
| `errors` | Doğrulama | Alan bazlı doğrulama hataları |

## Sayfalama ve sıralama

- Koleksiyonlar başlangıçta `page`, `pageSize`, açık allowlist `sort` ve filtre alanları kullanır.
- `pageSize` için modül bazlı güvenli üst sınır zorunludur.
- Cevap `items`, `page`, `pageSize`, `totalCount` taşır; pahalı sayımda cursor modeli ayrı sözleşmeyle seçilebilir.
- Serbest SQL alan/sıralama adı istemciden doğrudan kullanılmaz.

## Yetki

- Kimlik doğrulama tek başına yetki değildir; her nesne için rol ve sahiplik birlikte kontrol edilir.
- Müşteri yalnız kendi adres, sepet, sipariş, tasarım, teklif ve iade kayıtlarını görür.
- Panel değişiklikleri ve entegrasyon yeniden denemeleri denetim kaydı üretir.
- Kimlik/oturum ayrıntıları D10 ve OIDC keşfiyle kesinleşene kadar endpoint seviyesinde varsayım yapılmaz.

## İdempotency

`checkout`, ödeme başlatma/sonuçlandırma, sipariş komutları, dış webhook, baskı çıktısı ve manuel entegrasyon tekrarı idempotency kapsamındadır.

- İstemci komutları `Idempotency-Key` ve normalize istek hash'iyle tutulur.
- Aynı anahtar ve aynı istek önceki sonucu döndürür; farklı istek `409 Conflict` üretir.
- Sağlayıcı olay kimliği ve `(channel, externalId, eventType/version)` benzersizdir.
- Yerel durum değişikliği ile outbox kaydı aynı SQL transaction'ındadır.

Kesin saklama süresi ve sipariş/ödeme geçişleri D03/D10 olmadan belirlenmez.

## OpenAPI ve istemciler

- OpenAPI, C# API'den üretilen kanonik sözleşmedir.
- TypeScript ve Dart istemcileri aynı belge ve sabit generator sürümünden üretilir.
- Üretilmiş dosyalar elle değiştirilmez; CI yeniden üretim farkını denetler.
- Breaking değişiklik ve kaldırma ayrı ADR, geçiş dönemi ve tüketici testi gerektirir.

## Mevcut doğrulama uçları

| Metot/yol | Amaç | Yetki | Durum |
|---|---|---|---|
| `GET /api/v1/health` | API süreç sağlığı | Anonim | Uygulandı; DB/sağlayıcı sağlığı değildir |
| `GET /openapi/v1.json` | Development OpenAPI | Yalnız development | Uygulandı |

