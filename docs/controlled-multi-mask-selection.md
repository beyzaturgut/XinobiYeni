# Kontrollü çoklu maske seçimi

> **10.11.2026 — Tarihsel / uyumluluk kaydı.** Aşağıdaki eski adımlar yeni tek kaynak akışının talimatı veya kabul kanıtı değildir. Güncel giriş: [tek kaynak kişiselleştirme](runbooks/single-source-personalization.md). Fotoğraf üretimi, renkler arası hizalama ve çoklu fotoğrafa maske uygulama yeni akışta yoktur. Eski kayıtlar/dosyalar ve test kanıtları korunur; kaldırılmış yazma uçları kullanılmaz.


Admin: http://127.0.0.1:5176/ → ürün yüzeyi inceleme → tam ürün/varyant.

Hazır hedeflerden Üst demlik gövdesi, Alt çaydanlık gövdesi veya İki gövde seçilebilir. Manuel hedef diğer ürünler için korunur. İki gövde tek SAM3 concept_segment isteğinde iki metin promptu gönderir; iki doğru gövdenin bulunacağı garanti değildir. Gerçek çağrı yalnızca açık üretim tıklaması ve kredi/üçüncü taraf aktarımı onayıyla başlar; otomatik tekrar yoktur.

Yeni katalog istekleri en fazla sekiz bağımsız, kaynakla hizalı RLE sonucu saklar. Eski provider çağrıları en yüksek skorlu tek maskeyi almaya devam eder. Çoklu istek paketinin kendisi düzenlenip onaylanamaz: yönetici renkli sonuçlardan istediğini seçmelidir. Seçim başlangıçta boştur. Yalnızca seçilen maskeler yeni, onaysız taslak oluşturur.

CM101: Üst demlik hedefiyle adayları alın, uygun üst aday(lar)ı seçin ve Onaylı alt gövdeyi koruyarak birleştir kutusunu işaretleyin. Sunucu aynı ürün/varyant/SHA/boyut ve yalnızca alt gövde kapsamını doğrular. Üst aday alt maskeye temas ediyorsa doğrudan birleştirme reddedilir; önce üst adayı tekli taslağa aktarın, mevcut editörde düzeltip kaydedin. Bu düzeltilmiş taslağı seçerek alt gövdeyle birleştirin. Eski onay dosyaları değişmez; müşteri eski maskeyi kullanmaya devam eder.

Koruma fırçaları hedef fotoğrafın orijinal RGB piksellerini kullanır. Miras alınan CM101 logo koruması yeni onayda kaldırılamaz. İki gövde arasında tamamen şeffaf satır ayrımı bulunmalıdır; eksik/bağlı gövdeler iki gövdeli onay alamaz. İlk aday uyarıları düzenleme gereğini gösterir; onayda kaydedilmiş güncel maske yeniden kontrol edilir.

Taslağı kaydedin, koruma deseninde kanonik piksel testini çalıştırın ve görsel olarak inceleyin. Onay ayrı bir yönetici eylemidir. Aile referansı yalnızca açıkça onaylanmış, kaynakla eşleşen sürümden oluşturulabilir. Yeni aile sürümü veya taslak eski onayları güncellemez.

Bu geliştirme sırasında gerçek inference veya canlı yeni onay yapılmadı. Yeni backend için API çalışma çıktısı güncellenmeli ve yalnızca ilgili API/3046 servisleri kullanıcı izniyle yeniden başlatılmalıdır. Çalışan servisler otomatik değiştirilmez.

Mock testler: dotnet test tests/Xinobi.Architecture.Tests/Xinobi.Architecture.Tests.csproj --no-restore --filter "FullyQualifiedName~RoboflowSurfaceSegmentationProviderTests|FullyQualifiedName~CatalogCandidateRuntimeTests" -p:OpenApiGenerateDocumentsOnBuild=false
node tools/test-mask-selection.cjs
node tools/test-mask-selection-admin.cjs
