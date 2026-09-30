# TST-034 — IIS statik yayın artefaktı

- Tarih: 2026-09-30
- Kaynak: `main` / `b5f87a8`
- Deployment: `DEPLOY-001`

## Kapsam ve sonuç

- Next.js `output: export`, `trailingSlash` ve optimize edilmeyen statik görsel çıktısı yapılandırıldı.
- IIS için `web.config`, varsayılan `index.html`, WebP/WOFF2 MIME ve temel güvenlik başlıkları eklendi.
- ESLint ve production static export başarılı; 19/19 rota, 169 dosya.
- Kritik `index.html`, `web.config` ve iç içe teklif takip rotası doğrulandı.
- ZIP: 1.6 MB.
- SHA-256: `e94001b268695975a355fe8fa5fc59acc0c047fd962382e867d5009be728bddf`.

## Durum

Artefakt başarılı ve yerel olarak hazır. Uzak IIS aktarımı/site/binding/HTTP smoke yapılmadığı için bu kayıt deployment başarısı değildir; `DEPLOY-001` durumu `HAZIRLANDI`dır.

## Sonraki adım

Sunucu yönetim kanalı ve çakışmayan binding doğrulandıktan sonra yeni `XinobiYeni` sitesine aktar; dış URL, hash, yedek ve smoke sonucunu aynı deployment kaydına ekle.
