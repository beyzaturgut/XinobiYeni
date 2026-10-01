# WEB-001 — Ortak ana sayfa wireframe

Sürüm: 1.0 · Creative Designer + Web Designer ortak teslimi  
Durum: Kullanıcı `ORTAK TASARIM ONAY` incelemesine hazırlanıyor

## Masaüstü 1440+

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Skip link                                                              │
├─────────────┬───────────────────────────────────────┬────────────────────┤
│ XINOBI logo │ Ürünler  XINOBI U  Desenler  Xinobi │ Ara  Hesap  Sepet  │ 80
├─────────────┴───────────────────────────────────────┴────────────────────┤
│                                                                          │
│  ANA SLIDER / VIDEO                                  Ürün görseli         │
│  Kısa ve kanıtlanabilir başlık                                            │  min 620
│  Birincil CTA  ·  isteğe bağlı bağlantı                                  │
│  ● ○ ○                                      Önceki  Duraklat  Sonraki    │
├──────────────────────────────────────────────────────────────────────────┤
│ XINOBI U  |  Ürünü seç → 5 soru → 4 tasarım → temsili önizleme          │ 360
│ [Kişiselleştirilebilir ürünleri keşfet]                    Ürün + desen    │
├──────────────────────────────────────────────────────────────────────────┤
│ KATEGORİLER  [Çay] [Kahve] [Tost] [Pişirme] [Hava] [Desen] [XINOBI U]   │
├──────────────────────────────────────────────────────────────────────────┤
│ ÖNE ÇIKAN ÜRÜNLER     ← [ürün] [ürün] [ürün] [ürün] →                  │
├──────────────────────────────────────────────────────────────────────────┤
│ KEŞFET                 [geniş editoryal banner] [ikincil banner]          │
├──────────────────────────────────────────────────────────────────────────┤
│ DESTEK/GÜVEN  yalnız doğrulanmış bilgiler                                │
├──────────────────────────────────────────────────────────────────────────┤
│ XINOBI HİKÂYESİ                                   ürün detayı / süreç     │
├──────────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                                        [Nobi'ye sor 56px]
```

## Tablet 768–1023

- Header logo + temel hedefler + arama/sepet; geniş kategori menüsü drawer olur.
- Hero minimum 560 px; metin alt üçte birde, ürün odak noktası korunur.
- XINOBI U metin/görsel 1:1 grid; 768 px altında tek kolona geçer.
- Kategori ve ürün alanları 2.5 kart görünür, yatay scroll/snap ve ok kontrolü taşır.
- Keşfet bannerları tek kolon; Nobi 56 px ve güvenli kenar 20 px.

## Mobil 320–767

```text
┌─────────────────────────────┐
│ Menü   XINOBI   Ara  Sepet  │ 64
├─────────────────────────────┤
│ HERO MEDIA 4:5              │
│                              │
│ Başlık                       │
│ Açıklama                     │
│ [Birincil CTA]               │
│ ● ○ ○  [Duraklat]            │
├─────────────────────────────┤
│ XINOBI U                     │
│ 5 soru · 4 tasarım           │
│ [Keşfet]                     │
├─────────────────────────────┤
│ Kategoriler → yatay          │
├─────────────────────────────┤
│ Öne çıkanlar → yatay         │
├─────────────────────────────┤
│ Keşfet banner 1              │
│ Keşfet banner 2              │
├─────────────────────────────┤
│ Destek / hikâye / footer     │
└─────────────────────────────┘
                 [Nobi 56×56]
```

- CTA mobilde içerik genişliğinde; minimum 48 px yükseklik.
- Hero metni görsel üzerinde kontrastı garanti edemiyorsa ayrı yüzeyde gösterilir.
- Menü drawer'ında yedi zorunlu hedef ve hesap/favori bağlantıları bulunur.
- Nobi, çerez paneli veya sistem güvenli alanı açıldığında yukarı taşınır.

## Etkileşim ve durumlar

| Bileşen | Durum/etkileşim |
|---|---|
| Slider | manuel ilk deneyim; autoplay açılırsa pause görünür, 5 sn'den kısa değişmez, focus/hover'da durur |
| Video | sessiz, posterli; oynatma kontrolü; altyazı/metin karşılığı; görünüm dışında pause |
| Mega menü | click/Enter/Space açar; Escape/dış tık kapatır; odak geri döner |
| Carousel | ok düğmesi + swipe + klavye; yatay scroll doğal; görünür sıra ve başlık |
| Ürün kartı | görsel, ad, varyant özeti, fiyat/stok veri durumu; tüm kart tek dev bağlantı değildir |
| Nobi | `aria-expanded`; panel odak yönetimi; kapatınca launchera dönüş; servis hatası/destek yolu |
| Medya hatası | oranı koruyan marka placeholder; metin/CTA kaybolmaz |
| CMS boşluğu | bölüm tamamen gizlenmezse editör kontrollü güvenli fallback; kırık kart gösterilmez |

## Geçici içerik kuralı

Admin panelinden yönetilecek slider, XINOBI U bannerı, kategori görseli ve keşfet bannerı gerçek CMS bağlantısı kurulana kadar görünür `Temsili` ve `Admin panelinden yönetilir` açıklaması taşır. Geçici içerik fiyat, stok, kampanya, teslimat veya üretim uygunluğu iddiası kurmaz. Gerçek onaylı içerik yayınlandığında etiket CMS yayın kanıtıyla kaldırılır.

## Tasarım onayı sonrası hi-fi üretim

Wireframe onayından sonra aynı dosya ID'siyle 1440, 1024, 768, 390 ve 320 px yüksek doğruluklu kaynak/PNG çıktıları hazırlanır. Onaydan önce `apps/web` görsel düzeni değiştirilmez.
