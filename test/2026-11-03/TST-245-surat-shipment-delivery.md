# TST-245 | Sürat admin, test etiket, uzlaştırma ve takip teslimi

03.11.2026. KRG-SUR-01 / TIC-08 teknik alt işleri. Kapsam kendi mağaza / eş ölçülü koli / COD kapalı test akışı. Gerçek gönderi veya canlı kabul değildir.

## Uygulananlar

- Admin sipariş ekranı: paket/desi/kg/ödeme sorumluluğu, kapalı/eksik hesap ve yetki durumları, işlem kilidi, hatada taslak, kayıt referansı ve etiket/takip. Entegrasyon izleme ekranında Sürat sekmesi ve gizli bilgi içermeyen ayar durumu.
- Code128-B referanslı test SVG etiketi: cari, referans, alıcı, paket ve ödeme bilgisi. XML kaçışı/Unicode kelime sarma; taşan adresi açık hata; registered olmadan yok. Tekrar indirme yeni taşıyıcı POST'u yapmaz. Canlı şablon indirmesi kapalı.
- Kanıtlı uzlaştırma: kayıt var veya kesinlikle yok teyidi. Aktif ilk 2 dakika korunur; yokluk kanıtı olmadan otomatik/yeni POST yok. Açık not_created teyidinden sonra aynı referansla yeni attempt; eski istek/kanıt/personel geçmişi korunur.
- Kalıcı sorgu lease'i, aynı sorguyu engelleme, eski lease sonucunu reddetme, backoff/jitter, hesaba göre due iş seçimi ve terminal periyodu. Sonraki yanıtta eksik parça/iade belgeleri, hatada son veri ve veri zamanı korunur. Boş takip yokluk kanıtı değildir.
- Customer DTO yalnız sahibi ve Production için. Web/Flutter takip ekranları: yüklenme, boş, hata/yenileme, son veriyi koruma, iade/teslim ayrımı. Sandbox kaydı müşteriye gerçek kargo diye gösterilmez. Raw Source/adres/gönderici hesabı paylaşılmaz.
- Ticari order lifecycle, tahsilat/refund ve bildirim otomatik değiştirilmez. Production oluşturma doğrulanmış ödeme/operasyon verisi olmadan açılmaz.

## Son doğrulamalar

| Kontrol | Sonuç |
| --- | --- |
| Sürat odaklı sunucu paketi | 38 PASS, 0 SKIP, 0 FAIL |
| Tam API paketi | 552 PASS / 29 SKIP / 0 FAIL; toplam 581 |
| Gerçek HTTP hattı, sahte carrier ile | Yetkili create > duplicate > SVG download > refresh; tek create, sipariş statüsü değişmiyor PASS |
| Admin izole tarayıcı paketi | 20/20 dosya PASS, gerçek servis/yazma yok |
| Sürat tarayıcı senaryoları | Çift aktivasyon, etiket tekrarında create yok, stale takip, yetki/ayar engeli, belirsiz kayıt, entegrasyon sekmesi, bozuk/null-list yanıtı PASS |
| Admin build / lint | Build PASS; lint 0 error, yeni dosyalarda uyarı yok; mevcut AuditHistory/SurfaceMasks effect uyarıları devam ediyor |
| Web lint / TypeScript / üretim derlemesi | PASS (test:e2e gerçek Next üretim exportu oluşturdu) |
| Web Sürat e2e | 390 ve 1440 px: 2/2 PASS; stale iade, hata/yeniden deneme, taşma kontrolü |
| Flutter analyze | No issues found |
| Flutter tüm testler | 283 PASS |
| Son Flutter takip widget testleri | 3/3 PASS: eksik, stale iade/büyük metin, hata/yeniden dene |
| API sözleşme üretimi | Release build + OpenAPI + TypeScript + Dart build_runner PASS |
| TypeScript client build | PASS |
| Code128 bağımsız kontrol | SVG çubuklarından ReportLab'ın bağımsız desen tablosuyla decode: başlangıç, veri, mod103 checksum, stop ve tam referans eşliği PASS |
| Parola dışlama ve Git | Değişen/yeni dosyalarda sağlanan iki parola yok; RTF/ham ekler/yerel özel belgeler ignore; diff --check PASS |

Admin 390/1440, web 390/1440 ekran görüntüleri ve son etiket renderı yerelde alınıp görsel incelendi. Modal içi kaydırma kullanılabilir, yatay taşma görülmedi; etiket metinleri kesilmeden sarılıyor. PNG çıktıları artifacts/admin-safe-tests/surat-shipment, artifacts/surat-web-390.png ve artifacts/surat-web-1440.png altında yerel test çıktısıdır; üretim paketi/Git'e alınmadı.

İlk denemelerde etiket kaynak kodundaki tırnak kaçışları, Flutter nullable session dönüşü ve fixture dosya yolu/CORS başlığı düzeltildi. Admin geniş regresyonunda beklenmeyen takip yanıtının ekranı düşürdüğü yakalandı; response/eleman doğrulaması eklendi ve fixture sözleşmesi açıklandı. İlk başarısız admin koşusu sonrası son iki geniş koşu 20/20 PASS; başarısızlıklar nihai başarı diye raporlanmadı. Süren eski/yinelenen bir yerel tarayıcı koşusu, son doğrulanmış koşular tamamlanınca sonlandırıldı.

## Gerçek sağlayıcı erişimi

Test hesabıyla yalnız bir salt okunur KargoTakipHareketDetayi erişim denemesi yapıldı: HTTP 403. Referans gerçek bir siparişe ait değildi. Parolalar yalnız özgün yerel e-postadan bellekte okundu; komut argümanı/çıktı/yeni ayar dosyasına yazılmadı. Gerçek gönderi oluşturma, etiket şube kabulü, iptal veya canlı hesap çağrısı yapılmadı. Bu 403 sonucu uygulama contract fixture testlerinden ayrıdır. Hesap/IP/WAF nedenini yalnız durum koduyla kesinleştirmedik.

[Sağlayıcı erişim kaydı](../../Entegrasyonlar/01-Surat-Kargo/ERISIM-KONTROLU-2026-11-03.md).

## Kapanmayan kabul kapıları

- Test erişimi 403: sağlayıcı hesabı/istek/IP ve gerekirse gerçek sunucu egress whitelist teyidi; ardından gerçek sandbox uçtan uca kabulü.
- Onaylı canlı etiket/çoklu koli düzeni ve fiziksel yazıcı/Code128 okuyucu kabulü.
- Gerçek izole SQL çoklu süreç/kalıcılık ve gerçek Android/iOS + VoiceOver/TalkBack. Atlanan SQL testleri veya widget testleri bu kabul değildir.
- Doğrulanmış ödeme/operasyon uygunluğu ve iptal-gönderim transaction sınırı; otomatik lifecycle/bildirim kapıları. Production oluşturma kapalı.
- Kod7/COD/Dosya-Mi, kanal borçlandırması, kota/saat dilimi/saklama teyitleri; pazaryeri/COD/iade oluşturma ve tarife/checkout ücret hesabı ilk akışın dışında açık.

[Sunucu kurulum ve güncel sınırlar](../../Entegrasyonlar/01-Surat-Kargo/SUNUCU-KURULUMU.md). TIC-08 **Kısmen yapıldı - kapanış açık** olarak MD/JSON ve Faz05'e işlendi. Deployment/APK yapılmadı.
