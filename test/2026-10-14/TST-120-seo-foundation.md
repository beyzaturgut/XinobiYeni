# TST-120 — SEO temeli: robots, sitemap, canonical, JSON-LD (Faz04)

- Tarih/saat (Europe/Istanbul): 14.10.2026
- Commit/branch: `main` / `925842d` → bu commit
- Faz/görev: Faz04 SEO (meta, canonical, robots, sitemap, yapılandırılmış veri)
- Seviye: BUILD / E2E
- Çalıştıran: Claude Code

## Uygulama

- `apps/web/src/lib/seo.ts`: `NEXT_PUBLIC_SITE_URL` (yalnız `https://`) varsa site indekslenebilir. Yoksa — bugünkü IP’li test sunucusu dahil — `robots.txt` her şeyi engeller, sitemap boştur, her sayfa `noindex, nofollow` taşır; böylece test sunucusu gelecekteki alan adıyla rekabet etmez.
- `app/robots.ts`, `app/sitemap.ts` (`force-static`, statik export ile `out/robots.txt`, `out/sitemap.xml`).
- İndekslenebilir derlemede: herkese açık 8 sayfa sitemap’te (`/`, `/urunler/`, `/arama/`, `/xinobi-u/`, `/xinobi/`, `/kurumsal/teklif/`, `/asistan/`, `/yasal/`) ve canonical bağlantılı; hesap, sepet, ödeme, favoriler, karşılaştırma, stüdyo, teklif takibi, XINOBI U adımları, eski demo sayfası, `/admin/`, `/api/` robots’ta engelli; `metadataBase` ve Open Graph (tr_TR, Xinobi).
- Ana sayfa: istemci bileşeni içeriği değişmeden `home-page.tsx`’e taşındı; `page.tsx` meta bilgisini ve Organization/WebSite JSON-LD’sini verir.
- Ürün detayı: seçili renk için Product JSON-LD (ad + renk, SKU, kategori, marka, açıklama, görsel, sunucu fiyatı TRY ve stok durumu). Fiyat tanımsızsa `offers` yazılmaz. `<` kaçışı uygulanır.
- `docs/runbooks/https-reverse-proxy.md`: alan adına geçişte derleme komutu ve kontrol.

## Komut

```text
cd apps/web && pnpm exec tsc --noEmit && pnpm lint
NEXT_PUBLIC_SITE_URL= pnpm build                                  # test/önizleme
NEXT_PUBLIC_SITE_URL=https://www.ornek-xinobi.com.tr pnpm build   # alan adı denemesi (örnek, yayımlanmadı)
node tests/run-e2e.mjs
```

## Sonuç

| Kontrol | Sonuç |
|---|---|
| Önizleme derlemesi | `robots.txt`: `Disallow: /`; boş `urlset`; `<meta name="robots" content="noindex, nofollow">`; canonical yok |
| Alan adlı derleme | 16 `Disallow`, `Sitemap:` satırı; 8 URL’lik sitemap; `/`, `/urunler/`, `/yasal/` canonical doğru; `noindex` yok; Organization `url`/`logo` mutlak |
| Yeni `seo.spec.ts` | 2/2 (önizleme kapalılığı + ana sayfa JSON-LD; ürün JSON-LD’sinin renk değişiminde SKU/ad ile güncellenmesi, fiyat 2400.00 TRY) |
| Tam web e2e | **119 geçti / 0 başarısız / 1 atlandı** |
| tsc / lint | Temiz |

## Kapsam dışı / açık

- Ürün detayları `?id=` ile istemci tarafında çiziliyor; sitemap’te ürün URL’si yok ve canonical verilmedi. Ürün başına statik sayfa (derleme anı katalog) ayrı bir iştir.
- Breadcrumb verisi, hreflang (tek dil), GTM/GA/Search Console/Meta Pixel (erişim ve D10 izni gerekli), 301 haritası (eski site URL’leri D01/01.17) yapılmadı.
- Gerçek alan adı ve yayın yok; canlı paket alan adı verilene kadar `noindex` kalır.

## Sonuç kararı

BAŞARILI. Faz kabulü değildir.
