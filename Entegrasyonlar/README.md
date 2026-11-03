# Xinobi entegrasyonları

03.11.2026 | Faz/task kayıtlarına dayalı dokümantasyon ve hazırlık dizini. Uygulama kaynak kodu kendi servis/app klasörlerinde kalır.

| Klasör | Kapsam / mevcut kayıt |
| --- | --- |
| [Sürat Kargo](01-Surat-Kargo/README.md) | Adaptör + kalıcı gönderi/admin API eklendi; ekran/etiket/takip ve gerçek kabul açık. |
| [Mikro muhasebe / ERP](02-Mikro/README.md) | Planlandı; gerçek adaptör ve işletim kabulü açık. |
| [Trendyol](03-Trendyol/README.md) | Gerçek adaptör ve kanal kabulü açık. |
| [Hepsiburada](04-Hepsiburada/README.md) | Gerçek adaptör ve kanal kabulü açık. |
| [N11](05-N11/README.md) | Gerçek adaptör ve kanal kabulü açık. |
| [Ödeme sağlayıcısı](06-Odeme/README.md) | Sağlayıcı seçimi ve gerçek tahsilat kabulü açık. |
| [E-posta (SMTP / Resend)](07-Eposta/README.md) | Temel gönderim yolları mevcut; gerçek ortam/teslim kabulü açık. |
| [SMS / Netgsm](08-SMS-Netgsm/README.md) | Gerçek test erişimi ve uçtan uca kabul açık. |
| [Mobil push (Firebase FCM / Apple APNs)](09-Push-Firebase-APNs/README.md) | Mobil SDK/token yaşam döngüsü ve gerçek cihaz kabulü açık. |
| [AI tasarım / Cloudflare Workers AI](10-AI-Tasarim-Cloudflare/README.md) | Mevcut adaptör ve üretim akışı kısmi; tam sağlayıcı kabulü değil. |
| [Nobi satış asistanı / metin AI](11-Nobi-Satis-Asistani/README.md) | Katalog temeli, Cloudflare metin modeli ve fallback mevcut; tam kabul açık. |
| [İYS / ticari ileti izinleri](12-IYS-Ticari-Ileti/README.md) | D11 karar ve uygulama yolu açık. |
| [e-Fatura / e-Arşiv](13-EFatura-EArsiv/README.md) | D11 sistem/sorumluluk kararı açık; ayrı sağlayıcı seçilmiş değil. |

## Kullanım

Her entegrasyonun sözleşme notu, task/prompt, kurulum ve kabul kayıtları kendi klasöründe tutulur veya mevcut kaynaklarına bağlanır. Gizli bilgiler repoya alınmaz; erişim sağlanması canlı kabul değildir. Sağlayıcı seçimi açık olan ödeme/e-belge başlıklarında firma adı varsayılmaz. E-posta seçenekleri alternatif; FCM/APNs tek mobil push akışının platform bileşenleridir. İYS ve e-belge için çözüm yolu kararı önce verilir.

Roboflow kaldırılmıştır; yeni entegrasyon işi olarak açılmadı. İdefix/Pazarama isimlerinin kargo e-postasında bulunması onları proje pazaryeri kapsamına eklemez. Yeni bir taşıyıcı/kanal ancak kapsam kararıyla eklenir. Domain, veritabanı ve deployment işleri teknik altyapı fazlarında izlenir.

- [Faz00: güncel durum](../Prompts/Faz00_Proje_Takip_ve_Kesintiden_Devam.md).
- [Önemli belge arşivi](../Proje%20Y%C3%B6netimi/Belgeler/README.md).

Bu klasör düzeni taskları tamamlandı yapmaz; kaynak fazların durumu esas alınır.
