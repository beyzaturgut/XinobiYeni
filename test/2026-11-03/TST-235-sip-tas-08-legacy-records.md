# SIP-TAS-08 — Eski ve eksik sipariş tasarım kayıtları / 03.11.2026

Kapsam: [SIP-TAS-08](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-08---eski-ve-eksik-sipariş-kayıtlarını-dürüst-ele-al). Değişiklik API, admin ekranı ve salt okunur bir konsol komutuyla sınırlı. Gerçek iş kayıtlarında toplu veri değişikliği yapılmadı. Web mağazası, Flutter, hosting, deployment ve APK değişmedi.

## Önkoşullar

- **SIP-TAS-02 (`55ed208`):** sipariş satırına `Files` referanslarını yazar.
- **SIP-TAS-07 (`1d9aa61`):** yetkiyi ve hata sözleşmesini sağlar.

İkisi de kod ve test üzerinden doğrulandı.

## Eski kayıt envanteri

| Varyasyon | Kaynak | Ekran/API davranışı |
|---|---|---|
| Yalnız desen (yerleşimsiz, şemasız, `Files` yok) | Konfigürasyonsuz eski sipariş | Desen görünür ve indirilebilir, “doğrulama özeti kaydedilmedi” notuyla. Yerleşim, kaynak görsel ve kompozisyon için neden yazılır; düğme yok. |
| Yerleşim var, `Files` yok | SIP-TAS-02 öncesi sipariş | Desen ve sipariş anında kopyalanan kompozisyon görünür ve indirilebilir, doğrulanmamış diye etiketlenir. Kaynak görsel için “saklanmadan önce verilmiş” yazar. |
| Yerleşim var, `Files` yok, kompozisyon kopyası yok | Eski sipariş, önizlemesiz | Kompozisyon için sunucu nedeni (“kopya oluşmamış”) gösterilir; tekrar dene ve düğme yok. |
| `Files` var, kompozisyon `null` | Revizyon için önizleme yüklenmemiş | Kompozisyona istek gönderilmez; “yüklenmemişti” yazar. Diğer iki dosya indirilebilir. |
| `Files` var, kaynak `null` | Kısmi kayıt | “Kopyası kaydedilmemiş” yazar; diğer dosyalar etkilenmez. |
| Desteklenmeyen şema (2) | İleri sürüm | Yerleşim yorumlanmadan gösterilir (SIP-TAS-03); üç indirme ayrı ayrı açık kalır. |
| Servis kesintisi | 503 / ağ | “Şu anda alınamadı; kaydın olup olmadığı bilinmiyor” mesajı ve tekrar dene çıkar. Eksik kayıt gibi sunulmaz; diğer kartlar çalışmaya devam eder. |

Her kart ve yerleşim alanı bağımsız değerlendirilir. Bir dosyanın eksik olması diğer doğrulanmış indirmeleri gizlemez.

## Yapılan değişiklik

- **API, kompozisyon:** SIP-TAS-02 öncesi bir sipariş (`Files` yok, yerleşim var) sipariş anında kopyalanmış kendi kompozisyonuna sahipse bu dosya sunulur.
  - Dosya, siparişin kendi anahtarıyla saklanır ve sonradan yeniden yazılmaz.
  - JPEG türü kontrol edilir.
  - Yanıta `X-Xinobi-File-Check: unrecorded` başlığı eklenir.
  - Kopya yoksa `order_composition_not_recorded` döner ve nedeni yazar.
- **API, desen ve kaynak:** desen yanıtı `sha256` ya da `unrecorded`, kaynak yanıtı `sha256` başlığını taşır. Development CORS bu başlığı açar.
- **Admin ekranı:**
  - Eski desen ve kompozisyon için “Eski sipariş: … doğrulama özeti kaydedilmedi” notu eklendi.
  - Kaynak görselde “saklanmadan önce” ve “kaydedilmemiş” ayrımı yapıldı.
  - Kompozisyon için `Files` olmayan eski siparişlerde sunucuya soruluyor. İndirme düğmesi yalnız dosya yüklendikten sonra görünüyor.
  - 503 ve ağ hatası mesajlarında “kaydın olup olmadığı bilinmiyor” yazıyor.
- **Dry-run komutu:** `dotnet Xinobi.Api.dll order-design-files-dry-run` (`OrderDesignFilesDryRun`). Salt okunur bir JSON envanteri ve kanıta dayalı öneriler üretir; depo okunamazsa çıkış kodu 2 olur ve rapor yazılmaz.
  - Kanıta dayalı tek otomatik öneri `record-pattern-reference`: kopya, yerleşimin desen özetiyle eşleşiyor.
  - Kompozisyon için öneri `decide-unverified-composition`: karar gerektirir, otomatik uygulanmaz.
  - Ürün kaynak görseli hiçbir durumda geri doldurulmaz.
  - Kullanım ve geri dönüş planı: [runbook](../../docs/runbooks/order-design-files-dry-run.md).
- Güncel katalog görseli, yeni tasarım revizyonu, fiziksel ölçü veya varsayılan sıfır kullanılmadı.

## Kontroller

- **TST-235 / API FIXTURE:** `OrderDesignSnapshotTests` 15/15 PASS; bunlardan 2'si yeni.
  - **Eski sipariş:**
    - Desen ve kompozisyon kopyaları `unrecorded` başlığıyla doğru baytları veriyor.
    - Kaynak `not_recorded` ve “saklanmadan önce” mesajı veriyor.
    - Kopyası olmayan kompozisyon `not_recorded` ve “kopya oluşmamış” mesajı veriyor.
    - Güncel siparişlerde üç dosya da `sha256` veriyor.
    - Depo kesintisi 503 veriyor; `not_recorded` dönmüyor.
  - **Dry-run:**
    - Durumlar doğru: tam kayıt `verified`; eski kayıtta desen `provable` + öneri, kaynak `not-kept`, kompozisyon `order-copy-unverified` + karar önerisi; yalnız desenli kayıt `unprovable`/`no-placement`; önizlemesiz kayıt `not-uploaded`; bozulmuş kopya `checksum-mismatch`.
    - Plan öncesi ve sonrası sipariş JSON'u ile dosya anahtar kümesi aynı; dry-run hiçbir şey yazmadı.
    - Raporda müşteri e-postası, adı, dizin yolu veya depolama anahtarı yok.
    - Depo okunamazsa çıkış kodu 2 ve boş stdout; normal koşuda çıkış kodu 0.
- **TST-236 / API REGRESYON:** `dotnet test` PASS: 513 geçti, 29 atlandı, 0 başarısız. Sözleşme yeniden üretildi; değişiklik yok (105 işlem).
- **TST-237 / ADMIN STATİK:** lint 0 hata (4 eski uyarı), `tsc -b` ve build PASS.
- **TST-238 / CHROME FIXTURE MATRİSİ:** yeni `apps/admin/tests/order-design-legacy-matrix.mjs` 390 px'te 7 durumda PASS.
  - Her kartın mesajı ve düğme durumu doğru.
  - Geçerli dosyalar indirildi; dosya adı ve “tarayıcıya verildi” durumu doğrulandı.
  - Yerleşim yoksa kompozisyona istek gönderilmedi.
  - Katalog ya da tasarım yedeği istenmedi (`/assets`, `/media`, `/admin/designs` yok).
  - Servis kesintisi eksik kayıt gibi gösterilmedi.
  - Yazma ve taşma yok.
  - Regresyonlar PASS: `order-design-detail`, `order-design-file-states` (21), `order-placement`, `admin-consistency-states`, `admin-request`, `test-admin-personalized-orders`, `test-admin-design-order-detail` (12), `test-admin-print-source-state` (38), `test-admin-order-states` (15, derlenmiş önizlemede).
  - Görseller: [legacy-records/](legacy-records/).
- **İlk başarısız deneme:** dry-run testindeki “depolama anahtarı yok” kontrolü fazla genişti; `order-copy-unverified` durum adı içindeki `order-` ile eşleşti. Kontrol gerçek anahtar biçimine (`order-{id}-{satır}`) daraltıldı. Bu bir test hatasıydı.

## Sınırlar

- Dry-run gerçek veri üzerinde çalıştırılmadı; yalnız izole fixture ile doğrulandı. Gerçek sipariş envanteri ve olası geri doldurma kararı açık.
- Doğrulanmamış eski kompozisyonun referans olarak kaydedilmesi bir ürün kararıdır; karar verilmedi.
- Gerçek SQL ve canlı ortam kabulü, SIP-TAS-09 ve rol/PM onayı açık.
