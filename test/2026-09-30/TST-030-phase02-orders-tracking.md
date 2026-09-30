# TST-030 — Faz02 WEB-013 sipariş/takip

- Tarih: 2026-09-30
- Commit/branch: `main` / `65e5dff` sonrası çalışma ağacı

## Kapsam ve sonuç

- `/hesap/siparisler` iki demo sipariş, seçilebilir detay ve dört adımlı takip çizgisi.
- Kargo firması/takip numarası ve bağlı işlemler API olmadan kapalı.
- Gerçek sipariş verisi olmadığı ve D03/API bağımlılığı görünür.
- ESLint, TypeScript ve production build başarılı; 16/16 statik sayfa.
- HTTP metadata, demo veri ve kargo bekleme metinleri başarılı.

## Açık testler

- Gerçek tarayıcı seçim, klavye/ekran okuyucu ve responsive QA.
- Faz05 sonrası nesne yetkisi, sipariş geçmişi, kargo webhook/polling ve durum eşleme testleri.

## Sonraki adım

WEB-014 iptal/iade talebi kabuğu D03/D10 sınırlarıyla hazırlanabilir.
