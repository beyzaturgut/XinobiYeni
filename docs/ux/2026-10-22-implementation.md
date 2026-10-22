# UX uygulama ve kabul kaydı — 22 Ekim 2026

Kaynak: `Proje Yönetimi/Xinobi_UX_Teknik_Analiz_ve_Faz_Promptlari.md` (R01–R14).

## Faz 0 kararları

- Sepet rozeti satır sayısını değil toplam adedi gösterir.
- Karşılaştırma seçim ekranı varsayılandır; tablo 2–4 yayındaki ürünle açık eylem sonucu açılır. Eski `urunler` paylaşım parametresi korunur.
- URL kategori filtresinin doğruluk kaynağıdır; arama ve kategori değişikliği karşılaştırma seçimlerini silmez.
- Titanyum için mevcut modelde gerçek seri bağı yoktur. Ürün adından tahmin yapılmaz; yönetilebilir kategori bağı gerekir. Bağ yapılandırılmadan seri CTA'sı tamamlanmış sayılmaz.
- Kişiselleştirme uygunluğu ürün alanıdır; yüzey hazır oluşu tam ürün/varyant eşleşmesiyle ayrıca doğrulanır. Eski özel ürün URL'si artık örnek ürünün kaldırıldığını söylüyor.
- Düzenleme Kaydet/İptal ile yapılır; hedef satır ve adet korunur. Silinmiş hedef sessizce yeniden oluşturulmaz.
- Konfigürasyon mevcut özellik belge deposunda revizyonlanır; sipariş yerleşim ve kaynak dosya anlık görüntüsünü taşır. Mevcut SQL JSON kişiselleştirme alanı kullanılabilir; fiziksel şema değişikliği gerekirse ayrıca kaydedilir.
- Kişisel favori konfigürasyona bağlı sunucu kaydıdır; mevcut ürün favorileri korunur.
- Ham tasarım ile ürün üzerindeki temsilî görüntü ayrı kavramlardır. Fiziksel baskı/ödeme/stok rezervasyonu eklenmez.

## Kaynak incelemesi

| Gereksinim | Kaynak ve ilk bulgu | Kabul |
| --- | --- | --- |
| R01–03 | `site-header.tsx`, `catalog.tsx`: kategori yalnız ilk mount'ta okunuyor | Aynı route, doğrudan URL ve geri/ileri filtreyi günceller |
| R04 | `titanium-feature.tsx`: filtresiz katalog bağlantısı; seri bağı yok | Yalnız yapılandırılmış gerçek ilişki açılır |
| R05 | `comparison.tsx`: ilk 8 ürün ve seçince otomatik tablo | Tüm aktif katalog, arama/kategori, 4 sınırı, ayrı tablo |
| R06 | `product-reviews.tsx`: hatada null; ürün/oturum değişiminde eski state | Görünür hata/tekrar deneme, ayrı boş durum, uygunluk korunur |
| R07 | `basket.tsx`, `saved-design-preview.tsx`, `favorites.tsx` | Hedef satır/adet, açık kayıt/iptal, hesap favorisi |
| R08 | `CustomerContracts.cs`, `Orders.tsx`: placement siparişe taşınmıyor | Değişmez snapshot, korumalı ham dosya ve ayar ayrıntısı |
| R09–10 | `add-to-cart.tsx`, detay ve header | Kısayollar kalkar, ortak sepetten toplam adet |
| R11–14 | Genel detay ve kendi görselin/anket girişleri | Ürün/varyant korunur, 3 yöntem, eksik yüzey açık |

İnceleme sırasında mevcut API:5003, web:3000 ve admin:5173 süreçleri bulundu; yeniden başlatılmadı. Gerçek katalog/müşteri kayıtları değiştirilmez. İzole tarayıcı kontrolleri fake API/AI yanıtları kullanır; gerçek sağlayıcıya üretim veya e-posta gönderilmez. Canlı sunucu davranışı bu incelemeyle doğrulanmış sayılmaz.

## Doğrulama

Faz ve test sonuçları uygulama ilerledikçe aşağıya eklenir.
