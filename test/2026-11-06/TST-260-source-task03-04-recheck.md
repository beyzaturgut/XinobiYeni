# TST-260 — KIS-TEK-03 ve bağlı 04 tekrar kontrolü

06.11.2026. Kullanıcı önce 03’ün tamamlanmasını, ardından 04’ün 03’e bağlı eksiklerinin giderilmesini istedi. 05’e başlanmadı. İnceleme başlangıcında Git temizdi; önceki 191c45a (03) ve fc668e7 (04) commitleri doğrulandı.

## Bulgu ve düzeltme

PersonalizationSource seçili ürün kimliğini başlangıçta boş tutuyor, `eligible[0]` fallback’iyle render ediyordu. Kaynak seçimi dirty iken normal katalog güncellemesi kişiselleştirilebilir ürünleri yeniden sıralarsa farklı ürün anahtarına geçilip SourceEditor yeniden oluşturuluyor, seçim kayboluyordu. Seçili ürünün XINOBI U işareti kaldırıldığında da aynı kayıp oluşuyordu.

Seçim artık açık ürün nesnesi/kimliğiyle sabitlenir; katalog sırası kaynak ürününü değiştirmez. Ürün silinir/kişiselleştirmeye kapanırsa eldeki ürün/seçim tutulur, uyarı gösterilir ve yazma/yükleme kapatılır. Ürün yeniden açılırsa seçimle devam edilebilir. Başka ürüne geçişte mevcut vazgeçme onayı korunur. Başlangıçta uygun ürün yokken sonradan eklenmesi için ilk etkileşim seçimi sabitler.

Kaynak hizmeti ve 4. taskın ham yükleme/indirme uygulaması değiştirilmedi. Fotoğraf üretim promptunun kaldırılmasını geri alan veya gerçek veriye yazan bir işlem yapılmadı.

## İzole doğrulama

Genişletilen `apps/admin/tests/personalization-source.mjs`, bütün API/medya istekleri fixture ile karşılanarak çalıştırıldı:

- Kaynak seç → normal katalog kategori kaydı üzerinden ürünleri yeniden sırala → aynı ürün ve kaydedilmemiş fotoğraf duruyor: PASS.
- Kaynak üründe Personalizable=false olan katalog yanıtı → uyarı, aynı ürün/taslak ve disabled kayıt: PASS.
- Kapatılmış üründen başka ürüne geçiş onayı reddedilince seçim korunuyor: PASS.
- Seçili ürün katalog yanıtından tamamen kaldırılınca aynı taslak korunuyor ve kayıt kapalı kalıyor: PASS.
- Ürün tekrar açılınca aynı taslak kaydedilebilir: PASS. Bu dört katalog güncellemesinin hiçbiri otomatik kaynak PUT üretmedi.
- Önceki kaynak yok/yüklenme/hata/yetki/stale/başarı, dirty/busy/onay/logout ve readonly senaryoları: PASS.
- 4. task: hem katalog ana ekranında hem ürün Medya sekmesinde üretim promptu yok; normal ürün medyası mevcut. Multipart dosya bölümü ve indirilen dosya orijinalle birebir eş. 5001×3730 PNG senaryosu: PASS.
- 320/390/768/1440 px, kaynak alanında %200 metin, klavye ve axe kritik/ciddi 0: PASS. Gerçek cihaz/ekran okuyucu kabulü değil.
- PersonalizationSourceTests: 6 PASS, 0 SKIP/FAIL; kaynak kalıcılığı/yeni API örneği, renk/HEX bağımsızlığı, sürüm/hash/yetki ve geçmiş dosya koruması yeniden doğrulandı.
- Admin lint: 0 hata, önceki 4 uyarı. TypeScript + Vite üretim derlemesi PASS.
- git diff --check ve task/rapor bağlantıları PASS.

Bu turda API runtime kodu değişmediği için tam API regresyonu tekrarlanmadı. Gerçek katalog, tasarım, sipariş veya dosya deposu değiştirilmedi. SQL/IIS/cihaz kabulü, deploy ve APK yapılmadı. Yeni kaynağın maskeleme ekranı ve müşteri akışına bağlanması 05 ve sonraki tasklarda açık; 03/04 eksikliği diye bu kapsam başlatılmadı.
