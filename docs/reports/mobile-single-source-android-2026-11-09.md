# KIS-TEK-08 — Android sonuçları

09.11.2026.

| Kontrol | Sonuç |
|---|---|
| Android TargetPlatform widget teması, 320/390/768, %200 metin | 3/3 PASS; taşma yok, renk seçmeden ürünle devam |
| Ortak Dart metadata/sürüm/URI ve hata testleri | PASS; tüm Flutter paketi 298/298 |
| Normal ürün renk/fiyat/stok ve tarihsel tasarım regresyonu | Ortak pakette PASS |
| Gerçek Android WebView + galeri + sistem geri | Çalıştırılmadı / açık |
| Ekran okuyucu ve gerçek büyük metin/klavye | Çalıştırılmadı / açık |
| Native kurulum/derleme ve dağıtım | Yapılmadı |

**Ortam:** Bağlı Android cihazı veya çalışan Android emülatörü bulunmuyor. `flutter devices` yalnız macOS ve Chrome gösterdi. TargetPlatform widget testi gerçek işletim sistemi/cihaz testi değildir.

**Kapanış koşulu:** KIS-TEK-06/07 ile eş API/web sürümünü kullanan erişilebilir test ortamında fiziksel cihaz/simülatörle ürün → yöntem → galeri/AI → farklı oranlı önizleme zincirini çalıştır; ağ hatasında dosya/tercih davranışını, kaynak değişimini, geçmiş tasarım açmayı ve ekran okuyucuyu kaydet. Yeni kaynak için kayıt/sepet kabulü task 09 sonrasında yapılır. Gerçek kayıt veya metered AI çağrısı için onaylı izole veri kullanılır.

[Ortak uygulama rehberi](../runbooks/single-source-mobile.md).
