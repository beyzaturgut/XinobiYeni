# TST-047 — Faz02 Playwright kritik etkileşim/klavye altyapısı

- Tarih: 2026-10-01
- Başlangıç commit: `8eb5d1c`
- Tarayıcı: Yerel Google Chrome, Playwright 1.55.1

## Eklenen altyapı

- `apps/web/playwright.config.ts`
- `apps/web/tests/e2e/critical-interactions.spec.ts`
- `pnpm --filter web test:e2e`
- Varsayılan macOS Chrome yolu; farklı ortam için `PLAYWRIGHT_CHROME_PATH` desteği.

## Senaryolar

1. Çerez panelini kapat, yeniden aç, ayarları göster, zorunlu kategoriyi doğrula, analitik seç ve prototip geri bildirimini gör.
2. Aramada `kahve` sonucunu doğrula, Escape ile alanı temizle, üçüncü ürünü seç ve dördüncü ürünün karşılaştırmaya kapandığını doğrula.
3. Ödeme sonucunu Enter ile başarısız, Space ile başarılı duruma geçir ve başlıkları doğrula.

## Koşular

- İlk koşu: 2/3 başarılı. Arama fixture'ında tek kahve ürünü bulunmasına rağmen test iki sonuç bekliyordu; erişilebilirlik snapshot'ı tek sonucu doğruladı.
- Beklenti fixture sözleşmesine göre `1 sonuç` olarak düzeltildi.
- Final koşu: 3/3 başarılı, 2.5 saniye.
- Öncesindeki üretim build: TypeScript ve 23/23 statik rota başarılı.

## Uygulama düzeltmesi

Arama alanında görünen `ESC` ipucu daha önce işlevsizdi. `Escape` tuşu artık sorguyu temizliyor ve otomasyonla doğrulanıyor.

## Açık kapsam

- Form doğrulama, tab/odak sırası, modal odak kapanı, sepet/editör/asistan durumları ve tüm rotalarda erişilebilirlik taraması.
- CI/Linux için Chrome executable veya Playwright browser kurulum kararı.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
