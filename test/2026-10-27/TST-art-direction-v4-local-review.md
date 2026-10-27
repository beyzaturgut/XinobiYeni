# Prompt v4 ve yerel OCR değerlendirmesi — 27.10.2026

- Prompt v4: rafine konturlar, kontrollü çizgi kalınlığı ve dengeli görsel ağırlık. Model/steps=4/kota/soru akışı korunur.
- `dotnet test tests/Xinobi.Architecture.Tests --filter 'FullyQualifiedName~DesignArtDirectionTests|FullyQualifiedName~DesignStudioTests' --no-restore --verbosity quiet`: 25 geçti, 0 hata, 0 atlama. 32.768 cevap birleşimi 2.048 karakter sınırını aşmıyor. Sağlayıcı sahte; yeni görsel üretimi yapılmadı.
- Yerel Apple Vision OCR, kullanıcının ekran görüntüsündeki sağ alt imza izini 0.30 güvenle buldu. UI metinleri de bulundu; üretim kapısı yalnız ham görseli incelemeli. Nesne veya bütün imzaların tespiti doğrulanmadı.
- Yerel Tesseract/Ollama/torch/onnxruntime/transformers yok. Model kurulmadı/indirilmedi, görüntü dış servise gönderilmedi. Cloudflare denetim değişikliği otomatik onay incelemesinde reddedildi; kullanıcı daha sonra dış denetim gönderimini reddederek yerel seçenek değerlendirmesini seçti.
- Otomatik denetim entegrasyonu henüz yok; [yerel seçenekler ve sonraki adımlar](../../docs/runbooks/local-artwork-review.md). Canlı deploy/APK/migration yok. `git diff --check` temiz.
