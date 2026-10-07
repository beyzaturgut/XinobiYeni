# TST-094 — XINOBI U oturum sözleşmesi (web + mobil)

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `9c3a4ac` üzerinde çalışma ağacı
- Faz/görev: 1. adım devamı — XINOBI U uçlarının sözleşmeye alınması (Faz10 erken entegrasyonu, ADR-002 Ek A kapsamında)
- Seviye: INTEGRATION / CONTRACT / CI CONTRACT / SMOKE
- Ortam: LOCAL · .NET 10.0.401, Flutter 3.47.5
- Çalıştıran: Claude Code

## Yapılanlar

- `/api/v1/xinobi-u`: `GET /status`, `POST /sessions`, `GET /sessions/{id}`, `POST /sessions/{id}/generation`, `GET /sessions/{id}/image` (PNG/JPEG ikili). Mevcut tasarım oturum deposunu kullanır; web'in kullandığı `/api/v1/design-studio` aynı depoyla değişmeden çalışmaya devam eder.
- Mobil için `browserId` sözleşmede `clientId` (cihaz/tarayıcı başına rastgele UUID; kişisel veri yok).
- Korumalar aynen: Development'ta yalnız loopback (Android emülatörü 10.0.2.2 dahil), izinli origin, dakika başı istek sınırı, günlük üretim sınırı, aynı yanıtlarla tekrar istekte yeni sağlayıcı çağrısı yok, farklı yanıt 409 `answers_locked`. Production ve diğer ortamlarda `503 xinobi_u_unavailable` (kimlik, moderasyon ve saklama Faz10'a kadar).
- Hatalar Problem Details + `code`: `invalid_request` 400, `session_expired` 404, `answers_locked`/`questionnaire_updated` 409, `*_limit` 429, sağlayıcı hataları 503.
- Görsel adresleri tam URL; `imageUrl` yalnız `ready` durumunda dolu.
- OpenAPI + TS/Dart istemcileri yeniden üretildi (`XinobiUApi`; görsel ucu Dart'ta `Uint8List`).

## Komut ve sonuç

```text
dotnet build XinobiYeni.slnx -c Release && dotnet test --no-build -c Release  → 58/58 (4 yeni XinobiUTests)
dart run build_runner build && dart analyze && dart test                      → temiz; 4/4 (1 yeni oturum testi)
flutter analyze && flutter test (apps/mobile)                                 → temiz; 2/2
pnpm lint                                                                     → başarılı
Kayma: hazırlanmış değişiklikler üzerinde üretim tekrarı                       → değişen dosya 0
Duman (geçici 127.0.0.1:5013, gerçek yerel veri): status + oturum oluşturma   → 500 soru, oturum 5 soruyla döndü
```

- Durum: **BAŞARILI**
- Testler sahte sağlayıcıyla; ücretli Cloudflare çağrısı yapılmadı. Duman testinde üretim ucu bilinçli olarak çağrılmadı; yerel tasarım deposuna bir anket oturumu eklendi (24 saatte geçersiz olur).

## Etki ve sonraki adım

Mobilin ihtiyaç duyduğu katalog, içerik ve XINOBI U okuma/üretim akışlarının tamamı tek sözleşmede. Sonraki adım: Flutter uygulama iskeleti (Riverpod, go_router, tasarım tokenları) ve `CatalogApi`/`ContentApi` ile ilk ekranlar.
