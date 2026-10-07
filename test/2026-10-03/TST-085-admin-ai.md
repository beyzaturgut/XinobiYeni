# TST-085 — ADM-012 AI yönetim prototipi

03.10.2026 · HEAD acc0c99; çalışma ağacı.

- Cloudflare Workers AI görsel sağlayıcı kararını koruyan, bağlantısız yönetim yüzeyi; sabit model/fiyat veya secret gösterilmez.
- Demo politika ve istem sürümleri; limit/gerekçe/istem doğrulama, eski sürüm koruma ve oturumda yeni sürüm.
- Örnek kullanım/belirsiz hata; bilinmeyen kesin ücret sıfır gösterilmez.
- Kaynak yayın/onay/geçerlilik kapısı; taslak/onaysız/süresi dolmuş kaynaklar uygun sayılmaz.
- Örnek devir talebi ve izin/kanal bekleyen kapalı gerçek devir.
- `pnpm --filter admin build`, `lint`, `git diff --check`: başarılı.
- `node tools/test-ai-admin-model.mjs`: limit/istem/gerekçe ve yayın/onay/son geçerlilik sınırı başarılı.
- `node tools/test-admin-ai.mjs`: politika validation/eski sürüm/gezinme, bilinmeyen ücret, belirsiz iş, kaynak tarihi, devir kapısı ve 4 bölüm × 4 genişlik başarılı; pageerror yok.
- `node tools/test-admin-panel.mjs`: mevcut panel regresyonu başarılı.
- PNG: TST-085-ai-desktop.png, TST-085-ai-mobile.png; mobil çıktı incelendi.

D05/D08/D10, gerçek kimlik/yetki/audit/kota/sağlayıcı/ücret ve destek kanalı kabulü açık. Gerçek AI üretimi, lead, rıza kaydı veya devir yapılmadı. Sonraki açık panel teslimi ADM-002 rol/ayar/denetim.
