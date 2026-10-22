# 20.10.2026 faz ilerleme denetimi

Kapsam: `cd96d5c..42553c3` (`feature/surface-masking-preview-20261020`, `origin/main` `7152979` dahil); 30 geliştirme/test/belge commiti (merge commitleri hariç). Kod, test kayıtları ve bu oturumda koşulan testler incelendi. Resmi rol/PM kabulü verilmedi.

Yüzdeler efor/süre ölçümü değil, görev kapsamına göre yaklaşık geliştirme oranıdır. Faz04: SQL kayıtlarından sipariş/müşteri özet raporu ve maskeli salt okunur müşteri dizini (%50 → %52). Faz06: tek ortak maskenin aynı konumlu tüm renklere uygulanması, resim yüklemeli maskeleme akışı ve XINOBI U önizleme ekranının yeniden tasarımı (%45 → %47). Diğer oranlar korundu; panel düzeltmeleri mevcut kısmi işleri iyileştirdi ama açık görevleri kapatmadı. Faz00 %85; 12 faz eşit ağırlıklı ortalama %45,3, yürütme fazları 01–11 %41,6.

## Commit → faz kaydı

| Commit | Faz | Değişiklik |
|---|---|---|
| `42553c3` | 00 | docs: record surface masking and preview test runs |
| `250deff` | 02 / 06 / 10 | feat(web): redesign XINOBI U preview and apply shared approved masks |
| `dd94f56` | 04 / 06 | feat(admin): show catalogue photo prompt as a compact horizontal panel |
| `12455a4` | 06 | feat(surfaces): reduce admin masking to uploaded image masks |
| `068e976` | 06 | fix(admin): show unavailable print source and disable prototype actions |
| `a226037` | 04 / 06 | feat(admin): generate product-specific aligned catalog photo prompts |
| `6c53359` | 03 / 05 | fix(admin): guard notification retries and stale UI state |
| `ff9c277` | 04 | fix(admin): preserve intentionally cleared review replies |
| `bfce868` | 04 / 06 | docs(surfaces): add aligned colour photo generation prompt |
| `fd0097f` | 05 | fix(admin): handle order loading errors and safe retries |
| `b4d37ca` | 03 / 05 | feat(admin): add masked read-only customer directory |
| `ccb5d22` | 03 | fix(admin): resolve actor name only from matching session profile |
| `9ecc480` | 03 | fix(admin): present audit attempts in clear Turkish |
| `d6ff7da` | 04 | fix(admin): distinguish unavailable catalog from empty data |
| `6dcb01b` | 02 / 04 | fix(admin): remove shared development copy and shortcuts |
| `a7f358b` | 00 / 03 | test(admin): record isolated acceptance and remaining decision gates |
| `51eca15` | 03 | fix(admin): show API-granted session permissions instead of demo roles |
| `854e001` | 04 | fix(admin): keep price save results truthful and prevent duplicate clicks |
| `65c0722` | 04 / 05 | feat(admin): report recorded SQL order and customer counts safely |
| `84cdabd` | 04 | fix(admin): replace simulated results with explicit data-source boundaries |
| `7a84da0` | 03 / 04 | fix(admin): preserve drafts and block stale or unauthorized actions |
| `697ec23` | 03 | fix(admin): share staff-only refresh across panel requests |
| `653d35f` | 03 / 11 | fix(ci): respect localized mobile back navigation and derive preview placement |
| `76c0f6d` | 02 / 04 | feat(admin): separate work-area and operations navigation |
| `adac37a` | 06 / 10 | fix(surfaces): constrain guided segmentation to painted bounds |
| `29f074a` | 06 / 10 | fix(surfaces): distinguish no matches from malformed provider masks |
| `c8f58c3` | 03 / 06 | fix(admin): refresh staff sessions for surface requests |
| `bab0b68` | 06 | fix(admin): submit unsaved brush guides directly to segmentation |
| `98a2c75` | 06 / 10 | feat(surfaces): refine painted guides and share approved masks across colors |
| `cd96d5c` | 00 | docs(phases): record recent changes and refresh completion estimates |

`adac37a`, `29f074a`, `bab0b68` ve `98a2c75`'teki Roboflow/fırça/elle gösterme maskeleme araçları `12455a4` ile admin ve API'den kaldırıldı; tarihsel kanıt olarak kalır.

## Bu oturumda koşulan testler (20.10)

| Komut | Sonuç |
|---|---|
| `dotnet test tests/Xinobi.Architecture.Tests` | 433 geçti / 25 atlandı / **1 başarısız**: `AuthorizationTests.OnlyListedAreasArePublic` (TST-130'dan beri; anonim `commerce-mask/.../rendering-inputs` izinli public listesinde değil) |
| `node tools/test-guided-surface-admin.mjs` (varsayılan, `--expired-session`, `--expired-session --failed-refresh`, `--mask-prompt`) | Hepsi başarılı |
| Admin `tsc -b`, web `tsc --noEmit`, API build | Hatasız; API 0 uyarı |
| Web e2e: `xinobi-preview-ui`, `xinobi-preview-composition`, `local-pattern-image`, `xinobi-result`, `representative-disclosure`, `commerce-surface-integration` | 26 geçti / **11 başarısız**. Başarısızların hepsi XINOBI önizleme testleri (`canvas[role=img]` yok, renk butonu ve sonuç başlığı bulunamıyor). Web değişiklikleri stash'lenerek HEAD üzerinde de aynı 11 başarısız → bu oturumdan önce oluşmuş gerileme; TST-120 (14.10) tam web e2e 119/0 idi |

## Yeni açık eksikler

- **Web e2e (Faz06/10):** 11 XINOBI önizleme testi — [TST-134](../../test/2026-10-20/TST-134-xinobi-preview-e2e-regression.md) ile kök neden bulundu ve düzeltildi. Önizlemeyle ilgisiz açık: favori testi (giriş zorunlu), 2 EXIF JPEG testi.
- **Public endpoint listesi (Faz03):** `OnlyListedAreasArePublic` için rendering-inputs ya izinli listeye eklenmeli ya da anonim erişim geri alınmalı.
- **Maskeleme (Faz06):** Yalnız resim (kayıpsız WebP) yüklemeli akış kaldı; maske üretimi panel dışında AI/elle yapılıyor, piksel hizası garanti değil. Eski Tea Maker inceleme API'si, CM101 aday komutu ve `tools/local-mask-editor` kodda duruyor (varsayılan kapalı).
- **Commit'lenmemiş/yayınlanmamış:** Değişiklikler `feature/surface-masking-preview-20261020` branch'inde; `main`'e PR ve canlı paket yok.
