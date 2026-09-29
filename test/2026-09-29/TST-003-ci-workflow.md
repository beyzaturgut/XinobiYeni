# TST-003 — Docker'sız CI doğrulaması

- Tarih: 29.09.2026
- Branch: `main`
- Faz/görev: Faz03 erken CI temeli
- Seviye: LOCAL / CI CONTRACT
- Ortam: Apple Silicon macOS; Docker yok
- Çalıştıran: Codex

## Amaç

`.github/workflows/ci.yml` YAML yapısını ve GitHub Actions'ta çalışacak .NET, web/panel ve Flutter komutlarını yerelde doğrulamak.

## Tekil sonuçlar

| Alt ID | Doğrulama | Sonuç | Ayrıntı |
|---|---|---|---|
| TST-003.01 | Workflow YAML parse | BAŞARILI | Ruby YAML parser dosyayı hatasız yükledi |
| TST-003.02 | .NET restore | BAŞARILI | Tüm projeler güncel/restore edildi |
| TST-003.03 | .NET Release build | BAŞARILI | 0 uyarı, 0 hata |
| TST-003.04 | .NET Release test | BAŞARILI | 3/3 test, 24 ms |
| TST-003.05 | pnpm frozen install | BAŞARILI | Lockfile değişmeden kurulum; supply-chain policy kontrolü geçti |
| TST-003.06 | Web/panel lint | BAŞARILI | ESLint ve oxlint başarılı |
| TST-003.07 | Admin production build | BAŞARILI | TypeScript + Vite build başarılı |
| TST-003.08 | Web production build | BAŞARILI | Next.js production build ve 4/4 statik sayfa başarılı |
| TST-003.09 | Flutter yerel birleşik komut | BAŞARISIZ | Repo kökünden çağrıldığı için Flutter proje kökü bulunamadı; workflow hatası değil |
| TST-003.10 | Flutter pub get doğru dizin | BAŞARILI | `apps/mobile`; lock kısıtlarıyla bağımlılıklar çözüldü |
| TST-003.11 | Flutter analyze | BAŞARILI | Sorun bulunmadı |
| TST-003.12 | Flutter test | BAŞARILI | 1/1 widget smoke testi |

## Başarısızlık ve düzeltme

İlk yerel birleşik komut Flutter adımlarını repo kökünden çalıştırdı ve `Expected to find project root in current working directory` hatası verdi. CI workflow'unda her Flutter adımında zaten `working-directory: apps/mobile` bulunuyordu. Yerel tekrar aynı dizinden yapıldı ve pub get/analyze/test başarılı geçti. Başarısız deneme silinmedi.

## Sürüm/not

Flutter pub get, mevcut constraintlerle uyumsuz daha yeni 5 paket bulunduğunu bilgi olarak bildirdi; lockfile ve SDK sabitlemesi korunarak otomatik major yükseltme yapılmadı. Bu bir test hatası değildir.

## Kapsam dışı

- GitHub-hosted runner üzerindeki ilk gerçek workflow sonucu, push sonrasında GitHub Actions kanıtı olarak ayrıca kaydedilmelidir.
- SQL entegrasyonu, signing, mağaza yayını, gerçek cihaz ve provider sandbox testleri bu workflow kapsamında değildir.

