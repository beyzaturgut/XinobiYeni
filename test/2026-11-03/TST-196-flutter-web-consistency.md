# Flutter–web tasarım/davranış eşliği / 03.11.2026

Kapsam ve kusur matrisi: [design/flutter-consistency-audit-2026-11-03.md](../../design/flutter-consistency-audit-2026-11-03.md). Görev: Flutter ekranlarını güncel web ile karşılaştırmak; metin, görsel, kart, buton ve işlem geri bildirimini eşitlemek; yüklenme, boş, hata ve başarı durumlarını tamamlamak. Android ve iOS sonuçları ayrı kaydedilir.

## Kontroller

- **TST-196 / STATIC:** `flutter analyze` (apps/mobile) — PASS, sorun yok.
- **TST-197 / WIDGET:** `flutter test test/favorites_test.dart test/request_states_test.dart` — PASS 13/13. Kapsam: hesap favorisi, hata ve tekrar dene, eski listenin taşınması, temizleme onayı, oturum kapalıyken giriş sonrası kayıt, ham hata metni gizleme, sipariş/iade seçenek hatası, bilinmeyen sipariş, bildirim kilidi, tasarım adı taslağı.
- **TST-198 / WIDGET MATRİS:** `flutter test test/screen_matrix_test.dart` — PASS 193/193 (192 rota hücresi + Android 14 tarzı doğrusal olmayan ölçek). İlk koşu 11 hücrede taşma verdi (ürün kartı, XINOBI U kartı, sepet boş/satır, adres rozeti, sipariş satırı, tasarım işlem satırı ×2, favori mesajı ×2). Düzeltmelerden sonra bir hücre kaldı (XINOBI U, 390 px, 2x, 14 px); o da düzeltildi.
- **TST-199 / FLUTTER FIXTURE:** `flutter test` — PASS 280/280. Ara koşuda iki eski test düştü:
  - `news_test`: Platform anahtar deposu test ortamında yanıt vermediği için uygulama kabuğu oturum açılışında asılı kalıyordu. Test kabuğuna bellek içi depo verildi; üretimde de okunamayan depo artık çıkış durumuna düşüyor (M11).
  - Adres testi: Yeni başarı bildirimi ve hata metni düğmeyi kaydırdığı için testte görünür alana kaydırma eklendi.
- **TST-200 / ANDROID EMÜLATÖR:** Pixel_8 AVD, Android 15, debug APK, yerel API `10.0.2.2:5003`. Oturum kapalı durumda şunlar denendi:
  - Ana sayfa ve ürünler (1x): doğru.
  - Kalbe dokunma: giriş ekranı ve "Favorilere eklemek için giriş yap." mesajı açıldı.
  - Favoriler: giriş yap durumu gösterildi.
  - OS yazı ölçeği 2.0'da ürünler, XINOBI U ve boş sepet denendi.
  - İlk 2.0 denemesinde ürün adı yarıda kesildi (M10). Düzeltilip APK yeniden kuruldu; ad iki satır + üç nokta, fiyat görünür.
  - Görseller: [flutter-parity/](flutter-parity/) (android-*.png). Yazı ölçeği 1.0'a geri alındı.
  - Oturum açık akışlar cihazda denenmedi; kullanıcının yerel veritabanında hesap açılmadı.
- **TST-201 / iOS:** BLOKE. `xcodebuild` yok (yalnız `/Library/Developer/CommandLineTools`), `simctl` yok. iOS derlenmedi, çalıştırılmadı ve ekran alınmadı.
- **TST-202 / STATIC/GIT:** `git diff --check`, odaklı diff incelemesi; push öncesi upstream fetch.

## Sınırlar

Bu kayıt fiziksel telefon, TalkBack/VoiceOver, gerçek ödeme, push, SQL kabulü veya Creative/UX/PM onayı değildir. APK paketi, release veya deploy üretilmedi; emülatöre yalnız debug derlemesi kuruldu. `dart format` bir kez yanlışlıkla tüm `designs.dart` dosyasını yeniden biçimlendirdi. Dosya git'ten geri alındı ve yalnız amaçlanan değişiklikler yeniden uygulandı.
