# TST-086 — ADM-002 rol, ayar ve denetim

Tarih: 2026-10-03. Yerel React/Vite prototipi; gerçek kimlik/yetki/audit kabulü değildir.

- `node tools/test-settings-model.mjs`: PASS. Tanımsız kaynak/eylem reddi, sabit rol, geçersiz/yinelenen yetki, eşik doğrulaması, eski sürüm reddi, önceki state/audit korunması ve güvenli alan listesi.
- `pnpm --filter admin build`: PASS.
- `pnpm --filter admin lint`: PASS.
- `node tools/test-admin-settings.mjs`: ilk deneme rol seçicisinin tam erişilebilir adını bulamadı (timeout). Select üzerine açık `aria-label` eklendi; yeniden test PASS.
- UI: kilitli yönetici, ayar doğrulaması, gezinmede oturum state korunması, audit detay/arama, yenilemede sıfırlama; üç sekme x 320/390/768/1440 genişlikte dış taşma yok; JS hata yok.
- `node tools/test-admin-panel.mjs`: PASS. 13 kart, düzen, boş/hata, sipariş filtre/dialog/focus, içerik editörü ve dört genişlik.

Kanıt: [Masaüstü](TST-086-settings-desktop.png), [Mobil](TST-086-settings-mobile.png).

Gerçek API default-deny/nesne yetkisi, davet/oturum ve sunucu append-only denetim servisi açık. UI matrisi güvenlik sınırı değildir. Yalnız ayar ve yetki alanları kaydedilir; sır/gerçek kişisel veri girişi yok. Prototip tüm oturum değişikliklerini yenilemede sıfırlar. Faz/PM onayı verilmedi.
