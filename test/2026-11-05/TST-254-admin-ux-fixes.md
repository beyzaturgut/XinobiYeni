# TST-254 | Admin test ve UI/UX bulgularının giderilmesi

05.11.2026. Başlangıç main/805ea02 temiz. Referans: design/admin-ux-audit-2026-11-05.md / TST-253. Gerçek sipariş, katalog veya sağlayıcı kaydı değiştirilmedi. UI testleri tamamen sentetik API yanıtlarıyla; gerçek Sürat isteği, deploy, APK yok.

## Düzeltme ve kabul matrisi

| Bulgu | Düzeltme | Yeniden doğrulama |
|---|---|---|
| ADM-UX-01 — not/taslak kaybı | Dialog X/Escape için kaydedilmemiş not, manuel kargo ve Sürat alanı kontrolü; modül geçişi ve browser popstate koruması; tam sayfa ayrılma/yenileme için beforeunload. Vazgeçmede alanlar korunur; yalnız açık bırakma onayında temizlenir. | order-shipping-ux: X, Escape, cancellable navigation ve gerçek modül geçişi reddi; taslak aynı, 0 write; onaylı discard sonrası boş. Notun tek başına kaydedilmediği açıklaması. |
| ADM-UX-02 — kritik işlem özeti/onayı | Sürat test gönderiminde sipariş/alıcı/TEST/koli/desi/kg/ücret ödeyen özeti; manuel sevk ve tüm sipariş durum/talep aksiyonları tek ortak confirm; eski iptal için çift confirm yok. | İptal onayı = 0 POST; kabul = tek POST. Hazırlanıyor/teslim/iptal/iptal talebi/iade onayı/iade tamamlama sentetik testleri; hata sonrası not korunur. |
| ADM-UX-03 — varsayılan kayıt oluşmuş | Manuel mutabakat sonucu boş başlar; seçim ve boş olmayan kanıt olmadan kaydetme kapalı; teyidin sağlayıcı yanıtı olmadığı ve boş takip yokluk kanıtı olmadığı açıklanır. | Başlangıç seçimi boş; yalnız kanıt girilse de buton kapalı; dört genişlik. |
| ADM-UX-04 — readonly alanlar | Sürat paket ve mutabakat fieldset'i yetkisiz/işlem sürerken disabled; manuel sevk alanları da readonly/işlem kilidine uyar. | Salt okunur paket input/select disabled; submit engeli korunur. |
| ADM-UX-05 — yanıltıcı etiket başarısı | Başarı yalnız dosyanın tarayıcıya verildiğini ve indirmelerden kontrolü söyler. | Download olayı + yeni handoff mesajı; yeniden indirme yeni gönderi yaratmaz. |
| ADM-UX-06 — busy kapanışı | Sürat busy bilgisi üst siparişe aktarılır; X/Escape/uygulama geçişi engellenir. Bekleme uyarısı işlem bitince görünmez. Sipariş ve kargo yazma eylemleri birbirini kilitler. | Geciktirilmiş sentetik provider isteğinde X kapatmaz, input ve diğer sipariş eylemleri kilitli; tek POST sonrası sonuç görünür. Native tab kapanışı için beforeunload kullanıcıya uyarı verir, tarayıcıyı zorla açık tutamaz. |
| ADM-UX-07 — form tutarlılığı | Manuel teyit ortak catalog-form/fieldset/legend, manuel kargo ayrı fieldset; dar ekran aynı responsive kuralları. | 320/390/768/1440 px ölçüm ve 320/1440 görsel inceleme. |

Yanlış dosya ve mükerrer gönderim için sunucu korumaları kaldırılmadı. Desen/kaynak/kompozisyon endpoint/snapshot/hash davranışı değişmedi; UI dosya regresyonları ve ilgili API filtreleri tekrarlandı. Public API/SQL şeması değişmedi.

## Test yaklaşımı ve ilk koşular

- Yeni `apps/admin/tests/order-shipping-ux.mjs`: taslak/gerçek modül ayrılma reddi, açık discard, onay iptali, busy kapanışı, tek yazma, readonly, dosya handoff, tarafsız teyit ve dört genişlik PASS.
- Eski surat-shipment testinde gönderim artık confirm gerektirdiği için test bunu açıkça kabul eder; otomatik retry eklenmedi.
- İlk genel koşuda admin-consistency-states eski tek tıklama varsayımıyla düştü. Hata ve başarılı yeniden deneme adımlarında yeni onayı açıkça kabul edecek şekilde güncellendi. İlk başarısız koşu nihai başarı olarak raporlanmaz.
- Geliştirme sırasında ilk çalıştırıcı HMR dependency-array uyarısı gördü; kaynaklar sabitlendikten sonra temiz başlangıçla genel kontrol tekrarlandı.
- Admin TypeScript/üretim derlemesi PASS; lint 0 hata, AuditHistory/SurfaceMasks içindeki 4 önceki uyarı. Uygulama kodunda bu değişiklik için yeni uyarı yok.

## Sınırlar

Native confirm/beforeunload tarayıcıya bağlıdır; ekran okuyucu ve gerçek cihaz kabulü değildir. Taslaklar yerel diske/Git'e yazılmaz, kullanıcı açıkça ayrılmayı onayladığında bırakılır; oturum zorunlu sonlandırılırsa taslak garantisi verilmez. SQL/IIS/PM kabulü açık. Mevcut belirsiz Sürat kayıtları ne tekrar gönderildi ne uzlaştırıldı. Test başarısı Sürat gerçek kayıt kabulü anlamına gelmez.

## Nihai doğrulama

- İlgili API filtreleri: 97 PASS / 0 SKIP / 0 FAIL (OrderDesignSnapshotTests ve Surat). Tam API paketi bu UI değişikliğinde tekrar çalıştırılmadı.
- Temiz başlangıçlı genel admin çalıştırıcısında 20/21 dosya PASS; eski admin-consistency-states testi başarılı retry öncesindeki ikinci onayı kabul etmediğinden FAIL. İkinci onay önkoşulu da eklendikten sonra yalnız bu dosya tekrar çalıştırıldı: 15/15 senaryo PASS. Böylece 21 dosyanın her biri son kod üzerinde doğrulandı; tek genel koşu 21/21 sonucu varmış gibi sunulmaz.
- Yeni order-shipping-ux son koşusu PASS; kritik aksiyonlarda iptal=0 yazma, kabul=1 yazma, bekleyen gönderimde kapanış engeli, readonly alanlar, taslak ve modul geçişi; 320/390/768/1440 px normal/%200 metin taşma yok.
- Admin TypeScript/üretim build PASS. Lint 0 hata / 4 mevcut kapsam dışı uyarı. git diff --check PASS.
- Desen/kaynak/kompozisyon dosya testleri, 21 dosya hata senaryosu, 7 legacy durum ve yerleşim regresyonu genel koşuda PASS.
- 320/1440 px yeni form ve 320 px %200 ekranı görsel incelendi; kanıtlar admin-ux-fixes altında.

Yedi audit bulgusunun teknik düzeltmesi doğrulandı. SQL/IIS/PM ve gerçek ekran okuyucu/cihaz kabulü bu raporla kapatılmaz.
