# TST-071 — DEPLOY-003 paket bütünlüğü

- Tarih: 02.10.2026
- Kaynak commit: `5445569`
- Paket: `XinobiYeni-web-5445569.zip`
- Seviye: BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK

## Kontroller

- Next.js static export: 23/23 rota başarılı.
- Playwright birleşik paket: 43/43 başarılı.
- ZIP kökü: doğrudan `out/`.
- ZIP girdi sayısı: 233.
- `unzip -t`: sıkıştırılmış veride hata yok.
- Paket boyutu: yaklaşık 9.3 MB.
- SHA-256: `83e007a3cbc0094840a3b1d010437f876c8e350cf3f803441065bc477dc7614c`.

## Not

İlk geçici arşiv `apps/web/out` köküyle üretildiği için yayın paketi olarak reddedildi. Ardından hazırlanan `564184a` paketi çerez/Nobi konum düzeltmesi sonrasında geçersiz kılındı ve `/tmp/XinobiYeni-web-564184a-superseded.zip` konumuna taşındı. Final `5445569` paketi doğru `out/` kökü ve son düzeltmeyle yeniden oluşturuldu.

Durum: HAZIRLANDI. RDP aktarımı, IIS klasör değişimi ve canlı smoke henüz tamamlanmadı.
