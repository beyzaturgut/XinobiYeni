# Sürat Kargo: sunucudan salt okunur ön kontrol

Bu komut IIS'i, API dinleyicisini, SQL'i veya arka plan işçilerini başlatmaz/değiştirmez. Gönderi oluşturma, silme, geri çekme veya canlı hesapla takip çağrısı yapmaz. İsterseniz test hesabıyla yalnız mevcut olmayan kontrol referansının takibini sorgular.

## Hazır paket

Yerel çıktı: `paketler/surat-on-kontrol-2026-11-03/surat-on-kontrol.zip`. DLL'ler, .NET çalışma tanımı, gerekli runtime varlıkları ve kaynak commit/dosya hash manifesti içerir. Gerçek ayar dosyası, parola, medya veya ticari kayıt içermez; Git'e alınmaz.

Windows sunucusunda .NET 10 + ASP.NET Core 10 runtime gerekir (mevcut IIS Hosting Bundle bunları sağlıyorsa yeniden kurulum gerekmez). Paketi **canlı web/API klasörlerinin dışında**, örneğin `C:\XinobiKontrol\Surat` klasörüne çıkarın. Bu bir IIS deployment'ı değildir; mevcut API dosyalarının üzerine kopyalamayın.

## 1. Hesap bilgisi kullanmadan ağ ve dışa çıkış IP'si

```powershell
Set-Location 'C:\XinobiKontrol\Surat'
dotnet .\Xinobi.Api.dll --surat-preflight --include-egress-ip |
    Tee-Object -FilePath .\surat-on-kontrol.json
$LASTEXITCODE
```

İki servis ana adresine credentialsiz GET yapılır. `--include-egress-ip` ayrıca `https://api.ipify.org?format=json` üzerinden bu işlemin dışa çıkış IP'sini okur. Bu seçenek olmadan harici IP servisi çağrılmaz. Raporu **asıl API/worker sunucusunda** üretin; Mac'teki veya gelen trafik IP'si gerçek NAT/egress yerine geçmez. CLI ve IIS farklı proxy/hesap/ağ politikası kullanıyorsa sonuçları ayrıca karşılaştırın.

## 2. Test hesabıyla, kayıt oluşturmadan takip kontrolü

```powershell
dotnet .\Xinobi.Api.dll --surat-preflight --with-test-account --include-egress-ip |
    Tee-Object -FilePath .\surat-test-hesap-kontrol.json
```

Sadece `Shipping:Surat:Sandbox:Username/Password` okunur. Seçili uygulama modu Production olsa bile canlı hesap kullanılmaz. Windows'ta mevcut `C:\XinobiData\config\appsettings.Server.json`, varsa `XINOBI_SERVER_SETTINGS` yolu ve en son ortam değişkenleri okunur. Komut Enabled/Mode/AllowProduction ayarlarını değiştirmez; bu açık test bayrağı yalnız bir takip isteğine izin verir. Credentials CLI argümanına yazılmaz. Gerçek test hesabını yalnız bu özgün yerel `kargo.rtf` kaynağından alın; pakette bulunmaz.

Ayarlar henüz tanımlı değilse, kalıcı dosya değiştirmeden yalnız mevcut PowerShell sürecinde kullanabilirsiniz:

```powershell
$oldUser = [Environment]::GetEnvironmentVariable('Shipping__Surat__Sandbox__Username', 'Process')
$oldPassword = [Environment]::GetEnvironmentVariable('Shipping__Surat__Sandbox__Password', 'Process')
$testUser = Read-Host 'Test kullanici adi'
Read-Host 'Test parolasini panoya kopyalayin, sonra Enter' | Out-Null
$testPassword = Get-Clipboard -Raw
try {
    if ([string]::IsNullOrWhiteSpace($testUser) -or [string]::IsNullOrWhiteSpace($testPassword)) {
        throw 'Test hesabi bilgileri bos olamaz.'
    }
    [Environment]::SetEnvironmentVariable('Shipping__Surat__Sandbox__Username', $testUser.Trim(), 'Process')
    [Environment]::SetEnvironmentVariable('Shipping__Surat__Sandbox__Password', $testPassword.Trim(), 'Process')
    dotnet .\Xinobi.Api.dll --surat-preflight --with-test-account --include-egress-ip |
        Tee-Object -FilePath .\surat-test-hesap-kontrol.json
}
finally {
    [Environment]::SetEnvironmentVariable('Shipping__Surat__Sandbox__Username', $oldUser, 'Process')
    [Environment]::SetEnvironmentVariable('Shipping__Surat__Sandbox__Password', $oldPassword, 'Process')
    $testPassword = $null
    $oldPassword = $null
}
```

Bu bölüm gerçek Windows sunucusunda henüz çalıştırılmadı; komut ve paket yerel .NET testleriyle doğrulandı. Kurumun APM/proxy URL kayıtları query içindeki parolayı maskelemelidir; bu araç kendi raporuna query, parola, sağlayıcı gövdesi veya ham exception koymaz.

## Sonuçları yorumlama

- `tracking_reference_not_found`: HTTP 200, `IsError=true`, tam `Sipariş bulunamadı.` mesajı ve boş `Gonderiler`. Kontrol referansı gerçek sipariş olmadığından beklenebilir. Servis yanıtı alınmıştır; gerçek gönderi/şube kabulü veya kayıt oluşturma yetkisi kanıtı değildir.
- `tracking_response_received`: şemaya uygun `IsError=false` yanıtı. Gerçek gönderi oluşturulmuş sayılmaz.
- `provider_error`: yukarıdaki dar boş kayıt yanıtından farklı hata; kod/hesap/sözleşme ayrıca incelenmeli. Tüm hatalar “kayıt yok” sayılmaz.
- `http_forbidden` (403): erişim reddi; tek başına parola veya IP whitelist nedeni kanıtlanmaz.
- `redirect_blocked`: yönlendirme güvenlik gereği izlenmedi. Ana adresteki 302 tek başına metodun çalışmadığı anlamına gelmez; test hesabı sorgusunun sonucu belirleyicidir.
- `not_configured`, `timeout`, `connection_failure`, `tls_failure`, `unexpected_response`: birbirinden ayrı raporlanır; hassas hata/URL dökülmez.

Çıkış 0 yalnız seçilen tanı kontrollerinin beklenen yanıtını, 1 eksik/başarısız kontrolü, 2 komut/yapılandırma hatasını belirtir. `--with-test-account` varsa hesap sorgusu ve varsa IP sorgusu değerlendirilir; bilgi amaçlı root yönlendirmeleri bu başarılı metot yanıtını geçersiz kılmaz. Hiçbiri “canlıya hazır” onayı değildir. DNS/IP çözümleme, checkout fiyatı ve gerçek kargo etiket kabulü ayrıca test edilmelidir.

## Şu anki kanıt

03.11.2026'da .NET istemcisiyle test takip metodu **HTTP 200 / Sipariş bulunamadı.** yanıtı verdi. [Sansürlenmiş JSON kanıtı](erisim-on-kontrol-2026-11-03.json). Önceki farklı istemcideki 403 artık genel erişim blokajı olarak sunulmaz. Asıl IIS sunucusunda bu paket henüz çalıştırılmadığından onun egress IP'si/yetkisi doğrulanmadı.
