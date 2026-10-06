# TST-077 — ProductSurfaces Step 2 gerçek medya doğrulaması

- Tarih (Europe/Istanbul): 06.10.2026.
- Branch/HEAD: `feature/product-personalization` / `acc0c99`; yeni commit yok.
- Görev: ProductSurfaces Step 2 (repository Faz02 değildir).
- Seviye: UNIT / MOCK / REAL ASSET; hosted inference veya UAT yok.
- Ortam/çalıştıran: Windows win-x64, SDK 10.0.401 / runtime 10.0.12; Codex.

## Önkoşullar ve paket kararı

Kullanıcı SkiaSharp kullanımını onayladı. NuGet flat-container index/nuspec üzerinden güncel stable 4.153.1 ve net10.0 desteği doğrulandı. Tek doğrudan PackageReference `SkiaSharp 4.153.1`; zorunlu transitif `SkiaSharp.NativeAssets.Win32 4.153.1`, `SkiaSharp.NativeAssets.macOS 4.153.1`. Linux/mobil/UI paketi veya System.Drawing.Common eklenmedi. Bu test macOS çalıştırma kabulü değildir.

```text
dotnet add services/api/Xinobi.Api.csproj package SkiaSharp --version 4.153.1 --no-restore
dotnet restore tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj -p:OpenApiGenerateDocumentsOnBuild=false
```

Restore ilk sandbox denemesinde NU1301/ağ socket izin hatasıyla başarısız oldu. Aynı komut izinli network ortamında tekrarlandı ve başarılı oldu; kaynak kod değişikliğiyle hata gizlenmedi. NuGet metadata sorgusu da ilk kısıtlı ağ denemesinde başarısız, izinli tekrarda başarılıydı.

## Komut ve gerçek sonuç

```text
dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore --configuration Release -p:OpenApiGenerateDocumentsOnBuild=false --filter FullyQualifiedName~ProductSurface --logger "console;verbosity=detailed"
dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore --configuration Release -p:OpenApiGenerateDocumentsOnBuild=false --filter FullyQualifiedName~ProductSurface --verbosity minimal
```

İlk koşu 37/37 başarılı. Yarı saydam-her-yerde, RGB/no-alpha ve near-empty/full mixed mask edge-case kapsamı genişletildikten sonra final 39/39 başarılı: 24 Step 1 + 15 Step 2 test case, 0 hata, 0 atlama; final test süresi 611 ms. Kanıt oturum terminal çıktılarıdır; ayrı ham log dosyası oluşturulmadı.

## Gerçek Tea Maker fixture istatistikleri

| Özellik | Sonuç |
|---|---|
| WebP decoded boyut | 1066×1600 |
| Source SHA-256 | `da25357dd74d34295b1658ac6b87b55c28ec4f9d8f4543379efabb8971300414` |
| PNG decoded boyut | 1066×1600 |
| Mask SHA-256 | `8c4ae4c1d1ab269ae2e580a83a8ba3e55a0d32766c9b7299e0f5e804f5964d06` |
| Alpha min/max | 0 / 255 |
| Alpha=0 | 1,442,375 piksel |
| Alpha=255 | 255,518 piksel |
| 0<alpha<255 | 7,707 piksel |
| Ortalama 8-bit alpha | 38.77085659005628 |
| Empty/full guard | Geçti; boş/dolu değil |

Kaynak ve maskenin mevcut repo dosyaları kullanıldı; kopya asset yok. Tiny negatif PNG fixture'ları bellekte üretildi. Wrong-size, boş/tam/near-empty/full, alpha kanalı olmayan ve decode edilemeyen/truncated veri reddi; intermediate alpha/orijinal byte korunması; deterministic checksum; exact checksum/version/source ve ürün/varyant/media eşleşmesi; validated metadata ile yeni automatic/interactive pending revision ve mevcut onayın korunması test edildi.

## Sınır ve sonraki adım

Bu sonuç yalnız yapısal/source-bound validation'dır; aynı boyut semantik geometry/crop/yön doğruluğunu kanıtlamaz. BoundSource güvenilir onboarding kaynağından gelmelidir. Production Asset/Variant altyapısı, real provider, HTTP/Admin, jobs/persistence, PrintArea/D04 onayı yoktur. Step 3 başlamadı.
