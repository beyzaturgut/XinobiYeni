# TST-121 — Kaba kılavuzdan Roboflow maskesi ve ortak renk onayı

Tarih: 16.10.2026 · Kaynak: `cd96d5c` sonrası çalışma · Faz03/06/10. İzole fixture, sahte Roboflow HTTP sağlayıcısı ve sahte tarayıcı API'leri. Gerçek katalog, SQL veya sağlayıcı verisi değiştirilmedi.

## Davranış

Kaba boyamanın iç kısmından sınırlı sayıda pozitif nokta çıkarılır; gerçek fotoğrafla mevcut SAM3 visual endpoint'ine gönderilir. Sonuç taslak kalır; kaba maskeye kırpılmaz. Bir onay aynı koordinat maskesini seçilen, aynı boyuttaki renklerde tek katalog güncellemesiyle kaydeder. Web geliştirme renderer'ına exact ürün/varyant ve SHA ile okunur köprü eklendi. Yayın veya gerçek AI kalite kabulü verilmedi.

## Kontroller

- `dotnet test XinobiYeni.slnx --no-restore`: **422 başarılı / 23 atlandı / 0 başarısız** (son koşu 38 sn). Gerçek SQL/özel fixture gerektiren testler atlandı.
- Odaklı ProductSurfaceWorkspaceTests: **8/8**. Kaba çizimden visual payload, ince taşmadan uzak örnekleme, ince çizgi reddi, stale guide, eksik hizalama teyidi, yanlış fotoğraf/boyut reddi, kısmi onay olmaması, tek inference ile iki renk onayı, katalog maskesi ve rendering bundle kimliği.
- `node tools/test-shared-surface-rendering.mjs`: başarılı; aynı maske/farklı renk kaynağı, karışık kimlik, harici medya URL'si ve aşırı boyut reddi.
- `node tools/test-guided-surface-admin.mjs`: başarılı; masaüstü kaba çizim/kaydet, açık AI işlemi, örnek desen/renk önizlemesi, uyumsuz renk kapalı, tek onay iki renk, 390 px taşma kontrolü; tarayıcı hatası 0. Ekran görüntüsü `/tmp/xinobi-guided-surface-admin.png` (sahte gri fotoğraf; gerçek ürün kalite kanıtı değildir).
- Admin build ve lint, web TypeScript ve değişen web dosyaları lint kontrolü. Admin lint mevcut uyarılarla çıkış 0; hata yok.
- `git diff --check`: başarılı. Public OpenAPI değişmedi; deneysel uçlar varsayılan üretim sözleşmesine eklenmez.

## İlk denemeler ve düzeltmeler

- İlk .NET koşusu sandbox named-pipe/socket izni nedeniyle başlayamadı; izinli tekrar geçti.
- Tarayıcı testinin ilk çalışması `sharp` modül çözümlemesinde durdu; mevcut Next bağımlılığından çözülerek giderildi. Yeni paket eklenmedi.
- Sonraki tarayıcı başlangıcı sandbox loopback dinleme izniyle engellendi; izinli tekrar kullanıldı.
- Dar ekran kontrolü uzun ayar adının metin taşmasını yakaladı; geliştirme açıklamasına satır kırma eklendi.
- Web dosya lint komutunda ilk olarak projede olmayan `oxlint` denendi; projenin mevcut `eslint` komutuyla tekrar kontrol edildi.
- İlk UI fixture'ı eski review yanıtına boş nesne verdi ve demo bileşeninde hata üretti; eski review fixture'da 503 ile kapatıldı. Düzeltilen test geçti; gerçek eski review kodu değiştirilmedi.

## Açık sınırlar

Gerçek Roboflow ile kenar kalitesi, gerçek ürün hizalaması ve mobil cihaz davranışı doğrulanmadı. Aynı boyut farklı açı/kırpımı otomatik tespit etmez. Yeni deneysel workspace bayrağı açık olmadan düğüm API'si kullanılamaz. Canlı deployment yapılmadı.
