# TST-098 — Ortak hesap API'si ve mobil hesap

- Tarih/saat (Europe/Istanbul): 07.10.2026 ~16:45–17:20
- Commit/branch: `main` / `8aa43ca` üzerinde çalışma ağacı
- Faz/görev: Faz03 03.03 (geçici geliştirme deposunda) + ADR-004 T-03 mobil jeton modu; proje sahibi kararı: web ve mobil ortak hesap
- Seviye: UNIT / INTEGRATION / CONTRACT / WIDGET / E2E (emülatör)
- Ortam: LOCAL · .NET 10.0.401, Flutter 3.47.5, Android emülatörü Pixel 8; emülatör denemesinde API ayrı içerik klasöründen (`--contentRoot`), e-posta **önizleme modunda**, veri kopya klasörde
- Çalıştıran: Claude Code

## Yapılanlar

- `/api/v1/auth`: `email-verification` (kod isteme), `register` (kod doğrulanmadan hesap açılmaz; "zaten kayıtlı" yalnız adresin sahibine gösterilir), `login` (yanlış parola/bilinmeyen e-posta/geçersiz e-posta aynı yanıt; bilinmeyen e-postada sahte özet doğrulamasıyla süre eşitlenir), `refresh` (dönen jeton; eski jeton tekrar gelirse aile iptal), `logout`; `GET /api/v1/me` (taşıyıcı jeton). Problem Details + `code`.
- Parola ASP.NET `PasswordHasher` (PBKDF2, tuzlu); erişim jetonu 15 dk, yenileme jetonu 30 gün; ikisi de yalnız SHA-256 özetiyle saklanır. Development'ta `App_Data/local-commerce/identity/accounts.json` (ADR-003), diğer ortamlarda 503 `account_unavailable`. İstek sınırı: dakikada 20 (IP başına).
- OpenAPI + TS/Dart istemcileri (`AccountApi`).
- Mobil: `AccountRepository`, yenileme jetonu `flutter_secure_storage` (Keychain/Keystore), erişim jetonu yalnız bellekte; açılışta oturum geri yükleme, 401'de tek seferlik yenileme; "Hesap" sekmesi: giriş, iki adımlı üyelik (kod, 60 sn yeniden gönderme, geliştirme modu kodu etiketli), profil, çıkış.

## Komut ve sonuç

```text
dotnet build -c Release && dotnet test --no-build -c Release  → 77/77 (7 yeni AccountTests)
dart test (packages/clients/dart)                             → 4/4
flutter analyze && flutter test (apps/mobile)                 → temiz; 25/25 (5 yeni hesap testi)
pnpm lint; pnpm --filter web build; istemci kayması            → başarılı; 0
Emülatör: Hesap → Üye ol → kod (önizleme 484256) → Hesabı oluştur → profil; uygulama kapat/aç → oturum geri geldi; Çıkış yap → giriş ekranı, sunucuda 2 yenileme jetonu iptal; depoda düz parola/jeton yok
```

- Durum: **BAŞARILI** (aşağıdaki olayla birlikte)

## Olay: testlerden 5 gerçek doğrulama e-postası gönderildi

İlk koşuda `AccountTests` önizleme modunu yapılandırmayla seçti; ancak `Program.cs` geliştirme ortamında `appsettings.Local.json`'u test yapılandırmasından **sonra** yüklediği ve o dosyada `Email:DeliveryMode=Smtp` olduğu için gerçek SMTP göndericisi kullanıldı. 5 testin her biri ilk adımda `ayse@example.com` adresine 1 doğrulama kodu e-postası gönderdi (toplam 5; muhtemelen proje sahibinin Gmail SMTP hesabından). `example.com` posta kabul etmeyen ayrılmış bir alan adıdır; geri dönen "teslim edilemedi" bildirimleri beklenebilir. Kod veya kişisel veri sızmadı.

Düzeltme: `AccountTests` göndericiyi DI'da kayıt tutan önizleme göndericisiyle değiştirir (yapılandırma ezemez) ve `TestsNeverUseARealEmailSender` testi hem servisin değiştirildiğini hem de gönderim sayısını doğrular. E-posta uçlarını kullanan diğer test dosyası (`EmailVerificationTests`) zaten DI ile değiştiriyordu. **Kalan risk:** `appsettings.Local.json`'un ortam değişkenlerini ve test yapılandırmasını ezmesi; geliştirme deposunu kullanan her yeni test göndericiyi DI'da değiştirmelidir.

## Etki ve sonraki adım

Hesaplar web ve mobil için tek sözleşmede. Sonraki adım: web'in tarayıcı demo hesabını bu API'ye geçirmek (ADR-004: web'de HttpOnly cookie + CSRF).
