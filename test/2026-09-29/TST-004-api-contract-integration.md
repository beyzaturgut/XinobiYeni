# TST-004 — API sözleşmesi entegrasyon testleri

- Tarih/saat (Europe/Istanbul): 2026-09-29 13:21
- Commit/branch: `main` / commit öncesi `b51e6fd`
- Faz/görev: Faz03 erken API omurgası
- Seviye: INTEGRATION / CONTRACT
- Ortam: macOS; .NET SDK 10.0.401; ASP.NET Core TestServer
- Çalıştıran: Codex

## Amaç

Çalışan ASP.NET Core uygulamasının sağlık, korelasyon kimliği, standart hata ve OpenAPI sözleşmelerini ağ portu ya da gerçek SQL Server gerektirmeden otomatik doğrulamak.

## Önkoşullar ve test verisi

`Microsoft.AspNetCore.Mvc.Testing` 10.0.12 ile uygulama `Development` ortamında bellek içi TestServer üzerinde başlatıldı. Gerçek müşteri verisi, sır, SQL bağlantısı veya dış servis kullanılmadı. Sabit ve kişisel veri içermeyen request ID değerleri kullanıldı.

## Komut

```text
dotnet restore XinobiYeni.slnx
dotnet build XinobiYeni.slnx --configuration Release --no-restore
dotnet test XinobiYeni.slnx --configuration Release --no-build --no-restore
```

## Beklenen sonuç

- `/api/v1/health` HTTP 200 döndürür; servis/durum/zaman/request ID alanlarını içerir ve geçerli `X-Request-Id` değerini korur.
- Bilinmeyen API yolu HTTP 404 ve `application/problem+json` döndürür; gövdede durum, zaman ve request ID bulunur.
- Development OpenAPI belgesi `/api/v1/health` yolunu yayımlar.
- Mevcut birim/mimari testlerinde regresyon oluşmaz.

## Gerçek sonuç

- Durum: BAŞARILI
- Süre: ilk build 4,40 sn ve test 476 ms; son temizlik sonrası tekrar build 3,04 sn ve test 373 ms
- Özet: İki Release doğrulamasında da build 0 uyarı/0 hata. Her iki çalıştırmada 6 testin 6'sı geçti, 0 başarısız, 0 atlanan. Yeni üç API entegrasyon testi ile mevcut üç test birlikte başarılı oldu. Son kontrolde `git diff --check`, rapor/indeks bütünlüğü ve değişiklik kapsamındaki sır deseni taraması da geçti.

## Hata ve düzeltme

Başarısız deneme olmadı. Test dosyasındaki kullanılmayan bir `using` bildirimi kaldırıldıktan sonra tüm build/test ve statik kontroller başarıyla tekrarlandı.

## Kanıt

- `tests/Xinobi.Architecture.Tests/ApiContractTests.cs`
- `tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj`
- Bu rapordaki komut çıktısı özeti; kaynak commit bu raporla birlikte oluşturulacaktır.

## Etki ve sonraki adım

API'nin veritabanından bağımsız temel sözleşmesi artık CI içinde otomatik korunuyor. SQL erişimi ve D02/D03 iş kararları gelmeden veri modeli ya da iş endpoint'i kesinleştirilmeyecek; sıradaki bağımsız iş web/panel istemcileri için bu OpenAPI sözleşmesini tüketme stratejisini hazırlamaktır.
