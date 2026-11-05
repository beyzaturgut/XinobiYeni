# TST-253 | Admin UI/UX denetimi

05.11.2026. main/cbf0153. Kapsam ve öncelikli 7 bulgu: [denetim raporu](../../design/admin-ux-audit-2026-11-05.md). Bu bir denetim teslimidir; uygulama koduna düzeltme yapılmadı. Gerçek sipariş/kargo değişikliği ve deploy yok.

## Yeni sentetik kanıt

Yerel 5174 ayrı admin üzerinde tüm API istekleri page.route ile fixture yanıtlarına yönlendirildi. Geçici probe yalnız sentetik sipariş kullanır. Üç adım tekrarlandı:

- Not yaz → dialog X ile kapat → aynı sipariş aç: boş string; confirm sayısı 0 (ADM-UX-01).
- Geçerli demo paket formunu gönder: fixture write sayısı 1, confirm sayısı 0 (ADM-UX-02). Gerçek taşıyıcı çağrısı değil.
- Salt okunur personelde paket inputu isEditable=true, submitDisabled=true (ADM-UX-04).
- Belirsiz fixture kaydında resolution=registered (ADM-UX-03).

[Sonuç JSON](admin-ux-audit/synthetic-probes.json), [320 px sentetik ekran](admin-ux-audit/shipping-320.png) görsel incelendi. Teyit/etiket/işlem kapanışıyla ilgili diğer maddeler kaynak incelemesidir; gerçek yazma yapılarak doğrulandı denmez.

## Regresyon

`pnpm --filter admin test:isolated`: **20/20 test dosyası PASS, 0 başarısız**. Gerçek API proxy yok; isolated-browser guard sahte fixture dışı API erişimini engeller. Sonuçlar artifacts/admin-safe-tests altında Git dışındadır.

Genel consistency matrisi: 16 modül × 4 genişlik (320/390/768/1440), her biri normal ve %200 metin; 64 matris satırı, 48 empty/error/denied giriş durumu, issue=0. 390 px modül axe kontrolleri geçti; bu ekran okuyucu kabulü değildir. Sipariş/Tasarımlar empty/error/denied durumları matrix.json üzerinden ayrıca incelendi.

Odaklı paketler de bu 20 dosya içindedir: surat-shipment, order-design-acceptance, order-design-file-states (21 senaryo), order-design-legacy-matrix (7), order-placement, order-design-detail, admin-write-permissions, admin-operation-results, admin-request ve navigation-ui. Bu paketler çift istek kilidi, sunucu hatasında form koruma, dosya hatası/yeniden deneme, klavye/odak, filter/empty ve izin engellerini kontrol eder. Bunlar UX raporundaki eksik kabul ölçütlerini henüz test ederek kapatmaz.

Uygulama kodu değişmediğinden API/Flutter/üretim derlemesi bu görevde yeniden çalıştırılmadı. Önceki TST-252 build/lint sonuçları geçmiş kanıttır. SQL/IIS, gerçek cihaz/VoiceOver/NVDA ve PM kabulü yapılmadı. git diff --check geçti.

## Teslim

ADM-UX-01/02/03 P1, ADM-UX-04/05/06/07 P2 olarak düzeltme turuna ayrıldı. Her bulgunun tekrar adımı/kanıt ve kapanış koşulu denetim raporunda. Faz kayıtları güncellendi; bulgular düzeltilmiş veya tüm admin kusursuz kabul edilmedi.
