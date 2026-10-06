# TST-081 — ADM-004 fiyat/kampanya prototipi

03.10.2026 · HEAD acc0c99; değişiklikler çalışma ağacında.

- Katalogdaki aynı variantId'lerle örnek TRY fiyat listesi/düzenleme; fiyatı olmayan varyant Tanımlanmadı gösterilir.
- Yüzde/sabit kampanya taslağı: tarih, kanal, varyant, minimum tutar, kupon ve önizlemede etkinlik.
- Tek seçili kampanyayla önizleme; birleştirme, vergi, kargo ve kişiselleştirme politikaları atanmaz. Gerçek yayın veya kupon tüketimi yapılmaz.
- Para kuruş tamsayısıyla saklanır; yüzde çarpımı BigInt, yarım kuruş yukarı yuvarlama örnek politikası. Negatif toplam engellenir.
- Fiyat ve kampanya uygulaması panel gezinmesinde korunur; yenilemede demo başlangıcına döner.

## Kontroller

- `pnpm --filter admin build`, `lint`, `git diff --check`: başarılı.
- `node tools/test-pricing-model.mjs`: virgüllü/ondalıklı tutar, geçersiz biçim, yüzde sınırı, tarih/geçerlilik uçları, kupon/kanal/varyant/minimum, tanımsız fiyat, adet, yuvarlama ve toplam sınırı başarılı.
- `node tools/test-admin-pricing.mjs`: fiyat/validation/oturum korunması, kampanya düzenleme/oluşturma, kupon/kanal/tarih/eksik fiyat önizlemesi ve 320/390/768/1440 px başarılı; pageerror yok.
- `node tools/test-admin-panel.mjs`: dashboard/sipariş/içerik regresyonu başarılı.
- Görseller: TST-081-pricing-desktop.png, TST-081-pricing-mobile.png; mobil çıktı incelendi.

D02/D03 ve gerçek API fiyat otoritesi/rol/audit/eşzamanlılık açık. Demo hesaplama gerçek finansal veya ticari kabul değildir. Sonraki bağımsız iş ADM-007 kurumsal teklif yönetimi.
