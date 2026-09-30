# TST-042 — DEPLOY-002 güncel IIS paket bütünlüğü

- Tarih: 2026-09-30
- Kaynak commit: `14be3ea`
- Paket: `XinobiYeni-web-14be3ea.zip`

## Sonuç

- Güncel `apps/web/out` tam klasörü paketlendi; yalnız değişen dosya paketi kullanılmadı.
- ZIP içinde 226 girdi bulunuyor.
- Boyut yaklaşık 1.6 MB.
- `unzip -t` sonucu: sıkıştırılmış veride hata yok.
- SHA-256: `d89106d93fa8b1b243c4444d9064afa2dd058b191812b2c07bcde6ebd0f82d36`.
- `out/index.html` ve `out/web.config` paketleme öncesi doğrulandı.

## Bekleyen

- RDP aktarımı, mevcut `out` yedeği, IIS site restart ve sunucu içi smoke kullanıcı tarafından yapılacak.
- Ardından dış HTTP smoke ayrı test kaydıyla raporlanacak.
- Bu aşama yalnız artefakt hazırlığıdır; DEPLOY-002 henüz uygulanmış sayılmaz.
