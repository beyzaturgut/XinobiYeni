# Prompt v5 ve önceki üretim akışına dönüş — 27.10.2026

Kullanıcı isteğiyle ek yerel görüntü denetimi ve ona bağlı kurulum kaldırıldı. Üretim tek aday, önceki hata/zaman aşımı ve idempotency davranışına döndü; ek denetim servisi veya otomatik ikinci aday yok. Kullanıcı tasarımları korundu; yalnız denetim metadata alanları yerel oturum kayıtlarından çıkarıldı. Bu işe özel kaynak/test/kurulum notları ve geçici deneme dosyaları kaldırıldı.

Prompt sürümü xinobi-art-direction-5: rafine motif/çizgi kalınlığı/renk rolleri korunur; yazı, harf, rakam, imza, paraf, tarih, logo, filigran, çerçeve ve ürün/ev aleti/mutfak eşyası/çaydanlık/mockup yasakları her üretim istemine açıkça eklenir. Liste model talimatıdır, kusursuz uyum garantisi değildir.

Doğrulama: `dotnet test tests/Xinobi.Architecture.Tests --filter 'FullyQualifiedName~DesignArtDirectionTests|FullyQualifiedName~DesignStudioTests' --no-restore --verbosity quiet`: 25 geçti, 0 başarısız, 0 atlama. 32.768 cevap birleşimi, yasaklar ve sağlayıcı 2.048 karakter sınırı; kaydedilen istem sürümü, tek üretim/idempotency ve yeniden başlatma davranışı doğrulandı. Üretim sağlayıcısı sahte; ücretli üretim yok. Web TypeScript ve git diff --check temiz. Canlı deploy/APK/migration yapılmadı.

Yerel servisler yenilendi: API readiness HTTP 200 / SQL ready, design-studio/status configured=true, web HTTP 200. Kaldırılan executable, kurulum ve dil dizini ile özel deneme projesinin bulunmadığı doğrulandı. Çalışan kaynak/dokümanlarda kaldırılan bileşen adlarına kalan referans yok. Sürümlü geçmiş yeniden yazılmadı.
