# XINOBI mobil

Flutter uygulaması web ile aynı katalog ve hesap API’sini kullanır.

## Yerel kullanım

Android emülatörü varsayılan olarak `http://10.0.2.2:5003`, iOS simülatörü `http://127.0.0.1:5003` adresine bağlanır. Başka ortam için `--dart-define=API_BASE_URL=...` kullanılabilir.

```sh
flutter pub get
flutter run -d emulator-5554 --dart-define=XINOBI_WEB_PREVIEW_URL=http://10.0.2.2:3000
```

XINOBI U (renk seçimi, onaylı yüzeyler, önizleme) web kaynağını `XINOBI_WEB_PREVIEW_URL` ile bulur; verilmezse renkler "kullanılamıyor" görünür. Yerel web 3000'de çalışır; APK için `tools/build-apk.mjs` aynı değişkeni okur.

## Doğrulama

```sh
flutter analyze
flutter test
flutter test integration_test/pending_features_test.dart -d emulator-5554
```

Cihaz testleri Nobi yanıtı, teklif formu/takibi, tasarım adlandırma/silme ve editörün maske kontrolü, yerleştirme, boyut, döndürme, kaplama ve kaydetme akışlarını kontrol eder. Hesap/katalog/asistan depoları test verisidir; gerçek e-posta, SMS ve AI sağlayıcısına çağrı yapılmaz. Editör görselleri cihaz içindeki geçici HTTP sunucusundan yüklenir.

Test APK’sı normal uygulamanın yerine yüklenir. Testten sonra normal kullanım için `flutter run -d emulator-5554` ile uygulamayı yeniden başlat; test hedefini ve 5004 API adresini kullanma.

## Push için beklenen girdiler

Sunucuda FCM gönderici ve cihaz kayıt API’si bulunur. Mobilde Firebase SDK bağlantısı, bildirim izni ve token kaydı henüz uygulanmadı; yalnız yapılandırma dosyalarını eklemek yeterli değildir.

- Firebase proje kimliği ve proje erişimi.
- Android uygulaması: `com.xinobi.xinobi_mobile`; `google-services.json`.
- iOS uygulaması: `com.xinobi.xinobiMobile`; `GoogleService-Info.plist` ve APNs erişimi.
- Sunucunun kullanacağı hizmet hesabı dosyasının güvenli yerel yolu (`Push:Fcm:ServiceAccountPath`). Özel anahtarları Git’e veya sohbet mesajına ekleme.

Bu girdiler geldiğinde SDK/izin/yenilenen token kaydı eklenmeli, sunucu `Push:Provider=Fcm` ile yapılandırılmalı ve izinli bir test cihazında teslim doğrulanmalıdır. Gerçek push şu an doğrulanmış değildir.
