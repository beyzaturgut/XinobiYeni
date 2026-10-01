# TST-045 — Faz02 Chrome responsive görsel QA grubu 03

- Tarih: 2026-10-01
- Başlangıç commit: `d083c4c`
- Ortam: Yerel statik export, Google Chrome headless, 500 px dar genişlik

## İlk kontrol edilen rotalar

- `/favoriler/`
- `/hesap/giris/`
- `/hesap/`
- `/hesap/siparisler/`
- `/hesap/siparisler/iade/`
- `/kurumsal/teklif/`
- `/kurumsal/teklif/takip/`

## Bulgu ve düzeltme

Üç çocuk öğesi bulunan bazı mobil header'lar iki kolon tanımladığı için son kapatma bağlantısı ikinci satıra düşüyor ve header yüksekliği artıyordu. Ortak `data-mobile-three-column` kuralı ile dar ekranda `52px minmax(0,1fr) auto` düzeni uygulandı.

Düzeltme şu rotalarda tekrar render edilerek doğrulandı:

- `/hesap/giris/`
- `/hesap/siparisler/iade/`
- `/asistan/`
- `/studio/ai/`

Kapatma kontrolü aynı satıra taşındı; başlık yüksekliği normale döndü. Diğer yedi rotanın ilk görünür alanında yatay taşma veya kırık yerleşim bulunmadı.

## Otomatik kontroller

- ESLint başarılı.
- TypeScript başarılı.
- Next.js IIS static export başarılı; 23/23 rota üretildi.

## Açık kontroller

- Form sekmeleri, sipariş seçimi, iade türü, teklif adımları ve revizyon kontrollerinin tıklama/klavye testi.
- 390 px gerçek telefon, tablet ve ekran okuyucu kontrolleri.
- Kimlik, D03/D05/D07/D10 ve API bağlantıları sonrası gerçek veri senaryoları.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
