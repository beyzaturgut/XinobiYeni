# TST-018 — Faz02 ana sayfa ve tasarım sistemi başlangıcı

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `57b6d93`
- Faz/görev: Faz02 / WEB-001 ve tasarım tokenları
- Seviye: STATIC / BUILD / SMOKE / ACCESSIBILITY CONTRACT
- Ortam: Next.js 16.3.6, React 19.2.8, production build ve yerel HTTP
- Çalıştıran: Codex

## Amaç

Yetkili Xinobi logosu ve demo ürünleriyle responsive ana sayfa temelini; Türkçe metadata, self-host edilen font, semantik yapı, yerel asset erişimi ve production build açısından doğrulamak.

## Çalıştırılan kontroller

```text
pnpm --filter web lint
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start -p 3010
curl http://127.0.0.1:3010/
curl -I http://127.0.0.1:3010/assets/brand/xinobi-logo-white.png
curl -I http://127.0.0.1:3010/assets/products/tea-maker-101-blue.webp
```

Ek statik kontroller: Türkçe `lang`, sayfa başlığı/açıklaması, içeriğe geç bağlantısı, ana başlık, fiyat placeholder'ı ve yerel font preload çıktısı.

## Beklenen sonuç

- Lint ve TypeScript/build hatasız.
- `/` statik prerender edilir.
- Ana sayfa, logo ve ürün assetleri HTTP 200 döner.
- Font istemci çalışma zamanında Google'a bağlı değildir.
- Doğrulanmamış fiyat/stok/teslimat vaadi gösterilmez.

## Gerçek sonuç

- Durum: BAŞARILI; görsel tarayıcı QA kapısı açık.
- ESLint: başarılı.
- İlk build font indirme ağı kapalı olduğu için başarısız oldu; ağ izinli tekrar Turbopack geçici port kısıtına takıldı. İzinli doğrudan Next.js build: başarılı.
- Production build: TypeScript başarılı, 4/4 statik sayfa üretildi, `/` statik prerender edildi.
- Ana sayfa HTTP 200; Next.js cache `HIT`.
- Logo PNG ve demo ürün WebP: HTTP 200 ve doğru MIME türü.
- HTML: `lang=tr`, metadata, skip link, H1 ve temsili fiyat metni doğrulandı.
- Inter WOFF2 dosyaları build çıktısından preload edildi; tarayıcıda harici Google font isteği yok.

## Erişilebilirlik ve açık testler

- Semantik `header/nav/main/section/footer`, içeriğe geç bağlantısı, görünen focus halkası ve `prefers-reduced-motion` desteği uygulandı.
- İkon düğmelerinde erişilebilir adlar, ürün görsellerinde açıklayıcı alt metin var; dekoratif kategori görselleri boş alt kullanıyor.
- Otomatik tarayıcı/screenshot aracı ortamda bulunmadığından dar telefon, tablet ve masaüstü piksel QA'sı henüz yapılmadı; Faz02 kabulü için zorunlu açık testtir.
- Logo kullanım boşluğu, demo ürün lisansı/adları ve D02/D04 verileri marka/iş sahibi onayı bekler.

## Etki ve sonraki adım

WEB-001 ilk uygulanabilir sürümdedir. Sonraki atomik adım gerçek tarayıcı görsel QA'sı ve ardından WEB-002 kategori/liste ekranıdır. Faz02 tamamlanmış sayılmaz.
