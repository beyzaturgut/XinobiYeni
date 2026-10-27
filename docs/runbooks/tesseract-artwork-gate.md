# Üretim sonrası yerel Tesseract kapısı

27.10.2026. Ham AI deseni yalnız yerel Tesseract işlemiyle denetlenir; görüntü başka modele/servise gönderilmez. Kullanıcının yüklediği görseller, ürün fotoğrafları, mockup veya ekrandaki Temsilidir etiketi taranmaz. Yeni AI üretimleri için akış: üret → tam görsel + büyütülmüş dört köşeyi OCR ile tara → temizse yayımla. İki veya daha fazla harf/rakam içeren OCR izi, güven puanı düşük olsa da şüphelidir. Yalnız noktalama veya tek karakter gürültüsü ret oluşturmaz. OCR bu nedenle bazı yazıları/imzaları kaçırabilir ve doğal motifleri yazı sanabilir; kusursuz garanti yoktur.

İlk aday reddedilirse bir ek üretim yapılır; iki ret sonrası artwork_rejected. OCR çalışmaz/timeout/bozuk görüntü olursa artwork_review_unavailable, ek üretim yok. Hiçbir reddedilen aday assets dizinine yazılmaz veya image endpointinden sunulmaz. İstek tekrarı mevcut sonucu döndürür; ekstra üretim başlatmaz. Oturumda GenerationAttempts ve Inspections metadata saklanır; okunan ham metin loglanmaz/saklanmaz. Günlük kota oturum bazlı kalır; bir oturum en fazla iki mevcut Cloudflare üretim çağrısı yapabilir, ek üretim maliyeti oluşabilir.

Tesseract eşya dedektörü değildir. Bu teslim eşya kontrolünü veya kapsamlı imza sınıflandırmasını tamamlamaz. Yerel görsel model ayrıca kurulup doğrulanmalıdır. Geçmiş hazır görseller değiştirilmez/geriye dönük denetlenmez.

## Kurulum

Mac: `brew install tesseract`; bu makinede 5.5.3 kuruldu. İngilizce `eng` verisi gerekir; harf/rakam/imza izleri dil düzeltmesi olmadan TSV üzerinden okunur. Windows IIS sunucusunda da yerel Tesseract ve eng verisi kurulmalıdır; Mac kurulumu sunucuya taşınmaz. [Resmi kurulum rehberi](https://github.com/tesseract-ocr/tessdoc/blob/main/Installation.md).

Varsayılan arama servis PATH'indedir. Özellikle IIS için dış sunucu ayarına mutlak executable yolu ekleyin; secret gerekmez:

```json
{
  "DesignStudio": {
    "Ocr": { "Executable": "C:\\Program Files\\Tesseract-OCR\\tesseract.exe" }
  }
}
```

JSON dosyasında Windows ters eğik çizgileri örnekteki gibi çift yazılmalıdır. IIS havuz kimliği executable/tessdata okuma-çalıştırma, kendi geçici dizinine yazma iznine sahip olmalıdır. OCR çıktısı ve geçici görseller shell komutuna eklenmez: ProcessStartInfo.ArgumentList ile verilir; dosyalar GUID adlı temp dizinde, finally temizliğiyle tutulur. Stdout/stderr sınırı 1 MB; işlem başına timeout 10 saniye; işlem ağacı iptalde kapatılır. 12 MB dosya / 40 MP decode sınırı; desteklenmeyen/bozuk görüntü reddedilir. Worker toplam sınırı en çok iki üretim + OCR için 360 saniyedir.

`GET /api/v1/design-studio/status` configured ancak üretici ve yerel executable hazırsa true döner. Eng verisi/runtime izinleri dosya varlığı kontrolünden sonra bozulursa aday denetimde engellenir. Eksik executable üretim isteğini sağlayıcı çağrısından önce 503 ile durdurur. Güncel API ve web birlikte yayımlanmalıdır. Sunucuda OCR kurulmadan yeni API yayımlanırsa yeni tasarım üretimi bloklanır; mevcut hazır tasarımlar etkilenmez.

## Test ve sınırlar

[Test kaydı](../../test/2026-10-27/TST-tesseract-artwork-gate.md). Üretim sağlayıcısı testlerde sahtedir; otomatik pahalı/canlı üretim yapılmadı. Windows kurulum ve gerçek cihaz kontrolü ayrıca yapılmalı.
