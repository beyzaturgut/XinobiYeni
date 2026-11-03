# Sürat Kargo'ya iletilecek teyit mesajı

Taslak; gönderilmedi. Parola içermez. Sunucu IP alanı yalnız ON-KONTROL.md komutunun asıl sunucuda ürettiği egress sonucuyla doldurulur.

Merhaba,

RE-14057 / 1505859998 cari koduna ait Xinobi entegrasyonunda gönderi oluşturma, etiket ve takip akışlarını hazırladık. .NET istemcimizle 1361590662 test hesabında, gerçek olmayan kontrol referansı için KargoTakipHareketDetayi metodundan HTTP 200 / IsError=true / “Sipariş bulunamadı.” ve boş Gonderiler yanıtı alıyoruz. Gerçek gönderi oluşturmadık. Bu mesajı yalnız referans/hareket bulunmaması olarak ele alıyoruz; şube kabulü öncesinde de beklenen yanıtın bu olduğunu teyit edebilir misiniz?

Asıl API/worker sunucusunun dışa çıkış IP'si: **[Sunucuda ön kontrol sonrası doldurulacak; henüz doğrulanmadı]**. Gerekliyse test/canlı hesaplarımız için whitelist şartını ve tanımlama durumunu teyit eder misiniz?

Gerçek sandbox ve etiket kabulünü tamamlamak için şu noktaları netleştirmek istiyoruz:

1. Test hesabının GonderiyiKargoyaGonder ve takip yetkileri aktif mi? Kayıt açmak için onaylı test alıcı/adres/paket örneği paylaşabilir misiniz? PDF'teki /api/GonderiyiKargoyaGonder ile Postman'daki farklı /GonderiOlustur sözleşmesinden hangisini kullanmalıyız?
2. “Tamam” ve “Kayıt Edildi” kabul yanıtları ile zaman aşımı/kısmi kayıt sonrası güvenli uzlaştırma yöntemi nedir? Boş takip sonucunu kayıt yokluğu kanıtı saymıyoruz.
3. Cari kodu + Code128 OzelKargoTakipNo için onaylı etiket örneği, boyut/DPI, cari barkodu tipi ve çoklu koli etiket düzenini paylaşabilir misiniz?
4. Takip dokümanında 7 kodu tabloda “MGT Teslim Edildi”, örnekte “Kargo Devir” olarak kullanılıyor. Kesin anlamı ve müşteri durumuna eşlemesi nedir? Hareket tarihleri hangi saat diliminde? Sorgu kotası/periyodu nedir?
5. İlk kapsam kendi mağazamızın normal koli, kapıda tahsilatsız çıkışıdır: Pazaryerimi=0, EntegrasyonFirmasi boş. OdemeTipi/Odemetipi alan yazımı ile desi/kg tel türlerini ve sözleşmemize göre ücret borçlandırmasını teyit eder misiniz? COD/pazaryeri/iade oluşturmayı ayrıca doğrulamadan açmayacağız.

Teşekkürler, iyi çalışmalar.
