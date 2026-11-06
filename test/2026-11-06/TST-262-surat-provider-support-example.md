# TST-262 — Sürat sağlayıcı destek örneği uyumu

06.11.2026. Kullanıcının ilettiği destek örneği mevcut create JSON’uyla karşılaştırıldı.

- Sürat, incelenen referanslarla kayıt oluşmadığını belirtiyor; bu, eski boş takip yanıtından bağımsız yeni sağlayıcı kanıtıdır. Gerçek kayıtların mutabakatı otomatik değiştirilmedi.
- 12 boş alan + KapidanOdemeTahsilatTipi=0 / KapidanOdemeTutari=null wire payload’a eklendi. Domain, kayıtlı sipariş/adres ve request fingerprint modeli değişmedi. Eski referanslar/siparişler/attemptler silinmedi.
- Tam alan kümesi, boş stringler, null, boolean Iademi, numerik sabitler, string/InvariantCulture desi/kg ve dinamik fixture alıcı/referansı test edildi. Örnek gerçek parola, kişi, adres veya sabit sipariş kodu test/koda taşınmadı.
- `dotnet test ... --filter FullyQualifiedName~Surat`: **82 PASS, 0 SKIP, 0 FAIL**. HttpMessageHandler/isole API fixture’ları; gerçek sağlayıcı çağrısı veya gerçek veri yazımı yok. Mükerrer gönderim, belirsizlik, kontrollü retry, takip ve hata gizliliği regresyonları dahil.
- API Release build 0 hata/uyarı. git diff --check ve belge bağlantıları PASS.

Eski hatanın kesin kök nedeni kanıtlanmadı. Bu teslim JSON’u destek örneğine eşler; gerçek create kabulü, sağlayıcının hareket uygulaması ve takip kabulü henüz çalıştırılmadı. Production, ödeme/sevk ve fiziksel şube/barkod kapıları korunur. Deploy/APK yok.

[Sağlayıcı yanıtı ve test adımları](../../Entegrasyonlar/01-Surat-Kargo/SAGLAYICI-YANITI-2026-11-06.md).
