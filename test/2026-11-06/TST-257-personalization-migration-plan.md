# TST-257 — KIS-TEK-02 envanter ve geçiş planı

06.11.2026. Kapsam: salt okunur SELECT envanteri, dosya/manifest ilişkileri ve planlama; uygulama/API/UI değişmedi.

## Sonuç

- Etkin Catalog/Accounts/Features SQL seçimi marker ve yapılandırmadan doğrulandı. Eski yerel state/seed ayrı tutuldu.
- İlgili SELECT sorgusu müşteri kimlik/adres/oturum alanlarını seçmiyor; sorguda mutasyon yok. Hata teşhisinde gizli bağlantı değerleri maskelendi. Hiçbir migration/UPDATE/INSERT/DELETE çalıştırılmadı.
- SQL 24 ürün/79 varyant/78 fiyat/39 tasarım/19 revizyon/11 sipariş/16 satır/9 kişiselleştirme satırı.
- 7 ürün için kaynak/SKU seçimleri null bırakıldı. Farklı kaynak adayları raporlandı; ilk veya tek aday otomatik seçilmedi.
- 2 yerel taslak ve 8 published önizleme güncel SQL varyantlarına bağlı değil; silinmedi/taşınmadı.
- 28 tasarım dosyası yerelde yok; 19 konfigürasyonun 8’inin desen dosyası yerelde yok. Bu sonuç sunucuda kayıp dosya diye sunulmadı. Erişilen konfigürasyon desenlerinde hash uyuşmazlığı 0.
- Mevcut SourceSha256 alanının desen dosyası hash’i olduğu SaveConfiguration ve CopyToOrder kaynaklarından doğrulandı; ADR-005’e açıklama eklendi. Ürün fotoğrafıyla yanlış hash kıyası rapora alınmadı.
- 19 konfigürasyonun güncel maske hashleri surfaceVersion ile eşleşiyor. Eski kaynak fotoğrafının birebir eşliği bununla kanıtlanmış sayılmadı.
- 2 sipariş satırının 6 dosyası SHA+boyut PASS. 7 eski satırda üçlü manifest yok; güncel kaynakla doldurulmadı.
- Published dosyalar 24/24, fixture dosyaları 32/32 SHA PASS. current.json ürün dizininden, sürümlü mask/branding/acceptance dosyaları sürüm dizininden çözüldü.
- Analiz iki kez çalıştırıldı: aynı snapshot ile rapor eşitliği PASS. Kontrol edilen 526 kaynak dosya için önce/sonra SHA manifesti aynı.
- Sentetik iki varyantın sırası ters çevrildi: rapor sabit, seçimler null, manual_review_required PASS.
- Analiz raporunun input/App_Data/public/fixtures üzerine yazılması koruması PASS.
- Task 01–12 kimlikleri korunuyor; task 02 planlama tamam, 03–12 açık. Doküman bağlantıları ve git diff --check PASS.

Ham SQL export /tmp içinde tutuldu, Git’e eklenmedi. Kalıcı raporda sadece katalog kimlikleri ve toplu ilişki/dosya sonuçları var; hesap kimliği, müşteri adı, adres, parola/token yok.

## Sınırlar

Gerçek IIS dosya deposu, SQL+dosya tutarlı yedek/restore, gerçek veri geçişi/dry-run migration uygulayıcısı, cihaz/ödeme/kargo testi yapılmadı. Bu görevde yalnız analiz aracı için tekrarlanabilir dry-run ve ilerideki apply protokolü doğrulandı. Runtime değişmediği için API/web/admin/Flutter tam regresyonu çalıştırılmadı.

## Çıktılar

- [Geçiş planı](../../docs/reports/personalization-migration-plan-2026-11-06.md)
- [Envanter](../../docs/reports/personalization-inventory-2026-11-06.json)
- [Eşleme şablonu](../../docs/tasks/personalization-source-mapping-template.json)
- [Analiz aracı](../../tools/personalization-inventory.py)
- [Salt okunur SQL](../../tools/sql/personalization-read-only-inventory.sql)
