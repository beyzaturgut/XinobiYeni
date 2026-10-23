# XINOBI U - AI ve mobil kişiselleştirme akışı
## Kavramsal analiz, teknik değerlendirme ve uygulama promptları

- Tarih: 23 Ekim 2026
- Kaynak: `Not 23 Eki 2026.pdf`, 3 sayfa.
- İncelenen kaynak dosya: `/Users/beyzaturgut/Downloads/Not 23 Eki 2026.pdf`.
- Kod inceleme referansı: `b5518a4`; bulgular bu çalışma ağacındaki kaynak kodun okunmasına dayanır.
- Bu belgenin kapsamı analiz ve uygulama planıdır. Aşağıdaki promptlar bu çalışma sırasında uygulanmadı; uygulama kodu değiştirilmedi. PDF içindeki talepler uygulama girdisi olarak çözümlendi, doğrudan çalıştırılacak talimat kabul edilmedi.
- APK/iOS sürümü, canlı web ve canlı API sürümü bu incelemede doğrulanmadı. Kaynak kodda bulunmak, kullanıcının cihazında veya canlıda çalıştığının kanıtı değildir. Bu çalışma için testler yeniden çalıştırılmadı.

## 1. Yönetici değerlendirmesi

Temel sorun AI üretimi değil; farklı kaynaklardan gelen tasarımların aynı ürün bağlamı, önizleme, hesap ve alışveriş akışında birleşmemesi. Kullanıcı ürünü bir kez seçtikten sonra AI, kendi görseli ve desen arasında ilerlerken aynı ürün üzerinde çalışmaya devam etmeli. Ürün önizlemesi, renk ve yerleşim kararlarının verildiği ve sepete/favorilere eklemenin tamamlandığı ortak ekran olmalı.

PDF'nin 2. ve 4. maddeleri çelişmiyor: ham AI deseninin gösterildiği sonuç ekranındaki sepete ekleme kaldırılmalı; tasarımın ürün üzerine yerleştirildiği önizleme ekranındaki sepete/favorilere ekleme korunmalı ve tamamlanmalı. Bu ayrım uygulanmazsa yanlış ekrandaki buton kaldırılabilir.

Mevcut projede ortak web yerleşim stüdyosu, korumalı tasarım kayıtları, sürümlü yerleşimler, sepet/favoriden yeniden düzenleme ve native hesap/sepet köprüsü zaten bulunuyor. Yeni bir kişiselleştirme motoru yazmak yerine bu altyapının tüm giriş noktalarında doğru kullanılmasını sağlamak gerekir. PDF'deki ekran görüntülerinin bir bölümü güncel kaynak koddan farklı; ilk fazın işi çalışan sürümü ve aktif rotaları eşleştirmektir.

## 2. PDF taleplerinin ayrıştırılması

PDF'deki metin çıkarımında 3. ve 5. maddeler tekrar görünüyor; görsel sayfa incelemesiyle yedi ayrı talep olarak değerlendirildi.

| ID | Kaynak | Talep | Hedef davranış |
| --- | --- | --- | --- |
| R1 | Sayfa 1, madde 1 ve önce/sonra görselleri | Beş tercihin özeti görsel olarak iyileştirilsin. | Dağınık metin yerine tek, açık zeminli, köşeleri yumuşatılmış özet kartı; satır ayraçları, küçük kategori etiketi ve belirgin yanıt metni. Alt eylemler erişilebilir kalır. |
| R2 | Sayfa 1, madde 2 | AI sonrası ürün önizlemesinde sepet/favori akışı olsun. | Aktif ürün, renk, kaynak ve yerleşimle kayıt; doğru tasarlanmış küçük önizleme ve yeniden düzenleme. |
| R3 | Sayfa 2, madde 3 | “Görsel yükle” altında tekrar “Görsel seç” görünmesin. | Aynı işi yapan tek görünür yükleme kontrolü; dosya hazırlama, hata, değiştirme ve kaldırma davranışları korunur. |
| R4 | Sayfa 2, madde 4 | Üretilen ham desenin altındaki sepete ekleme kaldırılsın. | Sonuç ekranı önizlemeye yönlendirir; ticari işlem ürün üzerinde yerleşim sonrasında yapılır. |
| R5 | Sayfa 2-3, madde 5 | “Kendi görselimle dene” mevcut ürünle devam etsin. | Ürün ve renk bağlamı taşınır; kullanıcıdan yeniden ürün seçmesi istenmez. Galeri/tasarımlarım seçimleri bağlamı kaybettirmez. |
| R6 | Sayfa 3, madde 6 | Mobil kişiselleştirme uygulamanın parçası gibi hissettirsin. | Tek uygulama üst çubuğu, tutarlı tipografi/boşluk/butonlar, güvenli alanlar, doğru geri davranışı; web sitesi menüsü/altbilgisi ve tekrar eden tarayıcı öğeleri görünmez. |
| R7 | Sayfa 3, madde 7 | Giriş kullanıcıyı ana sayfaya göndermesin; tasarım kaldığı yerden sürsün. | Giriş açılır, mevcut editör ve dosyası korunur; başarılı/iptal/hata durumları aynı tasarıma döner. |

### Görsel yorumun sınırı

R1'de istenen kart yapısı ekran görüntüsünden nettir. Örnek yanıtların ve eksen sıralamasının değişmesi, anket sözleşmesinin veya yanıtların değiştirilmesi için yeterli gerekçe değildir. Sunucudan gelen sorular ve seçilen yanıtlar korunmalı; düzen ve hiyerarşi iyileştirilmelidir. Görsellerdeki saat, pil ve Android sistem gezinme çubuğu uygulama bileşeni olarak yeniden çizilmemelidir.

## 3. Kavramsal model ve akış kuralları

### 3.1 Birbirinden ayrılması gereken kayıtlar

| Kavram | Anlamı | Tek başına neyi sağlamaz? |
| --- | --- | --- |
| Ürün ve varyant | Seçili ürün ve rengi; kişiselleştirilebilir yüzeyle ilişkilidir. | Ham AI deseninden türetilemez; kaynak oturum/katalog üzerinden doğrulanır. |
| AI oturumu | Sorular, yanıtlar, üretim durumu ve üretilen görsel. | Kalıcı hesap tasarımı veya tamamlanmış sepet satırı değildir. |
| Tasarım kaynağı | AI görseli, yüklenen görsel veya desen dosyası. | Ürün üzerindeki konumu ve birleşik sepet önizlemesini tek başına içermez. |
| Yerleşim | Konum, ölçek, dönüş, kavis, mod, yüzey sürümü ve mevcut gövde ayarları. | Yalnız ham görsel URL'siyle yeniden üretilemez. |
| Yerleşim revizyonu | Hesaba ait, belirli ürün/rengi ve kaynak görseli bağlayan sürüm. | Başka bir sepet satırının revizyonunu sessizce değiştirmemelidir. |
| Birleşik önizleme | Kaynak + ürün + maske + varsa marka katmanı ile oluşturulan küçük görsel. | Baskı onayı, ödeme veya stok rezervasyonu değildir. |
| Editör taslağı | Kaydedilmemiş dosya ve düzenleme durumu. | Giriş için ekrandan ayrılınca kendiliğinden kalıcı hale gelmez. |

### 3.2 Hedef kullanıcı yolculuğu

```text
Ürün / renk seçimi
  -> Yöntem seçimi
     -> AI: anket -> tercih kartı -> üretim -> ham desen sonucu
        -> Üründe önizle
        -> Kendi görselimle dene (aynı ürün/renk)
     -> Kendi görselim / desen: dosya veya uygun kayıt seçimi
  -> Ortak ürün önizlemesi
     -> Renk / görsel / desen / yerleşim düzenleme
     -> Gerekirse giriş (taslak korunur)
     -> Kaydet / Favorilere ekle / Sepete ekle
  -> Sepet veya favori görseline dokunma
     -> Aynı ürün, renk ve kayıtlı yerleşimle ortak editör
```

### 3.3 Değişmez kurallar

1. Ürün bağlamı yöntem değiştirirken kaybolmaz. Renk için onaylı yüzey yoksa açık seçenek/hata gösterilir; başka ürünün maskesi kullanılmaz.
2. Ham AI sonuç ekranından doğrudan sepet yazılmaz. Ürün üzerinde doğrulanmış önizleme ticari eylemlerin yeridir.
3. Yeni renk veya dosya için doğru önizleme hazır olmadan kaydetme/sepete ekleme açılmaz.
4. Görsel/desen değiştirme ve renk seçimi yeniden düzenlemede de çalışır; mevcut yerleşim aktarım kuralları korunur.
5. Giriş için navigasyon taslağı yok etmez. Başarılı giriş tasarımı otomatik satın alma anlamına gelmez; bekleyen eylemin tekrar istenip istenmeyeceği açıkça belirlenir ve çift kayıt önlenir.
6. Sepet düzenleme yalnız hedef satırı değiştirir; adet ve diğer satırlar korunur. Favori düzenleme eski sipariş snapshot'ını veya ayrı sepet revizyonunu değiştirmez.
7. Mobil ve web aynı hesap tasarımı/yerleşim sözleşmesini kullanır. Cihaz sepetlerinin otomatik eşitlenmesi bu PDF'nin talebi değildir.
8. Hesap token'ları URL, WebView JavaScript'i veya tarayıcı depolamasına taşınmaz; mevcut native köprü korunur.

## 4. Mevcut kodla teknik karşılaştırma

Aşağıdaki dosya yolları depo köküne göredir. Bunlar statik inceleme kanıtlarıdır; canlı çalışma sonucu olarak yorumlanmamalıdır.

| Konu | Mevcut kod kanıtı | Değerlendirme / kalan iş |
| --- | --- | --- |
| Tercih özeti | `apps/mobile/lib/features/xinobi_u/questionnaire_screen.dart`, `_Phase.review` | Etiket ve yanıtlar ayrı `Padding/Column` satırlarıyla listeleniyor. PDF'deki tek özet kartı tasarımı için native UI düzenlemesi gerekli. |
| Ham AI sonucu CTA | Aynı dosya, `_ResultState.build`, `_addToCart` | Girişli kullanıcıda “Üründe yerleştir ve sepete ekle” hâlâ var. Etiket değişmiş olsa da R4 açısından sonuç ekranındaki ikinci sepet odaklı yol sadeleştirilmeli. Ham tasarım kaydı ile ürün favorisi ayrılmalı. |
| AI önizleme eylemleri | `apps/web/src/app/urunler/cay-makinesi-101/editor/accepted-surface-editor.tsx`, `designId` dalı; `apps/web/src/components/save-design-button.tsx` | Gerçek AI oturumunda `PlacementStudio` ve kaydet/sepet/favori altyapısı var. “Hiç yok” bulgusu güncel kod için bütünüyle doğru değil. Gerçek session ile çalışan web ve APK sürümleri doğrulanmalı. |
| Dosya kontrolü | `apps/web/src/app/xinobi-u/kendi-gorselin/design-upload-card.tsx`; `apps/web/src/features/product-personalization/local-pattern-preview.tsx` | Ortak yükleme adımı var; eski/demoya ait renderer dalları da mevcut. PDF'deki çift kontrolün hangi aktif dalda oluştuğu yeniden üretilmeli. AI `PlacementStudio` çağrısındaki değiştirme callback'i boş ve değiştirilebilir kaynak etkinleştirilmemiş; bir kontrolü gizlemek tek başına işlevsel yüklemeyi sağlamaz. |
| Ürün bağlamı | `questionnaire_screen.dart` içindeki “Kendi görselimle dene”; `apps/mobile/lib/app/router.dart`; `apps/mobile/lib/core/api_config.dart` | Sonuç butonu ürün/rengi URL'ye taşıyor. `/tasarim-editoru` artık `XinobiMobilePreviewScreen` açıyor; eski `EditorScreen` doğrudan aktif rota değil. `xinobiOwnImageUri` doğru web sorgusunu kuruyor. Eksiklik önce APK/URL/katalog eşleşmesinde aranmalı. |
| Tasarımlarımdan seç | `apps/mobile/lib/features/personalization/editor_screen.dart`, `_chooseSaved` | Eski ekran seçilen tasarımın ürün/rengine geçiyor; ürün bağlamını koruma hedefiyle uyumsuz olabilir. Fakat aktif rota kanıtlanmadan bu dosyayı düzeltmek kullanıcıya etki etmeyebilir. Aktif ortak yükleme adımında hesap tasarımı seçicisinin bulunup bulunmadığı ayrıca doğrulanmalı; galeri ve hesap seçimi tek bağlama bağlanmalı. |
| Mobil görünüm | `mobile_preview_screen.dart`; `apps/web/src/lib/native-commerce.ts`; `apps/web/src/app/globals.css` | Native AppBar, SafeArea, aynı origin kontrolü, native dosya seçici ve `data-embedded` stilleri mevcut. “Web hissi” için sıfırdan native renderer gerekmez; gömülü sayfa dallarının tutarlılığı ve cihaz davranışı incelenmeli. |
| Giriş ve devam | `apps/web/src/components/design-account-access.tsx`; `mobile_preview_screen.dart`, `login` mesajı | Ortak editörde web modalı / native hesabı push edip geri dönme mevcut. Buna karşılık AI sonuç ekranındaki giriş `context.go('/hesap')` kullanıyor. PDF'deki durumun aktif rotası doğrulanıp kalan kaçış noktaları düzeltilmeli. |
| Yeniden düzenleme | `apps/web/src/app/hesap/tasarimlarim/onizleme/saved-design-preview.tsx`; `apps/web/src/lib/cart.ts` | Renk ve yeni dosyayla düzenleme altyapısı mevcut. Yeni fazlar bunu geriletmemeli; yeniden ayrı/kısıtlı editör yazılmamalı. |
| Kalıcı kayıt | `services/api/Designs/DesignConfiguration.cs`; `SavedDesignStore.cs` | Kaynak ve sürümlü yerleşim, korumalı küçük önizleme ve sahiplik kontrolleri mevcut. Yeni sepet/favori sistemi veya ikinci API sözleşmesi gerekmiyor. |

### 4.1 Önerilen teknik yaklaşım

- Aktif yol haritasını çıkar: native anket/sonuç -> WebView rotası -> gerçek AI oturumu -> ortak stüdyo -> hesap köprüsü -> mevcut API -> native/web sepet.
- Taslak sahibi editör yaşam döngüsü olsun. Render edilen ürün, seçili renk, kaynak dosya ve yerleşim farklı alt bileşenlerde birbirinden kopuk tutulmasın.
- Ortak `PlacementStudio`, yükleme bileşenleri ve mevcut renderer genişletilsin; görsel davranışı farklı ikinci bir motor oluşturulmasın.
- URL ürün/renk/session/configuration kimliklerini taşır; dosya byte'larını veya token'ları taşımaz. Ürün ve oturum eşleşmesi sunucudan doğrulanır.
- Yeni kaynak seçiminde semantik açık olsun: kendi görsel/desen yöntemine geçiş ile AI desenine ek görsel yerleştirmek aynı işlem değildir. PDF bu ayrıntıyı kesinleştirmiyor. Mevcut AI taban desen + ek görsel davranışı kullanılıyorsa korunmalı; sessizce tüm deseni değiştirmeye dönüştürülmemeli.
- Ürün bağlamı korunarak tasarımlarımdan seçim gerekiyorsa mevcut ürünle uyumlu kayıtlar gösterilsin. Başka ürünün tasarım kaydının mevcut ürüne doğrudan bağlanması yerine, desteklenecekse sahipliği doğrulanmış ayrı kaynak kopyalama kararı gereklidir; bu PDF için varsayılan kapsam değildir.
- Giriş sırasında WebView/editör yeniden yaratılmasın. Uygulama işletim sistemi tarafından kapatılırsa taslak kurtarma ayrı bir yetenektir; bellek içi korunmayla tamamlanmış kabul edilmesin.
- Aynı native AppBar + gömülü içerik sınırı tüm ilgili rotalarda çalışsın. `mobile=1` tek başına yetkilendirme veya native köprü varlığı kanıtı sayılmasın.

### 4.2 Öncelikler ve riskler

| Öncelik | Risk | Önlem |
| --- | --- | --- |
| P0 | Giriş/navigasyonda tasarım kaybı | Editörü koruyan giriş, iptal/hata/başarı testleri; güvenli dönüş. |
| P0 | Yanlış ürün/rengin kaydı veya yanlış sepet görseli | Tek bağlam, yüzey doğrulaması, birleşik önizleme, tam satır/revizyon kimliği. |
| P1 | Ham sonuç ekranından hatalı sepet yolu | Ticari CTA yalnız ürün yerleşiminde; sonuçta tek önizleme yönü. |
| P1 | Kaynakta düzelmiş işin eski APK/web ile bozuk görünmesi | Commit, web/API ve uygulama build eşleştirmesi; hedef ortam testi. |
| P1 | Görünürde tek, işlevde çalışmayan dosya kontrolü | Seç/değiştir/kaldır/hazırlama/iptal ve AI katman davranışını birlikte test et. |
| P2 | Mobilde yinelenen chrome, alt eylem çakışması | Native üst çubuk, gömülü stiller, güvenli alan ve sistem geri kontrolleri. |
| P2 | Özet kartında okunabilirlik | Uzun yanıt, büyük yazı, dar ekran, ekran okuyucu sırası. |

## 5. Faz planı

Faz numaraları uygulama sırasını, öncelikler iş riskini gösterir. Fazlar arası geçiş aşağıdaki kabul koşullarıyla yapılmalı; doğrulanmadan tamamlandı işaretlenmemeli.

| Faz | İş | Bağımlılık | Somut çıktı |
| --- | --- | --- | --- |
| F0 | Aktif rota ve sürüm denetimi | Yok | R1-R7 durum matrisi ve tekrar üretim kaydı. |
| F1 | Native tercih özeti kartı | F0 | PDF hedefiyle uyumlu, erişilebilir özet. |
| F2 | AI sonuç ekranını sadeleştirme | F0 | Ham sonuçtan tek ürün önizleme yönü; sepet CTA'sı kaldırılmış. |
| F3 | Ürün bağlamı ve kaynak seçimi | F2 | Aynı ürün/rengi koruyan galeri/tasarımlarım akışı. |
| F4 | Ortak önizleme ve tek yükleme kontrolü | F3 | AI/görsel/desende işlevsel yükleme ve doğru alışveriş eylemleri. |
| F5 | Girişten taslağa dönüş | F4 | Web modal/native girişte kayıpsız devam. |
| F6 | Mobil uygulama bütünlüğü | F3-F5 | Tek chrome, doğru geri ve güvenli alan davranışı. |
| F7 | Regresyon ve yayın doğrulaması | F1-F6 | Test kanıtı, sürüm matrisi, yayınlama kontrol kaydı. |

## 6. Her faz için hazır promptlar

Aşağıdaki ortak bağlamı her prompttan önce kullan. Faz promptları sıralı çalıştırılabilir. Gelecekte çalıştırıldıklarında güncel depo ve talimatları yeniden okumalıdırlar.

### Ortak bağlam promptu

```text
XINOBI deposunda çalışıyorsun. Bu belgedeki PDF taleplerini ve güncel AGENTS.md talimatlarını oku. Aktif çalışma ağacını incele; mevcut değişiklikleri koru. Mevcut ortak web renderer, PlacementStudio, sürümlü tasarım API'si ve native hesap/sepet köprüsünü esas al. Aynı işi yapan ikinci editör, ikinci hesap deposu veya yeni sepet sistemi oluşturma.

AI ham desen sonucu ile ürün üzerinde önizleme farklı ekranlardır. Ham sonuçtan sepet eylemi kalkacak; ürün önizlemesinde kaydet/favori/sepet devam edecek. Ürün, renk, kaynak ve yerleşim bağlamı yöntem/giriş/navigasyon geçişlerinde korunacak. Yeniden açılan tasarımda renk ve görsel/desen değişimi çalışmaya devam edecek.

Kaynak kod bulgusunu canlı/APK çalışma kanıtından ayır. PDF'deki eski ekranı aktif rota sanarak kod değiştirme. Ürün yüzeyi, sahiplik, token gizliliği, sepet adedi ve revizyon güvenliğini koru. Ödeme ve stok rezervasyonu bu işin kapsamı değil. Bu prompt yalnız belirtilen fazı uygulatır; sonraki fazları kendiliğinden başlatma. Değişikliği doğrula, diff'i incele ve depo talimatlarına göre odaklı commit/push yap. Yayın veya APK dağıtımı için ayrıca mevcut yetki ve iş akışını kontrol et.
```

### F0 - Aktif rota ve sürüm denetimi

**Kapsam:** R1-R7'nin güncel karşılığını belirleme; uygulama davranışını değiştirmeme.

```text
F0'ı gerçekleştir. PDF'nin üç sayfasındaki yedi talebi güncel kodla eşleştir. Native questionnaire ready/review, /tasarim-editoru, /xinobi-u/mobil-onizleme, kendi-gorselin ve kayıtlı tasarım rotalarını takip et. Eski EditorScreen ile router'ın açtığı XinobiMobilePreviewScreen'i ayır. Gerçek AI session dalını demo/fallback yüzeyden ayır.

Her R maddesi için: aktif dosya/rota, kaynakta durum, hedef ortamda doğrulama durumu, yeniden üretim adımları, kalan iş ve kanıt yaz. Mevcut web/API commit ve APK/iOS build bilgilerine erişilebiliyorsa eşleştir; erişilemiyorsa bilinmiyor yaz. Token veya gerçek hesap verisi kaydetme. Bu fazda uygulama kodu değiştirme.

Çıktı olarak kalan fazların kapsamını güncelleyen kısa bir rota/sürüm matrisi üret. Bir talep kaynakta zaten karşılanmışsa yeni implementasyon yerine ilgili doğrulama senaryosunu tanımla. Eski APK veya farklı origin ihtimalini kanıtsız kesin neden olarak sunma.
```

**Kabul:** Yedi talep izlenebilir; aktif/legacy yollar ayrılmış; bilinmeyen ortam sürümleri açık.

### F1 - Tercih özeti kartı

**Kapsam:** R1; native anketin review adımı.

```text
F1'i uygula. questionnaire_screen.dart içindeki _Phase.review ekranını PDF sayfa 1'deki hedef görselin yapısına yaklaştır: tek açık zeminli, yumuşak köşeli özet kartı, beş ayrı satır, satır ayraçları, küçük kategori etiketi ve belirgin yanıt. Mevcut XinobiTokens ve tipografi sistemini kullan; web görünümüyle ilgili değişikliği native anket yerine uygulama.

Sunucunun sorularını, seçili yanıt kimliklerini ve sırasını koru; örnek ekranın farklı yanıtlarını sabitleme. Düzenle ve AI ile oluştur eylemleri, busy/error davranışı ve yanıt kilitlenmesi korunmalı. Alt eylemler safe area içinde erişilebilir olsun. Uzun cevaplar, dar ekran ve büyük sistem yazısında taşma olmasın.

Widget testiyle seçili beş cevabın doğruluğunu, düzenlemeye dönüşü ve üretim sırasında çift tetikleme engelini doğrula. Hedef ekrandan görsel kanıt al; işletim sistemi pil/saat/gezinme öğelerini uygulama içinde çizme.
```

**Kabul:** Kart okunaklı; yanıtlar değişmemiş; düzenleme/üretim çalışıyor; dar ekran taşması yok.

### F2 - AI ham sonuç ekranı ve eylem hiyerarşisi

**Kapsam:** R4 ve R2'nin ekran sorumluluğu.

```text
F2'yi uygula. AI ham desen sonucunda sepet odaklı butonu kaldır; “Üründe yerleştir ve sepete ekle” dahil aynı amaca çıkan ikinci sonucu koruma. Sonuç ekranının ana eylemi mevcut oturumla ürün önizlemesini açmak olsun. Ham tasarımı hesabına kaydetme, kendi görselinle devam etme ve yeni anket seçeneklerini anlamlarına göre ikincil düzeyde tut.

Ticari kaydet/favori/sepet eylemlerini ürün üzerinde yerleşim ekranından kaldırma. Kullanılmayan _addToCart gibi sonuç ekranına özel yardımcılar ve yalnız onlara ait importları temizle; kullanılan hesap kaydı kodunu koru. Önizlemeye geçmek yeniden AI üretimi veya gereksiz ikinci hesap tasarımı oluşturmamalı.

Girişli ve misafir sonuç ekranında doğru CTA'ları test et. Aynı ready session ile önizleme açıldığını, session/product/variant bağlamının korunduğunu ve sonuç butonunun sepet yazmadığını doğrula. Temsili dijital önizleme açıklamasını koru.
```

**Kabul:** Ham sonuçta sepet CTA'sı yok; tek önizleme yönü var; yeniden üretim/çift kayıt yok.

### F3 - Ürün bağlamı ve galeri/tasarımlarım seçimi

**Kapsam:** R5.

```text
F3'ü uygula. AI sonucundaki “Kendi görselimle dene” yolunu aktif router, XinobiMobilePreviewScreen ve xinobiOwnImageUri üzerinden uçtan uca takip et. Ürün ve renk kimliğini doğrulanmış AI oturumundan alıp ortak yükleme ekranına taşı. Geçerli bağlam varken ürün seç ekranı veya boş ürün dropdown'ı gösterme.

Aktif yükleme adımında galeri/dosya ve Tasarımlarım kaynaklarını aynı ürün bağlamında sun. Tasarımlarım seçicisi yoksa mevcut hesap listeleme/korumalı görsel erişimini kullanarak ekle; eski ve router tarafından açılmayan EditorScreen'i düzeltmekle yetinme. Varsayılan olarak seçili ürünle uyumlu hesap tasarımlarını sun; başka ürüne ait kayıt veya maske taşınmasın. Uyumsuz kayıtlar ve boş liste açıkça açıklansın. Misafirin yerel dosya seçimi için gereksiz giriş engeli koyma.

Kaynak seçme/iptal etme, hesap kaydı seçme, geçersiz ürün, onaysız renk ve geri dönüşü test et. Katalogda olmayan kimliği ilk ürüne sessizce dönüştürme. Onaysız renkte mevcut güvenli renk seçimi davranışını koru ve kullanıcıya açıkla.
```

**Kabul:** Ürün yeniden sorulmuyor; uygun kaynak seçiliyor; renk/yüzey doğrulaması ve geri davranışı güvenli.

### F4 - AI, görsel ve desen için ortak ürün önizlemesi

**Kapsam:** R2, R3; mevcut yeniden düzenleme güvenceleri.

```text
F4'ü uygula. Gerçek AI session önizlemesinin PlacementStudio ve mevcut SaveDesignButton üzerinden kaydet/favori/sepet eylemlerine ulaştığını doğrula. Kaynakta zaten çalışan davranışı tekrar yazma; eksik aktif dalı tamamla. Doğru önizleme çizilmeden eylemleri etkinleştirme.

AI önizlemesindeki dosya yükleme için tek görünür “Görsel yükle” kontrolü kullan. Altta aynı işi yapan native file input/“Görsel seç” kontrolü görünmesin; erişilebilir gerçek input uygun biçimde bağlanmaya devam etsin. Hazırlama, iptal, hata, dosya değiştirme ve kaldırma davranışlarını koru. Mevcut AI desenine ek görsel katmanı davranışı varsa onu koru; kaynak değiştirmeyle karıştırma. Gerekirse F0 bulgusuna dayanarak katman semantiğini açıkça belgeleyip mevcut renderer'ı genişlet; ikinci renderer yazma.

Aktif renk ve son yerleşimle mevcut tasarım/konfigürasyon API'sine kaydet; korumalı birleşik küçük önizlemeyi kullan. Sepet/favori görseline dokununca aynı renk/yerleşimle düzenleme açılmalı, renk ve yeni görsel/desen seçimi yapılabilmeli. Hedef sepet adedi ve diğer satırlar korunmalı; favori revizyonu ayrı sipariş/sepet kaydını değiştirmemeli.

AI, dosya ve desen için başarılı kayıt, hazırlama hatası, renk değiştirme, maskeye kırpma/marka katmanı ve yeniden açma testlerini çalıştır. Yanlış yüzeyi veya ham deseni ürün önizlemesi diye göstermediğini doğrula.
```

**Kabul:** Tek işlevsel yükleme kontrolü; ortak eylemler; doğru renk/yerleşim ve yeniden düzenleme; mevcut görsel kompozisyonu korunmuş.

### F5 - Giriş sonrası kayıpsız devam

**Kapsam:** R7.

```text
F5'i uygula. Ürün önizlemesinden giriş eylemlerini incele. Webde mevcut DesignAccountAccess modalını, mobilde aynı origin üzerinde çalışan native login köprüsünü kullan. Giriş için ana sayfaya veya taslağı yok eden context.go rotasına geçme. AI sonuç ekranındaki kalan giriş yolunu da bu ilkeye göre düzelt.

Giriş sırasında editör/WebView, yerel dosya object URL'si, ürün/rengi, mod, konum, ölçek, dönüş ve mevcut katman durumu korunmalı. Başarılı giriş aynı editöre dönsün; iptal ve hatalı giriş de taslağı korusun. Girişten sonra otomatik sepet eklemek yerine varsayılan olarak eylemleri aç; mevcut bekleyen eylem tekrarı korunacaksa tek seferlik ve açık testli olsun. Çoklu dokunma çift tasarım veya sepet satırı oluşturmasın.

Native token'ı URL/JS/WebView storage'a verme; mevcut allowlist ve oturum yenilemesini koru. Giriş başarılı, iptal, hata ve süresi dolmuş oturum senaryolarını web ve Flutter köprü testleriyle doğrula. İşletim sistemi uygulamayı tamamen kapatırsa taslak kurtarmanın bu fazda desteklenip desteklenmediğini dürüstçe belirt.
```

**Kabul:** Üç giriş sonucu da aynı taslağa döner; yanlış ana sayfa yönlendirmesi ve çift kayıt yok; token sınırı korunmuş.

### F6 - Mobil uygulama hissi ve gezinme

**Kapsam:** R6; R3/R5/R7'nin cihaz deneyimi.

```text
F6'yı uygula. Sıfırdan native çizim motoru yazmadan ortak editörü uygulamayla bütünleştir. Native üst çubuk tek kalsın; gömülü içerikte site menüsü, web altbilgisi, yinelenen üst başlık ve web sitesine özgü öğeler görünmesin. Bu davranışı gerçek native köprü ve mevcut embedded stil yapısıyla uyumlu kur; mobile sorgusunu güvenlik kanıtı sayma.

XinobiTokens ile uyumlu tipografi, boşluk, buton ve renk hiyerarşisi oluştur. Alt eylemler sistem gezinme alanı/klavye tarafından kapatılmasın; yatay kaydırma ve iki bağımsız scroll alanı oluşmasın. Native dosya seçicide iptal, seçim ve hata çalışsın. Sistem geri ve AppBar geri önce yükleme/önizleme adımlarında doğru ilerlesin, geçmiş yoksa native ekrana dönsün; reload veya yeniden üretim yapmasın.

360/390/430 genişliklerde, büyük yazıda ve klavye açıkken kontrol et. Android gerçek WebView üzerinde dosya seçimi ve geri navigasyonunu doğrula. iOS doğrulama ortamı yoksa bunu açıkça kalan doğrulama olarak yaz; simülasyon veya tarayıcı viewport testini fiziksel cihaz testi diye sunma.
```

**Kabul:** Tek chrome; alt eylemler ulaşılabilir; dosya/geri/giriş geçişleri uygulama içinde tutarlı.

### F7 - Regresyon, sürüm ve yayın doğrulaması

**Kapsam:** R1-R7 bütünlüğü; yeni geliştirme başlatmama.

```text
F7'yi gerçekleştir. R1-R7 için son kanıt tablosu hazırla. Web uçtan uca, Flutter widget/köprü ve değişmişse API sahiplik/revizyon testlerini uygun kapsamda çalıştır. Başarılı, atlanan ve yapılamayan kontrolleri ayrı raporla. Kaynakta mevcut olup bu çalışmada uygulanmayan özellikleri yeni geliştirme gibi sunma.

Test matrisi en az şunları kapsasın: özet kartı; ham AI sonucunda sepet yokluğu; gerçek session önizlemesinde sepet/favori varlığı; tek dosya kontrolü; ürün/renk bağlamı; galeri ve hesap tasarımı seçimi; giriş başarı/iptal/hata; renk ve görsel/desen değiştirme; sepet/favoriden yeniden açma; adet ve diğer kayıtların korunması; aynı origin ve token sınırı; mobil safe area ve sistem geri.

Web/API/APK-iOS build referanslarını ve aynı katalog/hesap ortamına yöneldiklerini kaydet. SQL, depolama, yayınlanmış ürün yüzeyi ve ortam özelliklerini doğrula; yerelde çalışmayı canlı için yeterli sayma. Yayın yetkisi yoksa kaynak değişikliği ve gerekli yayınları somut olarak raporla. “deploy alalım” denirse mevcut depo kuralıyla node tools/package-deploy.mjs kullanarak web ve admin için tek birleşik ZIP üret; kendiliğinden hosting/CI iş akışı değiştirme. Mobil kod değişmişse yeni mobil build gerektiğini belirt.

Diff'i incele; gizli bilgiler, yerel hesap kayıtları, yüklemeler, bağımlılıklar ve build çıktıları commit'e girmesin. Depo talimatına göre odaklı commit ve güvenli push yap. Gerçek ödeme veya stok rezervasyonunu bu fazla tamamlandı ilan etme.
```

**Kabul:** Gereksinim/test/sürüm eşleşmesi mevcut; çözülen ve kalan durumlar kanıtlı; yetkili yayın sınırı açık.

## 7. Asgari kabul testi matrisi

| Senaryo | Beklenen sonuç | Katman |
| --- | --- | --- |
| AI anket özeti, beş uzun yanıt | Tek kart, doğru yanıt, taşma yok; düzenlemeye dönüş çalışıyor. | Flutter widget + görsel kontrol |
| Ready AI sonucu, girişli/misafir | Sonuçta sepet CTA'sı yok; aynı session önizlemeye açılır. | Flutter + rota testi |
| Gerçek AI oturumu önizlemesi | Ürün/rengi doğru; hazır render sonrası kaydet/favori/sepet var. | Web E2E + entegrasyon |
| Dosya seç/değiştir/kaldır/iptal | Tek görünür yükleme eylemi; kaynaklar temizlenir; hata toparlanır. | Web E2E + cihaz seçici |
| AI'dan kendi görseline geçiş | Ürün tekrar seçtirilmez; renk/yüzey doğrulanır. | Flutter URI + Web E2E |
| Tasarımlarımdan kaynak seçimi | Sahiplik ve ürün uyumu; boş/uyumsuz kayıt açık; seçilen kaynak doğru çizilir. | API erişim + Web E2E |
| Giriş başarılı/iptal/hata | Aynı dosya, renk ve yerleşim korunur; ana sayfaya kaçış olmaz. | Web modal + native köprü + cihaz |
| Renk değişimi ve yeniden düzenleme | Doğru yüzey/render; kaydedilen renk ve yerleşim yeniden açılır. | Web E2E |
| Sepet/favori kaydı | Birleşik küçük görsel; tam revizyon; sepet adedi/diğer satırlar korunur. | Web + Flutter + API |
| Yavaş ağ, iki kez dokunma | Çift üretim/kayıt/satır yok; kullanıcıya hata/ilerleme bildirimi var. | Entegrasyon |
| Mobil üst/alt alan ve geri | Tek üst çubuk; eylemler görünür; geri doğru adımı açar. | Gerçek Android/iOS uygunluk kontrolü |
| Farklı ortam/sürüm | Hangi web/API/build'in kullanıldığı belli; eksik yüzey gizlenmez. | Yayın kontrolü |

### Mevcut test başlangıç noktaları

- `apps/mobile/test/xinobi_u_test.dart`
- `apps/mobile/test/native_commerce_bridge_test.dart`
- `apps/mobile/test/account_test.dart`
- `apps/web/tests/e2e/xinobi-result.spec.ts`
- `apps/web/tests/e2e/xinobi-preview-ui.spec.ts`
- `apps/web/tests/e2e/xinobi-preview-composition.spec.ts`
- `apps/web/tests/e2e/design-configuration.spec.ts`
- `apps/web/tests/e2e/own-image-entry.spec.ts`
- `apps/web/tests/e2e/local-pattern-image.spec.ts`
- `tests/Xinobi.Architecture.Tests/SavedDesignTests.cs`

Bunlar kapsamanın başlangıç noktalarıdır; dosyanın varlığı ilgili PDF talebinin bugün test edildiği anlamına gelmez. Fazda değişen davranışın doğrulaması açıkça eklenmelidir.

## 8. Kapsam dışı ve karar sınırları

- Bu belge uygulama planıdır; geliştirmeyi veya canlı yayını başlatmaz.
- Yeni AI sağlayıcısı, yeni prompt üretim modeli veya anket sorularının yeniden yazımı istenmiyor.
- Yeni sepet sunucusu, cihazlar arası sepet eşitleme, gerçek ödeme ve stok rezervasyonu bu taleplerin kapsamında değil.
- WebView'in varlığı tek başına hata değildir. Hedef tutarlı uygulama deneyimi ve mevcut renderer'ın doğru entegrasyonudur.
- Uygulama kapanması/işletim sistemi süreç sonlandırması sonrasında kalıcı taslak kurtarma ayrı karardır. Giriş sırasında editörü korumak bu yeteneği otomatik sağlamaz.
- R3'te AI taban desenine ek görsel yüklemenin tam semantiği görsellerle kesinleşmiyor. Mevcut katman davranışı korunmalı; kaynak değişimi ile overlay arasındaki ürün kararı uygulama öncesi netleştirilmelidir.
- Başka ürüne ait hesap tasarımını mevcut ürüne aktarmak varsayılan olarak açılmaz; ürün uyumu ve sahiplik kuralı korunur.
- Belirsiz canlı/APK durumları doğrulama kalemi olarak kalır; “kod var, dolayısıyla canlıda düzelmiştir” kabulü yapılmaz.
