# Sipariş tasarım detayı — son test ve kabul matrisi (SIP-TAS-09) — 03.11.2026

Kapsam: [SIP-TAS-01…09](../docs/tasks/order-design-detail-scope-2026-11-03.md). Kaynak kesiti `main / 8d02569` + SIP-TAS-09 testleri. Bütün kanıtlar izole fixture ve sentetik veriyle üretildi. Gerçek hesap, sipariş, katalog ve SQL kullanılmadı. Otomasyon; ekran okuyucu, fiziksel cihaz ya da iş sahibi kabulü yerine geçmez.

İşaretler: **K** kontrol edildi · **D** bu çalışmada düzeltildi · **A** açık.

## 1. SIP-TAS-01…08 durumu

Her satır kaynak ve test kaydına dayanır. Durum sütunundaki ifadeler, task listesindeki resmi durum değerleriyle aynıdır.

| Task | Commit | Kanıt | Durum |
|---|---|---|---|
| SIP-TAS-01 sade sipariş tasarım detayı | `eb7f3b4` | TST-207…210 | Uygulandı - kabul açık |
| SIP-TAS-02 dosya ve revizyon bağı | `55ed208` | TST-211…214 | Uygulandı - SQL kabulü açık |
| SIP-TAS-03 kayıtlı yerleşim | `8b38bd2` | TST-215…218 | Uygulandı - kabul açık |
| SIP-TAS-04 ham desen indirme | `ad7e2da` | TST-219…222 | Uygulandı - kabul açık |
| SIP-TAS-05 ürün kaynak görseli indirme | `9d530b9` | TST-223…226 | Uygulandı - kabul açık |
| SIP-TAS-06 giydirilmiş önizleme | `cbf4e47` | TST-227…230 | Uygulandı - kabul açık |
| SIP-TAS-07 yetki ve işlem durumları | `1d9aa61` | TST-231…234 | Uygulandı - canlı/SQL kabulü açık |
| SIP-TAS-08 eski ve eksik kayıtlar | `8d02569` | TST-235…238 | Uygulandı - gerçek envanter/karar açık |

Hiçbir task bu son test sırasında sessizce tamamlanmış sayılmadı. Her birinin açık kabul koşulu aşağıdaki §5'te durur.

## 2. Senaryo kapsamı

| Senaryo | Kanıt | Sonuç |
|---|---|---|
| Sipariş, satır, ürün, varyant, SKU, renk, adet, tasarım, konfigürasyon revizyonu, şema, yerleşim (gövde ayarları dahil) ve desen özeti tek kayıtta | `AcceptanceBindsLineIdentityPlacementAndAllThreeFilesAcrossEditsAndRestart` | K |
| Üç dosyanın bayt, SHA-256, tür, boyut ve ad eşliği; `X-Xinobi-File-Check: sha256`; personel ve müşteri görünümünde aynı bağ | aynı test + TST-219/223/227 | K |
| Tasarım adının değişmesi, yeni revizyonlar, yeni katalog fotoğrafı ve maske, renk görseli değişimi, tasarım silme | aynı test + TST-211/223/227 | K |
| Aynı veri klasöründe yeni sunucu örneği (dosya deposu) | aynı test | K (Development dosya deposu; SQL değil) |
| Eski şema veya desteklenmeyen şema, yerleşimsiz kayıt, SIP-TAS-02 öncesi kayıt | TST-215, TST-235, `order-design-legacy-matrix` | K |
| Eksik veya bozuk dosya (404 / 503), kopyası hiç oluşmamış dosya | TST-219…235 | K |
| Yanlış rol: anonim, müşteri, başka müşteri, `orders.read` izni olmayan personel, MFA'sız personel, süresi dolmuş oturum | TST-231 | K |
| Kesinti: depo 503, ağ kopması; servis hatası eksik kayıt gibi sunulmuyor | TST-231, TST-234, TST-238 | K |
| Hızlı tekrar (kilit, tek istek) ve tekrar deneme | TST-234 (21 senaryo) | K |
| Tekrar sipariş isteği, yarım kopya, eski revizyon | TST-211 | K |
| Yol aşımı ve keyfi URL, açık medya adresinden sızma | TST-223, TST-231 | K |

## 3. Ekran matrisi (admin sipariş detayı + Tasarımlar ekranı)

| Kontrol | 320 px | 390 px | 768 px | 1440 px |
|---|---|---|---|---|
| Kimlik bölgesi (sipariş, SKU, varyant, renk, konfigürasyon, revizyon satırı) | K | K | K | K |
| Yerleşim (birimler, kaydedilmemiş ile gerçek sıfır ayrımı, gövde ayarları) | K | K | K | K |
| Üç ayrı görsel kartı ve “Temsilidir … Baskıya hazır dosya değildir” etiketi | K | K | K | K |
| Taşma, 1x metin | K | K | K | K |
| Taşma, %200 metin (test her öğenin yazı boyutunu ikiye katlıyor; iç içe metin daha da büyüyor) | K | K | K | K |
| axe (WCAG 2.1 A/AA, kritik ve ciddi) pencere içinde | K (0) | K (0) | K (0) | K (0) |
| Klavye: Tab sırası üç indirmeye ulaşıyor, odak görünür, odak pencerede kalıyor, Enter ile indirme başlıyor | K | K | K | K |
| Durum duyurusu (`role=status` / `role=alert`), dürüst “tarayıcıya verildi” metni | K | K | K | K |
| Escape ile kapanma ve odağın sipariş satırına dönmesi | K | K | K | K |
| Görsellerin metin karşılığı (alt) | K | K | K | K |
| Üretim eylemi yok: üretime gönder, onay/red, render kuyruğu, kalibrasyon, fiziksel profil | K | K | K | K |
| Mevcut sipariş eylemleri korunuyor (Hazırlanmaya başla, Kargoya ver) | K | K | K | K |
| Tasarımlar ekranında profil/kalibrasyon yok, tasarım listesi ve sipariş bağı var | — | — | — | K |

Bu çalışma ve önceki tasklar sırasında ekranda düzeltilenler (**D**):

- Sipariş penceresi etiket kontrastı (#9a9a9a → #616161; SIP-TAS-01).
- Pencere ızgarası ve not alanının %200 metinde taşması (SIP-TAS-01).
- Görsel kartı iç sütununun 5993 px'e genişlemesi (SIP-TAS-04).
- Kilitli indirme düğmesinin odağı kaybetmesi; “indirildi” diye gerçeği yansıtmayan başarı iddiası (SIP-TAS-07).

Görseller: [test/2026-11-03/order-design-acceptance/](../test/2026-11-03/order-design-acceptance/).

## 4. Gözlemler

- **%200 metinde tek seferlik taşma:** 320 px kontrolü, beş koşudan ilkinde bir kez taşma bildirdi. O koşuda taşan öğe kaydedilmedi; sonraki dört koşuda ve ölçümden önce iki kare beklendikten sonraki iki koşuda taşma yok. Aynı durum SIP-TAS-03'te de bir kez görülmüştü. Kalıcı bir taşma bulunmadı. Test artık taşma olursa taşan öğeleri listeliyor.
- **Web e2e:** `design-configuration.spec.ts` 17/18 geçti. Düşen “pattern can be added, previewed in cart…” testi canvas `toDataURL` sırasında kararsız davranıyor ve SIP-TAS-06 öncesi baseline'da da düşüyordu (TST-230). Bu çalışmada düzeltilmedi.

## 5. Açıklar: neden ve kapanış koşulu

| Açık | Neden | Kapanış koşulu |
|---|---|---|
| İzole SQL kalıcılığı ve yeniden başlatma (KIS-03, SIP-TAS-02) | `XINOBI_TEST_SQL` tanımlı değil, izole SQL Server yok; 17 SQL testi atlandı. Gerçek yerel kimlik bilgileri okunmaz. | Boş, izole bir SQL veritabanında sipariş ver → yeniden başlat → üç dosya ve yerleşim aynı (SHA-256) → eşzamanlı yazmada yarım bağ yok; tarihli tutanak. |
| Canlı sunucu (IIS, aynı origin, HTTPS çerezleri) | Deploy bu task kapsamında değil. | Canlı ortamda personel ile üç indirme ve ad başlığı; yetkisiz rol reddi; tutanak. |
| Ekran okuyucu ve gerçek cihaz (VoiceOver, NVDA; dokunmatik) | Otomasyon bu kabulün yerine geçmez. | Sipariş penceresi, yerleşim ve üç indirme duyurularıyla elle denenir (QA-03). |
| İş sahibi / rol / PM kabulü (UAT-04/08) | Kullanıcı kabulü verilmedi. | Gerçek sipariş örnekleri üzerinde inceleme ve indirme kabulü, imzalı karar. |
| Gerçek veride eski kayıt envanteri ve geri doldurma | Dry-run yalnız fixture'da çalıştı; gerçek veriye dokunulmadı. | Onaylı ortamda `order-design-files-dry-run` raporu; desen referansı geri doldurma kararı ([runbook](../docs/runbooks/order-design-files-dry-run.md)). |
| Doğrulanmamış eski kompozisyonun referans olarak kaydı | Ürün kararı gerekiyor. | Karar kaydı. |
| Personel indirmelerinin denetim kaydına (audit) yazılması | Mevcut yaklaşım yalnız değişiklikleri kaydediyor. | SEC-07 kararı; gerekirse ayrı task. |
| Mobil (Flutter) kaynaklı siparişlerde önizleme yüklemesi | Flutter bu seri kapsamında değil, incelenmedi. | Mobilden verilen kişiselleştirilmiş siparişte `Files.Composition` dolu mu kontrol edilir (Faz11). |
| Kararsız web e2e testi | Testin kendisi kararsız. | Testte canvas karşılaştırması sayfa geçişinden önce bitecek şekilde düzeltilir. |
