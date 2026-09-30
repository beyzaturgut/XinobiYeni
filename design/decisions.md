# Faz02 tasarım kararları

Sürüm: `0.1.0` · Tarih: 30.09.2026 · Durum: İlk yön uygulandı, inceleme bekliyor

## Yaratıcı yön

`Sessiz teknoloji`: ürün fotoğrafını merkeze alan, açık yüzeyler ve koyu teknik alanlarla dengelenen, gereksiz dekorasyondan kaçınan premium ev teknolojisi dili.

## Kaynaklar

- Yetkili Xinobi logo kaynağı: `UX:UI/xinobi logo beyaz.pdf`.
- Demo ürün kaynağı: `demo ürünler/`; ürün adları ve ticari bilgiler temsili olarak işaretlenir.
- Referans: Dyson Türkiye. Alınan ilkeler büyük ürün görseli, açık bilgi hiyerarşisi, kısa CTA metni ve kategori keşfidir. Dyson varlıkları, kodu veya özel fontu kopyalanmaz.

## Tipografi kararı

Dyson'ın marka tipi kamuya açık bir font lisansı olarak doğrulanamadığı için kullanılmadı. Türkçe karakter kapsamı, okunabilirlik, değişken ağırlık ve web optimizasyonu nedeniyle `Inter` seçildi; Next.js tarafından self-host edilir ve istemciden Google'a istek gönderilmez.

## Görsel kararlar

- Beyaz Xinobi logo yalnız koyu yüzeylerde kullanılır.
- Ürün fotoğraflarındaki gerçek metal/renk dokusu korunur; yapay baskı alanı uydurulmaz.
- Fiyat, indirim, teslimat ve stok iddiası gerçek API verisi olmadan gösterilmez.
- D04 kapanmadığı için kişiselleştirme alanı prototip açıklaması taşır, üretim ölçüsü vaat etmez.

## İlk uygulama kapsamı

- Responsive global header ve footer.
- Ana sayfa hero, değer şeridi, öne çıkan ürünler, kategori keşfi, kişiselleştirme tanıtımı ve marka hikâyesi.
- Klavye odağı, içeriğe geç bağlantısı, semantik başlıklar, azaltılmış hareket desteği ve açıklayıcı görsel alternatifleri.

## Açık incelemeler

- Marka sahibi logo kullanım boşluğu ve renk yönünü onaylamalı.
- Demo ürünlerin satış adları, varyantları ve kullanım hakkı doğrulanmalı.
- D02 gelince ürün/varyant verisi; D04 gelince kişiselleştirme/baskı alanı gerçek sözleşmeye bağlanmalı.
- Dar telefon, tablet ve masaüstü görsel regresyonu TST raporuyla tamamlanmalı.
