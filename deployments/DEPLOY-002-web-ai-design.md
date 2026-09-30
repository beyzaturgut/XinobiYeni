# DEPLOY-002 — WEB-017 AI tasarım preview güncellemesi

- Tarih (Europe/Istanbul): 2026-09-30
- Kaynak: `main` / `135fd9c`
- Hedef: IIS `XinobiYeni`, `C:\inetpub\wwwroot\XinobiYeni\out`, `http://*:8014`
- Paket: `XinobiYeni-web-135fd9c.zip`
- SHA-256: `b2f0f7aa2ec80859964883d227973b28f606a4ac88c3fbf9f2bd904ce08e6e22`
- İçerik: 176 dosya; 20 statik rota
- Durum: HAZIRLANDI — RDP aktarımı bekleniyor

## Değişiklik

- WEB-017 `/studio/ai/` AI tasarım arayüzü.
- Gelişmiş editörden AI fikir ekranına bağlantı.
- Gerçek AI çağrısı, veri gönderimi veya kota kullanımı yok.

## Güvenli yayın planı

1. Mevcut `out` klasörünü `out-backup-deploy-001` adıyla yedekle.
2. Yeni ZIP'i geçici klasöre aç.
3. Yeni paketteki `out` klasörünü hedefe yerleştir.
4. IIS `XinobiYeni` sitesini yeniden başlat.
5. Ana sayfa, `/studio/ai/` ve `/urunler/cay-makinesi-101/editor/` rotalarını test et.
6. Hata halinde yeni `out` klasörünü kaldırıp yedeği tekrar `out` yap.

## Sonuç

- RDP aktarımı: bekliyor.
- Dış HTTP smoke: bekliyor.
- HTTPS: yapılandırılmadı.
