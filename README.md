# XinobiYeni

Xinobi'nin web mağazası, yönetim paneli, mobil uygulamaları ve merkezi ticaret servisleri için monorepo.

Proje yürütme ve karar kaydı `Prompts/Faz00_Proje_Takip_ve_Kesintiden_Devam.md`, bağlayıcı kaynak kopyaları `docs/sources/`, mimari kararlar `docs/decisions/` altındadır.

## Kesinleşen teknik sınırlar

- Veritabanı: Microsoft SQL Server
- Container: Docker ve Kubernetes kullanılmaz
- Web: Next.js + React + TypeScript
- Yönetim paneli: React + TypeScript + Vite
- API/worker: ASP.NET Core, C# ve EF Core
- Mobil: Flutter + Dart
- Mimari: modüler monolit, ayrı worker ve SQL tabanlı outbox/inbox

Araç sürümleri resmi uyumluluk kontrolü ve yerel kurulum tamamlandıktan sonra repoda sabitlenecektir.

