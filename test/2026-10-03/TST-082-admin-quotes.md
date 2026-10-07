# TST-082 — ADM-007 kurumsal teklif yönetimi

03.10.2026 · HEAD acc0c99; çalışma ağacı.

- Firma/referans arama, durum filtresi ve veri kaynaklı talep/revizyon sayaçları.
- Firma yetkilisi, termin/kişiselleştirme, değişmez satır/sürüm geçmişi ve TRY ürün toplamı.
- Son sürümden demo revizyon; satır adet/fiyat, geçerlilik, teslimat ve gerekçe doğrulaması. Variant/SKU/etiket anlık görüntüleri korunur.
- Yeni sürüm eski sürümü değiştirmez. Eski temel sürüm çatışması modelde reddedilir; gerçek çok kullanıcılı API kabulü değildir.
- Gönderim/onay/sipariş dönüşümü/dosya indirme gerçek D07/API/sağlayıcı kapılarında kapalı.

## Doğrulama

- `pnpm --filter admin build`, `lint`, `git diff --check`: başarılı.
- İlk model testi uzantısız TS import nedeniyle ERR_MODULE_NOT_FOUND verdi; `.ts` import ile düzeltildi.
- `node tools/test-quote-model.mjs`: değişmez sürüm, nesne kopyası, kuruş toplamı, eski temel çatışması, satır/tarih/koşul/gerekçe doğrulaması başarılı.
- `node tools/test-admin-quotes.mjs`: filtre, sürüm koruma, adet hata, toplam, son sürüm temeli, vazgeçme, kaydedilen revizyonun panel gezinmesinde korunması ve 320/390/768/1440 px başarılı; pageerror yok.
- `node tools/test-admin-panel.mjs`: mevcut panel regresyonu başarılı.
- PNG: TST-082-quotes-desktop.png ve TST-082-quotes-mobile.png. Masaüstü çıktı incelendi.

Veriler oturum içidir; yenilemede başlangıca döner. Firma/teklif detayları örnektir; gerçek yetki, paylaşım, durum geçişi veya toplu sipariş oluşturulmaz. Sonraki bağımsız ekran ADM-008 tasarım/baskı operasyonu.
