# AI desen prompt v3 — 27.10.2026

## Değişiklik

`xinobi-art-direction-3`: olumlu doğa motifi tarifi, büyük/küçük motif hiyerarşisi, zemin/ana/destek/vurgu renk rolleri, daha belirgin botanik ve dalga yönü. Uzun eşya/yazı listesi yerine yalnız doğa motifleri ve kısa yazısız/markasız görsel tarifi. Beş soru, stil/yoğunluk önceliği, model, dört adım, tek sonuç, kota ve kayıtlı oturum davranışı korunur. Yalnız mavi paletin renk rol sırası beyaz zemin/lacivert ana motif olacak şekilde değişir.

## Doğrulama

Komut: `dotnet test tests/Xinobi.Architecture.Tests --filter 'FullyQualifiedName~DesignArtDirectionTests|FullyQualifiedName~DesignStudioTests' --no-restore --verbosity quiet`.

Sonuç: **25 geçti / 0 hata / 0 atlama**. Tüm 32.768 cevap birleşiminde prompt 1–2.048 karakter sınırına uyar. Minimal/yoğunluk, suluboya/gravür teknikleri, monokrom/renk rolleri, yalnız repeat için kenar eşleşmesi, soru sırasından bağımsızlık, geçersiz cevap reddi, saklanan prompt/sürüm, idempotency, kota ve yeniden başlatmada kayıt korunması kapsanır. Sağlayıcı sahtedir; yeni ücretli görsel üretilmedi.

İlk koşu: 21 geçti/4 hata; sahte sağlayıcı eski `No text` cümlesini bekliyordu. Beklentiler yeni semantik sözleşmeye uyarlandı. İkinci koşu: 23 geçti/2 hata; temel IsolatedApiFactory yeniden uyguladığı ticaret dizini yüzünden kalıcılık testleri beklenen sessions.json yolunu okuyamıyordu. DesignStudioTests fixture'ına açık ve benzersiz `DesignStudio:DataDirectory` verildi; yalnız test dizinini etkiler. Son koşu 25/25 geçti; uygulama saklama yolu değiştirilmedi.

`git diff --check` temiz. Yerel standart servis başlatıcısı kontrollü yenilendi; API readiness HTTP 200, SQL ready; `http://127.0.0.1:3000/xinobi-u/` HTTP 200. Test sonrası yeni API süreci 5003'te dinliyor.

## Görsel değerlendirme ve yayın sınırı

Yerel yeni üretimler v3'ü kullanır. Eski hazır görseller veya kuyruğa alınırken kaydedilmiş eski promptlar yeniden yazılmaz. Kalite, yazı/nesne bulunmaması ve ürün üstündeki estetik henüz gerçek üretimle değerlendirilmedi. OCR/nesne tespiti eklenmedi. Kullanıcı örnekleri ile iterasyon yapılacak; [deneme planı](../../docs/xinobi-u-art-direction.md).

Canlı IIS deploy, APK ve migration yapılmadı. Web/mobil aynı API sanat yönünü kullanır; canlı uygulama için API güncellemesi gerekir.
