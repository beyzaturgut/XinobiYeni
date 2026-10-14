# TST-117 — Parola sıfırlama (Faz03 03.03)

- Tarih/saat (Europe/Istanbul): 14.10.2026
- Commit/branch: `main` / `2a60693` → bu commit
- Faz/görev: Faz03 03.03 kimlik — parola sıfırlama
- Seviye: UNIT / INTEGRATION / CONTRACT / E2E (sahte tarayıcı API’si) / WIDGET
- Ortam: macOS; izole API (`IsolatedApiFactory`), Playwright + Chrome, Flutter test; gerçek e-posta gönderilmedi
- Çalıştıran: Claude Code

## Uygulama

- `POST /api/v1/auth/password-reset` ve `POST /api/v1/auth/password-reset/confirm`. Yanıt, adresin hesabı olup olmamasından bağımsız aynıdır; kod yalnız var olan hesaba gönderilir (`EmailVerificationStore.Start(..., deliver:false)` aynı bekleme süresini uygular). Kod tek kullanımlık, 10 dk geçerli, 5 deneme sınırlı.
- Başarılı sıfırlama tüm cihazlardaki access/refresh oturumlarını kapatır (`IAccountStore.ResetPassword`, dosya ve SQL deposu).
- E-posta metni amaca göre: "Xinobi parola sıfırlama kodun" (SMTP ve Resend göndericileri).
- OpenAPI + TS/Dart istemcileri yeniden üretildi; Dart istemcideki eski `ProductDetail` test verisi (`originalImageUrl`, `gallery`, `specs`) güncel sözleşmeye eşlendi.
- Web: giriş formunda **Parolamı unuttum** → `password-reset.tsx`. Mobil: `/hesap/parola-sifirla`.

## Komut

```text
dotnet test XinobiYeni.slnx
cd packages/clients/dart && dart run build_runner build && dart analyze && dart test
cd apps/mobile && flutter analyze && flutter test
cd apps/web && pnpm exec tsc --noEmit && pnpm lint
node tests/run-e2e.mjs critical-interactions.spec.ts accessibility.spec.ts --grep "parolamı unuttum|üyelik akışında|/hesap/giris/|hesap profili"
```

## Sonuç

| Kontrol | Sonuç |
|---|---|
| .NET | **389 geçti / 14 atlandı / 0 başarısız**; yeni `PasswordResetSetsTheNewPasswordAndSignsOutEveryDevice`, `PasswordResetForAnUnknownAddressLooksTheSameAndSendsNothing` |
| Dart istemci | analyze temiz, 4/4 (önceden 3/4: eski test verisi) |
| Flutter | analyze temiz, **56/56** (yeni sıfırlama widget testi) |
| Web tsc / lint | Temiz |
| Hedefli web e2e | **4/4**: sıfırlama akışı (hatalı kod → hata, doğru kod → girişe dönüş), `/hesap/giris/` axe taraması, klavye odağı, profil/adres |

## Bilinen ve bu işten bağımsız sorunlar

- Tam web e2e paketi bu işte çalıştırılmadı. Değişiklik öncesi koda karşı yapılan kısmi koşuda (66/119’da durduruldu) `/api/v1/catalog/storefront` sahte yanıtı eksik olduğu için sepet/katalog senaryoları zaman aşımına düşüyor (`d1639f6` sonrası gerileme); ayrıca `cm101-approval-preview.spec.ts` depoda olmayan `App_Data` dosyalarına bağlı olduğundan paket yüklenemiyor. Sonraki onaylı iş olarak ele alınacak.
- Development önizleme modunda kayıtlı olmayan adres için deneme kodu gösterilmez (kayıtlı adreste gösterilir); yalnız Development’ta geçerli, üretimde kod hiçbir zaman yanıta girmez.

## Sonuç kararı

BAŞARILI. Faz kabulü değildir.
