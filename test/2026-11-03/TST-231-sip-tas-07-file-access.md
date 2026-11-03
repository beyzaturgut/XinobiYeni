# SIP-TAS-07 — Sipariş tasarım dosyalarında yetki ve işlem durumları / 03.11.2026

Kapsam: [SIP-TAS-07](../../docs/tasks/order-design-detail-scope-2026-11-03.md#sip-tas-07---yetki-dosya-erişimi-ve-işlem-durumlarını-tamamla) (SEC-07, KIS-07). Değişiklik admin indirme arayüzü ile test kapsamında. API yetki kuralları denetlendi; yeni API davranışı eklenmedi. Rol yönetimi (CRUD), web mağazası, Flutter, hosting, deployment ve APK değişmedi.

## Önkoşul ve uçtan uca denetim

SIP-TAS-04/05/06 (`ad7e2da`, `9d530b9`, `cbf4e47`) kod ve testle doğrulandı. Bulgular:

| Yol | Sunucu yetkisi | Dosya çözümü |
|---|---|---|
| `GET /api/v1/admin/orders/{id}/lines/{n}/pattern\|source\|composition` | Personel politikası (personel hesabı + tamamlanmış MFA) + `orders.read`, her istekte endpoint politikasıyla | Saklı sipariş → satır → `Files.*` referansı; anahtar saklı `order.Id` + satır numarasından kurulur. Sorgu, URL ve yol parametresi kullanılmaz. SHA-256 ve türü doğrulanmayan kopya sunulmaz (503). |
| `GET /api/v1/local-commerce/orders/{id}/lines/{n}/design` (panel grubu) | `PanelAccess`: `orders` kaynağı → `orders.read` | Saklı sipariş; `Files.Pattern` doğrulaması |
| `GET /api/v1/me/orders/{id}/lines/{n}/design\|preview` | Müşteri politikası; yalnız hesabın kendi siparişleri | Başka hesabın siparişi 404, eksik kayıttan ayırt edilmez |
| `GET /api/v1/local-commerce/media/{ad}` (anonim katalog medyası) | Herkese açık | Yalnız `media` alanı ve `^[a-f0-9]{32}\.(png\|jpg\|webp\|mp4\|webm)$` adı; sipariş kopyaları (`designs/files`) bu yoldan okunamaz |

- API statik dosya sunmuyor. Dosya deposu anahtar deseni (`FileAreas.CheckedKey`) yol aşımını reddediyor.
- Hatalar mevcut güvenli sözleşmeyle ayrılıyor:
  - **401:** oturum yok, süresi dolmuş ya da MFA'sız personel.
  - **403:** müşteri hesabı ya da izni olmayan personel.
  - **404:** sipariş, satır ya da dosya kaydı bulunamadı (`order_not_found`, `order_line_design_not_found`, `order_*_not_recorded`, `order_*_not_found`).
  - **503:** `feature_unavailable`.
  - Hata gövdeleri depolama anahtarı veya dizin yolu içermiyor.
- **Denetim kaydı:** mevcut yaklaşım yalnız değişiklik isteklerini (POST/PUT/DELETE) kaydediyor. İndirmeler okuma isteği olduğu için kaydedilmiyor. Bu yaklaşım korundu, okuma kaydı eklenmedi. Personel dosya indirmelerinin ayrıca denetim kaydına yazılması isteniyorsa bu ayrı bir SEC-07/ürün kararı olarak açık.
- Önceki tasklardaki dosya uçları ilk eklendikleri anda bu korumalarla açılmıştı; bu task bunları sonradan eklemedi, uçtan uca doğruladı.

## Yapılan değişiklik (admin arayüzü)

- **Dürüst başarı mesajı:** sayfa, tarayıcının dosyayı diske yazıp yazmadığını göremez. Durum mesajı artık şöyle: “… tarayıcıya indirme için verildi: {ad}. Kaydedildiğini tarayıcının indirmeler listesinden kontrol edin.” Önceki “indirildi” ifadesi kaldırıldı.
- **Tekrar gönderim kilidi:** düğme `disabled` yerine `aria-disabled` kullanıyor; böylece klavye odağı indirme sırasında düğmede kalıyor. Ref kilidi tekrar tıklama ve Enter ile gelen istekleri reddediyor.
- **Odak:** düğmeyi kaldıran bir hata (404 veya 403) odağı hata açıklamasına taşıyor. Tekrar denenebilir hatada (503 veya bağlantı kesintisi) odak “İndirmeyi tekrar dene” düğmesinde kalıyor.
- **Duyuru:** başarı `role=status`, hata `role=alert` ile duyuruluyor. Hiçbir hata ya da eksik kayıt başarı olarak gösterilmiyor.

## Kontroller

- **TST-231 / API GÜVENLİK FIXTURE:** `OrderDesignSnapshotTests` 13/13 PASS. Yeni matris testi her üç dosya için şunları doğruluyor:
  - **Erişim:** anonim 401; dosyanın sahibi müşteri 403; başka müşteri 403; `orders.read` izni olmayan personel 403; MFA'sız personel 401.
  - **Süre dolumu:** saat 16 dakika ileri alındıktan sonra personel oturumu 401 alıyor.
  - **Yetkili personel:** 200 alıyor, doğru baytlar ve `no-store`. Başka siparişin kimliği o siparişin kendi kopyasını veriyor.
  - **Satır ve sipariş:** düz satır, olmayan satır ve olmayan sipariş 404; hata gövdesinde anahtar veya dizin yok.
  - **Müşteri yolları:** sahibi 200, başka müşteri 404, anonim 401.
  - **Açık medya yolu:** sipariş kopya adlarını 404 ile reddediyor.
  - **Depo kesintisi:** her dosyada 503 `feature_unavailable`.
  - Önceki 12 senaryo da geçti: yol aşımı ve keyfi URL, bozuk ya da eksik kopya.
- **TST-232 / API REGRESYON:** `dotnet test` PASS: 511 geçti, 29 atlandı (SQL ve etkileşimli smoke), 0 başarısız. Ayrıca güvenlik alt kümesi (Authorization, SessionCookieIsolation, AuditTrail, AdminMfa) 36/36 PASS. API sözleşmesi değişmedi.
- **TST-233 / ADMIN STATİK:** lint 0 hata (4 eski uyarı), `tsc -b` ve build PASS.
- **TST-234 / CHROME FIXTURE:** yeni `apps/admin/tests/order-design-file-states.mjs` 21 senaryo PASS (3 dosya × 7 durum):
  - **Hızlı tekrar:** Enter, Enter, tıklama, tıklama yalnız 1 istek gönderiyor ve odak düğmede kalıyor. Başarı mesajı yalnız “tarayıcıya verildi” diyor ve kontrol uyarısını içeriyor.
  - **Kayıt yok, 404 ve 403:** odak açıklamaya taşınıyor; tekrar deneme ve başarı mesajı çıkmıyor.
  - **503 ve bağlantı kesintisi:** tekrar deneme çıkıyor; başarı yalnız gerçek yanıt sonrası görünüyor.
  - **Süresi dolmuş oturum:** tek bir yenileme denemesinden sonra giriş ekranı açılıyor; başarı iddiası yok.
  - Arayüz yalnız gösterilen sipariş ve satırı istiyor.
- **TST-234 / REGRESYONLAR:** hepsi PASS.
  - Tarayıcı testleri: `order-design-detail` (metin ve kilit doğrulaması güncellendi), `order-placement`, `admin-consistency-states`, `admin-request`, `admin-write-permissions`.
  - tools senaryoları: `test-admin-personalized-orders`, `test-admin-design-order-detail` (12), `test-admin-print-source-state` (38), `test-admin-order-states` (15, derlenmiş önizlemede).
- **Görsel:** 390 px'te üç dosya kartı [file-access/](file-access/) klasöründe.

## Başarısız ilk denemeler

- **Kilitli düğmeye tıklama:** Playwright `aria-disabled` düğmeye tıklamayı reddetti. Testte gerçek tarayıcı davranışı `force` tıklamayla taklit edildi.
- **İstek sayımı:** ilk koşuda kompozisyon için 3 istek sayıldı. Kilit sağlamdı (ayrı hata ayıklama koşusunda 1 istek). Fazla sayım, kompozisyon kartının görseli yüklerken aynı uca yaptığı isteklerden geliyordu. Fixture yalnız düğme kullanıldıktan sonraki istekleri sayacak şekilde düzeltildi.

## Sınırlar

- Testler izole fixture ile yapıldı. Gerçek SQL kimlik deposu, canlı sunucu (IIS, aynı origin, HTTPS çerezleri) ve gerçek personel rolleriyle kabul yapılmadı.
- Personel dosya indirmelerinin denetim kaydına yazılması ürün/güvenlik kararı olarak açık.
- Süreli/imzalı erişim, zararlı içerik taraması ve genel upload sözleşmesi SEC-07'nin diğer kısımları; bunlar yapılmadı.
- SIP-TAS-08/09 ile rol ve PM kabulü açık.
