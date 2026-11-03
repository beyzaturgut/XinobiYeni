# TST-203 — Flutter eşlik çalışması bağımsız incelemesi / 03.11.2026

İncelenen kaynak: temiz `main / 5da96ed`. Kullanıcı tamamlandığını belirttiği Flutter–web eşlik maddesini incelememizi istedi. Bu kayıt incelemedir; uygulama kaynakları değiştirilmedi.

## Yeniden doğrulama

- `flutter analyze` (apps/mobile): PASS, sorun yok. Log: `/tmp/xinobi-flutter-review-analyze.log`.
- `flutter test` (apps/mobile): PASS **280/280**. Log: `/tmp/xinobi-flutter-review-tests.log`.
- Mevcut test/audit raporu, 192 hücre + doğrusal olmayan ölçek testi ve Android görüntüleri incelendi. Bu incelemede Android/iOS cihaz testi tekrar çalıştırılmadı.
- Üç ek izole tanılama testi mevcut davranışı doğruladı: `/tmp/xinobi_review_probe_test.dart`, `flutter test /tmp/xinobi_review_probe_test.dart --no-pub`. 3/3 tamamlandı; bunlar kusurun oluştuğunu doğrulayan testlerdir, ürün kabulü PASS değildir. Yalnız FakeAccounts, MemoryTokens ve SharedPreferences mock kullanıldı; gerçek hesap/sunucu yazması yok.
- İlk tanılamada Riverpod bağımlılığı değişince eski `favoritesProvider.future` beklemede kaldı. Koşu durduruldu; bu eski future'a200ms sınır konarak veri deposu etkisi ayrıca gözlendi. Başarılı üç tekrar `/tmp/xinobi-flutter-review-probes-final.log` altında.

## Doğrulanan bulgular

### R01 / P1 — İptal edilen favori yazmasını sunucu teyidi sayma

`apps/mobile/lib/features/favorites/favorites.dart:46`,`:52`,`:59–62`.

`withSession` oturum sona erdiğinde exception yerine null dönebiliyor. Yeni favori kodu bu sonucu kontrol etmiyor. İzole tekrar:

1. Geçerli saklı token ile giriş; favori listesi boş.
2. `addFavorite`401, sonraki refresh401; AuthController SignedOut olur ve withSession null döner.
3. `toggle('P1')` buna rağmen true döner; çağıran `toggleFavorite` bunu “Favorilere eklendi” diye duyurur.
4. Aynı kesinti eski cihaz favorilerini taşırken olursa `addFavorite` sunucuda kaydedilmemiş olmasına rağmen eski SharedPreferences anahtarı kaldırılır. Repro sonunda sunucu fixture listesi boş, yerel anahtar yok, oturum kapalıdır.

Kapanış: yazma sonucunu ve hesap bağlamını açıkça doğrula; iptal/oturum değişiminde başarı veya liste mutasyonu üretme; bütün geçerli ürünler sunucuya teyitli taşınmadan eski anahtarı silme. Null dönebilen `Future<void>` sonucunu başarıdan ayıramamak için withSession içinde açık sentinel sonucu taşıyan callback veya exception sözleşmesi kullanılmalı. Bu sınır için regresyon eklenmeli.

### R02 / P2 — Oturum servis kesintisini giriş yapılmamış durumundan ayır

`apps/mobile/lib/features/account/auth.dart:333–339`.

Saklı, geçerli token varken refresh geçici servis hatası/bağlantı kesintisi dönerse `_restore` SignedOut yayınlıyor. İzole refresh `AccountException('unavailable',...)` tekrarında token korunmasına rağmen durum SignedOut: hesap ekranı giriş formu, favoriler ekranı giriş isteği gösterir; servis hatası/yeniden deneme ekranı yok. Bu mantık önceki kaynakta da vardı; yeni görevin istek durumları eşliği kapsamında giderilmemiş bir açık, yeni favori özelliğinin getirdiği bir regresyon diye sunulmaz.

Kapanış:401/gerçek geçersiz oturum ile servis/anahtar deposu hatasını ayır; tokenı koruyarak açıklama ve tekrar deneme sağla. Açılış503/ağ/keystore ve401 senaryolarını ayrı test et.

## Platform kabulü

- Android: önceki TST-200 yalnız emülatörde oturum kapalı akışları ve OS2.0 yazı ölçeğini kanıtlıyor; oturum açık gerçek favori/adres/sipariş/iade cihaz kabulü açık.
- iOS: önceki TST-201 BLOKE; Xcode/simülatör olmadığı için build/çalıştırma kanıtı yok. Widget matrisi iOS cihaz kabulü değildir.
- Sonuç: teknik uygulama büyük ölçüde yapılmış; **bu iki bulgu ve platform kabul açıkları nedeniyle maddeyi tamamen kapatmak uygun değil**. Gerçek telefon/TalkBack/VoiceOver/sağlayıcı/handoff kabulü verilmedi.
