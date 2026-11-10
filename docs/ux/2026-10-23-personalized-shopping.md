# Kişiselleştirilmiş alışveriş akışı

> **10.11.2026 — Tarihsel / uyumluluk kaydı.** Aşağıdaki eski adımlar yeni tek kaynak akışının talimatı veya kabul kanıtı değildir. Güncel giriş: [tek kaynak kişiselleştirme](../runbooks/single-source-personalization.md). Fotoğraf üretimi, renkler arası hizalama ve çoklu fotoğrafa maske uygulama yeni akışta yoktur. Eski kayıtlar/dosyalar ve test kanıtları korunur; kaldırılmış yazma uçları kullanılmaz.


İlk tasarım, AI ve sepet/favorilerden dönüş aynı yerleşim stüdyosunu kullanır (geri alma/yineleme, yakınlaştırma, baskı alanı, yerleşim kontrolleri). Ürün/renk görseli güncellenirken doğru önizleme çizilmeden kaydetme ve sepete ekleme açılmaz.

Görsel, desen ve AI sonuçları aynı hesap tasarımı + sürümlü ürün/renk yerleşimi üzerinden sepete ve favorilere gider. Tasarım dosyası tek başına bir sepet önizlemesi değildir. Önizlemedeki konum, ölçek, dönüş, kavis, desen/görsel modu ve yüzey sürümü kayıtla birlikte taşınır.

- Kendi görsel/desen akışının yerleşim adımında ve gerçek AI önizlemesinde Sepete ekle, Favorilere ekle ve Kaydet bulunur. AI önizlemesi aktif renk ve yerleşimi kaydeder; ilk üretilen rengin varsayımıyla ekleme yapılmaz.
- Web giriş penceresi editörün üzerinde açılır; yerel dosya ve yerleşim navigasyonla kaybolmaz. Mobil giriş uygulamanın hesabında yapılır ve kullanıcı aynı WebView tasarımına geri döner.
- Sepet/favori görseli ham desen yerine ürünle birleşik JPEG önizlemesidir. Her yerleşim revizyonunun hesabına özel, ayrı bir küçük önizleme dosyası vardır. Eski kayıtlarda dosya yoksa mevcut renderer/ham tasarım yedeği kullanılır. Bu görseller üretim veya baskı onayı değildir.
- Sepet görseli tam satır anahtarı ve kayıtlı revizyonla editöre gider. Düzenlemeyi kaydetmek yalnız seçili satırı değiştirir, adet ve diğer satırlar korunur. Sepet düzenlemesi yeni yerleşim kimliği üretir; daha sonra değişmiş bir favori revizyonuyla çatışmaz. İptal veya kaldırılmış satır eski sepeti yeniden oluşturmaz.
- Favori görseli aynı ürün, renk ve kayıtlı yerleşimi editörde açar. Favoriyi düzenlemek sepete daha önce eklenmiş ayrı revizyonu değiştirmez.
- Yeniden açılan editörde onaylı renkler değiştirilebilir. “Değiştir” aynı görsel/desen yükleme adımını açar; yeni dosya, tür seçimi ve önizleme kontrolleri ilk tasarımla ortaktır. Yeni dosya yalnız kaydederken yüklenir. Favori düzenlemesi aynı yerleşim kimliğinin yeni sürümünü oluşturur; renk ve kaynak değişse de yenileme son kaydı açar. Sepet düzenlemesi yalnız seçili satırın rengini ve tasarımını değiştirir; yeni rengin toplam stok kontrolünde hata olursa eski satır korunur.
- Eski kaynak silindiğinde yeni kaynağı kullanan güncel favori korunur. Güncel kaynak silindiğinde yerleşimin bütün eski sürümleri kaldırılır; eski favori yeniden görünmez. Sipariş snapshot’ları bağımsızdır.

## Mobil bağlantısı

Mobil XINOBI U ve kayıtlı tasarımları aynı web renderer/editor üzerinden açar. `XinobiCommerce` JavaScript kanalı yalnız aynı yapılandırılmış web origin'inde kullanılır. Hesap istekleri native uygulamada bearer oturumuyla yürütülür ve süresi dolduğunda yenilenir; access/refresh token, URL'ye, JavaScript'e veya WebView storage'a aktarılmaz. İzin verilen hesap yolları tasarımlar ve yerleşimlerle sınırlıdır. Harici URL, yönetici işlemi, parola veya hesap silme proxy'lenmez.

WebView sepeti uygulamanın cihaz sepetini okuyup aynı revizyon kimlikleriyle günceller. Eski veya eşzamanlı değişmiş sepetin üstüne sessizce yazılmaz. Native sepet ve favori küçük görselleri korumalı API'den alınır; görseller düzenlemek için aynı editöre döner. Sipariş isteğine configurationId/configurationRevision eklenir, böylece sunucu yerleşimi yeniden doğrular.

Hesap tasarımları ve tasarım favorileri sunucudadır ve web/mobil tarafından ortaktır. Sepet listesinin farklı cihazlar arasında otomatik eşitlenmesi bu değişikliğin kapsamı değildir; mevcut cihaz sepeti davranışı korunur.

Özel görsel okumaları oturum süresi dolduğunda yeniden denenir. Web tarafında eşzamanlı küçük görseller tek cookie yenilemesini paylaşır; mobilde bearer yenilemesi native oturum yöneticisindedir. Uzun ürün adlarından üretilen varsayılan tasarım adları sepet biçimine sığdırılır; eski uzun adlı tasarımlar da yalnız gösterim adı kısaltılarak sepete eklenir. Geçersiz satır sessizce elenip başarı mesajı gösterilmez.

## API ve yayınlama

`PUT/GET /api/v1/me/design-configurations/{id}/revisions/{revision}/preview`: sahibi doğrulanan revizyonun küçük JPEG görseli. Başkasının kaydı ve bulunamayan revizyon 404; oturumsuz istek 401. Tasarım/hesap silindiğinde küçük görseller de silinir. Ham sipariş görseli ve siparişin yerleşim snapshot'ı ayrı kalır.

Güncel API ve web birlikte yayınlanmalı; mobil uygulama da yeni köprü koduyla yeniden derlenmelidir. `API_BASE_URL` ve `XINOBI_WEB_PREVIEW_URL` aynı katalog/hesap ortamına yönelmelidir. Paketlenmiş ürün yüzeyi kullanılıyorsa API tarafında `ProductSurfaces:PublishedRoot` dosyaları mevcut olmalıdır. Git push canlı yayın veya hosting ayarı değişikliği değildir.

## Kontroller

- Web uçtan uca kontrolleri: tam koşuda 176 başarılı, ortam verisine bağlı 1 atlama; güncellenen yükleme açıklamasının eski metin beklentisi düzeltildikten sonra ilgili 26 test yeniden başarılı. Böylece 177 farklı senaryo doğrulandı. Görsel/desen/AI ekleme, ürünle birleşik önizleme, sepet/favoriden yeniden açma, revizyonlar, adet/diğer satırların korunması, girişte dosyanın kalması, uzun tasarım adı, tek cookie yenilemesi, gömülü uygulama sepeti ve 390/1440 px düzenleme ekranları kapsanır.
- Tam API testleri: 477 başarılı, SQL/özel ortam gerektiren 29 atlama. Yeni küçük önizleme için sahiplik, oturumsuz erişim, revizyon ayrımı, silme temizliği ve eski sipariş snapshot'ının korunması doğrulanır. Uzun varsayılan ad ve Unicode sınırı testlidir.
- Flutter: 67 test başarılı; `flutter analyze --no-pub` temiz. Native oturum yenilemesi, WebView'e token verilmemesi, izin verilmeyen proxy yolu, sepet revizyon/yerleşim/adet round-trip'i, eşzamanlı değişiklik reddi ve editör bağlantısı kapsanır.
- `pnpm lint` ve web `tsc --noEmit` başarılı; mevcut admin uyarıları hata değildir. Üretilen sözleşmeler 95 operasyon / 122 Dart part dosyası kontrolünden geçti.
- Yerel standart başlatıcıyla web (3000), admin (5173), API (5003) yenilendi. Canlı API/web yayını veya cihazda yeni APK/iOS kurulumu yapılmadı. Fiziksel cihaz testi bu oturumda yapılmadı.

## Yeniden düzenleme doğrulaması

Renk + görsel/desen değiştirme, iptal, yeni rengin yetersiz stoku, aynı favorinin yeni kaynakla güncellenmesi ve sayfa yenilemesi tarayıcı testleriyle doğrulanır. API testi kaynak/renk sürümlerini, eski revizyonun değişmezliğini, sahipliği ve kaynak silme temizliğini; Flutter köprü testi yeni kaynak/rengin adet ve diğer satırlarla birlikte kalıcı yazılmasını kapsar.
