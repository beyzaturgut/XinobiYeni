# TST-067 — Header ikonları ve Nobi robot işareti

- Tarih: 02.10.2026
- Seviye: DESIGN PROTOTYPE / BROWSER / INTERACTION / RESPONSIVE / ACCESSIBILITY
- Kapsam: WEB-001 header hızlı işlemleri ve sabit Nobi tetikleyicisi

## Değişiklikler

- Header sağ alanı arama, hesap ve çanta olmak üzere üç çizgisel SVG ikona dönüştürüldü.
- Görsel metinler kaldırıldı; erişilebilir adlar `aria-label` ile korundu.
- Nobi tetikleyicisine kırmızı anten, beyaz robot gövdesi, siyah yüz ve beyaz dalga gülümsemesinden oluşan kod tabanlı SVG sembol eklendi.
- Masaüstünde robot ve `Nobi’ye sor` etiketi; mobilde alanı kaplamayan robot sembolü kullanıldı.
- Panel konumu yeni tetikleyici yüksekliğine göre düzenlendi.

## Doğrulama

Komutlar:

```text
node tools/test-web001-interactions.mjs
node tools/render-web001.mjs
```

Sonuç:

- Header üç hızlı işlem ikonu: başarılı.
- Nobi robot sembolü ve panel aç/kapat/Escape davranışı: başarılı.
- Mobil menü ve ürün karuseli: başarılı.
- 1440, 1024, 768, 390 ve 320 px renderları: 12/12 görsel, yatay taşma yok.
- Öne çıkan ürün eşit yükseklik ve taban çizgisi regresyonu: başarılı.

Durum: Başarılı.
