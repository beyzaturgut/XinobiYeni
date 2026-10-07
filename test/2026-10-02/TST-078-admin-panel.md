# TST-078 — Yönetim paneli kabuğu/dashboard/sipariş

02.10.2026 · Kaynak HEAD acc0c99; değişiklikler çalışma ağacında.

- Siyah yatay dokuz modül menüsü, 68 px ikon şeridi, beyaz çalışma alanı uygulandı. Orijinal 61 PNG arşivi çalışma alanında yok; metin şartnamesi uygulandı, birebir kaynak görsel eşliği iddia edilmez.
- ADM-001: 13 kart, dokuz dönem, örnek/boş/hata, metinsel grafik karşılığı, kararlı kart kimliği ve demo düzeni kayıt/bozuk kayıt dönüşü.
- ADM-006: üç örnek sipariş, arama/durum/temizle, boş sonuç, native modal Escape ve odak dönüşü.
- ADM-009: mevcut içerik editörü korundu; etkin/yayın ve kaydet metinleri gerçek durumla hizalandı.
- İlk iki tarayıcı denemesi Durum filtresinin erişilebilir adı nedeniyle timeout verdi. HTML ilişki ve açık erişilebilir ad düzeltildi; final tekrar başarılı.
- `pnpm --filter admin build` ve `lint`: başarılı.
- `node tools/test-admin-panel.mjs`: kart sırası/yenileme/bozuk kayıt, hata/boş, filtre/modal/CMS, 320/390/768/1440 px taşma ve menü Escape kontrolü başarılı; pageerror yok.
- PNG: TST-078-admin-desktop.png, TST-078-admin-orders.png, TST-078-admin-mobile.png. Masaüstü çıktı görsel olarak incelendi.
- `git diff --check`: başarılı.
- Dönemler örnek veriyi gerçek finansal hesaplamaya dönüştürmez. Sağlayıcı/SQL/ticari API/yetki/kalıcı CMS/canlı kabul açık; faz tamamlanmadı.
