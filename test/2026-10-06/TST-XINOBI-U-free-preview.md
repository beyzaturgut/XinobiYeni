# Ücretsiz ürün yüzeyi önizlemesi

2026-10-06 · Sonuç: başarılı.

- Mevcut gerçek AI deseninden çalışıldı; yeni üretim veya ücretli düzenleme isteği yapılmadı.
- Masaüstü 1440 px ve mobil 390 px kontrolleri geçti.
- Desen Çay Makinesi 101 gövdelerinin eğrisine ve fotoğrafın ışık-gölgesine uyarlandı.
- Arka plan, sap ve ağızlık piksel örneklerinin orijinalle aynı kaldığı doğrulandı.
- Orijinal ürünle karşılaştırma, desen ölçeği/konumu ve birleşik PNG indirme çalıştı.
- TS/lint kontrolleri başarılı. Araç: `pnpm test:free-preview`.

Standart fotoğraflara özel yüzey maskeleri kullanılır; farklı açılı/yeni fotoğraflar genel şablonla ve uygunluk açıklamasıyla gösterilir. Ürüne uygulama tarayıcıda ücretsizdir. Yeni AI deseninin Cloudflare kullanım kotası ayrı konudur. Fiziksel baskı sonucu onaylanmış sayılmaz.
