# Sürat Kargo kurulum ve güncel kabul kaydı

## 04.11.2026 - Uçtan uca test sonucu

[Senaryo matrisi ve gerçek/izole ayrımı](../../test/2026-11-04/TST-249-surat-end-to-end.md): API 589 geçti / 29 atlandı / 0 başarısız; API Release, admin lint/build ve 8 tarayıcı fixture senaryosu, web derlemesi/2 takip testi ve bağımsız yazılımsal Code128 doğrulaması geçti. Hata sonrası formun gizlenmesi ve boş takip belgesinin başarı sayılması düzeltildi; güvenli FailureKind yalnız sunucu kaydında tutulur, ham hata istemciye gitmez. Onaylı test alıcı/paket kaydı ve yerel güvenli test hesabı yok; gerçek gönderi/takip zinciri çalıştırılamadı. Kimliksiz ana adresler 302 yanıtladı, takip isteği gönderilmedi. Canlı korumalar açık kaldı (Production oluşturma kapalı); IIS/SQL çoklu süreç ve fiziksel şube kabulü açık. Deploy/APK yapılmadı.

## 04.11.2026 - Güncel güvenilirlik durumu

[Doğrulama, açık matrisi ve uçtan uca görev](../../test/2026-11-04/TST-248-surat-hardening.md). Yeni admin gönderimi siparişin atomik ChangeOrder kilidinde kalıcı rezervasyon alır; iptal önceyse göndermez, rezervasyon önceyse iptal ve manuel sevk 409. Ticari status aynı kalır. Rezervasyon timeout/restart veya not_created teyidinde otomatik kaldırılmaz; eski denemelere geriye dönük eklenmez. Sağlayıcı kaydının silindiği/geri çekildiği varsayılmaz. Aynı parçanın tekrarlanan raw takip yanıtları kalıcı History arşivinde saklanır; müşteriye verilmez.

Nihai API 572 PASS / 29 SKIP / 0 FAIL; Release 0 uyarı/hata; admin TypeScript/build/lint ve altı Chrome senaryosu PASS. Gerçek sağlayıcı çağrısı yapılmadı. Geçmiş HTTP 200 erişim kanıtı Windows/IIS kabulü değildir. Modelde doğrulanmış ödeme/operasyon uygunluğu olmadığı için canlı oluşturma hâlâ kapalıdır. Gerçek SQL çoklu süreç, sandbox gönderi/şube kabulü ve fiziksel/onaylı etiket kapıları açık; aşağıdaki önceki teslimlerdeki yarış sınırı bu yeni rezervasyon kapsamıyla daraltılmıştır.

**Güncel durum:** Üçüncü teslimde admin/etiket/takip/uzlaştırma ve müşteri ekranları uygulanmıştır. Aşağıdaki ilk/ikinci teslim başlıkları gelişim geçmişidir; son bölüm geçerli kapsam ve canlı kapıları içerir. [Güncel test erişimi HTTP 200; önceki 403 tarihsel](ERISIM-KONTROLU-2026-11-03.md).

03.11.2026. `services/api/Shipping/SuratKargoClient.cs` ve Program.cs kaydı eklendi. Taşıma/sözleşme katmanına kalıcı gönderi/deneme kaydı ve yetkili admin API uçları eklendi. Admin ekranı, etiket ve otomatik takip henüz bağlı değildir. Manuel kargo davranışı değiştirilmedi. Hiçbir gerçek sağlayıcı çağrısı yapılmadı.

## Güvenli ayar yerleşimi

Mevcut sunucu ayar dosyasının `Shipping:Surat` bölümünü veya ortam değişkenlerini kullan. Gerçek dosya Git dışında kalır. Kullanıcı bilgilerini özgün yerel `kargo.rtf` dosyasından yetkili kurulum sırasında al; bu belgeye kopyalama.

| Anahtar | İlk kurulum |
| --- | --- |
| `Shipping__Surat__Enabled` | `false` (varsayılan) |
| `Shipping__Surat__Mode` | `Sandbox` |
| `Shipping__Surat__AllowProduction` | `false` (varsayılan) |
| `Shipping__Surat__Sandbox__Username` | Test hesabı; gizli ayar deposu |
| `Shipping__Surat__Sandbox__Password` | Test parolası; gizli ayar deposu |
| `Shipping__Surat__Production__Username` | Canlı hesap; gizli ayar deposu |
| `Shipping__Surat__Production__Password` | Canlı parola; gizli ayar deposu |

Canlı için hem Mode=Production hem AllowProduction=true gerekir. Bilinmeyen ortam, kapalı bağlantı ve eksik hesapta ağ isteği gönderilmez. Hostlar sabittir; kimlik bilgileri keyfi URL'ye yönlendirilemez. HTTP yönlendirmeleri kapalıdır. Başlangıçta otomatik bağlantı denemesi yoktur.

HttpClient logları kaldırıldı; uygulama ham istek/yanıt/parola/exception URL'sini loglamaz veya geri döndürmez. Takip sözleşmesi query içinde parola gerektirdiği için gerçek ortamdaki APM, proxy ve HTTP tracing redaksiyonu ayrıca doğrulanmadan gerçek sorgu açılmamalıdır. Bu katman sunucu içindir; istemciye doğrudan açılmaz.

## Desteklenen ilk sözleşme

- Kendi mağazamız: normal Koli, aynı ölçülü paketler, karayolu, adrese, COD kapalı. Ödeme sorumluluğu çağıran tarafından açıkça verilir; ürün ödeme şekliyle karıştırılmaz.
- Zorunlu alıcı, 50 karaktere kadar sabit referans, gerçek pozitif paket/desi/kg, enum ve telefon doğrulanır. Eksik değer sıfırla tamamlanmaz.
- POST `GonderiyiKargoyaGonder`: yalnız tam `Tamam` veya `Kayıt Edildi` yanıtı kayıtlıdır. HTTP hata/bağlantı kopması/timeout/diğer içerik uzlaştırma gerektirir. Write retry yoktur. Kayıtlı sonucu kargolandı veya teslim edildi anlamına gelmez.
- POST query takip: boş liste kabul bekliyor; servis/şema hatası erişilemiyor. Tüm belgeler, hareketler ve ham tarihler korunur; büyük kimlik string okunur. Kod 7 inceleme, kod 12 iade teslimidir. Normalize durumu tek başına sipariş güncellemez.
- Taşıma katmanındaki `Source` sağlayıcı belge/hareket verisidir ve kişisel veri içerebilir. Yeni public DTO olarak doğrudan yayımlanmaz; kalıcı depoda erişim/saklama politikası gerektirir.

## Sıradaki zorunlu adımlar

1. Kalıcı gönderi/paket/attempt modeli, migration ve transaction/idempotency kilidi; POST öncesi referans kalıcılaştırma. Demo siparişleri gerçek çıkıştan ayıran uygunluk kuralı.
2. Yetkili admin oluşturma ve uzlaştırma ekranı. Kayıt aşamasında mevcut `Ship` veya `order_shipped` bildirimi kullanılmaz.
3. Sağlayıcı onaylı Code128 etiket, tekrar indirme, fiziksel okuyucu testi.
4. Kalıcı takip işi, olay sırası/iade ayrımı, müşteri DTO ve web/Flutter gösterimi.
5. Kaynak plandaki sözleşme çelişkileri, egress IP/whitelist ve gerçek hesap yetkileri; ayrı izinli sandbox kabulü. Canlı pilot/deploy bu ilk kod tesliminde yok.

[Asıl task/alan eşleştirmesi](../../docs/tasks/surat-kargo-integration-plan-2026-11-03.md).

## İkinci kod teslimi: kalıcı kayıt ve admin API

- `GET /api/v1/admin/orders/{id}/surat-shipment` (orders.read): seçili ortam kaydı; kayıt yoksa boş yanıt. Sipariş varlığı ve erişim önce doğrulanır.
- `POST /api/v1/admin/orders/{id}/surat-shipment` (orders.write): `parcelCount`, `parcelDesi`, `parcelKg`, `paymentType` alır. Adres ve telefon sipariş anı adresinden gelir; istemci referans/adres gönderemez. Canlı mod doğrulanmış ödeme/operasyon uygunluğu olmadığından 409 ile kapalıdır.
- `shipping/surat-shipments.json`, ortak DocumentStore aracılığıyla Development'ta atomik dosya; SQL seçildiğinde mevcut `ops.FeatureDocuments` satırı ve transaction applock kullanır. Yeni tablo/migration gerekmez. Kayıt, ortam+sipariş tekilliği, hesap/istek fingerprint, sabit referans, attempt, personel kimliği, paket/adres kopyası ve zamanları içerir. Parola içermez.
- SQL çoklu API örneğini ortak transaction kilidiyle korur. Development dosya modu yalnız tek API sürecinde desteklenir. Ayrı süreçlerle aynı dosya alanı üzerinden gönderim çalıştırılmamalıdır. İzole gerçek SQL kabulü halen açık.
- Önce `submitting` kaydı kalıcılaşır, sonra ağ çağrısı yapılır. Aynı isteğin tekrarı kaydı döndürür; değişen hesap/paket/adres 409. Sonuç `registered` veya `reconciliation_required`. Kayıttan sonra kesinti yaşanırsa `submitting` korunur; otomatik tekrar yapılmaz. Manuel uzlaştırma arayüzü sonraki iştir.
- HTTP çağrısı sırasında SQL kilidi tutulmaz. Tamamlama yazılamazsa başlangıç kaydı kalır ve sonraki istek ikinci POST göndermez. Kalıcı gönderi kaydı sipariş statusunu değiştirmez; iptal/gönderim yarışının gerçek operasyon uygunluğu ve işlem sınırları canlı açılıştan önce ayrıca kapanmalıdır.
- TypeScript/Dart sözleşmeleri yeniden üretildi. Bu API müşteriye açık değildir; hassas kaydedilmiş adres veya ham provider cevabı operation DTO'suna konmaz.

Sıradaki işler: admin ekranı ve uzlaştırma; etiket; takip işi ve müşteri DTO; gerçek sandbox/SQL/barkod kabulü; canlı uygunluk ve iptal-gönderim eşzamanlılığı. Yukarıdaki ilk yol haritasının kalıcı kayıt ve API kısmı bu teslimle ilerledi; tüm kalemler tamamlandı sayılmaz.

## Üçüncü kod teslimi: sipariş ekranı, etiket, takip ve müşteri okuması

Bu bölüm önceki teslimlerin “sıradaki” maddelerini günceller; aşağıdaki alanlar artık uygulamada vardır:

- Admin > Entegrasyon izleme > Sürat Kargo: yalnız yapılandırma bayrakları. `GET /api/v1/admin/shipping/surat/status`, orders.read. “Hesap tanımlı” bağlantı testi değildir. Gizli bilgi gösterilmez/düzenlenmez.
- Admin sipariş detayı > Sürat Kargo: seçili ortam ve eksik ayar açıklaması, gerçek paket/desi/kg/ödeme sorumluluğu, kayıt sonucu, tekrar indirme ve takip sorgusu. Yazma yetkisi, uygun sipariş ve test hesabı gerekir. Test formunda varsayılan/uğraşılmadan doldurulmuş ölçü/fiyat yoktur.
- `GET .../surat-shipment/label`: kabulü kayıtlı **test** gönderisine bağlı, tekrar üretimi gönderi POST'u yapmayan SVG. 100x150 mm taslak, Code128-B referans, gönderici cari, okunur referans, alıcı ve paket bilgisi. XML kaçışı, Unicode kelime sarma, sığmayan adresi açık hata ile durdurma. TEST ibaresi ve “sevk için kullanılmaz”. %100 ölçekte tarayıcıdan yazdırılabilir; canlı etiket onayı verilmedi.
- `GET/POST .../surat-shipment/tracking`: kayıtlı veriyi okuma / kontrollü sağlayıcı sorgusu. POST orders.write, GET orders.read. HTTP erişilemiyorsa sonuç bunu açıkça söyler; önceki belge/parça/iade verisi ve onun veri zamanı korunur. Sonraki yanıtta eksik bırakılmış belge de kaybolmaz.
- `POST .../surat-shipment/reconcile`: zorunlu sağlayıcı kanıtı ve resolution (`registered` veya `not_created`, varsayılan `registered`). İlk 2 dakikadaki aktif gönderim çözülmez. `registered` etikete izin verir. Yalnız `not_created` kanıtından sonra aynı referansla kontrollü yeni deneme açılabilir; önceki attempt/istek/kanıt/personel bilgisi saklanır. Bu uç kendi başına taşıyıcıya yazmaz. Boş takip yokluk kanıtı değildir. Kayıtlı gönderi bu yolla yeniden gönderime açılamaz.
- Kalıcı takip lease'i 2 dakika; sorgular arasında yapılandırılmış bekleme, hata backoff/jitter ve eski lease sonucunu reddetme. Worker seçili hesaba ait en erken işleri 20'lik gruplarla alır. SQL ortak applock ile birden çok API örneğinde korunur; dosya modu yalnız tek Development API sürecidir.
- `Shipping__Surat__PollingEnabled=false` varsayılan. `PollIntervalSeconds=300`, `TerminalPollIntervalSeconds=86400` başlangıç ayarı; 30..86400 sınırı. Tüm bilinen belgeler 6/12 olduğunda seyrek takip, diğer durumlarda normal periyot; otomatik terminal kapama/silme yok. Bunlar sağlayıcının onaylı kotası iddiası değildir; etkinleştirmeden önce kota ve takip/saklama politikası teyit edilir. Worker başlangıçta istek yapmaz; ayarlar ayrıca geçerli ve Enabled=true olmalıdır.
- `GET /api/v1/me/orders/{id}/surat-tracking`: müşteri kendi siparişini okuyabilir; başka sipariş 404. Yalnız Production kayıtları müşteri DTO'suna gider. Parola, gönderici hesap, ham Source, teslim alan kişi veya tam adres paylaşılmaz. Sandbox müşteriden gizlenir. Web ve Flutter sipariş detayına yüklenme/boş/hata/önceki veri/yenileme görünümü eklendi.
- Siparişin ticari lifecycle'ı taşıyıcı kayıt kabulünde değiştirilmez. Sağlayıcının ayrı fiziksel durumu takip alanında gösterilir; kod 7 teslim sayılmaz, kod 12 iade teslimidir. Saat dilimi teyitsiz ham hareket zamanı UTC sanılmaz; bu sürüm otomatik shipped/delivered/refund veya tekrar bildirim üretmez.

### Canlı kabul için kalan kapılar

1. [.NET test takip erişimi HTTP 200](ERISIM-KONTROLU-2026-11-03.md) doğrulandı; önceki 403 genel blokaj sayılmaz. Asıl IIS sunucusunda erişim/egress doğrulaması ve gerçek sandbox gönderi/şube kabul/hareket/mutabakat kabulü hâlâ açık.
2. Sürat'in onaylı canlı etiket şablonu, cari barkodu/çoklu koli düzeni ve fiziksel yazıcı/okuyucu testi. Mevcut taslak canlıya açılmaz.
3. İzole gerçek SQL çoklu süreç/yeniden başlatma kabulü; kaynak koddaki shared applock tasarımı tek başına gerçek SQL kabulü değildir.
4. Doğrulanmış ödeme/operasyon uygunluğu ve iptal-gönderim transaction sınırı (D03). Bu veri olmadan demo sipariş Production gönderisi oluşturamaz; bu sürümde Production oluşturma bilinçli olarak kapalıdır. Manuel “ödenmiş say” bayrağı eklenmedi.
5. Sağlayıcı sözleşmesindeki kod7/COD/Dosya-Mi/büyük-küçük harf farkları, kanal borçlandırma ve kota/saat dilimi teyitleri. İlk uygulama yalnız kendi mağaza/normal koli/COD kapalı; pazaryeri, COD ve iade oluşturma bu kabul gelmeden açılmaz. Kargo tarife/checkout ücret hesabı ZIP'te yoktur ve TIC-08'de ayrı açık kalır.
6. Gerçek Android/iOS ve VoiceOver/TalkBack kabulü; widget testi fiziksel cihaz kabulü değildir. Deployment/APK yapılmadı.

**Durum:** Kendi mağaza test akışı için kod ve arayüzler uygulanmıştır; gerçek sandbox gönderi kabulü ve canlı entegrasyon tamamlandı sayılmaz. Sunucu erişimi ve bu kapılar kapanmadan canlı anahtar/flag etkinleştirilmemelidir.

## Ön kontrol ve boş kayıt sözleşmesi

`--surat-preflight` komutu API/SQL/worker başlatmadan çalışır. [Sunucu yönergesi](ON-KONTROL.md). Test metodundan gelen HTTP 200 / IsError=true / tam `Sipariş bulunamadı.` / boş Gonderiler yanıtı AwaitingAcceptance olur; diğer IsError yanıtları veya kısmi belge sonuçları servis hatası olarak kalır. Bu yanıt otomatik yeni gönderim, kayıt yokluğu kanıtı ya da canlı kabul değildir.

## 05.11.2026 — Sürat Swagger uyumu

Güncel prova şemasında Iademi boolean, BirimDesi/BirimKg string; outbound JSON bu türlere düzeltildi. Kalıcı/public model korunur. 75 izole Sürat testi geçti; eski belirsiz deneme yeniden gönderilmedi. Eski create yanıtı saklanmadığı için kesin neden yok; Sürat kayıt teyidi, güvenli create teşhis kaydı ve gerçek kabul açık. Ayrıntı: `test/2026-11-05/TST-250-surat-live-schema.md`. Deploy yok.


05.11.2026 — TST-251: Gönderim sonucu için güvenli HTTP durum/kategori kaydı ve attempt geçmişi eklendi; public DTO/otomatik retry davranışı korunur. Eski belirsiz kayıtlara geriye dönük teşhis üretilemez. Ayrıntı: `test/2026-11-05/TST-251-surat-create-diagnostics.md`. Gerçek gönderim/deploy yok.
