# Faz04 — Ürün kataloğu, içerik ve yayın

**30.10 admin görsel/durum uygulaması:** 16 modül ortak tablo, kontrol, hata/başarı ve pencere odağı dilinde denetlendi; başarısız yazmada taslak, içerik/yüzey yetkileri, eksik sayaç ve yüklenme ayrımları düzeltildi. [Modül/bulgu/açık iş matrisi](../design/admin-consistency-audit-2026-10-30.md), [TST-188](../test/2026-10-30/TST-188-admin-consistency.md). Gerçek SQL/operasyon/sağlayıcı/handoff kabulü açık; faz onayı verilmedi.

**30.10 web görsel/durum uygulaması:** 33 rota dört genişlikte normal/%200 metinle denetlendi; bağımsız hesap veri durumları, yeniden deneme/taslak koruma, yorum modal odağı, katalog/checkout/iade hata kapıları ve dar ekran reflow düzeltildi. [Ekran/kusur/açık iş matrisi](../design/web-consistency-audit-2026-10-30.md), [test raporu](../test/2026-10-30/TST-179-web-consistency.md). Yalnız web; müşteri verileri, gerçek sağlayıcı/cihaz/baskı ve resmi handoff kabulü açık. Faz onayı/yüzde değiştirilmedi.

## Güncel durum ve tüm açık işler - 30.10.2026

**Durum:** Devam - katalog teknik kabulü var; veri ve ticari altyapı eksikleri açık. Kaynak kesiti `main / de99958`; [120 task ana listesi](../docs/tasks/project-closure-2026-10-30.md), [30.10 faz denetimi](../docs/tasks/phase-audit-2026-10-30.md). Bu bölüm günceldir; aşağıdaki 27/20/16 Ekim kesitleri tarihsel tutulur. Oran veya rol/PM onayı eklenmedi.

**Yapılan son işler:** 358d42d: WEB-01 yerel teknik kabul, 24 ürün/8 kategori ve üç boyut. c1ba427: WEB-02 237 renk/boyut kontrolü, 110/110 medya ve 30/30 önizleme yanıtı; yerel üç dosya kurtarıldı. 35a4326/799e1af: kategori penceresi ve tam genişlik katalog promptu. Bunlar canlı ticari veri tamlığı değil.

**Müşteriden / iş sahibinden beklenenler:** 23 ürün için onaylı açıklama/teknik özellik dosyası ve SKU 117 fiyatı; ana veri/kanal fiyatı ve desen lisans/kapsam kararı. Kullanıcının içerik dosyası gelene kadar açık bırakma talebi korunur.

### Teknik ekipte ve kabulde kalan ana görevler

Aşağıdaki tablo bu fazın ana sorumluluğundaki tüm kapanış tasklarını içerir; tamamlanan teknik kapsamlar da kaybolmaması için listede korunur. Hedef iş, mevcut temel, kapanış kanıtı, bağımlılık ve önerilen sorumlu task bağlantısındadır.

| Task / konu | Durum | Yapılmadı / kapanış için kalan |
|---|---|---|
| [WEB-01](../docs/tasks/project-closure-2026-10-30.md#web-01) - Katalog gezinmesini gerçek veriyle kabul et | Yapıldı - teknik | Bu taskın yerel teknik kontrolü kapalı. CAT-01 veri tamlığı, canlı kurulum ve resmi iş sahibi UAT bu sonuçla kapanmaz. |
| [WEB-02](../docs/tasks/project-closure-2026-10-30.md#web-02) - Ürün detayını satışa hazır doğrula | Kısmen yapıldı | 23 ürünün açıklama/teknik özellik dosyası bekleniyor. SKU 117 fiyatı eksik; alım kapalı. Kullanıcı içerik kısmını dosya gelene kadar açık bıraktı. |
| [WEB-06](../docs/tasks/project-closure-2026-10-30.md#web-06) - CMS, destek ve iletişim deneyimini tamamla | Yapılmadı - kapanış açık | Tam CMS destekli SSS/blog/iletişim, mesaj teslimi/spam sınırı ve yayın-taslak indeksleme akışı tamamlanmadı. |
| [WEB-08](../docs/tasks/project-closure-2026-10-30.md#web-08) - SEO ve ölçüm kurulumunu tamamla | Yapılmadı - kapanış açık | Gerçek ürün sitemap/URL/canonical-breadcrumb, eski URL 301 haritası ve izinli analitik satın alma tekilliği yayın alan adında kabul edilmedi. |
| [ADM-02](../docs/tasks/project-closure-2026-10-30.md#adm-02) - Sistem ayarlarını kalıcı ve sürümlü yap | Yapılmadı - kapanış açık | Sürümlü kalıcı ayar API/deposu, eşzamanlı kayıt kontrolü ve onaylı ayar alanları tamamlanmadı. |
| [ADM-03](../docs/tasks/project-closure-2026-10-30.md#adm-03) - Dashboard metriklerini gerçek kaynaklara bağla | Yapılmadı - kapanış açık | Ciro/net iade/tahsilat, stok ve dönüşüm tanımları ile gerçek kaynak ve finans mutabakatı açık. |
| [CAT-01](../docs/tasks/project-closure-2026-10-30.md#cat-01) - Gerçek katalog veri kalitesini kapat | Kısmen yapıldı | 23 ürünün onaylı açıklama/teknik özellikleri ve SKU 117 fiyatı bekleniyor; tüm ticari veri kalite kapısı açık. |
| [CAT-02](../docs/tasks/project-closure-2026-10-30.md#cat-02) - Depo ve stok hareket defterini kur | Yapılmadı - kapanış açık | Depo bazlı hareket defteri, giriş/çıkış/sayım/düzeltme, rezervasyon ve negatif stok uzlaştırması eksik. |
| [CAT-03](../docs/tasks/project-closure-2026-10-30.md#cat-03) - Kalıcı kampanya ve kupon motorunu kur | Yapılmadı - kapanış açık | Kalıcı kupon/kampanya motoru, limit yarışı, kanal/varyant koşulları ve checkout/iade hesabı eksik. |
| [CAT-04](../docs/tasks/project-closure-2026-10-30.md#cat-04) - Marka, doküman ve kanal fiyatını tamamla | Yapılmadı - kapanış açık | Marka, teknik doküman/kılavuz yaşam döngüsü ve kanal fiyatı sözleşmesi tamamlanmadı. |
| [CAT-05](../docs/tasks/project-closure-2026-10-30.md#cat-05) - CMS yayınlama ve içerik yönetimini kur | Yapılmadı - kapanış açık | Tam sayfa/blog/SSS/iletişim CMS, taslak-yayın, slug, geçmiş ve güvenli içerik kabulü eksik. |
| [CAT-06](../docs/tasks/project-closure-2026-10-30.md#cat-06) - Medya kütüphanesini ve dosya yaşam döngüsünü kur | Yapılmadı - kapanış açık | Aranabilir medya kütüphanesi, kullanım ilişkisi/alt metin, genel finalize/temizleme ve güvenli silme kapsamı açık. |
| [CAT-07](../docs/tasks/project-closure-2026-10-30.md#cat-07) - İlk katalog aktarımı ve değişiklik geçmişini tamamla | Yapılmadı - kapanış açık | İşletim için CSV önizleme/satır hatası/dry-run/geri alma ve tam katalog değişim geçmişi eksik. |
| [CAT-08](../docs/tasks/project-closure-2026-10-30.md#cat-08) - Desenler ve ürün keşif modelini uygula | Yapılmadı - kapanış açık | Desen lisans/satın alma kararı D13, tam ürün slug/301 haritası ve desenler kapsam kabulü açık. |

### Açık alt işler ve özel kabul kayıtları

| Alt iş | Ana task | Durum | Kalan / kanıt |
|---|---|---|---|
| WEB-02-DATA-01 | WEB-02, CAT-01 | Müşteri dosyası bekliyor | 23 ürünün açıklama/teknik özellikleri; dosya geldiğinde onaylı kaynaktan doldur ve tekrar doğrula. |
| WEB-02-DATA-02 | WEB-02, CAT-01 | Onaylı fiyat bekliyor | Elektrikli Çay Makinesi 116120 / Metalik Lacivert / SKU 117; fiyat gelene kadar sepete ekleme kapalı. |

**Çapraz bağımlılıklar (tekrar sayılmaz):** [WEB-07](../docs/tasks/project-closure-2026-10-30.md#web-07), [ADM-01](../docs/tasks/project-closure-2026-10-30.md#adm-01), [ADM-08](../docs/tasks/project-closure-2026-10-30.md#adm-08), [KIS-02](../docs/tasks/project-closure-2026-10-30.md#kis-02), [TIC-02](../docs/tasks/project-closure-2026-10-30.md#tic-02), [TIC-03](../docs/tasks/project-closure-2026-10-30.md#tic-03).

**Kapanış kuralı:** Teknik ekip geliştirme/test kanıtını, müşteri/operasyon gerekli girdiyi sağlar; gerçek SQL, sağlayıcı, fiziksel cihaz, üretim numunesi ve resmi UAT ayrı kapılardır. Bu belge güncellemesinde uygulama testi tekrar koşulmadı. [Doküman doğrulaması TST-175](../test/2026-10-30/TST-175-phase-closure-sync.md).

---


## Tarihsel uygulama durumu — 27.10.2026

**Durum:** Devam — katalog iyileştirildi, ticari altyapı eksikleri açık. Kaynak kesiti: `main` / `5791181`; [27.10.2026 faz denetimi](../docs/tasks/phase-audit-2026-10-27.md). Bu kayıt 27.10 kesitidir; güncel 30.10 durumu yukarıdadır. 16/20 Ekim tarihli durum, oran, sonraki adım ve dağıtım ifadeleri tarihsel karşılaştırma için korunmuştur. Yüzdeler yeniden hesaplanmadı; eski yüzdeler güncel ilerleme ölçümü değildir. Rol ve PM kabulü verilmedi.

| İş / kapsam | Güncel durum | Uygulama ve sınır |
|---|---|---|
| Katalog medya / maske araçları | Uygulandı | 9925f10 katalog rengi/HEX kullanımı; 561b90b kod tabanlı renklendirme, temiz kenar ve kayıpsız WebP promptu; 0ec407d/1c40a4a HTTP sitede prompt kopyalama ve kaynak fotoğraf indirme. 9e69a74/cdd8ed3 maskeleme panelini production derlemede açar; her canlı renk için kabul kanıtı değildir. |
| Katalog keşfi / kişiselleştirme | Uygulandı | 2f05625 yalnız panelde kişiselleştirilebilir işaretli ürünler; 50c6080 yönetilebilir gerçek kategoriye bağlı titanyum keşfi (kategori seçimi veri işidir); abdc87a/c9b1e28 filtre/karşılaştırma ve statik export geçişleri. |
| Web stok kaydı | Kısmi | aa6069f web stok değişimini inventory.write ile sınırlar ve ürünün tamamını yeniden yazmaz. Depo bazlı stok hareketi, rezervasyon veya Mikro senkronu eklenmedi. |
| Yerel medya / rapor sınırları | Kısmi | 503de15 yalnız eksik yerel medyayı üzerine yazmadan kurtarır; c49e706 sunucuda bulunan medyanın paketlemeyi durdurmasını önler. Bunlar canlı medya tamlığı kanıtı değildir. SQL sipariş/müşteri özetleri mevcut; ödeme/net ciro ve ziyaret/dönüşüm verisi hâlâ koşulludur. |
| Kalan kapsam | Açık / bloke | Kampanya/kupon, CMS/blog/SSS/iletişim, marka/doküman, medya kütüphanesi, CSV/301, ürün sitemap ve analitik; D02/D03/D13 sınırları değişmedi. |

**Doğrulama:** Tarihli test raporları ve çalıştırıldığı commit/ortam denetim dosyasında listelenmiştir. Bu dokümantasyon oturumunda uygulama testleri yeniden çalıştırılmadı.

---


**Durum (20.10.2026):** Devam · geliştirme ~52 %; ayrıntı "Uygulama durumu — 16.10.2026" bölümünde, faz kabulü yok. **İlk plan durumu:** Uygulanmayı bekliyor. **Kaynak:** `Xinobi_Kavramsal_ve_Teknik_Analiz.md` §2, §3.1, §4, §5, §6.2–6.3, §8 ve `Xinobi_Proje_Kapsami(4).md`. **Yürütme kaydı:** `Faz00_Proje_Takip_ve_Kesintiden_Devam.md`. Bu dokümandaki onay kutuları, gerçek kişilerin henüz vermediği onayı temsil etmez.

## 1. Amaç, bağımlılık, sınır

Web ve mobilin ortak kullanacağı yayınlanmış ürün/kategori/marka/varyant, gerçek ürün medya ve dokümanları, satış kanalı fiyatı, depo bazlı stok görüntüsü, kampanya/kupon hesaplaması ve kurumsal içerik/SEO verisini panelden yönetilebilir kıl. **Ön koşul:** Faz00 mimari ve D02 ana kayıt kararı, Faz01 erişim/rol/ortam, Faz02 tasarım teslimi, Faz03 kimlik ve temel veri/API sözleşmeleri tamam. Kaynak sistem henüz netleşmediyse ekran ve API şeması geliştirilebilir; üretimde iki taraflı stok/fiyat yazma açılmaz. Stok tüketimi, checkout ve ödeme Faz05; baskı/editör Faz06; pazaryeri ve Mikro gerçek senkronizasyonu sonraki fazlar. Bu fazda kanal fiyatı ve dış eşleme verisinin modeli/arayüzü hazırlanır, dış servis başarı iddiası kurulmaz.

## 2. Creative → UI/UX → Frontend teslim zinciri

Sr. Creative Designer marka yönü, renk/tipografi/ikon, gerçek ürün fotoğrafı kullanım kuralları, kategori/ürün detay, varyant paleti, kampanya ve CMS bileşenleri için masaüstü/tablet/mobil yüksek doğruluklu tasarım ve durum varyantlarını üretir. UI/UX işlevi Creative Designer ile Sr. Frontend tarafından birlikte yürütülür: bilgi mimarisi, ürün bulma, varyant ve stok uyarısı, odak sırası, form ve boş/hata/yükleniyor durumlarını tıklanabilir prototip ve ekran akışına dönüştürür. Frontend tesliminde ekranlar, ölçüler, breakpoint/tokens, klavye/kontrast gereksinimi, varlık lisansları, ürün fotoğrafı varyant eşlemesi ve kabul senaryoları bulunur. FE, teslimi bileşenlere eşler; değişiklik Creative/UIUX onayına geri döner. PM, tasarım seçimi ve teslim paketi onayını kaydeder.

Web Designer, Analiz2 K-01–K-11 ana sayfa sırası ve etkileşimini Faz02'de onaylanan tasarımdan uygulatılabilir CMS blok sözleşmesine dönüştürür. Her ürün varyantı için yetkili fotoğraf seti, odak noktası/crop, masaüstü-mobil türevleri, alt metin ve lisans kaydı bulunur. Slider görsel/video/karma içeriği, poster, mobil medya, yayın sırası/zamanı ve erişilebilir kontrol metadata'sı taşır; “sınırsız slider” yapay düşük adet sınırı olmaması demektir, performans kotası ve dosya sınırı ayrıca tanımlanır. Kullanıcı `WEB TASARIM ONAY` vermeden mevcut ana sayfa bu düzene refactor edilmez.

## 3. İş kuralları ve veri sahipliği

1. `product` satışa açık değilse veya `variant` kapalıysa listede satış eylemi gösterilmez. Her seçilebilir rengin **tekil `variantId`** kimliği, özgün medya, stok ve fiyatı vardır; ürünün ilk görseline istemsiz geri dönüş olmaz. Eksik medya için kaydedilmiş onaylı yer tutucu kullanılır, başka varyant görseli kullanılmaz. Yayın öncesi gerçek fotoğraflar ve kullanım hakkı kontrol edilir.
2. Varyant/depo stoğu Faz00 D02'deki sahibi tarafından güncellenir; `availableToSell` sunucudan gelir ve yalnız bilgilendirme niteliğindedir. Stoksuz varyantın sepet eylemi devre dışıdır; son kontrol Faz05 sunucudadır. Stok düzeltmesi neden, aktör, önce/sonra ve hareket kaydıyla yapılır. Fiziksel stok, rezervasyon ve satılabilir stok farklı alanlar olarak tutulur.
3. Tutar tek hesaplama servisinden gelir: liste fiyatı, geçerli kanal fiyatı, uygun kampanya/kupon, vergiler ve ileride Faz06 kişiselleştirme farkı. Çakışan promosyonların yığılma/öncelik kuralı Faz00 karar kaydında ürün sahibi tarafından belirlenmeden üretim kampanyası açılmaz. Kupon sunucuda tarih, kullanım sınırı, hedef ürün/kanal, müşteri uygunluğu ve tekrar kullanımı açısından doğrulanır. Panel önizleme ve müşteri fiyatı aynı hesaplama sürümüne dayanır.
4. Kategori çok düzeyli, marka isteğe bağlı ve ürün özelliği ürün grubuna uygun yönetilir. Silmek tarihsel sipariş ve dış eşleme bütünlüğünü bozacaksa pasifleştir/arşivle; varlıkları referans varken fiziken silme. Dokümanlar dosya kimliği, tür, boyut, izin ve görünürlük taşır.
5. CMS'de sayfa, blog, banner/slider, menü, kampanya, referans, yorum, SSS ve hukuk sayfası yayın/önizleme/taslak durumuyla yönetilir. Kanuni metnin nihai içeriği D10 sahibinden alınır. Analitik/rıza yükleme kuralı D10'a göre uygulanır; yetkisiz izleyici tetiklenmez. Sitemap yalnız kanonik ve yayınlanmış indekslenebilir sayfaları içerir.

## 4. Uygulama görevleri

### Veri ve backend

- DB Admin: `Brand`, `Category(parentId,slug)`, `Product(status,slug,brandId)`, `ProductCategory`, `Variant(sku,attributes,status)`, `ProductAttribute`, `ProductDocument`, `Warehouse`, `InventoryByWarehouse`, `InventoryMovement`, `Price`, `ChannelPrice`, `Campaign`, `CampaignRule`, `Coupon`, `CouponRedemption`, `Page`, `BlogPost`, `Menu`, `Banner`, `SeoMetadata`, `AuditLog` için migration ve ilişki/benzersiz kısıtlarını hazırlar. `sku`, kapsam içinde `(channel, variant, validity)` ve `slug` benzersizlikleri uygulanır. Faz03 `Asset`/`AuditLog` tabloları yeniden kurulmaz; Faz04 yalnız var olanlara varyant ilişkisi ve gereken indeks/alan için ek migration yazar. `InventoryMovement` ve `CouponRedemption` fiziksel sahipliği Faz04'tür; Faz05 bu tabloları yeniden kurmaz. Dış ana kayıt yönü belirlendiğinde tek yazıcı sınırı konur. Fiyat geçerlilik aralıkları, para birimi, vergi oranı ve zaman dilimi açık şemada tanımlanır; `float` ile parasal hesap yapılmaz.
- Backend: panel CRUD/yayın/önizleme, medya yükleme ve güvenli erişim, toplu içe aktarma varsa doğrulama ve satır bazlı hata, arama/filtre/sıralama/sayfalama, fiyat hesaplama ve stok sorgusunu sağlar. Yayın doğrulaması eksik zorunlu görsel, geçersiz varyant/fiyat veya bozuk slug varsa engeller. Yetki sunucuda denetlenir; fiyat/stok/CMS yayın hareketleri denetim günlüğüne yazılır.
- URL örnekleri (son sürüm öneki Faz00'da): `GET /catalog/categories`, `GET /catalog/products?categoryId=&brandId=&q=&filters=&sort=&page=`, `GET /catalog/products/{slug}`, `GET /catalog/products/{id}/variants/{variantId}/offer?channel=web&coupon=`, `GET /cms/pages/{slug}`, `GET /cms/navigation`, `GET /sitemap.xml`; panelde `POST/PATCH /admin/products`, `/admin/variants`, `/admin/media`, `/admin/inventory-adjustments`, `/admin/channel-prices`, `/admin/campaigns`, `/admin/coupons`, `/admin/pages`, `/admin/seo`.
- Yanıt sözleşmesi: liste `{items, page, pageSize, total, filters}`; ürün `{id,slug,brand,categories,features,documents,variants:[{id,sku,attributes,media,availability,offer,printEligible}]}`; teklif `{currency,baseAmount,channelAdjustment,discounts,taxAmount,total,calculationVersion,validUntil}`. `availability` anlık satış garantisi değildir. Para miktarı minör birim/tam sayı veya kesin ondalık biçimindedir; tek format Faz00'da sabitlenir. Hata `{code,message,fieldErrors,traceId}` ve 400/401/403/404/409/422 ayrımı tüm istemcilerde tutarlıdır. Mutasyonlarda `version`/ETag çakışması 409 döner.
- API sözleşmesi OpenAPI olarak depoya eklenir; yönetim uçları iddia edilen rol kadar, müşteri uçları yayın durumu kadar veri açar. Dosya içerikleri tür/boyut ve zararlı içerik açısından doğrulanır; orijinal yüksek çözünürlüklü medya korunur, optimize türevler ayrı tutulur.

### Web/panel frontend

- Kurumsal ana sayfa, kategori, listeleme, arama, filtre, sıralama, karşılaştırma, ürün detay, kampanya/blog/SSS/referans/iletişim ve D10 onaylı yasal sayfalar; mobil/tablet/masaüstü ve klavye gezinmesi. Kategori/ürün sayfaları sunucu tarafında indekslenebilir çıktıyla ve okunur URL ile sunulur; kırık slug için uygun 404/kalıcı yönlendirme politikası uygulanır.
- Ürün detayda renk paleti ve varyant seçimi tek `variantId` üstünden yapılır; ana görsel/galeri, özellik, doküman, stok, kampanya ve birim fiyat seçime anında eşlenir. Yavaş yanıt için yükleniyor; son seçimin yanıtı önceki seçimin geç yanıtıyla üzerine yazılmaz. Stok sıfırken sepet çağrısı başlatılmaz; Faz05 ayrıca doğrular. Karşılaştırma farklı ürünlerin öz niteliklerini yan yana, erişilebilir tabloyla gösterir.
- Panelde kategori/marka/ürün/varyant/medya/doküman/fiyat/depo-stok/kampanya-kupon ve CMS/SEO yönetim ekranları; yetki yoksa işlem kontrolü gizlenir ve API 403 ayrıca uygulanır. Taslak, önizleme, yayın, geri çekme ve kaydetmede çakışma; kullanıcıya anlaşılır doğrulama/hata mesajı. Bu fazda gerçek işlemsel dashboard (yayınlı ürün/varyant, stok alarmı, içerik ve kampanya durumu) ve temel raporlama ekran/API'si uygulanır; satış/sipariş/AI/entegrasyon metrikleri ilgili fazlar 05/08/09/10'da eklenir ve Faz11'de bütünleşik UAT görür. Sistem ayarları panelde yetkili, denetimli ve sırları göstermeyen yapılandırma ekran/API'siyle yönetilir; sonraki modüller kendi ayar alanlarını buraya ekler.
- SEO: meta başlık/açıklama, canonical, hreflang yalnız çok dil gerçekten varsa, Open Graph, breadcrumb, ürün yapılandırılmış verisi, robots ve sitemap; analitik olay şeması (`view_item_list`, `select_item`, `view_item`, `search`, `add_to_cart` Faz05'te, `purchase` Faz05'te) ve GTM/GA/Search Console/Meta Pixel yapılandırmaları ancak erişim/izin sağlandığında. İzleme kimlikleri kodda sabitlenmez; çerez tercihi uygulanır.

### Eksik kalan kapsam maddeleri

- **Medya ve dosya yönetimi (panel):** Faz03 yükleme API'si üzerinde klasör/etiket, arama, kullanım yeri (hangi ürün/banner/sayfa kullanıyor), alt metin, lisans/kaynak, türev önizleme ve kullanımdayken silme engeli olan genel medya kütüphanesi. Ürün, banner ve CMS ekranları dosyayı bu kütüphaneden seçer.
- **İletişim formu:** Web iletişim formunun arka ucu; bot/oran sınırı, D10 aydınlatma metni, panelde gelen kutusu, atama ve yanıt durumu, e-posta bildirimi outbox üzerinden.
- **Desenler (D13'e bağlı):** Menüdeki "Desenler" öğesinin sayfası, veri modeli (desen, koleksiyon, lisans, editör şablonuna bağ) ve satın alma davranışı D13 kararından sonra uygulanır. Karar yoksa menü öğesi yer tutucu içerikle kalır ve `BLOKE · D13` olarak kaydedilir.
- **İlk katalog yüklemesi:** Faz01 01.17 envanterine göre mevcut ürün/varyant/SKU/görsel verisinin satır bazlı doğrulamalı içe aktarımı (Excel/CSV), hata raporu ve tekrar çalıştırılabilirlik. Mikro/pazaryeri eşlemesi Faz08/09'da bu kimlikleri kullanır.
- **URL geçişi:** Eski bir Xinobi sitesi varsa eski URL → yeni kanonik URL 301 haritası panelden yönetilir ve sitemap ile tutarlı test edilir.
- **Kapsam sınırı:** Siyah tema panel dokümanındaki hızlı satış, bayi/riskli müşteri, bakiye/puan ve site tema/CSS-JS motoru bu fazın işi değildir; Faz00 §4'te kapsama alınmadıkça yapılmaz.

### Önerilen repo yerleşimi

`apps/web/src/app/{home,category,product,cms}`, `apps/web/src/features/{catalog,search,compare,seo}`, `apps/admin/src/features/{catalog,inventory,pricing,promotions,cms}`, `packages/ui/{tokens,components}`, `packages/contracts/catalog.openapi.yaml`, `services/api/modules/{catalog,pricing,inventory,cms}`, `infra/db/migrations`, `design/screens/Faz04/`. Bunlar fiziksel yol zorunluluğu değil; Faz00 mevcut repo mimarisiyle eşleştirir ve tek kabul edilen yolları kaydeder.

## 5. Kenar durumları, test ve kabul

| Durum | Beklenen davranış ve kanıt |
|---|---|
| Varyant A mavi ve stokta, B gri ve stoksuz | B seçildiğinde B fotoğrafı ve B stok durumu görülür, A'nın görsel/fiyatı kalmaz, sepet devre dışı; gerçek varlık kimlikleri ve API yanıtı ile ekran kaydı. |
| Medya/doküman bozuk, büyük veya yetkisiz | Yükleme açıklayıcı 422/403 alır, varlık yayınlanmaz, önceki dosya korunur; tür/boyut/yetki testleri. |
| İki panel kullanıcısı aynı fiyatı değiştirir | Sonradan gelen eski sürüm 409 alır, ilk değişiklik kaybolmaz; denetim izi ve eşzamanlılık testi. |
| Stok sahibi dış sistem, panel değişiklik istiyor | D02'deki yazma kuralı API'de uygulanır; yetkisiz kaynak güncellemesi reddedilir; hareket/entegrasyon kaydı incelenir. |
| Çakışan indirim veya süresi dolan kupon | D02/kampanya kararıyla tek sunucu sonucu hesaplanır; panel önizleme ile web aynı olur; sınır tarih ve tekrar kullanma testi. |
| Yayından kaldırılmış ürün veya kırık slug | Liste/sitemap'te yoktur, doğrudan URL uygun 404/redirect verir; arama indeksine yanlış veri verilmez. |
| Dashboard, temel rapor ve sistem ayarı | Katalog/stok/kampanya göstergeleri gerçek veriyle tutarlı; satış/entegrasyon/AI metrikleri ilgili fazdan sonra eklenir. Yetkisiz ayar değişikliği 403; yetkili değişiklik audit ve sürüm taşır. |
| Çerez reddi, analitik erişimi yok | Onaysız etiket yüklenmez, ticaret akışı çalışır; ağ isteği ve consent durum kaydı. |
| Kullanımda olan medya silinmek istenir | Silme engellenir, kullanım yerleri listelenir; arşivleme auditlidir. |
| İçe aktarmada hatalı satır | Geçerli satırlar işlenir veya politika gereği hiçbiri işlenmez; hatalı satırlar raporlanır; aynı dosyanın tekrarı mükerrer ürün üretmez. |
| Eski URL ile gelen ziyaretçi | 301 haritasındaki yeni kanonik adrese tek adımda yönlendirilir; döngü yoktur. |

**Kabul kapısı:** Gerçek Xinobi katalog örnekleriyle en az bir çok varyantlı/çok depolu ürün ve kampanyalı ürün panelden yayınlanıp webde ve sözleşme seviyesinde mobilde aynı kimlik/fiyat/stok bağını gösterir. Kaynak listedeki panel/katalog/CMS/SEO alt maddelerinin her biri ekran, API ve test kanıtıyla izlenir. Eksik kararlar Faz00'da blokajdır. PM, tasarım ve uygulama kanıtını kabul etmeden Faz05/06 bu temele dayanarak kapatılmaz.

**Teslim kanıtı:** migration ve geri alma notu; OpenAPI ve örnek istek/yanıt; onaylı Creative/prototip/FE teslimi; ekran kayıtları; medya lisans ve gerçek ürün görsel eşlemesi; birim/entegrasyon/erişilebilirlik/SEO test sonuçları; rol/denetim testi; Faz00 değişiklik/karar/commit ve sonraki adım kaydı.

## Uygulama durumu — 16.10.2026

Kaynak: Faz00 §5.1 denetimi ve [TST-115](../test/2026-10-14/TST-115-head-regression-and-phase-audit.md), HEAD `b1573d0`. Durumlar: **Tamam** (kod/belge + test kanıtı var), **Kısmi**, **Yok**, **Bloke** (karar/erişim bekliyor). Bu tablo rol veya PM onayı değildir; aşağıdaki onay tablosu `Bekliyor` kalır.

**Geliştirme ~52 % · kalan ~48 % · Statü: Devam (D02/D13 açık)**

**16.10 güncellemesi (kod/commit incelemesi):** SEO temeli TST-120 ile kayıtlı. HTTP test sitesinde katalog kimliği üretimi düzeltildi (`dfada16`); ana sayfa ürün görseli boyutları düzeltildi. Katalog değişikliklerinin audit altyapısı mevcut; yayın doğrulaması ve tüm alan kapsamı açık. Ayrıntılı kayıt: [faz denetimi](../docs/tasks/phase-audit-2026-10-16.md). Yeni uygulama test koşusu yapılmadı; önceki testler tarihsel kanıttır.

**20.10 güncellemesi:** SQL’deki sipariş ve müşteri sayılarından güvenli özet rapor (`65c0722`); simüle sonuçlar yerine açık veri kaynağı sınırları, katalog “erişilemiyor” ile “boş” ayrımı, fiyat kaydında doğru sonuç ve çift tıklama koruması, değerlendirme yanıtı temizleme (`84cdabd`, `d6ff7da`, `854e001`, `ff9c277`). Katalog → Medya’da ürüne ve renk HEX’lerine göre hizalı katalog görseli promptu (`a226037`, `dd94f56`, `bfce868`). **Eksikler sürüyor:** ödeme/net ciro raporu D03/D05’e, ziyaret/dönüşüm verisi doğrulanmış olay kaynağına bağlı; depo/rezervasyon hareketi D02/D03; kalıcı ayarlar; kampanya/kupon, CMS, medya kütüphanesi, CSV içe aktarma, ürün sitemap’i. Rapor satırı Kısmi kalır. [faz denetimi 20.10](../docs/tasks/phase-audit-2026-10-20.md)

| İş | Durum | Kanıt / eksik |
|---|---|---|
| Kategori/ürün/varyant/fiyat/stok şeması | Kısmi | 0002 CatalogCommerce (6 tablo) uygulandı; marka, doküman, depo bazlı stok, `InventoryMovement`, `ChannelPrice`, kampanya/kupon, CMS tabloları yok |
| Katalog API ve panel CRUD | Kısmi | Panel ürün/varyant/fiyat/kategori/galeri, production’da korumalı SQL yönetimi (`81543aa`); audit altyapısı var (`2a60693`, `fc715ec`); yayın doğrulaması ve audit kapsam kontrolü açık |
| Web katalog, arama, filtre, karşılaştırma, ürün detay | Tamam | `/urunler`, `/arama`, `/karsilastir`; renk/varyant galerisi; TST-108 |
| Ana sayfa içerik ve duyurular | Tamam | Panelden kategori görseli, öne çıkan ürünler, duyurular |
| Kampanya/kupon | Yok | Panelde yalnız fiyat önizleme prototipi (TST-081) |
| CMS sayfa/blog/SSS/iletişim formu | Yok | Yalnız `/yasal` ve `/xinobi` (Hakkımızda) |
| SEO (sitemap, robots, canonical, yapılandırılmış veri) ve analitik | Kısmi (14.10) | robots/sitemap/canonical/Open Graph, Organization + Product JSON-LD; alan adı yokken indeks kapalı ([TST-120](../test/2026-10-14/TST-120-seo-foundation.md)). Eksik: ürün başına statik sayfa ve sitemap’te ürünler, breadcrumb, analitik (erişim + D10), 301 haritası |
| Medya kütüphanesi | Yok | Dosyalar `IFileStore`’da, kütüphane ekranı yok |
| İlk katalog içe aktarma (CSV), 301 haritası | Yok | — |
| Gerçek dashboard ve temel rapor | Kısmi | Panel dashboard prototip ağırlıklı |
| Desenler | Bloke | D13 |

**Sonraki adım:** iletişim formu arka ucu ve panel gelen kutusu veya CSV ile katalog içe aktarma (karar gerektirmeyen bağımsız işler).

## 6. Yedi rol inceleme ve onay kapısı

Her rol kendi kanıtını inceleyip tarih, kişi, bulgu ve çözüm bağlantısını Faz00'a işler. Aşağıdakiler şablondur, henüz onay değildir.

- [ ] İş Analisti — kaynak kapsam, iş kuralı, gerçek örnek katalog ve UAT eşlemesini onayladı.
- [ ] Sr. Creative Designer — görsel dil, gerçek ürün medya kullanımı, duyarlı ekranlar ve UI/UX teslimini onayladı.
- [ ] Sr. Frontend Developer — tasarım uygulaması, varyant tutarlılığı, erişilebilirlik ve SEO'yu onayladı.
- [ ] Sr. Backend Developer — API, fiyat hesabı, yayın doğrulaması, yetki ve hata sözleşmesini onayladı.
- [ ] DB Admin — ana kayıt, kısıtlar, migration, veri bütünlüğü ve stok hareketini onayladı.
- [ ] Sr. Full Stack Developer — panel→API→web/mobil sözleşme, uçtan uca test ve dağıtımı onayladı.
- [ ] Web Designer (ek zorunlu rol) — Analiz2 ana sayfa CMS blok sözleşmesi, slider/medya davranışı ve web ekranlarının onaylı tasarıma uygunluğunu onayladı.
- [ ] Proje Yöneticisi — **zorunlu nihai onay**; altı inceleme, ürün sahibi D02/D10 kararları ve kanıtlar tamamlanınca fazı Faz00'da kapattı.


## 06.11.2026 — Kişiselleştirmede tek kaynak fotoğraf/maske planı

Kullanıcı kararı: desenli ürünler için çoklu renk ve renkler arası hizalama gerekmiyor. Güncel revizyon: fotoğraf üretim promptu kaldırılacak; doğrudan yüklenen tek görsel kaynak olacak ve sabit piksel boyutu/en-boy oranı şartı olmayacak. Kaynak indirme ve maskeleme promptu korunacak; prompt boyutu kaynağın gerçek ölçüsünden alınacak, diğer maskeleme kuralları aynen kalacak. Birden fazla görsele aynı maskeyi uygulama/toplu renk onayı kaldırılacak. Maskenin kendi fotoğrafıyla ölçü/koordinat eşliği ve sipariş dosya güvenliği sürecek. Task 01–03 aynı; 04–12 revize edildi. [12 tasklık değişiklik planı](../docs/tasks/personalization-single-source-tasks-2026-11-06.md); bu fazla ilişkili tasklar: **KIS-TEK-01,03,04**. Hepsi açık; yalnız plan hazırlandı, uygulama/veri geçişi/deploy yapılmadı. Normal ürün renkleri ve tarihsel siparişler korunacak.


## 06.11.2026 — KIS-TEK-01 teknik model teslimi

[ADR-005](../docs/decisions/ADR-005-personalization-single-source.md): ürün başına tek profil, değişmez kaynak/yüzey sürümü ve açık fulfillmentVariantId bağı tanımlandı. SKU/fiyat/stok aynı ürünün seçilen ticari varyantından; ilk varyant/fiyat fallback’i yok. Doğrudan kaynak yükleme, sabit tuval olmadan gerçek ölçü, maske eşliği ve üç sipariş dosyası korunumu tanımlandı. Teknik tanım tamam; işletmenin gerçek ürün/SKU ve fiyat kapsamı kabulü bekliyor, task tamamen kapalı değil. Task 02–12 başlanmadı. Kod/veri/deploy değişmedi.


## 06.11.2026 — KIS-TEK-03 admin tek kaynak yönetimi

Katalogda bağımsız kaynak seç/yükle/kaydet/indir alanı; renk/HEX bağımsızlığı, değişmez kaynak kopyası, revizyon çakışması, kaynak yok/hata/yetki/stale/başarı, taslak/ayrılma/çıkış koruması eklendi. Yeni kaynak mağazadaki önizlemeye henüz bağlanmıyor; maske ve web/Flutter/checkout 05–10’da, fotoğraf promptunu kaldırma 04’te açık. [Runbook](../docs/runbooks/personalization-source-management.md), [TST-258](../test/2026-11-06/TST-258-personalization-source-management.md). API 601 PASS/29 SKIP/0 FAIL; admin seri 23/23 paket, yeni alan responsive/klavye/axe PASS. Gerçek veri değişmedi; yerel servisler yenilendi; deploy/APK yok.
