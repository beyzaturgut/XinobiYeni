# TST-261 — KIS-TEK-05 tek kaynak maskeleme

06.11.2026 · Admin uygulaması tamam. [Runbook ve açık sınırlar](../../docs/runbooks/single-source-masking.md), [task planı](../../docs/tasks/personalization-single-source-tasks-2026-11-06.md).

## Uygulama

Ürün yüzeyleri ekranı artık ürün başına tek kayıt ve katalogda kaydedilmiş sourceRevision/sourceSha256 kullanır. Renk satırı/arama alanı, önizleme rengi, ortak renk listesi, aynı konum kutusu ve toplu onay çağrısı kaldırıldı. Kaynak yoksa ilk varyanta düşmek yerine katalog yönlendirmesi var.

Maskeleme promptu, kaynak indir, gerçek WebP yükleme, örnek desen, taslak WebP indirme, tek onay, taslağı/onayı kaldırma çalışır. Promptun logo/kulp/parça/koordinat/alfa talimatları aynı kaldı; otomatik başlıktaki varyant/renk yerine ürün ve kaynak sürümü kullanılır, ölçüler kaynaktan gelir. HEAD’deki eski fonksiyonla legacy girdi çıktısı birebir; yeni girdi yalnız metadata başlığı değiştirilmiş eski çıktıyla birebir karşılaştırıldı.

Maske ve kaynak geçmişi personalization-profiles içinde korunur. Kaynak fotoğraf değiştirilince eski maske bu fotoğrafa taşınmaz. Profil revizyonu kaynak revizyonundan ayrılır; katalog kaynak ekranı doğru kaynak sürümünü gösterir. Eski katalog varyant maskeleri/sipariş kopyaları değiştirilmez. Mağaza/Flutter/checkout yeni profile henüz bağlanmadı.

## API kontrolleri

6 yeni SingleSourceMaskTests ve 6 PersonalizationSourceTests birlikte **12 PASS**:

- Liste ürün başına tek kayıt; kaynak yokken fallback ve taslak yok.
- 7001×5 kaynağa aynı boyutlu maske yükleme → taslak → gerçek WebP export → onay → onayı kaldır; geçmiş dosyalar, katalog JSON’u ve sipariş kaynak sentinel baytları aynı.
- Onaylı maskeden sonra fotoğraf değişimi: durum stale, eski onay yok; eski action ve download kimliği 409. Eski maske baytları okunabilir kalır. Yeni kaynakta yeni taslak/discard çalışır.
- Eski media konumundaki maske, profil JSON’u veya dosyası değiştirilmeden korumalı adresten okunabiliyor; anonim erişim reddediliyor.
- Yanlış boyut, PNG’yi WebP gibi gönderme, yanlış hash ve eski profil revizyonu reddedilir; mevcut taslak ezilmez.
- Eksik/bozuk maske hata; anonim workspace ve ham maske dosyası okuması 401. Yeni dosyalar özel designs alanında, geçmiş/güncel maske indirmeleri personel catalog.read ile korunuyor. Kaynak yönetiminin müşteri/yetki ve null belge testleri sürer.

**Tam API regresyonu: 607 PASS / 29 SKIP / 0 FAIL.** Atlananlar gerçek SQL/ortam gibi önceden açık kapılardır; kabul edilmiş sayılmadı. API Release build 0 hata/uyarı.

## Tarayıcı / UI

Tüm API/medya istekleri izole fixture ile karşılandı; gerçek katalog, müşteri veya sağlayıcıya yazma yok.

- Kaynak promptunda 113×67 ve kaynak sürümü 1, sonraki kaynakta 79×91 doğrulandı; eski renk/toplu onay kontrolleri yok.
- Kaynak indirme orijinal baytları koruyor. WebP upload request yalnız bu ürünün kaynak/revizyonunu içeriyor; colors/samePlacementConfirmed gönderilmiyor.
- Yükleme hatasında dosya korunuyor; başarıda dosya input’u temizleniyor. Ürün değişimi/gezinti ve busy/dirty koruması sürer.
- Örnek desen kaynak tuvalinde gösteriliyor; maske dışı canvas alfa 0, iç alan alfa >0.
- WebP indirme 503’ü başarı sayılmıyor; başarılı indirme baytları fixture WebP’siyle eş. Onay iptali yazma üretmiyor; kabul sonrası exact draftId ile tek onay.
- Kaynak fotoğraf önizlemesi HTTP hatası verirse maske yükleme/onay kapalı; retry güncel fotoğrafı yeniden yükler.
- Kaynak değişiminde eski canvas temizleniyor, onay kapanıyor, prompt yeni ölçüyü alıyor. Kaynak yok/stale/servis hatası ve readonly durumları ayrı.
- 320/390/768/1440 px ve 2x metin: yatay taşma yok. Yeni ekran axe kritik/ciddi 0. Prompt alanındaki uzun erişilebilir ad ve düşük renk kontrastı düzeltilip yeniden PASS.
- admin-consistency-states.mjs yeni rotaya uyarlandı: **15 senaryo PASS**; readonly maske yazma kontrolleri korunur.
- Tüm admin paketleri seri, isolated-browser guard ile: **24/24 PASS**. Son sol araç alanı yerleşimi ve ek yanıt doğrulaması sonrası yeni maske paketi ayrıca PASS.
- Admin lint: 0 hata / 1 eski AuditHistory uyarısı; SurfaceMasks’in önceki 3 uyarısı yeni bileşende kalmadı. TypeScript/Vite üretim build PASS.

## Görsel inceleme

[1440px](single-source-mask/mask-1440.png), [320px / büyütülmüş metin](single-source-mask/mask-320-2x.png). Ürün görseli sentetik 113×67 gri canvas, fiziksel ürün kabulü değil. Kaynak/prompt sol araç alanında, önizleme ve işlem alanları eski ekran hiyerarşisinde. İlk full-page çekimde scroll kaynaklı sticky başlık artefaktı görüldü; sayfa başına dönülerek son ekranlar tekrar alınıp incelendi. Gerçek cihaz/VoiceOver/TalkBack kabulü yapılmadı.

## Açık sınırlar

- Eski varyant bazlı/private toplu onay rotası henüz emekliye ayrılmadı; yeni ekran bu rotaları çağırmaz. Eski public renderer/manifest/TS-Dart müşteri sözleşmesi ve legacy yazma rotalarını kapatma KIS-TEK-06’da açık.
- Sabit kaynak tuvali yok. Kaynak 25 MB, WebP 8 MB ve mevcut decoder normalizasyonu 20 MP teknik bütçesi korunur. 20 MP üstü maske için açık capacity/413; otomatik küçültme veya boş/hizasız diye yanlış hata yok. Kapasite politikasının genişletilmesi 06’da açık; sınırsız maske çözünürlüğü kabulü verilmedi.
- Dosya ve SQL commit birlikte atomik değil; hata/yeni sürüm yarışında referanssız yeni medya oluşabilir. Geçmiş dosyalar silinmez. Gerçek SQL çoklu süreç, IIS yedek/restore, fiziksel ürün ve gerçek AI maske sağlayıcı sonucu doğrulanmadı.
- Deployment/APK veya gerçek veri geçişi yapılmadı. Yerel servisler yeni API ile yeniden başlatıldı; HTTP kontrolleri ayrıca kaydedildi.
