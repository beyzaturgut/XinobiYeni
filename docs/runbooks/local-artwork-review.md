# Yerel desen denetimi değerlendirmesi — 27.10.2026

## Karar ve mevcut durum

Proje sahibi, üretilen ham desenin dahi Cloudflare görsel-anlama modeline gönderilmesini reddetti; yalnız yerel denetim seçeneklerinin değerlendirilmesini istedi. Dış görsel denetim entegrasyonu uygulanmadı. Mevcut Cloudflare desen üretimi aynı kalır; yeni veri gönderimi eklenmedi. Prompt v4 rafine motif, tutarlı ince çizgi, ana/yardımcı çizgi ayrımı ve dengeli görsel ağırlık yönünü uygular. Bu prompt değişikliği otomatik görsel denetimi değildir.

## Yerel deney

Mac arm64 ortamında Tesseract, Ollama, PyTorch, ONNX Runtime ve Transformers bulunmadı. Python/OpenCV ve Swift mevcut. Yeni model indirilmedi; Windows sunucunun RAM/GPU/işletim sistemi uyumluluğu bu oturumda ölçülmedi.

Paylaşılan örnek ekran görüntüsünde Apple Vision VNRecognizeTextRequest, accurate ve dil düzeltmesi kapalı olarak çevrimdışı çalıştırıldı. Sağ alt imza benzeri bölge `Zo41—` olarak 0.30 güvenle tanındı (normalize x=0.73,y=0.12,w=0.12,h=0.02; Vision koordinatları alt köşeden). Uygulama etiketleri de tanındı. Bu nedenle gerçek kapıda yalnız ham üretilen görsel incelenmeli; ekran görüntüsündeki Temsilidir/çerez/uyarı metinleri yanlış ret sebebi olmamalı.

Tek örnekte bu izin bulunması bütün imzaların yakalanacağını göstermez. Özellikle düşük güvenli köşe yazıları yok sayılmamalı; şüpheli/inceleme gerekli olmalı. OCR doğal motifleri harf sanabilir; yalnız düşük bir global eşik de aşırı ret oluşturabilir. Apple Vision Mac pilotudur, Windows IIS için uygun uygulama değildir.

## Yerel seçenekler

| Seçenek | Güçlü taraf | Sınır / işletim |
|---|---|---|
| Tesseract OCR | Çevrimdışı; Windows/Mac için kurulum seçenekleri; yazı/rakam taraması | El yazısı/pseudo-yazı/imza ve küçük köşe izlerini kaçırabilir; nesne tanımaz. Ham görsel ve dört büyütülmüş köşe denetimi değerlendirilmeli. |
| Yerel Ollama + Gemma3:4b gibi görsel model | Yazı/imza benzeri işaret ve eşya çizimini bağlamıyla değerlendirebilir; JSON şema çıktısı | Model ve servis kurulmalı; model dosyası ~3.4 GB, çalışma RAM ihtiyacı bundan fazladır. CPU süresi ve sunucu kapasitesi ölçülmeli; model lisansı/koşulları incelenmeli. Küçük imzaları kaçırabilir; görsel test seti zorunlu. |
| COCO nesne dedektörü | Fincan/çatal/kaşık/kâse ve bazı cihazlarda yerel hızlı kontrol adayı | Standart sınıflarda çaydanlık/çay makinesi ve imza yok; yalnız bu model yeterli değil. Soyut motifin nesne sanılması ve illüstrasyon başarımı ölçülmeli. Model/uygulama lisansı ayrıca kontrol edilmeli. |
| Apple Vision OCR | Mevcut Mac’te indirmesiz pilot; örnekte imza izini buldu | Windows sunucuya taşınmaz; imza/eşya için yeterli değil. |

## Önerilen uygulama sırası

1. Windows sunucu RAM/CPU/GPU ve boş diskini doğrula; model denetimi için uygun ayrı yerel işlem kapasitesi ayır. Model/servis seçimi ve lisans koşulları kesinleşmeden büyük kurulum veya hosting değişikliği yapma.
2. Yalnız loopback üzerinde, otomatik cloud fallback olmadan yerel OCR + görsel model pilotu kur. Tüm model dosyaları önceden indirilmiş olsun; denetim sırasında görüntü dış servise gitmesin. Ollama için cloud/remote modeller kullanılmasın ve servis dış ağa açılmasın.
3. Ham görseli ve köşelerini denetle. Şema: hasText, hasSignature, hasObjects, uncertain. Model cevabındaki talimatları uygulama; çıktı yalnız sıkı boolean şemadan geçsin. OCR metnini kullanıcıya/loglara gereksiz dökme.
4. Üretim → yerel denetim → ancak kabulde dosya yayımlama. Reddedilirse en fazla bir ek üretim; timeout/servis yok/bozuk cevapta kontrol edilmemiş görseli temiz sayma. Yeni denetim çağrısı dışarı gitmez, yeniden görsel üretimi mevcut Cloudflare çağrısı olduğundan ek üretim maliyeti doğurur.
5. İmzalı/yazılı/eşyalı ve temiz doğal motif örneklerinden bir test setiyle yanlış kabul/yanlış ret oranlarını ölç. İstenen nesnelerin hem fotoğraf hem çizim örneklerini kapsa. Eşikler tek ekran görüntüsüne göre ayarlanmasın.

## Kaynaklar

- [Tesseract resmi kurulum belgesi](https://github.com/tesseract-ocr/tessdoc/blob/main/Installation.md)
- [Ollama yerel görüntü API](https://docs.ollama.com/capabilities/vision)
- [Ollama JSON şema çıktıları](https://docs.ollama.com/capabilities/structured-outputs)
- [Gemma3 model boyutları ve vision seçenekleri](https://ollama.com/library/gemma3)
- [COCO sınıfları](https://docs.ultralytics.com/datasets/detect/coco)

Bu belge mimari değerlendirmedir. Otomatik yazı/imza/eşya kapısı mevcut üretim akışına eklenmiş değildir; model kurulumu ve doğrulama bekler. Gizlice kabul edilmiş gibi gösterilmez.
