# TST-035 — DEPLOY-001 IIS yayın ve dış erişim

- Tarih: 2026-09-30
- Kaynak commit: `b5f87a8`
- Site: `XinobiYeni`
- Hedef: `C:\inetpub\wwwroot\XinobiYeni\out`
- Binding: `http://*:8014`

## Sonuç

- ZIP RDP ile sunucuya aktarıldı ve açıldı.
- IIS sitesi oluşturuldu; fiziksel yol `out` klasörüne düzeltildi.
- Proje sahibi `http://localhost:8014` adresinde uygulamanın açıldığını bildirdi: BAŞARILI.
- Dış istemciden `curl -I http://109.104.120.91:8014/`: 10 saniye timeout, çıkış kodu 28.
- İç rotaların dış testi ana bağlantı kurulamadığı için çalıştırılmadı.

## Değerlendirme

Deployment sunucu içinde çalışıyor. Dış yayın Windows Firewall ve varsa AWS security group/NAT inbound TCP 8014 kuralı doğrulanana kadar kısmi başarılıdır. HTTPS sertifikası/binding'i olmadan canlı üretim kabulü verilmez.
