# Test raporları

Bu dizin çalıştırılmış testlerin, doğrulama komutlarının ve bağlantı kontrollerinin kalıcı kanıt alanıdır. Çalıştırılabilir otomatik test kaynakları kökteki `tests/` dizininde; sonuç raporları ise bu `test/` dizininde tutulur.

## Zorunlu kayıt kuralı

Her test çalıştırmasından sonra, commit/push öncesinde:

1. `test/INDEX.md` içine yeni kayıt eklenir.
2. İlgili tarih dizininde rapor oluşturulur veya o oturumun raporu güncellenir.
3. Komut, kapsam, ortam, sonuç, hata, düzeltme ve tekrar sonucu ayrı yazılır.
4. Başarısız test silinmez; sonraki başarılı tekrar ile ilişkilendirilir.
5. `MOCK`, `SANDBOX`, `INTEGRATION`, `E2E`, `UAT` ve `LIVE` seviyesi açıkça belirtilir.
6. Parola, token, bağlantı dizisi, müşteri kişisel verisi ve gerçek kart bilgisi rapora yazılmaz.
7. Faz00'daki son test özeti bu klasördeki rapora referans verir.

Yeni raporlar `test/YYYY-MM-DD/TST-###-kisa-ad.md` biçiminde adlandırılır. Bir komut zincirindeki her bağımsız doğrulama ayrı test kimliği taşır.

## Son durum

- İlk geriye dönük rapor: `2026-09-29/TST-001-initial-validation-history.md`
- Son otomatik regresyon: .NET build 0 hata/uyarı; 3/3 test başarılı.
- Son başarılı dış SQL kanıtı: TST-017; SQL Server sürümü, boş `XinobiYeniDB`, migration geçmişi ve hesap yetkileri doğrulandı.
- SQL riski: TST-013/TST-015 sırasında geçici TCP kesintisi görüldü; `xinobiyeni_app` geliştirme/migration için `db_owner`, runtime için gereğinden geniş yetkili.
