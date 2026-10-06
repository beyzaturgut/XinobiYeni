# TST-080 — ProductSurfaces Step 3 backend

Tarih: 2026-10-06. Seviye: UNIT / MOCK / LOCAL API INTEGRATION.

Komut: `dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore -c Release -p:OpenApiGenerateDocumentsOnBuild=false --verbosity minimal`.

Final: 63/63 başarılı; Step 1/2 testleri dahil. 15 yeni API test case: init/GET kararlılığı, exact source/mask byte cevapları, interactive yeni pending revision/lineage, approval korunması, coordinate/error sözleşmesi, approve/reject, stale/concurrent kararlar, bilinmeyen kimlik ve client alanları, development/production gate, Origin ve kaynak değişimi.

İlk derleme target-typed params argümanı ve xUnit analyzer hatalarıyla başarısız; açık ReviewPoint constructor ve predicate Assert.Single ile düzeltildi. Sandbox koşusunda Windows Event Log erişimi engellendi; izinli tekrar kullanıldı. İlk izinli tekrar 62/63: `1e999` decode edilip non-finite koordinat olarak 422 verir, NaN/Infinity malformed JSON olarak 400; ayrım testte düzeltildi. Development gate içine taşınan malformed-request ayarının WebApplicationFactory geç configuration davranışı 61/63 sonucunu verdi; ayar gate içinde app options üzerinde uygulandı, final 63/63 geçti. Bir tekrar tarayıcı API host'u DLL'i kilitledi; host kapanınca kopyalama/test tamamlandı. Başarısızlıklar gizlenmedi.

Gerçek AI, SQL, external provider veya persistence yok. Test temp fixture dosyaları gerçek ürün asset'ini değiştirmez.
