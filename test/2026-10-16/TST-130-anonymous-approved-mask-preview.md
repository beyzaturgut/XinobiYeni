# TST-130 — Onaylı maskenin webden okunması

16.10.2026 · Yerel, push yok.

Sorun: Development commerce-mask rendering-inputs GET adresi default-deny yetkilendirmesine takılıp ziyaretçiye 401 veriyordu. Yalnız bu salt okunur adrese AllowAnonymous eklendi; Development/loopback sınırı ve personel gerektiren maske yönetimi korunuyor.

Doğrulama: ProductSurfaceWorkspaceTests 13/13 başarılı. Renklerle paylaşılmış onaylı maskeler çerezsiz ziyaretçi istemcisinden okunuyor; aynı istemci yönetim GET adresinde 401 alıyor. Gerçek CM121-125 seçili varyant API yanıtı previewAvailable=true, 1334×2000; maske PNG GET 200. Yerel servisler yeni kodla başlatıldı. Harici AI üretimi tetiklenmedi; kullanıcının anket/üretim oturumu değiştirilmedi. Tam anketten canvas'a tarayıcı testi bu değişiklikte yapılmadı.

Kullanım: web sayfasını yenile; aynı ürün/renkte soruları tamamla, tasarım hazır olduğunda Üründe gelişmiş önizlemeyi aç. Yerelde maske onayı hemen okunur; canlı yayın bu denemenin kapsamında değil.
