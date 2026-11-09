# TST-265 — KIS-TEK-08 Flutter tek kaynak geçişi

09.11.2026 · İzole repository/widget testleri. Gerçek müşteri, sipariş, SQL veya sağlayıcı kaydı kullanılmadı.

## Teslim

Ürün bazlı üretilmiş API DTO'su ve sıkı medya/sürüm doğrulaması; autoDispose ürün provider'ı; renk istemeyen katalog/yöntem/anket/WebView yönlendirmeleri; kaynak+maske kimliğine bağlı yeni kalıcı oturum namespace'i; eski session/placement/configuration kayıtlarını koruma. Eski kullanılmayan native renk editörü paylaşılan web renderer'a compatibility yönlendirmesi oldu. Kayıt/sepetin 09'a bağlı geçiş kapısı hem native sonuçta hem web önizlemede açıkça gösterilir.

## Sonuçlar

- **flutter analyze: No issues found.**
- **flutter test: 298 PASS / 0 FAIL.** Normal katalog renk/galeri/fiyat/stok, hesap, adres, sepet/checkout, sipariş/kargo ve eski kayıtlı tasarım yerleşimi dahil.
- Yeni ürün sözleşmesi: doğru product/scope/schema/sourceRevision/ID, farklı hashlerin korunması, gerçek 5001×4000 ve 7001×5 metadata. Yanlış ürün/hash/dış medya veya eksik onayla başka renge/pakete fallback yapılmaması.
- Repository: yalnız ürün rendering-inputs GET'i; 404 onaysızlık, 503 hata; bozuk sözleşme güvenli hata. Test Dio adapter'ı tüm yanıtları bellekten verir; ağ yok.
- Yeni kalıcı cache anahtarı: yeniden açılışta aynı source/surface session ve cevaplar; ürün/sürüm değişiminde ayrım; eski renk anahtarlarının silinmeden korunması.
- Loading/error/retry/onaysız durumları; yeniden denemede yöntem seçimi; anket yeniden açma/başarısız üretimde cevapları koruma; çift üretim engeli; üründen ayrılırken bekleyen istekten oturum başlatmama.
- Android ve iOS TargetPlatform temaları ayrı: her birinde **320/390/768 × %200**, 3/3 PASS. Ortak ekran matrisinde 390/%200 XINOBI U liste testi PASS.
- İlk odaklı koşuda ürün kartının ikinci düğmesi %200 metinde yatay taştı: dar/büyük metinde alt satıra alındı. Tam pakette ürün listesinin uzun durum metni dikey taştı: ortak küçük kart tipografisine taşındı. İki kusur da ilgili test ve son tam koşuyla doğrulandı.
- Eski seçili renge fallback/oturum gönderme ve raw-result kaydet beklentileri yeni ürün/sürüm ve açık 09 kapısına güncellendi. Entegrasyonun artık çağrılmayan native galeri senaryosu güncel yöntem girişiyle değiştirildi; cihazda çalıştırılmadı.

## Platform kabulü ve açık işler

| Platform | Otomatik durum | Gerçek cihaz |
|---|---|---|
| Android | Widget teması 3/3 PASS; ortak paket PASS | Cihaz/emülatör bağlı değil; WebView/picker/TalkBack açık |
| iOS | Widget teması 3/3 PASS; ortak paket PASS | iPhone/simülatör yok, simctl kullanılamıyor; WebView/picker/VoiceOver açık |

[Android kaydı](../../docs/reports/mobile-single-source-android-2026-11-09.md) · [iOS kaydı](../../docs/reports/mobile-single-source-ios-2026-11-09.md).

Bu teslim gerçek OS derlemesi/galeri/ekran okuyucu kabulü değildir. Yeni revizyon/sepet ve ticari SKU/fiyat/stok eşleme, AI sunucu fallback kaldırma **09**; sipariş dosyaları **10**; eski belge/test temizliği **11**; tüm zincir/gerçek cihaz kabulü **12** kapsamında açık. Eski veriler yeniden yazılmadı. Native süreç veya ana web document kapanırsa dosyanın yeniden seçilmesi gerekir; kalıcı upload vaadi yok. Deploy/APK/iOS arşivi üretilmedi.

[Rehber](../../docs/runbooks/single-source-mobile.md).
