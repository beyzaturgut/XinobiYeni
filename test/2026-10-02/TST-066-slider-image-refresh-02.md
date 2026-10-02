# TST-066 — Slider görsel yenilemesi 02

- Tarih: 02.10.2026
- Seviye: DESIGN PROTOTYPE / ASSET INTEGRITY / BROWSER / RESPONSIVE
- Kapsam: WEB-001 ana sliderındaki üç görsel

## Uygulanan sıra

1. Kömür grisi stüdyoda hava temizleyici → `slider-1.png`
2. Minimal koyu fonda kahve makinesi → `slider-2.png`
3. Sade koyu stüdyoda çay makinesi ve bardak → `slider-3.png`

## Doğrulama

- Kaynak ve hedef dosyalar SHA-256 ile ikili olarak karşılaştırıldı; üç eşleşme de birebir başarılı.
- Sliderın üç noktası Chrome ile sırayla açıldı; üç farklı dosya yüklendi ve her görselin `naturalWidth` değeri sıfırdan büyük bulundu.
- Görsel adreslerine `v=20261002-4` önbellek sürümü eklendi.
- 1440, 1024, 768, 390 ve 320 px renderlarında 12/12 görsel yüklendi ve yatay taşma görülmedi.
- Mevcut kategori menüsü, Nobi, mobil çekmece, ürün karuseli ve öne çıkan ürün hizalama regresyon testleri geçti.

Durum: Başarılı.
