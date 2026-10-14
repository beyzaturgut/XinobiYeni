# TST-116 — Denetim kaydı (Faz03 03.06)

- Tarih/saat (Europe/Istanbul): 14.10.2026
- Commit/branch: `main` / `880cff0` → bu commit
- Faz/görev: Faz03 03.06 AuditLog
- Seviye: UNIT / INTEGRATION
- Ortam: macOS; izole API (`IsolatedApiFactory`, Development dosya deposu); gerçek SQL testi işaretle kapalı
- Çalıştıran: Claude Code

## Amaç

Panel (`/api/v1/local-commerce/*`) ve yönetim (`/api/v1/admin/*`) uçlarındaki her değişiklik denemesinin (başarılı, 4xx, 401/403, 5xx) aktör, işlem, kayıt, sonuç ve istek numarasıyla, istek gövdesi saklanmadan yazıldığını ve yalnız `audit.read` izniyle okunduğunu doğrulamak.

## Uygulama

- `services/api/Infrastructure/AuditTrail.cs`: `AuditTrail` (SQL’de `ops.AuditLogs`, Development dosya modunda `App_Data/local-commerce/audit/audit.jsonl`, ikisi yoksa yapılandırılmış log) ve `AuditMiddleware` (hata işleyicisinin ve yetkilendirmenin dışında, böylece reddedilen ve hatalı denemeler son durum koduyla yazılır). Yazım hatası isteği bozmaz, loglanır.
- `GET /api/v1/local-commerce/audit?entityType=&limit=` (en çok 200, yeniden eskiye), `PanelAccess` içinde `audit` kaynağı → `audit.read`. Elle yazma ucu yok.
- Panel: Ayarlar → **Denetim kaydı** (`apps/admin/src/AuditLog.tsx`), alan filtresi, salt okunur.

## Komut

```text
dotnet test XinobiYeni.slnx --filter FullyQualifiedName~AuditTrailTests
dotnet test XinobiYeni.slnx
cd apps/admin && pnpm exec tsc -b --noEmit && pnpm lint && pnpm build
```

## Sonuç

| Kontrol | Sonuç |
|---|---|
| `AuditTrailTests` | 2/2: fiyat değişikliği aktör, rota, varyant kimliği, 200 ve istek numarasıyla kayıtlı, fiyat değeri dosyada yok; müşterinin 403 denemesi ve personelin 400 denemesi kayıtlı; müşteri `GET /audit` → 403 |
| Tam .NET | **387 geçti / 14 atlandı / 0 başarısız** (yeni gerçek SQL testi `AuditTrailWritesAndReadsOpsAuditLogs` `XINOBI_TEST_SQL` olmadan atlanır) |
| Admin tsc / lint / build | Temiz; lint’te yalnız önceki 5 uyarı |

## Kapsam dışı / açık

- Önce/sonra alan farkı (`SafeDiff`) yalnız durum kodunu taşır; alan bazlı güvenli fark ve rol alanı sonraki iş.
- Gerçek SQL testi boş test veritabanı gerektirdiği için XinobiYeniDB’ye karşı çalıştırılmadı; tarayıcıda panel ekranı denenmedi (yerel stack kapalıydı).
- Müşteri uçlarındaki değişiklikler (adres, sipariş) bu kayda girmez; politika gereği yalnız panel/yönetim işlemleri.

## Sonuç kararı

BAŞARILI. Faz kabulü değildir.
