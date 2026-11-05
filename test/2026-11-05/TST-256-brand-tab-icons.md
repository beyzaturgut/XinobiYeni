# TST-256 | Web ve admin sekme simgeleri

05.11.2026. Webde mevcut beyaz Xinobi PNG logosu siyah zeminli, kendi içine gömülü SVG icon olarak kullanıldı; eski Next favicon.ico kaldırıldı. Admin Vite simgesi, panel marka alanındaki XINOBI / YÖNETİM PANELİ tipografisiyle değiştirildi. Admin HTML %BASE_URL% ve sürümlü URL kullanır; /admin/ altında kök web simgesiyle karışmaz.

Next 16.3.6 yerel app-icons dokümanı okundu. Web üretim build PASS; app/icon.svg exportta aynı baytlarla mevcut ve head icon href doğrulandı. Admin IIS profili vite build --base=/admin/ PASS; çıktı href /admin/favicon.svg?v=xinobi-admin-1. Chrome'da iki SVG 128/32/16 px decode ve görsel inceleme PASS. git diff --check PASS. Yeni davranış testi eklenmedi; yalnız görsel varlık/metadata değişikliği.

Deploy yapılmadı. Önceden yayımlanmış xinobi-d8ea431 bu değişikliği içermez. Tarayıcı sekme simgesi önbelleği nedeniyle sekme yeniden açılabilir.
