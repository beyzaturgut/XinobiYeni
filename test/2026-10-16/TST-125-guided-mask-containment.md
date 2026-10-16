# TST-125 — AI sonucunu boyanmış alanla sınırlama

16.10.2026 · Faz06 · kaynak `29f074a` sonrası.

Kullanıcı AI'nın boyanmayan alanları da seçtiğini bildirdi. Önceki akış çizimi yalnız pozitif iç noktalara dönüştürüyor, çıktıya mekânsal sınır koymuyordu.

Düzeltme: Kılavuz bytes snapshot'ı tutulur. Roboflow çıktısı aynı boyuttaki kılavuzla kesiştirilir; varsayılan tolerans 0. İsteğe bağlı 0–16 kaynak pikseli Manhattan uzaklık zarfı, iki geçişli uzaklık hesabıyla oluşturulur. AI'nın seçmediği piksel eklenmez; izinli zarfın dışı tamamen şeffaf kalır. Tolerans sınır dışıysa sağlayıcı çağrısından önce red; sonuç efektif boşsa mevcut boyama korunarak `guide_no_overlap`. Fırça düzeltmeleri daha sonra açık kullanıcı işlemi olarak yine uygulanabilir. Bu sınırlandırma yalnız elle gösterme akışındadır; metin/nokta sekmeleri kendi mevcut davranışını korur.

Kontroller:

- Odaklı workspace + Roboflow sağlayıcı testleri: **62/62**.
- Tolerans 0 ve 3 için çıktıdaki her pikselin izinli uzaklık alanıyla eşitliği; çok geniş sahte AI çıktısının kılavuzun dışına çıkmaması.
- Örtüşmeyen AI cevabında taslak PNG byte'ları değişmiyor; tek sahte çağrı.
- Tolerans 99 önceden reddediliyor; çağrı 0.
- Katalog/renk ortak onayı ve exact rendering bundle kontrolleri geçiyor.
- `node tools/test-guided-surface-admin.mjs --expired-session`: başarılı; varsayılan guideTolerancePixels=0 gönderiliyor.
- Admin build/lint ve `git diff --check`: başarılı; mevcut lint uyarıları, hata yok.

Gerçek sağlayıcı çağrısı ve kullanıcı maskesine yazım yapılmadı. Mevcut geniş AI taslakları geriye dönük düzeltilmedi; yeni boyamayla denenmeli. Aynı renklere onay akışı korunur. Semantik kenar/üretim baskısı kabulü değildir.
