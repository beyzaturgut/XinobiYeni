# TST-056 — Cloudflare Workers AI ve ortak tek tasarım kararı

Tarih: 01.10.2026  
Seviye: DOCUMENT / ARCHITECTURE DECISION / DESIGN GOVERNANCE  
Sonuç: **Başarılı**

## Doğrulananlar

- Cloudflare Workers AI, AI-P01 kapsamında proje sahibi tarafından seçilmiş sağlayıcı olarak Faz00, Faz01, Faz10 ve ADR-002'de kayıtlıdır.
- Sağlayıcı seçimi Faz10 öncesinde SDK, secret, adaptör veya ücretli çağrı ekleme yetkisi olarak yorumlanmamıştır.
- ASP.NET Core worker üzerinden sağlayıcı adaptörü ve web/Flutter doğrudan çağrı yasağı tanımlanmıştır.
- Kesin model, lisans, veri işleme, fiyat/kota ve çıktı kalitesi Faz10 PoC kapısına bırakılmıştır.
- Creative Designer ve Web Designer iki alternatif yerine tek ortak Xinobi tasarımı üretmekle görevlendirilmiştir.
- `ORTAK TASARIM ONAY` ve `WEB TASARIM ONAY` kodlama öncesi ayrı kullanıcı kapılarıdır.
- Uygulama kodu, migration ve deployment değiştirilmemiştir.

## Kontrol

```text
rg "Cloudflare Workers AI|AI-P01|IImageGenerationProvider|Faz10" docs/decisions/ADR-002-cloudflare-workers-ai.md Prompts/Faz00_* Prompts/Faz01_* Prompts/Faz10_*
rg "tek ortak Xinobi tasarımı|ORTAK TASARIM ONAY|WEB TASARIM ONAY" Prompts/Faz02_Tasarim_ve_UIUX.md design/faz02-open-acceptance.md
git diff --check
```

Final: karar ve sınır işaretleri mevcut; whitespace hatası yok.
