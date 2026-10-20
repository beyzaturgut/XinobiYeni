# TST-135 — Ürün yüzey maskelemesi canlı API’de

20.10.2026 · Faz03/06 · Sahip kararı: admin maskeleme ve onaylı maske önizlemesi canlıda yereldeki gibi çalışsın.

## Değişiklik

- `ProductSurfaceEndpoints`: Development dışında `AdminCatalog:Enabled` ile açılır (`ProductSurfaces:CatalogWorkspace:Enabled=false` kapatır); üretimde aynı köken + `AdminCatalog:RequireHttps`, Development’ta loopback + yerel kökenler. Hız sınırı yalnız Development’ta (üretimde politika her kurulumda kayıtlı değil).
- `Program.cs`: `ProductSurfaceWorkspace` SQL admin kataloğunda da kayıtlı.
- `rendering-inputs` anonim/salt okunur; `AuthorizationTests` public listesine eklendi → `OnlyListedAreasArePublic` geçiyor.
- Web: önce onaylı ortak maske (hata/404’te paketlenmiş önizlemeye düşer), canlı derlemede de.
- `ProductionCatalogAdminTests`: maskeleme “kapalı alan” listesinden çıktı; anonim 401, yabancı köken 403, HTTPS dışı 403 doğrulanır.

## Sonuç

- `dotnet test tests/Xinobi.Architecture.Tests`: **434 geçti / 25 atlandı / 0 başarısız**.
- Web e2e (`xinobi-preview-ui`, `xinobi-preview-composition`, `xinobi-result`, `commerce-surface-integration`, `local-pattern-image`): **34/34**.
- Gerçek canlı sunucuda deneme yapılmadı; dağıtım sonrası admin girişiyle doğrulanmalı.
