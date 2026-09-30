# DEPLOY-001 — IIS web preview

- Tarih (Europe/Istanbul): 2026-09-30
- Sorumlu: Codex + proje sahibi
- Kaynak: `main` / `b5f87a8`
- Hedef: `109.104.120.91` Windows IIS
- Önerilen site adı: `XinobiYeni`
- Yayın türü: Next.js static export, Docker/Node runtime yok
- Durum: HAZIRLANDI — uzak IIS aktarımı/yayın erişimi bekleniyor

## Güvenli sınır

- Mevcut `Xinobi`, `XinobiApi` veya diğer IIS sitelerinin üzerine yazılmaz.
- Yeni fiziksel klasör, application pool/site ve çakışmayan binding kullanılır.
- Bu yayın yalnız Faz02 web prototipidir; API, SQL yazımı, ödeme veya gerçek müşteri işlemi içermez.
- Migration uygulanmaz.

## Artefakt

- Kaynak: `apps/web/out/`
- Paket: `/tmp/XinobiYeni-web-b5f87a8.zip` (yerel geçici dosya; Git'e girmez)
- SHA-256: `e94001b268695975a355fe8fa5fc59acc0c047fd962382e867d5009be728bddf`
- İçerik: 169 dosya; 19 statik rota; `web.config` dahil.
- Hedef fiziksel yol/binding: sunucu erişim yöntemi ve kullanıcı seçimi sonrası kaydedilecek.

## Yayın ve doğrulama

- IIS aktarımı: bekliyor; SSH/SFTP, WinRM veya erişilebilir SMB paylaşımı verilmedi.
- Site oluşturma/binding: bekliyor.
- HTTP/HTTPS smoke: bekliyor.
- Geri alma noktası: yeni site olduğundan siteyi durdurma; hedef klasör varsa aktarım öncesi zaman damgalı yedek zorunlu.
