# TST-113 — 0002–0004 uygulandı, SQL depoları ve yerel veri aktarımı

- Tarih: 09.10.2026.
- Başlangıç: `main` / `ce6b033`; bitiş: `4032980` + bu rapor.
- Proje sahibi kararı: veritabanında iş verisi olmadığı için VERIFYONLY beklenmeden migration'lar uygulandı (runbook'ta kayıtlı sapma). Veri aktarımı ayrıca soruldu ve "Hepsini aktar" onayı alındı.

## Migration'lar

| Script | Sonuç |
|---|---|
| 0002_CatalogCommerce | Uygulandı. |
| 0003_CustomerIdentityOrders | İlk deneme `-I` olmadan Msg 1934 (filtreli indeks, QUOTED_IDENTIFIER) ile düştü; işlem tamamen geri alındı. `-I` ile uygulandı. |
| 0004_FeatureDocuments | Yeni: `ops.FeatureDocuments`. Uygulandı. |

Her script ikinci kez çalıştırıldı; değişiklik olmadı. Son durum: 4 geçmiş kaydı, 24 iş tablosu. Runbook'taki komutlara `-I` eklendi.

## Kod

- `SqlAccountStore`: hesap, hash oturumlar (aile iptali), adres (tek varsayılan), idempotent sipariş; hesap başına `sp_getapplock`. SQL hatası 503.
- `AccountTransfer`: boş tablolara aktarım, geri okuyup karşılaştırma, `accounts-sql.enabled`.
- `DocumentStore<T>` (eski `DevJsonStore`): dosya veya `ops.FeatureDocuments`; `FeatureTransfer` ile aktarım, `features-sql.enabled`.
- Development dışı: `Accounts:StorageProvider=SqlServer` ve `Features:StorageProvider=SqlServer` ile açılır; Preview e-posta modu reddedilir, hesap uçları hız sınırlı.

## Testler

- Gerçek SQL: `SqlCatalogIntegrationTests` 1/1, `SqlAccountIntegrationTests` 1/1 (kayıt, giriş, token rotasyonu ve yeniden kullanımda aile iptali, adres varsayılanı, 4 paralel aynı istekten tek sipariş, rol, e-posta/parola değişimi, silme, aktarım), `SqlFeatureDocumentTests` 2/2 (üç ayrı süreç gibi 12 paralel yazıcıda kayıp yok, hata veren değişiklik yazılmıyor). Testler kendi kayıtlarını temizledi; sonrasında tablolar boş doğrulandı.
- Tam .NET: **322 geçti / 3 atlandı (SQL ortam değişkeni gerektirenler) / 0 başarısız**.

## Aktarım (API durdurularak)

Öncesinde `state.json`, `identity/`, `assistant/` oturum scratchpad'ine kopyalandı.

```text
katalog: {"imported":true,"products":17,"variants":69,"prices":4,"categories":6,"verified":true,"activated":true}
hesap:   {"Accounts":1,"Addresses":0,"Orders":0,"RefreshSessions":1,"AccessSessions":0, verified, activated}
özellik: {"documents":["assistant"],"verified":true,"activated":true}
```

Süresi dolmuş access oturumu taşınmadı. Kişisel veri, parola özeti veya token rapora alınmadı. Yeniden başlatma sonrası: API/web/admin 200, `X-Xinobi-Catalog-Storage: SqlServer`, katalog 17 ürün, panel 2 Nobi sohbeti — SQL'den.

## Açık kalanlar

- Kayıtlı tasarım ve ürün medya dosyaları hâlâ yerel diskte (dosya deposu ayrı iş).
- D10 (sipariş saklama) açık; hesap silme siparişleri de siler (mevcut sözleşme).
- `EmailVerificationStore` bellekte; tek API örneği varsayımı.
- Doğrulanmış yedek/restore provası veri içeren ortamlar için hâlâ şart.
