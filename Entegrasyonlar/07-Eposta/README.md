# E-posta (SMTP / Resend)

03.11.2026 | Entegrasyon hazırlık klasörü

## Kapsam

Giriş/doğrulama/parola, admin MFA ve sipariş bildirimleri için onaylı gönderim, kuyruk, tekrar ve teslim/ret yönetimi.

## Mevcut kayıt

Temel gönderim yolları mevcut; gerçek ortam/teslim kabulü açık. Bu klasörün açılması entegrasyonun uygulandığı veya canlıda doğrulandığı anlamına gelmez.

## Beklenen bilgiler ve kararlar

SMTP veya Resend seçimi, gönderen domain doğrulaması, sunucu secretları ve izinli test alıcısı. İki sağlayıcı zorunlu değil.

## İlgili kayıtlar

- Task/karar: Faz03 / Faz05 / bildirimler.
- [İlgili faz](../../Prompts/Faz03_Teknik_Altyapi_Kimlik_Veritabani.md).
- [Kapanış taskları](../../docs/tasks/project-closure-2026-10-30.md).
- [Entegrasyon dizini](../README.md).

## Bu klasörde tutulacaklar

Gizli bilgi içermeyen sağlayıcı sözleşme notları, alan eşleştirmesi, task/prompt, kurulum yönergesi ve izinli test/kabul raporu bağlantıları. Mevcut kaynaklar yukarıda bağlanmıştır; kopyalarıyla yeni bir durum kaynağı oluşturulmaz. Henüz bu belgeler yoksa hazırmış gibi gösterilmez.

Parola, API anahtarı, gerçek müşteri verisi, gizli bilgi içeren ZIP/Postman ve gerçek ortam dosyası buraya/Git’e konmaz. Gerçek erişimler sunucunun gizli ayar deposunda tutulur. Bu düzenleme sırasında sağlayıcı çağrısı veya geliştirme yapılmadı.
