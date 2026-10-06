# TST-084 — ADM-010/011 entegrasyon izleme

03.10.2026 · HEAD acc0c99; çalışma ağacı.

- Mikro, Trendyol, Hepsiburada, N11 sağlayıcı görünümü; hepsi bağlı değil.
- Aynı katalog variantId ile eşleme taslağı; sağlayıcı içinde varyant/dış ID benzersizliği. Silinmiş katalog varyantı eksik olarak görünür.
- Kuyruk/başarısız/belirsiz/kalıcı hata/örnek tamamlandı işleri, işlem anahtarı, deneme ve hata.
- Belirsiz dış sonuçta sorgulama/uzlaştırma şartı; otomatik tekrar/iş üretimi yok. Kalıcı hata ayrı planla açıklanır.
- Uzlaştırma eşleme kapsamını gösterir; dış stok/fiyat alınmadıysa Bilinmiyor. Demo eşleme gerçek başarı değildir.
- `pnpm --filter admin build`, `lint`, `git diff --check`: başarılı.
- `node tools/test-integration-model.mjs`: sağlayıcı sınırı/benzersizlik, eksik varyant ve durum bazlı tekrar planları başarılı.
- `node tools/test-admin-integrations.mjs`: boş/çakışan eşleme, oturum korunması, belirsiz sonuç, kalıcı hata, dış veri yokluğu ve 4 sağlayıcı × 3 bölüm × 4 genişlik başarılı; pageerror yok.
- `node tools/test-admin-panel.mjs`: mevcut panel regresyonu başarılı.
- PNG: TST-084-integrations-desktop.png, TST-084-integrations-mobile.png; masaüstü çıktı incelendi.

D02/D03/D06, gerçek hesap/mağaza, yazma yönü, rol/audit, API/worker ve sağlayıcı kabulü açık. Hiçbir dış çağrı veya retry kuyruğu oluşturulmadı. Sonraki açık panel teslimi ADM-012 AI yönetimi.
