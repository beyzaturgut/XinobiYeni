# Sipariş tasarım dosyaları: eski kayıt envanteri (dry-run) ve geri dönüş planı

SIP-TAS-08 kapsamında hazırlandı. Komut **salt okunurdur**: sipariş kaydı, dosya ya da referans değiştirmez. Güncel katalog veya tasarım verisine bakmaz. Bu belgede sözü geçen geri doldurma işlemi uygulanmadı. Uygulanması ayrı bir onay ve ayrı bir task gerektirir.

## Çalıştırma

Komut, API'nin çalıştığı yapılandırmayla (SQL ya da Development dosya deposu) çalışır:

```
dotnet Xinobi.Api.dll order-design-files-dry-run > order-design-files-report.json
```

- Çıkış kodu `0`: rapor stdout'a JSON olarak yazıldı.
- Çıkış kodu `2`: sipariş ya da dosya deposu okunamadı; rapor üretilmedi. Okunamayan depo hiçbir zaman boş rapor olarak yorumlanmaz.
- Raporda yalnız sipariş kimliği, sipariş numarası, satır numarası ve durumlar bulunur. Müşteri adı, e-postası, adresi ya da depolama yolu yer almaz. Yine de rapor iç kullanım içindir.

## Satır durumları

| Dosya | Durum | Anlamı |
|---|---|---|
| Desen | `verified` / `checksum-mismatch` / `missing-copy` | Referans var; kopya özetle eşleşiyor / eşleşmiyor / dosya kopyası yok |
| Desen | `provable` + öneri `record-pattern-reference` | Referans yok; siparişin kendi kopyası, yerleşimin kayıtlı desen özetiyle (`sourceSha256`) birebir eşleşiyor |
| Desen | `unprovable-no-recorded-checksum` | Referans ve yerleşim özeti yok; kopya erişilebilir ama aynı sürüme ait olduğu kanıtlanamaz |
| Ürün kaynak görseli | `not-kept-for-this-order` / `no-placement` | SIP-TAS-02 öncesinde kopya saklanmadı. **Geri doldurulamaz**; güncel katalog fotoğrafı kanıt sayılmaz |
| Kompozisyon | `order-copy-unverified` + öneri `decide-unverified-composition` | Sipariş anında kopyalanmış dosya var, ancak baytlarını doğrulayacak bir kayıt yok |
| Kompozisyon | `not-uploaded-for-revision` / `not-kept-for-this-order` / `no-placement` | Kopya yok; yeniden oluşturulmaz |

## Kanıt kuralı

Geri doldurma yalnız aynı sipariş sürümüne ait ve kanıtlanabilir bir kaynağa dayanabilir. Bu koşulu yalnız `record-pattern-reference` sağlar: siparişin kendi kopyası, yerleşim kaydındaki desen özetiyle aynıdır.

`decide-unverified-composition` önerisi otomatik uygulanamaz. Dosya siparişe aittir, ama içeriği bir özetle doğrulanamaz. Bu yüzden ekranda ve API'de zaten “doğrulama özeti kaydedilmedi” etiketiyle sunuluyor. Referans olarak kaydedilmesi bir ürün kararıdır.

## Gelecekte uygulanırsa: geri dönüş planı

1. Uygulamadan önce aynı ortamda dry-run raporunu ve sipariş tablosunun yedeğini alın. SQL ortamında bu, `SalesOrderLines.PersonalizationJson` alanının satır bazlı dışa aktarımıdır.
2. Değişikliği yalnız `Files` alanı boş olan ve önerisi `record-pattern-reference` olan satırlara uygulayın. Yazılacak tek şey, rapordaki özet ve bayt değerleriyle `Files.Pattern` referansıdır.
3. Dosya taşınmaz, kopyalanmaz ve silinmez. `ProductSource` ile `Composition` boş bırakılır.
4. Her satırı, başka alanlara dokunmadan yalnız `Files` alanına yazarak güncelleyin. Hangi sipariş ve satırların değiştiğini bir değişiklik kaydında tutun.
5. **Geri dönüş:** değişiklik kaydındaki satırlarda `Files` alanını yeniden `null` yapın ya da 1. adımdaki yedeği geri yükleyin. Dosyalar değişmediği için başka bir adım gerekmez.
6. Sonrasında dry-run'ı yeniden çalıştırın. Değişen satırlar `verified` görünmeli; başka hiçbir satırın durumu değişmemelidir.
