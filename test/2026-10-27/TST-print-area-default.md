# Baskı alanı varsayılan kapalı — 27.10.2026

Ortak PlacementStudio bileşeninde showArea başlangıcı false yapıldı. Web AI/kendi görseli ve mobil WebView aynı bileşeni kullanır. Kullanıcı checkbox ile alanı açabilir; maske/render, kayıtlı yerleşim ve baskı davranışı değişmez.

Doğrulama: yerel /xinobi-u/onizleme/ sayfası yeniden yüklendi; ürün çizildikten sonra “Baskı alanını göster” checkbox değeri 0 (işaretsiz). Dosya bazlı ESLint ve git diff --check geçti. Mobilin MobilePreviewScreen WebView yönlendirmesi kaynakta doğrulandı; fiziksel telefon testi yapılmadı. Yeni APK veya canlı deploy yok; mobilde sunulan web güncellendiğinde aynı varsayılan uygulanır.
