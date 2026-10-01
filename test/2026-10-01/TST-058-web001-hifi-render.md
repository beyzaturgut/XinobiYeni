# TST-058 — WEB-001 ortak yüksek doğruluklu tasarım renderı

Tarih: 01.10.2026  
Seviye: DESIGN / BROWSER RENDER / RESPONSIVE / VISUAL QA  
Sonuç: **Başarılı, etkileşim kabulü açık**

## Teslim

- `design/screens/WEB-001/prototype.html`
- `design/screens/WEB-001/prototype.css`
- `desktop-1440.png`, `tablet-1024.png`, `tablet-768.png`, `mobile-390.png`, `mobile-320.png`
- Tekrarlanabilir renderer: `tools/render-web001.mjs`

## Koşu geçmişi

1. Geçici yerel sunucu sandbox içinde port açamadı; onaylı yükseltilmiş yerel çalıştırmada başarıyla açıldı.
2. İlk renderer çağrısı yanlış `apps/web/node_modules/playwright/index.mjs` yoluyla `ERR_MODULE_NOT_FOUND` verdi.
3. Monorepo pnpm Playwright 1.55.1 yolu kullanılarak düzeltildi; ilk 1440/390 render başarılı oldu.
4. Creative/Web Designer QA, mobil etiket/Nobi/logo/medya çerçevesi ve scroll rayı revizyonları istedi.
5. Revizyonlar sonrası 320/390/768/1024/1440 final renderları yeniden üretildi.

## Otomatik sonuç

```text
desktop-1440: images=14, overflow=false, h1=1
tablet-1024: images=14, overflow=false, h1=1
tablet-768: images=14, overflow=false, h1=1
mobile-390: images=14, overflow=false, h1=1
mobile-320: images=14, overflow=false, h1=1
```

PNG ölçüleri:

```text
1440×6365
1024×5743
768×5480
390×7326
320×7311
```

Tüm uygulama görselleri HTTP 200 döndü. Tarayıcının isteğe bağlı `/favicon.ico` isteği 404 döndü; prototip içeriğini etkilemedi.

## Görsel QA

- Zorunlu sıra ve ortak art direction korundu.
- Fiyat/stok uydurulmadı; XINOBI U'da “Temsilidir” görünür.
- İlk QA sonrası mobil sabit öğeler ve medya çerçevesi düzeltildi.
- Dyson varlığı, fontu veya birebir düzeni kullanılmadı.

## Açık sınır

Bu teslim yüksek doğruluklu statik tasarım prototipidir. Üretim `apps/web` kodu değildir. Çalışan mixed-media slider, gerçek mega menü/drawer, Nobi açık paneli, carousel kontrolü, manuel ekran okuyucu ve fiziksel cihaz kabulü kullanıcı tasarım onayından sonra uygulama/handoff işidir. Deployment yapılmadı.
