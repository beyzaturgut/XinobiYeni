# Analiz2 tasarım fark matrisi

Kaynak: `Proje Yönetimi/Xinobi_Kavramsal_ve_Teknik_Analiz2.md`  
Sürüm: 1.0 · Tarih: 01.10.2026

| ID | Zorunlu gereksinim | Tasarım teslimi | Uygulama fazı | Mevcut fark / kapı |
|---|---|---|---|---|
| K-01 | Header altında ekranı kaplayan ana slider | WEB-001 mixed-media hero | Faz02/04 | Mevcut statik hero refactor öncesi onay bekler |
| K-02 | Admin görsel/video/karma slider | Hero medya ve durum spec'i | Faz04 | CMS alanları ve performans kuralı gerekli |
| K-03 | Adlandırma XINOBI U | Global içerik sözlüğü | Faz02/04 | Eski Studio ifadeleri eşlenmeli |
| K-04 | XINOBI U bannerı sliderın hemen altında | WEB-001 ikinci bölüm | Faz02/04 | Mevcut sayfa sırası değişecek |
| K-05 | Ardından kategori kolonları | WEB-001 üçüncü bölüm | Faz02/04 | Görsel kategori kaynağı gerekli |
| K-06 | Ardından öne çıkan ürün sliderı | WEB-001 dördüncü bölüm | Faz02/04 | Statik grid yerine erişilebilir carousel |
| K-07 | Keşfet bannerları admin yönetimli | WEB-001 beşinci bölüm | Faz02/04 | Yeni CMS blok ve link doğrulama |
| K-08 | Sağ altta sabit Nobi sembolü/alanı | Global Nobi launcher | Faz02/10 | Alt nav/çerez paneli çakışma kuralı |
| K-09 | Nobi sohbet ve karşılama | WEB-018 paneli | Faz02/10 | Onaylı bilgi ve insan devri açık |
| K-10 | Aynı font ve uyumlu tasarım | Inter/token/bileşen sözleşmesi | Faz02 | Ortak header ve primitives uygulaması açık |
| K-11 | Yedi öğeli açılır kategori menüsü | Global mega menü | Faz02/04 | Klavye/dokunma davranışı tasarlanacak |
| K-12 | Önizlemede “Temsilidir” | XINOBI U preview etiketi | Faz02/06 | Her preview durumunda kalıcı olmalı |
| K-13 | Market hesabı | Karar girdisi | Faz01/11 | Anlamı açık karar; ekran uydurulmaz |
| K-14 | Kendi görselini yükleme | XINOBI U alternatif giriş yolu | Faz02/06 | Dosya güvenliği ve D04 kapısı |
| K-15 | Beş eksen/soru, dört şık | Tek-soru ekranı + adım göstergesi | Faz02/10 | Soru servisi ve içerik onayı gerekli |
| K-16 | Soru ve şık sırası değişir | Oturum sabitleme durumu | Faz10 | Yenilemede değişmeme kuralı görünür olmalı |
| K-17 | Cevapların güvenli AI eşlemesi | Üretim bekleme/hata/ret durumları | Faz10 | Cloudflare adaptörü ve D08 kapısı |
| K-18 | Tüm uygun ürünler XINOBI U'da | Kişiselleştirilebilir katalog | Faz04/06 | D02/D04 uygunluk kaynağı gerekli |
| K-19 | Ürün → sorular → dört tasarım | XINOBI U ana akış | Faz06/10 | Dört kullanılabilir aday kabul testi |
| K-20 | Seçilen tasarım ürün üzerinde | Temsili ürün preview | Faz06/10 | Gerçek maske/baskı alanı D04'e bağlı |
| K-21 | Tasarımları kaydetme | Tasarım kütüphanesi/detay | Faz06 | Hesap, sahiplik ve sürüm gerekli |

## Öncelikli tasarım farkları

1. WEB-001'in mevcut bölüm sırası K-01–K-08'e göre yeniden tasarlanacak.
2. Ortak header, mega menü, footer ve Nobi launcher tüm web rotalarında aynı tipografi/ölçüleri kullanacak.
3. Slider/video/carousel etkileşim ve erişilebilirlik davranışı bileşen sözleşmesine eklenecek.
4. XINOBI U tek ürün seçimiyle başlayan iki giriş yolu sunacak: beş soruluk AI veya kendi görselini yükleme.
5. Panel ve Flutter yüksek doğruluk teslimleri web yönü onayından sonra aynı sistemle üretilecek.
