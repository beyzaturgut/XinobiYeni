# TST-247 | Sürat bağımsız Windows ön kontrol paketi

03.11.2026. IIS deployment/release değildir; uygulama klasörü dışında çalışacak tanı çıktısıdır.

- Derlenen kaynak commit: `d9a5639f7c15e8e8b633bab541f30c8d3fcc0a1b`. Release publish `EnableDefaultContentItems=false`, `CopyOutputSymbolsToPublishDirectory=false`, `OpenApiGenerateDocumentsOnBuild=false` ile yapıldı.
- Paket: `paketler/surat-on-kontrol-2026-11-03/surat-on-kontrol.zip` (Git dışında).
- Boyut: 23377834 bayt. Dosya sayısı: 41. Windows runtime varlıkları, managed DLL'ler, deps/runtimeconfig metadata, kullanım belgesi, sansürlenmiş erişim kanıtı ve sourceCommit/SHA-256 manifesti içerir.
- ZIP SHA-256: `3a0bded108fdf1b0e51ac1e007e780cafa3922394c083f01d089e269d4b56b34`. Yanında `.sha256` dosyası var.
- Whitelist ile yalnız gereken binary/metadata dosyaları alındı: appsettings/Local/Server/env, RTF/ZIP kaynakları, medya/App_Data/ticaret kayıtları ve PDB yok. Sağlanan iki parola UTF-8 ve UTF-16LE baytlarında tarandı, bulunmadı.
- ZIP CRC/testzip, güvenli göreli yol, manifestte her dosyanın SHA-256 eşliği PASS.
- Paketin ayrı geçici klasöre açılmış hali `dotnet Xinobi.Api.dll --surat-preflight --unknown` ile çalıştırıldı: beklenen sabit JSON ve exit 2; gerçek API/SQL/worker başlatılmadı ve bu smoke test ağ isteği yapmadı. Yerel test macOS/.NET üzerinde; Windows/IIS sunucusundaki çalışma ve egress henüz doğrulanmadı.
- Kaynak komutun gerçek test hesabıyla salt okunur kontrolü TST-246'da: HTTP 200 / Sipariş bulunamadı., exit 0. Gerçek gönderi oluşturulmadı.

Kullanım: [ON-KONTROL.md](../../Entegrasyonlar/01-Surat-Kargo/ON-KONTROL.md). Komutlar mevcut site/pool/SQL/ayar dosyasını değiştirmez. Paket uygulama klasörüne açılmaz; sağlayıcıya paket yerine sanitizeli JSON sonuç ve gerekli egress bilgisi iletilir. IIS/worker farklı kullanıcı/proxy/NAT politikası kullanıyorsa console sonucuyla eşit varsayılmaz.
