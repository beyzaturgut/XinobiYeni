# TST-072 — Çerez tercihleri ve Nobi konum ayrımı

- Tarih: 02.10.2026
- Seviye: UI REGRESSION / RESPONSIVE / E2E / VISUAL
- Kapsam: Global çerez tercihleri düğmesi ve ana sayfa Nobi tetikleyicisi

## Değişiklik

- Kapatılmış çerez tercihleri düğmesi sağ alttan sol alta taşındı.
- Masaüstünde `left:16px`, mobilde `left:8px` konumu uygulandı.
- Nobi sağ altta bırakıldı.

## Doğrulama

- Lint başarılı.
- Next.js static export 23/23 rota başarılı.
- Playwright birleşik regresyon 43/43 başarılı.
- Statik `out` üzerinde masaüstü ve mobil koordinat testi, çerez düğmesi ile Nobi kutularının kesişmediğini doğruladı.
- Güncellenen TST-070 masaüstü/mobil görsel kanıtlarında düğmeler karşı köşelerde görünür.

Durum: Başarılı.
