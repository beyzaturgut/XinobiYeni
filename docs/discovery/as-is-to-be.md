# Faz01 — As-is / to-be operasyon keşfi

Durum: Girdi bekliyor · Son güncelleme: 29.09.2026

Bu belge mevcut operasyonu tahmin etmez. Her satır yetkili iş sahibiyle görüşme ve kişisel veriden arındırılmış örnek kanıtla doldurulur. Bilinmeyen süreç `Yok` veya `Bilinmiyor` olarak açıkça kaydedilir.

## Görüşme kaydı

| Alan | Değer |
|---|---|
| Tarih / katılımcılar | Bekliyor |
| İş sahibi ve karar yetkisi | Bekliyor |
| İncelenen sistem/ortam | Bekliyor |
| Maskelenmiş örnek kayıtlar | Bekliyor |
| Açık soruların sahibi/tarihi | Bekliyor |

## Operasyon matrisi

| Akış | As-is soruları ve gerekli kanıt | To-be hedefi | Bağlı karar | Durum |
|---|---|---|---|---|
| Ürün açma | Ürünü kim, hangi sistemde ve hangi alanlarla açıyor? Ürün/varyant/SKU/kategori/marka/görsel örneği | Panelde tekil ürün-varyant kimliği; kanal eşlemeleri | D01, D02 | Girdi bekliyor |
| Stok | Depolar, rezervasyon, eksi stok ve sayım farkı nasıl yönetiliyor? Maskeli stok/depo hareketi | Depo-varyant ana kaydı, atomik rezervasyon ve mutabakat | D02, D03 | Girdi bekliyor |
| Fiyat/kampanya | Liste/kanal/kampanyalı fiyatı kim yazıyor; vergi ve indirim önceliği nedir? | Tek hesaplama otoritesi, para birimi ve kanal fiyatı | D02, D03 | Girdi bekliyor |
| Web/mobil sipariş | Sipariş hangi anda kesin; kart/havale, başarısız ödeme ve tekrar deneme nasıl işliyor? | İdempotent checkout, doğrulanmış ödeme ve durum geçmişi | D03, D05 | Girdi bekliyor |
| Pazaryeri siparişi | Trendyol/Hepsiburada/N11 siparişleri nereden görülüyor; mükerrer kayıt nasıl önleniyor? | Kanal+dış ID benzersiz merkezi sipariş | D02, D03, D06 | Girdi bekliyor |
| Kargo | Firma/entegrasyon, takip numarası, parça gönderi ve teslim durumu nasıl işliyor? | Sağlayıcı adapterı, takip ve hata/tekrar görünümü | D03, D05 | Girdi bekliyor |
| İptal/iade | Kim onaylıyor; durumlar, süreler, stok ve ödeme iadesi nasıl işliyor? | Yetkili durum makinesi, gerekçe ve mutabakat | D03, D05, D10 | Girdi bekliyor |
| Mikro/muhasebe | Mikro sürümü, bağlantı tipi ve ürün/stok/fiyat/cari/sipariş/fatura/tahsilat yönleri nedir? | Alan bazlı sahiplik ve tekrar güvenli senkronizasyon | D02, D06 | Girdi bekliyor |
| Baskı/üretim | Ürün bazında ölçü, yüz, teknik, DPI, format, renk profili ve insan onayı nedir? | Sürümlü DesignDocument ve deterministik baskı çıktısı | D04 | Girdi bekliyor |
| Kurumsal teklif | Talep, fiyatlama, onay, geçerlilik, müzakere ve siparişe dönüşüm nasıl işliyor? | Ayrı teklif yaşam döngüsü ve onaylı dönüşüm | D07 | Girdi bekliyor |
| Müşteri hizmeti | Hangi kanallar, kim erişiyor, hangi konuşma/sipariş bilgisi saklanıyor? | En az yetki, kayıtlı devir ve saklama politikası | D05, D10 | Girdi bekliyor |
| AI | Sağlayıcı, kullanım senaryosu, limit, moderasyon, maliyet ve insan devri nedir? | Sağlayıcı bağımsız, limitli ve izlenebilir AI işleri | D05, D08, D10 | Girdi bekliyor |
| Hukuk/analitik | KVKK, satış metinleri, çerez/analitik rızası ve saklama süreleri nedir? | Sürümlü metin, kanıtlı rıza ve silme/saklama işi | D10 | Girdi bekliyor |
| Mobil yayın | Apple/Google hesap sahibi, bundle kimliği, signing ve push erişimi hazır mı? | Flutter iOS/Android CI, gerçek cihaz UAT ve mağaza kaydı | D09 | Girdi bekliyor |

## Örnek kanıt kontrol listesi

- [ ] Kişisel verisi maskelenmiş ürün ve çok varyantlı SKU
- [ ] En az iki depo için stok görüntüsü/hareketi
- [ ] Normal ve kampanyalı fiyat örneği
- [ ] Web veya pazaryerinden maskeli sipariş ve durum geçmişi
- [ ] Kargo takip ve iptal/iade örneği
- [ ] Mikro ürün/cari/fatura ekranı ve sürüm bilgisi
- [ ] Üç pazaryeri mağaza/yetki ve API erişim durumu
- [ ] Fiziksel baskı alanı ölçüsü ve kabul edilmiş çıktı
- [ ] Kurumsal teklif örneği ve onay akışı
- [ ] Mevcut KVKK/satış/çerez metinleri
- [ ] Apple Developer, Play Console ve push hesap sahipliği

## To-be değişmezleri

- Web, panel ve Flutter aynı `/api/v1` iş kurallarını ve merkezi kayıtları kullanır.
- Sunucu fiyat, stok, vergi, indirim ve sipariş kesinleştirme otoritesidir.
- Dış olaylar ve checkout tekrarları mükerrer sipariş/tahsilat/stok hareketi üretmez.
- Sipariş satırı satış anındaki ürün, varyant, tutar ve tasarım sürümünü değişmez saklar.
- Mock/fixture sonucu gerçek sağlayıcı veya iş sahibi kabulü olarak kaydedilmez.

