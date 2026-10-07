# TST-095 — Flutter uygulama iskeleti ve katalog ekranları

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `c070df3` üzerinde çalışma ağacı
- Faz/görev: Faz11 erken mobil hazırlık (Faz00 §1 paralellik) — iskelet + katalog okuma
- Seviye: UNIT / WIDGET / E2E (emülatör) / A11Y
- Ortam: LOCAL · Flutter 3.47.5, Android emülatörü Pixel 8 (1080×2400), geçici API 127.0.0.1:5013 (yeni kod, gerçek yerel veri). Xcode eksik olduğu için iOS çalıştırılmadı.
- Çalıştıran: Claude Code

## Yapılanlar

- ADR-001'e uygun yapı: Riverpod 3.4.3, go_router 18 (`StatefulShellRoute` ile üç sekme: Ana sayfa, Ürünler, XINOBI U; ürün detayı sekmelerin üstünde açılır, Android geri tuşu listeye döner).
- `CatalogRepository` üretilmiş `CatalogApi`/`ContentApi` üzerinden; hatalar kullanıcıya anlaşılır Türkçe mesaj, 404 ve 503 ayrı. Riverpod'un otomatik yeniden denemesi kapatıldı (hata alan istek arka planda 10 kez tekrarlanıyordu); yeniden deneme "Tekrar dene" düğmesinde.
- API adresi: `--dart-define=API_BASE_URL`, yoksa Android emülatörü `10.0.2.2:5003`, iOS simülatörü `127.0.0.1:5003`. Debug Android'de yalnız yerel http için cleartext; iOS'ta `NSAllowsLocalNetworking`. Release Android manifestine INTERNET izni eklendi.
- Tasarım: `design/tokens.json` v0.3.0'a header değerleri eklendi; `tools/generate-mobile-tokens.mjs` (`pnpm tokens:mobile`) Dart tokenlarını üretir. Jost ve Inter değişken fontları (SIL OFL 1.1, lisans metinleri `apps/mobile/assets/fonts`) ve Xinobi logosu pakete eklendi. DES-MOB-01.
- Ekranlar: ana sayfa (slider, XINOBI U bannerı, kategori şeridi, öne çıkanlar), ürün listesi (arama 350 ms gecikmeli, kategori filtreleri, ürün sayısı, boş/hata/yükleniyor), ürün detayı (kapak → seçilen rengin fotoğrafı, HEX renk seçici, fiyat, stok metni, fiyatsız/stoksuz açıklaması), XINOBI U (kişiselleştirilebilir ürünler).

## Komut ve sonuç

```text
cd apps/mobile && flutter analyze && flutter test   → temiz; 10/10
(core: API adresi, para biçimi, stok metni, token kayması; widget: ana sayfa, hata+tekrar dene, filtre, XINOBI U filtresi, renk seçimiyle fiyat/stok, ekran okuyucu eylemleri)
flutter run -d emulator-5554 --dart-define=API_BASE_URL=http://10.0.2.2:5013 → ekranlar gerçek veriyle görüntülendi
```

- Durum: **BAŞARILI**

## Bulunup düzeltilen hatalar

1. Ana sayfa kategori kutusunda iki satırlık ad 10 px taşıyordu → metin esnek alana alındı.
2. 390 pt telefon genişliğinde ürün kartı 5–47 px taşıyordu → metin alanı esnek, ad üç noktayla kısalıyor, kart oranı 0,52. Testler artık telefon boyutunda (390×844) çalışıyor.
3. Slider (4:5) ve XINOBI U bannerı (16:9) yazı içeren geniş bannerları kesiyordu → 2,4:1 kadraj (DES-MOB-01).
4. **Erişilebilirlik:** ürün kartı, kategori kutusu, XINOBI U bannerı ve renk seçicisi ekran okuyucuya tıklanamaz görünüyordu (`clickable=false`) → birleşik etiketlere dokunma eylemi eklendi; emülatörde `clickable=true` ve testte `isSemantics(hasTapAction: true)` doğrulandı.

Not: emülatörde `adb shell input tap` dokunuşları kaydedilmedi; basılı tutulan `input motionevent DOWN/UP` ile çalıştı. Uygulama hatası değil.

## Kanıt

Emülatör ekran görüntüleri oturum scratchpad'inde (ana sayfa, kaydırılmış ana sayfa, ürünler, detay, Rose Gold seçimi). Geçici API ve emülatör test sonunda kapatıldı; çalışan `pnpm dev:local` servislerine dokunulmadı.

## Etki ve sonraki adım

Mobil, web ile aynı API ve iş kurallarıyla katalog okuyor. Sonraki adım: XINOBI U soru akışı (oturum, 5 soru, üretim durumu, önizleme) ve sepet; gerçek cihaz/iOS doğrulaması Xcode kurulumu ve test ortamı (03.10) sonrası.
