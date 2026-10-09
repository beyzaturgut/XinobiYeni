# TST-107 — Bekleyen işlerin doğrulanması / 09.10.2026

Bu rapor bu oturumda gerçekten çalıştırılan kontrolleri kaydeder. Önceki kullanıcı bildiriminden ayrı tutulur. Web düzeltmesi `bf510fc`, mobil düzeltme ve cihaz testleri `63ac7a4`.

## Sonuçlar

| Kontrol | Sonuç | Kapsam |
|---|---|---|
| .NET tam test paketi | 306/306 | `dotnet test tests/Xinobi.Architecture.Tests --no-restore -p:OpenApiGenerateDocumentsOnBuild=false` |
| DevelopmentAcceptedSurfaceTests | İki ayrı odaklı koşuda 18/18 | Bildirilen aralıklı hata yeniden üretilemedi; kök neden çözülmüş sayılmaz. |
| Flutter mevcut testler | 49/49 | Mobil düzeltmelerden sonra tekrar başarılı. |
| Flutter Android cihaz testleri | 5/5 | `emulator-5554`; Nobi hızlı mesaj/yanıt, teklif formu ve takip ekranı, tasarım adlandırma/silme, maskesiz editör, onaylı test maskesiyle galeri/taşıma/boyut/döndürme/kaplama/kaydetme. |
| Flutter analiz | Temiz | Son mobil kod ve cihaz testleri. |
| Temsilidir Playwright | 3/3 | Generated, kendi görselin, ana sayfa örneği; 1440/390 genişlik, görünür etiket ve taşma kontrolü. |
| Web build / ilgili test lint | Başarılı | Tasarım API adresi verilerek statik derleme; ilgili test ESLint temiz. |

.NET TRX geçici çıktısı: `/tmp/xinobi-pending-tests/_192_2026-10-09_12_26_02_net10.0.trx`. APK, iz ve derleme çıktıları Git’e eklenmedi.

## Düzeltilen sorunlar

- Web testi yerel maskeye ve ilk varyantın sırasına bağlıydı. Katalog ve tam varyant testte açıkça seçilir; yalnız test cevabına mevcut development maskesi eklenir. Gerçek ürün maskesi onaylanmadı.
- Statik web derlemesinde tasarım API’si boşsa generated oturum yüklenemez. Tekrar üretmek için aşağıdaki yapılandırma gerekir.
- Emülatörde Tasarımlarım kartı yaklaşık 3,9 piksel taşıyordu. Kart yüksekliği iki satırlık başlık/açıklama, işlem düğmeleri ve cihaz yazı ölçeğine yer ayırır.
- Tasarım adlandırma penceresinin controller’ı kapanış animasyonundan önce temizleniyordu. Controller artık pencere widget’ının yaşam döngüsünde temizlenir; adlandırma ve silme cihazda geçti.

## Tekrar çalıştırma

Web dizininde:

```sh
NEXT_PUBLIC_DESIGN_API_URL=/api/v1/design-studio NEXT_PUBLIC_COMMERCE_API_URL=/api/v1/local-commerce npm run build
npx playwright test representative-disclosure.spec.ts
```

Mobil dizininde:

```sh
flutter pub get
flutter analyze --no-pub
flutter test --no-pub
flutter test integration_test/pending_features_test.dart -d emulator-5554 --no-pub
```

Cihaz testleri asistan, katalog, hesap ve galeri depolarını test verisiyle değiştirir. Editör PNG’leri cihaz içindeki geçici HTTP sunucusundan gelir. Bu cihaz/web kontrolleri gerçek SMTP, SMS, Firebase veya AI teslimini kanıtlamaz. Teklif formu/takip ekranı açılışı kontrol edildi; tüm teklif kabul/mesajlaşma akışı bu beş cihaz testinin kapsamında değildir.

## Normal kullanım ve açık işler

Normal Android debug APK’sı `API_BASE_URL=http://10.0.2.2:5003` ile derlendi ve emülatöre yüklendi. 5003 API sağlık kontrolü başarılı. Gerçek kullanıcı siparişi/hesabı oluşturulmadı; gerçek maske onaylanmadı.

Firebase proje/APNs/hizmet hesabı erişimi, Netgsm test erişimi ve izinli alıcı, WhatsApp numarası eksik. Mobil Firebase SDK/izin/token bağlantısı da henüz uygulanmadı; girdiler geldikten sonra tamamlanıp gerçek cihazda doğrulanmalı. D03, D07 ve D10 kararları kullanıcı yanıtı bekliyor. Yerel ürün maskeleri için insan incelemesi gerekiyor. DevelopmentAcceptedSurfaceTests hatasının ilk başarısız koşusunun logu/test adı olmadığı için araştırma açık kalır.
