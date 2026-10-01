# TST-050 — Faz02 otomatik erişilebilirlik ve klavye odağı

- Tarih: 2026-10-01
- Başlangıç commit: `28245e3`
- Araçlar: `@axe-core/playwright` 4.13.0, Playwright 1.55.1, yerel Google Chrome
- Standart etiketleri: WCAG 2 A/AA ve WCAG 2.1 A/AA

## Kapsam

- Yirmi müşteri web rotasında kritik ve ciddi axe ihlali taraması.
- Üyelik ekranında ileri Tab, Enter ve geri Shift+Tab odağı.
- Ödeme sonucu durum düğmelerinde ileri/geri klavye odağı.
- Mevcut 13 kritik etkileşim testiyle birleşik regresyon.

## İlk bulgular

- İlk erişilebilirlik koşusu: 4/22 başarılı, 18 rota başarısız.
- Ana kök neden, açık zeminlerde küçük yardımcı metinlerin WCAG AA 4.5:1 kontrast sınırının altında kalmasıydı.
- Gelişmiş editörde görsel şekil katmanı düğmesinin erişilebilir adı yoktu.
- Klavye odağı senaryolarının ikisi de ilk koşuda başarılıydı.

## Düzeltmeler

- Soluk gri metinler ortak koyu `#52605d`, amber durum metinleri `#765018` karşılıklarına taşındı.
- Koyu ürün kişiselleştirme ve Xinobi içerik bölümlerinde açık vurgu renkleri kullanıldı.
- Şekil katmanı düğmesine katman adından `aria-label` sağlandı.
- Aynı makinede iki Chrome worker başlatma yarışını önlemek için Playwright `workers: 1` olarak sabitlendi.

## Sonuçlar

- `pnpm --filter web lint` — başarılı.
- Ağ erişimli `pnpm --filter web build` — başarılı; TypeScript ve 23/23 statik rota geçti.
- Erişilebilirlik paketi — 22/22 başarılı, 18.1 saniye.
- İlk birleşik E2E — 34/35; iki Chrome worker eşzamanlı başlarken ilk context kurulum zaman aşımı, uygulama testi ihlali yok.
- Tek worker final `pnpm --filter web test:e2e` — 35/35 başarılı, 50.4 saniye.

## Sınırlar

- Otomatik axe taraması manuel ekran okuyucu ve gerçek cihaz testinin yerine geçmez.
- 390 px gerçek cihaz, VoiceOver/TalkBack ve dış API durumları hâlen ayrıca doğrulanmalıdır.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
