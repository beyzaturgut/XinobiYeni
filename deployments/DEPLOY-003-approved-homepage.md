# DEPLOY-003 — Onaylı ana sayfa ve güncel web tam paketi

- Tarih (Europe/Istanbul): 2026-10-02
- Kaynak: `main` / `5445569`
- Önceki yayın paketi: DEPLOY-002 / `14be3ea`
- Hedef: IIS `XinobiYeni`, `C:\inetpub\wwwroot\XinobiYeni\out`, `http://*:8014`
- Paket: `XinobiYeni-web-5445569.zip`
- Yerel konum: `/Users/beyzaturgut/Desktop/Xinobi/XinobiYeni-web-5445569.zip`
- SHA-256: `83e007a3cbc0094840a3b1d010437f876c8e350cf3f803441065bc477dc7614c`
- Boyut: yaklaşık 9.3 MB
- İçerik: 233 ZIP girdisi; doğrudan `out` kökü; 23 statik rota
- Durum: HAZIRLANDI — RDP aktarımı ve IIS güncellemesi bekleniyor

## Kapsam

- Kullanıcı tarafından onaylanan ana sayfa tasarımının gerçek Next.js `/` rotasına aktarılması.
- Üç yeni slider görseli ve XINOBI U bannerı.
- Header ikonları, kategori menüsü/rayı ve eşit hizalı öne çıkan ürünler.
- Ortak Nobi robot sembolü, küçültülmüş tetikleyici ve Nobi paneli.
- Nobi ile çakışmaması için sol alta taşınmış çerez tercihleri düğmesi.
- DEPLOY-002 sonrasındaki diğer kaynak değişikliklerini de içeren tam statik export.

## Neden tam paket?

Next.js ortak CSS/JavaScript parça adlarını her buildde değiştirebildiği için yalnız değişmiş dosyalar kopyalanmaz. Eski ve yeni parçaların karışmasını önlemek amacıyla `out` klasörü bütünüyle değiştirilir.

## RDP üzerinde yayın adımları

1. `XinobiYeni-web-5445569.zip` dosyasını RDP sunucusunda `C:\deploy\` klasörüne aktarın.
2. ZIP’i yeni ve boş `C:\deploy\XinobiYeni-web-5445569\` klasörüne açın; içinde doğrudan `out` görünmelidir.
3. IIS Manager’da `XinobiYeni` sitesini **Stop** edin.
4. `C:\inetpub\wwwroot\XinobiYeni\out` klasörünü `out-backup-deploy-002` olarak yeniden adlandırın. İsim doluysa tarih/saat ekleyin; mevcut yedeğin üzerine yazmayın.
5. Paketten çıkan yeni `out` klasörünü `C:\inetpub\wwwroot\XinobiYeni\` altına kopyalayın.
6. Physical Path’in `C:\inetpub\wwwroot\XinobiYeni\out`, binding’in `8014` olduğunu kontrol edin.
7. IIS sitesini **Start** edin.
8. Sunucu içinde `http://localhost:8014/`, `/urunler/`, `/asistan/`, `/xinobi/` ve `/yasal/` adreslerini kontrol edin.
9. Ardından dışarıdan `http://109.104.120.91:8014/` adresini kontrol edin.

## Geri alma

1. IIS sitesini durdurun.
2. Yeni `out` klasörünü `out-failed-deploy-003` olarak yeniden adlandırın.
3. `out-backup-deploy-002` klasörünü tekrar `out` yapın.
4. Siteyi başlatıp ana sayfa ve `/urunler/` rotasını doğrulayın.

## Sonuç

- Yerel build, E2E, erişilebilirlik, responsive ve ZIP bütünlük kontrolleri başarılı.
- RDP aktarımı ve canlı IIS smoke henüz yapılmadı; kullanıcı uyguladıktan sonra DEPLOY-003 canlı durumu ayrıca kaydedilecek.
