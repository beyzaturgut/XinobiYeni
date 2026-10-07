# TST-090 — Eski uçtan uca testlerin güncel davranışa uyarlanması

- Tarih/saat (Europe/Istanbul): 07.10.2026 ~11:40–12:00
- Commit/branch: `main` / `4abc8e5` üzerinde çalışma ağacı (uygulama kodu `0a18bba`, değişmedi)
- Faz/görev: TST-089'da başarısız olan altı testin düzeltilmesi
- Seviye: E2E / INTEGRATION
- Ortam: LOCAL · çalışan `pnpm dev:local` servisleri (yeniden başlatılmadı) · sistem Chrome headless · Playwright 1.55.1
- Çalıştıran: Claude Code

## Amaç

TST-089'da kasıtlı UI değişikliklerine takılan beş testi güncel davranışa uyarlamak ve `free-product-preview`'ı süresi dolan gerçek oturuma bağımlılıktan kurtarmak. Uygulama kodu değiştirilmedi.

## Yapılan değişiklikler

| Test | Değişiklik | Dayanak |
|---|---|---|
| `test-local-commerce.mjs` | Stok 17 yerine 3 girilir ve `Son 3 ürün` beklenir; "İncele" bağlantısı `/İncele/` ile aranır (JS `/i` bayrağı Türkçe `İ`yi `i` ile eşlemiyordu); stok 0'da devre dışı `Stokta yok` düğmesi doğrulanır | `stockText`: >5 gösterilmez, 1–5 `Son N ürün`, 0 `Stokta yok` (`7a5af3b`); kartın tamamı tek bağlantı (`ca2191f`); stoksuz sepete ekle düğmesi (`b669eaa`) |
| `test-home-navigation-feedback.mjs` | Yeniden yazıldı: ana menü `Ürünler\|Kategoriler\|XINOBI U`, kurumsal menü `Xinobi dünyası\|Kurumsal teklif\|Destek`; kategori menüsü hover ile açılır ve XINOBI U içermez; `/urunler` aynı header'ı kullanır | İki katlı header (`bd25ad6`), ortak mağaza navigasyonu (`a8859d7`) |
| `test-product-listing.mjs` | Rozet `◉ N renk` | `ca2191f` |
| `test-home-category-products.mjs` | Görselin üst elemanı yerine görseli içeren kategori bağlantısı aranır ve tek olduğu doğrulanır | Görsel `div.media` içine alındı (`e0df447`); hedef URL kontrolü aynen korunur |
| `test-xinobi-u.mjs` | Ürün seçimi yeni akışla yapılır: ürün kartı → `/renk` → ilk renk → "Sorulara başla". Ürün ve renk adları sabit kodlanmaz; sayfadaki ilk kişiselleştirilebilir üründen ve API kaydından okunur. Renk sayfasında çerez paneli görünüyorsa kapatılır | `05abd5f`, `b344844`; canlı katalogda ürünler yeniden adlandırıldığı için eski sabit ad ("Çay Makinesi 101 Lacivert") artık bulunmuyordu |
| `test-free-product-preview.mjs` | Gerçek `sessions.json` oturumu yerine sahte, süresi dolmayan bir hazır oturum ve repodaki görsel kullanılır; katalog durumu seed'den gelir | Önceki fixture'ın 24 saatlik erişimi doldu; yenisi ücretli üretim gerektiriyordu |

Tüm testler mevcut doğrulamalarını korur; yalnız değişen arayüze göre seçici ve beklenen metinler güncellendi. Hiçbir doğrulama gevşetilmedi; `local-commerce` ve `home-navigation-feedback` ek kontrol kazandı.

## Komut

```text
node tools/test-<her araç>.mjs   # tek tek, sonra 22 aracın tamamı
```

## Gerçek sonuç

- Durum: **BAŞARILI**
- Özet: TST-089'daki 22 araç yeniden koşuldu: **22/22 başarılı**. `state.json` SHA-256 testlerden önceki yedekle aynı (`16af5f33…f551c`). Ücretli Cloudflare çağrısı yapılmadı.

## Hata ve düzeltme

Ara denemeler: `local-commerce` önce Türkçe büyük harf eşleşmesinde, sonra iki "Stokta yok" öğesinde strict mode ihlalinde; `home-category-products` mutlak locator'ın `has` filtresinde eşleşmemesinde; `xinobi-u` önce görünen metin/aria-label farkında, sonra mobilde çerez panelinin tıklamayı engellemesinde durdu. Her biri düzeltilip tekrar koşuldu.

## Bilinen yan etki

`test-local-commerce` her çalıştırmada iki adet 1,5 MB test görselini (`home-slider-1.png`) `App_Data/local-commerce/media/` altına yükler; API'de medya silme ucu olmadığı için bunlar kayıtsız kalır. Bu oturumda oluşan 8 dosya (fixture ile aynı hash, hiçbir kayıtta kullanılmıyor, bu oturumda oluşturulmuş) silinmeden oturum scratchpad yedeğine taşındı. Daha önceki çalıştırmalardan kalan 6 özdeş ve 9 başka kayıtsız dosyaya dokunulmadı. Öneri: Faz03 medya soyutlamasında (03.08) kayıtsız medya temizliği veya test için silme ucu.

## Etki ve sonraki adım

Yerel uçtan uca paket yeşil. Sonraki adım: proje sahibinden ADR-003 ve ADR-002 Ek A onayı; ardından Faz03 03.11/03.12.
