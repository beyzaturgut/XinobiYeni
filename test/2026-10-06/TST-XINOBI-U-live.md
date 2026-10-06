# XINOBI U · Local gerçek Cloudflare doğrulaması

Tarih: 2026-10-06

- Ana header XINOBI U ürün seçimine yönlendirir; katalogdaki kişiselleştirilebilir ürün/varyant seçimi beş eksendeki anketi başlatır.
- Soru havuzu: 500 benzersiz varyasyon; doğa, ruh hâli, renk, görsel yoğunluk ve tarz eksenlerinde 100’er soru.
- Her oturum: beş soru, her soruda dört şık; rastgele seçim, şık ifadesi varyasyonu ve yanıt kalıcılığı test edildi.
- Kaynak kimlik bilgileri: Kullanıcının istediği Downloads/.env. Değerler log, repo veya frontend’e aktarılmadı; git tarafından dışlanan appsettings.Local.json dosyasında sunucu tarafında tutulur.
- Gerçek sağlayıcı: Cloudflare Workers AI, @cf/black-forest-labs/flux-1-schnell. İlk sonuçta model desenin içine ürün çizimi eklediği için istem saf iki boyutlu desen olarak düzeltildi. İki ayrı smoke testte birer gerçek üretim isteği yapıldı; otomatik tekrar yapılmadı.
- Sonuç: ready, image/jpeg, Son doğrulamada 802.594 byte. Sağlayıcı istek kimliği ve SHA-256 kaydedildi; indirilen çıktı checksum’u sunucu varlığıyla eşleşti.
- Seçilen ürün: Çay Makinesi 101, Lacivert. AI görseli seçilen fotoğrafa perspektifli yüzey olarak uygulandı; birleşik PNG indirildi.
- API: 21 başarılı test; Cloudflare adaptörü, kota, geçersiz yanıt, tek çağrı/idempotency ve yeniden başlatmada kalıcılık dahil.
- Web/admin derlemeleri ve lint kontrolleri başarılı. Masaüstü/mobil uçtan uca test başarılı; bunun ardından ayrıca gerçek sağlayıcı uçtan uca testi başarılı.

Yerel araçlar: `pnpm test:xinobi-u` sağlayıcı yanıtını simüle eder; `node tools/test-xinobi-u-live.mjs` bir gerçek Cloudflare görseli üretir ve kullanımı tüketir. Üretim yüzeyi dijital mockup'tır; fiziksel baskı ölçüsü ve renk doğrulaması değildir. Public production yayını yapılmadı.
