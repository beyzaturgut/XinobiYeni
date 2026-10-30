# WEB-02 - Ürün detayını satışa hazır doğrula

Tarih: 30.10.2026. Başlangıç: `main / 358d42d`.

**Durum: Teknik uygulama ve yerel kabul tamamlandı; ürün içeriği ve bir fiyat kaydı açık.** Tüm taskın ticari veri kabulü bu kayıtlarla birlikte kapanacaktır. Açıklama/teknik özellikler kullanıcı talebiyle açık bırakıldı: “bu kısmı açık bırak. dosyayı eklediğimde söyleyeceğim”. Bilgi veya fiyat uydurulmadı.

## Yapılanlar

- Ürün/renk seçimi gerçek `variant` URL parametresiyle korunur; yenileme ve geri/ileri doğru renk/SKU'ya döner. Geçersiz/kaldırılmış renk başka renkten alışveriş başlatmaz; mevcut renklere dönüş sunar.
- Fiyat yalnız pozitif tam kuruş değeriyle kullanılabilir. Eksik/sıfır/negatif/kesirli fiyat ve sıfır stok sepete eklemeyi engeller; stok azalınca adet yeniden sınırlandırılır. Gerçek renge ait SKU/ürün/varyant/adet sepet kaydıyla karşılaştırıldı.
- Katalog hatasında eski fiyat/stokla işlem açılmaz; ürün detayı ve kişiselleştirme girişinde görünür hata/yeniden deneme var.
- Galeri yükleme hatası kırık görsel yerine açık mesaj gösterir. Renk/ürün bağlamındaki galeri seçimi başka ürün/renge taşınmaz.
- Kişiselleştirme girişi bütün uygun ürün renklerinde korunur; seçilen rengin hazır olup olmadığı gösterilir. Maskesiz renk, başka rengin maskesine sessizce dönüştürülmez. Yöntem adımında devam kapalıdır; kullanıcı uygun bir rengi açıkça seçerek devam eder. Normal, tasarımsız alışveriş maske gerektirmez.
- Yerel üç eksik public dosya mevcut canlı medya deposunda bulundu ve mevcut `restore-local-media.mjs` ile üzerine yazmadan geri getirildi. Bunlar Git dışında; SQL/katalog değişmedi.

## Kanıt

[TST-142...149](../../test/2026-10-30/TST-142-web02-product-detail.md): 24 aktif ürün, 79 renk, 390/768/1440 px; **237 ürün/renk kontrolü PASS**. Fiyat/stok, SKU ve sepet satırı, galeri decode, mevcut açıklama/özellikler ve değerlendirme bölümü kontrol edildi. Yükleme beklenerek alınan üç boyutlu ekran görüntüleri incelendi.

110 tekil ürün/galeri/yüzey medya referansı: ilk tarama 107 OK / 3 adet 404; kurtarma sonrası **110/110 HTTP 200**. 30 kişiselleştirilebilir renk için gerçek salt okunur rendering-inputs yanıtında **30/30 previewAvailable=true**. Bu, fiziksel baskı kalitesi/onayı değildir.

Sentetik GET fixture'ları: geçersiz renk/fiyat, sıfır/azalan stok, stok üstü sepet, API kesintisi/yeniden deneme, bozuk görsel ve pasif ürün başarılı. Beş ilgili Playwright regresyonu + bir ek yöntem-katalog kesintisi testi başarılı; TypeScript, tam web lint, 38 sayfalık statik production build başarılı.

## Açık kalan işler

| Alt iş | Durum / kapanış koşulu |
|---|---|
| WEB-02-DATA-01 - Açıklama ve teknik özellikler | Kullanıcı dosya ekleyeceğini söyleyene kadar açık. Aşağıdaki 23 ürün için onaylı kaynaktan doldurulup gerçek katalogda tekrar doğrulanacak. |
| WEB-02-DATA-02 - SKU 117 fiyatı | Elektrikli Çay Makinesi 116120 / Metalik Lacivert / SKU `117` fiyatı eksik. Onaylı satış fiyatı geldiğinde admin üzerinden kaydedilip bu rengin alımı tekrar doğrulanacak. Şu an sepete ekleme kapalı. |

### Onaylı açıklama/özellik dosyası bekleyen ürünler

| Ürün | Açıklama | Teknik özellik |
|---|---|---|
| Elektrikli Çay Makinesi 101105 | Eksik | Eksik |
| Elektrikli Çay Makinesi 106110 | Eksik | Eksik |
| Elektrikli Çay Makinesi 116120 | Eksik | Eksik |
| Elektrikli Çay Makinesi 126130 | Eksik | Eksik |
| Dijital Kettle 301304 | Eksik | Eksik |
| Dijital Kettle 305306 | Eksik | Eksik |
| Dijital Kettle 201204 | Eksik | Eksik |
| Otomatik Türk Kahvesi Makinesi 400403 | Eksik | Eksik |
| Otomatik Türk Kahvesi Makinesi 404406 | Eksik | Eksik |
| Otomatik Türk Kahvesi Makinesi 407-410 | Eksik | Eksik |
| Dijital Semaver 601602 | Eksik | Eksik |
| Dijital Semaver 603604 | Eksik | Eksik |
| Dijital Semaver 605-608 | Eksik | Eksik |
| Hava Temizleyici | Eksik | Eksik |
| Dijital Tost Makinesi | Eksik | Eksik |
| Yemek Saklama Kabı | Eksik | Eksik |
| Personal Blender | Eksik | Eksik |
| Elektrikli Çay Makinesi 111115 | Eksik | Eksik |
| Elektrikli Çay Makinesi 121125 | Eksik | Eksik |
| Elektrikli Çay Makinesi 131135 | Eksik | Eksik |
| Elektrikli Çay Makinesi 136140 | Eksik | Eksik |
| Otomatik Türk Kahvesi Makinesi 501505 | Eksik | Eksik |
| tasarım deneme | Eksik | Eksik |

## Tekrar ve kapsam sınırı

`node apps/web/tests/product-detail-acceptance.mjs` çalışan yerel web/API ile salt okunur kabulü tekrarlar. Gerçek katalog test verisi yalnız browser localStorage sepetine yazılır; hesap/sipariş/provider mutasyonları engellenir. Ek fiyat/medya/maske arızaları yalnız tarayıcı GET fixture'larıdır. Tam backend/mobil regresyonu, gerçek ödeme, üretim baskısı, APK, canlı deploy veya resmi iş sahibi UAT yapılmadı.
