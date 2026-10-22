# TST-131 — Ortak maskede renk başına hizalama

20.10.2026 · Faz06 · Yerel deneme; commit/push yok. TST-126 geri dönüş talimatı sürer. Bu adımdan önceki dosya kopyaları: Claude oturumu scratchpad `before-alignment/`.

## Sorun

Ortak maske her renge aynı piksel koordinatlarıyla uygulanıyordu. Renk fotoğrafları ayrı çekildiği için ürün her karede birkaç piksel kayıyor, ölçeği/açısı değişiyordu; aynı boyut aynı konum demek değil.

## Değişiklik

- Referans maske tek kalır. Önizleme renginde başka bir renk seçilince maske o fotoğrafın üstünde gösterilir; sürükleyerek veya yatay/dikey kaydırma, ölçek %80–125 ve dönüş ±15° ayarlarıyla oturtulur. Ölçek/dönüş maskenin kapladığı alanın ortasına göre.
- Onayda hizalanan her renk kendi maske PNG'sini alır (sunucu aynı matrisi uygular, en yakın örnekleme + %50 eşik, ikili alfa). Hizalanmayan renkler referans maskeyi paylaşır.
- Eğri belgesi varsa hizalanan renk için noktaları taşınmış olarak saklanır; o renk yeniden açıldığında eğri düzenlenebilir.
- Son hizalamalar workspace'te saklanır; panel yeniden açılınca geri gelir. Referans rengi hizalanamaz; sınır dışı değer katalog değişmeden reddedilir.
- AI/Roboflow çağrısı yok; yeni paket yok.

## Kontroller

- ProductSurfaceWorkspaceTests: **14/14** (yeni: kaydırma+ölçek sonrası kare maske piksel konumu, referans maskenin değişmemesi, taşınmış eğri noktaları, sınır dışı ve referans hizalama reddi, sağlayıcı 0).
- Tam .NET: 429 başarılı / 23 atlandı / **1 başarısız** — `AuthorizationTests.OnlyListedAreasArePublic`: TST-130'da anonim yapılan rendering-inputs adresi izinli public listesinde değil. Bu değişiklikten bağımsız; dokunulmadı.
- Admin build başarılı; lint hata yok, mevcut 3 uyarı.
- `node tools/test-guided-surface-admin.mjs` (varsayılan, `--expired-session`, `--provider-failure`, `--manual-masks`, `--mask-prompt`): başarılı. Varsayılan akış kaydırma alanları + %110 ölçek sonrası canvas'ta taşınmış kenarı ve onay isteğinde yalnız hizalanan rengin değerlerini doğrular. Test seçicilerindeki eski çakışma (prompt metninde “Küçük”) checkbox rolüne daraltıldı.
- `--failed-refresh`: zaman aşımı; bu değişiklikten önceki dosyalarla da aynı şekilde başarısız.
- `git diff --check` başarılı. Yerel servisler yeni kodla yeniden başlatıldı (API/web/admin 200).

Gerçek ürün fotoğraflarıyla hizalama kalitesi kullanıcı denemesinde değerlendirilecek.
