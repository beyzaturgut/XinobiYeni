# TST-080 — ADM-005 stok/depo prototipi

03.10.2026 · HEAD acc0c99; çalışma ağacı.

- İki örnek depo, beş bakiye; fiziksel/rezerve/satılabilir alanlar ayrı.
- Ürün/SKU/renk ve depo filtreleri; örnek önce/sonra, aktör ve neden taşıyan hareket listesi.
- Tüm depo satılabilir toplamı katalog demo stoğuyla karşılaştırılır; fark ve eksik eşleme ayrı. Katalogdaki değişiklikler aynı varyant kimliğiyle okunur.
- Sayım önizlemesi depo/variant, tam sayı adet ve neden ister; negatif/boş/geçersiz adet engellenir. Rezervasyondan düşük sayım uyarılır. Preview stok veya hareket oluşturmaz.
- `pnpm --filter admin build` ve `lint`: başarılı.
- `node tools/test-admin-inventory.mjs`: filtre, geçmiş boş durum, fark, sayım doğrulama/no-mutation, yeni eşlemesiz varyant ve 320/390/768/1440 px başarılı; pageerror yok.
- `node tools/test-admin-catalog.mjs` ve `node tools/test-admin-panel.mjs`: regresyon başarılı.
- Görseller: TST-080-inventory-desktop.png ve TST-080-inventory-mobile.png; masaüstü çıktı incelendi.
- `git diff --check`: başarılı.

Gerçek stok sahibi, rezervasyon, operatör yetkisi, stok düzeltme audit'i ve SQL/API D02/D03 kapılarında açık. UI prototipi gerçek entegrasyon kabulü değildir. Sonraki iş ADM-004 fiyat/kampanya prototipi.
