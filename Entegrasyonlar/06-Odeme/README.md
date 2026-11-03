# Ödeme sağlayıcısı

03.11.2026 | Entegrasyon hazırlık klasörü

## Kapsam

Kart/3DS, doğrulanmış callback/webhook, tekrar koruması, ödeme-sipariş geçişleri, iptal/iade ve mutabakat. Havale politikası ayrıca kararlaştırılır.

## Mevcut kayıt

Sağlayıcı seçimi ve gerçek tahsilat kabulü açık. Bu klasörün açılması entegrasyonun uygulandığı veya canlıda doğrulandığı anlamına gelmez.

## Beklenen bilgiler ve kararlar

D03 ödeme/rezervasyon kararları, seçilmiş sağlayıcının sözleşmesi, test hesabı ve onaylı iş akışı.

## İlgili kayıtlar

- Task/karar: Faz05 / D03.
- [İlgili faz](../../Prompts/Faz05_ETicaret_Odeme_Siparis.md).
- [Kapanış taskları](../../docs/tasks/project-closure-2026-10-30.md).
- [Entegrasyon dizini](../README.md).

## Bu klasörde tutulacaklar

Gizli bilgi içermeyen sağlayıcı sözleşme notları, alan eşleştirmesi, task/prompt, kurulum yönergesi ve izinli test/kabul raporu bağlantıları. Mevcut kaynaklar yukarıda bağlanmıştır; kopyalarıyla yeni bir durum kaynağı oluşturulmaz. Henüz bu belgeler yoksa hazırmış gibi gösterilmez.

Parola, API anahtarı, gerçek müşteri verisi, gizli bilgi içeren ZIP/Postman ve gerçek ortam dosyası buraya/Git’e konmaz. Gerçek erişimler sunucunun gizli ayar deposunda tutulur. Bu düzenleme sırasında sağlayıcı çağrısı veya geliştirme yapılmadı.
