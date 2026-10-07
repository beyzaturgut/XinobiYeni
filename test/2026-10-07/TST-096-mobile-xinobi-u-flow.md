# TST-096 — Mobil XINOBI U akışı, gerçek Cloudflare denemesi ve renk adımının kaldırılması

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `5ed9bd4` üzerinde çalışma ağacı (araya başka oturumun e-posta doğrulama commit'leri girdi; çakışma yok)
- Faz/görev: Faz11 erken mobil + Faz10 erken XINOBI U (ADR-002 Ek A kapsamında) + DES-XU-01
- Seviye: UNIT / WIDGET / INTEGRATION / E2E (emülatör, gerçek sağlayıcı)
- Ortam: LOCAL · Flutter 3.47.5, Android emülatörü Pixel 8, geçici API 127.0.0.1:5013 (Development, Cloudflare yapılandırılmış), `@cf/black-forest-labs/flux-1-schnell`
- Çalıştıran: Claude Code

## Yapılanlar

- Mobil: `XinobiURepository` (üretilmiş `XinobiUApi`, Problem Details kodlarından Türkçe mesaj), cihaz başına rastgele `clientId` ve yarım anketin cihazda saklanması (`shared_preferences`), anket ekranı: tek tek 5 soru (4 seçenek, ilerleme çubuğu, geri tuşu önceki soruya döner) → yanıt özeti → üretim → 2 sn aralıkla durum sorgusu (150 sn sonra "Durumu yenile", istek tekrar gönderilmez) → sonuç (Ürünümde / Desen, kalıcı "Temsilidir" metni) veya hata. Ürün detayında kişiselleştirilebilir ürünler için "… rengini XINOBI U ile kişiselleştir".
- DES-XU-01 (proje sahibi kararı): renk seçim adımı web ve mobilden kaldırıldı; sunucu renk verilmezse ilk fotoğraflı varyantı kullanır; web soru ekranında renk adı gösterilmez; eski `/xinobi-u/renk` sorulara yönlenir; web oturum anahtarı istenen ürün/renk anahtarıyla da saklanır (yenilemede kaldığı yerden devam).
- Sözleşme: `variantId` isteğe bağlı; OpenAPI ve TS/Dart istemcileri yeniden üretildi.

## Gerçek Cloudflare uçtan uca (proje sahibi onayıyla)

- Emülatörde XINOBI U → ürün → (o sırada var olan) renk → 5 soru (Renk, Ruh hâli, Doğa, Görsel yoğunluk, Tarz) → özet → üretim. Sunucu görseli 13 sn'de üretti (11:01:12→11:01:25, oturum `00c47c51`); uygulama 22 sn içinde "İşte sana özel yorum" ekranına geçti.
- **Beklenmeyen ek üretimler:** sonuç ekranından sonra, betiklerim dokunuş göndermezken uygulama emülatörde yeni anketler açtı ve iki anket daha yanıtlanıp üretildi (`e0809ccd` 11:02:32, `9c34e22e` 11:03:55). Bugünkü sağlayıcı çağrısı toplam **3** (günlük sınır 30). Seçilen seçenekler betik deseniyle uyuşmuyor; emülatör penceresinin kullanıcı tarafından kullanılmış olabileceği proje sahibine soruldu, yanıt bekleniyor. Uygulama kodunda üretimi kendiliğinden başlatan yol yok (widget testi tek düğme basışında tek çağrıyı doğrular). Uygulama, emülatör ve geçici API hemen durduruldu.
- Sonuç ekranının emülatör görüntüsü bu nedenle alınamadı; sonuç ekranı widget testinde doğrulandı.

## Komut ve sonuç

```text
dotnet build -c Release && dotnet test --no-build -c Release  → 66/66 (59 bu çalışmanın kapsamı + başka oturumun 7 EmailVerificationTests)
dart test (packages/clients/dart)                             → 4/4
flutter analyze && flutter test (apps/mobile)                 → temiz; 15/15 (5 yeni XINOBI U widget testi; sahte sağlayıcı)
pnpm lint; pnpm --filter web build                            → başarılı
node tools/test-xinobi-u-direct-questions.mjs                 → başarılı (kart doğrudan sorulara; /renk yönlenir; AI çağrısı yok)
Kayma: üretim tekrarı                                          → değişen dosya 0
```

- Durum: **KISMİ BAŞARILI** — kod ve testler başarılı; `node tools/test-xinobi-u.mjs` çalışan dev API eski kodla (renk zorunlu) olduğu için koşulmadı. `pnpm dev:local` yeniden başlatıldıktan sonra koşulmalı (dev-local bir servis kapanınca hepsini kapattığı için tek başına API yeniden başlatılmadı).

## Bulunup düzeltilenler

- Seçenek kutularında beyaz zemin dokunma dalgasını gizliyordu (Flutter uyarısı) → `Material` yüzeyi.
- Web: renk boşken oturum farklı anahtarla saklanıyordu, yenilemede anket kaybolacaktı → istenen anahtarla da saklanıyor.

## Etki ve sonraki adım

XINOBI U web ve mobilde renk sormadan aynı kuralla çalışıyor. Sonraki: dev API yeniden başlatılınca `test-xinobi-u.mjs`; ek üretimlerin nedeni netleşince gerekirse önlem.
