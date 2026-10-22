# TST-129 — Fotoğrafa özel logo maskeleme promptu

16.10.2026 · Yerel deneme; commit/push yok.

Prompt, kaynak fotoğraftan logo/yazı/simge konturunun incelenmesini ister; marka, renk veya konum sabitlemez. Basılı logo için yalnız çizgiler alfa 0; harf içi/arası ve çevresindeki gövde alfa 255. Gerçek fiziksel etiket/plaka varsa gerçek sınırı korunur. Tahmini dikdörtgen boşluk ve fotoğraftan kesilmiş logo yaması yasaklanır.

Kod dayanağı: ProductSurfaceWorkspace.RenderingInputs ayrı branding katmanı vermiyor. product-pattern-preview.tsx deseni destination-in ile kesip kaynak üzerine çiziyor; gereksiz şeffaf alan eski gövde rengini gösterir. Maskede binary alfa beklentisi korunur.

Doğrulama: admin build başarılı; lint 0 hata, mevcut 7 uyarı. `node tools/test-guided-surface-admin.mjs --mask-prompt` başarılı: yeni logo kuralları kopyalanan metinde, sabit marka/renk yok; farklı varyantlarda boyut/renk/hash, hedef düzenleme, pano reddi, dar ekran ve sıfır sağlayıcı/yazma çağrısı doğrulandı. Harici AI ile maske üretilmedi; görsel kalite garantisi verilmez.
