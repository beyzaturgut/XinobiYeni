# SIP-TAS-09 — Sipariş tasarım detayı son test ve kabul kaydı / 03.11.2026

Kapsam matrisi, ekran matrisi ve açıklar: [design/order-design-acceptance-2026-11-03.md](../../design/order-design-acceptance-2026-11-03.md).

Bu taskta yalnız testler eklendi; uygulama kodu değişmedi. Eklenen testler:

- `OrderDesignSnapshotTests.AcceptanceBindsLineIdentityPlacementAndAllThreeFilesAcrossEditsAndRestart`
- `apps/admin/tests/order-design-acceptance.mjs`

Gerçek veri, deploy, hosting, Flutter ve APK kullanılmadı.

## Önkoşul doğrulaması

SIP-TAS-01…08 commit'leri (`eb7f3b4`, `55ed208`, `8b38bd2`, `ad7e2da`, `9d530b9`, `cbf4e47`, `1d9aa61`, `8d02569`) `main` üzerinde. Her birinin test kaydı ve açık kabul koşulu task listesinde kayıtlı. Bu son test sırasında hiçbiri “tamamlandı” sayılmadı.

## Kontroller

- **TST-239 / API KABUL:** yeni kabul testi PASS. `OrderDesignSnapshotTests` toplamda 16/16 PASS.
  - Test önce sipariş satırının kaydını doğruluyor: ürün, varyant, renk ve SKU katalogla aynı; adet 2; tasarım, revizyon 1 (revizyon 2 varken sipariş edildi) ve şema doğru; yerleşim gövde ayarlarıyla birlikte aynı; desen özeti kayıtlı.
  - Üç dosya tek tek doğrulanıyor: bayt, SHA-256, tür, boyut, `sha256` doğrulama başlığı ve dosya adındaki revizyon. Personel paneli ile müşteri görünümü aynı bağı gösteriyor.
  - Ardından tasarım yeniden adlandırıldı, revizyon 3 kaydedildi, yeni katalog fotoğrafı ve maske yayımlandı, renk görseli değiştirildi ve tasarım silindi. Bu değişikliklerden sonra doğrulama aynen tekrarlandı ve geçti.
  - Aynı izole veri klasöründe yeni bir sunucu örneği açılıp doğrulama bir kez daha tekrarlandı. Bu, Development dosya deposunun yeniden başlatılmasıdır; SQL değildir.
- **TST-240 / API REGRESYON:** `dotnet test` PASS — 514 test geçti, 29 atlandı, 0 başarısız. Atlananların 17'si açık SQL bağlantısı gerektiriyor; geri kalanı etkileşimli smoke testleri. API Release derlemesi 0 uyarı, 0 hata. `pnpm contracts:generate` ve kontrol betiği PASS (105 işlem, değişiklik yok).
- **TST-241 / ADMIN EKRAN KABULÜ:** `order-design-acceptance.mjs` PASS (320, 390, 768 ve 1440 px).
  - Erişilebilirlik ve taşma: axe ile WCAG 2.1 A/AA'da kritik veya ciddi ihlal 0; 1x ve %200 metinde taşma yok.
  - Klavye: Tab sırası üç indirmeye ulaşıyor, odak görünür ve pencerede kalıyor; Enter ile indirme başlıyor.
  - Duyuru ve kapanış: “tarayıcıya verildi” duyuruluyor; Escape pencereyi kapatıyor ve odak sipariş satırına dönüyor.
  - İçerik: tüm görsellerin metin karşılığı var; kimlik ve revizyon satırı ile “Temsilidir … Baskıya hazır dosya değildir” etiketi görünüyor.
  - Üretim eylemi yok: üretime gönder, onay/red, render kuyruğu, kalibrasyon, fiziksel profil. Mevcut sipariş eylemleri korunuyor.
  - Tasarımlar ekranında profil ve kalibrasyon yok.
  - Görseller: [order-design-acceptance/](order-design-acceptance/).
  - **Ölçüm:** 320 px %200 kontrolü yedi koşunun ilkinde bir kez taşma bildirdi; o koşuda taşan öğe yakalanmadı. Sonraki 6 koşu PASS (2'si, ölçümden önce iki kare beklemeyle). Kalıcı taşma bulunmadı. Test artık taşma olursa taşan öğeleri listeliyor.
- **TST-242 / ADMIN VE WEB REGRESYON:**
  - **Admin:** `tests/` altındaki 18 dosyanın tamamı tek tek PASS. Aralarında `admin-consistency` (16 modül × 4 genişlik × normal/%200 metin, 16 axe, 48 durum) ile `order-design-detail`, `order-design-file-states` (21), `order-design-legacy-matrix` (7) ve `order-placement` var.
  - **Tools:** `test-admin-personalized-orders`, `test-admin-design-order-detail` (12) ve `test-admin-print-source-state` (38) PASS; `test-admin-order-states` (15) derlenmiş önizlemede PASS.
  - **Statik:** admin lint 0 hata (4 eski uyarı), `tsc -b` ve build PASS; web `tsc --noEmit` PASS.
  - **Web e2e:** `design-configuration.spec.ts` 17/18. Düşen test, SIP-TAS-06 öncesinde de düşen kararsız “pattern can be added…” testi (TST-230).

## Kabul durumu

- **Teknik kabul (otomasyon):** üç indirme ve yerleşim doğru sürümle eşleşiyor, üretim eylemi yok, regresyon ve otomatik erişilebilirlik kontrolleri geçti.
- **Açık:**
  - İzole SQL kalıcılığı ve yeniden başlatma.
  - Canlı sunucu (IIS).
  - Ekran okuyucu ve gerçek cihaz.
  - İş sahibi, rol ve PM kullanıcı kabulü.
  - Gerçek veride eski kayıt envanteri ve geri doldurma kararı.
  - İndirmelerin denetim kaydı (audit) kararı.
  - Mobil kaynaklı siparişlerde önizleme kontrolü.

  Her birinin nedeni ve kapanış koşulu kabul matrisinin §5'inde. Bunlar otomasyonla yapılmış sayılmadı.
