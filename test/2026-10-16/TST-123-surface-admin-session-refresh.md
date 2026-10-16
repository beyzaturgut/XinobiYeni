# TST-123 — Yüzey API 401 sonrası yönetici oturumu yenileme

16.10.2026 · Faz03/06 · kaynak `bab0b68` sonrası.

Kullanıcı boyamadan sonraki işlemde “Yüzey servisi hata verdi (401)” bildirdi. Yüzey ekranının fetch yardımcısı, panelin diğer isteklerinde bulunan yönetici cookie yenilemesini atlıyordu.

Düzeltme: Ortak `refreshAdminSession` mevcut personel refresh isteğini paylaşır. Yüzey isteği 401 alırsa `/auth/admin/refresh` ile bir kez yeniler, başarılıysa özgün isteği yalnız bir kez tekrarlar. Müşteri refresh yolu kullanılmaz; CSRF ve personel izinleri korunur. Yenileme başarısızsa başka sekmede giriş yaparak mevcut boyamayı koruma yönlendirmesi gösterilir. 403 yetki eksikliği ayrı açıklanır.

Doğrulama:

- Admin build ve lint: başarılı (mevcut uyarılar; hata yok).
- `node tools/test-guided-surface-admin.mjs --expired-session`: başarılı; ilk segment isteği sahte 401, tek personel refresh, ardından yalnız bir yetkili inference ve iki renk onayı. Çizim yalnız bir kez kaydedilir.
- `node tools/test-guided-surface-admin.mjs --expired-session --failed-refresh`: başarılı; refresh reddedilince açıklama, kılavuz korunur, inference 0, müşteri refresh 0.
- `git diff --check`: başarılı.

Test senaryosuna eklenen erken çıkış ilk çalışmada ES module üst seviye `return` sözdizimi hatası verdi; test async fonksiyona alınarak düzeltildi, `node --check` ve iki tarayıcı koşusu geçti.

Tüm test HTTP yanıtları sahte; gerçek Roboflow çağrısı, SQL yazımı veya kullanıcı taslağına müdahale yok. Yerel Vite güncellemeyi yükler; tam oturum kaybında kullanıcı aynı origin ile ikinci sekmede giriş yapmalıdır.
