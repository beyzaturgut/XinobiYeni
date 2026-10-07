# TST-097 — Mobil sepet

- Tarih/saat (Europe/Istanbul): 07.10.2026 ~16:30
- Commit/branch: `main` / `53d8017` üzerinde çalışma ağacı
- Faz/görev: Faz11 erken mobil — sepet (Faz05 kuralları, ödeme yok)
- Seviye: UNIT / WIDGET / CONTRACT / E2E (emülatör)
- Ortam: LOCAL · Flutter 3.47.5, Android emülatörü Pixel 8; geçici API 127.0.0.1:5013 **yerel kataloğun scratchpad kopyasıyla** (`LocalCommerce__DataDirectory`), kopyada tek renge deneme fiyatı ₺1.899,00
- Çalıştıran: Claude Code

## Yapılanlar

- Sözleşme: `VariantDetail.maxQuantity` = stok, en fazla 99 (web sepetinin sınırı); kesin stok kontrolü ödeme fazında sunucuda. OpenAPI + TS/Dart istemcileri yeniden üretildi.
- Mobil sepet web ile aynı biçimde (`xinobi-cart-v1`, `{productId, variantId, quantity}`, 1–99, en fazla 100 satır), cihazda saklanır. Fiyat/stok her açılışta güncel katalogdan çözülür; sorunlu satırlar (yayından kalkmış ürün, kaldırılmış renk, fiyat yok, stok yok, stok azaldı) işaretlenir ve ara toplama girmez.
- Ürün detayında "Sepete ekle" (fiyatsız renkte "Şu anda satın alınamaz", stoksuzda "Stokta yok"), eklenince bildirim ve "Sepete git"; dördüncü sekme "Sepet" adet rozetiyle; sepet ekranında −/+ (stok sınırında + pasif), Kaldır, ara toplam, boş durum. Ödeme düğmesi konmadı; D03/D05 sonrası eklenecek notu gösterilir.
- Erişilebilirlik: aynı ürünün iki rengi ayırt edilsin diye adet ve kaldır düğmeleri ürün adı + renk ile adlandırıldı.

## Komut ve sonuç

```text
dotnet build -c Release && dotnet test --no-build -c Release → 70/70 (4 yeni: maxQuantity, stok→sınır)
dart test (packages/clients/dart)                            → 4/4
flutter analyze && flutter test (apps/mobile)                → temiz; 20/20 (4 yeni sepet testi)
pnpm lint; pnpm --filter web build                           → başarılı; istemci kayması 0
Emülatör: Ürünler → CM 101-105 → Sepete ekle → bildirim → Sepete git → + → adet 2, ara toplam ₺3.798,00, rozet 2
```

- Durum: **BAŞARILI**
- Kullanıcı verisi (`state.json`) testten önce ve sonra aynı; deneme fiyatı yalnız kopyada.

## Bulunup düzeltilenler

- Fiyatsız renkte fiyat alanı ve düğme aynı "Fiyat tanımlanmadı" metnini tekrarlıyordu → düğme "Şu anda satın alınamaz".
- Yayından kalkmış ürün satırında anlamsız "Fiyat tanımlanmadı" görünüyordu → kaldırıldı.
- Aynı ürünün iki renginde düğme adları aynıydı → renk eklendi.

## Uyumluluk notu

`maxQuantity` Dart istemcisinde zorunlu alan. 16:09'da başlatılmış dev API bu alanı göndermez; yeni mobil sürüm ürün detayını ancak `pnpm dev:local` yeniden başlatıldıktan sonra o API'den okuyabilir. Mağaza yayınında mobil ve API sürüm uyumu (Faz11 §5.4) bu nedenle zorunlu.

## Etki ve sonraki adım

Mobil katalog → sepet akışı web kurallarıyla çalışıyor. Ödeme, rezervasyon ve sipariş D03/D05 ve Faz05'e bağlı.
