# TST-093 — Web ve mobil için ortak katalog API sözleşmesi (1. adım)

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `7958924` üzerinde çalışma ağacı
- Faz/görev: Faz03 03.02 sözleşme + Faz04 katalog okuma (mobil başlangıç köprüsü)
- Seviye: UNIT / INTEGRATION / CONTRACT / CI CONTRACT / SMOKE
- Ortam: LOCAL · .NET 10.0.401, Flutter 3.47.5, OpenAPI Generator 7.25.0, Java 17
- Çalıştıran: Claude Code

## Amaç

Web ve mobilin aynı veriyi aynı iş kurallarıyla okuyacağı salt okunur `/api/v1` uçlarını OpenAPI sözleşmesine eklemek ve TypeScript ile Dart istemcilerini bu sözleşmeden üretmek.

## Yapılanlar

- Uçlar: `GET /api/v1/catalog/categories`, `GET /api/v1/catalog/products` (category, q, personalizable, page, pageSize ≤ 100), `GET /api/v1/catalog/products/{id}`, `GET /api/v1/content/home`, `GET /api/v1/content/announcements`.
- Web istemcisinde dağınık duran iş kuralları sunucuya taşındı: kişiselleştirme uygunluğu (açık değer, yoksa Çay/Kahve kategorisi), stok durumu (0 → `out_of_stock`; 1–5 → `low_stock` ve kalan adet; >5 → `in_stock`, adet açıklanmaz), satın alınabilirlik (fiyat var ve stok > 0), ana sayfa kategori görseli önceliği, öne çıkanlar (seçim yoksa ilk dört aktif ürün), yalnız aktif ürün ve slider.
- Para: `{amountMinor, currency}`; kuruş cinsinden tam sayı + ISO 4217 (Faz00 T-02 için API önerisi).
- Görseller tam URL: API medyası istek adresine, `/assets/…` `Catalog:AssetBaseUrl` adresine (Development'ta istek host'u + 3000; Android emülatörü 10.0.2.2 ile de çalışır) çözülür; `javascript:` gibi şemalar reddedilir.
- Veri kaynağı `ICatalogSource`: Development'ta yerel depo (ADR-003); diğer ortamlarda SQL Server kaynağı gelene kadar `503 catalog_unavailable`. Geliştirme verisi canlıya açılmaz.
- JSON sayı biçimi katı yapıldı (`JsonNumberHandling.Strict`); böylece sözleşme sayıları `integer|string` yerine düz `integer` tanımlar ve Dart istemcisi sarmalayıcı tip üretmez. Admin fiyatı JSON sayısı olarak gönderdiği için etkilenmez.
- İstemciler: `packages/contracts/openapi/v1.json`, `packages/clients/typescript/src/schema.d.ts`, `packages/clients/dart` (`CatalogApi`, `ContentApi`, 12 model) yeniden üretildi; önceki üretimden kalan 6 eski Dart dosyası temizlendi.

## Komut ve sonuç

```text
dotnet build XinobiYeni.slnx -c Release && dotnet test XinobiYeni.slnx --no-build -c Release   → 54/54 (16 yeni CatalogTests)
pnpm contracts:generate; cd packages/clients/dart && dart run build_runner build && dart analyze && dart test → temiz; 3/3 (2 yeni katalog sözleşme testi)
cd apps/mobile && flutter analyze && flutter test                                         → temiz; 2/2
pnpm lint; pnpm --filter admin build; pnpm --filter web build                              → başarılı
Kayma kontrolü: değişiklikler hazırlandıktan sonra üretim + build_runner tekrarlandı        → değişen dosya 0
Duman testi: yeni kod geçici olarak 127.0.0.1:5013'te gerçek yerel veriyle                  → 4 kategori, 10 ürün, detay 4 varyant, ana sayfa 4 slider/4 öne çıkan; görsel URL 200
```

- Durum: **BAŞARILI**
- Yeni testler: Production'da 5 uç `503 catalog_unavailable`; pasif ürün gizleme ve sayfalama; geçersiz parametre 400; Türkçe büyük/küçük harf duyarsız kategori ve arama; kişiselleştirme filtresi; fiyat/stok/satın alınabilirlik; 404 `product_not_found`; admin'deki fiyat ve kişiselleştirme değişikliğinin sözleşmeye yansıması; ana sayfa kuralları; stok eşikleri; URL çözümleme ve güvenli şema.

## Bilinen sınırlar

- Çalışan geliştirme API'si (`pnpm dev:local`, dosya izlemesiz `dotnet run`) yeniden başlatılana kadar yeni uçları sunmaz.
- Web henüz eski `/api/v1/local-commerce/state` okumasını kullanıyor; web'in yeni sözleşmeye geçişi ayrı iştir.
- Canlı yerel katalogda hiçbir varyanta fiyat girilmemiş; bu yüzden tüm varyantlar `purchasable: false` dönüyor (doğru davranış).
- XINOBI U oturum uçları (yazma + ücretli üretim) bu sözleşmeye henüz alınmadı; sonraki iş.

## Etki ve sonraki adım

Mobil uygulama `CatalogApi` ve `ContentApi` ile web'le aynı veriyi okuyabilir. Sonraki adım: XINOBI U oturum sözleşmesi, ardından Flutter uygulama iskeleti.
