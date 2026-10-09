# 9 Ekim — müşteriden istenecek bilgiler ve yasal gereklilikler

Ödeme, kargo, bildirim, mağaza, Mikro/pazaryeri ve yasal kalemler için müşteriden beklenen girdiler; her biri ayrı task. Kaynak: [müşteri talep formu](https://claude.ai/code/artifact/040ecc24-d96d-47e2-ba7c-2cd72f79e99c) (Claude Docs) ve `docs/discovery/provider-access-inventory.md`, `decision-register.md`.

Daha önce açılmış olanlar tekrar açılmadı; ilgili satırda adı geçer: Firebase (ADD-045), Netgsm doğrulaması (ADD-046), iade kuralları D03 (ADD-047), teklif dönüşümü D07 (ADD-048), WhatsApp yapılandırması (ADD-049), Nobi saklama D10 (ADD-050), yüzey maskeleri (ADD-051) — bkz. [9 Ekim eki](tasks-2026-10-09-addendum.md).

Yasal kalemlerin kapsamı ve metinleri Xinobi'nin avukatı ve mali müşaviri tarafından onaylanmalıdır; bu liste hukuki görüş değildir.

[CSV](tasks-2026-10-09-customer-intake.csv) · 59 ayrı task.

## Öncelikli ve ödeme

### TASK-20261009-INT-001 — Ödeme sağlayıcısını seç ve üye işyeri sözleşmesini başlat

- Durum: Müşteriden bekleniyor
- Not: Banka sanal POS’u veya ödeme kuruluşu (iyzico, PayTR, Param vb.). Sağlayıcı başvuruda sitedeki sözleşme metinlerini inceler; INT-038–040 ile birlikte yürür. Yayını en çok geciktiren kalemlerden.

### TASK-20261009-INT-002 — Ödeme test hesabı, API erişimi ve teknik muhatabı al

- Durum: Müşteriden bekleniyor
- Not: Sandbox hesabı; anahtarlar belgeye değil güvenli kanaldan iletilir.

### TASK-20261009-INT-003 — Ödeme bildirimi (webhook) imzası, iade ve durum sorgulama yeteneklerini teyit et

- Durum: Müşteriden bekleniyor
- Not: Kart verisi Xinobi’de tutulmaz; sağlayıcının 3D Secure sayfası kullanılır.

### TASK-20261009-INT-004 — Taksit seçeneklerini ve komisyonu kimin karşılayacağını belirle

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-005 — Havale/EFT kabulünü, IBAN’ları ve ödeme onay sorumlusunu belirle

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-006 — Siparişin kesinleşme anını ve stok rezervasyon süresini kararlaştır

- Durum: Karar bekliyor — D03
- Not: İptal/iade kuralları TASK-20261009-ADD-047’de.

## Kargo

### TASK-20261009-INT-007 — Kargo firması anlaşmasını sağla

- Durum: Müşteriden bekleniyor
- Not: Yayını en çok geciktiren kalemlerden.

### TASK-20261009-INT-008 — Kargo API test hesabını al (gönderi, etiket, takip)

- Durum: Müşteriden bekleniyor
- Not: Şu an takip numarası panelden elle giriliyor.

### TASK-20261009-INT-009 — Her ürün için ağırlık ve desi bilgilerini sağla

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-010 — Gönderici ve iade adreslerini sağla

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-011 — Kargo ücreti kurgusunu belirle (ödeyen, ücretsiz kargo sınırı)

- Durum: Müşteriden bekleniyor

## Bildirimler

### TASK-20261009-INT-012 — Kurumsal gönderen e-posta adresini ve hesabını sağla

- Durum: Müşteriden bekleniyor
- Not: Şu an test amaçlı Gmail SMTP kullanılıyor.

### TASK-20261009-INT-013 — Alan adına SPF, DKIM ve DMARC kayıtlarını ekletecek DNS erişimini sağla

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-014 — SMS sağlayıcı hesabını ve onaylı SMS başlığını sağla

- Durum: Müşteriden bekleniyor
- Not: Doğrulama işi TASK-20261009-ADD-046’da. Push için Firebase TASK-20261009-ADD-045’te.

## Mobil mağazalar

### TASK-20261009-INT-015 — Apple Developer kurumsal hesabını aç (D-U-N-S numarası)

- Durum: Müşteriden bekleniyor
- Not: D-U-N-S başvurusu birkaç gün sürebilir.

### TASK-20261009-INT-016 — Google Play Console kurumsal hesabını aç

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-017 — Mağaza içeriklerini sağla (ad, ikon, ekran görüntüleri, açıklamalar)

- Durum: Müşteriden bekleniyor

## Destek

### TASK-20261009-INT-018 — WhatsApp Business numarasını sağla

- Durum: Müşteriden bekleniyor
- Not: Panelde yapılandırma TASK-20261009-ADD-049’da.

### TASK-20261009-INT-019 — Nobi ve formlardan gelen talepleri karşılayacak ekibi ve saatleri belirle

- Durum: Müşteriden bekleniyor

## Mikro ve pazaryerleri

### TASK-20261009-INT-020 — Mikro sürümü, bağlantı yöntemi, test şirketi ve teknik kullanıcıyı sağla

- Durum: Müşteriden bekleniyor
- Not: D06.

### TASK-20261009-INT-021 — Trendyol mağaza API yetkilerini ve teknik muhatabı sağla

- Durum: Müşteriden bekleniyor
- Not: D06.

### TASK-20261009-INT-022 — Hepsiburada mağaza API yetkilerini ve teknik muhatabı sağla

- Durum: Müşteriden bekleniyor
- Not: D06.

### TASK-20261009-INT-023 — N11 mağaza API yetkilerini ve teknik muhatabı sağla

- Durum: Müşteriden bekleniyor
- Not: D06.

### TASK-20261009-INT-024 — Ürün, fiyat ve stok ana kaydının hangi sistemde olacağını kararlaştır

- Durum: Karar bekliyor — D02
- Not: Şu an panel ana kayıt; Mikro bağlı değil.

## Yapay zekâ

### TASK-20261009-INT-025 — Cloudflare ve Roboflow hesap ve fatura sahipliğini belirle

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-026 — AI aylık maliyet tavanını ve kişi başı limitleri belirle

- Durum: Karar bekliyor — D08
- Not: Geçici: XINOBI U günde 30 görsel, Nobi günde 200 AI yanıtı.

## Ürün ve üretim

### TASK-20261009-INT-027 — Baskı standardını sağla (yüzeyler, mm ölçüler, DPI, dosya türü, renk profili)

- Durum: Karar bekliyor — D04
- Not: Şu an yalnız temsili önizleme; baskı dosyası üretilmiyor. Yüzey maskeleri TASK-20261009-ADD-051’de.

### TASK-20261009-INT-028 — Kişiselleştirilmiş ürün için üretim onay sorumlusunu belirle

- Durum: Karar bekliyor — D04

### TASK-20261009-INT-029 — Her ürün için teknik özellik, garanti süresi ve barkod/GTIN bilgilerini sağla

- Durum: Müşteriden bekleniyor
- Not: Panelde Teknik özellikler sekmesine girilir.

## Altyapı

### TASK-20261009-INT-030 — Alan adı sahibini, DNS erişimini ve SSL sertifikasını sağla

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-031 — Canlı sunucu sahibini ve teknik muhatabı belirle

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-032 — Canlı SQL Server ortamını ve yedekleme sorumlusunu belirle

- Durum: Müşteriden bekleniyor

## Yasal — şirket ve kayıtlar

### TASK-20261009-INT-033 — Şirket bilgilerini sağla (unvan, MERSİS, vergi dairesi/no, adres, KEP, telefon, e-posta)

- Durum: Müşteriden bekleniyor
- Not: Sitede yayımlanması zorunlu.

### TASK-20261009-INT-034 — ETBİS kaydını yap

- Durum: Müşteriden bekleniyor
- Not: Site ve mobil uygulama için. Yayını en çok geciktiren kalemlerden.

### TASK-20261009-INT-035 — VERBİS kayıt yükümlülüğünü kontrol et, gerekiyorsa kayıt yap

- Durum: Müşteriden bekleniyor
- Not: Çalışan sayısı ve ciro eşiklerine göre muafiyet olabilir.

### TASK-20261009-INT-036 — İYS kaydını yap

- Durum: Müşteriden bekleniyor
- Not: Pazarlama SMS/e-postası için; sipariş ve kargo bildirimleri onaydan muaf.

### TASK-20261009-INT-037 — “Xinobi”, “XINOBI U” ve “Nobi” marka tescil durumunu bildir

- Durum: Müşteriden bekleniyor

## Yasal — satış sözleşmeleri

### TASK-20261009-INT-038 — Ön Bilgilendirme Formu metnini sağla

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Ödeme adımında onaylatılıp e-postayla gönderilecek; metin gelince sisteme eklenir.

### TASK-20261009-INT-039 — Mesafeli Satış Sözleşmesi metnini sağla

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Ödeme adımında onaylatılıp e-postayla gönderilecek.

### TASK-20261009-INT-040 — İptal, iade ve cayma politikasını sağla

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Kural kararı TASK-20261009-ADD-047’de; sistem metne uyarlanacak.

### TASK-20261009-INT-041 — Kişiselleştirilmiş ürünlerin cayma hakkı dışında tutulup tutulmayacağını kararlaştır

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: XINOBI U ve kendi görseliyle üretilen ürünler; tutulacaksa sözleşmede açıkça yazılmalı.

## Yasal — KVKK ve gizlilik

### TASK-20261009-INT-042 — Aydınlatma metinlerini sağla (üyelik, sipariş, kurumsal teklif, Nobi)

- Durum: Müşteri + hukuk onayı bekleniyor

### TASK-20261009-INT-043 — Açık rıza metinlerini sağla (pazarlama, yurt dışına aktarım)

- Durum: Müşteri + hukuk onayı bekleniyor

### TASK-20261009-INT-044 — Çerez politikasını ve çerez onay metnini sağla

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Şu an sitede taslak çerez bandı var.

### TASK-20261009-INT-045 — Kişisel veri saklama ve imha politikasını sağla

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Nobi’nin 90 günlük geçici süresi TASK-20261009-ADD-050’de.

### TASK-20261009-INT-046 — Yurt dışına veri aktarımı için gerekli sözleşmeleri yap

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Cloudflare, Roboflow ve muhtemelen e-posta/SMS altyapısı.

### TASK-20261009-INT-047 — Veri işleyen sözleşmelerini yap (sunucu, e-posta, SMS, kargo, AI)

- Durum: Müşteri + hukuk onayı bekleniyor

## Yasal — site metinleri

### TASK-20261009-INT-048 — Üyelik ve kullanım koşullarını sağla

- Durum: Müşteri + hukuk onayı bekleniyor

### TASK-20261009-INT-049 — Yorum yayın kurallarını sağla

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Panelde değerlendirme onayı bu kurallara göre yapılacak.

### TASK-20261009-INT-050 — Kullanıcı görselleri ve AI tasarımları için hak ve sorumluluk metnini sağla

- Durum: Müşteri + hukuk onayı bekleniyor

## Yasal — ürün, fiyat ve fatura

### TASK-20261009-INT-051 — Garanti belgelerini ve süreleri sağla

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-052 — Yetkili servis listesini sağla

- Durum: Müşteriden bekleniyor
- Not: Satış Sonrası Hizmetler Yönetmeliği.

### TASK-20261009-INT-053 — CE uygunluk, kullanım kılavuzu ve gerekiyorsa enerji etiketi bilgilerini sağla

- Durum: Müşteriden bekleniyor

### TASK-20261009-INT-054 — Fiyat gösterim kurallarını teyit et (KDV dahil, indirimde son 30 günün en düşük fiyatı)

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Teyit sonrası geliştirme gerekir: indirimli ürünlerde 30 günlük en düşük fiyat gösterimi şu an yok.

### TASK-20261009-INT-055 — Kampanya koşul metinlerini sağla

- Durum: Müşteri + hukuk onayı bekleniyor

### TASK-20261009-INT-056 — E-arşiv/e-fatura entegratörünü ve faturanın Mikro üzerinden kesilip kesilmeyeceğini bildir

- Durum: Müşteriden bekleniyor

## Yasal — mobil mağazalar

### TASK-20261009-INT-057 — Gizlilik politikası adresini (URL) sağla

- Durum: Müşteri + hukuk onayı bekleniyor

### TASK-20261009-INT-058 — App Store ve Google Play veri kullanım beyanlarını onayla

- Durum: Müşteri + hukuk onayı bekleniyor
- Not: Uygulamada hesap silme özelliği zaten var.

## Takip

### TASK-20261009-INT-059 — Talep formunu müşteriye gönder ve yanıtları takip et

- Durum: Hazır — gönderilmedi
- Not: Form Claude Docs belgesinde; yanıtlar geldikçe bu listedeki durumlar güncellenir.
