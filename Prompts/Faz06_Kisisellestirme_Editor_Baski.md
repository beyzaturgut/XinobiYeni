# Faz06 — Kişiselleştirme, gelişmiş editör ve baskı dosyası

**Durum:** Uygulanmayı bekliyor. **Kaynak:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §3.1, §4, §5, §6.3–6.5, §8 ve `Xinobi_Proje_Kapsami(4).md` kişiselleştirme/editör maddeleri. **Yürütme ve karar kaydı:** `Faz00_Proje_Takip_ve_Kesintiden_Devam.md`. Onay kutuları gerçek onay verilince işaretlenir.

## 1. Amaç, bağımlılık, karar kapısı

Seçili ürün ve varyantta basit yazı/isim/logo/görsel kişiselleştirmesi ile metin, görsel, şekil katmanları olan gelişmiş editörü; ön/arka çoklu baskı alanını; kayıtlı tasarım sürümünü; sunucuda doğrulanan baskı çıktısını; sepet/sipariş bağı ve panel indirmesini teslim et. Faz04 ürün/varyant/medya ve Faz05 sepet, fiyat hesaplama, sipariş/satır anlık görüntüsü gerekir. Faz02 Creative/UIUX tasarımı ve Faz03 güvenli dosya/kimlik altyapısı gerekir. D04 fiziksel ölçü, baskı yöntemi, güvenli boşluk, çıktı formatı, DPI eşiği, font lisansı, üretim onayı ve varyanta özel alan farkı ürün/üretim sahibinden **fiziksel örnekle** doğrulanmadan üretime hazır baskı dosyası kabul edilmez; bu arada editör sözleşmesi, önizleme ve test alanı geliştirilebilir. D03 fiyat/sipariş kesinleşme ve D08 AI çıktısının aktarım biçimi Faz00 karar defterine bağlanır. AI üretiminin kendisi sonraki fazın işidir.

## 2. Creative → UI/UX → Frontend teslim zinciri

Sr. Creative Designer ürün üstü gerçekçi görsel önizleme biçimini, ön/arka yüz ayrımını, alan sınırını, katman panelini, araç çubuğunu, şablon küçük resimlerini, kalite ve taşma uyarılarını, masaüstü/tablet/telefon düzenlerini ve renge göre gerçek ürün fotoğrafı kullanımını tasarlar. UI/UX işlevi Creative Designer ve Sr. Frontend tarafından ortak yürütülür: basit akış/gelişmiş akış geçişi, dokunma/sürükleme, klavye kullanımı, erişilebilir alternatif komutlar, kaydetme başarısızlığı, tekrar açma ve siparişe bağlama prototipi. FE'ye ölçü/token, bileşen durumları, hareket ve test örnekleriyle teslim edilir; PM tasarımı ve üretim kuralları uyumunu onaylar. Aynı görsel belgedeki önizleme ve sunucu çıktısı geometrik olarak karşılaştırılır; estetik mockup baskı doğruluğu kanıtı sayılmaz.

## 3. İş ve dönüşüm kuralları

1. Ürün/varyant yalnız `personalizationEnabled=true` ve en az bir etkin `PrintArea` ise editörü açar. Varyant değişirse mevcut tasarım otomatik olarak başka alana taşınmaz: alan eşleşmesi doğrulanır, kullanıcıya uyarı gösterilir; uyumsuz tasarım sepete gidemez.
2. `PrintArea` fiziksel genişlik/yükseklik, güvenli marj, yüz (`front/back`), koordinat başlangıcı, izinli katman/dosya türü ve gerekirse seçili varyant kimliği içerir. Tuval normalize koordinatla veya mm cinsinden tutulur; tercih Faz00 teknik kararında tekleştirilir. Önizleme ve baskı motoru aynı dönüşüm ve font metriklerini uygular. Ölçek/rotasyonla taşan katman, yalnız merkezi nokta içeride diye geçerli sayılmaz; dönüştürülmüş sınır kutusu ölçülür.
3. Basit akışta metin/isim, font, boyut, renk, logo/görsel yükleme, taşıma, ölçekleme, döndürme, alan/yüz seçme, canlı önizleme ve not. Gelişmiş editörde metin/görsel/şekil katmanı, sıralama, kilit/gizle, hizalama, kopyala/sil, sürükle-bırak, geri/ileri al, kategorili şablon ve tasarım geçmişi bulunur. Yüklemenin ve AI görsel aktarmanın durumu `bekliyor/başarısız/yeniden dene/hazır` görünür; başarısız medyaya baskı referansı yazılmaz.
4. Kalite kontrolü orijinal piksel çözünürlüğünü fiziksel baskı ölçüsüne karşı hesaplar; tarayıcı uyarısı kullanıcıya anlaşılır bilgi verir, sunucu kritik kuralı tekrar uygular. D04'ün ürüne özel eşikleri ve operatör istisna/onay politikası ayrı konfigürasyonda tutulur. Ön/arka alanların baskı operatörü tarafından ayrı çıktısı alınır.
5. Tasarım `Design → DesignVersion → DesignLayer` olarak sürümlenir. Kaydetme yeni değişmez sürüm üretir, eşzamanlı eski sürüm kaydı 409 ile çatışma gösterir. Undo/redo açık editör oturumunda işlemleri geri sarar; kalıcı geçmiş sürümler ayrı saklanır. Sipariş satırı `designVersionId`, varyant ve fiyat farkının değişmez anlık görüntüsünü taşır; sonradan tasarım düzenleme eski siparişi ve baskı dosyasını değiştirmez.
6. Sepete eklemeden önce backend ürün/varyant/alan, medya sahipliği, sınır, DPI, font lisansı ve güncel fiyat farkını doğrular. Sepet anlık görüntüsünün süresi/yeniden doğrulaması Faz05 sözleşmesindedir. Checkout aynı sürümü yeniden doğrular ve sipariş satırına sabitler. Çıktı işlemi beklerken operatör “hazır” görmez; çıktı üretilmezse denetlenebilir hata ve güvenli yeniden deneme vardır. Dosya yalnız ilgili operatör yetkisiyle indirilebilir.
7. AI'dan üretilmiş görsel gelecek fazda `Asset` olarak alınır ve ayrı görsel katmana konur; katmanlı içerik vaat edilmez. İçerik/medya lisansı, kabul edilen dosya formatları ve notun baskı dosyasına işlenip işlenmeyeceği D04 ürün kararıdır.

## 4. Somut geliştirme iş listesi

### Veri, API ve çıktı

- DB Admin: `PrintArea(productId,variantId?,face,widthMm,heightMm,safeMarginMm,version,enabled)`, `Template(category,assetId,status)`, `Design(ownerId,productId,variantId,status)`, `DesignVersion(designId,version,printAreaVersion,document,notes,createdAt)`, `DesignLayer` veya sürüm içi belgede katmanlar, `GeneratedAsset` referansı, `PrintOutput(designVersionId,face,format,status,assetId,checksum,error)`, sipariş satırı bağını migration ile oluşturur. Var olan Faz04 `Asset` ve Faz05 `OrderLine` tablolarıyla anahtar/kısıt kurar. D04 basım standardını versiyonlu saklar; siparişte alan kuralı anlık görüntüsünü korur. Büyük belge/çıktı nesne deposunda, DB'de adres ve bütünlük hash'i bulunur.
- Backend sözleşmesi örneği: `GET /catalog/variants/{id}/print-areas`, `GET /design/templates?productId=&category=`, `POST /designs` (ürün/varyant/alan kimliği), `PUT /designs/{id}/versions` (`baseVersion`, belge), `GET /designs/{id}/versions/{version}`, `POST /designs/{id}/validate`, `POST /designs/{id}/versions/{version}/render`, `GET /designs/{id}/history`, `GET /admin/orders/{orderId}/lines/{lineId}/print-outputs` ve yetkili kısa ömürlü indirme URL'si. Dosya yükleme Faz03 güvenli medya API'sini kullanır. Metot/yol sürümü Faz00 ortak sözleşmesine göre sabitlenir.
- Belge sözleşmesi: `{schemaVersion,productId,variantId,printAreas:[{printAreaId,printAreaVersion,face,layers:[{id,type,assetId?,text?,fontId?,fill?,x,y,width,height,rotation,zIndex,visible,locked}]}],notes}`; şema/koordinat birimi, izinli alanlar, kaynak medya boyutu, font ve minimum çözünürlük birlikte sürümlenir. İstemci tarayıcı canvas piksel koordinatını kalıcı kaynak yapmaz. `DesignVersion` yanıtı `{id,revision,validation:{errors,warnings},personalizationPrice}` içerir. Sunucu geçersiz şema/alan için 422, başka kullanıcı tasarımı için 403/404, eski sürüm için 409 ve çıktı henüz hazır değilse açık iş durumu döner.
- Render worker çıktıyı gerçek fiziksel alana, baskı profiline ve D04 formatına göre üretir; aynı `designVersionId + areaVersion + outputProfileVersion` işi için tekrar istekleri aynı kayıtla eşler. `queued/running/ready/failed` durumu, hata ve tekrar sayısı panelde izlenir. Siparişte referanslanan sürüm asla üstüne yazılmaz; render testi fiziksel ölçü/DPI/font/görsel konumu karşılaştırmasını içerir.
- Dosyaların sahiplik, MIME/gerçek içerik, boyut, piksel, kötü amaçlı içerik ve erişim süresi doğrulanır; SVG/uzak URL/font kullanımı güvenli listeye tabidir. Sipariş dosyası halka açık URL olmaz. Şablon ve fontun kullanım lisansı Creative/ürün ekibiyle kaydedilir.

### Frontend ve panel

- Ürün detayındaki “kişiselleştir” eylemi seçili **aynı** `variantId` ve doğru ürün görseliyle basit akışı açar. Şablon seçimi/yeni tasarım, ön/arka yüz ve alanlar, metin/logo/görsel, font/boyut/renk, taşı/çevir/ölçekle, kaydet/yeniden aç, not ve fiyat farkı. Gelişmiş araçlarda katman listesi ve sürükleme yanında klavye ile değer girme/hizalama/kilit/görünürlük/sıra ve geri/ileri al.
- Taşma ve kalite uyarıları alan üzerinde ve katman listesinde gösterilir; yoğun editörde yükleme/kaydetme göstergesi ve yeniden deneme vardır. Kullanıcı sayfadan ayrılırken kaydedilmemiş değişiklik uyarısı alır. Mobil dar ekranda araçlar kullanılabilir kalır; Faz mobil uygulama aynı API ve tasarım belgesi davranışını korur, yalnız web editörü için ayrı gerçeklik oluşturulmaz.
- Sepete tasarım sürüm kimliği, varyant, yüz/alan ve fiyat farkı bağlanır; satır özetinde küçük önizleme ve not gösterilir. Düzenleme varsa yeni sürüm oluşturulur ve ancak kullanıcı sepet satırını güncellerse yeni sürüme geçilir. Sipariş tamamlandığında müşteri kayıtlı önizleme ve sürümü; operatör panelde çıktı durumu, alan, sürüm, kalite uyarısı ve izinli indirme bağlantısını görür. İş kuralı onayı gerektiren tasarım “baskıya hazır” diye işaretlenmez.
- Panelde ürün/varyant baskı alanı ve kuralları, şablon/kategori, tasarım listesi, sürüm görüntüleme, çıktı indirme, yeniden oluşturma ve hata izi yer alır. Alan değişikliği eski sipariş sürümlerinin üretilebilirliğini bozmaz.

### Önerilen repo yerleşimi

`apps/web/src/features/{personalization,editor}`, `apps/admin/src/features/{print-areas,templates,designs}`, `packages/design-document/{schema,geometry}`, `packages/contracts/design.openapi.yaml`, `services/api/modules/{design,print}`, `services/worker/jobs/render-print`, `design/screens/Faz06/`. Yollar öneridir; Faz00 repo kararına göre kesinleştirilir. UI ile çıktı motorunun ortak şema/koordinat test vektörleri sürümlü dosyada tutulur.

## 5. Hata, test ve kabul senaryoları

| Senaryo | Ölçülebilir beklenen sonuç |
|---|---|
| Ön/arka alan, döndürülmüş kenar katmanı | Ekran ve baskı çıktı alanı aynı koordinatı verir; döndürme sonrası gerçek sınır taşma olarak işaretlenir; fiziksel ölçü örneğiyle karşılaştırılır. |
| Yüklenen düşük çözünürlüklü logo | Fiziksel basım boyutunda sunucu ve UI aynı D04 kalite sonucunu verir; politika engelliyorsa checkout başarısız, izinli istisnaysa operatör kararı kayıtlıdır. |
| Gri varyanttan mavi varyanta geçiş | Görsel ve baskı alanı mavi varyanta göre tekrar yüklenir; uyumsuz gri tasarım satıra sessizce taşınmaz. |
| Ağ kesintisiyle çift kaydetme veya iki sekme | Tek sürümün tekrar gönderimi mükerrer sürüm yapmaz; eski temel sürüm 409 ve çözüm ekranı gösterir. |
| Kaydet, kapat, yeniden aç, undo/redo | Katman sırası/konum/font/ön-arka/not ve kaydedilmiş sürüm korunur; undo/redo oturum işlemlerini doğru tersler. |
| Sepet sonrası tasarımı değiştir | Sipariş/sepette bağlanan eski sürüm kendiliğinden güncellenmez; yeni sürüm açık eylemle bağlanır. |
| Baskı işleyicisi hata/zaman aşımı | Sipariş kaydı kaybolmaz; çıktı başarısız görünür, güvenli yeniden deneme aynı sürüm için izlenir, indirilemeyen dosya “hazır” gösterilmez. |
| Başka müşteri veya yetkisiz personel dosyayı ister | API 403/404 verir; kısa süreli indirme adresi yetki sonrası üretilir, denetim izi tutulur. |
| Geçmiş siparişin baskı alanı sonra değişir | Eski siparişin çıktı alanı o siparişte kayıtlı kural sürümünden yeniden üretilebilir; yeni alan yalnız yeni tasarımlara uygulanır. |

**Kabul kapısı:** Xinobi ürün/üretim yetkilisi D04 baskı örneği ve eşikleriyle gerçek baskı dosyası önizleme uyumunu onaylar; basit ve gelişmiş akış, ön/arka/çok alanlı tasarım, sürüm, sepet/checkout/sipariş ve panel indirme uçtan uca gösterilir. Webde ve mobil API sözleşme testlerinde aynı tasarım sürümü kullanılır; mobil uygulama gerçek cihaz kabulü kendi fazında ayrıca kapanır. Kritik taşma/çözünürlük/güvenlik hatası açıksa faz kapatılmaz.

**Teslim kanıtı:** Creative tasarım dosyası/prototip ve FE teslim notu; D04 fiziksel ölçü/çıktı profili kararı; migration/OpenAPI/JSON şema; geometri ve render karşılaştırma vektörleri; ekran ve panel kaydı; örnek sipariş satırı/sürüm/çıktı hash'i; erişim, eşzamanlılık, hatadan dönüş test raporu; Faz00 commit/karar/sonraki adım girdisi.

## 6. Yedi rol inceleme ve PM nihai onayı

Her imza Faz00 içinde tarih, gerçek kişi, kanıt bağlantısı, açık bulgu ve çözümle kaydedilir. Şimdiki kutular **beklemede**.

- [ ] İş Analisti — kişiselleştirme iş kuralı, D04 sahibi ve uçtan uca kullanıcı senaryosunu onayladı.
- [ ] Sr. Creative Designer — ürün görselleştirme, baskı alanı sunumu, şablon/font lisansı ve UI/UX teslimini onayladı.
- [ ] Sr. Frontend Developer — tasarım uygunluğu, etkileşim, erişilebilirlik, sürüm ve hata durumunu onayladı.
- [ ] Sr. Backend Developer — şema, sahiplik, render tekrar güvenliği, doğrulama ve sipariş bağını onayladı.
- [ ] DB Admin — sürüm bütünlüğü, alan anlık görüntüsü, varlık/çıktı referansı ve migration'ı onayladı.
- [ ] Sr. Full Stack Developer — web/panel/API/sepet/çıktı uçtan uca akışı ve mobil sözleşme uyumunu onayladı.
- [ ] Proje Yöneticisi — **zorunlu nihai onay**; altı inceleme, D04 üretim kararı, gerçek baskı örneği ve kabul kanıtlarını Faz00'a işleyerek fazı kapattı.
