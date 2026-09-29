# Faz01 — D01 ortam ve depo envanteri

Son doğrulama: 29.09.2026

## Depo

| Alan | Doğrulanmış durum |
|---|---|
| Kaynak depo | `https://github.com/beyzaturgut/XinobiYeni.git` |
| Görünürlük | Private |
| Varsayılan çalışma dalı | `main` |
| Mevcut uygulama kodu | Kaynaklarda eski/yeniden kullanılacak uygulama kodu bulunmadı; yeni monorepo iskeleti oluşturuldu |
| Repo düzeni | `apps/web`, `apps/admin`, `apps/mobile`, `services/api`, `services/worker`, `services/shared`, `tests`, `docs` |
| Container kararı | Docker/Kubernetes kullanılmayacak |

## Yerel araç zinciri

| Araç | Sürüm / durum | Kanıt ve not |
|---|---|---|
| macOS | Apple Silicon geliştirme makinesi | Native araç zinciri |
| .NET SDK | `10.0.401` | `global.json`; build/test başarılı |
| Node.js | `24.20.0` | `.node-version`; web/panel build başarılı |
| pnpm | `12.6.0` | `packageManager`; workspace lockfile mevcut |
| Flutter | `3.47.5` stable | `.fvmrc`; analyze/test başarılı |
| Dart | `3.13.4` | Flutter ile gelen sürüm |
| SQL istemcisi | `sqlcmd 18.7.0001.1` | Mac üzerinde kurulu |

## Ortamlar ve dış erişimler

| Ortam/servis | Durum | Engel / sonraki doğrulama |
|---|---|---|
| Yerel API | Hazır | `/api/v1/health` HTTP 200 doğrulandı |
| Web/panel | İskelet hazır | Production build başarılı; tasarım Faz02'ye bağlı |
| Flutter mobil | İskelet hazır | Analyze/test başarılı; gerçek cihaz build ve editör PoC bekliyor |
| SQL Server geliştirme | Bloke | `109.104.120.91:1433` ve `SQLEXPRESS` instance keşfi login öncesi timeout; sabit dış TCP port/firewall/VPN bilgisi bekleniyor |
| SQL veritabanı | Bildirildi, doğrulanamadı | `XinobiYeniDB`; erişim sağlanmadan migration yazılmayacak |
| Mikro | Bilinmiyor | Sürüm, API/SDK/COM ve test şirketi D06 kapsamında gerekli |
| Ödeme/kargo/bildirim | Bilinmiyor | Sağlayıcı ve sandbox erişimi D05 kapsamında gerekli |
| Pazaryerleri | Bilinmiyor | Trendyol/Hepsiburada/N11 mağaza ve test erişimleri D06 kapsamında gerekli |
| AI | Bilinmiyor | Sağlayıcı, kota, maliyet ve politika D05/D08 kapsamında gerekli |
| Nesne depolama | Seçilmedi | Barındırma kararıyla ayrı ADR |
| CI/CD | Planlandı | GitHub Actions; gerçek SQL test ortamı oluşunca uygulanacak |

## D01 sonucu

Karar: **Sıfırdan yeni geliştirme**. Mevcut kod veya migration geçmişi verilmediği için yeniden kullanım iddiası yoktur. Kaynak belgeler hash ile `docs/sources/` altında korunur. D01'in repo ve teknoloji bölümü kapanmıştır; mevcut operasyon/veri örneği ve barındırma envanteri gelene kadar ortam bölümü kısmi açık kalır.

Bu belge sır, parola veya gerçek bağlantı dizisi içermez.

