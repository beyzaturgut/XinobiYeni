# TST-089 — Yerel uçtan uca ve model regresyonu

- Tarih/saat (Europe/Istanbul): 07.10.2026 ~11:20–11:40
- Commit/branch: `main` / `0ff8f38` (uygulama kodu `0a18bba`)
- Faz/görev: Faz00 kayıt açığı sonrası uçtan uca doğrulama (TST-088 devamı)
- Seviye: UNIT (model) / E2E / INTEGRATION
- Ortam: LOCAL · çalışan `pnpm dev:local` servisleri (API 5003, web 3000, admin 5173; 07.10 10:05'te, son API commit'inden sonra başlatılmış, yeniden başlatılmadı) · sistem Chrome headless · Playwright 1.55.1
- Çalıştıran: Claude Code

## Amaç

06–07.10 commitlerinin yerel admin → API → web akışlarını ve demo ticaret akışlarını gerçek çalışan servislerde doğrulamak.

## Önkoşullar ve test verisi

- Çalıştırmadan önce `services/api/App_Data/local-commerce/state.json` yedeği alındı (SHA-256 `16af5f33…f551c`). Testlerden sonra dosya hash'i **aynı**; kullanıcı verisi değişmedi.
- `test-local-commerce` gerçek API'ye test ürünü yazar ve `finally` içinde siler; diğer araçlar API yanıtlarını tarayıcıda sahte veriyle yanıtlar.
- Ücretli gerçek Cloudflare çağrısı yapan `test-xinobi-u-live.mjs` **çalıştırılmadı**. `test-xinobi-u` üretimi simüle eder; `test-free-product-preview` üretim isteği sayısının 0 olduğunu denetler.
- Başka portlara (4175/4176/4181/4190) ayrı önizleme sunucusu gerektiren 10 eski prototip testi (`test-admin-*`, `test-web001-interactions`, `test-production-homepage`, `test-mobile-consent-personalize`) bu aralıkta değişmeyen koda ait olduğu için kapsam dışı bırakıldı.

## Komut

```text
for t in <aşağıdaki 22 araç>; do node tools/test-$t.mjs; done
```

İlk deneme macOS'ta `timeout` komutu bulunmadığı için hiçbir testi çalıştırmadı (22×çıkış 127); sarmalayıcı kaldırılarak tekrarlandı. Aşağıdaki sonuçlar ikinci denemeye aittir.

## Gerçek sonuç

- Durum: **KISMİ BAŞARILI** — 16 başarılı, 6 başarısız. İncelenen 6 başarısızlığın hiçbirinde ürün hatası bulunmadı: 5'i kasıtlı UI değişikliğinden sonra güncellenmemiş test, 1'i süresi dolmuş test verisi.

| Araç | Sonuç | Not |
|---|---|---|
| ai-admin-model, integration-model, pricing-model, quote-model, settings-model | BAŞARILI | Saf model testleri |
| studio-color-selection | BAŞARILI | Tek ürün kartı → zorunlu renk → varyantlı soru URL'si; AI çağrısı yok |
| cart | BAŞARILI | Varyant sepeti, yenilemede kalıcılık, canlı fiyat, stok azalması |
| demo-commerce | BAŞARILI | Demo kayıt/giriş/çıkış, başarısız/başarılı ödeme, sipariş kaydı |
| category-management, category-photo, featured-products, product-color-media, product-detail-palette, shared-header, announcements, titanium-banner | BAŞARILI | Admin seçimlerinin masaüstü/mobil web yansıması |
| local-commerce | BAŞARISIZ · eski test | `/17 adet stokta/` bekliyor; `7a5af3b` stok sayısını yalnız son beş üründe gösteriyor. Ürün adı, görsel ve fiyat yansıdı; test ürünü silindi |
| home-navigation-feedback | BAŞARISIZ · eski test | `Ürünler\|Kategoriler\|Xinobi dünyası` bekliyor; `bd25ad6` yeni header'ında üçüncü öğe `XINOBI U` |
| product-listing | BAŞARISIZ · eski test | `• N renk` bekliyor; `ca2191f` rozeti `◉ N renk` yaptı |
| home-category-products | BAŞARISIZ · eski test | Görselin üst elemanını bağlantı varsayıyor; `e0df447` görseli `div.media` içine aldı. Bağlantı kodda doğru: `/urunler?category=<ad>` |
| xinobi-u | BAŞARISIZ · eski test | Varyant başına "… için tasarım oluştur" bağlantısı bekliyor; `05abd5f`/`b344844` ile akış tek ürün kartı → renk seçimi oldu (yeni akışı `studio-color-selection` doğruluyor) |
| free-product-preview | BAŞARISIZ · ortam | Test 06.10'da üretilmiş gerçek oturuma dayanıyor; oturumun 24 saatlik erişimi 07.10 08:25 UTC'de doldu. Yeniden koşmak yeni ücretli üretim gerektirir |

## Hata ve düzeltme

Kod değiştirilmedi. Eski beş testin, ilgili commitlerdeki kasıtlı davranışa göre güncellenmesi önerilir. `free-product-preview` için kalıcı, süresi dolmayan bir test fixture'ı (ör. yerel örnek görselle sahte oturum yanıtı) kullanılması önerilir; böylece test ücretli üretime bağlı kalmaz.

## Kanıt

Her aracın çıktısı oturum sırasında alındı; özet bu tabloda. `state.json` öncesi/sonrası hash eşleşmesi.

## Etki ve sonraki adım

06–07.10 işlevleri yerelde çalışıyor; regresyon tespit edilmedi. Sonraki adım: beş eski testi güncellemek, free-preview fixture'ını kalıcı yapmak ve hepsini yeniden koşmak.
