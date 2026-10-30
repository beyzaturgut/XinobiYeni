# Web mağazası görsel ve durum tutarlılığı — 30.10.2026

Kapsam: yalnız web kaynakları. Başlangıç temiz `main / 632bf38`; AGENTS, Faz00/02/04/05, güncel tasklar ve tasarım/handoff kayıtları okundu. Next.js 16.3.6 yerel `node_modules/next/dist/docs` CSS ve error-handling belgeleri incelendi. Admin/API/Flutter/hosting/deploy değişmedi.

## Yöntem ve sınırlar

33 gerçek page.tsx rotası × 320/390/768/1440 × normal/%200 hesaplanmış metin = 264 rota-boyut-metin kontrolü. Bu metot gerçek tarayıcı zoom/OS ölçeği değildir. Parametresiz rotalarda giriş/koruma ekranı sınandı; etkin akışlar ayrı testlerde. Kayıt/giriş/doğrulama/parola sıfırlama ayrı URL değil hesap modal akışlarıdır. Kategori ve arama URL durumları katalog/arama içinde; sipariş detayı sipariş listesi içinde. Ortak menü/header/footer/çerez/Nobi tüm rotalarda veya mevcut etkileşim testlerinde kontrol edildi.

390 px 33 rotada axe WCAG2A/AA ve 2.1 taraması: critical/serious bulgu yok; tam WCAG/ekran okuyucu kabulü değildir. Görseller 390 ve 1440 px tüm rotalarda alındı, altı temas sayfası ve temsili tam ekranlar görsel olarak incelendi. Fixture ürün/fiyat ve örnek TEST-ORDER yalnız tarayıcı yanıtıdır. Gerçek hesap/sipariş/katalog/sağlayıcı yazması yok.

## Ekran matrisi

K = kontrol edildi; D = düzeltildi. Ortak skip-link/uzun başlık düzeltmesi tüm ilgili ekranlara uygulanır. “Açık” sütunu gerçek kabul bağımlılıklarını gösterir; teknik testin başarısını silmez.

| Ekran | Sonuç / bağlam | Açık |
|---|---|---|
| `/` | K — Slider, mobil dokunma hedefleri; mevcut regresyon. | Gerçek cihaz/manuel kabul |
| `/arama/` | K — Arama/kategori ve URL seçimleri; mevcut regresyon. | Gerçek cihaz/manuel kabul |
| `/asistan/` | K — Mevcut rehber; Nobi durumları ayrı fixture testi. | Gerçek cihaz/manuel kabul |
| `/favoriler/` | D — Katalog/oturum hatası ile boş favori ayrımı ve tekrar deneme düzeltildi. | Gerçek cihaz/manuel kabul |
| `/hesap/` | D — Oturum kesintisi, bağımsız adres/sipariş özetleri; yanlış boş veri ve yerel hesap metni düzeltildi. | Gerçek cihaz/manuel kabul |
| `/hesap/adresler/` | D — Yüklenme/hata/boş ayrımı, kayıt hatasında taslak, işlem kilidi ve teyitli başarı düzeltildi. | Gerçek cihaz/manuel kabul |
| `/hesap/bildirimler/` | D — Okuma hatasında yanlış boş sonuç gizlendi; tekrar deneme eklendi. | Gerçek cihaz/manuel kabul |
| `/hesap/degerlendirmelerim/` | D — Okuma hatası, modal Tab/Escape/odak dönüşü, hata sonrası taslak ve uzun başlık düzeltildi. | Gerçek cihaz/manuel kabul |
| `/hesap/siparisler/` | D — Bağımsız sipariş hatası ve tekrar deneme düzeltildi; detay aynı ekranda. | Gerçek cihaz/manuel kabul |
| `/hesap/siparisler/iade/` | D — Koşul hatası uygunluk reddi olarak sunulmuyor; tekrar deneme eklendi. | Gerçek cihaz/manuel kabul |
| `/hesap/tasarimlarim/` | D — Okuma/görsel tekrarı, adlandırma hatasında liste/taslak koruma, işlem kilidi ve başarı duyurusu. | Gerçek cihaz/manuel kabul |
| `/hesap/tasarimlarim/onizleme/` | K — Parametresiz giriş koruması; kayıtlı revizyon ve tekrar açma mevcut design-configuration regresyonunda. | Gerçek cihaz/manuel kabul |
| `/karsilastir/` | K — Boş karşılaştırma girişi ve mevcut URL/karşılaştırma regresyonu. | Gerçek cihaz/manuel kabul |
| `/kurumsal/teklif/` | K — Form/boş alanlar, mevcut taslak/validasyon regresyonu; gerçek teklif yazılmadı. | Gerçek cihaz/manuel kabul |
| `/kurumsal/teklif/takip/` | K — Kod/e-posta giriş ekranı ve mevcut fixture mesaj regresyonu; gerçek mesaj gönderilmedi. | Gerçek cihaz/manuel kabul |
| `/odeme/` | D — Adres/katalog hata kapıları, stale veride işlem engeli; yalnız fixture sipariş. | Gerçek ödeme/SQL/operasyon UAT |
| `/odeme/sonuc/` | D — Fixture sonuç ekranı ve oturum hata kapısı; gerçek ödeme yok. | Gerçek ödeme/SQL/operasyon UAT |
| `/sepet/` | D — Katalog hatası tekrar deneme, eski veriyle devamın engellenmesi; mevcut sepet sınırları. | Gerçek cihaz/manuel kabul |
| `/studio/ai/` | K — Eski giriş yönlendirmesi/giriş durumu; etkin soru testi ayrıca. | Gerçek cihaz/manuel kabul |
| `/urunler/` | K — Liste/filtre/sıralama; gerçek katalog salt okunur kontrol. | Gerçek cihaz/manuel kabul |
| `/urunler/cay-makinesi-101/` | K — Eski örnek ürün giriş koruması; gerçek katalog dışı örnek uydurulmadı. | Gerçek cihaz/manuel kabul |
| `/urunler/cay-makinesi-101/editor/` | D — Geliştirme önizleme koruması, dar ekran başlık/aksiyon ve uzun hata reflow düzeltildi. | Gerçek cihaz/manuel kabul |
| `/urunler/cay-makinesi-101/kisisellestir/` | K — Eski örnek ürün koruması/yönlendirmesi. | Gerçek cihaz/manuel kabul |
| `/urunler/detay/` | K — P101 fixture ürün detay, fiyat/stok/görsel hata mevcut regresyonu. | 23 ürün içeriği ve SKU 117 fiyatı |
| `/xinobi-u/` | K — Ürün seçimi; mevcut akışın hiyerarşisi korundu. | Gerçek üretim/görsel kalite/baskı kabulü; uygun rota parametreleri |
| `/xinobi-u/kendi-gorselin/` | K — Parametresiz giriş + fixture dosya yükleme ve canvas yerleşim; sağlayıcı/kayıt yazması yok. | Gerçek üretim/görsel kalite/baskı kabulü; uygun rota parametreleri |
| `/xinobi-u/maske-kontrolu/` | K — Geliştirme inceleme sayfası: parametresiz hata koruması; gerçek maske/onay değiştirilmedi. | Gerçek üretim/görsel kalite/baskı kabulü; uygun rota parametreleri |
| `/xinobi-u/mobil-onizleme/` | K — Girişte hata/koruma; geliştirme önizleme, fiziksel baskı kabulü değil. | Gerçek üretim/görsel kalite/baskı kabulü; uygun rota parametreleri |
| `/xinobi-u/onizleme/` | K — Sepet tasarım girişi koruması + mevcut design-configuration akışları. | Gerçek üretim/görsel kalite/baskı kabulü; uygun rota parametreleri |
| `/xinobi-u/renk/` | K — Parametresiz ürün koruması; etkin renk seçimi mevcut regresyonda. | Gerçek üretim/görsel kalite/baskı kabulü; uygun rota parametreleri |
| `/xinobi-u/sorular/` | D — Parametresiz giriş + etkin beş soru/özet 4 genişlikte %200; metin/aksiyon reflow düzeltildi, servis hata/tekrar fixture. | Gerçek üretim/görsel kalite/baskı kabulü; uygun rota parametreleri |
| `/xinobi/` | K — Kurumsal içerik/ortak footer; yeni müşteri metni üretilmedi. | Gerçek cihaz/manuel kabul |
| `/yasal/` | K — Mevcut yasal içerik/akordeon; hukuki onay verilmedi. | Onaylı hukuki metin |

## Kusur ve tekrar adımları

| ID / öncelik | Sayfa / boyut / tekrar | Düzeltme / kanıt |
|---|---|---|
| C01 P1 | Hesap/adres/sipariş, tüm boyutlar: GET 503 veya gecikme | Oturum/bağımsız koleksiyon yüklenme-hata-boş ayrımı; retry; yeni durum testleri |
| C02 P1 | Adresler, 390: kayıt/default başarısızlığı ve hızlı tekrar | Taslak korunur, action kilidi, sunucu yanıtı sonrası başarı; adres testi |
| C03 P1 | Bildirim/değerlendirme, 390: GET 503 | Yanlış boş/uygun ürün görünümü kaldırıldı, retry; iki okuma testi |
| C04 P1 | Yorum formu, 390: Tab döngüsü/Escape/POST 503 | Native modal + sınır odağı, geri dönüş ve taslak; modal testi |
| C05 P1 | Favori/sepet/checkout, 390: katalog 503 | Eski veriyle checkout engeli ve retry; üç katalog testi |
| C06 P1 | İade, 390: seçenek servisi 503 | Koşullar gelmeden uygunluk yok sonucu gösterilmez; retry testi |
| C07 P2 | Tasarımlarım, 390: adlandırma 503/görsel hatası | Liste ve yeni ad korunur, retry/kilit/başarı; rename testi |
| C08 P1 | Değerlendirme/editör, 320/390 %200: uzun başlık, skip link | Kelime kırılması, sınırlı link reflow, editör header aksiyon satırı; 264 matris |
| C09 P1 | Etkin AI soruları, 320–1440 %200: uzun seçenekler/özet | Grid minmax(0,1fr), min-width:0 ve aksiyon sarma; etkin beş soru testi |
| C10 P2 | Nobi, 390: config 503 / mesaj 503 | Config retry/durum ve disabled gönderim; mesaj taslağı korunur; Nobi testi |
| C11 P2 | Hesap özeti, tüm boyutlar: açıklama ve ilk GET hatası | Yanlış yalnız-tarayıcı sipariş metni kaldırıldı; unavailable/loading sayımları |

Öncelik P1: yanlış karar/engellenen kritik etkileşim; P2: anlaşılabilirlik ve geri bildirim. Taşma overflow:hidden ile kapatılmadı. Tasarım yönü, renk/token hiyerarşisi ve anlamlı ekran farkları korundu. Ortak değişiklikler web hesap kütüphanesi, başlık/skip-link, web editörü ve Nobi içindir; Flutter kaynakları değiştirilmedi. WebView aynı web ekranını kullanırsa bu web davranışlarını devralır.

## Açık işler, bağımlılık ve kapanış

| İş | Neden / bağımlılık | Kapanış koşulu |
|---|---|---|
| 23 ürün açıklama/teknik veri, SKU117 fiyat | Kullanıcı onaylı dosyayı sonra verecek | Onaylı veri + kaynak kaydı + katalog tekrar kontrolü |
| Gerçek Safari/VoiceOver ve Android/iOS TalkBack | Fiziksel cihaz, OS büyük metin/sanal klavye/yön değişimi; bu oturum Chrome otomasyonu | Ekran/cihaz bazlı manuel kabul kaydı |
| Gerçek zoom ve Creative/UX handoff | Hesaplanmış %200 font gerçek browser zoom değildir; resmi tasarım kabulü yok | Gerçek zoom/OS ölçek kontrolü + rol/PM kabulü |
| E-posta/SMS/ödeme/SQL/kurumsal operasyon | Sağlayıcı ve izole UAT ortamı/iş kararı; bu iş gerçek hesap/sipariş yazmaz | Yetkili sandbox UAT; teslimat/webhook/idempotency ve operasyon kanıtı |
| AI görsel kalite ve baskı üretimi | Üretim profili, müşteri kalite kabulü, fiziksel numune | Onaylı gerçek çıktı/ölçü/profil/numune kabulü |
| Yasal içerik | Müşteri/hukuk metin onayı | Onaylı sürümün yayımlanması |

Bu açıklar tamamlanmış gibi gösterilmedi; faz/rol/PM onayı verilmedi. Tekrarlanabilir komutlar, ilk hatalar ve son sonuçlar [TST-179](../test/2026-10-30/TST-179-web-consistency.md).
