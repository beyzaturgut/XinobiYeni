# TST-083 — ADM-008 tasarım/baskı operasyon prototipi

03.10.2026 · HEAD acc0c99; çalışma ağacı.

- Tasarım/sipariş arama ve queued/running/failed/ready çıktı filtreleri.
- Siparişin bağlı değişmez tasarım sürümü, sürüm seçimi, varyant, alan kuralı, kalite bulguları ve yüz bazlı iş durumu.
- Ürün fotoğrafı yalnız referans; gerçek baskı maskesi/fiziksel ölçü uydurulmaz. Ready örnek çıktı üretim onayı değildir.
- Başarısız iş için aynı tasarım/alan/profil referansıyla tekrar planı açıklanır; gerçek kuyruk/çıktı oluşturulmaz.
- İnceleme notu sürüm kimliğiyle oturumda tutulur; üretim/audit kaydı diye gösterilmez.
- `pnpm --filter admin build`, `lint`, `git diff --check`: başarılı.
- `node tools/test-admin-print.mjs`: filtre/boş, değişmez sipariş bağı, ayrı yüz/iş durumları, boş not doğrulama, sürüm/gezinme sonrası not, onay/indirme/üretim kapıları ve 320/390/768/1440 px başarılı; pageerror yok.
- `node tools/test-admin-panel.mjs`: mevcut dashboard/sipariş/içerik regresyonu başarılı.
- Görseller: TST-083-print-desktop.png, TST-083-print-mobile.png; mobil çıktı incelendi.

D04 fiziksel örnek, DPI/font/lisans/profil/alan, operatör yetkisi ve gerçek render/indirme API'si açık. Prototip gerçek baskı kabulü değildir. Sonraki ekran ADM-010/011 entegrasyon eşleme ve hata izleme.
