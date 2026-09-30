# TST-038 — Faz02 WEB-018 AI satış asistanı

- Tarih: 2026-09-30
- Commit/branch: `main` / `a856fe6` sonrası çalışma ağacı

## Kapsam ve sonuç

- `/asistan` sabit karşılama, hızlı konu seçimi, ürün/kurumsal yönlendirme ve demo mesaj geri bildirimi.
- Gerçek AI çağrısı, konuşma saklama, lead veya canlı destek devri yapılmaz.
- D05/D08/D10 ve sağlayıcı sınırları görünür.
- ESLint, TypeScript ve static export başarılı; 21/21 statik sayfa.
- Yerel HTTP metadata ve kritik güvenlik metinleri başarılı.

## Açık testler

- Gerçek tarayıcı konuşma/seçim, klavye/ekran okuyucu ve responsive QA.
- Faz10 sonrası kaynak doğrulama, yanlış bilgi, moderasyon, kota, konuşma rızası, lead ve insan devri testleri.

## Sonraki adım

WEB-019 kurumsal/içerik sayfa kabuğu hazırlanabilir; deployment kullanıcı isteğine kadar yapılmaz.
