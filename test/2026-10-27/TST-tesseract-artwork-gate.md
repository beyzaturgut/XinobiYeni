# Yerel Tesseract üretim kapısı — 27.10.2026

## Uygulama

Yeni IArtworkInspector/LocalArtworkInspector yalnız yerel Tesseract 5.5.3 işlemi çalıştırır. Yeni AI adayları tam görsel ve iki kat büyütülmüş dört köşede OCR’dan geçer; iki veya daha çok harf/rakamlı iz, düşük güvenle bile şüphelidir. Ham OCR yazısı loglanmaz/saklanmaz. Şüpheli aday dosyası yayımlanmaz. En fazla iki üretim denemesi; kontrol hatasında yeniden üretim yok. İstek tekrarı ek çağrı yapmaz. Geçici dosyalar finally ile temizlenir; çıktı/bellek/zaman sınırları ve shell yerine ArgumentList kullanımı vardır. Boş/bozuk TSV kontrolü temiz sayılmaz. Başlatma ve worker aşamalarında eksik executable kontrolü var.

## Kontroller

Komut: `dotnet test tests/Xinobi.Architecture.Tests --filter 'FullyQualifiedName~DesignStudioTests|FullyQualifiedName~DesignArtDirectionTests|FullyQualifiedName~LocalArtworkInspectorTests|FullyQualifiedName~XinobiUTests|FullyQualifiedName~SavedDesignTests' --no-restore --verbosity quiet`.

Son hedefli koşu: **54 geçti / 0 başarısız / 0 atlandı**. Sahte üretici ve test inspector ile temiz aday, ilk ret/ikinci temiz, iki ret, OCR runtime hatası, eksik executable ve idempotency; gerçek görüntü endpointinde ret sırasında 404 ve asset dizininde aday bulunmaması; düşük güvenli yazı, tek karakter/noktalama gürültüsü ve geçersiz TSV; mevcut XINOBI U/kayıtlı tasarım ve 32.768 prompt birleşimi kapsanır.

İlk genişletilmiş koşuda SavedDesignTests.ConfigurationCanReplaceColourAndSourceWithoutRewritingOldRevisions fixture’ın beklediği dizin bulunmadı: IsolatedApiFactory ticaret dizinini yeniden belirlerken dosya assertion’ı başka geçici yola bakıyordu. SavedDesignTests ConfigureServices aşamasında kendi dizinini yeniden belirler; yalnız test izolasyonu değişti. Sonraki 52 test geçti; boş TSV kontrolü eklendikten sonra 54 test geçti. Üretim verisi kullanılmadı.

- Gerçek çevrimdışı bileşen denemesi: /private/tmp/xinobi-ocr-probe geçici console uygulaması gerçek LocalArtworkInspector çağırdı. Sentetik temiz motif: HasText=false. Kullanıcının paylaştığı sağ alt imza bölgesi: HasText=true. Crop yalnız bu lokal değerlendirme için RAM/temp dosyada kaldı, repoya eklenmedi.
- İlk gerçek imza denemesi yüksek confidence eşiği nedeniyle kaçtı; eşik yerine OCR’ın çok karakterli izlerini şüpheli sayma kuralı uygulandı ve aynı gerçek örnekte geçti. Bu, başka bütün imzaların bulunacağı garantisi değildir; tek karakterli işaretler kaçabilir, doğal motifler yanlış reddedilebilir.
- Web `pnpm --filter web exec tsc --noEmit` ve değişen questionnaire için ESLint geçti. `git diff --check` temiz.

## Dağıtım ve sınırlar

[Runbook](../../docs/runbooks/tesseract-artwork-gate.md). Mac’te yerel Tesseract kurulu; API standart başlatıcıyla yenilendikten sonra yeni üretimler denetlenir. Windows IIS için Tesseract/eng, executable yolu ve servis izinleri ayrı kurulmalıdır. Yeni dış denetim çağrısı, otomatik gerçek/ücretli görsel üretimi, APK, canlı deploy veya migration yapılmadı. Eşya tespiti ve kapsamlı imza sınıflandırması bu teslim değildir. Geçmiş hazır görseller geriye dönük denetlenmedi.

## Yerelde etkinleştirme

Standart başlatıcı kontrollü yenilendi. API readiness HTTP 200 / SQL ready, design-studio/status configured=true, XINOBI U sayfası HTTP 200 doğrulandı. Windows JSON örneği ayrıştırıldı ve yeni doküman bağlantıları kontrol edildi. Bu kontroller yeni AI üretimi başlatmadı.
