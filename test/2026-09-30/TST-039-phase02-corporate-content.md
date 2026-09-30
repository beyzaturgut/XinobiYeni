# TST-039 — Faz02 WEB-019 kurumsal/içerik

- Tarih: 2026-09-30
- Commit/branch: `main` / `1f24404` sonrası çalışma ağacı

## Kapsam ve sonuç

- `/xinobi` marka yaklaşımı, tasarım ilkeleri, malzeme anlatısı, içerik önizlemesi ve yönlendirmeler.
- Ana sayfa masaüstü/mobil menüsü, hikâye alanı ve footer yeni rotaya bağlandı.
- CMS onayı olmayan kartlar açıkça prototip/yakında olarak etiketlendi.
- ESLint başarılı.
- Ağ erişimli üretim derlemesinde TypeScript ve 22/22 statik sayfa üretimi başarılı.
- Yerel HTTP smoke testinde kurumsal başlıklar, CMS bekleme ve Faz02 prototip etiketleri doğrulandı.

## Başarısız/tekrarlanan denemeler

- Sandbox içindeki iki Turbopack derlemesi `optimized production build` adımında çıktı üretmeden bekledi ve kontrollü durduruldu.
- Webpack tanı denemesi `fonts.googleapis.com` DNS erişimi olmadığı için `next/font` Inter indirmesinde başarısız oldu.
- Aynı standart Turbopack komutu ağ erişimiyle 6.1 saniyede tamamlandı; uygulama kodu/TypeScript hatası bulunmadı.

## Açık testler

- Gerçek tarayıcı, klavye/ekran okuyucu ve farklı genişliklerde görsel QA.
- Faz04 sonrasında CMS taslak/önizleme/yayın/geri çekme, SEO canonical ve yalnız yayınlanmış içerik testi.
- Nihai marka metinleri ve medya kullanım hakları için içerik sahibi onayı.

## Sonraki adım

WEB-020 yasal/çerez tercih kabuğu hazırlanabilir; deployment kullanıcı isteğine kadar yapılmaz.
