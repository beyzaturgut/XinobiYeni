# CRM görevleri — müşteriden istenecekler ve yasal gereklilikler (9 Ekim 2026)

CRM’in “Yeni Görev” formuna girilecek 25 görev. Ayrıntılı 59 görev `tasks-2026-10-09-customer-intake.md` dosyasında; her CRM görevi ilgili task numaralarını gösterir. Müşteriye gönderilecek form: [Claude Docs](https://claude.ai/code/artifact/040ecc24-d96d-47e2-ba7c-2cd72f79e99c).

**Ortak alanlar:** Proje = Xinobi · Atanan Personel = Beyza Turgut · Birim = formdaki uygun birim (bu listede seçilmedi).

**Task Tipi önerisi:** “Müşteri talebi” müşteriden bilgi/belge beklenen işler, “Karar” müşteri kararı gereken işler, “Takip” ve “Geliştirme” iç işler. Formdaki seçenekler farklıysa en yakınını seçin.

**Müşteriye göster:** Müşteriden bir şey beklenen görevlerde işaretli; böylece müşteri panelinde ve takviminde görünür. İç işlerde (24, 25) işaretsiz.

## 1. Ödeme sağlayıcısı ve sanal POS bilgilerini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Yüksek
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Sağlayıcı seçimi: banka sanal POS’u veya ödeme kuruluşu (iyzico, PayTR, Param vb.); üye işyeri sözleşmesi
    - Test (sandbox) hesabı, API erişimi ve teknik muhatap (anahtarlar güvenli kanaldan)
    - Ödeme bildirimi (webhook) imzası, iade ve durum sorgulama yeteneği
    - Taksit seçenekleri ve komisyonu kimin karşılayacağı
    - Havale/EFT kabulü, IBAN’lar ve ödeme onay sorumlusu

    Ayrıntılı görevler: INT-001–005

## 2. Sipariş kesinleşme anı ve stok rezervasyonu kararını al (D03)

- **Task Tipi:** Karar
- **Öncelik:** Yüksek
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Sipariş ne zaman kesinleşir: kart onayı mı, havale onayı mı?
    - Ödeme beklerken stok kaç dakika ayrılır?
    - İptal ve iade hangi aşamaya kadar mümkün; kısmi iade olacak mı? (sistemde geçici 14 gün)

    Ayrıntılı görevler: INT-006, ADD-047

## 3. Kargo firması anlaşması ve API erişimini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Yüksek
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Anlaşmalı kargo firması ve sözleşme
    - Gönderi oluşturma, etiket ve takip API’si için test hesabı

    Ayrıntılı görevler: INT-007–008

## 4. Kargo için ürün ölçüleri, adresler ve ücret kurgusunu al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Her ürün için ağırlık ve desi
    - Gönderici adresi ve iade adresi
    - Kargo ücretini kim öder, ücretsiz kargo sınırı var mı?

    Ayrıntılı görevler: INT-009–011

## 5. Kurumsal e-posta gönderen adresi ve DNS kayıtlarını al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Gönderen adres ve hesap (ör. bildirim@xinobi.com); şu an test amaçlı Gmail kullanılıyor
    - SPF, DKIM ve DMARC kayıtları için DNS erişimi

    Ayrıntılı görevler: INT-012–013

## 6. SMS sağlayıcı hesabı ve SMS başlığını al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Sağlayıcı hesabı (sistem Netgsm’e hazır)
    - Onaylı SMS başlığı
    - Gerçek hesapla gönderim denemesi

    Ayrıntılı görevler: INT-014, ADD-046

## 7. Mobil push bildirimleri için Firebase projesini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Firebase projesi ve uygulama dosyaları
    - Apple APNs anahtarı (iOS)
    - Sunucu hazır; mobil SDK ve token kaydı eklenecek

    Ayrıntılı görevler: ADD-045

## 8. Apple ve Google geliştirici hesaplarını ve mağaza içeriklerini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Apple Developer kurumsal hesabı (D-U-N-S numarası gerekir)
    - Google Play Console kurumsal hesabı
    - Uygulama adı, ikon, ekran görüntüleri, kısa ve uzun açıklama

    Ayrıntılı görevler: INT-015–017

## 9. WhatsApp Business numarası ve destek ekibini belirle

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - WhatsApp Business numarası (Nobi’nin müşteriyi ekibe yönlendirmesi için); gelince panelden girilecek
    - Nobi ve formlardan gelen talepleri karşılayacak ekip ve çalışma saatleri

    Ayrıntılı görevler: INT-018–019, ADD-049

## 10. Mikro erişimi ve ürün/fiyat/stok ana kayıt kararını al (D02)

- **Task Tipi:** Karar
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Mikro sürümü, bağlantı yöntemi (API / ara katman), test şirketi ve teknik kullanıcı
    - Ürün, fiyat ve stok hangi sistemde ana kayıt: panel mi, Mikro mu? Veri hangi yönde akacak?

    Ayrıntılı görevler: INT-020, INT-024

## 11. Trendyol, Hepsiburada ve N11 API yetkilerini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Düşük
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Trendyol mağaza API yetkileri ve teknik muhatap
    - Hepsiburada mağaza API yetkileri ve teknik muhatap
    - N11 mağaza API yetkileri ve teknik muhatap

    Ayrıntılı görevler: INT-021–023

## 12. Yapay zekâ hesap sahipliği ve bütçe kararını al (D08)

- **Task Tipi:** Karar
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Cloudflare (XINOBI U ve Nobi) ve Roboflow hesaplarının ve faturasının sahibi
    - Aylık maliyet tavanı ve kişi başı limitler (geçici: XINOBI U günde 30 görsel, Nobi günde 200 AI yanıtı)

    Ayrıntılı görevler: INT-025–026

## 13. Baskı standardı, üretim onayı ve ürün bilgilerini al (D04)

- **Task Tipi:** Karar
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Baskı yüzeyleri, mm ölçüler, minimum DPI, dosya türü, renk profili
    - Kişiselleştirilmiş ürünü üretimden önce kim onaylayacak?
    - Her ürün için teknik özellikler, garanti süresi, barkod/GTIN
    - Panelde her renk için tasarım yüzeyinin (maskenin) onaylanması

    Ayrıntılı görevler: INT-027–029, ADD-051

## 14. Alan adı, canlı sunucu ve veritabanı sorumlularını belirle

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Yüksek
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Alan adı sahibi, DNS erişimi ve SSL sertifikası
    - Canlı sunucu sahibi ve teknik muhatap
    - Canlı SQL Server ortamı ve yedekleme sorumlusu

    Ayrıntılı görevler: INT-030–032

## 15. Şirket bilgilerini al ve ETBİS kaydını yaptır

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Yüksek
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Ticaret unvanı, MERSİS no, vergi dairesi ve no, açık adres, KEP, telefon, e-posta (sitede yayımlanması zorunlu)
    - Site ve mobil uygulama için ETBİS kaydı (Ticaret Bakanlığı)

    Ayrıntılı görevler: INT-033–034

## 16. VERBİS, İYS ve marka tescil durumunu öğren

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - VERBİS kayıt yükümlülüğü kontrolü (eşiklere göre muafiyet olabilir)
    - Pazarlama SMS/e-postası için İYS kaydı
    - “Xinobi”, “XINOBI U” ve “Nobi” için Türkpatent başvuru durumu

    Ayrıntılı görevler: INT-035–037

## 17. Mesafeli satış metinlerini ve cayma politikasını al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Yüksek
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Ön Bilgilendirme Formu
    - Mesafeli Satış Sözleşmesi
    - İptal, iade ve cayma politikası (standart cayma 14 gün)
    - Kişiselleştirilmiş ürünler (XINOBI U, kendi görseli) cayma hakkı dışında mı tutulacak? Tutulacaksa sözleşmede açıkça yazılmalı

    Ayrıntılı görevler: INT-038–041

## 18. KVKK metinleri ve veri sözleşmelerini al (D10)

- **Task Tipi:** Karar
- **Öncelik:** Yüksek
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Aydınlatma metinleri: üyelik, sipariş, kurumsal teklif, Nobi
    - Açık rıza metinleri: pazarlama, yurt dışına aktarım
    - Çerez politikası ve onay metni
    - Saklama ve imha politikası (Nobi konuşmaları geçici 90 gün)
    - Yurt dışına aktarım sözleşmeleri (Cloudflare, Roboflow, e-posta/SMS)
    - Veri işleyen sözleşmeleri: sunucu, e-posta, SMS, kargo, AI

    Ayrıntılı görevler: INT-042–047, ADD-050

## 19. Üyelik koşulları, yorum kuralları ve görsel hakları metinlerini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Üyelik ve kullanım koşulları
    - Yorum yayın kuralları
    - Kullanıcının yüklediği görsellerin telif sorumluluğu ve AI tasarımlarının kullanım hakları

    Ayrıntılı görevler: INT-048–050

## 20. Garanti, yetkili servis ve ürün uygunluk belgelerini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Her ürün için garanti belgesi ve süresi
    - Yetkili servis listesi
    - CE uygunluk, kullanım kılavuzu, gerekiyorsa enerji etiketi

    Ayrıntılı görevler: INT-051–053

## 21. Fiyat gösterimi, kampanya ve e-fatura bilgilerini al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Fiyat gösterim kurallarının teyidi: KDV dahil, indirimde son 30 günün en düşük fiyatı
    - Kampanya koşul metinleri
    - E-arşiv/e-fatura entegratörü; fatura Mikro üzerinden mi kesilecek?

    Ayrıntılı görevler: INT-054–056

## 22. Mağaza gizlilik politikası ve veri kullanım beyanlarını al

- **Task Tipi:** Müşteri talebi
- **Öncelik:** Düşük
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Gizlilik politikası adresi (URL)
    - App Store ve Google Play veri kullanım beyanları (uygulamada hesap silme var)

    Ayrıntılı görevler: INT-057–058

## 23. Kabul edilen teklifin siparişe dönüşüm kuralını al (D07)

- **Task Tipi:** Karar
- **Öncelik:** Orta
- **Müşteriye göster:** Evet
- **Açıklama:**

    - Kabul edilen kurumsal teklif nasıl siparişe dönüşür, kim onaylar?
    - Toplu siparişte ödeme şekli

    Ayrıntılı görevler: ADD-048

## 24. Müşteri talep formunu gönder ve yanıtları takip et

- **Task Tipi:** Takip
- **Öncelik:** Yüksek
- **Müşteriye göster:** Hayır
- **Açıklama:**

    - Formu müşteriye ilet: https://claude.ai/code/artifact/040ecc24-d96d-47e2-ba7c-2cd72f79e99c
    - Gelen yanıtlara göre ilgili CRM görevlerini ve docs/tasks durumlarını güncelle

    Ayrıntılı görevler: INT-059

## 25. İndirimli ürünlerde son 30 günün en düşük fiyatını göster

- **Task Tipi:** Geliştirme
- **Öncelik:** Orta
- **Müşteriye göster:** Hayır
- **Açıklama:**

    - Fiyat Etiketi Yönetmeliği gereği; müşteri kuralı teyit edince (CRM görevi 21) geliştirilecek
    - Fiyat geçmişini sakla; web ve mobil ürün sayfası ile karşılaştırmada göster

    Ayrıntılı görevler: INT-054
