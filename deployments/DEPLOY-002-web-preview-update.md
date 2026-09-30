# DEPLOY-002 — Güncel web preview tam paket

- Tarih (Europe/Istanbul): 2026-09-30
- Kaynak: `main` / `14be3ea`
- Önceki gerçek yayın: DEPLOY-001 / `b5f87a8`
- Hedef: IIS `XinobiYeni`, `C:\inetpub\wwwroot\XinobiYeni\out`, `http://*:8014`
- Paket: `XinobiYeni-web-14be3ea.zip`
- Yerel konum: `/Users/beyzaturgut/Desktop/Xinobi/XinobiYeni-web-14be3ea.zip`
- SHA-256: `d89106d93fa8b1b243c4444d9064afa2dd058b191812b2c07bcde6ebd0f82d36`
- Boyut: yaklaşık 1.6 MB
- İçerik: 226 ZIP girdisi; 23 statik rota
- Durum: HAZIRLANDI — RDP aktarımı ve IIS güncellemesi bekleniyor

## Neden tam paket?

Next.js her derlemede ortak JavaScript/CSS parça adlarını değiştirebilir. Yalnız değişmiş sayfaları kopyalamak eski ve yeni parçaları karıştırabilir. Bu nedenle `out` klasörü atomik olarak bütünüyle değiştirilir; kaynak proje, SQL Server ve IIS binding ayarları değiştirilmez.

## Kapsanan değişiklikler

- DEPLOY-001 sonrası tamamlanan müşteri web ekranları ve durum kabukları.
- Katalog, ürün, kişiselleştirme/editör, favori, sepet, ödeme, hesap ve sipariş ekranları.
- Kurumsal teklif/takip, AI tasarım, satış asistanı ve Xinobi dünyası.
- Yasal merkez ve kalıcı kayıt oluşturmayan çerez tercih prototipi.

## RDP üzerinde güvenli yayın adımları

1. `XinobiYeni-web-14be3ea.zip` dosyasını örneğin `C:\deploy\` klasörüne aktarın.
2. ZIP'i `C:\deploy\XinobiYeni-web-14be3ea\` gibi yeni ve boş bir klasöre açın. İçinde doğrudan `out` klasörü görünmelidir.
3. IIS Manager'da `XinobiYeni` sitesini **Stop** edin.
4. `C:\inetpub\wwwroot\XinobiYeni\out` klasörünün adını `out-backup-deploy-001` yapın. Bu isim zaten varsa tarih/saat ekleyin; var olan yedeğin üzerine yazmayın.
5. Açılan paketteki yeni `out` klasörünü `C:\inetpub\wwwroot\XinobiYeni\` altına kopyalayın.
6. IIS Manager'da `XinobiYeni` sitesini **Start** edin. Physical Path yine `C:\inetpub\wwwroot\XinobiYeni\out` olmalı; binding `8014` değişmemeli.
7. Sunucu içinde `http://localhost:8014/`, `/urunler/`, `/asistan/`, `/xinobi/` ve `/yasal/` adreslerini kontrol edin.
8. Sunucu içi kontrol başarılı olduktan sonra dışarıdan `http://109.104.120.91:8014/` kontrol edilir.

## Geri alma

1. IIS `XinobiYeni` sitesini durdurun.
2. Başarısız yeni `out` klasörünün adını `out-failed-deploy-002` yapın.
3. `out-backup-deploy-001` klasörünün adını tekrar `out` yapın.
4. Siteyi başlatıp ana sayfa ve `/urunler/` rotasını doğrulayın.

## Sonuç

- Yerel artefakt bütünlük testi: başarılı.
- RDP aktarımı: bekliyor.
- IIS güncellemesi: bekliyor.
- Dış HTTP smoke: bekliyor.
- HTTPS: yapılandırılmadı; bu yayın preview niteliğindedir.
