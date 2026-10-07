# TST-079 — ADM-003 katalog ve varyant yönetimi

03.10.2026 · Kaynak HEAD acc0c99; değişiklikler çalışma ağacında.

## Teslim

- Ürün/SKU arama, kategori ve aktif/pasif/stoksuz filtreleri; veri kaynaklı dört sayaç.
- Genel bilgiler, stok/varyant, medya, SEO bölümleri; örnek ürün oluşturma ve oturum taslağını uygulama.
- Variant ID düzenleme sırasında korunur; renk fotoğrafları varyanta bağlıdır.
- Zorunlu ad/kategori, tam sayı ve negatif olmayan stok, ürün içi ve ürünler arası SKU benzersizliği kontrol edilir.
- Sekme geçişinde ve panel gezinmesinde taslak/uygulanmış veri korunur; değişmiş taslaktan ayrılma onayı ve dialog odak dönüşü vardır.
- D02/API eksikliği açıkça gösterilir; gerçek kayıt/fiyat/stok/publikasyon/medya upload yapılmaz. Yenileme demo verisini sıfırlar.

## Doğrulama

- `pnpm --filter admin build`: TypeScript ve Vite başarılı.
- `pnpm --filter admin lint`: başarılı.
- `node tools/test-admin-catalog.mjs`: arama/filtre, boş ad, negatif stok, yinelenen SKU, sekme taslağı, medya, uygulama/gezinme, oluşturma/vazgeçme, Escape/odak ve 320/390/768/1440 px taşma başarılı.
- `node tools/test-admin-panel.mjs`: mevcut dashboard/sipariş/içerik regresyonu başarılı.
- Tarayıcı pageerror yok; mobil PNG görsel olarak incelendi.
- Kanıt: TST-079-catalog-desktop.png, TST-079-catalog-mobile.png.
- `git diff --check`: başarılı.

Gerçek FE/Creative/BE/DBA/Full Stack/PM kabulü ve ticari API entegrasyonu açık. Sonraki bağımsız iş ADM-005 stok/depo hareket ve mutabakat ekranı; gerçek stok yazımı D02/D03 kararına bağlıdır.
