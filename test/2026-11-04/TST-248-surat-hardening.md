# TST-248 | Sürat güvenilirlik ve iptal yarışı

04.11.2026 · KRG-SUR-01 / TIC-08. Başlangıç HEAD `1f5712e`, çalışma ağacı temizdi. Gerçek hesap/sipariş değiştirilmedi; sağlayıcıya istek, deploy ve APK üretimi yapılmadı.

## Güncel inceleme

AGENTS.md, Faz00/Faz05, kapanış taskları, entegrasyon planı, test/INDEX.md ve TST-245/246 ile güncel kurulum/erişim kayıtları okundu. Kaynak 9 sayfalık gönderi ve 8 sayfalık takip PDF'i PDFKit ile yeniden çıkarıldı; altı Postman isteğinin yöntem/yapısı incelendi. Ham örnekler ve kimlik bilgileri kopyalanmadı. Gönderi PDF'inde kendi mağaza için Pazaryerimi=0 / EntegrasyonFirmasi boş; dönüş Tamam. Takipte kod 7 çelişkisi sürüyor. Önceki HTTP 200 erişim gözlemi tarihsel kanıttır; bugün gerçek erişim tekrarlanmadı. Eski 403 güncel kesin blokaj değildir.

CustomerContracts ve OrderLifecycle incelemesi: siparişler ödeme almayan demo siparişleri, güvenilir tahsilat/fulfilment kanıtı yok. Yeni bir “ödendi” bayrağı veya sahte uygunluk üretilmedi. Production oluşturma her koşulda kapalı kalır; AllowProduction tek başına açmaz.

## Açık bazında sonuç

| Alan / açık | Durum | Kanıt ve sınır |
|---|---|---|
| Sunucu secret, ortam ve erişim | doğrulandı | Sabit test/canlı host, ayrı hesap, kapalı varsayılan, redirect kapalı, HttpClient logları kaldırılmış. Admin orders.read/write ve müşteri sahipliği fixture testleri. IIS/APM redaksiyonu yerelden doğrulanamaz. |
| Kalıcı özel referans / çift istek | doğrulandı | Ağdan önce kalıcı claim; eş zamanlı çift tıklama tek POST; restart ve belirsizlikte aynı referans; açık not_created kanıtıyla aynı referansa yeni attempt. |
| Gönderi/iptal yarışı | düzeltildi | Admin POST, yeniden okunan siparişi ChangeOrder'ın atomik hesap kilidi içinde doğrular ve kalıcı rezervasyon olayı yazar. İptal önce kazanırsa gönderim reddedilir; rezervasyon önce kazanırsa müşteri/panel iptali ve manuel shipment 409. Preparing durumundaki bekleyen iptal de engeldir. |
| Kesinti sonrası rezervasyon | doğrulandı | Sipariş geçmişinde ayrı actor ile saklanır; ticari Status değişmez. Süre aşımıyla otomatik bırakılmaz. Gönderi claim'inden önce çökme de güvenli biçimde bloke kalır. |
| Takip hareket kaybı | düzeltildi | Aynı belge/parça kimliği sonraki yanıtta tekrar geldiğinde önceki raw belge sürümleri artık History arşivinde korunur. Atlanan parçalar/iade belgeleri ve hata/boş yanıtta önceki veri korunur. Arşiv müşteriye açılmaz. |
| Kabul ve durum ayrımı | doğrulandı | Tamam/Kayıt Edildi yalnız kayıt; boş veya Sipariş bulunamadı kabul bekleme; kod7 needs_review, kod12 return_delivered; sipariş/ödeme/refund değiştirilmez. |
| Ağ / kimlik / belirsiz yanıt | doğrulandı | 401/403/500, bağlantı hatası, timeout ve kesin olmayan kayıt cevabında otomatik retry yok; gizli exception metni dışarı çıkmaz. |
| Etiket | doğrulandı | Test SVG'de kaydedilmiş cari ve tam referans; Code128-B bilinen checksum/stop vektörü, XML kaçışı, kayıt ve ortam engelleri; yeniden indirme create yapmaz. Bu koşuda fiziksel barkod taraması yapılmadı. |
| Admin ekranı | doğrulandı | Chrome sahte API ile altı senaryo; 390/1440 px ekran görüntüleri görsel kontrol; yetki/ayar engeli, belirsizlik ve stale veri gösterimi. |
| Gerçek ödeme/operasyon uygunluğu | dış bağımlılık nedeniyle açık | Gerçek ödeme kaydı, tahsilat doğrulaması, stok/operasyon uygunluğu sağlayan ticari akış gerekiyor. Demo veriden canlı açılmaz. |
| Sağlayıcı ve fiziksel kabul | dış bağımlılık nedeniyle açık | Windows/IIS egress, yazma yetkisi, sandbox gerçek gönderi/şube kabulü, onaylı canlı şablon/cari barkodu/çoklu koli, fiziksel okuyucu. |
| SQL çoklu süreç kabulü | dış bağımlılık nedeniyle açık | ChangeOrder SQL hesap applock ve FeatureDocuments transaction tasarımı incelendi; izole gerçek SQL/çoklu süreç ortamında çalıştırılmadı. Dosya modu tek Development süreci içindir. |

Rezervasyon bilinçli olarak otomatik kaldırılmaz: kayıt yokluğu uzlaştırması aynı referansla tekrar denemeyi açar, otomatik iptali açmaz. Gerçek sağlayıcı silme/geri çekme sözleşmesi ve operasyon kabulü olmadan “gönderiyi iptal ettik” denmez. İleride güvenli rezervasyon bırakma, gönderi yeniden denemesiyle aynı kalıcı kilit altında tasarlanmalı; geçmiş olayı elle silmek kapanış yöntemi değildir. Mevcut eski gönderi denemeleri için geçmişe dönük rezervasyon uydurulmadı; canlı kapısı bunlar için de kapalıdır.

History ham yanıt sürümlerini korur; aynı belgenin son sorguda gelen sürümü görünür kalır. Sağlayıcı zaman dilimi/kesin hareket sırası ve arşiv saklama süresi kabulü açık; burada zaman dilimi veya sipariş durumu türetilmez.

## Doğrulama

- Sürat odaklı paket: ilk son koşu 57 PASS / 0 SKIP / 0 FAIL; ilave preparing iptal senaryosu nihai tam pakete dahildir.
- Nihai tam API ve Release derleme sonuçları aşağıdaki son kayıt bölümündedir.
- Admin `pnpm --filter admin lint`: 0 hata; önceden bulunan AuditHistory/SurfaceMasks içinde 4 effect uyarısı.
- Admin `pnpm --filter admin build`: TypeScript ve Vite üretim derlemesi PASS.
- `node apps/admin/tests/surat-shipment.mjs`: PASS (altı izole senaryo). Chrome ekran görüntüleri `/tmp/xinobi-surat-ui/`; Git'e eklenmedi. Gerçek sağlayıcı bağlantısı yok.
- `git diff --check`: PASS. Public API DTO değişmedi; web/Flutter kaynakları değiştirilmedi, bu koşuda test edilmedi.
- İlk sandbox MSBuild denemesi named-pipe erişiminde engellendi; yetkili çalıştırmayla tekrarlandı. Yeni testin xUnit2031 analiz hatası düzeltildi; ilk başarısız deneme başarı sayılmadı.

## Sonraki uçtan uca görev

Ön koşullar: izole sipariş/SQL veritabanı, test hesabı yalnız sunucu secret deposunda, worker başlangıçta kapalı, Windows/IIS üzerinde ön kontrol ve redaksiyon, sağlayıcı yazma izni ve kontrollü test gönderisi için ayrı operasyon izni. Koli/desi/kg ve borçlandırma gerçek sözleşmeden alınır. Canlı pilot ayrıca güvenilir tahsilat/operasyon verisi ve onaylı fiziksel etiket gerektirir.

1. Yetkili admin test siparişinden gönderir: referans ağdan önce kalıcı, Pazaryerimi=0 / EntegrasyonFirmasi boş, kabul yalnız registered; ticari sipariş ve ödeme değişmez.
2. Aynı isteği iki sekmeden ve iki API sürecinden gönderir: tek sağlayıcı POST, aynı referans. Süreç ağdan önce/sonra kesilir: kör tekrar yok; uzlaştırma gerekir.
3. İptal ile gönderimi iki sırada eş zamanlı başlatır (received/preparing): tek kazanan; iptal/pending önceyse provider çağrısı yok, rezervasyon önceyse iptal 409. Restart korumayı kaldırmaz.
4. Yetkisiz müşteri/read-only personel oluşturamaz; müşteri başka siparişi okuyamaz. Etiket doğru cari ve tam referansı taşır; yeniden indirme yeni gönderi oluşturmaz. Şablon ve gerçek okuyucu kabulü ayrı kanıtlanır.
5. Kabul öncesi boş / Sipariş bulunamadı: yeni gönderi yaratılmaz. Şube kabulünden sonra tüm koli/iade hareketleri gelir; eksik veya tekrarlanan belgede geçmiş kaybolmaz. Kod7 teslim değil; iade teslimi müşteri teslimi veya refund değildir.
6. 401/403, bağlantı/timeout, kısmi cevap: servis/uzlaştırma durumu görünür, önceki veri saklanır, yeni ref/otomatik POST yok. Sağlayıcı kayıt yokluğunu kanıtlarsa aynı referansla tek kontrollü attempt.
7. İzole SQL restart/çoklu süreç, IIS egress ve proxy/APM loglarında secret dışlama kanıtları kaydedilir. Mac erişimi sunucu erişimi sayılmaz.

Bu görev gerçek gönderi, canlı doğrulama veya fiziksel şube kabulü yapmış değildir. TIC-08 kısmen yapıldı; canlı entegrasyon tamamlanmadı.

## Nihai son kayıt

- Tam API: **572 PASS / 29 SKIP / 0 FAIL**, toplam 601. SQL/harici ortam atlamaları gerçek kabul sayılmadı.
- API Release: **0 uyarı / 0 hata**. Üretilen OpenAPI mevcut sözleşmeyle aynı; generated çıktı commit edilmedi.
- Admin TypeScript/build, lint (4 mevcut uyarı) ve altı Chrome senaryosu PASS.
- Nihai odaklı Sürat koşusu: **58 PASS / 0 SKIP / 0 FAIL** (son derleme üzerinden --no-build).
