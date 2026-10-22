# TST-126 — Yerel eğrili çizim ve PNG maske denemesi

16.10.2026 · Faz06 · başlangıç `adac37a` · Kullanıcı yalnız local deneme ve push yapılmamasını istedi. Çalışma ağacı başlangıçta temiz; geri dönüş manifesti `/private/tmp/xinobi-curve-trial-20261016-adac37a/manifest.json`.

## Değişiklik

SVG üzerinde düğüm ekleme/sürükleme, otomatik kapalı kübik eğri, yumuşaklık, zoom/scroll, çoklu desen bölgesi, hariç alan, geri al ve nokta silme. Sunucu aynı kontrol noktalarıyla RGBA PNG üretir. Düzenlenebilir eğri belgesi taslakta ve onaylı maskeyle ilişkili local sidecar'da saklanır. PNG alpha ve luminance importu, exact kaynak kimliği/boyut doğrulaması, 8 MB dosya sınırı ve boş/tam dolu maskeyi red. İki uç da mevcut Development/loopback/personel catalog.write kapısında. Sağlayıcı çağrısı yok.

## Kontroller

- Admin TypeScript/build ve lint: başarılı; mevcut lint uyarıları, hata yok.
- İlk backend derlemesi SKPath mutasyon metotlarının güncel SkiaSharp sürümünde obsolete-as-error olmasına takıldı. Kurulu paket XML belgeleriyle SKPathBuilder/Detach API'sine geçirildi; sonraki derleme geçti.
- Odaklı ProductSurfaceWorkspaceTests: **13/13**. Eğri taslağı, iki bölge/hariç alan, source SHA reddi, alpha/siyah-beyaz PNG eşdeğerliği, yanlış boyut/bozuk/opaque-full PNG reddi, başarısız importta önceki taslağı koruma, sağlayıcı 0. Onay sonrası editable curve belgesi yeniden açılması son odaklı koşuda doğrulandı.
- Tam .NET: **429 başarılı / 23 atlandı / 0 başarısız**, 42 sn. Bu koşu onay sonrası sidecar yeniden açma ekinden önceydi; son ek odaklı koşuyla kontrol edildi. Atlananlar gerçek SQL/özel fixture gerektirir.
- `node tools/test-guided-surface-admin.mjs --manual-masks`: başarılı. Nokta ekleme, sürükleme, hariç alan, eğri kaydı, PNG yükleme, 390 px taşma kontrolü, browser error0, inference0, approval0. Görsel `/tmp/xinobi-curve-mask-trial.png` incelendi (sahte gri fotoğraf).
- `node tools/test-guided-surface-admin.mjs --expired-session`: başarılı; önceki fırça ve personel refresh akışı korunuyor.
- `git diff --check`: başarılı.

Testler izole yerel veri ve sahte HTTP ile yapıldı. Kullanıcının gerçek ürün maskesi test sırasında değiştirilmedi. Gerçek ürün üzerinde final çizim kalitesi kullanıcı denemesinde değerlendirilecek. Push ve canlı deployment yok.
