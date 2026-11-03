# TST-244 | Sürat kalıcı gönderi ve admin API

03.11.2026. KRG-SUR-01 devamı. Gerçek API, müşteri verisi veya canlı ayar kullanılmadı.

- FeatureDocuments üzerinde tek kalıcı gönderi/attempt: sipariş+ortam tekilliği, hesap/istek fingerprint, sabit referans, personel, zaman ve adres/paket kopyası. POST öncesi kayıt kalıcı. SQL mevcut ops.FeatureDocuments transaction applock kullanır; yeni migration yok. Development dosya modu yalnız tek API sürecidir.
- Aynı isteğin tekrarı mevcut kayıt; farklı veri/hesap 409. submitting veya reconciliation_required otomatik yeniden gönderilmez. Başlangıç/sonuç arasında crash sonrası da ref korunur. Uygulama order status/notification değiştirmez.
- GET/POST admin uçları orders.read/write ve personel oturumu kontrolünde. Canlı ödeme/operasyon uygunluğu yokken Production POST 409; mevcut shipped/cancelled/delivered/pending-cancel kayıtları engellenir. Alıcı yalnız sipariş adres kopyasından gelir.
- Odaklı ilk koşu 24/24 PASS; yetki testleri sonrası 26/26 PASS. Çift tıklama, restart, belirsiz/crash, değişen paket, kapalı canlı, uygunsuz sipariş, anonim 401, müşteri 403, personel 404/400 senaryoları sentetik fixture ile doğrulandı.
- Tam API: 540 PASS / 29 SKIP / 0 FAIL (569 toplam). Gerçek SQL kilit/kalıcılık kabulü atlanan testler nedeniyle henüz kanıtlanmadı. İlk adaptör regresyonları bu sayılara dahil.
- pnpm contracts:generate PASS (Release derleme + OpenAPI + TypeScript + Dart build_runner). TypeScript client build PASS; dart analyze packages/clients/dart: No issues found. git diff --check PASS.
- Açık: admin ekranı/uzlaştırma, Code128 etiket, polling ve müşteri takip DTO, gerçek SQL ve sandbox/whitelist/fiziksel okuyucu kabulü, canlı ödeme/uygunluk ve iptal-gönderim eşzamanlılık kapısı. Tam entegrasyon veya canlıya hazır kabulü verilmedi.
