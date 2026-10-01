# TST-051 — Faz02 Playwright müşteri etkileşim kapsamı 04

- Tarih: 2026-10-01
- Başlangıç commit: `c062498`
- Tarayıcı: Yerel Google Chrome, Playwright 1.55.1

## Yeni senaryolar

- Katalog: kategori filtresi, canlı arama, sıralama, boş sonuç ve filtreleri temizleme.
- Ürün detayı: renk varyantı, seçili durum ve ürün görselinin birlikte güncellenmesi.
- Favoriler: katalogdan tarayıcı saklamasına ekleme, favori listesinde gösterme ve kaldırma.
- Ödeme: iletişim alanları, kart/havale yöntemi açıklaması ve kapalı gerçek ödeme eylemi.
- Basit kişiselleştirme: 24 karakter sınırı, stil, renk, demo taslak bildirimi ve kapalı sipariş aktarımı.

## Koşular

- İlk genişletilmiş kritik koşu: 15/18 başarılı. Kategori, renk grubu ve etkileşim sonrası değişen favori erişilebilir adı seçicileri belirsiz/eski kaldı.
- Seçiciler gerçek erişilebilir adlara daraltıldı; uygulama davranışı değiştirilmedi.
- İkinci kritik koşu: 18/18 başarılı, 18.0 saniye.
- `pnpm --filter web lint && pnpm --filter web test:e2e` — lint başarılı; axe/klavye dahil 40/40 test başarılı, 1.0 dakika.

## Açık kapsam

- Ana sayfa, kurumsal içerik ve yasal merkez navigasyon bağlantılarının toplu smoke kontrolü.
- 390 px gerçek cihaz ve manuel ekran okuyucu testi.
- API, kimlik, ödeme, stok ve sağlayıcı bağlantıları sonrası gerçek veri senaryoları.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
