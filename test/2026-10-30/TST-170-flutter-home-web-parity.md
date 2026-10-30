# Flutter ana sayfa / web önizleme yerleşimi / 30.10.2026

Kullanıcı web ve Android görsellerini paylaşarak webdeki düzeni Flutter’a istedi. Web `personalization-feature.module.css` <=700px kuralı ürün için ayrı satır kullanıyor; Flutter `_Visual` eski 370px Stack içinde soru kartını ürünün üzerine yerleştiriyordu.

## Değişiklik

`apps/mobile/lib/features/home/home_sections.dart`: label, 300px ürün satırı, 14px aralık ve altta Expanded soru kartı + 90px desen kartı. Desen kartı alt hizalı; 14px panel iç payı ve kart stilleri web küçük ekran referansından alındı. Temsilidir etiketi ürün satırının sol altına eklendi. Panel yüksekliği içerikten hesaplanır; büyüyen metin kesilmez. Mevcut ürün/desen assetleri ve Tasarımını keşfet rotası korundu. Web/API/admin ve veri değiştirilmedi. Bu ana sayfa tanıtım alanıdır; soru seçenekleri gerçek AI anketine dönüştürülmedi.

## Kontroller

- TST-170 / STATIC: `flutter analyze` PASS, analiz sorunu yok (repo kökü ve apps/mobile koşuları).
- TST-171 / FLUTTER WIDGET: `flutter test test/home_personalization_layout_test.dart` / görsel koşuda `XINOBI_CAPTURE_HOME=1 flutter test --update-goldens test/home_personalization_layout_test.dart`: 7/7 PASS. 320/390/700px x 1/2 metin ölçeği: ürün-kartlar örtüşmüyor, panel yatay sınırları korunuyor, kartlar alt hizalı. CTA /xinobi-u açıyor.
- TST-172 / FLUTTER FIXTURE: `flutter test` PASS 79/79, mevcut hesap/katalog/sepet/editor testleri dahil. Testler gerçek SQL/sağlayıcı/cihaz kabulü değildir.
- TST-173 / VISUAL: 390px gerçek ürün/desen assetli widget çıktısı `/tmp/xinobi-flutter-home-preview.png` incelendi. Ürün tamamen görünür; soru kartı ürünün altında, desen kartı sağ altta. İlk test görüntüsünde Flutter Ahem fontu vardı; Inter ve MaterialIcons çizimden önce yüklendi ve 7 test tekrar geçti. Test host’unda dekoratif Unicode işaretlerinin fallback glyph’leri Android fontunu temsil etmez; bu metinler üretim kodunda değiştirilmedi.
- TST-174 / STATIC/GIT: `git diff --check` ve odaklı diff kontrolü başarılı; upstream kontrolü commit öncesi yapılır.

İlk test dosyası oluşturma komutunda çalışma dizini iki kez yazıldığından dosya oluşmadı; test başlatıcısı dosyayı bulamadı. Doğru apps/mobile/test yolunda oluşturuldu; başarılı 7/7 tekrar ve tam paket yukarıda kayıtlı. Başarısız deneme uygulama hatası değildi.

Android/iOS bağlı cihaz bulunmadı; fiziksel telefon ekran görüntüsü veya uygulama kurulumu yapılmadı. APK/release/deploy üretilmedi. Telefonda güncel native yerleşimi görmek için güncel uygulama sürümü yüklenmeli. Görev tüm web sayfasını WebView’a dönüştürmek veya masaüstü düzenini telefona sıkıştırmak değildir; hedef paylaşılan mobil web tanıtım yerleşimidir.
