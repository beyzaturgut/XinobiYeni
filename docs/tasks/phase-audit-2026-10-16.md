# 16.10.2026 faz ilerleme denetimi

Kapsam: `880cff0..f4adc49`; 36 geliştirme/test/belge commiti (merge commitleri hariç). Kod ve mevcut test raporları incelendi; uygulama testleri yeniden çalıştırılmadı. Resmi rol/PM kabulü verilmedi.

Yüzdeler efor/süre ölçümü değil, görev kapsamına göre yaklaşık geliştirme oranıdır. Kısmi işlerin ilerlemesi ve hata düzeltmeleri tam görev kabulü sayılmaz. Faz03: kimlik görevi ilerledi (%71 → %75); Faz04: özetin %50 oranı ayrıntıya eşitlendi; Faz05: kalıcı web favorileri/hesap akışları (%47 → %52); Faz06: yerleşim saklama ve yeniden açma (%40 → %45); Faz11: mobil iyileştirmeler (%20 → %22). Diğer oranlar korundu. Faz00 %85; 12 faz eşit ağırlıklı ortalama %44,9, yürütme fazları 01–11 %41,3. Bunlar bütçe veya kalan süre tahmini değildir.

## Commit → faz kaydı

| Commit | Faz | Değişiklik |
|---|---|---|
| `f4adc49` | 02 / 06 / 10 / 11 | Preserve saved photo placement through My Designs and cart flows |
| `495eef1` | 02 / 06 / 10 / 11 | Match homepage product mockup to mobile and remove artwork screenshot UI |
| `fc706b4` | 02 / 06 / 10 / 11 | Fix mobile homepage product preview sizing and card layout |
| `865f20a` | 03 / 05 | fix(web): preserve photo editor placement in cart previews |
| `8d99783` | 02 / 06 / 10 / 11 | fix(mobile): retain photo placement in cart and clear preview prompts |
| `8703cc9` | 02 / 06 / 10 / 11 | fix(web): size homepage product preview correctly and retain fallback photo |
| `1b5cde5` | 02 / 06 / 10 / 11 | fix(mobile): localize Material dialogs and date picker in Turkish |
| `19ac66f` | 02 / 06 / 10 / 11 | fix(preview): support HTTP design sessions and public catalog rendering |
| `dfada16` | 04 | fix(admin): create catalog IDs on the HTTP test site |
| `5f704cf` | 03 / 05 | fix(web): clear reset code when switching from email to verification |
| `fd52a16` | 03 / 05 | fix(web): use production account email verification for registration |
| `b54168f` | 03 / 05 | fix(deploy): keep customer account API enabled in IIS web export |
| `c618feb` | 03 | fix(auth): enable SQL-backed admin email MFA and service recovery |
| `5cbe7da` | 03 | fix(ci): prepare Dart SDK for API contract generation |
| `18888a4` | 03 | fix(ci): isolate catalog fixtures and format assistant prices deterministically |
| `2e3023b` | 03 | test(auth): align catalog authorization with MFA and isolated cookies |
| `456444e` | 03 | fix(deps): include SkiaSharp Linux native assets |
| `d8cd5fe` | 03 / 11 | docs(deploy): record HTTP origin web/admin and API packages |
| `ef66c03` | 03 | fix(deps): patch vulnerable PKCS cryptography dependency |
| `fb9380e` | 03 / 11 | feat(deploy): serve the IP test server over HTTP with the API on /api |
| `1f02e1f` | 03 / 05 | fix(notifications): persist read state and count unread items |
| `b210122` | 03 / 05 | fix(web): improve order actions and loading errors |
| `8f3adc4` | 03 / 05 | feat(web): add customer reviews account page |
| `2550209` | 03 / 05 | fix(web): confirm address deletion in accessible modal |
| `754db13` | 03 / 05 | feat(web): persist customer favorites through account API |
| `fc715ec` | 03 | feat(identity): secure admin lifecycle isolated sessions and favorites API |
| `bd67683` | 03 | feat(persistence): add invitation favorites MFA and recovery schemas |
| `d87d945` | 03 / 05 | feat(web): drop the standalone /hesap/giris page; sign in from /hesap |
| `f22a7ae` | 02 / 06 / 10 / 11 | feat(xinobi-u): persist active colour and require explicit preview navigation |
| `62f971a` | 02 / 06 / 10 / 11 | feat(xinobi-u): optimize photo uploads and preserve artwork across accepted variants |
| `5a0846b` | 04 | feat(web): robots, sitemap, canonicals and structured data |
| `925842d` | 02 / 06 / 10 / 11 | test(web): accept the 13 October editor rendering as the CM101 pixel reference |
| `bccef08` | 02 / 06 / 10 / 11 | test(web): run e2e against the current catalogue and XINOBI U flow |
| `2497bba` | 02 / 06 / 10 / 11 | test(web): answer the storefront catalog in e2e and skip CM101 without local data |
| `5168f0b` | 03 | feat(identity): reset a forgotten password with an e-mailed code |
| `2a60693` | 03 | feat(audit): record panel change attempts and show them read-only |

## Kanıt ve sınırlar

- Son kayıtlı tam web koşusu: TST-120, 119 geçti / 0 başarısız / 1 atlandı; güncel HEAD için sonuç iddiası değildir.
.NET, mobil ve diğer tarihsel sonuçlar TST-115–120 içinde; DEPLOY-011’de 417 başarılı / 1 başarısız koşu kayıtlı, sonraki düzeltmelerin güncel tam regresyonu bu denetimde çalıştırılmadı.
- 0006–0009 migration dosyaları kodda var; hedef SQL uygulaması/restore kanıtı doğrulanmadı.
- HTTP test sunucusu hazırlığı canlı uygulama kabulü sayılmadı.
- Faz01/07/08/09 karar ve entegrasyon açıklarında yeni tamamlanma kanıtı bulunmadı.
- Belge kontrolü: oranlar Faz00 ile Faz01–11 arasında eşit; göreli Markdown dosya bağlantıları mevcut; `git diff --check` başarılı.
