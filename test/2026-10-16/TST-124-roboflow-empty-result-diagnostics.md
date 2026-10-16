# TST-124 — Roboflow boş sonuç ve bozuk yanıt ayrımı

16.10.2026 · Faz06/10 · kaynak `c8f58c3` sonrası.

Kullanıcı metin tarifinden sonra genel “geçerli maske döndürmedi” hatası bildirdi. Eski kod, geçerli envelope içinde boş predictions dizisini de bozuk yanıt olarak gösteriyordu. Geçmiş ham yanıt saklanmadığından bu çağrının kök nedeni kesinleştirilmedi; yeni kredili çağrı yapılmadı.

Değişiklik: geçerli boş sonuç `provider_no_mask` (422), maske piksel/boyut doğrulama hatası `provider_invalid_mask`, yanıt şeması hatası `provider_invalid_response` olarak ayrı gösterilir. Maske üretilmez, eski taslak değiştirilmez ve otomatik inference tekrarı yoktur. Panelde kısa bölge adı kullanımı ve hariç tutmaları nokta/fırçayla düzeltme açıklaması verilir.

Doğrulama:

- RoboflowSurfaceSegmentationProviderTests + ProductSurfaceWorkspaceTests: **59/59 başarılı**.
- Boş automatic ve interactive sonuçlar ayrı iki yeni vakayla doğrulandı; her biri tek sahte HTTP isteği.
- Admin build/lint: başarılı; lint mevcut uyarılarla çıkış 0.
- `git diff --check`: başarılı.

İlk odaklı koşu 56 başarılı/3 başarısız: yeni yerel workspace ayarları fixture'ın UseSetting değerlerinin önüne geçti. Fixture ayarları ConfigureAppConfiguration ile son in-memory kaynaktan sabitlendi; beklenen credential assertion'ı değerleri yazdırmayacak şekilde düzenlendi. Son koşu 59/59. HTTP taşıması her koşuda sahteydi; gerçek sağlayıcıya çağrı yok.

Kök nedenin kalan kanıtı: kullanıcının sonraki açık denemesinde ayrıştırılmış hata kodu veya başarılı sonuç. Eski genel hata çözülmüş bir gerçek-provider kalite testi olarak işaretlenmedi.
