# TST-100 — Rol/yetki kataloğu, varsayılan ret ve ilk süper yönetici

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `e66bd73` üzerinde çalışma ağacı
- Faz/görev: Faz03 03.04
- Seviye: UNIT / INTEGRATION / CONTRACT
- Ortam: LOCAL (WebApplicationFactory, geçici veri klasörü, e-posta göndericisi DI'da sessiz)
- Çalıştıran: Claude Code

## Yapılanlar

- `services/api/Identity/Permissions.cs`: 17 panel kaynağı (`catalog` … `audit`) için `read`/`write` (denetim kaydı yalnız `read`) ve ayrı işlemler: `payments.approve`, `payments.refund`, `orders.cancel`, `print.operate`, `settings.staff`. Yerleşik rol `super_admin` tüm yetkileri taşır; diğer roller SQL `identity.Role/RolePermission` satırlarıyla panelden yönetilecek (03.11).
- Merkezi politika: `RequirePermission("x.y")` → `permission:x.y` politikası; katalogda olmayan ad başlangıçta hata verir. Personel politikası rol ister.
- Varsayılan ret: `FallbackPolicy` oturum açmış hesap ister; herkese açık alanlar (`health`, `catalog`, `content`, `design-studio`, `local-commerce`, `xinobi-u`, `email-verification`, `auth`, `openapi`) açıkça `AllowAnonymous`. Eşleşmeyen adres 404 kalır. 401/403 Problem Details `code` taşır (`unauthorized`/`forbidden`).
- Jeton her istekte hesaptan okunduğundan yetkiler jetona gömülmez; rol değişikliği bir sonraki istekte geçerli.
- `GET /api/v1/admin/session` (personel: hesap, roller, yetkiler) ve `GET /api/v1/admin/permissions` (`settings.read`). OpenAPI + TS/Dart istemcileri yenilendi.
- İlk süper yönetici: `bootstrap-super-admin <e-posta>` konsol komutu; yalnız hiç süper yönetici yokken ve hesap (doğrulanmış e-postayla) varsa çalışır. Runbook: `docs/runbooks/super-admin-bootstrap.md`.
- Müşteri sahipliği: `/api/v1/me` kimliği yalnız jetondan alır, istekten kimlik kabul etmez; sipariş/adres uçları aynı kuralla gelecek.

## Komut ve sonuç

```text
dotnet test tests/Xinobi.Architecture.Tests   → 82/82 (4 yeni: herkese açık alan listesi, müşteri 403 / anonim 401,
                                                 bootstrap bir kez + rol bir sonraki istekte, katalog kapsamı)
pnpm contracts:generate + build_runner         → istemciler yenilendi
flutter analyze; tsc (web, admin, TS istemci)  → temiz
```

- Durum: **BAŞARILI**.

## Açık

- `local-commerce` panel uçları hâlâ Development + loopback ile korunuyor (ADR-003); panel girişi ve uçların `RequirePermission`'a geçmesi SQL kimlik deposuyla (03.11).
- Panelden rol tanımlama/atama ekranı ve denetim kaydına yazma (`ops.AuditLog`) SQL deposu gelince.
