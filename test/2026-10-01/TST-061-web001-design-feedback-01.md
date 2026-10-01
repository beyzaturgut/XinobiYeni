# TST-061 — WEB-001 kullanıcı tasarım geri bildirimi 01

Tarih: 01.10.2026  
Seviye: DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE  
Sonuç: **Başarılı**

## Doğrulanan değişiklikler

- Hero slider `design/banner` altındaki üç görseli kullanıyor; görünür metin ve yön okları yok.
- Header'daki üzerine gelme veya tıklamayla açılan `Kategoriler` menüsü beş ürün kategorisini ve `XINOBI U` bağlantısını içeriyor.
- Kategori alanı, istenen sıradaki beş karttan oluşan yatay kaydırmalı raydır.
- XINOBI U banner yüksekliği masaüstünde ana bannerın yaklaşık yarısına indirildi.
- Öne çıkan ürün görselleri küçültüldü.
- Keşfet banner bölümü kaldırıldı.

## Etkileşim sonucu

```text
desktop: category menu, image-only hero, category rail, Nobi = OK
mobile: drawer, product carousel = OK
```

## Responsive render sonucu

```text
desktop-1440: images=12, overflow=false, h1=1
tablet-1024: images=12, overflow=false, h1=1
tablet-768: images=12, overflow=false, h1=1
mobile-390: images=12, overflow=false, h1=1
mobile-320: images=12, overflow=false, h1=1
```

Yerel adres: `http://127.0.0.1:4175/design/screens/WEB-001/prototype.html`

Deployment yapılmadı.
