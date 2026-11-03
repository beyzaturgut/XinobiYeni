# Xinobi | Sürat Kargo entegrasyon planı

03.11.2026 | Yalnız plan ve uygulama hazırlığı

## 01 | MostGate taskı ve kapsam

Konu: Sürat Kargo gönderi oluşturma, barkod etiketi ve takip entegrasyonunu kurma

Task: KRG-SUR-01 | Ana bağlantı: Faz05 / TIC-08 | Durum: Planlandı, uygulama başlamadı.

Açıklama: Xinobi siparişlerinden Sürat Kargo gönderisi oluşturulmasını, gönderiye ait sabit ve benzersiz referansla Code128 kargo etiketi indirilmesini ve şube kabulünden sonraki hareketlerin izlenmesini geliştir. Test ve canlı bağlantıları, gizli bilgiler, paket ölçüleri, ödeme sorumluluğu, tekrar istekleri ve hata durumlarını ayrı yönet. Admin işlem yapabilsin; web ve Flutter yalnız müşteriye izinli takip verisini okuyabilsin. Canlıya geçişi doğrulanmış test ve sağlayıcı teyitlerine bağla.

Teslim: sunucu adaptörü, kalıcı gönderi/paket/deneme kayıtları, admin gönderi ve etiket alanı, takip işi, müşteri takip sözleşmesi, izole testler ve kurulum yönergesi. Bu belge yalnız hazırlık ve task planıdır; kod, ayar, gerçek gönderi veya MostGate kaydı oluşturulmadı.

Kapsam dışı: ürün baskısına hazırlık, üretime gönderme, baskı operasyonu; hosting/deploy; ödeme sağlayıcısı; yeni APK. Kargo etiketi fiziksel ürün baskı dosyasından ayrıdır. ZIP'te fiyat/tarife sorgulama sözleşmesi yoktur; checkout kargo ücretinin hesaplanması TIC-08 içinde ayrı açık iştir.

## 02 | Kaynak incelemesi ve mevcut proje

İnceleme: kullanıcının RE-14057 e-postası, ZIP içindeki 9 sayfalık gönderi PDF'i, 8 sayfalık takip PDF'i ve 6 istekli Postman koleksiyonu. E-postada canlı cari 1505859998 için takip yetkisi tanımlandığı bildiriliyor; gönderi yazma yetkisi ve sözleşme kapsamı ayrıca doğrulanmalı. Sağlayıcıya bu çalışmada istek gönderilmedi.

Mevcut API: services/api/Orders/OrderLifecycle.cs ve OrderEndpoints.cs manuel taşıyıcı/takip kaydı kullanıyor. Manuel Ship işlemi siparişi hemen kargolandı yapıyor; API'de kayıt açılması için bu işlem kullanılamaz. CustomerContracts.cs içindeki OrderShipment kapsamlı entegrasyon modeli değildir. Demo sipariş kabulü gerçek ödeme/tahsilat kanıtı değildir; demo siparişten otomatik canlı gönderi oluşturulmaz.

Admin: apps/admin/src/Orders.tsx mevcut manuel kargo formunu içerir. Integrations.tsx ve integration-model.ts içinde Sürat bağlantısı yoktur; yeni bağlantı ve sunucu ayar sözleşmesi gerekir. Program.cs içindeki işçi yapısı incelenerek takip işi eklenecek; dayanıklı gönderi kuyruğu varmış gibi davranılmayacak.

Web ve Flutter müşterinin kendi siparişine ait güvenli takip verisini okuyacak. Taşıyıcı parolası istemciye gitmeyecek. Mevcut diğer taşıyıcıların manuel akışı korunacak.

Kaynak dosyalar: GonderiyiKargoyaGonder Entegrasyonu API Dokümanı 1.pdf; KargoTakipHareketDetayi API Dokümanı v2.pdf; SüratKargoWebAPI.postman_collection 1.json. Ham örnekler kişisel/gizli bilgi içerebildiği için repoya eklenmedi.

## 03 | Ortam, bilgiler ve yerleşim kararı

Sunucu gizli ayar deposu: Shipping:Surat:Sandbox:Username / Password ve Shipping:Surat:Production:Username / Password. Sağlanan iki hesap ayrı secret olarak yetkili kişi tarafından girilecek. Parolalar bu belgeye, Git'e, task/prompta, NEXT_PUBLIC/VITE ayarına veya Flutter paketine yazılmayacak. Paylaşılmış canlı parola devreye almadan önce sağlayıcı ile yenilenmeli.

Sunucu açık yapılandırması: Shipping:Surat:Enabled (başlangıç false), Mode (Sandbox), iki ayrı BaseUrl, onaylı gönderici cari kodu, zaman aşımı ve takip aralığı. Ortam değişkeni örneği: Shipping__Surat__Sandbox__Password=<SECRET_REFERENCE>. Şablon yalnız yer tutucu içerir; yerel gerçek ayar dosyası commit edilmez.

Canlı gönderici cari kodu: 1505859998. Takipte CariKodu alanına seçilen ortam hesabına ait cari gönderilir; test hesabına canlı kod kopyalanmaz. Kullanıcı adı/cari eşliği bu hesaplarda sağlayıcıyla doğrulanır. Gönderi içindeki AliciKodu ise alıcının isteğe bağlı cari kodudur; buraya gönderici kodu yazılmaz.

Admin > Entegrasyonlar > Kargo > Sürat: seçilen ortam, etkinlik ve “bilgi tanımlı/tanımlı değil”, son doğrulanmış bağlantı sonucu, teyit ve IP izin durumu. Parola okunabilir dönmez. Gizli ayar sunucuda yönetilir; panelin otomatik secret düzenlediği varsayılmaz.

Admin > Sipariş > Kargo: alıcı adresinin sipariş anı kopyası, paketler, onaylı gönderim politikası, sabit referans, kayıt sonucu, etiket indir/yeniden indir, takip ve hata ayrıntısı. Yetki sunucuda orders.read/orders.write üzerinden uygulanır; yalnız buton saklamak yeterli değildir.

Yurt dışı erişim: API ve takip işçisinin gerçek dışa çıkış IP/NAT adresi sağlayıcıya bildirilir. Bu adres henüz tespit edilmedi; web tarayıcısının IP'si veya sunucunun gelen trafik adresi varsayılmaz. Test ve canlı erişimi ayrı teyit edilir.

## 04 | Servis sözleşmesi ve kritik farklar

Gönderi POST: test https://api02.suratkargo.com.tr/api/GonderiyiKargoyaGonder ; canlı https://api01.suratkargo.com.tr/api/GonderiyiKargoyaGonder. PDF s.3-8: JSON kökü KullaniciAdi, Sifre, Gonderi. Kesin tel tipi ve büyük/küçük harfler fixture ve sağlayıcı teyidiyle kilitlenecek.

Takip POST: aynı ortam kökünde /api/KargoTakipHareketDetayi. PDF s.2: CariKodu, Sifre, WebSiparisKodu query parametreleri. WebSiparisKodu oluşturmadaki OzelKargoTakipNo ile aynıdır. Query içindeki parola URL, erişim logu, APM, hata ve proxy kayıtlarında maskelenir. Sağlayıcı onayı olmadan query yerine body destekleniyor varsayılmaz.

Gönderi yanıtı: PDF s.9 yalnız “Tamam” der; e-posta “Tamam” veya “Kayıt Edildi” kabul eder. Yalnız teyitli tam değerler başarı kabul edilecek; HTTP 200 veya metin içinde “Tamam” geçmesi yeterli değildir. Başarı yalnız “sağlayıcıda kayıtlı” anlamındadır, şube kabulü değildir.

Postman: GonderiSil, OrtakBarkodOlustur, GonderiGeriCek, GonderiOlustur, KargoTakipHareketDetayi ve PazaryeriGonderiHareketDetay. Oluşturma isteği /GonderiOlustur yolunda ve FirmaId/Data yapısında; PDF'teki /api/GonderiyiKargoyaGonder ile aynı kabul edilmez. OrtakBarkodOlustur gövdesi geçerli JSON değil; yanıt örnekleri yok. Silme/geri çekme uçları bu taskta otomatik kullanılmaz; sözleşmeleri yeterli değil.

Teyit gerektirenler: Odemetipi/OdemeTipi yazımı; COD tutarının byte/decimal ve virgül/nokta farkı; COD kapalıyken alanların atlanması/0 gönderilmesi; Dosya/Mi desi-kg kuralları; durum 7 çelişkisi; test/canlı yetkiler, kota ve tekrar davranışı. Bunlar kapanmadan ilgili özellik canlıya açılmaz.

## 05 | Alıcı ve gönderi alan eşleştirmesi

KisiKurum (zorunlu): sipariş teslimat adresi FullName. AliciAdresi (zorunlu): adres Line; Il/Ilce: City/District. Anlık profil değişiminden değil siparişin adres kopyasından okunur. Eksik alanla gönderi açılmaz.

TelefonCep (zorunlu): adres Phone; 5..., 05..., 905... biçimleri belgede ayrı hatalara sahip. Ülke bilgisi korunarak teyitli forma dönüştürülür. TelefonEv/TelefonIs isteğe bağlı; Email siparişin alıcı iletişim kopyası. Eksikler sahte değerle doldurulmaz.

SahisBirim: isteğe bağlı bölüm/alıcı veya noktalı virgülle ürün bilgisi; asgari veri paylaşılır. AliciKodu: yalnız gerçekten bilinen alıcı Sürat carisi; boş olabilir. ReferansNo: isteğe bağlı gruplama, benzersiz anahtar yerine kullanılmaz.

OzelKargoTakipNo: zorunlu, en fazla 50 karakter. Kendi mağazamızda bir gönderiye bağlı kalıcı benzersiz kod; her yeniden denemede yeniden üretilmez. Yerel takip kimliği ve müşteri görünen sipariş numarası ayrı tutulabilir. Market siparişinde pazaryerinin verdiği sipariş kodu aynen kullanılır; suffix ekleme çoklu gönderi için sağlayıcı teyidi ister.

KargoTuru: 1 Dosya / 2 Mi / 3 Koli. Adet: paket sayısıdır, sepetteki ürün adedi değildir. BirimDesi ve BirimKg: aynı boyuttaki tek paketin ölçüleri; toplam ağırlık diye gönderilmez. Paket bilgileri yeni admin paket formundan/onaylı paket kaydından gelir, fiyat veya ürün adedinden uydurulmaz.

KargoIcerigi: farklı parçalar/kolibaşı sözleşme için desi:kg:kargotürü:adet; düzeni; son noktalı virgül gerekir. Örnek sentetik değer: 6:6:3:1;1:1:2:1;. Boyut, ağırlık ve sözleşme geçerliliği doğrulanır. Eksik desi/kg sıfıra çevrilmez. Genel pozitif değer kuralı ile Dosya=0/Mi=1 hata kodlarının farkı teyit edilir.

## 06 | Ödeme, kanal ve koşullu alanlar

OdemeTipi: 1 Peşin Ödeme, 2 Ücret Alıcı. Kargo ücretini kimin ödediğini belirtir; web siparişinin kartla ödenmesi veya kapıda ürün tahsilatı ile aynı şey değildir. İşletmenin sözleşmesine göre onaylı politika gerekir. “Entegrasyon Firması Öder / Tedarikçi Öder” ayrımı için bu iki enumun yeterli olduğu varsayılmaz.

KapidanOdemeTahsilatTipi: COD varsa 1 Nakit / 2 POS; KapidanOdemeTutari koşullu tutar. Varsayılan COD kapalı. PDF s.6 alanları COD yokken göndermemeyi söyler; s.8 örneği 0 içerir. Tutar türü ve tel formatı da çelişir. COD sağlayıcı teyidi ve test olmadan açılmaz.

IrsaliyeSeriNo: COD için koşullu, en fazla 5 karakter. IrsaliyeSiraNo: koşullu, en fazla 10 sayısal karakter. Aynı seri/sıra bazı koşullarda eski kaydı güncelleyebilir; rastgele değer veya web sipariş numarasıyla doldurulmaz. Fatura/e-irsaliye kaynağı ayrıca netleştirilir.

TasimaSekli: zorunlu 1 Karayolu / 2 Uçak / 3 MotorKurye. TeslimSekli: 1 Adrese / 2 Şubede. GonderiSekli: 0 Standart / 5 Bukoli / 8 Pudo. Standart karayolu-adrese tercih önerisidir; işletme/sağlayıcı onayı olmadan tüm siparişlere zorlanmaz.

SevkAdresi isteğe bağlı. TeslimSubeKodu yalnız ilgili şube/teslimat yöntemi biliniyorsa. EkHizmetler isteğe bağlı virgüllü kodlar: GondericiyeSms, TelefonIhbar, AliciyaSms, AdrestenAlim; ücret/sözleşme onayı olmadan etkinleştirilmez.

Kendi mağazamız: Pazaryerimi=0, EntegrasyonFirmasi boş string, OzelKargoTakipNo kendi sabit benzersiz kodumuz. Pazaryeri: Pazaryerimi=1, EntegrasyonFirmasi onaylı isim, referans pazaryeri sipariş kodu. E-posta örnekleri: Trendyol 727..., Hepsiburada 629..., İdefix IPS..., Pazarama PZ.... PDF listesi ile e-posta aynı kapsamda değil; isim/case ve İdefix desteği teyit edilir.

Iademi: zorunlu 0 normal / 1 iade. Fiziksel iade gönderisi müşteri iptal veya para iadesi değildir. İlk teslim kendi mağazamızın normal çıkışıdır; iade ve market genişlemesi ayrı kabul kapısıyla açılır.

## 07 | Veri modeli, işlem ve hata güvenilirliği

Önerilen kalıcı kayıtlar: Shipment (orderId, ortam, hesap referansı, kanal, sabit web referansı, adres kopyası, politika, kayıt durumu); ShipmentPackage (parça, desi, kg, tür); ShipmentAttempt (istek kimliği, zaman, güvenli yanıt/hata, belirsizlik); TrackingDocument/TrackingEvent (sağlayıcı belge/parça/iade kimliği, ham kod/metin, zaman); LabelArtifact (şablon sürümü, gönderi referansı, dosya özeti). Yeni model ve migration gereklidir; bugün varmış gibi raporlanmaz.

Akış: uygun sipariş kontrolü > alan/paket doğrulama > aynı işlem içinde kalıcı benzersiz referans ve gönderi taslağı > tek sahipli gönderim > açık kabul yanıtı > kayıtlı/şube kabulü bekleniyor > etiket > takip hareketi > gerçek fiziksel durum. Etiket hazır bilgisi sevkiyat durumundan bağımsızdır.

Benzersizlik: ortam + gönderici hesap + web referansı; aynı sipariş/gönderi için istemci idempotency anahtarı ve işçi kilidi. Çift tıklama ve işçi yeniden başlaması yeni referans üretmez. Parçalı sevkiyat ve marketin aynı ref ile çoklu paket kuralları teyit edilmeden otomatik bölünmez.

Zaman aşımı/ağ kopması kayıt yapılmadı demek değildir. Durum reconciliation_required olur. Kör POST tekrarına veya yeni referansa geçilmez. Şube kabulünden önce takip boş dönebildiği için boş takip sonucu da “oluşturulmamış” kanıtı değildir. Sağlayıcıyla uzlaştırma gerekir.

Hatalar: 001 kimlik; 002-008 veri; 009 mevcut kayıt değiştirilemiyor; 013-017 barkod/tekrar; 018 sözleşme; 019-024 telefon; 025-037 politika/COD/format; 038-040 barkod/kayıt belirsizliği; 042 sistem. 010 gibi “kayıt edildi” içeren veya 039 gibi kayıttan sonra barkod üretilemeyen durumlar kısmi sonuç olarak uzlaştırılır. Son kullanıcıya ham sağlayıcı cevabı/parola gösterilmez.

Planlanan uçlar: admin shipment create, shipment detail, label download/reprint, tracking refresh; isimler uygulama sırasında sözleşmeye bağlanır. Mevcut manuel shipment ucu korunur. Kayıt alındığında order_shipped bildirimi gönderilmez; gerçek geçişlerde bir kez bildirilir.

## 08 | Etiket ve takip kabul kuralları

Etiket: e-postaya göre gönderi kaydı alındıktan sonra Xinobi üretir. Seçilen ortamın gönderici cari kodu ve OzelKargoTakipNo'nun Code128 barkodu, ayrıca okunur referans bulunur. Cari kodunun ayrıca hangi barkod türüyle basılacağı, etiket ölçüsü, zorunlu diğer alanlar, DPI/yazıcı ve paket başına etiket düzeni sağlayıcıyla teyit edilir. OrtakBarkodOlustur metodunun zorunlu olduğu varsayılmaz.

Admin yalnız bu siparişe bağlı etiketi yetkiyle indirir/yeniden basar; yeniden indirme yeni gönderi oluşturmaz. PDF etiket fixture'ında barkod çözümü tam referansa eşit olmalı; Türkçe alıcı metni, sessiz alan ve fiziksel yazıcı okunabilirliği test edilir. Test etiketi belirgin TEST ibaresiyle canlı sevkiyattan ayrılır.

Takip yanıtı: IsError, errorMessage ve Gonderiler[] ayrı işlenir. Başlangıçta boş liste “şube kabulü/hareket bekleniyor” olabilir; kimlik hatası veya teslim edilmiş değildir. Çoklu belge/parça/iade kayıtları korunur, yalnız ilk eleman seçilmez.

KargoObjId örnekleri JS güvenli tamsayı sınırını aşar; kimlikler uçtan uca string korunur. SonHareketTarihi ve IslemTarihi gibi offsetsiz tarihler ile dd/MM/yyyy teslim tarihi aynı sanılmaz. Ham tarih korunur; saat dilimi teyit edilmeden tahmini UTC dönüştürmesi yapılmaz.

KargoTakipNo ve TakipUrl fiziksel kabulden sonra gelen gerçek değerlerdir; kendi referansımız taşıyıcının takip numarasıymış gibi gösterilmez. URL güvenilir HTTPS host kontrolünden geçer. Hareketler, şubeler, teslim alan bilgisi yalnız yetkili kullanıcıya ve ihtiyaca göre gösterilir.

Takip işi: kalıcı zamanlama/kilit, kontrollü backoff/jitter, doğrulanmış kota, son başarılı sorgu ve eskimiş bilgi göstergesi. Servis hatasında önceki doğru veri korunur; sıfır/boş durumla üzerine yazılmaz. Web/Flutter sunucudan okur, doğrudan sağlayıcıya bağlanmaz.

## 09 | Sağlayıcı durum tablosu ve yorumlama

Kaynak: takip PDF s.7. Ham kod ve açıklama her zaman saklanır; aşağıdaki iç eşleştirme uygulanacak taslaktır.

1 Gönderi Hazırlanıyor > hazırlık/kabul bekliyor; kayıt açılması fiziksel sevk değildir.

2 Transfer Merkezinde > yolda; 3 Gönderi Yolda > yolda; 4 Teslimat Şubesinde > teslimat şubesinde; 5 Kurye Dağıtımda > dağıtımda.

6 Teslim Edildi > yalnız doğru gidiş gönderisi ve güncel doğrulanmış hareketle teslim edildi.

7 MGT Teslim Edildi > TEYİT BEKLİYOR. PDF örneğinde aynı kod “Kargo Devir” olarak kullanılıyor. Otomatik teslim/kapama yapılmaz; ham durum ve inceleme gereği gösterilir.

8 Yönlendirme Sürecinde > yönlendirmede; 9 İade Sürecinde > iade sürecinde.

10 İade Gönderi Hazırlanıyor > iade hazırlığı; 11 İade Transfer Merkezinde > iade yolda; 12 İade Teslim Edildi > iade teslim alındı, müşteriye teslim veya para iadesi değildir.

13 İade Gönderi Yolda > iade yolda; 14 İade Teslimat Şubesinde > iade şubesinde; 15 İade Kurye Dağıtımda > iade dağıtımda; 16 İade Yönlendirme Sürecinde > iade yönlendirmede.

Bilinmeyen kod: bilinmeyen/inceleme, teslim edildi değil. Üst KargonunDurumuSayi sayısal, hareket içindeki KargoHareketKargonunDurumuSayi string olabilir; açık parse edilir. Eski/gecikmiş hareket güncel durumu geri düşürmez. İade belgesi gidiş teslimini silmez. Devir/iade nedeni ve hareket açıklamaları normalleştirilmiş durumdan ayrı tutulur.

## 10 | Alt işler, bağımlılıklar ve kapanış

KRG-SUR-01.1 Sözleşme teyidi: doğru oluşturma metodu, alan türleri, durum 7, hesap yetkisi, kota, COD, etiket, çoklu paket ve iptal teyitlerini yazılı kaydet. Bağımlılık: sağlayıcı. Kapanış: sürümlenmiş onaylı sözleşme.

01.2 Ortam ve güvenlik: secret kurulumu, test/canlı ayrımı, gerçek egress IP ve whitelist, log redaksiyonu. Kapanış: gizli veri sızmadan izinli test bağlantısı; canlı kapalı.

01.3 Model/haritalama: adres kopyası, paket, kanal, ödeme sorumluluğu, ref ve migration. Bağımlılık: işletme paket ve faturalama politikası. Kapanış: tüm zorunlu alanlar doğru kaynaktan, eksikler açıkça engelleniyor.

01.4 İstemci ve oluşturma: typed HttpClient, tel sözleşmesi, katı yanıt, yetki ve kalıcı idempotency. Kapanış: çift istek/çökme/ağ kopması izole senaryoları.

01.5 Etiket: Code128 ve PDF, yetkili indirme, tekrar baskı. Bağımlılık: onaylı şablon/yazıcı. Kapanış: çözümleme + gerçek okuyucu/şube kabulü.

01.6 Takip: çoklu belge, durum/tarih/ID, dayanıklı işçi, tek seferlik bildirim. Kapanış: boş, bozuk, eski ve iade hareketleri doğru ayrılıyor.

01.7 Admin/web/Flutter: admin oluşturma/etiket/takip ve müşteri salt okunur durumları; hata/yüklenme/boş/yetki. Kapanış: yetkili ve yetkisiz akışlar, mobil/web regresyonları.

01.8 Doğrulama ve devreye alma: fixture testleri > sağlayıcı sandbox > fiziksel test/etiket > kontrollü tek canlı pilot > operasyon kabulü. Canlı pilot gerçek veri/yan etki doğuracağı için ayrıca yetkili yürütülür; bu belge pilotu başlatmaz.

Faz eşlemesi: Faz03 gizli ayar/veri/işçi; Faz05 TIC-08 ana task ve ADM-05 sipariş operasyonu; Faz09 pazaryeri eşlemesi (sonraki kapı); Faz11 web/Android/iOS kabulü. Ücret/tarife, 23 ürün içeriği ve SKU117 fiyatı bu taskla kapanmaz.

## 11 | Test matrisi ve açık teyit listesi

İzole testler: doğru JSON alan adları; her ortamda doğru hesap/host; parola body/query/log redaksiyonu; 401/yetki; eksik adres/paket ve sıfırla doldurmama; kendi mağaza/market ayrımı; COD kapalı/açık koşulları; Tamam/Kayıt Edildi/hata/bozuk yanıt; 200 içinde hata; kayıt sonrası kısmi hata.

Dayanıklılık: çift tıklama, eşzamanlı işçi, restart, POST zaman aşımı, tekrarda aynı ref, takip boşken uzlaştırma, bağlantı hatasında veri koruma. Etiket yeniden indirmede POST yok. Gerçek müşteri, sipariş, katalog ve sağlayıcı kaydı test verisi olarak değiştirilmez.

Takip: IsError, boş/çoklu Gonderiler, 19 haneli ID, offsetsiz tarih, eski hareket, bilinmeyen kod, 7 çelişkisi, 12 iade teslimi, teslim bildiriminin tekliği. Güvenlik: başka müşterinin sipariş/etiketine erişim, ham URL ve parola sızıntısı, güvensiz takip linki.

Doğrulama teslimi: .NET odaklı entegrasyon testleri, API sözleşme kontrolleri; dokunulan web/admin lint-TypeScript-build; Flutter değişirse analyze/test ve Android/iOS ayrı kabul. Otomasyon fiziksel barkod okuyucu veya gerçek cihaz kabulü yerine geçmez.

Sağlayıcıya sorulacaklar: (1) PDF mi Postman mı güncel oluşturma sözleşmesi? (2) İki kabul metni ve kısmi kayıt/tekrar uzlaştırma nasıl çalışır? (3) Kodu 7'nin kesin anlamı? (4) Etiket örneği, cari barkodu, ölçü/DPI/paket düzeni? (5) COD tel türü/formatı ve kapalı alanlar? (6) Dosya/Mi ölçü kuralları? (7) Marketplace isimleri, İdefix ve ödeme borçlandırma alanları? (8) Çoklu/parçalı gönderi ref kuralı? (9) Kota, saat dilimi, terminal/iade takip süresi? (10) Hesap yazma/test yetkileri ve egress whitelist? (11) İptal/geri çekme yöntemlerinin güvenli sözleşmesi?

İşletmeden gerekenler: gerçek paket desi/kg ve paketleme şeması; ücret sorumluluğu/sözleşme; gönderici adres/iletişim ve etiket yazıcısı; gönderi oluşturma için gerçek ödeme/operasyon uygunluk şartı; irsaliye/COD kararı. Açık kalanlar uydurularak doldurulmayacak.

## 12 | Uygulama promptu - kapsam ve hazırlık

Masaüstündeki Xinobi reposunda KRG-SUR-01 Sürat Kargo entegrasyonunu uygula. Bu metin ileride çalıştırılacak prompttur; plan belgesi üretirken uygulanmaz.

Önce AGENTS.md, Faz00/03/05/09/11, güncel task kayıtları ve docs/tasks/surat-kargo-integration-plan-2026-11-03.md dosyasını oku. Git durumunu kontrol et, mevcut kullanıcı değişikliklerini koru. Sipariş lifecycle'ını, manuel shipment ucunu, adres sözleşmesini, admin Orders/Integrations ekranlarını ve web/Flutter takip okumasını incele. Yeni model ve uçları mevcut davranışları koruyarak tasarla.

Kendi mağazamızın normal çıkışını ilk kabul hedefi yap. Ürün üretim/baskı operasyonu, hosting, deploy, ödeme sağlayıcısı ve APK kapsamını genişletme. Marketplace/COD/iade oluşturmayı teyitli sözleşme olmadan açma. ZIP'te olmayan tarife sorgusunu varmış gibi uygulama; checkout ücretini sahte hesaplama.

PDF ve e-posta bulgularını esas al: GonderiyiKargoyaGonder POST JSON ve KargoTakipHareketDetayi POST query sözleşmelerini ayrı uygula. Postman /GonderiOlustur isteğini yerine koyma. Alan adları/türleri, COD formatı, durum 7 ve etiket belirsizliklerini kayıt altına al; teyitsiz alanları canlıya açma.

Sunucu typed istemcisi, ortam bazlı gizli ayarlar, kapalı canlı bayrağı ve secret redaksiyonu oluştur. Gerçek kullanıcı/parolayı kaynak, prompt, çıktı, log veya istemciye yazma. Seçilmiş ortamın hesabını/carisini kullan. Gerçek egress IP whitelist gereksinimini belgeleyip yetkili kurulumla doğrula; bu bilgi yerine tarayıcı IP'sini kullanma.

Paket ve alıcı bilgisini gerçek sipariş kopyasından doğrula. AliciKodu'na gönderici cari yazma. Adet paket sayısıdır; desi/kg eksikse engelle. OdemeTipi, ürün ödeme şekli ve COD'yi ayrı tut. Kendi platformunda Pazaryerimi=0 ve EntegrasyonFirmasi boş string; markette sipariş referansını aynen koru.

## 13 | Uygulama promptu - teslim ve kabul

Gönderi, paket, deneme ve hareketleri kalıcı tut. Aynı gönderinin referansını ilk denemeden önce oluştur ve sabitle; veritabanı benzersizliği, idempotency ve işçi kilidiyle çift kaydı önle. Tamam/Kayıt Edildi yalnız teyitli tam başarı değerleridir. Kayıt alındı durumunda siparişi kargolandı yapma, shipped bildirimi gönderme. Timeout ve kısmi kayıtta reconciliation_required kullan; boş takip yeni gönderi açma izni değildir.

Admin siparişinde oluşturma, kayıt durumu, etiket ve takip göster. Code128 içeriği tam OzelKargoTakipNo olsun; ortamın cari kodu ve okunur referansını kullan. Şablonu sağlayıcı onayıyla bitir. Yeniden indirme yeni gönderi yaratmasın. Yetkileri sunucuda uygula; gerçek sıfır, eksik veri ve servis hatasını ayır. Hatalı kayıtta form değerlerini koru.

Takipte tüm belge/parça/iade kayıtlarını koru. Büyük sağlayıcı kimliklerini string işle. Ham kod/metin/tarihi sakla; saat dilimini uydurma. Kod 7 otomatik teslim olmasın; kod 12 müşteriye teslim veya refund olmasın. Eski olay yeni durumu bozmasın. Kota onaylı polling, backoff, lease ve tek seferlik bildirim uygula. Web/Flutter yalnız yetkili kendi siparişinin güvenli DTO'sunu okusun.

İzole fixture ile oluşturma, hata, boş, tekrar, timeout, ID/tarih, etiket çözümü, yetki ve iade testlerini çalıştır. Gerçek hesap/sipariş/sağlayıcı verisini test amacıyla değiştirme. Sandbox ve özellikle canlı yan etkili testleri ayrı yetki ve kayıtla yürüt; onaylı anahtar kullanmadan gerçek istek gönderme. Sunucu testleri ve dokunulan uygulama kontrollerini tamamla; Android/iOS ve fiziksel barkod kabulünü ayrı açık/başarılı kaydet.

Sonuçları test/INDEX.md, tarihli test raporu ve ilgili fazlara işle. Sağlayıcı teyidi, fiziksel test, gerçek cihaz veya canlı pilot yapılmadıysa açık yaz; entegrasyonu tamamlandı gösterme. Doğrulanmış değişiklikleri repo iş akışına uygun odaklı commit/push et; deploy yapma. Son yanıtta uygulananları, testleri ve kalan bağımlılıkları kısa bildir.

## 14 | Kaynak izi ve bu çalışmanın sonucu

Gönderi PDF SHA-256: ead4824cecd9eb06942799ece51a1ca47d92a6db238194b87c2047012d62f650

Takip PDF SHA-256: 1ebbffee07d585b630b5a84e78a14c28699e5e8660edc15468de0dca54186de9

Postman SHA-256: ca4c440c9689d1eeaf64a589845d5b3a67461facee00ced80ff051186b50e277

Sayfa başvuruları: gönderi s.3 uçlar, s.4 kök yapı, s.5-7 alanlar, s.8 örnek, s.9 yanıt/hatalar; takip s.2 istek, s.3-6 örnek ve alanlar, s.7 durumlar, s.8 hareket açıklamaları. E-posta, gerçek hesap yetkisi, iki kabul metni, Code128 etiket ve kanal ayrımı için ek kaynaktır. PDF'lerdeki örnek kişi/hesap verisi kullanılmadı.

Bu teslimde: kaynaklar incelendi; task, alt işler, alanların yerleri, teknik kararlar, açık teyitler ve uygulama promptu hazırlandı. Uygulama geliştirilmedi, konfigürasyon/secret girilmedi, IP bildirilmedi, sağlayıcıya çağrı yapılmadı, etiket veya gerçek gönderi oluşturulmadı. Faz kayıtları plan durumuyla güncellendi.

Canlıya hazır kabulü: sözleşme çelişkileri kapalı, sandbox doğrulaması başarılı, gerçek okuyucuda etiket onaylı, IP ve hesap izinleri tamam, uygunluk/ücret politikası yazılı, kontrollü pilot ve operasyon kabulü kayıtlı. Bu koşullar henüz sağlanmış sayılmaz.
