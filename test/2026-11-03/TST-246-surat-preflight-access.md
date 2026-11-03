# TST-246 | Sürat gerçek erişim ve bağımsız ön kontrol

03.11.2026. TST-245'teki farklı istemciye ait HTTP 403 gözlemi bu incelemeyle daraltıldı; genel IP/hesap blokajı sonucu çıkarılmıyor.

- Yeni --surat-preflight komutu API host/SQL/IIS/worker başlamadan döner. Varsayılan iki sabit root URL'ye credentialsiz GET, opsiyonel yalnız test hesabıyla salt okunur takip, ayrıca açık --include-egress-ip ile ipify IP sorgusu. Üretim hesabıyla kimlik doğrulama veya gönderi yazma yok.
- Config/JSON gövdesi, query ve exception çıktıya dökülmez; timeout, bağlantı/TLS, HTTP hata, takip şeması ve eksik ayar ayrı. Redirect izlenmez. Test flagsiz egress/hesap isteği yok. Production modu test seçimini değiştirmez.
- Gerçek .NET kontrolü: root adresleri 302 (takip edilmedi); test metodu HTTP 200 / IsError=true / tam Sipariş bulunamadı. / boş Gonderiler. Komut exit 0. Test kimliği/parolası yalnız kaynak RTF'den bellekte okunup alt sürecin ortamına aktarıldı; yeni ayar dosyası yazılmadı.
- Dar eksik referans sözleşmesi adaptörde AwaitingAcceptance; başka hata mesajı veya dolu/kısmi belge genel hata kalır. Bu sonuç yeni gönderim izni, gerçek kayıt yokluğu kanıtı veya canlı kabul değildir. Önceki veri korunma kuralları değişmedi.
- 51/51 Sürat odaklı PASS; tam API 565 PASS / 29 SKIP / 0 FAIL (594 toplam). Testlerin kapsamı: sabit host/method, gizli çıktı dışlama, üretim hesabı kullanılmaması, opsiyonel egress, hata/redirect/exception ayrımı, dar no-record eşlemesi. Gerçek SQL testleri bu koşuda kabul edilmedi.
- İlk derlemede C# null-coalescing/dispose düzeltmesi, test derlemesinde xUnit2031 filtre overload düzeltmesi yapıldı; son koşular başarılı.
- Release publish, default web içerikleri kapalı olarak tamamlandı; fiziksel sunucuya kurulum veya IIS deployment yapılmadı. Taşınabilir paketin ayrı doğrulaması ayrıca kaydedilecek.

Kaynaklar: Entegrasyonlar/01-Surat-Kargo/erisim-on-kontrol-2026-11-03.json (sanitize edilmiş gerçek kanıt), ON-KONTROL.md (sunucu komutları), SAGLAYICIYA-MESAJ.md (gönderilmemiş taslak). Hiçbir gerçek gönderi oluşturulmadı; canlı hesap sorgusu yok. Asıl IIS egress/erişim ve gerçek gönderi/etiket/SQL/cihaz/ödeme uygunluğu açık.
