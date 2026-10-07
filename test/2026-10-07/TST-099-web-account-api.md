# TST-099 — Web hesabının ortak hesap API'sine geçişi

- Tarih/saat (Europe/Istanbul): 07.10.2026 ~17:20–17:50
- Commit/branch: `main` / `0eace5b` üzerinde çalışma ağacı
- Faz/görev: Faz03 03.03 + ADR-004 T-03 web modu (HttpOnly cookie + CSRF); proje sahibi kararı: web ve mobil ortak hesap
- Seviye: INTEGRATION / CONTRACT / E2E (gerçek tarayıcı + yalıtılmış API)
- Ortam: LOCAL · web dev sunucusu 3000; yalıtılmış geçici API 5013 (`--contentRoot` ayrı klasör, e-posta önizleme modu, veri kopyası) — tarayıcının hesap istekleri 5003→5013 yönlendirildi
- Çalıştıran: Claude Code

## Yapılanlar

- API: `/api/v1/auth/web/register|login|refresh|logout`. Jetonlar yanıt gövdesine değil `HttpOnly`, `SameSite=Lax` (HTTPS'te `Secure`) cookie'lere yazılır: `xinobi_at` (yol `/api/v1`, 15 dk), `xinobi_rt` (yol `/api/v1/auth/web`, 30 gün). Web uçları ve cookie ile yapılan her değiştirici istek `X-Xinobi-Csrf: 1` başlığı ister (yoksa 403 `csrf_required` / kimliksiz). Geliştirme CORS politikasına `AllowCredentials` eklendi (izinli kaynaklar açık liste olarak kaldı). Kimlik doğrulama önce taşıyıcı jetona, yoksa cookie'ye bakar.
- Web: `src/lib/demo-commerce.ts` aynı dışa açık fonksiyonlarla API'ye bağlandı; oturum `/api/v1/me`'den okunur, erişim cookie'si dolunca bir kez yenilenir. Deneme siparişleri tarayıcıda kalır, gerçek hesap kimliğine bağlanır. Hesap panelinde oturum yüklenirken "Oturum kontrol ediliyor…" ve depolama açıklaması güncellendi. Başka oturumun hesap ekranı tasarımına dokunulmadı.
- `tools/test-demo-commerce.mjs` hesap uçlarını tarayıcı içinde taklit eder; geliştiricinin gerçek hesap deposunda hesap açmaz.

## Komut ve sonuç

```text
dotnet test (Release)                      → 78/78 (1 yeni: web cookie oturumu, CSRF, yenileme, çıkış)
flutter test / dart test                   → 25/25, 4/4
pnpm lint; pnpm --filter web build          → başarılı; istemci kayması 0
node tools/test-demo-commerce.mjs           → başarılı
node tools/test-cart.mjs; test-xinobi-u-direct-questions → başarılı
Gerçek tarayıcı + yalıtılmış API: kayıt (önizleme kodu) → panel; cookie httpOnly=true sameSite=Lax; document.cookie jetonu göstermiyor; yenileme sonrası oturum sürüyor; çıkış + yenileme → "Aktif oturum bulunamadı"
Ortak hesap: mobilde açılan mobil.test@example.com ile web'de giriş başarılı
```

- Durum: **BAŞARILI**. Hiçbir gerçek e-posta gönderilmedi; denemelerde açılan hesaplar yalnız kopya klasörde.

## Önemli

Web artık `/api/v1/auth/web/*` uçlarını çağırıyor. Proje sahibinin çalışan dev API'si (16:09) bu uçları içermediği için web'de giriş/kayıt `pnpm dev:local` yeniden başlatılana kadar çalışmaz. Eski tarayıcı demo kullanıcıları (localStorage) geçersizdir; yeniden kayıt gerekir.
