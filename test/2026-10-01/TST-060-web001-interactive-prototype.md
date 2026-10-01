# TST-060 — WEB-001 etkileşimli yerel tasarım prototipi

Tarih: 01.10.2026  
Seviye: DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE  
Sonuç: **Başarılı**

## Kapsam

- Masaüstü mega menü ve yedi zorunlu hedef
- Mobil tam ekran kategori drawer'ı
- Üç hero slaytı; ileri/geri, duraklat/başlat ve reduced-motion davranışı
- Mobil scroll-snap ürün/kategori rayları ve ürün ileri kontrolü
- Nobi launcher, karşılama paneli, temsili hızlı sorular ve kapatma
- Escape kapatma, `aria-expanded/controls` ve odak geri dönüşü

## Etkileşim sonucu

```text
desktop: mega-menu, hero controls, Nobi = OK
mobile: drawer, product carousel = OK
```

## Responsive render sonucu

```text
desktop-1440: images=15, overflow=false, h1=1
tablet-1024: images=15, overflow=false, h1=1
tablet-768: images=15, overflow=false, h1=1
mobile-390: images=15, overflow=false, h1=1
mobile-320: images=15, overflow=false, h1=1
```

## Yerel inceleme

Geçici sunucu komutu:

```text
python3 -m http.server 4175 --bind 127.0.0.1
```

Adres: `http://127.0.0.1:4175/design/screens/WEB-001/prototype.html`

Bu yerel tasarım prototipidir; `apps/web` üretim uygulaması veya deployment değildir. Gerçek CMS/API, Cloudflare AI, ödeme ya da ticari işlem oluşturmaz.
