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

Kurumsal teklifler: web ve mobil formdan gelen gerçek talepler (`/api/v1/local-commerce/quotes`); inceleme, mesaj, birim fiyatlı teklif ve kapatma. Firma kod ve e-postayla takip edip kabul veya ret verir. Kabul edilen teklifin toplu siparişe dönüşümü D07 kararını bekliyor. Önceki örnek model ve araçları (TST-082) kaldırıldı.

Tasarım/baskı: sürüm ve sipariş bağı, kalite bulguları, yüz bazlı örnek çıktı durumları ve inceleme notları. Test: `node tools/test-admin-print.mjs`. Üretim, onay ve gerçek dosya indirme kapalı.

Entegrasyonlar: Mikro/Trendyol/Hepsiburada/N11 için veri kaynağı bağlı değil durumu gösterilir. Sağlayıcı bağlantısı, veri yazımı ve gerçek retry kapalıdır. Kullanılmayan demo eşleme/iş modeli, state ve eski prototip testleri kaldırıldı.

AI yönetimi: Nobi'nin sürümlü politikası (yönerge, karşılama, hızlı yanıtlar, model, günlük AI sınırı, WhatsApp numarası, birim maliyet), onay akışlı bilgi kaynakları, konuşmalar (maskeli), iletişim talepleri ve Nobi + XINOBI U kullanım/tahmini maliyet raporu (`/api/v1/local-commerce/assistant/*`). Önceki örnek model ve araçları (TST-085) kaldırıldı.

Rol/ayar/denetim: izinler gerçek admin oturumundan salt okunur gösterilir; yönetici daveti ve denetim geçmişi API üzerinden çalışır. Sistem ayarları kaydedilemeyen sabit önizlemedir. Kullanılmayan demo rol/ayar değiştirme ve denetim üretme modeli ile eski prototip testleri kaldırıldı.
