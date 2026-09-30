# TST-036 — DEPLOY-001 dış HTTP smoke tekrar testi

- Tarih: 2026-09-30
- Hedef: `http://109.104.120.91:8014`
- Ön koşul: Windows Firewall inbound TCP 8014 kuralı eklendi

## Sonuç

- `/`: HTTP 200, `Microsoft-IIS/10.0`, Xinobi HTML içeriği başarılı.
- `/urunler/`: HTTP 200, katalog başlığı başarılı.
- `/kurumsal/teklif/takip/`: HTTP 200, teklif takip başlığı başarılı.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN` başlıkları görüldü.
- Sonuç: BAŞARILI.

## Açık risk

Yayın yalnız HTTP üzerindedir. HTTPS sertifikası/binding'i ve alan adı doğrulanmadan üretim veya gerçek kullanıcı trafiğine hazır sayılmaz.
