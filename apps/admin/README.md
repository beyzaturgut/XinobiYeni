# Xinobi yönetim paneli

Ürün, görsel, fiyat, web stoğu ve içerik bölümleri local ortak API’ye bağlıdır. `pnpm dev:local` üç servisi birlikte açar. Kaydedilen değişiklikler web’de iki saniye içinde görünür; sayfa veya servis yenilemesinde korunur. Stok ekranındaki “Web stokları” kaydedilir; depo/rezervasyon örnekleri ve diğer operasyon modülleri demo kapsamındadır. Bannerlar için “Kaydet ve web’i güncelle”, ürün için Kaydet, fiyat ve stok için ilgili kayıt düğmesini kullanın. Local API’nin ayrıntıları kök README’dedir.

React/Vite/TypeScript yerel prototipi. Siyah yatay kabuk, dar ikon şeridi ve beyaz çalışma alanı.

- Dashboard: 13 kart, dokuz dönem seçimi, örnek/boş/hata durumları; klavyeyle kart sıralama ve demo alanına ait tarayıcı düzeni.
- Katalog: ürün/SKU arama, durum/kategori filtreleri, demo ürün oluşturma, genel bilgi/varyant/medya/SEO düzenleme ve oturum taslağı. Yenilemede demo verisi sıfırlanır.
- Siparişler: örnek liste, arama/durum filtresi, erişilebilir native detay dialog'u.
- İçerik: önceki slider/video ve XINOBI U editörü korunur; değişiklikler oturum önizlemesidir.
- Gerçek kimlik/rol, ticari API, kalıcı içerik kaydı ve canlı yayın bağlı değildir. Prototipler gerçek yetkilendirme yerine geçmez.

Çalıştırma: `pnpm --filter admin dev`. Kontroller: `pnpm --filter admin lint`, `pnpm --filter admin build`.
Tarayıcı kontrolü: dist'i 4190 portunda sunup repo kökünde `node tools/test-admin-panel.mjs` çalıştırın.

Gerçek kullanıcı entegrasyonunda demo localStorage anahtarı kimlik/tenant ve şema sürümüyle değiştirilmeli; demo kaydı gerçek kullanıcı düzenine taşınmamalıdır.

Katalog tarayıcı kontrolü: `node tools/test-admin-catalog.mjs` (dist, port 4190).

Stok/depo: fiziksel, rezerve, satılabilir örnek bakiyeler; hareket geçmişi, katalog mutabakatı ve kayıt oluşturmayan sayım önizlemesi. Test: `node tools/test-admin-inventory.mjs`.

Fiyat/kampanya: varyant örnek fiyatları, koşullu kampanya taslakları ve tek kampanyalı TRY önizlemesi. Testler: `node tools/test-pricing-model.mjs`, `node tools/test-admin-pricing.mjs`. Gerçek fiyat yayını ve kupon tüketimi kapalıdır.

Kurumsal teklifler: örnek firma/talep listesi, sürüm geçmişi ve değişmez demo revizyonlar. Test: `node tools/test-quote-model.mjs`, `node tools/test-admin-quotes.mjs`. Müşteriye gönderim, onay ve sipariş dönüşümü kapalı.

Tasarım/baskı: sürüm ve sipariş bağı, kalite bulguları, yüz bazlı örnek çıktı durumları ve inceleme notları. Test: `node tools/test-admin-print.mjs`. Üretim, onay ve gerçek dosya indirme kapalı.

Entegrasyonlar: Mikro/Trendyol/Hepsiburada/N11 örnek eşleme, hata ve uzlaştırma izleme. Test: `node tools/test-integration-model.mjs`, `node tools/test-admin-integrations.mjs`. Sağlayıcı bağlantısı, veri yazımı ve gerçek retry kapalıdır.

AI yönetimi: sürümlü demo politika/istem, örnek kullanım/hata, kaynak uygunluğu ve izin bekleyen devir talebi. Test: `node tools/test-ai-admin-model.mjs`, `node tools/test-admin-ai.mjs`. Sağlayıcı/kota/ücret/yayın ve gerçek destek devri kapalı.

Rol/ayar/denetim: sabit demo yönetici ve düzenlenebilir operasyon rolü, ayar sürümü ve güvenli önce/sonra oturum kayıtları. Test: `node tools/test-settings-model.mjs`, `node tools/test-admin-settings.mjs`. Gerçek kimlik/API yetkisi, kullanıcı daveti, kalıcı append-only audit ve bildirim gönderimi bağlı değildir.
