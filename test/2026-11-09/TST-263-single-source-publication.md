# TST-263 — KIS-TEK-06 tek kaynak yayın API ve sözleşme

Tarih: 09.11.2026. İzole fixture; gerçek müşteri/katalog/sipariş veya sağlayıcı verisi test amacıyla değiştirilmedi.

## Teslim

Ürün bazlı aktif/onaylı yayın ve sürüm+hash kontrollü medya uçları eklendi. Kaynak değişimi/geri alma eski yayın URL'sini geçersiz kılar. Yeni taslak onayı sessizce değiştirmez. Geçmiş varyant GET desteği korundu; beş eski yazma rotası 410 döndürür, çoğaltma/yazma uygulaması kaldırıldı. Gerçek boyutlu tek kaynak maske işlemesi yapılandırılabilir RAM bütçesine geçirildi; otomatik küçültme yok. OpenAPI, TS ve Dart üretildi; salt okunur sürüm denetim manifesti aracı hazır.

## Doğrulama

- Odaklı API: 38 PASS / 0 FAIL; yatay/dikey/kare, 5001×4000 (>20 MP), düşük RAM bütçesi 413 ve kaynağı koruma, güncel onay, kaynak değişimi/revoke, yanlış ürün/hash, bozuk maske, anonim çalışma alanı engeli, eski uçların veri değiştirmeden 410 vermesi.
- Tam API: **615 PASS / 29 SKIP / 0 FAIL**. `dotnet test tests/Xinobi.Architecture.Tests --no-restore -m:1 -p:UseSharedCompilation=false --verbosity quiet`. Atlanan testler geçmiş SQL/dış ortam kabulünü geçti sayılmaz.
- İlk tam koşuda yeni anonim okuma alanı izin envanteri testi düştü. `OnlyListedAreasArePublic` açık yayın namespace'ini kapsayacak şekilde güncellendi; son tam koşu geçti.
- API Release: **0 hata / 0 uyarı**; OpenAPI üretildi.
- TypeScript istemci: `tsc --noEmit` PASS. Web tip kontrolü PASS.
- Dart istemci: analiz temiz, **10 sözleşme testi PASS**; kaynak/maske SHA ayrımı, 5001×4000 tuval, sürüm ve JSON round-trip. Generator'ın `source_` Dart adı kullanıldı; wire adı değişmedi.
- Flutter analiz: hata/uyarı yok. Gerçek Android/iOS kabulü yapılmadı.
- Admin lint: 0 hata, 1 mevcut AuditHistory set-state-in-effect uyarısı. Admin tip kontrolü ve üretim derlemesi PASS.
- Yayın araçları: **5/5 PASS**. Yeni araç yanlış/bozuk/eski/başka ürüne ait yüzeyi, keyfi dış medya URL'sini reddeder; önceki varyant fixture yayını regresyonu geçer.
- Admin odaklı tarayıcı: tek kaynak maske ve kaynak katalog senaryoları, yalnız fixture API ile çalıştırıldı. İlk başlangıçta koruma varsayılan 5174 portunu beklediği için navigasyonu engelledi; ADMIN_UI_URL=5173 ile düzeltildi. Son koşuda iki dosya da PASS: maske yükleme/onay/export/hata/kaynak değişimi/yetki/prompt/responsive/axe ve katalog kaynak boş/hata/eski/kayıt/dirty guard/byte eşliği/%200 senaryoları.

## Kapsam ve sınır

Web/Flutter ekran geçişi, tasarım/sepet/sipariş sözleşmesi ve tüm zincirin kabulü **07–12** kapsamında açık. Gerçek veri geçişi, üretim baskısı, deploy veya APK yok. Gerçek IIS/SQL çoklu süreç veya ekran okuyucu/cihaz kabulü olarak sunulmaz. Eski 20 MP limiti yalnız yeni tek kaynak maske akışında RAM bütçesiyle değiştirildi; diğer araçların limitleri korunur.

[Uygulama ve operatör rehberi](../../docs/runbooks/single-source-publication.md).
