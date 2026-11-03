# Sürat Kargo

03.11.2026 | Entegrasyon hazırlık klasörü

## Kapsam

Gönderi oluşturma, Code128 etiket, şube kabulünden sonra takip. Tarife/checkout kargo ücreti ayrı açık iş.

## Mevcut kayıt

İlk sunucu adaptörü ve izole sözleşme testleri eklendi. Kalıcı gönderi/admin/etiket/takip işi ve gerçek kabul açık. Bu klasörün açılması entegrasyonun uygulandığı veya canlıda doğrulandığı anlamına gelmez.

## Beklenen bilgiler ve kararlar

Test/canlı kullanıcı bilgileri alındı; canlı cari için takip yetkisi bildirildi. Gerçek bağlantı/oluşturma testi, IP whitelist, paket desi/kg, etiket ve sözleşme çelişkilerinin teyidi açık.

## İlgili kayıtlar

- Task/karar: KRG-SUR-01 / TIC-08.
- [İlgili faz](../../Prompts/Faz05_ETicaret_Odeme_Siparis.md).
- [Kapanış taskları](../../docs/tasks/project-closure-2026-10-30.md).
- [Entegrasyon dizini](../README.md).
- [Ayrıntılı alan eşleştirmesi, alt işler ve uygulama promptu](../../docs/tasks/surat-kargo-integration-plan-2026-11-03.md).
- [03.11.2026 PDF planı](../../Proje%20Y%C3%B6netimi/Belgeler/2026-11-03/xinobi-surat-kargo-entegrasyon-task-ve-uygulama-plani-2026-11-03.pdf).

## Bu klasörde tutulacaklar

Gizli bilgi içermeyen sağlayıcı sözleşme notları, alan eşleştirmesi, task/prompt, kurulum yönergesi ve izinli test/kabul raporu bağlantıları. Mevcut kaynaklar yukarıda bağlanmıştır; kopyalarıyla yeni bir durum kaynağı oluşturulmaz. Henüz bu belgeler yoksa hazırmış gibi gösterilmez.

Parola, API anahtarı, gerçek müşteri verisi, gizli bilgi içeren ZIP/Postman ve gerçek ortam dosyası buraya/Git’e konmaz. Gerçek erişimler sunucunun gizli ayar deposunda tutulur. Bu düzenleme sırasında sağlayıcı çağrısı veya geliştirme yapılmadı.

## İletilmiş hesap bilgileri ve kaynak e-posta

- RE-14057; canlı cari ve kullanıcı adı: 1505859998. Test kullanıcı adı: 1361590662.
- Test/canlı parolalar alındı; özgün yerel `kargo.rtf` dosyasında. Yeni belgelere çoğaltılmadı ve Git’e alınmaz.
- E-postadaki bilgiler, kargo kuralları ve teknik planın birleşik yerel nüshası: `Yerel-Bilgiler/surat-kargo-iletilen-bilgiler-ve-plan-2026-11-03.pdf` ve aynı adlı Markdown. Parola yerlerinde özgün RTF referansı vardır.
- Özgün RTF ve `Re__...` ek klasörü Git dışında tutulur. Takip yetkisi bildirimi alındı; bağlantı/oluşturma testi başarılı sayılmaz.

## İlk kod teslimi

[Sunucu ayarları, desteklenen sözleşme ve kalan işler](SUNUCU-KURULUMU.md). Gerçek hesaplar kurulmadı; sağlayıcıya istek yapılmadı.
