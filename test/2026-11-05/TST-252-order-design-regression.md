# TST-252 | Sipariş tasarım dosyaları — 9 task regresyon kabulü

05.11.2026. Başlangıç main/51b5513, temiz çalışma ağacı. Kapsam SIP-TAS-01…09; kullanıcı üretim hazırlığı değil, sipariş detayı/üç dosyanın testini istedi. Gerçek müşteri, sipariş, katalog veya kargo kaydı değiştirilmedi. Testler sentetik fixture ve geçici dosya deposunda; admin tarayıcı testleri ayrı 5174 portunda sahte API ile. Canlı admin ve IIS testi değildir. Uygulama kodu değişmedi; yeni kusur saptanmadı.

## Task bazında kontrol

| Task | Kabul kontrolü | Güncel sonuç / kanıt |
|---|---|---|
| SIP-TAS-01 | Sipariş/satır/ürün/SKU/renk, üç ayrı kart; üretim eylemi yok | Geçti: order-design-detail ve acceptance, dört genişlik. Mevcut kargo/sipariş eylemleri korunur. |
| SIP-TAS-02 | Sipariş anındaki revizyon ve üç görsel korunur | Geçti: OrderDesignSnapshotTests; sonraki revizyon, tasarım silme, katalog/maske/renk değişimi ve dosya deposu restart sonrası aynı SHA256/bayt. Gerçek SQL kabulü açık. |
| SIP-TAS-03 | Editörde kaydedilen konum/ölçek/döndürme/kavis/gövde/tuval aynı revizyonla gösterilir | Geçti: order-placement; gerçek sıfır/eksik ayrımı, iki tuval, iki bölge, desteklenmeyen/eski şema ve desen özeti eşleşme/uyuşmazlık. Fiziksel ölçü türetilmez. |
| SIP-TAS-04 | Ham desen ayrı, doğru sipariş/satır/revizyon/tür/isim | Geçti: API özgün bayt ve hash, Chrome gerçek download olayı/name/bytes ve tekrar kilidi. |
| SIP-TAS-05 | Maskelemede kullanılan ürün kaynak fotoğrafı ayrı | Geçti: API katalog/renk/maske değişimi sonrası aynı kaynak; MIME/hash/tuval kontrolü. Kaynak fotoğraftır; alfa maske dosyası değildir. |
| SIP-TAS-06 | Giydirilmiş önizleme görünür ve ayrı indirilir | Geçti: sipariş revizyon JPEG baytı, isim ve aynı dosyanın gösterim/indirmesi; temsilidir/baskıya hazır değildir etiketi. |
| SIP-TAS-07 | Yetki, eksik dosya ve hata başarı sayılmaz | Geçti: anonim/müşteri/başka müşteri/izinsiz/MFA/oturum ve sipariş-satır sınırları API testleri; üç dosya için 21 tarayıcı senaryosu. 404/403 sonrası odak ve indirme kapalı, 503/ağ kesintisi tekrar deneme, çift istek kilidi. |
| SIP-TAS-08 | Eski/eksik/kısmi kayıt dürüst gösterilir | Geçti: 7 tarayıcı senaryosu + API legacy/dry-run; güncel katalog/desen yedeği yok, eski doğrulanmamış kopya açıklamalı. Gerçek veri envanteri/geri doldurma kararı bu testte yapılmadı. |
| SIP-TAS-09 | Ekran/regresyon/kanıt ve açık kabul kaydı | Teknik regresyon geçti; 320/390/768/1440 px, normal/%200 metin, axe ciddi/kritik 0, klavye/odak/duyuru kontrolü. Manuel ekran okuyucu/PM kabulü değil. |

## Çalıştırılan doğrulamalar

- API: `dotnet test tests/Xinobi.Architecture.Tests --no-restore -m:1 -p:UseSharedCompilation=false --filter 'FullyQualifiedName~OrderDesignSnapshotTests|FullyQualifiedName~AdminDesignOrderTests|FullyQualifiedName~AdminDesignImageTests' --verbosity quiet`: 36 PASS / 1 SKIP / 0 FAIL. Atlanan: opt-in gerçek SQL tasarım-sipariş testi; ortam yok.
- Admin `pnpm --filter admin build`: TypeScript + üretim derlemesi PASS.
- Admin `pnpm --filter admin lint`: 0 hata; kapsam dışındaki AuditHistory/SurfaceMasks içinde 4 mevcut uyarı.
- `order-design-acceptance.mjs`: dört genişlikte PASS, axe ciddi/kritik 0, normal/%200 taşma yok, üç indirmeye klavye erişimi; üretim kontrolleri yok.
- `order-design-detail.mjs`: dört genişlik, üç dosya içeriği/isimleri ve hata/tekrar senaryoları PASS.
- `order-design-file-states.mjs`: 21/21 PASS.
- `order-design-legacy-matrix.mjs`: 7/7 PASS.
- `order-placement.mjs`: revizyon/yerleşim/şema/sıfır ve eksik ayrımı PASS.
- Temsilî 390 ve 1440 px ekranlar görsel incelendi; bu klasördeki görüntüler tamamen sentetik. Siyah kompozisyon 1x1 JPEG fixture'ıdır; gerçek ürün görsel kabulü değildir.
- Tüm API paketi bu taskta yeniden çalıştırılmadı; ilgili filtre ve admin regresyonları çalıştırıldı. API kaynakları değişmedi. Web/Flutter/deploy/APK bu kapsamda yok.

## Açıklar ve kapanış koşulları

| Açık | Neden / bağımlılık | Kapanış koşulu |
|---|---|---|
| Gerçek SQL kalıcılık/restart/eşzamanlılık | İzole SQL test ortamı yok | Ayrı boş SQL ortamında sipariş yerleşimi ve üç hash aynı; eşzamanlı kayıtta yarım bağ yok. JSON roundtrip/dosya deposu bu kabul değildir. |
| IIS ve gerçek dosya teslimi | Deploy yetkisi bu taskta yok | Yayın sonrası HTTPS/same-origin personel erişimi, üç attachment ve yetkisiz ret kontrolü. |
| İş sahibi ve gerçek görsel kabulü | Sentetik fixture gerçek ürün görselinin doğruluğunu kanıtlamaz | Yetkili test siparişinde desen/kaynak/kompozisyon indirilip sipariş revizyonuyla görsel karşılaştırılır; PM kabulü kaydedilir. |
| Ekran okuyucu/cihaz | axe ve klavye otomasyonu yeterli değil | VoiceOver/NVDA ve gerçek dokunmatik cihazda manuel kabul. |
| Eski veri envanteri/audit politikası | Ayrı ortam/ürün kararı | Onaylı read-only envanter ve geri doldurma/indirme audit kararı. Veri bu işte değiştirilmedi. |

Sonuç: Dokuz taskın otomatik teknik kabulü güncel kod üzerinde doğrulandı. Gerçek SQL/IIS/cihaz ve iş sahibi kabulü açık; dokuz task koşulsuz kapatılmadı. Üretime hazırlama, fiziksel baskı profili veya üretim dosyası eklenmedi.
