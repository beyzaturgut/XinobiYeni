# DEPLOY-008 — Canlı SQL katalog okuması ve HTTPS proxy düzeltmesi

- Tarih: 13.10.2026 (Europe/Istanbul).
- Sorumlu: Codex hazırlık; RDP uygulaması proje sahibi tarafından yapılacak.
- Kaynak: main / `d1639f6c969dd183a73a6f9de6a627d9ecc5108d`.
- Hedef web/admin: XinobiYeni / pool XinobiYeni /
  `C:\inetpub\wwwroot\XinobiYeni\out`; HTTP 8014, HTTPS giriş 443.
- Hedef API: XinobiYeniApi / pool XinobiYeniApi /
  `C:\inetpub\wwwroot\XinobiYeniApi\api`; HTTP 8024, loopback ARR.
- Yayın türü: HAZIRLANDI; uzak dosya/configuration değiştirilmedi.

## Artefaktlar

| Paket | Boyut | SHA-256 |
|---|---:|---|
| `paketler/web/XinobiYeni-deploy-d1639f6.zip` (birleşik web/admin) | 37719145 | `d8d1d76cef32eaca786120ab1fa24fcb0c78d06d4cbec33ee8c4928a96e21d7a` |
| `paketler/mobil/XinobiYeni-api-d1639f6.zip` (ortak API) | 102027147 | `b041aff2ac9a0a6c600c4ab76026fce414741f7c311627edef424cc2d19b28a2` |

Komutlar: `node tools/package-deploy.mjs`, `node tools/package-api-iis.mjs`.
Webde `/api/v1/catalog/storefront` canlı okuması; public yanıtta yalnız aktif
ürünler ve sepet sınırına göre stok. Public katalog, admin yetkisini açmaz.
Eski public state snapshot'ı yeni paketten kaldırıldı. Proxy dış HTTPS host'unu
izinli host listesi ve loopback güven sınırıyla API'ye iletir.

## Doğrulama

- .NET katalog/yetki/proxy: 41 geçti, 0 başarısız.
- Web TypeScript ve lint başarılı. Üretim web/admin build başarılı.
- Chrome smoke: anonim üretim webi fixture API'den okudu; sonradan eklenen ürün
  polling ile göründü. Page error yok. Bu test gerçek canlı ürünü değiştirmedi.
- İki ZIP'in CRC bütünlüğü, birleşik `out/admin/index.html`, snapshot yokluğu,
  proxy host başlığı, SQL/HTTPS API yapılandırması doğrulandı.
- API ZIP'inde Local/Development ayarı, App_Data ve bağlantı dizesi yok.
- Uzak HTTPS tanı çağrıları: `/admin/` 200, `/api/v1/health/ready` 200,
  `/api/v1/catalog/products?pageSize=1` 200 (17 ürün),
  `/api/v1/local-commerce/state` 401 (anonim), yeni `/api/v1/catalog/storefront` 404.
  Tanı için sertifika doğrulaması atlandı; tarayıcı sertifika güveni doğrulanmadı.

## Uygulama ve geri dönüş

Uzak yedek alınmadı, pool recycle yapılmadı. Uygulamadan önce mevcut iki dizin ve
IIS configuration yedeklenmeli; server-only appsettings/web.config environment
ayarları korunmalı. API önce uygulanıp public uç 200 doğrulanmalı, sonra web/admin.
IIS site URL Rewrite allowed server variables'a `HTTP_X_FORWARDED_HOST` eklenmeli
(`HTTP_X_FORWARDED_PROTO` da gerekli). Ayrıntı:
`docs/runbooks/https-reverse-proxy.md`.

Geri dönüş noktası, kullanıcı tarafından uygulama öncesinde alınacak dizin/config
yedeğidir. SQL migration veya yeniden katalog aktarımı yapılmadı ve bu paket için
gerekmiyor; mevcut aktarılmış SQL katalog korunur. Geri dönüşte SQL verisi silinmez.
Gerçek admin yazımı → SQL → canlı web/mobil smoke, RDP uygulamasından sonra bekliyor.

Sonuç: **HAZIRLANDI**, canlı yayın tamamlandı sayılmaz.
