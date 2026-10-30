# Faz02 geliştirmeye teslim paketi

**30.10 admin uygulama kontrolü:** [16 modül görsel/durum matrisi](admin-consistency-audit-2026-10-30.md), [TST-188](../test/2026-10-30/TST-188-admin-consistency.md). Gerçek SQL/operasyon ve tasarım kabulü açık.

**30.10.2026 web uygulama kontrolü:** [33 rota ekran/durum matrisi](web-consistency-audit-2026-10-30.md) ve [test kanıtı](../test/2026-10-30/TST-179-web-consistency.md). Otomasyon kanıtı resmi Creative/UX handoff veya gerçek cihaz kabulü değildir.

Sürüm: 0.1.0 · 02.10.2026 · F02-A06

Durum: Mevcut web kaynakları ve davranış belgeleri teslim incelemesine hazır. FE/Creative/BE/DBA/Full Stack kabulü bekliyor; Faz02 kapanışı değildir. Yayın kullanıcı tarafından daha sonra yapılacak.

## Kaynak ve inceleme başlangıcı

| Teslim | Düzenlenebilir kaynak / kanıt |
|---|---|
| Ortak yön ve kapsam | `creative-brief.md`, `art-direction.md`, `analysis2-gap-matrix.md`, `content-hierarchy.md` |
| Token/bileşen | `tokens.json`, `components.md`; çalışan CSS: `apps/web/src/app/globals.css` ve rota module.css dosyaları |
| Ekran ve akış | `screen-inventory.md`, `flows.md`; WEB-001–020 uygulaması `apps/web/src/app/` |
| Ana sayfa kaynak | `design/screens/WEB-001/prototype.html`, `prototype.css`, `prototype.js`; çalışan uygulama `apps/web/src/app/page.tsx`, `page.module.css` |
| Ana sayfa çıktıları | `design/screens/WEB-001/` içindeki 320/390/768/1024/1440 PNG'ler; son uygulama mobil kanıtı `test/2026-10-02/TST-073-*` |
| Editör/AI | `editor-spec.md`, `ai-spec.md`; uygulama demo durumları belgelerde ayrıca belirtilir |
| Medya | `assets/manifest.json`, `photography-media-guide.md`; kaynak logo PDF ve banner PNG'leri |
| Otomatik kabul kanıtları | `test/INDEX.md`; TST-050–052 erişilebilirlik/etkileşim/navigasyon, TST-070–074 ana sayfa/mobil/paket |

Yollar repo köküne göredir; bu dizindeki belge adları `design/` altında bulunur. Harici düzenleme bağlantısı yok; HTML/CSS/JS, TSX/CSS ve JSON yerel düzenlenebilir kaynaklardır. Tüm ekranların bağımsız PNG/PDF çıktıları, panel ve Flutter hi-fi kaynakları henüz teslim edilmedi (F02-A08–A10). Prototip PNG'leri sonraki uygulama değişikliklerini kendiliğinden temsil etmez; son test tarihi ve kaynak commit ile birlikte incelenir.

## Ölçü, responsive ve durum annotation'ları

Ana sayfa HEAD `acc0c99`: masaüstü header 80 px, mobil 64 px; logo 112/88 px. Desktop navigasyon 1023 px altında mobil menüye geçer. 767 px altında hero `1942/809`, XINOBI U kapsayıcısı `1942/809` kullanır; XINOBI U `contain` ile gösterilir. Ürün kartları mobilde 90vw, kategoriler 84vw kaydırma rayındadır. Nobi mobilde sağ altta 64 px ve safe-area boşluğuyla konumlanır; çerez kontrolü sol alttadır. Bu değerler mevcut uygulamayı tanımlar; tüm kontrollerin 44 px hedefini sağladığı iddiası değildir.

320/390/768/1024/1440+ kırılım kabulü `components.md` ve ilgili spec'lerle yapılır. Global görünür odak/reduced-motion kuralı korunur. Fiziksel telefon/tablet ve VoiceOver/TalkBack sonucu açık F02-A01/A02'dir. Loading/empty/error/unauthorized/retry durumları mevcut prototipte olmayan rotalarda gerçek API işiyle birlikte uygulanır; sağlanmış gibi kabul edilmez.

## Medya ve lisans teslimi

Manifest 22 mevcut dosyanın yolu, bayt boyutu, SHA-256 ve raster piksel ölçülerini taşır. Aynı hash kaynak/türev eşliğini doğrular; yayın hakkını kanıtlamaz. `productId`/`variantId` boş değerleri D02 eşlemesi bekler. Dosya adı gerçek katalog kimliği değildir. Logo önceki karar kaydında yetkili Xinobi kaynağı olarak kayıtlıdır; dosya bazında lisans/sahip/onaylayan/tarih kanıtları manifestte henüz tamamlanmamıştır. Banner ve ürün görsellerinin ticari kullanım hakları ayrıca doğrulanmalıdır.

Font `Inter` uygulamada `next/font` ile self-host edilir; lisans dosyası ve dağıtım bildiriminin teslim eşliği FE tarafından doğrulanacak. Harici referans varlıkları kopyalanmaz. Banner odak noktası, ayrı mobil crop ve locale metadata'sı CMS tesliminin açık alanlarıdır.

## Ekran verisi → API alan eşlemesi

Kontrol edilen `packages/contracts/openapi/v1.json` yalnız `/api/v1/health`, `/health/live`, `/health/ready` uçlarını içerir. Aşağıdaki ticari alanlar hedef sözleşmedir; mevcut endpoint veya üretilmiş istemci desteği olarak okunmaz.

| Ekran | Hedef alan / sunucu sorumluluğu | Kapı |
|---|---|---|
| WEB-001/019 | İçerik blok ID/sürüm, image Asset, link, alt, yayın zamanı | Faz04 CMS; D10 |
| WEB-002–004/007 | productId, variantId, category, media, attributes, price/currency, stock, favorite | Faz04; D02; kimlik |
| WEB-005/006 | designId, designVersionId, printArea/version, layers, Asset, validation, personalizationPrice | Faz06; D04; editor-spec |
| WEB-008–010 | cartId/revision, variantId, quantity, designVersionId, server totals, checkout/attemptId, payment status | Faz05; D02/D03/D05 |
| WEB-011/012 | Customer/User, session, address, consent/version; nesne yetkisi | Faz03; D10 |
| WEB-013/014 | orderId/lineId, immutable snapshot, shipment/history, return reason/status | Faz05; D03/D05/D10 |
| WEB-015/016 | quoteId/revision, company/contact, lines, deadline, attachment, approval/history | Faz07; D07/D10 |
| WEB-017 | questionnaire/policy version, variant/area, jobId/status, assetId, usage/errors | Faz10; D05/D08/D10; ai-spec |
| WEB-018/Nobi | conversation/messageId, source/version, product/variant refs, freshness, handoff/lead status | Faz10; D05/D08/D10 |
| WEB-020 | legalDocument/version, purpose, consent status/time; veri saklama kuralı | Faz04/05; D10 |
| ADM-001–012 | Aynı domain kimlikleri + role/permission, audit/requestId, operasyon durumları | İlgili Faz03–10; hi-fi açık |
| MOB-001–006 | Aynı API/variant/designVersion/job kimlikleri, platform geri/deep-link davranışı | Faz11; D09; hi-fi açık |

API yanıtında requestId, alan hatası ve yetki/çatışma durumu tanımlanır. Fiyat/stok/kalite/ödeme sonucu istemci demo verisinden türetilmez. Variant ve tasarım sürümü akış boyunca korunur; eski sipariş yeni tasarımla değiştirilmez.

## İnceleme bulguları ve devralma kapısı

| ID | Bulgu ve sonraki işlem | Sahip / durum |
|---|---|---|
| HND-01 | XINOBI U gerçek varlık 2172×724 (3:1); mobil kutu 1942/809. Contain kırpmaz, boşluk bırakabilir. 3:1 kutu/CTA görsel incelemesi yapılmalı; TST-073 mevcut kutu oranını sınar. | FE + Creative / Açık |
| HND-02 | Slider, mobil menü/arama/sepet 44×44 px yapıldı; nokta/simge boyutu korundu. Beş genişlikte kenar tıklama ve klavye geçti (TST-077). Fiziksel cihaz QA açık. | FE / Kod ve otomasyon tamamlandı |
| HND-03 | Ticari OpenAPI yok; tablo hedef alanlarla sınırlı. Gerçek DTO/endpoint ve hata eşlemesi ilgili fazda yapılmalı. | BE + DBA / Açık |
| HND-04 | Medya lisans/ürün kimliği, font bildirimi ve mobil odak metadata'sı eksik. | Creative + ürün sahibi / Açık |
| HND-05 | Panel/mobil hi-fi, manuel a11y ve bağımsız ekran çıktıları eksik. | Creative + FE / F02-A01/A02/A08–A10 |

FE ölçü/responsive/etkileşim yapılabilirliğini; Creative varlık/görsel durumları; BE veri/hata/idempotency alanlarını; DBA değişmez sürüm ve sahiplik sınırını; Full Stack web/mobil eşliğini inceleyecek. Her inceleme gerçek kişi, tarih, kaynak commit, bulgu ID ve sonuçla kaydedilir. Şu an tüm gerçek incelemeler BEKLİYOR; FE kabulü veya PM nihai onayı verilmiş değildir. Revizyonlar CHANGELOG ve Faz00 üzerinden izlenir.
