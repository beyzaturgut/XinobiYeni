# Xinobi: indirerek tek komutta IIS yayını

Bu akış mevcut IIS web/admin ve API sitelerini birlikte günceller. Binding, site adı,
veritabanı, migration veya SMTP/AI anahtarlarını değiştirmez. Mobil APK içermez.
Paket hazırlamak canlıya yayın yapmak değildir. Yayın yalnız sunucudaki komutla başlar.

## 1. Sunucuda bir kez hazırlık

- Mevcut IIS siteleri `XinobiYeni` ve `XinobiYeniApi` çalışıyor olmalı; .NET 10 Hosting Bundle,
  URL Rewrite ve ARR mevcut kurulumdaki gibi hazır olmalı.
- IIS web physical path'i gerçekten yayınlanan `out` klasörünü göstermeli. Script bu yolu
  IIS'ten okur; eski kayıtlardaki farklı `out` yollarını varsaymaz. API kökünde veya `/api`
  application altında `Xinobi.Api.dll` bulunmalı.
- Sunucuya özel ayarları önce mevcut `iis-api-install.md` prosedürüyle
  `C:\XinobiData\config\appsettings.Server.json` konumuna taşı. SQL, medya yolları,
  SMTP ve diğer çalışan ayarlar bu dosyada/ortam değişkenlerinde korunmalı. API içindeki
  Production JSON yeni paketin varsayılanlarıyla değiştirilir; yalnız eski JSON'da kalan
  özel ayarlar otomatik birleştirilmez. Veri/yüklemeler değiştirilen web/API klasörlerinin
  dışında olmalı. IIS pool kimliklerinin ayar/veri dosyalarına erişimi mevcut olmalı.
- Veritabanını ayrıca yedekle ve sürümün gerektirdiği migration'ları `database-migrations.md`
  üzerinden değerlendir. Otomatik geri dönüş yalnız uygulama dosyalarını geri alır.
- Yönetici PowerShell aç. `C:\XinobiDeploy\tools` klasörü oluştur.

## 2. Mac'te yeni sürümü hazırla

Proje klasöründe, kaynak değişiklikleri commit edilmişken:

```sh
cd /Users/beyzaturgut/Desktop/Xinobi
node tools/package-release.mjs
```

Mevcut paketleyicilerin Node/pnpm/.NET ve yerel katalog/görsel gereksinimleri geçerlidir.
Çıktı `paketler/releases/xinobi-<commit>/` altında üç dosyadır:
`xinobi.zip`, `xinobi.zip.sha256`, `deploy-release.ps1`.
ZIP web/admin ve API'yi aynı commit kimliğiyle içerir. Yerel katalog medyası mevcut
paketleyicideki kurallarla eklenir; paketi yayımlamadan önce içerik kapsamını kontrol et.
Kirli çalışma ağacında paketleme başlamaz.

## 3. Paketi GitHub Releases'a yükle

Repo sahibi hesabında bu repo için Contents: write yetkili bir GitHub token oluştur.
Token'ı yalnız terminal oturumunda `GITHUB_TOKEN` ortam değişkenine güvenli biçimde ver;
Git'e, komut argümanına veya dokümana yazma. Sonra paketleyicinin yazdırdığı komutu çalıştır:

```sh
node tools/publish-release.mjs xinobi-<commit>
```

`<commit>` yerine gerçek yedi karakteri yaz. Önce taslak release oluşturulur; üç dosya
başarıyla yüklendikten sonra yayımlanır. Repo açıksa release dosyaları da herkese açıktır;
özel repo erişimi korur. Hata olursa GitHub Releases'taki taslağı incele/sil, sonra tekrar
çalıştır; aynı sürümde dosya ezilmez. Kaynak commit'i de upstream'e push edilmiş olmalı.
GitHub token yetkisi veya ağ erişimi yoksa bu adım tamamlanmadan sunucu indiremez.

## 4. Sunucuya bir kez deploy aracını kur

İlk yayımlanan release'in `deploy-release.ps1` dosyasını GitHub Releases sayfasından
indir; içeriğini inceleyip `C:\XinobiDeploy\tools\deploy-release.ps1` olarak kaydet.
Bu dosya repodaki `tools/deploy-release.ps1` ile aynıdır. Sonraki sürümler için yeniden
kopyalama gerekmez; deploy aracının kendisi değişirse inceleyerek güncelle.

Özel repo kullanıyorsan sunucu PowerShell oturumuna yalnız Contents: read yetkili
`GITHUB_TOKEN` ver. Açık repoda token gerekmez. Yazma yetkili Mac token'ını sunucuya taşıma.

## 5. Her deploy'da sunucuda tek komut

Önce ilk kurulumda yolları önizle (`-WhatIf` indirme/yayın yapmaz):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiDeploy\tools\deploy-release.ps1 -Release xinobi-<commit> -WhatIf
```

Ardından yönetici PowerShell'de gerçek komut:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiDeploy\tools\deploy-release.ps1 -Release xinobi-<commit>
```

### Bu repoda token'ı panodan alma

Repo özeldir. Windows oturumunda token yoksa GitHub release sorgusu 404 döner. Bu kullanıcının PowerShell'inde maskeli girişe yapıştırmak kontrol karakteri üretebildiği için aşağıdaki yöntemi kullan. Kodu çalıştır, bekleme mesajı geldiğinde repo için Contents: read yetkili token'ı kopyala, PowerShell'e dönüp yapıştırmadan Enter'a bas. `<commit>` yerine seçilen gerçek sürümü yaz.

```powershell
$null = Read-Host "GitHub token'ını şimdi kopyala; sonra buraya dönüp Enter'a bas"
try {
    $token = (Get-Clipboard -Raw).Trim()
    if ($token -notmatch '\A[A-Za-z0-9_]+\z') { throw "Panoda geçerli token bulunamadı." }
    $env:GITHUB_TOKEN = $token
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\XinobiDeploy\tools\deploy-release.ps1 -Release xinobi-<commit>
}
finally {
    Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue
    Remove-Variable token -ErrorAction SilentlyContinue
}
```

Script belirtilen release'i indirir, SHA256 ve commit'i kontrol eder, iki paketi hazırlar,
IIS pool'larını durdurur, mevcut klasörleri `-previous-<tarih>` adıyla saklar, yeni
klasörleri yerleştirir ve pool'ları başlatır. API readiness ile web, admin, proxy readiness
ve katalog uçlarının 200 yanıtını denetler. Kısa bir hizmet kesintisi olur. Aynı anda iki
deploy çalıştırma. Sürüm açıkça seçilir; belirsiz bir “latest” sürümü kurulmaz.

Varsayılan site adları, ayar yolu veya HTTP kontrol adresleri farklıysa ilgili
`-WebSite`, `-ApiSite`, `-ServerSettings`, `-HealthUrl`, `-WebUrl` parametrelerini ver.
Host binding gerektiriyorsa `-WebUrl` olarak sunucudan erişilebilir gerçek site adresini kullan.

## 6. Sonucu doğrula

Komut başarılıysa `C:\XinobiDeploy\<sürüm>-<tarih>\deployment.json` kaydını gösterir.
Kaynak commit, SHA256, hedefler, tarih, kullanıcı ve sonuç burada tutulur. Hazırlık,
başarısız yayın ve geri alma da kaydedilir. Bu kaydı `deployments/README.md` formatındaki
repo yayın kaydına aktar; veritabanı yedeğini ve dış HTTP/HTTPS kontrollerini ayrıca ekle.

Tarayıcıda ana sayfa, ürünler, admin girişi ve bir görseli kontrol et. Hesap/e-posta/AI gibi
özelliklerin uçtan uca kontrollerini `iis-services-recovery.md` üzerinden tamamla.
HTTP smoke kontrolü bunların tamamının çalıştığını kanıtlamaz. Doğrulamadan sonra eski
klasörleri sunucu yedek politikasına göre temizle; otomatik silinmezler.

## Hata ve geri dönüş

İndirme/hash/paket kontrolü hatasında çalışan dosyalar değiştirilmez. Dosya değişimi
sonrasında hata olursa script önceki iki klasörü geri koymaya çalışır. `ROLLED_BACK`
dosya geri dönüşünü belirtir; eski sürümün HTTP kontrollerini tekrar yap.
`ROLLBACK_FAILED` varsa pool'ları durdur, kayıttaki hedeflerin yanındaki
`-previous-<tarih>` klasörlerini asıl adlarına geri getir, pool'ları başlat ve kontrol et.
Başarılı bir yayından sonra manuel geri dönüş de aynı klasörlerle yapılır. SQL şemasını
bu işlem geri almaz; eski sürümün şemayla uyumluluğunu ayrıca kontrol et.

## 25.10.2026: saglik adresi ve geri alma duzeltmesi

Bu IIS kurulumunda `http://127.0.0.1:8024/api/v1/health/ready` 400,
`http://localhost:8024/api/v1/health/ready` 200 doner. API kontrolunun varsayilani
`localhost` olarak duzeltildi. Script dosyalari degistirmeden once mevcut API ve web
proxy readiness adreslerini kontrol eder.

Ilk `xinobi-4333eda` release asset'indeki deploy araci eski surumdur. Repo `tools/deploy-release.ps1`
dosyasinin guncel halini sunucudaki `C:\XinobiDeploy\tools\deploy-release.ps1` uzerine kopyala.
Ayni uygulama paketini yeniden olusturmadan bu yeni aracla kurabilirsin; ZIP icindeki eski
script otomatik calistirilmaz ve sunucudaki aracin uzerine yazilmaz.

Yeni geri alma kodu havuzlarin durmasini bekler, dosya kilitleri icin sinirli yeniden
deneme yapar, mevcut hedef klasore birlestirmeyi reddeder ve hedefleri bagimsiz geri alir.
Kurtarma hatasinda diger havuzlarin baslatilmasi da denenir; asil hata ekrana yazilir.
`ROLLED_BACK` sonrasi HTTP kontrollerini tekrar yap. Bu davranislar IIS ve ag cagrilari
mock edilerek `pwsh -NoProfile -File tools/deploy-release.test.ps1` ile test edilir;
gercek Windows/IIS dogrulamasi ayrica gereklidir.

## 04.11.2026: GitHub repo geçişi

Aktif kaynak ve yeni release hedefi `mostidea/xinobi_new` reposudur. Mevcut commitler,
branch ve tag geçmişi kimlikleri korunarak aktarılmıştır. Önceki GitHub Releases
kayıtları ve ek dosyaları Git push ile taşınmaz; geçmiş yayın bağlantıları eski repoda kalır.
Yeni release için Mac token’ının yeni repoda Contents: write, sunucudaki token’ın
Contents: read erişimi olmalıdır. Sunucudaki `C:\XinobiDeploy\tools\deploy-release.ps1`
dosyasını yeni repo hedefini içeren güncel araçla değiştir. Bu repo geçişi IIS site
adlarını veya çalışan yayını değiştirmez; yeni release/deploy yapılmış sayılmaz.
