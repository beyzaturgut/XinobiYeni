# TST-001 — Başlangıç doğrulama geçmişi

- Tarih: 29.09.2026
- Branch: `main`
- Kapsam commitleri: `2b6099b`–`1dd5164`; son API testi `bd7c10f`
- Ortam: Apple Silicon macOS; Docker yok
- Araçlar: .NET `10.0.401`, Node `24.20.0`, pnpm `12.6.0`, Flutter `3.47.5`, Dart `3.13.4`, sqlcmd `18.7.0001.1`
- Not: Bu rapor, test raporu klasörü sonradan istendiği için mevcut Faz00 ve terminal kanıtlarından geriye dönük hazırlanmıştır. Parola ve sır içermez.

## Tekil test kayıtları

| Alt ID | Test | Seviye | Sonuç | Kanıt/özet |
|---|---|---|---|---|
| TST-001.01 | Kaynak belge SHA-256 doğrulaması | LOCAL | BAŞARILI | İki repo kopyasının hash'i özgün belgelerle eşleşti |
| TST-001.02 | Private GitHub remote erişimi | CONNECTIVITY | BAŞARILI | Boş private repo `ls-remote` ile erişilebilir; sonraki pushlar başarılı |
| TST-001.03 | SQL varsayılan port TCP ön kontrolü | CONNECTIVITY | BELİRSİZ | `nc` başarılı çıkış verdi; SQL protokol testi sonradan timeout olduğu için erişim kanıtı sayılmadı |
| TST-001.04 | SQL `109.104.120.91,1433` şifreli bağlantı | CONNECTIVITY | BLOKE | Login timeout; kimlik doğrulama aşamasına ulaşılamadı |
| TST-001.05 | SQL `109.104.120.91,1433` sertifika güvenli tekrar | CONNECTIVITY | BLOKE | `-C` ile de TCP provider timeout; sertifika kök neden değil |
| TST-001.06 | SQL `WIN-09NT6RPD8SB\SQLEXPRESS` instance keşfi | CONNECTIVITY | BLOKE | Server/instance bulunamadı; hostname dışarıdan çözülemiyor veya SQL Browser erişilemiyor |
| TST-001.07 | SQL `109.104.120.91\SQLEXPRESS` instance keşfi | CONNECTIVITY | BLOKE | SQL Browser/instance keşfi başarısız; sabit dış TCP port bekleniyor |
| TST-001.08 | İlk .NET restore/build | LOCAL | BAŞARILI | Çözümde API, worker, shared ve test projeleri; 0 uyarı, 0 hata |
| TST-001.09 | İlk .NET otomatik test | UNIT | BAŞARILI | 1/1 `SharedKernelAssemblyCanBeLoaded` |
| TST-001.10 | Web ve panel lint | LOCAL | BAŞARILI | Next.js ESLint ve admin oxlint başarılı |
| TST-001.11 | Web production build | LOCAL | BAŞARILI | Next.js production derlemesi ve statik sayfa üretimi başarılı |
| TST-001.12 | Panel production build | LOCAL | BAŞARILI | TypeScript ve Vite production build başarılı |
| TST-001.13 | Flutter analyze | LOCAL | BAŞARILI | Sorun bulunmadı |
| TST-001.14 | Flutter test yanlış çalışma dizini | LOCAL | BAŞARISIZ | Üst dizinden çağrı `pubspec.yaml` bulamadı; kod hatası değil |
| TST-001.15 | Flutter test doğru çalışma dizini | UNIT/WIDGET | BAŞARILI | `apps/mobile` altında 1/1 widget smoke testi |
| TST-001.16 | API health smoke | LOCAL/CONTRACT | BAŞARILI | `GET /api/v1/health` HTTP 200 ve `healthy` |
| TST-001.17 | Gereksinim matrisi satır kapsamı | LOCAL | BAŞARILI | 366 madde + Android eşliği = 367/367 satır |
| TST-001.18 | Gereksinim matrisi deterministik üretim | LOCAL | BAŞARILI | Arka arkaya üretimde aynı SHA-256 |
| TST-001.19 | API request correlation ilk build | UNIT | BAŞARISIZ | Test projesinde ASP.NET Core framework referansı eksikti |
| TST-001.20 | Framework referansı sonrası `--no-restore` test | UNIT | BAŞARISIZ | Eski restore grafiği nedeniyle runtime assembly yüklenemedi |
| TST-001.21 | Restore sonrası .NET regresyon | UNIT | BAŞARILI | Build 0 uyarı/hata; 3/3 test başarılı |
| TST-001.22 | Geçerli istemci request ID testi | UNIT | BAŞARILI | Geçerli `X-Request-Id` korunuyor ve cevap header'ına yazılıyor |
| TST-001.23 | Aşırı uzun request ID testi | UNIT | BAŞARILI | 129 karakterlik değer reddedilip güvenli sunucu kimliği üretiliyor |
| TST-001.24 | API request ID smoke | LOCAL/CONTRACT | BAŞARILI | Health cevabında gönderilen request ID header ve body'de korundu |
| TST-001.25 | API 404 Problem Details smoke | LOCAL/CONTRACT | BAŞARILI | HTTP 404, `application/problem+json`, requestId ve UTC zaman döndü |
| TST-001.26 | Git whitespace/diff denetimleri | LOCAL | BAŞARILI | İlgili commitlerden önce `git diff --check` başarılı |
| TST-001.27 | Secret desen kontrolü | LOCAL/SECURITY | BAŞARILI | İzlenen proje dosyalarında kullanılan SQL secret referansı/parola deseni bulunmadı |

## Başarısızlıkların ayrıntısı

### SQL bağlantı testleri

Gerçek parola macOS Keychain üzerinden çıktı vermeden kullanıldı. Denemeler login aşamasına ulaşmadı; bu nedenle kullanıcı adı, parola, `XinobiYeniDB` varlığı, SQL sürümü ve yetkiler doğrulanmış değildir. Gerçek sabit TCP portu, firewall/VPN/allowlist ve düşük yetkili uygulama hesabı beklenir. Hiçbir SQL yazma sorgusu çalıştırılmadı.

### Flutter test çağrısı

İlk komut repo kökünden `flutter test apps/mobile` olarak çağrıldı ve `pubspec.yaml` bulamadı. Güvenli yeniden deneme `apps/mobile` çalışma dizininde `flutter test` oldu ve 1/1 başarılı geçti.

### ASP.NET Core test referansı

İlk otomatik middleware test derlemesi `Microsoft.AspNetCore.App` referansı eksikliğiyle başarısız oldu. Referans eklendikten sonra `--no-restore` eski grafiği kullandı ve runtime assembly hatası verdi. `dotnet restore XinobiYeni.slnx` sonrasında build ve 3 test başarılı geçti.

## Son doğrulanmış komut seti

```bash
dotnet restore XinobiYeni.slnx
dotnet build XinobiYeni.slnx --no-restore
dotnet test XinobiYeni.slnx --no-build
pnpm lint
pnpm build
(cd apps/mobile && flutter analyze && flutter test)
```

## Açık test borcu

- Gerçek SQL Server bağlantı ve migration/rollback testi
- SQL Server eşzamanlılık/idempotency entegrasyon testleri
- Web/panel E2E
- Flutter iOS/Android gerçek cihaz build ve E2E
- Sağlayıcı sandbox/gerçek entegrasyon testleri
- Baskı golden/geometri ve fiziksel çıktı testi
- UAT, restore/rollback ve canlı smoke

