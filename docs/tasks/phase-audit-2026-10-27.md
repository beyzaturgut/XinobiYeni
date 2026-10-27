# Faz denetimi — 27.10.2026

Task konusu: **Xinobi’de tamamlanan geliştirmelerin faz dokümanlarına işlenmesi ve proje durumunun güncellenmesi.**

## Kapsam ve yöntem

Kaynak depo: Desktop/Xinobi, `main`, HEAD `5791181`. Önceki kümülatif denetim sınırı `42553c3` ve [20.10 kaydı](phase-audit-2026-10-20.md) temel alındı. `git log 42553c3..5791181`, commit farkları, fazların görev/durum tabloları, UX kayıtları, runbook, test ve deploy kayıtları karşılaştırıldı. Aşağıdaki envanter erişilebilir tüm merge olmayan commitleri kapsar; tarih filtresiyle yan dal değişiklikleri kaybedilmedi. `068e976` önceki denetimde yer alır; grafikten yeniden görünmesi yeni iş sayılmaz. `0f36b47` önceki kayıt güncellemesidir.

Kod uygulandı, tarihli test geçti, paket yayımlandı, IIS kuruldu, kullanıcı kontrol etti ve resmi kabul alındı durumları ayrı tutuldu. Bu oturum yalnız dokümantasyon denetimidir; uygulama testleri, ücretli AI çağrısı, deployment, migration, APK veya yeni müşteri kabulü yapılmadı. D01–D14 kararlarına ve rol/PM onaylarına imza eklenmedi. Tarihsel yüzdeler yeniden hesaplanmadı; güncel ilerleme iddiası olarak kullanılmamalı.

## Tüm fazlara işlenen sonuçlar

### Faz01 — Bloke — müşteri kararları

- **D01 / 01.03, 01.11 — Güncellendi:** Mevcut main, SQL/API, Flutter ve ortak WebView editörü uygulanmış durumdadır. 20.10 tarihindeki feature dalı/PR bekliyor ifadesi güncel değildir. Çalışan kod, gerçek as-is görüşme veya müşteri kapsam kabulü yerine geçmez.
- **01.09 / D08–D09 — Kısmi:** AI prompt v2, ortak mobil editör ve sipariş önizlemesi uygulandı. Alternatif sayısı, kota/maliyet, cihaz kabulü, push ve mağaza kararı kapanmadı.
- **01.04–10, 01.15–19 — Bloke / açık:** D02–D14 sahip/tarih/onayları, gerçek operasyon ve geçiş envanteri, fiziksel baskı girdileri, hukuk, takvim ve SLA/RPO/RTO kanıtı hâlâ gereklidir. Teknik uygulamadan iş kararı türetilmedi.

İşlendi: [faz dosyası](../../Prompts/Faz01_Kesif_ve_Kararlar.md).

### Faz02 — Devam — tasarım ve erişilebilirlik kabulü açık

- **Akışlar / ürün detayı / navigasyon — Uygulandı:** abdc87a, c9b1e28, 94aa425, ec1638c, 27fed34, 350cd08: kategori URL/geri-ileri, menü odağı, 2–4 ürün karşılaştırma seçimi; ürün/renk → yöntem → yükleme/AI → yerleşim. Kısa ekran ve 390 px düzenleri iyileştirildi.
- **Mobil ve AI ekranları — Uygulandı:** 62d4daf, b5518a4, 6f2fc13, 72808e9: ürün önce, sonuç özeti ve native görünümlü gömülü adımlar; aynı ürün/renk ve giriş sonrası dosya/yerleşim korunur. 2806527 kayıt düğmesi metnini tutarlı kılar.
- **Sipariş önizlemesi / Nobi — Uygulandı:** 451581b, 17904ce, 6c56cdc, e2131e7: birleşik ürün görseli, body portalında tam ekran, 1–5x pinch/pan, klavye ve odak dönüşü; Nobi altında kaybolan eylemler için kaydırma alanı.
- **Eski ekranlar / tasarım teslimi — Kısmi:** 179c46b ve 078a42e kullanılmayan prototipleri/eski editör arayüzünü kaldırdı. Kod ekranı, hi-fi kaynak/handoff veya Creative/Web Designer onayı değildir. Ekran okuyucu, gerçek cihaz ve erişilebilirlik denetimi açık.

İşlendi: [faz dosyası](../../Prompts/Faz02_Tasarim_ve_UIUX.md).

### Faz03 — Devam — güvenlik ve işletim doğrulamaları kısmi

- **03.02 / 03.04 kamuya açık önizleme — Düzeltildi:** 9e69a74 ve TST-135: rendering-inputs salt okunur anonim listeye alındı; OnlyListedAreasArePublic geçti (434 geçti/25 atlandı/0 hata). Önceki 20.10 test hatası güncel açık değildir.
- **03.04 personel / nesne yetkisi — Uygulandı:** 34556fa, 503fe50, 6fd16c0, 681daeb: salt okunur tasarım metadata ve korumalı görsel, tasarıma bağlı sayfalı sipariş referansları, liste limiti dışındaki tek siparişi okuma. 88e99f9/b9b63f3 teklif/AI yazma kontrollerini yetkiye bağlar.
- **03.04 iptal ve stok ayrımı — Düzeltildi:** aa6069f: sipariş status üzerinden iptal için orders.cancel sunucuda da zorunlu; stok yazımı inventory.write ve yalnız stok güncelleme yoluyla yapılır. Katalog yazma yetkisi stok yetkisi yerine geçmez. DEPLOY-014: 26 AuthorizationTests geçti.
- **03.08 / 03.11 revizyon ve medya — Kısmi:** 9933fef, 47d8016, 902066f: sahiplik kontrollü konfigürasyon revizyonu, özel JPEG ve siparişe bağımsız kompozisyon kopyası. Mevcut FeatureDocuments/PersonalizationJson kullanılır; yeni fiziksel SQL migration yok. İzole SQL kalıcılık doğrulaması atlandı; malware taraması ve genel upload/finalize sözleşmesi açık.
- **03.10 sırlar / kurulum — Kısmi:** 096b267, 982436b, 4333eda, 94c9e26: harici sunucu ayarları, aynı dizine kurulum reddi, checksum ile birleşik paket, IIS durdurma/bekleme/yeniden deneme ve geri dönüş. localhost:8024 readiness kullanılır. VERIFYONLY/restore provası, RPO/RTO ve güvenlik taramaları kapanmadı.
- **03.07 / 03.12 sınırlar — Açık:** Inbox/dead-letter, ayrı worker, kalıcı genel panel ayarları ve teknik kararların açık bölümleri sürer. Cihaz sepeti sunucu sepetine dönüşmedi; XINOBI U oturumları tümüyle SQL olarak doğrulanmadı.

İşlendi: [faz dosyası](../../Prompts/Faz03_Teknik_Altyapi_Kimlik_Veritabani.md).

### Faz04 — Devam — katalog iyileştirildi, ticari altyapı eksikleri açık

- **Katalog medya / maske araçları — Uygulandı:** 9925f10 katalog rengi/HEX kullanımı; 561b90b kod tabanlı renklendirme, temiz kenar ve kayıpsız WebP promptu; 0ec407d/1c40a4a HTTP sitede prompt kopyalama ve kaynak fotoğraf indirme. 9e69a74/cdd8ed3 maskeleme panelini production derlemede açar; her canlı renk için kabul kanıtı değildir.
- **Katalog keşfi / kişiselleştirme — Uygulandı:** 2f05625 yalnız panelde kişiselleştirilebilir işaretli ürünler; 50c6080 yönetilebilir gerçek kategoriye bağlı titanyum keşfi (kategori seçimi veri işidir); abdc87a/c9b1e28 filtre/karşılaştırma ve statik export geçişleri.
- **Web stok kaydı — Kısmi:** aa6069f web stok değişimini inventory.write ile sınırlar ve ürünün tamamını yeniden yazmaz. Depo bazlı stok hareketi, rezervasyon veya Mikro senkronu eklenmedi.
- **Yerel medya / rapor sınırları — Kısmi:** 503de15 yalnız eksik yerel medyayı üzerine yazmadan kurtarır; c49e706 sunucuda bulunan medyanın paketlemeyi durdurmasını önler. Bunlar canlı medya tamlığı kanıtı değildir. SQL sipariş/müşteri özetleri mevcut; ödeme/net ciro ve ziyaret/dönüşüm verisi hâlâ koşulludur.
- **Kalan kapsam — Açık / bloke:** Kampanya/kupon, CMS/blog/SSS/iletişim, marka/doküman, medya kütüphanesi, CSV/301, ürün sitemap ve analitik; D02/D03/D13 sınırları değişmedi.

İşlendi: [faz dosyası](../../Prompts/Faz04_Katalog_Stok_Fiyat_Icerik_SEO.md).

### Faz05 — Bloke — gerçek ödeme ve ticari kabul açık

- **Favoriler / sepet — Uygulandı; sepet kısmi:** 9933fef, 47d8016, d2d8f8d: hesapta ortak web/mobil tasarım favorisi, tam ürün/renk/konfigürasyon/revizyon anahtarı, hedefli Kaydet/İptal, adet ve diğer satırların korunması; renk/kaynak değişimi. Sepet cihazda tutulur, cihazlar arası otomatik sunucu eşitlemesi yok.
- **Sipariş snapshot ve görseller — Uygulandı:** 9933fef, 902066f, 451581b, e2131e7: sipariş yerleşimi ve kaynak/checksum/SKU korunur; yeni siparişe bağımsız birleşik JPEG kopyası alınır. Web/mobil küçük görsel ve büyütme aynı ürün kompozisyonunu kullanır; eski kayıtta tam satın alınan revizyonla fallback, kaynak yoksa açık temsilî/erişilemiyor durumu. Ham desen ürün önizlemesi gibi gösterilmez.
- **Panel sipariş / iptal — Uygulandı:** 6fd16c0, c425c4a, 681daeb, c34c250: tasarımdan bağlı siparişe geçiş, sayfalı referanslar, tek siparişi bağımsız okuma. aa6069f iptal yetkisini UI ve API üzerinde ayırır.
- **Ödeme ve operasyon — Bloke / kısmi:** Demo sipariş tahsilatsızdır. Kart/3DS/havale, webhook/iade ödemesi, sunucu sepeti, rezervasyon, kargo sağlayıcısı/ücreti, yasal onay/İYS ve push için D03/D05/D10/D11 ve gerçek entegrasyon kanıtları gerekir.

İşlendi: [faz dosyası](../../Prompts/Faz05_ETicaret_Odeme_Siparis.md).

### Faz06 — Devam; üretim baskısı D04/T-04 ile bloke

- **Onaylı maske / production önizleme — Uygulandı:** 9e69a74, cdd8ed3 ve TST-135: SQL admin kataloğunda maske araçları ve onaylı yüzey renderer yolu production için açıldı. a96d3d9 çalışma kopyası kaynaklarını yayımlar, preview e2e fixture/proxy bağımlılığını giderir. Tüm gerçek renklerde maske/piksel kalitesi ayrıca kabul edilmelidir.
- **Yükleme / yerleşim — Uygulandı:** b926844 EXIF eksenlerini düzeltir; 32d92f2 iptal/takılma kurtarma; 6abc71e içeriğe göre görüntü algılama. Güncel PlacementStudio görsel/desen, konum/ölçek/dönüş/kavis, yakınlaştırma ve geri alma/yineleme kontrollerini paylaşır. Bu, tam katmanlı üretim editörü kabulü değildir.
- **Sürümlü kaydet / yeniden düzenle — Uygulandı:** 9933fef, 47d8016, d2d8f8d, 72808e9: hesap tasarımı + konfigürasyon revizyonu, renk/kaynak değişimi, sepet ve favoriden aynı yerleşime dönüş; girişte tasarım kaybolmaz. 902066f ürün seçilmemiş mobil editör bağlantısını beyaz ekran yerine native seçiciye yönlendirir.
- **Sipariş / panel tasarım kayıtları — Uygulandı; baskı kısmi:** 34556fa, 469d9bd, 503fe50: gerçek tasarım metadata ve yetkili görsel; 068e976 kaynak yokken sahte baskı eylemlerini kapatır. 902066f sipariş kompozisyonunu tasarım silinmesinden bağımsız korur. JPEG önizleme üretim baskı dosyası değildir.
- **Eski editörün kaldırılması — Uygulandı:** 179c46b/078a42e eski prototipleri, EditorWorkspace ve sahte metin/şekil/ön-arka kontrollerini kaldırır; AI ve referans önizlemesi ortak rendering/PlacementStudio kullanır. Eski URL ürün seçimine gider. Yerel referans sayfası gerçek ticari kimlik veya kaydetme hakkı üretmez.
- **Üretim kapısı — Bloke / açık:** Konfigürasyon revizyonu üretim DesignVersion kabulünü kapatmaz. Fiziksel PrintArea mm, DPI/taşma/renk/format, üretim onayı, baskı render worker ve indirme, şablon/metin/katman/çoklu yüz ve fiyat farkı eksikleri sürer. Eski Roboflow/Tea Maker yerel araçlarının tamamı silindi varsayılmadı.

İşlendi: [faz dosyası](../../Prompts/Faz06_Kisisellestirme_Editor_Baski.md).

### Faz07 — Bloke — D07; panel akışı iyileştirildi

- **5 Panel teklif listesi/detayı — Uygulandı:** 2df83fe yükleniyor/boş/hata/tekrar ayrımı; 88e99f9 status eylemlerinde quotes.write; 72aff5d kayıtlı teklif özetini düzenleme izninden bağımsız salt okunur sunum; a544fde arama/sayfalama. Arama yalnız yüklenmiş kayıtları kapsar, sunucu tarafı eksiksiz arama değildir.
- **3 API / 7 dönüşüm / 9–11 — Kısmi / bloke:** Mevcut talep/mesaj/teklif/kabul-ret korunur. Teklif → sipariş, firma başvurusu, teklifsiz toplu sipariş, ek dosya, onaylı e-posta şablonu ve rapor bu commitlerle tamamlanmadı. D07 ve gerçek UAT açık.

İşlendi: [faz dosyası](../../Prompts/Faz07_Kurumsal_Teklif_Toplu_Siparis.md).

### Faz08 — Bloke — D02/D06/D11

- **08.01–08.10 değişiklik denetimi — Yeni entegrasyon yok:** 20–27 Ekim commitleri içinde gerçek Mikro istemcisi/adaptörü, stok/fiyat/cari/sipariş/fatura senkronu veya mutabakat teslimi bulunmadı. Panel prototip temizliği ve ortak izin altyapısı Mikro entegrasyonunun çalıştığı anlamına gelmez.
- **Açık kapılar — Bloke:** Mikro sürümü/API erişimi, alan sahipliği/yönler, gerçek örnek veri, fatura sorumluluğu, idempotent işleyici ve sandbox uçtan uca doğrulama gerekiyor. Önceki çekirdek tablo/prototip kanıtları kısmi kalır.

İşlendi: [faz dosyası](../../Prompts/Faz08_Mikro_Muhasebe_Entegrasyonu.md).

### Faz09 — Bloke — D02/D03/D06

- **1–6 entegrasyon denetimi — Yeni entegrasyon yok:** Trendyol/Hepsiburada/N11 adaptörü, kanal ürün eşleme, merkezi sipariş, stok/fiyat senkronu, webhook ve mutabakat için yeni çalışan teslim bulunmadı. Kendi web/mobil siparişindeki iyileştirmeler pazaryeri siparişi kabulü değildir.
- **Erişim ve işletim — Bloke:** Mağaza/sandbox, alan sahipliği, ödeme/sipariş/rezervasyon kararları ve gerçek kanal örnekleri gerekiyor. Ortak outbox/inbox şeması kanal işleyicilerinin uygulandığını göstermez.

İşlendi: [faz dosyası](../../Prompts/Faz09_Pazaryerleri_Merkezi_Siparis.md).

### Faz10 — Devam — AI üretim ve UI iyileşti; kalite kabulü açık

- **10.02 / 10.05 prompt v2 — Uygulandı:** 2ba81dd: ürüne uygulanacak bağımsız düz desen/görsel üretimi; mutfak eşyası/ürün mockupı, yazı/harf/logo/filigran istemeyen kurallar ve stile göre sanat yönü. Ürün kompozisyonu sonradan renderer ile yapılır. Prompt yasağı tek başına sonuçta nesne/yazı bulunmayacağını garanti etmez; çıktı moderasyonu/kalite elemesi yok.
- **10.05–10.06 ürün bağlamı / mobil — Uygulandı:** 2f05625 yalnız kişiselleştirilebilir katalog; b4dac85 analiz notları; 6f2fc13/72808e9 sonuç özeti, tek ürün/renk bağlamı, girişten sonra aynı yerleşim; kaydet/sepet/favori ortak konfigürasyon revizyonuna bağlı. 078a42e aynı renderer kullanımı.
- **10.09 panel AI yönetimi — Uygulandı; kapsam kısmi:** ef949b1 yükleme/hata ve taslak koruma; b9b63f3 ai.write ile mutasyon; 61aaade yüklenmiş kullanım kayıtlarında tarih filtresi. Filtre tüm geçmiş için sunucu sorgusu veya maliyet ölçümü değildir.
- **10.07 Nobi — Kısmi:** 17904ce/6c56cdc Nobi yanında önizleme eylemlerini erişilebilir kılar. 16.10 canlı 503 kaydı tarihsel kalır; bu denetimde güncel Nobi AI cevabı veya insana devri sınanmadı.
- **Açık AI kapıları — Kısmi / bloke:** D05/D08/D10; moderasyon, transaction kota/maliyet, dört aday/alternatif kararı, arka plan kaldırma/genişletme, soru havuzu, resmi özellik bayrağı, WhatsApp devri ve CTO PoC/kalite onayı kapanmadı. Yeni ücretli üretim denemesi yapılmadı.

İşlendi: [faz dosyası](../../Prompts/Faz10_AI_Tasarim_Satis_Asistani.md).

### Faz11 — Devam — birleşik yayın var; UAT/mağaza kabulü açık

- **11.01–11.06 mobil eşlik — Uygulandı; kabul kısmi:** 62d4daf, b5518a4, 47d8016, 6f2fc13, 72808e9: ortak web editörü ve native hesap/sepet köprüsü. Bearer/refresh token WebView JS/URL/storage içine verilmez; köprü origin ve izinli yollarla sınırlı. 95ad560 APK yapılandırmasında web preview origin; 902066f boş editör ekranı ve büyütülebilir sipariş ürün önizlemesi düzeltmesi.
- **11.09–11.11 dağıtım altyapısı — Kısmi:** 4333eda birleşik web/admin/API indirilebilir GitHub Release; SHA256, yedek, sağlık kontrolü, geri dönüş ve deployment.json. 94c9e26 localhost readiness, IIS bekleme/yeniden deneme ve kurtarma. 096b267 dış ayarlar korunur; deployment doğrudan veri migration çalıştırmaz.
- **Gerçek sunucu kanıtı — Kullanıcı bildirimi:** 25.10 görüşmesinde xinobi-4333eda ve xinobi-902066f için Deployment successful çıktıları alındı; 4333eda sonrası sayfalar kullanıcı tarafından kontrol edildi. Önceki rollback başarısızlığı/manüel kurtarma tarihi korunur. Bu, tüm modüllerin UAT onayı değildir.
- **En son yayımlanan sürüm — IIS kurulumu doğrulanmadı:** DEPLOY-013 xinobi-d54c13c, DEPLOY-014 xinobi-e2131e7 GitHub üzerinde yayımlandı. Son kaynak e2131e7; üç asset ve build kayıtlı. Yeni IIS kurulumu/sonrası smoke kaydı yok. APK bu son web release için üretilmedi; release yayını fiziksel telefon güncellemesi değildir.
- **11.07–11.16 kalan işler — Açık / bloke:** Gerçek Android/iOS cihaz regresyonu, push/deep link, mağaza yayını, ödeme, güvenlik/yük testi, restore provası, eğitim/devir, cutover ve D09/D10/D14 kabulü bekliyor. Runbook ve paketleme varlığı bu işlerin tamamını kapatmaz.

İşlendi: [faz dosyası](../../Prompts/Faz11_Mobil_UAT_Canliya_Gecis.md).

## Commit → faz envanteri

| Commit | Tarih | Faz | Değişiklik |
|---|---|---|---|
| `068e976` | 2026-10-20 | 06 | fix(admin): show unavailable print source and disable prototype actions |
| `34556fa` | 2026-10-20 | 03,06 | feat(admin): expose read-only saved design metadata |
| `0f36b47` | 2026-10-20 | 00 | docs(phases): record 20.10 progress, open gaps and test regressions |
| `469d9bd` | 2026-10-20 | 03,06 | feat(admin): connect print screen to design metadata API |
| `a96d3d9` | 2026-10-20 | 06 | fix(previews): publish working-copy sources and make preview e2e self-contained |
| `9e69a74` | 2026-10-20 | 03,06 | feat(surfaces): run admin masking and approved mask previews in production |
| `503fe50` | 2026-10-20 | 03,06 | feat(admin): securely preview saved design images |
| `096b267` | 2026-10-20 | 03,11 | fix(deploy): keep server-only API settings outside the deployed api folder |
| `982436b` | 2026-10-20 | 03,11 | fix(deploy): refuse in-place installs and search manual API backups |
| `9925f10` | 2026-10-20 | 04,06 | feat(admin): reuse catalogue colours and fill their HEX code |
| `0ec407d` | 2026-10-20 | 04,06 | fix(admin): copy prompts on the plain-HTTP live site |
| `c49e706` | 2026-10-20 | 11 | fix(deploy): package the web when some media exists only on the server |
| `561b90b` | 2026-10-20 | 04,06 | fix(admin): ask for code-based recolouring, clean edges and lossless WebP |
| `6fd16c0` | 2026-10-20 | 03,06 | feat(admin): query paged order references by design |
| `c425c4a` | 2026-10-20 | 05,06 | feat(admin): list orders linked to saved designs |
| `681daeb` | 2026-10-20 | 05,06 | feat(admin): read individual orders beyond list limit |
| `c34c250` | 2026-10-20 | 05,06 | feat(admin): open related order details from designs |
| `2df83fe` | 2026-10-20 | 02,07 | fix(admin): distinguish quote list loading and error states |
| `88e99f9` | 2026-10-20 | 03,07 | fix(admin): respect quote write permission on status actions |
| `72aff5d` | 2026-10-21 | 02,07 | fix(admin): show saved quote summary independently of editing |
| `a544fde` | 2026-10-21 | 02,07 | feat(admin): search and paginate loaded corporate quotes |
| `ef949b1` | 2026-10-21 | 10 | fix(admin): guard AI loading states and preserve drafts |
| `b9b63f3` | 2026-10-21 | 03,10 | fix(admin): enforce AI write permission on mutation controls |
| `61aaade` | 2026-10-21 | 10 | feat(admin): filter loaded AI usage by date range |
| `cdd8ed3` | 2026-10-21 | 04,06 | fix(admin): show surface masking in production builds |
| `1c40a4a` | 2026-10-21 | 04,06 | fix(admin): download mask source photos over HTTP |
| `2f05625` | 2026-10-21 | 04,06 | fix(xinobi-u): list only products marked personalizable in the admin |
| `179c46b` | 2026-10-22 | 01,02,06 | refactor: remove unused storefront and admin prototype code |
| `5fdcc64` | 2026-10-22 | 01,02,06 | docs: align project status with server APIs and runtime conditions |
| `abdc87a` | 2026-10-22 | 02,04 | feat(ux): improve navigation, comparison selection and design entry flows |
| `b926844` | 2026-10-23 | 06 | fix(preview): resize EXIF photos on their oriented axes |
| `50c6080` | 2026-10-23 | 02,04 | feat(catalog): link titanium discovery to a configured category |
| `c9b1e28` | 2026-10-23 | 02,04 | fix(web): preserve static-export filter transitions and menu focus |
| `9933fef` | 2026-10-23 | 05,06 | feat(personalization): preserve versioned placements in favorites and orders |
| `503de15` | 2026-10-23 | 04,06 | fix(dev): restore missing local catalog media without overwriting files |
| `32d92f2` | 2026-10-23 | 06 | fix(web): recover stalled image preparation and allow cancellation |
| `6abc71e` | 2026-10-23 | 06 | fix(web): detect image content and remove original upload size gates |
| `94aa425` | 2026-10-23 | 02,06 | feat(web): restyle product detail and XINOBI U colour step to the new design |
| `ec1638c` | 2026-10-23 | 02,06 | feat(web): split the XINOBI U own-image flow into method, upload and placement steps |
| `27fed34` | 2026-10-23 | 02,06 | style(web): compact product detail and XINOBI U steps to fit the screen |
| `350cd08` | 2026-10-23 | 02,06 | style(web): fit product detail and XINOBI U steps into short browser windows |
| `62d4daf` | 2026-10-23 | 02,06,10,11 | feat(mobile): bring product detail and the XINOBI U method step to the new design |
| `47d8016` | 2026-10-23 | 05,06 | feat(personalization): unify editable cart and favorites across web and mobile |
| `d2d8f8d` | 2026-10-23 | 06 | fix(personalization): allow colour and source changes when reediting designs |
| `b5518a4` | 2026-10-23 | 02,06,10,11 | fix(mobile): make the in-app design steps feel native instead of a browser page |
| `b4dac85` | 2026-10-23 | 10 | docs: analyze AI mobile flow notes and define phased prompts |
| `6f2fc13` | 2026-10-23 | 02,06,10,11 | feat(mobile): summary card and product-first actions on the AI result |
| `72808e9` | 2026-10-23 | 02,06,10,11 | feat(personalization): one product context from AI result to placement and sign-in |
| `2806527` | 2026-10-23 | 06 | fix(web): keep the "Tasarımımı kaydet" label after the first save |
| `95ad560` | 2026-10-25 | 11 | fix(mobile): include test web preview origin in APK builds |
| `4333eda` | 2026-10-25 | 11 | feat(deploy): add downloadable combined IIS releases and rollback |
| `94c9e26` | 2026-10-25 | 03,11 | fix(deploy): use localhost health checks and harden IIS recovery |
| `2ba81dd` | 2026-10-25 | 10 | fix(design): generate standalone artwork with style-aware prompts |
| `902066f` | 2026-10-25 | 05,06,11 | fix(mobile): open editor reliably and retain zoomable order product previews |
| `9e9b060` | 2026-10-25 | 11 | docs(deploy): record prepared mobile preview release |
| `451581b` | 2026-10-27 | 02,05,06 | fix(web): show composed order product previews with zoom |
| `17904ce` | 2026-10-27 | 02,06,10 | fix(web): allow preview actions to scroll above Nobi |
| `6c56cdc` | 2026-10-27 | 02,06,10 | fix(web): reserve Nobi scroll space in active placement studio |
| `078a42e` | 2026-10-27 | 01,02,06 | refactor(web): retire legacy editors and share product previews |
| `d54c13c` | 2026-10-27 | 11 | docs(deploy): default to established GitHub release flow |
| `dee4293` | 2026-10-27 | 11 | docs(deploy): record published xinobi-d54c13c release |
| `aa6069f` | 2026-10-27 | 03,04,05 | Fix admin cancellation and inventory permission boundaries |
| `e2131e7` | 2026-10-27 | 02,05,06 | fix(web): match Flutter fullscreen order product preview |
| `5791181` | 2026-10-27 | 11 | docs(deploy): record fullscreen preview release and clipboard auth |

**Kapsama alınan merge olmayan commit:** 64. Merge commitleri aynı değişiklikleri ikinci kez teslim saymaz; entegrasyon izleri:

```text
7152979 Merge pull request #14 from beyzaturgut/fix/admin-print-source-state-20261020
08688fb Merge remote-tracking branch 'origin/main' into feature/surface-masking-preview-20261020
5f215f6 Merge pull request #15 from beyzaturgut/feat/admin-design-metadata-20261020
33b2d2f Merge pull request #16 from beyzaturgut/feat/admin-print-metadata-ui-20261020
808e10f Merge pull request #17 from beyzaturgut/feat/admin-design-image-20261020
dee00b8 Merge pull request #18 from beyzaturgut/feat/admin-design-orders-api-20261020
a9afe26 Merge pull request #19 from beyzaturgut/feat/admin-design-order-links-ui-20261020
04db5d0 Merge pull request #20 from beyzaturgut/feat/admin-order-detail-api-20261020
e7bb7e1 Merge pull request #21 from beyzaturgut/feat/admin-design-order-detail-ui-20261020
19f959f Merge pull request #22 from beyzaturgut/fix/admin-quote-list-states-20261020
5497440 Merge pull request #23 from beyzaturgut/fix/admin-quote-status-permissions-20261020
a960e89 Merge pull request #24 from beyzaturgut/fix/admin-quote-read-summary-20261021
73a299c Merge pull request #25 from beyzaturgut/feat/admin-quote-search-pagination-20261021
d00c3c8 Merge pull request #26 from beyzaturgut/fix/admin-ai-load-states-20261021
c0cf28d Merge pull request #27 from beyzaturgut/fix/admin-ai-write-permissions-20261021
790ae76 Merge pull request #28 from beyzaturgut/feat/admin-ai-usage-date-filter-20261021
0a4d3aa merge: retain current storefront and surface masking work on main
```

## Kanıtlar ve testlerin zaman sınırı

| Kayıt | Sonuç ve sınır |
|---|---|
| [TST-135](../../test/2026-10-20/TST-135-production-surface-masking.md) | 434 .NET geçti, 25 atlandı, 0 hata; 34 önizleme e2e geçti. Production kod yolu test edildi; gerçek IIS denemesi değildi. Anonim izin listesi gerilemesi kapandı. |
| [22–23 Ekim UX teslimi](../ux/2026-10-22-implementation.md) | 156 web geçti/1 atlandı; .NET 475/29; Flutter 61; EXIF regresyonları geçti. İzole SQL bağlantısı yok; gerçek katalog yüzeyleri koşullu. |
| [23 Ekim kişiselleştirilmiş alışveriş](../ux/2026-10-23-personalized-shopping.md) | Tarihli tam web 176 geçti/1 atlandı ve değişen açıklama sonrası hedefli 26 geçti; API 477/29; Flutter 67 ve analiz temiz. Bunlar bugünkü tam regresyon koşusu olarak sunulmadı. |
| [Mobil sipariş önizleme runbook](../runbooks/mobile-design-order-previews.md), [DEPLOY-012](../../deployments/DEPLOY-012-mobile-order-preview-prepared.md) | Mobil editör, order-owned önizleme ve fallback; hazırlık/test kanıtı fiziksel cihaz kabulü değildir. |
| [27 Ekim temizlik](../../test/2026-10-27/TST-web-preview-cleanup.md) | 26 WebKit kontrolü ve build/lint geçti; eski HEAD’de de üreyen sepet/userSelect/hash/rounding hataları, Chromium gerektiren CDP ve eksik acceptance fixture sınırlamaları raporda açık. Tüm testler yeşil iddiası yok. |
| [27 Ekim tam ekran](../../test/2026-10-27/TST-order-preview-fullscreen.md) | 390/1440 genişlikte snapshot/revizyon için 4 WebKit testi; geometry/pinch/pan/focus, production build ve lint geçti. Fiziksel Android ve IIS denenmedi. |
| [DEPLOY-014](../../deployments/DEPLOY-014-fullscreen-order-preview-release.md) | API/admin/web build, 26 AuthorizationTests ve mock admin yetki/stok kontrolleri kayıtlı; üç GitHub asset doğrulanmış. Kurulum öncesi 200 cevabı yeni sürümün kurulduğunu göstermez. |

## Yayın, kurulum ve kullanıcı bildirimi

- **25.10 kullanıcı bildirimi:** `xinobi-4333eda` ilk denemesi readiness/rollback hatası verdi. Kullanıcı eski API’yi geri koydu, havuzları başlattı; localhost:8024 readiness 200 ile doğrulandı. Sonraki kurulum başarılı çıktı ve sayfaların açıldığı kullanıcı tarafından bildirildi. `xinobi-902066f` için de başarılı deployment.json yolu paylaşıldı. Bunlar görüşme kanıtıdır; sunucu kaydı bu oturumda bağımsız okunmadı.
- **27.10 depo kanıtı:** [DEPLOY-013](../../deployments/DEPLOY-013-web-preview-cleanup-release.md) `xinobi-d54c13c` ve DEPLOY-014 `xinobi-e2131e7` yayımlandı. Kullanıcının d54c13c 404 denemesi başarılı kurulum sayılmaz. Son doğrulanan release e2131e7; IIS kurulum sonucu hâlâ bekliyor.
- **Sunucu düzenleme bildirimi:** Eski manuel/başarısız dağıtım yedekleri kullanıcı çıktısına göre `C:\XinobiArchive` altına taşındı. Aktif web `XinobiYeni\XinobiDeploy\out`, API `XinobiYeniApi\api`, veri `XinobiYeni\XinobiData` ve `XinobiYeniApi\data`, dış ayar `C:\XinobiData\config` korunur. Eski Xinobi ayrı projedir; kullanım dışı sayılmadı. Arşivleme backup/restore provası değildir; yeni silme/taşıma yapılmadı.
- **Token yöntemi:** [tek komut runbook](../runbooks/one-command-deploy.md) ve AGENTS.md esas; özel repo, Mac yazma ve sunucu salt okuma yetkisi ayrımı; Windows’ta bekleme sonrası yeni kopyalanmış panodan okuma, biçim kontrolü ve oturum sonunda temizleme. Dokümanlarda token değeri bulunmaz.

## Öncelikli açık işler

1. Son paketin gerçek IIS kurulum/health/telefon sonuçlarını deployment kaydına eklemek; kurulu APK ile API/web ortamlarının eşleşmesini doğrulamak.
2. Güncel fiziksel cihazda Tasarımlarım → editör; yeni kişiselleştirilmiş sipariş → doğru ürün/renk/revizyon ve tam ekran yakınlaştırma; eski görseli eksik sipariş fallback’ini kontrol etmek.
3. İzole SQL kalıcılık, kritik modül audit kapsamı, güncel tam regresyon ve raporlanan fixture/test sınırlamalarını tamamlamak; güvenli yedek doğrulama ve restore provası almak.
4. D03/D04 ve diğer açık iş kararlarına gerçek sahip/tarih/kanıt; ödeme/rezervasyon, fiziksel baskı ve üretim çıktısı, entegrasyon erişimleri. Handoff/a11y, iOS/push/UAT ve rol/PM onaylarını bağımsız yürütmek.

Doküman doğrulaması: [TST-phase-audit](../../test/2026-10-27/TST-phase-audit.md). Fazların yeni durum tablosu [Faz00](../../Prompts/Faz00_Proje_Takip_ve_Kesintiden_Devam.md) §5’tedir. Başlangıç planı ve tarihli eski sonuçlar silinmedi; yeni güncel bölüm bunların önüne kondu.
