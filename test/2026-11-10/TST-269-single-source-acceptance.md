# TST-269 — KIS-TEK-12 tek kaynak kabulü ve regresyonu

10.11.2026 · Taban `b663f51` (task 11). **Yazılımsal birleşik kabul tamam; gerçek cihaz/SQL/IIS/iş sahibi kabulü açık.** Yeni testler ve mevcut paketler bu taskta yeniden çalıştırıldı; eski rapor sayıları yeni sonuç gibi kopyalanmadı.

[Güncel akış](../../docs/runbooks/single-source-personalization.md) · [Tekrar çalıştırma ve dış kabul adımları](../../docs/runbooks/single-source-acceptance.md) · [Android](../../docs/reports/single-source-acceptance-android-2026-11-10.md) · [iOS](../../docs/reports/single-source-acceptance-ios-2026-11-10.md).

## Sonuçlar

| Paket | Bu çalışmanın sonucu |
|---|---|
| Tam API / OpenAPI endpoint ve sözleşme regresyonları | **627 PASS / 29 SKIP / 0 FAIL**, toplam 656; TRX sonuç dosyasından doğrulandı |
| Yeni birleşik API zinciri | **4/4 PASS**: 73×41 yatay, 41×73 dikey, 79×79 kare, 5001×4000 büyük (>20 MP) |
| API Release | **PASS, 0 uyarı / 0 hata** |
| Admin izole paketler | **25 ayrı paket PASS**: ilk toplu koşuda 24 PASS; bekleyen genel matris durduruldu ve tek başına yeniden PASS. İlk runner çıkışı 1 idi; temiz toplu 25/25 koşusu olarak sunulmaz. |
| Genel admin ekran matrisi | **16 modül × 4 genişlik × normal/%200**; 16 axe kontrolü, 48 boş/hata/403 girişi PASS |
| Web tek kaynak matrisi | **19/19 PASS** |
| Web sipariş snapshot/zoom | **7/7 PASS** |
| Flutter analiz / test | **No issues found / 302 PASS / 0 FAIL** |
| Dart istemci sözleşmeleri | **12 PASS / 0 FAIL** |
| TypeScript istemci | `tsc --noEmit` PASS; kayıtlı OpenAPI'den `/tmp`'ye yeniden üretilen schema ile mevcut TS schema dosyası `cmp` birebir PASS |
| Admin lint / TypeScript / production build | PASS; yalnız önceden mevcut AuditHistory set-state-in-effect lint uyarısı |
| Web ESLint / TypeScript / production export | PASS |
| Yayın araçları | **5 PASS / 0 FAIL**, yeni ürün bazlı denetim ve tarihsel varyant fixture uyumluluğu |
| Tasarım token kontrolü | `design tokens 0.4.0 match the web palette` |

## Aynı kayıtla yeni kabul zinciri

Yeni `tests/Xinobi.Architecture.Tests/SingleSourceAcceptanceTests.cs`, dört boyutun her birinde gerçek API HTTP uçlarını **aynı geçici katalog, profil, hesap ve sipariş** üzerinde kullanır:

1. Personel multipart kaynak yükler → candidate hash/ölçü alınır → açık kaynak seçimi kaydedilir → indirilen fotoğraf orijinal baytlarla eşleşir.
2. Farklı tuvaldeki maske reddedilir. Doğru kayıpsız WebP yüklenir, taslak indirilir ve gerçek ölçüsü kontrol edilir; açık maske onayı verilir.
3. Ticari SKU açıkça eşlenir, anonim purchase yanıtında gerçek ölçü/hash ve aynı SKU bağı doğrulanır.
4. Müşteri desen yükler → schema-2 yerleşim kaydeder → yeni revizyon oluşturur. Önceki revizyon aynı kalır; geçerli JPEG yeni revizyona yüklenir.
5. Aynı ticari SKU'nun kişiselleştirilmiş satırı ve normal satırı ayrı demo sipariş satırlarıdır. Aynı anahtar/payload aynı siparişi döndürür; değişen payload 409 alır, ikinci sipariş yoktur.
6. Kaynak değiştirilir: yeni kaynak onaysızken **404 surface_not_available**; yeni maske onaylandıktan sonra eski binding ile yeni sipariş **409**. Koordinatlar sessizce taşınmaz, ikinci sipariş oluşmaz.
7. Personel eski siparişin desen, maskelemede kullanılan kaynak ürün fotoğrafı ve giydirilmiş önizlemesini ayrı indirir. Üç dosya da sipariş anındaki baytlarla aynıdır; kaynak güncellemesi siparişe yansımaz. Admin indirmelerine müşteri 403, anonim 401 alır. Normal katalog/fiyat/stok başlangıçla aynıdır.

İlk yazılan testin onaysız yeni kaynak için 409 beklentisi sözleşmeyle uyuşmuyordu; bu durum 404 yüzey yok ile, onaylı yeni yüzeydeki eski binding ise ayrıca 409 ile test edildi. Ürün kodu hata kodunu teste uydurmak için değiştirilmedi.

## Kabul kriteri matrisi

| Kriter | Yeni çalıştırılan kanıt / durum |
|---|---|
| Doğrudan kaynak yükle/indir, hash ve gerçek ölçü | Yeni 4 zincir + PersonalizationSourceTests + admin personalization-source: PASS; resize/standart tuval yok |
| Gerçek boyutlu maskeleme promptu, logo/parça/alfa talimatları | Admin single-source-mask + personalization-source: PASS; iki eski fotoğraf üretim girişi yok |
| WebP yükle/incele/onayla, yanlış format/boyut/hash/revizyon | Yeni zincir + SingleSourceMaskTests: PASS; kapasite hatası açık, kaynak korunur |
| Tek kaynak kamu yayını / geri alma / eski çoklu yazma | SingleSourceMaskTests + ProductSurfaceWorkspaceTests: PASS; emekli approval/colors ve varyant maskesi yazmaları 410, eski okumalar kendi kaydında |
| Renk adımı olmadan web/Flutter; normal renkli ürün korunur | Web 19 + Flutter 302 + admin normal/legacy satır testi: PASS; gerçek cihaz ayrı açık |
| Tasarım/revizyon/favori/sepet/demoya satın alma | API yeni zincir + SingleSourcePurchaseTests / CustomerTests / OrderDesignSnapshotTests + web 19 + Flutter: PASS |
| Eski tasarım/sipariş ve kaynak değişimi | Yeni zincir + SingleSourceOrderFilesTests + legacy tarayıcı paketleri: PASS; otomatik dönüştürme/backfill yok |
| Eksik/bozuk dosya, yanlış ürün/yüzey, yetki, tekrarlı istek | Tam API paketi + admin dosya durumları + web snapshot: PASS; sunucu doğrulaması olmadan başarı yok |
| Üç dosya ayrı ve değişmez | Yeni 4 zincir ve SingleSourceOrderFilesTests + admin single-source-order-detail: PASS; ürün kaynak fotoğrafı alfa maskesi değildir |
| TS/Dart ve üretim kontrolleri | Üst sonuç tablosu PASS; wire/API sözleşmesi ve SQL DDL bu taskta değiştirilmedi |
| Android/iOS fiziksel cihaz / erişilebilirlik | **Açık**; ayrı platform raporları var, widget/axe kabulü cihaz kabulü değildir |
| Gerçek SQL çoklu süreç / IIS / restore | **Açık**; mevcut 29 skip dış koşulları kapatmaz |

## İzolasyon ve kanıtın sınırı

API `IsolatedApiFactory` geçici dosya depolarını ve sentetik veriyi kullanır. Gerçek müşteri/katalog/siparişe yazılmaz; SQL, AI/kargo sağlayıcı çağrısı ve gerçek tahsilat yoktur. Admin guard ve web context fixture'ları mock dışı API/harici host isteklerini engeller. Araç testleri mock fetch/geçici çıktı kullanır.

API zincirindeki giydirilmiş JPEG **sentetik fixture**'dır; fiziksel görsel kalite veya renderer çıktısının ürünle gerçek uyumu iddia edilmez. Web/admin tarayıcı testleri ile Flutter/widget testleri kendi fixture'larında çalışır. Bunlar gerçek Android/iOS UI → sunucu → fiziksel baskı tek oturum UAT'si değildir.

Admin genel matrisi ilk toplu çalışmada Chrome ilerleme vermeden bekledi. Yalnız sahip olunan test/alt tarayıcı süreçleri kapatıldı; gerçek yerel servisler veya başka tarayıcılar sonlandırılmadı. Teste aşama günlüğü eklendi; guarded aynı-origin tekli tekrar PASS. Diğer 24 admin paketi ilk koşuda PASS. Bu nedenle ilk koşu hatası gizlenmedi; tekrar sonucu ayrı kaydedildi.

Görsel inceleme: yeni koşudan `artifacts/task09-save-cart-mobile.png` (390 px web kayıt/sepet), `artifacts/admin-safe-tests/single-source-order-detail/single-source-order-files-1440.png` (ayrı indirmeler/legacy renk). Sentetik renk blokları fixture'dır. Tarayıcı paketlerinin 320/390/768/1440 ve %200/klavye/axe sonuçları gerçek ekran okuyucu sertifikası değildir. Görüntüler/loglar derleme çıktısıdır, repoya eklenmez.

## Atlanan 29 test

TRX'ten çıkarılan sınıf dağılımı: AdminCustomerRead 1, AdminDesignMetadata 1, AdminDesignOrder 1, AdminMfaSql 6, AdminOrderDetail 1, AdminSummary 1, Audit 2, SqlAccountIntegration 3, SqlCatalogIntegration 1, SqlFeatureDocument 3 (**20 SQL/ops açık opt-in**); Cm101CandidateRuntime 3 ve Cm101CatalogSegmentation 6 (**9 tam yerel CM kaynak bağımlılığı**). SQL/CM kaynak koşulları test amacıyla gerçek veriye bağlanarak zorlanmadı. Skip başarılı test olarak sayılmadı.

## Tekrar adımları ve kayıtlar

Komutlar [kabul rehberinde](../../docs/runbooks/single-source-acceptance.md). Genel admin matrisini tek başına tekrar etmek için mevcut standart yerel admin üzerinde guarded komut kullanıldı:

```sh
ADMIN_UI_URL=http://127.0.0.1:5173/ ADMIN_CONSISTENCY_OUTPUT=/tmp/xinobi-task12-admin-matrix node --import ./apps/admin/tests/helpers/isolated-browser.mjs apps/admin/tests/admin-consistency.mjs
```

Kalıcı özet bu rapordadır. Geçici ayrıntılar: `/tmp/task12-api-full.log`, `/tmp/xinobi-task12-api/task12.trx`, `/tmp/task12-api-chain-final.log`, `/tmp/task12-api-release.log`, `/tmp/task12-admin-tests.log` (ilk koşu), `/tmp/task12-admin-matrix-retry.log` ve `/tmp/xinobi-task12-admin-matrix/matrix.json` (başarılı tekrar), `/tmp/task12-web-single.log`, `/tmp/task12-web-order.log`, `/tmp/task12-flutter-analyze.log`, `/tmp/task12-flutter-tests.log`, `/tmp/task12-dart-contracts.log`, lint/build/TS/tools logları. Bunlar credential/gerçek veri içermeden yerel tutuldu.

## Açık kapanış kapıları

- **İşletme kararı:** gerçek kaynak ve fiziksel SKU/fiyat/stok eşleme kabulü; 23 ürün içeriği ve SKU 117 fiyatı açık. Testler gerçek atama yapmaz.
- **Android ve iOS:** `flutter devices` yalnız macOS/Chrome gösterdi. Gerçek WebView/galeri/izin iptali/geri/oturum/ağ hatası ve VoiceOver/TalkBack kabulü ayrı açık.
- **SQL/restore/IIS:** boş izole DB ile opt-in testler, çoklu süreç, dosya+DB yedek/geri dönüş ve gerçek hosting kabulü açık. Dosya deposu testleri bunun yerine geçmez.
- **Görsel/iş sahibi kabulü:** gerçek ürün/maske sınırları ve kaplanmayan parçalar ayrıca incelenmeli. Sınırsız çözünürlük, fiziksel baskı DPI/ölçüsü veya üretim onayı verilmez.
- **Yayın ve entegrasyon:** deploy/release/APK yapılmadı. Gerçek ödeme, Sürat sağlayıcı kaydı/hareketi ve fiziksel kabul bu taskla kapanmaz.

01–12 değişiklik planının yazılım uygulaması ve izole regresyonu tamamdır; proje veya fazların canlı/iş sahibi kabulü tamamlandı sayılmaz. Dış kapıların kapanış koşulları kabul rehberinde ve ayrı platform raporlarında tutulur.
