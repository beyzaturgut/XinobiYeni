# KIS-TEK-02 — Salt okunur envanter ve güvenli geçiş planı

06.11.2026 · Planlama teslimi tamamlandı; geçiş uygulanmadı. Dayanak: [ADR-005](../decisions/ADR-005-personalization-single-source.md), [task planı](../tasks/personalization-single-source-tasks-2026-11-06.md), [anonimleştirilmiş teknik envanter](personalization-inventory-2026-11-06.json).

## İncelenen ortam ve sınırlar

Yerel uygulama Development marker dosyalarıyla katalog, hesap ve özellik belgelerinde yapılandırılmış SQL deposunu kullanıyor. SQL verileri yalnız SELECT ile okundu; müşteri adı, e-posta, adres, telefon, hesap kimliği, parola/token ve bağlantı bilgisi rapora alınmadı. SQL deposunun dosyaları ile bu bilgisayarın dosya deposu aynı şey değildir: aşağıdaki dosya yoklukları **yerel dosya kontrolü** sonucudur; IIS’te kayıp dosya kararı değildir. Canlı panel/sipariş veya sağlayıcı üzerinde işlem yapılmadı.

Yerel state.json 17 ürün/4 fiyat içerirken etkin SQL 24 ürün/78 fiyat içeriyor. Dosya seed/state verisini SQL’in üstüne taşımak veri kaybına yol açabilir; bu dosyalar geçiş kaynağı sayılmayacak. Test dizinleri integration-runtime, integration-playwright ve real-catalog-qa ayrıca dışarıda bırakıldı.

SQL tek SELECT anında okundu; çalışan uygulama üzerinde yedek tutarlılığı garantisi değildir. Gerçek geçişte yazılar durdurularak tutarlı DB+dosya snapshot’ı alınması gerekir.

## Envanter özeti

- SQL: 24 ürün, 79 varyant, 78 fiyat. 7 ürün açıkça kişiselleştirilebilir.
- 39 kayıtlı tasarım, 19 yerleşim revizyonu; 11 sipariş/16 satırın 9’u kişiselleştirilmiş.
- Yerel workspace: 2 taslak; dosyaları mevcut fakat iki varyant da güncel SQL’de yok.
- İncelenen fixture manifesti: 8 giriş; yerel yayımlanan önizleme: 8 giriş. Yayımlanan 8 varyantın tamamı güncel SQL’de yok; otomatik yeni ürüne bağlanamaz. 24/24 yayımlanan varlık ve 32/32 fixture dosyası hash kontrolünden geçti; dosyaların sağlam olması güncel katalogla eşleştiği anlamına gelmez. Bu task yayınlama aracını çalıştırmadı.
- 12 tasarımın ürün referansı ve 11 tasarımın varyant referansı güncel katalogda bulunmuyor (gruplar örtüşebilir; toplanmaz).
- 28 tasarım dosyası yerelde yok. 19 konfigürasyonun 8’inin desen dosyası yerelde yok; erişilebilen 11’inde desen hash uyuşmazlığı yok.
- 19 konfigürasyonun ürün/varyant/tasarım ilişkileri mevcut; 19 güncel maske hash’i kayıtlı surfaceVersion ile eşleşiyor. Bu, eski ürün kaynak fotoğrafının değişmediğinin tek başına kanıtı değildir.
- 9 kişiselleştirilmiş sipariş satırının 2’sinde üçlü dosya manifesti var: 6/6 yerel dosya boyut+SHA kontrolü geçti. Diğer 7’sinde eski kayıt/manifest yokluğu var; güncel katalogdan geriye dönük doldurulmayacak.

## Ürün başına kaynak adayları ve karar

| Ürün | Varyant | Farklı kaynak adayı | Onaylı maske bağı | Tasarım | Revizyon | Kişisel sipariş satırı | Kaynak/SKU kararı |
|---|---:|---:|---:|---:|---:|---:|---|
| Elektrikli Çay Makinesi 131135 | 5 | 5 | 5 | 4 | 3 | 3 | Seçilmedi |
| Otomatik Türk Kahvesi Makinesi 501505 | 5 | 5 | 5 | 1 | 0 | 0 | Seçilmedi |
| Elektrikli Çay Makinesi 136140 | 5 | 5 | 5 | 6 | 3 | 2 | Seçilmedi |
| tasarım deneme | 1 | 1 | 1 | 1 | 1 | 1 | Seçilmedi |
| Elektrikli Çay Makinesi 121125 | 5 | 5 | 5 | 5 | 1 | 2 | Seçilmedi |
| Elektrikli Çay Makinesi 111115 | 5 | 5 | 5 | 5 | 6 | 1 | Seçilmedi |
| Elektrikli Çay Makinesi 101105 | 4 | 4 | 4 | 5 | 5 | 0 | Seçilmedi |

[Boş seçimli eşleme şablonu](../tasks/personalization-source-mapping-template.json) 7 ürünün aday varyantlarını içerir; kaynak/SKU/reviewer alanları doldurulmadı.

Adaylar gerçek kaynak dosyası hash’iyle gruplanır; okunamıyorsa yol yalnız aday ayrımı için kullanılır, eşit dosya kanıtı sayılmaz. Bu 7 üründeki 30 varyantın kaynak ve maske dosyaları yerelde mevcut. Ayrıntılı ürün/varyant/SKU ve kaynak adayları JSON raporunda; kaynak ve fulfillmentVariantId değerleri **null**. Bir aday olması bile otomatik onay değildir. Birden fazla kaynakta en çok kullanılanı/ilkini seçme yoktur. Ürün başına adminin tek fotoğraf yüklemesi/seçimi ve işletmenin fiziksel SKU teyidi gerekir.

## Çakışma listesi ve kapanış şartları

| Öncelik | Bulgu | Yapılacak / kapanış koşulu |
|---|---|---|
| P1 | 6 kişiselleştirme ürününde birden fazla farklı kaynak | Ürün başına açık kaynak seçimi/yüklemesi ve SKU kabulü; aday listesi imzalanır. Tek adaylı deneme ürünü de ayrıca değerlendirilir. |
| P1 | 28 tasarım dosyası yerelde bulunmuyor | Asıl Storage:LocalRoot/depo üzerinde salt okunur karşı kontrol; dosya varsa doğrulanmış yedeğe dahil et. Yoksa kayıp olarak kayıtla, yeniden üretme/otomatik silme yapma. |
| P1 | 12 tasarımda ürün, 11’inde varyant güncel katalogda yok | Eski kaydı koru; geçmiş salt okunur. Yeni sipariş/düzenleme için açık ürün eşlemesi veya kullanıcıdan yeni ürün seçimi gerekir. |
| P1 | Eski SourceSha256 alanının anlamı | MyDesignConfiguration.SourceSha256 **desen dosyası hash’idir**, ürün fotoğrafı hash’i değildir; CopyToOrder bunu doğrular. Hedef modelde patternSha256 ile product sourceSha256 ayrılacak; eski alan yeniden adlandırılıp yanlış yorumlanmayacak. |
| P2 | 2 yerel taslak güncel varyantlardan kopuk | Ayrı legacy envanteri/yedeği; ürün/fotoğraf/hash eşlemesi manuel doğrulanmadan yeni yüzeye kopyalama yok. |
| P2 | 8 yayımlanan önizleme güncel varyantlarda yok | Eski statik paketleri koru, yeni yayını ayrı sürümlü dizinde hazırla; mevcut publisher rm(output) davranışıyla geçmişi silme. |
| P2 | 7 sipariş satırında üçlü manifest yok | Legacy sunumu korunur; indirilebilir mevcut dosyalar asıl depoda ayrıca araştırılır. Eksik kaynak/önizleme güncel katalogdan doldurulmaz. |
| P1 | Asıl IIS dosyaları ve gerçek geçiş provası henüz yok | Aynı SELECT ve dosya hash kontrolünü sunucu/veritabanı klonunda tekrar et; DB+dosya yedeği ve restore provası geçmeden apply yok. |

## Hedef depolama ve SQL/özellik belgesi değişikliği

Bu teslimde DDL/migration veya veri UPDATE/INSERT/DELETE çalıştırılmadı.

1. Yeni model için mevcut **ops.FeatureDocuments** içinde ayrı `personalization-profiles` belgesi kullanılması önerilir: schemaVersion, migrationId, products altında profil/ticari bağ ve değişmez kaynak/yüzey revizyonları. Yeni fiziksel tablo/kolon bu tasarım için zorunlu değildir. Bu seçim, mevcut DocumentStore uygulama kilidi/RowVersion davranışını kullanır; task 06’da kod incelemesiyle uygulanır. DocumentStore birden fazla SQL tabloyu tek transaction yapan bir araçmış gibi varsayılmaz.
2. `FeatureDocuments.Files` listesine yeni göreli belge yolu eklenmeli; Name dönüşümü dosya adından geldiği için çakışma kontrolü yapılmalı. Import aracı hedefin boş olmasını bekliyor: dolu canlı ops.FeatureDocuments’e genel FeatureTransfer tekrar çalıştırılmaz. Sadece yeni belgeyi hedefleyen koşullu/atomik geçiş gerekir.
3. `designs` özellik belgesi yeni kayıtlar için schemaVersion, ürün kaynağı/yüzey kimliği, profileRevision, commercialVariantId, **patternSha256** alanlarını desteklemeli. Eski JSON alanları ve eski revizyonlar korunur; mevcut SourceSha256 ürün fotoğrafı hash’i sanılarak aktarılmaz. Eski kayıtlar için yan eşleme manifesti kullanılabilir; geçmiş revizyona yerinde dönüşüm yok.
4. `catalog.Products`, `catalog.Variants`, `catalog.VariantPrices` mevcut haliyle kalır. Kişiselleştirme profili fulfillmentVariantId ile mevcut varyanta bağlanır; fiyat/stock çoğaltılmaz, SKU uydurulmaz. JSON bağının FK’si yoktur: aynı ürün üyeliği ve varyant silme koruması katalog transaction’ında yeniden doğrulanmalıdır.
5. `sales.OrderLines.PersonalizationJson` yeni siparişlere ek kimlik/hash alanları taşıyabilir; fiziksel SQL kolonu zorunlu değil. Eski sipariş, Color/VariantReference, fiyat ve dosya manifestleri UPDATE edilmez.
6. Workspace taslakları SQL’de değildir: commerce.DataDirectory/product-surfaces altındadır. Yeni tek kaynak workspace’i ayrı sürümlü alt dizinde, eski workspace’e dokunmadan hazırlanmalı. Onaylı dosyalar mevcut medya deposunda kalmalı; korunacak dosyalar GC’den hariç tutulmalı.
7. `design-studio/sessions.json` AI oturumları ayrıca dosyadadır (yerelde 1 oturum/42 history kaydı). Eski oturumlar süresi bitene kadar eski sözleşmeyle okunabilir; yeni oturumlar yeni profile bağlanır. Eski oturumlar otomatik tekrar üretilmez veya yeni SKU’ya yönlendirilmez.

## Tekrarlanabilir dry-run ve uygulama sırası

1. Ortam/commit kimliğini ve efektif Catalog/Accounts/Features/Storage/PublishedRoot yapılandırmasını **gizli değerleri raporlamadan** doğrula. SQL export ve dosya deposunun aynı işletim ortamını temsil ettiğini kaydet. Dosya state.json’ı SQL sanma.
2. `tools/sql/personalization-read-only-inventory.sql` sorgusunu mevcut yetkili **okuma bağlantısıyla** çalıştır; JSON gövdesini özel geçici dosyaya kaydet. sqlcmd başlık/satırlarını JSON’dan ayır; snapshot’ı Git’e koyma. Örnek analiz komutu (depo kökünde):

   ```sh
   python3 tools/personalization-inventory.py --repo "$PWD" --snapshot /tmp/xinobi-personalization-sql-inventory.json --report /tmp/personalization-dry-run.json
   ```

3. Aynı snapshot+aynı dosya deposuyla iki kez çalıştır. Raporlar byte/hash olarak aynı olmalı. Araç kaynak veriye yazmaz; yalnız verilen rapor dosyasını yazar. SQL sorgusu yalnız SELECT’tir. Dry-run gerçek migration/apply çalıştırıcısı değildir.
4. Ürün başına mapping dosyasında productId, selectedSourceSha256/assetId, fulfillmentVariantId, reviewedBy/at ve beklenen eski kaynak/yüzey/profile sürümü doldurulur. **Bu teslimde hiçbir seçim yapılmadı.** Boş/çakışmalı eşleme apply’ı engeller.
5. Task 03–10 kodu hazırken, izole DB+dosya kopyasında yeni profiller ve dosyalar gölge alana yazılır. Planlanan her işlem için idempotency anahtarı productId+sourceSha256+mappingVersion kullanılır; var olan aynı içerik no-op, farklı içerik conflict olur. Bu davranış henüz uygulanmadı.
6. Apply ön kontrolü snapshot/catalog revizyonu, hashler, taslaklar ve mapping’i yeniden okur. Arada değişiklik varsa durur; eski dry-run raporuyla apply yok. Kaynak, dosya veya SKU doğrulanamıyorsa yeni satış açılmaz.
7. Yeni dosyaları önce geçici/sürümlü alana hazırla, hashini doğrula; ardından kısa SQL transaction’da beklenen eski belge/RowVersion ve katalog bağını doğrulayarak yeni profil pointer’ını yayınla. DB/filesystem atomik değil: hata durumunda yeni dosyalar orphan olarak izlenir, eski pointer/medya hiç ezilmez.
8. Tek pilot üründe web/Flutter/revizyon/sepet/demo checkout/admin üç dosya akışını izole hesapla doğrula. Eski sipariş ve dosya hash baseline’ları aynı olmalı. Sonra kalan ürünleri tek tek geçir; unresolved ürünler eski salt okunur görünümde kalır, yeni akışa zorlanmaz.

## Yedek ve geri dönüş

- Geçiş öncesi yazıları durdur/maintenance penceresi aç. Yapılandırılmış SQL DB’nin doğrulanmış full yedeğini ve aynı anda medya, designs/files, product-surfaces workspace, AI session/assets ve eski/yeni published manifest/dosyalarını al. Şifreli yapılandırma/erişim yedeği ayrı korumalı yerde tutulur; rapora secret yazılmaz.
- Dosyalar için relative path+size+SHA manifesti; DB için backup kimliği, mevcut migration listesi, yeni belge olup olmaması ve belge RowVersion/hash baseline’ı kaydet. SQL yedeği tek başına dosya yedeği değildir. ZIP/release eski App_Data’yı içermez; uygulama paketi veri yedeği değildir.
- İzole restore provasını geçmeden gerçek apply yapılmaz. Yedek konumu, sorumlu kişi ve geri dönüş penceresi operasyon kaydına girer. Bu teslimde backup/restore işlemi yapılmadı.
- Pilot başarısızsa yeni kayıt kabulünü durdur; eski uygulama sürümü+profil pointer/feature yönlendirmesine kontrollü dön. Yeni sürümde oluşmuş sipariş/tasarım varsa DB’yi körlemesine geçmişe restore etme: önce bu delta ve dosyaları koru, uyumlu okuyucu/ileri düzeltme kullan. Yeni dosyalar hemen silinmez.
- Eski sipariş/dosya hashleri değişmişse rollout durur. Sağlayıcı/kargo/ödeme yan etkisini DB restore geri almaz; bu geçişte gerçek dış servis işlemi başlatılmaz.

## Eski tasarımların kullanım politikası

Salt okuma: eski tasarım ve siparişler eski kimlikleri/dosyalarıyla gösterilir; güncel kaynak üzerine sessiz yeniden çizilmez. Dosya asıl depoda bulunmuyorsa dürüst eksik dosya mesajı gerekir.

Yeniden düzenleme: kullanıcı geçerli ürün ve güncel tek kaynakta yeni revizyon açar. Kaynak/yüzey değişmişse yerleşim yeniden incelenir; eski piksel koordinatları yeni tuvale otomatik kopyalanmaz. Yeni revizyon eskiyi değiştirmez.

Yeni sipariş: güncel profil, SKU, stok/fiyat ve kaynak yüzey doğrulaması zorunlu. Eski variantId’den otomatik ticari eşleme türetilmez. Mevcut fiziksel modelin hangisi olduğu belirsizse yeni sipariş kapalı kalır.

## Teslim ve açık bağımlılıklar

KIS-TEK-02 planlama kabulü tamam: salt okunur envanter, kaynak adayları/çakışmalar, dry-run protokolü, yedek/geri dönüş, JSON/SQL etkisi ve eski kayıt politikası hazır. Gerçek kaynak/SKU seçimi, IIS dosya karşı kontrolü, yedek/restore provası ve migration uygulaması yapılmadı; bunlar task 03–12 ve uygulama geçiş kapılarıdır. Üretim sevki/ek baskı operasyonu eklenmedi.

## Analiz aracının doğrulaması

Aynı snapshot ve dosya deposuyla iki çalışma birebir aynı JSON raporunu üretti. 526 kaynak dosyanın önce/sonra SHA manifesti aynı kaldı. Sentetik varyant sırası değişimi, çoklu kaynakta otomatik seçim yapılmaması ve veri/fixture klasörüne rapor yazma engeli doğrulandı. [TST-257](../../test/2026-11-06/TST-257-personalization-migration-plan.md). Gerçek migration veya restore testi yapılmadı.
