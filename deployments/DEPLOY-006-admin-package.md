# DEPLOY-006 — Admin IIS yayın hazırlığı

- Tarih: 2026-10-07 (Europe/Istanbul)
- Sorumlu: Codex; kullanıcı admin yayını istedi.
- Kaynak: main / b6a41ebb5828745fb22a7e754655d86fb6407c56
- Hedef: mevcut IIS altyapısında HTTPS site altında `/admin/` sanal dizini. Canlı HTTPS binding/alan adı bu oturumda doğrulanmadı; hosting ayarı değiştirilmedi.
- Yayın türü: Vite statik yönetim paneli; yönetici oturumu API'sine bağlı.
- İşlem: `node tools/package-admin-iis.mjs`.
- Artefakt: XinobiYeni-admin-b6a41eb.zip; 7.736.616 bayt.
- SHA-256: a68d253c553ca0740589af44f3c55c541c79f92f23111ea4c586235c5645b4e5
- API adresi: `/api/v1/local-commerce`; giriş `/api/v1/auth/web/login`, yetki kontrolü `/api/v1/admin/session`.
- Kontroller: TypeScript/Vite derlemesi ve lint başarılı. Üretim paketi tarayıcı testinde anonim ve yetkisiz kullanıcıyı engelledi, yönetici oturumunu kabul etti, çıkışta panel kapandı. ZIP bütünlüğü, `/admin/` varlık yolları ve IIS HTTPS zorunluluğu doğrulandı. API testleri izole yanıtlardır; canlı entegrasyon değildir.
- Öncesi yedek/geri alma: sunucuya işlem yapılmadı. İlk kurulumda yeni ayrı admin fiziksel klasörü kullanılmalı; mevcut admin varsa önce tarih/saatli yedek alınmalı. Geri alma yalnız admin sanal dizini/fiziksel yolunu eski sürüme döndürerek yapılmalı.
- HTTP/HTTPS canlı smoke: yapılmadı; sunucu erişimi yok.
- Veritabanı migration: uygulanmadı.
- Durum: HAZIRLANDI — henüz canlıya yayınlanmadı.

## Yayın önkoşulları

Mevcut `LocalCommerce` uçları Development/loopback ile sınırlıdır ve Production'da açılmaz. Production kimlik deposu ve katalog kaynağı henüz hazır değildir. Bu ZIP tek başına canlı ürün/fiyat/stok yönetimini çalıştırmaz. Yayın öncesinde SQL kullanıcı/katalog kaynağı, yönetici yetkisi ve sunucu tarafında kaynak/işlem izinleriyle korunan üretim kayıt uçları tamamlanmalıdır. Frontend giriş kapısı sunucu yetkilendirmesinin yerini tutmaz. Development korumaları kaldırılarak veya geliştirme ortamı internete açılarak çözülmemelidir.

## Önkoşullar tamamlandıktan sonra IIS kurulumu

1. ZIP'i RDP ile sunucuda geçici bir klasöre açın. Paket `admin/` klasörü içerir; API, kullanıcı kayıtları ve sırlar içermez.
2. Bu klasörün içeriğini mağazanın `out` dizininden ayrı bir fiziksel klasöre kopyalayın (öneri: `C:\inetpub\wwwroot\XinobiYeniAdmin`). Böylece sonraki mağaza yayını admin dosyalarını silmez.
3. HTTPS bağlantısı yapılandırılmış IIS sitesi altında `admin` sanal dizinini bu fiziksel klasöre bağlayın. Var olan HTTP binding'i veya diğer siteleri değiştirmeyin. Paket admin isteklerinde HTTPS zorunlu kılar; HTTP erişimi kabul edilmez.
4. Aynı HTTPS origin altında `/api/v1` isteklerinin hazır üretim API'sine ulaştığını doğrulayın. Farklı API URL'si gerekiyorsa paketleme sırasında `VITE_COMMERCE_API_URL` ayarlayın; farklı origin için cookie/CORS ayarları ayrıca doğrulanmalıdır.
5. HTTPS `/admin/` üzerinde giriş yapılmadan panelin açılmadığını, müşteri hesabının 403 aldığını, yetkili yönetici girişini, ürün/fiyat/stok kaydını, yeniden yüklemeyi ve çıkışı doğrulayın. İlgili mağaza içeriğinin nasıl güncellendiğini de kontrol edin; statik mağaza otomatik canlı veri bağlantısı değildir.
6. Gerçek yayın tarihi, binding, API sürümü, migration ve smoke sonuçlarıyla bu kaydı güncelleyin.
