# TST-065 — Öne çıkan ürün hizalama

- Tarih: 02.10.2026
- Seviye: DESIGN PROTOTYPE / BROWSER / RESPONSIVE / VISUAL
- Kapsam: `design/screens/WEB-001/prototype.html`

## Beklenti

Öne çıkan üç ürünün medya alanları, alt hizaları ve bilgi satırları eşit olmalı; farklı kaynak görsel oranları kart yüksekliğini bozmamalı.

## Uygulama ve ara sonuçlar

İlk tarayıcı ölçümünde kaynak görsel oranları nedeniyle ürün görsel yükseklikleri `353.16`, `235.28` ve `455.22` piksel ölçüldü. Ortak medya kutusu ve yüzde ölçü tek başına yeterli olmadığından görseller kutu içinde mutlak konumlandırıldı. Mobilde genel `min-width:0` kuralının karuseli kapattığı ara testte belirlendi (`scrollWidth=clientWidth=350`) ve mobil kart genişliği yeniden `90vw` olarak korundu. Kahve makinesinin kaynak dosyasındaki iç boşluk optik ölçek düzeltmesiyle dengelendi.

## Final doğrulama

Komutlar:

```text
node tools/test-web001-interactions.mjs
node tools/render-web001.mjs
```

Sonuç:

- Masaüstü ürün medya alanları: eşit yükseklik ve ortak taban çizgisi.
- Ürün başlığı, açıklama ve bağlantı satırları: ortak kart düzeni.
- Mobil ürün karuseli: başarılı.
- 1440, 1024, 768, 390 ve 320 px: yatay taşma yok, 12/12 görsel yüklendi.
- Görsel kontrol: `desktop-1440.png` ve `mobile-390.png` üzerinde dengeli ölçek doğrulandı.

Durum: Başarılı.
