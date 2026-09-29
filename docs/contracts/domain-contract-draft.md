# Faz01 — Modül API ve veri sözleşmesi taslağı

Durum: Karar girdileri bekleyen taslak · Son güncelleme: 29.09.2026

| Modül | Örnek kaynaklar/komutlar | Temel veri | Yetki sınırı | İdempotency | Açık karar |
|---|---|---|---|---|---|
| Kimlik/rol | kayıt, oturum, parola sıfırlama, profil, adres | User, Role, Permission, Customer, Address | Kendi hesabı / panel rolü / nesne sahipliği | kayıt ve token yenileme tekrar güvenliği | D10 |
| Katalog | ürün/kategori/varyant/medya okuma; panel yayın komutları | Brand, Category, Product, Variant, Asset, PrintArea | Yayınlanan katalog / panel yetkisi | yayın komutunda sürüm | D02, D04 |
| Fiyat/stok | fiyat-kampanya-kupon sorgusu; rezervasyon ve stok hareketi | Price, ChannelPrice, Campaign, Inventory, Reservation | Sunucu hesaplama; panel/entegrasyon yazma yetkisi | rezervasyon ve hareket benzersizliği | D02, D03 |
| Sepet/checkout | sepet satırı, kupon, checkout kesinleştirme | Cart, CartLine, CheckoutIdempotency | Yalnız kendi sepeti | `Idempotency-Key` zorunlu | D03, D05 |
| Sipariş/ödeme | sipariş geçmişi, ödeme girişimi/webhook, kargo, iptal/iade | Order, OrderLine, PaymentAttempt, Shipment, ReturnRequest | Müşteri kendi kaydı; operatör rolü | sağlayıcı işlem/olay ID ve durum geçişi | D03, D05, D10 |
| Tasarım/baskı | DesignDocument kaydet/aç; çıktı işi ve indirme | Design, DesignVersion, GeneratedAsset, PrintOutput | Tasarım sahibi; baskı operatörü | sürüm ve render işi hash'i | D04, D09 |
| Teklif | talep oluşturma, not/durum, onaylı dönüşüm | QuoteRequest, QuoteLine, QuoteHistory | Talep sahibi; teklif sorumlusu | talep ve dönüşüm anahtarı | D07 |
| CMS/SEO | sayfa/blog/menü/meta yayınlama | Page, BlogPost, Menu, SeoMetadata | Yayınlanan içerik; içerik rolü | optimistic concurrency | D10 |
| Mikro | ürün/stok/fiyat/cari/sipariş/fatura/tahsilat/iade işleri | ExternalMapping, SyncJob, SyncAttempt | Entegrasyon rolü | alan+harici ID+iş türü | D02, D06 |
| Pazaryerleri | kanal ürün/fiyat/stok; sipariş/kargo/iptal/iade | ExternalOrderRef, ExternalMapping, ProviderEvent | Kanal bazlı entegrasyon rolü | kanal+dış ID+olay | D02, D03, D06 |
| AI tasarım | istem, kuyruk, sonuç, editöre aktarım | AiJob, GeneratedAsset, AiUsage | Kullanıcı kotası; AI yönetim rolü | istek hash'i ve job ID | D05, D08, D10 |
| AI asistan | konuşma, öneri, teklif/lead, insan devri | AiConversation, Lead, KnowledgeSource | Konuşma sahibi; destek/AI rolü | mesaj/iş kimliği | D05, D08, D10 |
| Bildirim/rapor | bildirim tercihleri, gönderim işleri, temel rapor | Notification, OutboxEvent, AuditLog | Kendi bildirimleri; yetkili rapor | bildirim işi kimliği | D05, D10 |

## Değişmezler

- `variantId` katalogdan editör, sepet ve siparişe değişmeden taşınır.
- Sipariş satırı satış anındaki ürün/varyant/tutar/vergi/indirim/tasarım sürümü anlık görüntüsüdür.
- Büyük medya ve baskı dosyaları SQL Server içine gömülmez; yalnız güvenli referans ve checksum tutulur.
- Dış sağlayıcı gecikmesi yerel sipariş kaydını kaybettirmez; outbox/inbox ve mutabakat kullanılır.
- D02/D03/D04/D07 açıkken ilgili fiziksel şema ve durum değerleri kesin kabul edilmez.

