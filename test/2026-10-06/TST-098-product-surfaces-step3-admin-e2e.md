# TST-098 — Admin Playwright

2026-10-06; LOCAL API E2E / RESPONSIVE / VISUAL / FOCUS / ERROR SIMULATION.

Mevcut Node executable ile `apps/web/node_modules/@playwright/test/cli.js test --config apps/admin/playwright.config.ts`.

Final 4/4 geçti (8.9 s). Mevcut Playwright dependency ve yerel Chrome; otomatik test host'ları API 5013 / Vite 5174, mevcut kullanıcı sunucuları durdurulmadı. Gerçek API happy path: automatic aday, source/mask yükleme, approval/rejection, iki local nokta için sıfır regeneration isteği, tek button için tek POST/yeni pending ID, correction iptali/temizliği, mobile marker hizası. Koordinat helper testi center/edge/letterbox/resize ve invalid geometry. Failed regeneration simülasyonu noktaları korur; başka aday sonrası stale karar gerçek 409 ve GET reload yapar, karar tekrar gönderilmez. Loading/network error ve button focus doğrulandı.

İlk config CJS named import hatası `.mjs` ile düzeltildi. İlk sandbox server denemesi tamamlanmadı; izinli yerel browser/server koşusu kullanıldı. İlk browser sonucu 1/4: kayan nokta equality ve desteklenmeyen `mask-mode` kontrolü; PNG/WebKit CSS alpha masking desteklenir, prefix property'leri kullanıldı, Canvas fallback yapılmadı. Sonraki koşular 3/4: half-open right edge subtraction hassasiyeti gerçek helper'da display-space sınır kontrolüyle düzeltildi; browser scroll ve integer CSS pointer dispatch hassasiyeti testte düzeltildi (en fazla bir CSS pixel toleransı; saf helper center testi 8 basamak hassasiyetinde). Final 4/4.

Görsel QA: `C:\Users\ADMIN\AppData\Local\Temp\xinobi-product-surfaces-step3-desktop.png` ve `...\xinobi-product-surfaces-step3-mobile.png`. İkisi görsel olarak incelendi: source ve pembe alpha mask hizalı; spout/handle/base/upper vessel pembe değil; branding body alpha'sının içindedir. 390 px'de horizontal overflow yok; kontroller erişilebilir. CSS alpha/RGB bağımsızlığı gerçek referans PNG üzerinden doğrulandı; test Chrome'unda standard mask-mode yok, WebKit raster PNG masking alpha kullanır. Başka browser kapsamı iddia edilmedi.
