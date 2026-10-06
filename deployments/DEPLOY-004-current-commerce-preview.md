# DEPLOY-004 — Güncel web ve içerik önizlemesi

- Tarih: 2026-10-06 (Europe/Istanbul)
- Sorumlu: Codex hazırlık; sunucu aktarımı bekliyor.
- Kaynak: main / c323e13f0a98781848e0a4548d8433989e74501a
- Hedef: mevcut IIS XinobiYeni sitesi, 109.104.120.91:8014
- Fiziksel yol: C:\inetpub\wwwroot\XinobiYeni\out
- Paket: XinobiYeni-web-c323e13.zip (90.474.188 bayt)
- SHA-256: 22c2aae7ca4055b6d228997c31dd50cf0791250480798658e721f0839b755d98
- Durum: HAZIRLANDI; sunucuya aktarılmadı.

Paket güncel web kodunu, local ürün/renk/fiyat/stok kayıtlarını, kategori ve öne çıkan ürün seçimlerini, bannerları, yayımlanmış duyuruları ve bunlara bağlı yüklenen medyayı içerir. İçerik yayına hazırlık anının kopyasıdır; sonraki local admin değişiklikleri canlıya otomatik yansımaz. Admin uygulaması bu web ZIP'ine dahil değildir. Cloudflare soru/görsel üretimi ve canlı admin senkronizasyonu bu statik paketle etkinleşmez; güvenli sunucu API bağlantısı ayrıca kurulmalıdır. Tokenlar, AI oturumları ve sunucu sırları pakete alınmaz.

## Sunucuda uygulama

1. ZIP'i RDP üzerinden C:\deploy altına aktarın, yeni boş klasöre açın.
2. IIS Manager'da yalnız XinobiYeni sitesini durdurun.
3. Mevcut out klasörünü out-backup-20261006 olarak yeniden adlandırın; aynı isim varsa farklı tarih/saat kullanın.
4. Paketin out klasörünü C:\inetpub\wwwroot\XinobiYeni altına kopyalayın.
5. Mevcut physical path ve 8014 binding'ini değiştirmeden siteyi başlatın.
6. Sunucuda localhost:8014 ve dışarıdan 109.104.120.91:8014 üzerinde anasayfa, /urunler/, ürün detayı ve /xinobi-u/ listesini doğrulayın.

Geri alma: Siteyi durdurun, yeni out'u farklı bir başarısız-yayın adına taşıyın, yedek out'u geri getirin ve siteyi başlatın. Mevcut Xinobi/XinobiApi sitelerine dokunulmaz.

## Kontroller

27 statik rota derlendi. Geçici HTTP sunucusunda anasayfa, katalog, ürün detayı ve XINOBI U listesi güncel kayıtlarla açıldı; tüm ürün/banner görselleri yüklendi. Local API adresine bağımlılık taşınmadı. Canlı IIS smoke yapılmadı; veritabanı migration yok. Sunucu erişimi bu oturumda mevcut değil.
