# Canlı API katalog kaynağı

IIS API paketleme aracı (`node tools/package-api-iis.mjs`) katalog için
`Catalog:StorageProvider=SqlServer` üretir. Snapshot yolu artık pakete yazılmaz.
Mevcut API, bu ayarla ürün, kategori ve ana sayfa/duyuru verisini SQL'den okur.

Canlı uygulama sırası:

1. Hedef API site/application, fiziksel dizin, pool ve binding'i doğrula.
   Mevcut API dosyalarını ve sunucuya özel yapılandırmayı yedekle.
2. Hedef SQL'de katalog migration'ı ve doğrulanmış katalog aktarımının tamamlandığını
   kontrol et. Boş SQL kataloğu yayına hazır değildir. Aktarım için
   `database-migrations.md` runbook'unu kullan; mevcut verinin üzerine yazma.
3. `ConnectionStrings__Xinobi` bağlantısını sunucuda güvenli biçimde yapılandır.
   Bağlantı dizesini Git'e, ZIP'e veya deployment kaydına yazma.
4. Mevcut API'yi güncelle. Sunucuya özel ayarları koru; katalog sağlayıcısının
   `SqlServer` olduğunu doğrula. Medya referanslarının hedef dosya deposunda/webde
   mevcut olduğunu kontrol et. Uygulama migration veya veri aktarımı çalıştırmaz.
5. İlgili API pool'unu yeniden başlat. `/api/v1/health/ready`,
   `/api/v1/catalog/products`, `/api/v1/catalog/categories`,
   `/api/v1/content/home`, `/api/v1/content/announcements` ve bilinen bir ürünün
   detayını kontrol et. Ürün/varyant, fiyat/stok ve medya URL'lerini SQL ile karşılaştır.
6. Gerçek yayın sonucunu `deployments/` altında kaynak commit, hedef, yedek,
   migration durumu ve HTTP kontrol kanıtıyla kaydet. Paket hazırlamak canlı yayın değildir.

Geri alma: önceki API dosyalarını/yapılandırmasını geri yükle ve ilgili pool'u
yeniden başlat. SQL verisini silme. SQL hatasında API snapshot'a otomatik dönmez.
Bu değişiklik üretim admin yazma uçlarını açmaz.
