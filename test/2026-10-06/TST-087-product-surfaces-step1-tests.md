# TST-087 — ProductSurfaces Step 1 odaklı test kanıtı

- Kayıt tarihi (Europe/Istanbul): 06.10.2026; önceki Step 1 oturumundaki gözlenen koşular geriye dönük kaydedildi. Kesin koşu saati kaydedilmemiştir; bu dokümantasyon oturumunda test yeniden çalıştırılmadı.
- Commit/branch: `acc0c99` / `feature/product-personalization`; Step 1 dosyaları commit edilmemiş çalışma ağacındadır.
- Faz/görev: ProductSurfaces Step 1; repository Faz01/Faz02 değildir.
- Seviye: UNIT / MOCK
- Ortam: Windows, .NET SDK 10.0.401, mevcut xUnit projesi ve fake provider.
- Çalıştıran: Codex.

## Amaç ve fixture

Provider bağımsız aday üretimi ve açık inceleme kuralları. Tea Maker kaynak boyutu 1066×1600; Keep (420, 920), Exclude (245, 730). Fake metadata kullanılır; gerçek PNG, SAM veya hosted inference çalıştırılmaz.

## Komut ve başarısız ilk deneme

```text
dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore -p:OpenApiGenerateDocumentsOnBuild=false --filter FullyQualifiedName~ProductSurfaceTests --verbosity minimal
```

İlk Debug build BAŞARISIZ: çalışan API `services/api/bin/Debug/net10.0/Xinobi.Api.exe` dosyasını kilitledi; MSB3027/MSB3021 oluştu. API durdurulmadı; Release yapılandırmasına geçildi. Bu başarısız koşu test assertion hatası değildir. İlk Release tekrarında 22/22 geçti; iki ek odaklı test sonrasında aşağıdaki final koşu yapıldı.

## Final tekrar komutu

```text
dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore --configuration Release -p:OpenApiGenerateDocumentsOnBuild=false --filter FullyQualifiedName~ProductSurfaceTests --verbosity minimal
```

## Gerçek sonuç ve kanıt

- BAŞARILI: 24 geçti, 0 başarısız, 0 atlandı; gözlenen test süresi 132 ms.
- Kanıt: önceki Step 1 oturumunun terminal çıktısı, exit code 0. Ayrı ham log artefaktı kaydedilmedi.
- Kapsam: automatic/interactive yeni revision; önceki candidate/maske ve mevcut onayın korunması; pending candidate; açık approve/reject; exact revision/candidate/source; stale source ve checksum/version/boyut farkı; negatif/out-of-bounds/NaN/Infinity koordinatlar; nokta snapshot; supplied score/provenance; provider hata/cancellation ve uyumsuz metadata reddi.
- Bu sonuç gerçek Roboflow/SAM entegrasyonu, raster alpha doğrulaması, HTTP/UI, SQL veya UAT kanıtı değildir.

## Etki ve sonraki adım

Step 1 iş kuralları test edildi; proje genelindeki hiçbir faz veya D kararı kapanmadı. Ayrı Release API build TST-088, OpenAPI korunması TST-089'dadır. ProductSurfaces Step 2 yalnız ayrı kullanıcı talimatıyla başlayacaktır.
