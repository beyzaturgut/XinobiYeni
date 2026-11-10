# KIS-TEK-12 — iOS kabul kaydı

10.11.2026. [Ortak rapor](../../test/2026-11-10/TST-269-single-source-acceptance.md), [kabul adımları](../runbooks/single-source-acceptance.md).

| Katman | Sonuç |
|---|---|
| iOS TargetPlatform widget teması, 320/390/768 ve %200 metin | 3/3 PASS; renk seçmeden devam, taşma kontrolü |
| Ortak Flutter testleri | 302 PASS / 0 FAIL; hesap/sepet/sipariş, tek kaynak/hata/sürüm/yanlış medya, normal renkli ürün ve geçmiş önizleme dahil |
| Statik analiz | No issues found |
| Dart istemci sözleşmeleri | 12 PASS / 0 FAIL; nullable AI varyant ve ayrı ürün/desen hashleri dahil |
| Fiziksel iOS WebView/galeri/oturum/geri kullanımı | **Açık — çalıştırılmadı** |
| VoiceOver, gerçek büyük metin ve klavye | **Açık — çalıştırılmadı** |
| Native kurulum/dağıtım | Yapılmadı |

`flutter devices --machine` bu çalışmada yalnız macOS ve Chrome bildirdi; bağlı iOS cihazı veya çalışan iOS simülatör/emülatörü bulunmadı. TargetPlatform testleri gerçek cihaz kabulü değildir. Önceki 09.11 raporu tarihsel kalır; bu kayıt 12. taskın yeni test sonucudur.

Kapanış: erişilebilir, eş API/web sürümlü test ortamında onaylı sentetik hesap/ürünle görsel yükle/AI tercihi → yerleşim → revizyon → sepet → demo sipariş akışını, ağ hatasını ve eski tasarımı kontrol et; cihaz/OS sürümü, adım/sonuç ve VoiceOver bulgularını kaydet. Gerçek AI sağlayıcı isteği veya ödeme/kargo kullanma; onaylı test yöntemiyle ilerle. APK/iOS arşivi oluşturulmadı.
