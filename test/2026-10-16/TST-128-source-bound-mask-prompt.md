# TST-128 — Kaynak görsele bağlı maskeleme promptu ve kopyalama

16.10.2026 · Faz06 · Kullanıcı yerel maskeleme ekranında kaynak fotoğrafla birlikte başka bir AI'ya verilecek otomatik prompt istedi. Önceki push yapılmaması ve geri dönüş `adac37a` talimatı sürer.

Yeni panel bölümü kaynak indirme alanının hemen altında. Ürün adı/renk ve kimlikler katalogdan; width/height ve SHA-256, API'nin incelediği seçili kaynak dosyadan alınır. Koordinat başlangıcı (0,0), x/y sınırları, ölçek1/dönüş0, RGBA PNG alfa0/255, logo/ayrı gövde koruması, crop/trim/yeniden üretim yasağı otomatik metinde. Hedef bölge açıklaması düzenlenebilir. Semantik gövde sınırları metadata'dan uydurulmaz; ekli kaynak fotoğraftan çıkarılması istenir. AI exact PNG üretemezse bunu bildirmesi istenir. Piksellerin doğru hizalanacağı garanti edilmez.

Kontroller:

- Admin build/TypeScript ve lint: başarılı; mevcut uyarılar, hata yok.
- `node tools/test-guided-surface-admin.mjs --mask-prompt`: başarılı.
- Kopyalanan gerçek metinde boyut, renk, kaynak hash, koordinat ve alpha sözleşmesi doğrulandı.
- Hedef düzenlenince metin ve kopyalama durumu güncelleniyor; Mavi→Kırmızı ve 200×300→100×150 seçimleri doğru değerler veriyor; eski boyut kalmıyor.
- Sahte clipboard izin reddinde details açılıp tüm metin seçiliyor; yanlış “kopyalandı” durumu bırakılmıyor.
- 390 px genişlikte yatay taşma yok; tarayıcı hata0, API mutasyonu0, sağlayıcı çağrısı0. İşletim sistemi panosu testte değiştirilmedi.
- `/tmp/xinobi-mask-prompt.png` görsel kontrolü yapıldı; sadece sahte ürün.
- `git diff --check`: başarılı.

Yalnız istemci değişikliği; backend/maske algoritması değiştirilmedi. Local Vite günceller; API yeniden başlatılmadı. Commit/push yok. Geri dönüş manifestine yeni prompt dosyaları ve bu rapor eklendi.
