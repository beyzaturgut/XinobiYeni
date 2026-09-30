# DEPLOY-001 — IIS web preview

- Tarih (Europe/Istanbul): 2026-09-30
- Sorumlu: Codex + proje sahibi
- Kaynak: `main` / `b5f87a8`
- Hedef: `109.104.120.91` Windows IIS
- Önerilen site adı: `XinobiYeni`
- Yayın türü: Next.js static export, Docker/Node runtime yok
- Durum: BAŞARILI — dış HTTP preview erişimi doğrulandı; HTTPS/üretim kabulü kapsam dışı

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
- Hedef fiziksel yol: `C:\inetpub\wwwroot\XinobiYeni\out`
- IIS site adı: `XinobiYeni`
- Binding: `http`, `*:8014`, host adı yok

## Yayın ve doğrulama

- IIS aktarımı: proje sahibi tarafından RDP ile tamamlandı.
- Site oluşturma/binding: tamamlandı; ilk `0014` binding'i `8014` olarak düzeltildi.
- Fiziksel yol: ilk üst klasör seçimi directory listing gösterdi; `out` klasörüne düzeltilince proje sahibi ana sayfanın açıldığını doğruladı.
- Sunucu içi HTTP smoke: `http://localhost:8014` kullanıcı tarafından başarılı doğrulandı.
- İlk dış ağ HTTP smoke: `http://109.104.120.91:8014` 10 saniye bağlantı timeout.
- Düzeltme: Windows Firewall inbound TCP 8014 kuralı proje sahibi tarafından eklendi.
- Başarılı tekrar: ana sayfa, `/urunler/` ve `/kurumsal/teklif/takip/` dış ağdan HTTP 200; `Microsoft-IIS/10.0` ve beklenen içerik doğrulandı.
- Dış preview URL: `http://109.104.120.91:8014/`
- HTTPS: yapılandırılmadı; genel kullanıma hazır kabul edilmez.
- Geri alma noktası: yeni site olduğundan siteyi durdurma; hedef klasör varsa aktarım öncesi zaman damgalı yedek zorunlu.
