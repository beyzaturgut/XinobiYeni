# Faz01 — Sağlayıcı ve erişim envanteri

Durum: Girdi bekliyor · Son güncelleme: 29.09.2026

Sırlar, parolalar, tokenlar ve gerçek bağlantı dizileri bu dosyaya yazılmaz. Yalnız erişimin varlığı, sahibi ve güvenli secret-store referansı kaydedilir.

| Sistem | Gerekli bilgi/erişim | Teknik sahip | Test ortamı | Kota/webhook/ağ | Secret referansı | Durum | Etkilediği faz |
|---|---|---|---|---|---|---|---|
| SQL Server | Sabit dış TCP portu veya VPN/private ağ; düşük yetkili uygulama ve migration hesabı | Bekliyor | `XinobiYeniDB` bildirildi | SQLEXPRESS instance keşfi dışarıdan başarısız | macOS Keychain geçici giriş mevcut | Bloke | 03–11 |
| Ödeme | Sağlayıcı, sandbox merchant, webhook imzası, durum sorgusu ve iade yeteneği | Bekliyor | Bekliyor | Kart verisi uygulamada tutulmaz | Bekliyor | Girdi bekliyor | 05,11 |
| Kargo | Firma, test hesabı, etiket/takip/iptal API yetenekleri | Bekliyor | Bekliyor | Kota ve callback bekliyor | Bekliyor | Girdi bekliyor | 05,11 |
| E-posta | Sağlayıcı, domain doğrulama, template ve bounce/webhook | Bekliyor | Bekliyor | Gönderim limiti bekliyor | Bekliyor | Girdi bekliyor | 05,07,11 |
| SMS | Sağlayıcı, başlık, izin ve teslim raporu | Bekliyor | Bekliyor | Gönderim limiti bekliyor | Bekliyor | Girdi bekliyor | 05,11 |
| Push | Apple APNs, Firebase projesi, bundle/application kimlikleri | Bekliyor | Bekliyor | Token rotasyonu ve izin akışı | Bekliyor | Girdi bekliyor | 11 |
| Mikro | Sürüm; API/SDK/COM/ara katman; test şirketi ve alan yetkileri | Bekliyor | Bekliyor | Windows/yerel ağ bağımlılığı belirsiz | Bekliyor | Girdi bekliyor | 08 |
| Trendyol | Mağaza, API/test yetkisi, ürün/sipariş/kargo/iade kabiliyeti | Bekliyor | Bekliyor | Kota ve IP kuralı bekliyor | Bekliyor | Girdi bekliyor | 09 |
| Hepsiburada | Mağaza, API/test yetkisi, ürün/sipariş/kargo/iade kabiliyeti | Bekliyor | Bekliyor | Kota ve IP kuralı bekliyor | Bekliyor | Girdi bekliyor | 09 |
| N11 | Mağaza, API/test yetkisi, ürün/sipariş/kargo/iade kabiliyeti | Bekliyor | Bekliyor | Kota ve IP kuralı bekliyor | Bekliyor | Girdi bekliyor | 09 |
| AI tasarım | Model/sağlayıcı, görsel işlemler, moderasyon, kota ve maliyet | Bekliyor | Bekliyor | Veri bölgesi/saklama belirsiz | Bekliyor | Girdi bekliyor | 10 |
| AI asistan | Model, bilgi kaynağı, araç çağrısı, moderasyon ve insan devri | Bekliyor | Bekliyor | Kota/maliyet belirsiz | Bekliyor | Girdi bekliyor | 10 |
| WhatsApp/canlı destek | Mevcut kanal, yönlendirme ve görüşme sahipliği | Bekliyor | Bekliyor | Rıza/saklama D10'a bağlı | Bekliyor | Girdi bekliyor | 10 |
| Nesne depolama | Sağlayıcı, bölge, private container, lifecycle ve tarama | Bekliyor | Bekliyor | Boyut/maliyet/RPO bekliyor | Bekliyor | Girdi bekliyor | 03,06,10 |
| Apple Developer | Team, signing, App Store Connect rolleri | Bekliyor | TestFlight bekliyor | Sözleşme/hesap durumu | Bekliyor | Girdi bekliyor | 11 |
| Google Play | Console, signing ve yayın rolleri | Bekliyor | Internal testing bekliyor | Sözleşme/hesap durumu | Bekliyor | Girdi bekliyor | 11 |

Bir satır yalnız gerçek erişimle test edildiğinde `Hazır` olur. Fixture veya fake ile doğrulanan satır `Mock hazır` olarak kalır.

