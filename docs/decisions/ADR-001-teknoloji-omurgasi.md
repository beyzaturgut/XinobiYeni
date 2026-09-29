# ADR-001 — Teknoloji omurgası

- Durum: Kabul edildi; dış erişimlere bağlı maddeler koşullu
- Tarih: 29.09.2026
- Karar sahibi: Proje sahibi
- Teknik inceleme: Temsili CTO değerlendirmesi

## Bağlam

Platform; SEO uyumlu mağaza, ayrı yönetim paneli, iOS/Android, kişiselleştirme ve baskı, ödeme/sipariş, Mikro, üç pazaryeri ve AI entegrasyonlarını ortak iş kurallarıyla yönetmelidir. Proje sahibi Microsoft SQL Server ve Flutter kullanımını zorunlu tutmuş, Docker kullanımını reddetmiştir.

## Karar

- Web mağazası: Next.js, React ve TypeScript.
- Yönetim paneli: React, TypeScript ve Vite; mağazadan ayrı build/deploy.
- Mobil: Flutter ve Dart; feature-first MVVM, Riverpod ve `go_router`.
- API: ASP.NET Core Web API ve C#; REST `/api/v1` ve OpenAPI.
- Veri: Microsoft SQL Server ve EF Core migrations.
- Mimari: modüler monolit; entegrasyonlar için ayrı .NET Worker.
- Güvenilir işler: SQL Server tabanlı outbox, inbox ve job tabloları; idempotency, lease, retry/backoff ve dead-letter görünümü.
- Kimlik: ASP.NET Core Identity; web/panelde güvenli HttpOnly cookie, mobilde OAuth/OIDC Authorization Code + PKCE.
- Editör: webde Fabric.js adaptörü, mobilde native Flutter Canvas/CustomPainter. Kanonik kayıt, platformdan bağımsız sürümlü `DesignDocument` sözleşmesidir.
- Baskı: sunucuda .NET Worker ve SkiaSharp; nihai kabul D04 fiziksel baskı standardına bağlıdır.
- Dosya: sağlayıcıdan bağımsız `IObjectStorage`; özel erişim, checksum ve süreli URL.
- Arama: başlangıçta SQL Server Full-Text Search; gerçek katalog UAT ve performans ölçümüne bağlıdır.
- Test: xUnit, Vitest/Testing Library, Playwright, Flutter unit/widget/golden/integration ve gerçek cihaz testleri.
- İzleme: yapılandırılmış log, OpenTelemetry ve health checks.
- Repo: monorepo; uygulamalar bağımsız derlenebilir ve yayınlanabilir.
- CI/CD hedefi: GitHub Actions; gerçek uzak SQL Server üzerinde koşu bazlı izole test veritabanı.
- Docker, Kubernetes, React Native, başlangıçta mikroservis, Kafka/RabbitMQ, Redis, Elasticsearch/OpenSearch, GraphQL ve NoSQL kullanılmaz.

## Gerekçe

Modüler monolit işlem bütünlüğünü ve işletim sadeliğini korur. ASP.NET Core, EF Core ve SQL Server sipariş/ödeme/stok işlemleri için uyumlu bir temel sağlar. Next.js mağazanın SEO ihtiyacını, Vite tabanlı panel daha küçük çalışma yüzeyini, Flutter ise iki mobil platform için kullanıcının zorunlu tercihini karşılar. OpenAPI, TypeScript ve Dart istemcilerinin aynı sunucu sözleşmesinden üretilmesini sağlar.

## Koşullar ve geri dönüş

- SQL Server dış erişimi henüz doğrulanmadı; `109.104.120.91:1433` giriş öncesinde zaman aşımına uğruyor. Gerçek port, firewall/VPN ve düşük yetkili uygulama kullanıcısı doğrulanmalıdır.
- Mikro sürümü ve API/Windows SDK/COM bağımlılığı öğrenilmeden worker işletim sistemi kesin kabul edilmez.
- Mobil editör gerçek cihaz PoC'si gesture, bellek, font ve geometri eşiklerini geçmelidir.
- Nesne depolama ve barındırma sağlayıcısı ayrı ADR ile seçilir.
- Paket ve SDK sürümleri resmi uyumluluk kontrolü sonrası tam olarak sabitlenir; yükseltmeler ayrı değişiklik ve regresyon gerektirir.
- Bir koşul başarısız olursa kapsam silinmez; ilgili teknoloji ayrı ADR ile değiştirilir.

## Doğrulama

Her uygulama bağımsız build/test, OpenAPI fark kontrolü, gerçek SQL Server entegrasyon testi, mobil gerçek cihaz testi ve baskı golden/geometri testi üretmelidir. Mock sonuçları gerçek sağlayıcı kabulü sayılmaz.

