# TST-092 — Header ölçülerinin dyson.com.tr ile eşlenmesi

- Tarih/saat (Europe/Istanbul): 07.10.2026 ~12:20–12:55
- Commit/branch: `main` / `6d52883` üzerinde çalışma ağacı
- Faz/görev: Faz02 web / DES-HDR-01 (proje sahibi talebi)
- Seviye: E2E / VISUAL / BUILD
- Ortam: LOCAL · çalışan dev servisleri · Chrome headless · Playwright 1.55.1
- Çalıştıran: Claude Code

## Amaç

Global header'ın font, punto, şerit kalınlığı ve öğe boyutlarını dyson.com.tr ile aynı yapmak; regresyon olmadığını doğrulamak.

## Değişen dosyalar

`apps/web/src/components/site-header.{tsx,module.css}`, `apps/web/src/app/layout.tsx` (Jost), `apps/web/src/app/globals.css` (`--font-header`).

## Ölçüm karşılaştırması (hesaplanmış stiller)

| Öğe | dyson.com.tr | Xinobi |
|---|---|---|
| Header toplam (1440) | 117 px | 117 px |
| Üst şerit / alt çizgi | 53 px, 1 px `#333` | 53 px, 1 px `#333` |
| Ana şerit | 64 px | 64 px |
| İçerik başlangıcı / sağ kenar (1440) | x85 / 1355 | x85 / 1355 |
| Logo | y12, 28 px yükseklik | y12, 28 px yükseklik |
| Üst bağlantılar | 14/18 px, 300, aralık 24 | 14/18 px, 300, aralık 24 |
| Menü | 16/24 px, 300, y73; ok 10×6; aralık 22/12 | aynı |
| Arama kutusu | 245×34, y68, ikon 18 px, metin +38 px | aynı |
| İkonlar | 24 px, y73 | 24 px, y73, aralık 24 |
| ≤1024 px | tek şerit 64 px, kenar 50/25 px, hamburger 16×48 | aynı |
| 390 px | logo x57 y20 h24, sağ kenar 365 | aynı; arama 157 px (Dyson 173, fazladan duyuru ikonu) |

Yatay taşma: 360, 390, 768, 1024, 1280, 1440 px'de yok.

## Komut ve sonuç

```text
pnpm --filter web lint && pnpm --filter web build      → başarılı (28 statik sayfa)
node tools/test-<16 araç>.mjs                          → 16/16 başarılı
pnpm --filter web test:e2e                             → 29 başarılı / 19 başarısız
(aynı paket header değişikliği git stash ile geri alınmış halde) → 29 başarılı / 19 başarısız; başarısız test listesi birebir aynı
```

- Durum: **BAŞARILI** (header kaynaklı regresyon yok).
- Ara hata: mobilde hesap/favori ikonlarını gizleyen kural `:not(.search)` içeren daha baskın seçiciye yeniliyordu ve dar ekranda ikon kutuları 44 px'den 24 px'e küçülüyordu; seçici `a.desktopOnly` yapıldı ve kutulara `flex-shrink:0` eklendi.

## Önceden var olan sorun (bu değişiklikle ilgisiz)

`apps/web/tests/e2e` paketinde 19 test başarısız. Son tam yeşil çalıştırma 02.10'daydı (TST-073); hatalar 06–07.10 değişikliklerinden geliyor:

- **4 kontrast hatası (a11y):** `/` kişiselleştirme düğmesi `#ffffff` / `#ff0029` 3.97:1; `/asistan` `#cccccc` / `#ffffff`; `/xinobi` `#e7e7e7` / `#ffffff`; `/yasal` `#cdcdcd` / `#ffffff`.
- **15 eski test:** demo ekranlarının değişmesiyle artık bulunmayan öğeleri arıyor ("Adedi artır", "Profili düzenle", "Demo alternatifleri göster", "DEMO-2312", "3 ürün varyantı", sekme adları, slider kontrolleri).

Kontrast hataları gerçek erişilebilirlik kusurlarıdır ve düzeltilmelidir; eski testler güncel davranışa uyarlanmalıdır.

## Etki ve sonraki adım

Header Dyson ölçüleriyle eşleşti. Sonraki adım: 4 kontrast hatasını düzeltmek ve 15 eski e2e testini güncellemek; ardından Faz03 03.04.
