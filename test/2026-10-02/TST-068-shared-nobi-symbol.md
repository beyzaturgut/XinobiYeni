# TST-068 — Ortak Nobi sembolü

- Tarih: 02.10.2026
- Seviye: DESIGN SYSTEM / BROWSER / INTERACTION / RESPONSIVE / VISUAL
- Kapsam: WEB-001 Nobi tetikleyicisi, panel başlığı ve gelecek Nobi kullanım kuralı

## Değişiklik

- Nobi robot geometrisi HTML içinde tek bir SVG `symbol` olarak tanımlandı.
- Sağ alttaki Nobi tetikleyicisi ve panel başlığı aynı `#nobi-symbol` kaynağını kullanıyor.
- Paneldeki eski yıldız simgesi kaldırıldı.
- Tasarım yönüne, bütün gelecek Nobi temas noktalarında aynı robotun kullanılması kuralı eklendi.

## Doğrulama

- DOM içinde ortak sembolü kullanan iki görünür Nobi işareti bulundu.
- Nobi paneli açma, kapatma ve Escape etkileşimleri başarılı.
- Panel açık durum ekran görüntüsü: `TST-068-nobi-panel-open.png`.
- 1440, 1024, 768, 390 ve 320 px renderlarında yatay taşma yok; mevcut slider, menü ve karusel regresyonları geçti.

Durum: Başarılı.
