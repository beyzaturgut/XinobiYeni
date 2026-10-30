# Canlı admin giriş ekranı teşhisi / 30.10.2026

Kullanıcı aynı canlı URL’yi doğruladı: http://109.104.120.91:8014/admin/ . Uygulama/hosting/hesap/izin değişikliği veya deployment yapılmadı; giriş ekranı mevcut sürümde var. Yeni bir giriş sistemi eklemek gerekli görünmedi.

- TST-167 / ISOLATED FETCH: `node apps/admin/tests/admin-request.mjs` PASS. Personel refresh tekilleştirme, geç gelen 401, sınırlı tekrar, auth dışlama, hata durumları, expiry/multipart/204. Gerçek ağ/hesap/SQL yok.
- TST-168 / READ-ONLY LIVE: curl ile admin HTML 200; JS içinde Yönetici girişi, admin/session, auth/admin/login ve MFA verify kodu var. Girişsiz admin/session ve local-commerce/state 401; admin/designs 401. `/api/v1/admin/orders` 404 döndü; bu tahmini yolun sonucu bir sipariş yetki testi olarak sayılmadı. deployment.json 404; canlı kaynak commit’i bu kontrolden doğrulanamadı.
- TST-169 / LIVE UI: Yeni Chrome bağlamında giriş formu açıldı, session ve otomatik staff refresh 401. Kullanıcının uygulama içi tarayıcısında da aynı canlı adres açıldı; Yönetici girişi, e-posta, parola, Giriş yap ve Parolamı unuttum görünür. Tab açık bırakıldı. Parola/OTP girilmedi, e-posta/SMS gönderilmedi, hesap açılmadı, mevcut hesaptan çıkış yapılması gerekmedi.

Geçerli yönetici oturumu varsa mevcut tasarım gereği form yerine panel açılır. Kullanıcının önceki tarayıcısında hangi durumun bulunduğu gözlemlenmedi; kalıcı oturum veya önbellek kesin neden olarak gösterilmez. Gerçek parola/MFA teslimli oturum açma ve kullanıcının başka tarayıcısındaki eski oturum bu çalışmada denenmedi. İlk anonim ziyaretin “oturumun sona erdi” mesajı mevcut davranıştır; giriş formunu engellemiyor.
