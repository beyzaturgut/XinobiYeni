# TST-071 — DEPLOY-003 paket bütünlüğü

- Tarih: 02.10.2026
- Kaynak commit: `564184a`
- Paket: `XinobiYeni-web-564184a.zip`
- Seviye: BUILD / STATIC EXPORT / DEPLOYMENT PRECHECK

## Kontroller

- Next.js static export: 23/23 rota başarılı.
- Playwright birleşik paket: 43/43 başarılı.
- ZIP kökü: doğrudan `out/`.
- ZIP girdi sayısı: 233.
- `unzip -t`: sıkıştırılmış veride hata yok.
- Paket boyutu: yaklaşık 9.3 MB.
- SHA-256: `9e0206d3eaa01e76f760069dd53bc6a49f4d1b17218977a49a9551674e410c99`.

## Not

İlk geçici arşiv `apps/web/out` köküyle üretildiği için yayın paketi olarak reddedildi ve `/tmp/XinobiYeni-web-564184a-invalid-root.zip` konumuna taşındı. Final paket doğru `out/` köküyle yeniden oluşturuldu ve yalnız final özet raporlandı.

Durum: HAZIRLANDI. RDP aktarımı, IIS klasör değişimi ve canlı smoke henüz tamamlanmadı.
