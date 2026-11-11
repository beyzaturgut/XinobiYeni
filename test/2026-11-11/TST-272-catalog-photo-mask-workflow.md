# TST-272 — Mevcut fotoğrafla maskeleme akışını geri getirme

11.11.2026 · Yalnız admin maskeleme akışı ve kaynak seçme/yükleme desteği. Kullanıcının açıklaması: fotoğraf indirme → prompt kopyalama → hazırlanmış maskeyi yükleme → tek fotoğraf onayı korunacak; başka renkler için onay kaldırılacak.

## Uygulama

Ayrı “Tek kaynak fotoğraf” kayıt bölümü geri eklenmedi. Ürün yüzeylerinde profili olmayan ürünün mevcut katalog fotoğrafı seçilebilir. GET/indirme kayıt oluşturmaz. İlk geçerli maske yüklemesi seçilen fotoğrafın değişmez kopyasını ve maske taslağını atomik belge güncellemesiyle kaydeder. Kaynak hash/boyut, ürün-fotoğraf bağı ve sürüm kontrol edilir; hatalı yükleme profil oluşturmaz. Aynı anda ilk yüklemelerden yalnız biri kabul edilir. Önizleme/onay yalnız bu kaynağa aittir; başka renklere kopyalama ve bulk approval 410 kalır.

Mevcut kaynak profilleri, eski maskeler, normal katalog renkleri ve geçmiş sipariş dosyaları korunur; otomatik geçiş yapılmadı. Orijinal fotoğraf ticari SKU seçmez; varyant fotoğrafı açıkça seçilirse o fiziksel SKU bağlanır. Gerçek veriye test yazımı yoktur.

## Doğrulama

- Odaklı API: 17/17 PASS. Yatay/dikey/kare ve 5001×4000 kaynak; byte/hash indirme eşliği; yanlış boyut, yabancı fotoğraf, yanlış hash reddi; eşzamanlı ilk yükleme; onay/yayın; normal katalog JSON'ının değişmemesi ve toplu onayın kapalı kalması.
- İzole yeni tarayıcı testi: 390 ve 1440 px PASS. Fotoğraf seçimi → gerçek boyutlu prompt → byte eşit indirme → rev0'dan rev1'e maskeli taslak → tek fotoğraf onayı; ayrı kaynak yazımı yok; taşma yok.
- Mevcut single-source-mask tarayıcı regresyonu PASS: yükleme/onay/WebP indirme, hata, kaynak değişimi, yetki, responsive/axe.
- Admin lint PASS (AuditHistory.tsx içindeki mevcut 1 uyarı); TypeScript ve Vite üretim derlemesi PASS.
- API Release ve sözleşme üretimi PASS; paket sözleşmelerinde fark oluşmadı (bu admin uçları OpenAPI açıklamasından hariçtir).
- Gerçek yerel oturumla salt okunur ekran kontrolü: 7 ürün listelendi; Elektrikli Çay Makinesi 101105'te 1024×1024 mevcut fotoğraf, kaynak indirme, gerçek ölçülü prompt ve WebP alanı açıldı. Kaynak yok uyarısı kalktı. Bu kontrolde yükleme/onay yapılmadı. Web3000/admin5173 HTTP200.
- Tam API regresyonu: 641 PASS / 30 SKIP / 0 FAIL.

İlk tam tarama 640 PASS / 30 SKIP / 1 FAIL: müşteri SQL koruma fixture'ı uygulamanın yerel DbContext bağlantısını yakalıyordu. Fixture'a açıkça bağlantısız SQL DbContext verildi ve bakım worker'ı kaldırıldı; üretim müşteri kodu/SQL ayarları değişmedi. Son tam tekrarın sonucu yukarıdadır.

## Görsel kanıt ve sınırlar

[390 px](TST-272-mask-390.png), [1440 px](TST-272-mask-1440.png). Sentetik ürün/maske; görsel olarak incelendi. Ekran testi gerçek maske kalitesi veya fiziksel baskı kabulü değildir. Mevcut RAM/dosya bütçesi korunur; sabit tuval dayatılmaz. Başarısız dosya/belge yarışında referanssız dosya kalabilir; yeni yaşam döngüsü/temizleme işi eklenmedi. SQL çoklu süreç, gerçek cihaz/ekran okuyucu ve iş sahibi kabulü önceki açık kapsamda kalır. Deploy/APK yoktur.
