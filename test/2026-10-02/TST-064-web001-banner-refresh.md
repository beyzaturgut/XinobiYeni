# TST-064 — WEB-001 slider ve XINOBI U banner yenilemesi

Tarih: 02.10.2026  
Seviye: DESIGN PROTOTYPE / ADMIN UI / RESPONSIVE / BROWSER  
Sonuç: **Başarılı**

## Kapsam

- Üst slider yalnızca üç yeni görseli kullanıyor: hava temizleyici, krom kahve makinesi ve pembe çay makinesi.
- Önceki slider görselleri kaldırıldı.
- XINOBI U alanı `Özel tasarım Xinobi çay makinesi koleksiyonu.png` görselini kullanıyor.
- Sabit kırmızı `Tasarımını Oluştur` CTA'sı küçültüldü.
- CTA masaüstünde otomatik test edilen `170 × 42 px` ölçüsüne indirildi.
- Safari'nin eski CSS/JS dosyalarını göstermemesi için prototip kaynaklarına cache-busting sürümü eklendi.
- Türkçe Unicode dosya adı uyuşmazlığını önlemek için üç görsel web-safe `slider-1/2/3.png` adlarıyla sunuluyor.
- Admin slider listesi ve XINOBI U önizlemesi yeni görsellerle eşleştirildi.

## Sonuç

```text
WEB-001 interaction: başarılı
slider-1.png / slider-2.png / slider-3.png tek tek yüklendi ve naturalWidth > 0 doğrulandı
WEB-001 responsive: 1440 / 1024 / 768 / 390 / 320; kırık görsel ve yatay taşma yok
admin lint/build: başarılı
admin slider ve XINOBI U önizleme testi: başarılı
```

Deployment yapılmadı.
