# Faz01 — İş sahibi karar formu

Durum: Yanıt bekliyor · Son güncelleme: 30.09.2026

Bu form, Faz01'i kapatmak ve sonraki fazların gerçek uygulamasını açmak için Xinobi karar sahiplerince doldurulur. Bilinmeyen bir cevap tahmin edilmez; `henüz karar verilmedi` yazılır ve sorumlu/tarih atanır. Parola, token, müşteri kişisel verisi veya gerçek kart bilgisi eklenmez.

## Yanıtlama formatı

Her karar için:

```text
Seçim/yanıt:
Karar sahibi (ad/rol):
Karar tarihi:
Kanıt veya örnek dosya:
Varsa geçici kural ve son karar tarihi:
```

## D01 — Mevcut operasyon ve veri

1. Eski sistemden taşınacak ürün, müşteri, sipariş, tasarım, medya veya başka veri var mı?
2. Varsa kaynak sistem, yaklaşık kayıt sayısı, dışa aktarım biçimi ve veri sahibi kim?
3. Mevcut alan adı, barındırma, e-posta ve analitik hesaplarının sahibi kim?

Teknik repo kararı verilmiştir: yeni private monorepo kullanılacaktır. Bu bölüm yalnız taşınacak operasyon/veri ve hesap envanterini kapatır.

## D02 — Ürün, fiyat ve stok ana kaydı

1. Ürün, kategori, varyant, SKU/barkod ve görseller ilk olarak nerede oluşturulacak: Xinobi paneli, Mikro veya başka sistem?
2. Liste fiyatı, vergi, kampanya ve pazaryeri fiyatlarını hangi sistem/rol yazacak?
3. Depolar hangileri? Fiziksel stok ve satılabilir stok hangi sistemde ana kayıt olacak?
4. Mikro ile her veri için yön nedir: Mikro → Xinobi, Xinobi → Mikro veya yalnız mutabakat?
5. Çakışmada hangi kaynak kazanır ve kim manuel düzeltme yapabilir?

Karar kanıtı: en az bir maskelenmiş ürün-varyant, fiyat ve iki depo/stok örneği.

## D03 — Sipariş, ödeme, rezervasyon, kargo ve iade

1. Sipariş ne zaman kesinleşir: checkout başlangıcı, başarılı kart ödemesi, havale onayı veya başka an?
2. Kart sağlayıcısı ve havale/EFT doğrulama sorumlusu kim?
3. Stok rezervasyonu hangi ödeme yöntemlerinde kaç dakika/saat tutulur?
4. Eksi stok veya ön sipariş var mı? Depo nasıl seçilir?
5. Kişiselleştirilmiş üründe iptal/iade hangi aşamaya kadar mümkündür?
6. Kısmi sevkiyat, kısmi iptal ve kısmi iade desteklenecek mi?
7. İptal/iade onaylayan roller, süreler ve para iadesi sırası nedir?

Öneri yaşam döngüleri: `data-ownership-and-state-transitions.md`. İş sahibi onayı olmadan bağlayıcı değildir.

## D04 — Baskı ve üretim standardı

1. Hangi ürün/varyantlarda ön, arka veya başka baskı yüzleri var?
2. Her alanın genişlik/yükseklik, güvenli alan ve taşma ölçüsü kaç mm?
3. Minimum DPI, kabul edilen dosya türleri ve renk profili nedir?
4. Kullanılan baskı tekniği, font/görsel lisans kuralı ve maksimum dosya boyutu nedir?
5. Üretime geçmeden önce insan onayı gerekir mi; kim verir?

Karar kanıtı: kaynak tasarım dosyası ile onaylanmış fiziksel baskı örneği.

## D05 — Sağlayıcılar

Ödeme, kargo, e-posta, SMS, WhatsApp/canlı destek ve AI için ayrı ayrı:

1. Sağlayıcı ve hesap sahibi kim?
2. Sandbox/test hesabı var mı?
3. API/webhook yetkileri ve teknik muhatap hazır mı?
4. Kota, maliyet, sözleşme veya IP kısıtı var mı?

Sırlar yalnız onaylı secret store'da tutulur; bu forma yazılmaz.

## D06 — Mikro ve pazaryerleri

1. Mikro ürün/sürüm ve bağlantı yöntemi nedir: API, SDK/COM veya ara katman?
2. Test şirketi ve yetkili teknik kullanıcı mevcut mu?
3. Trendyol, Hepsiburada ve N11 mağaza/API hesap sahipleri kim?
4. Her kanal için ürün, kategori, varyant, fiyat, stok, sipariş, kargo, iptal ve iade yeteneklerinden hangileri kullanılabilir?
5. Test/sandbox yoksa kontrollü canlı test yöntemi ve onaylayan kim?

## D07 — Kurumsal teklif

1. Teklif talebi misafir, bireysel hesap veya kurumsal hesapla mı açılır?
2. Fiyat, vergi, kargo, termin ve geçerliliği kim belirler?
3. Teklif revizyonu ve müşteri kabulü nasıl kanıtlanır?
4. Kabul edilen teklif otomatik mi, operatör onayıyla mı siparişe dönüşür?
5. Ödeme yöntemi ve toplu sipariş durumu nedir?

Talep otomatik ödeme veya sipariş değildir; dönüşüm kuralı açıkça kararlaştırılır.

## D08 — AI kullanım politikası

1. Kullanıcı başına alternatif/üretim limiti ve maliyet tavanı nedir?
2. Yasak içerik, moderasyon ve insan incelemesi kuralları nelerdir?
3. Çıktı düz görsel mi, katmanlı belge mi; hangi düzenleme işlemleri zorunlu?
4. AI satış asistanı hangi onaylı kaynakları kullanır ve ne zaman insana/WhatsApp'a devreder?
5. İstem, çıktı ve konuşmalar ne kadar saklanır?

## D09 — Mobil ve mağaza hesapları

Flutter zorunlu teknoloji olarak onaylanmıştır. Kalan kararlar:

1. Desteklenecek minimum iOS/Android sürümleri ve test cihazları hangileri?
2. Mobil editörde web ile zorunlu işlev eşliği nedir?
3. Push bildirim türleri ve kullanıcı izin/opt-out kuralı nedir?
4. Apple Developer ve Google Play hesap sahipleri/rolleri hazır mı?
5. Bundle ID/application ID ve yayın kanalları nelerdir?

## D10 — Hukuk, saklama ve işletim

1. KVKK, gizlilik, çerez, mesafeli satış, teslimat, iptal/iade metinlerinin sahibi ve onaylı sürümü nedir?
2. Üyelik, sipariş, fatura, tasarım, medya, AI konuşması, log ve audit kayıtlarının saklama/silme süreleri nedir?
3. Çerez/analitik ve pazarlama iletişimi rıza modeli nedir?
4. Hedef geliştirme/test/canlı ortamları ve erişim sahipleri kim?
5. Kabul edilen RPO/RTO, yedek sıklığı ve geri yükleme sorumlusu kim?

## Kapanış kontrolü

- [ ] Her D01–D10 kararında gerçek karar sahibi ve tarih var.
- [ ] Kanıt/örnekler kişisel veriden arındırılmış ve erişilebilir.
- [ ] Geçici kuralların bitiş tarihi ve sorumlusu var.
- [ ] Kararlar `decision-register.md` dosyasına işlendi.
- [ ] Etkilenen API, veri, ekran, test ve faz kapıları güncellendi.
- [ ] Yedi rol incelemesi ve ayrı PM KABUL/RED kaydı alındı.
