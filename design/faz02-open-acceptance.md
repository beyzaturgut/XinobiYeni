# Faz02 açık kabul listesi

Tarih: 01.10.2026  
Durum: **Devam — Faz02 kapanışına hazır değil**

Bu kayıt, `Prompts/Faz02_Tasarim_ve_UIUX.md` kabul maddelerini mevcut repo kanıtıyla karşılaştırır. Otomatik test başarısı gerçek iş sahibi, rol veya PM kabulü yerine geçmez.

## Kanıtlanmış web teslimleri

- WEB-001–020 için çalışan responsive prototip rotaları ve `design/screen-inventory.md` eşlemesi mevcut.
- Yetkili logo `design/logo/`, demo ürün görselleri uygulama varlıklarında kullanılıyor.
- Tasarım tokenleri ve karar özeti `design/tokens.json` ile `design/decisions.md` içinde mevcut.
- F02-A03 web bileşen sözleşmesi `design/components.md` içinde durum, semantik, klavye, responsive ve veri sınırlarıyla mevcut.
- Masaüstü ve 500 px Chrome görsel QA grupları kayıtlı.
- Kritik web etkileşimleri Playwright ile 18/18 geçti.
- Yirmi rotada WCAG A/AA axe taraması ve iki klavye odağı senaryosu 22/22 geçti.
- Ana sayfa, Xinobi dünyası ve yasal merkez iç/rota bağlantıları 3/3 smoke testinden geçti.
- Web lint, TypeScript ve 23 statik rota production build kanıtları mevcut.

## Açık bağımsız işler

| ID | Açık teslim | Gerekli kanıt | Sonraki sahip/adım |
|---|---|---|---|
| F02-A01 | 390 px gerçek telefon ve tablet QA | Fiziksel cihaz ekran görüntüsü, taşma/dokunma/klavye sonucu | FE + Creative; web kritik rotalarını gerçek cihazda doğrula |
| F02-A02 | Manuel ekran okuyucu kontrolü | VoiceOver ve TalkBack temel akış tutanağı | FE; ana menü, form, ürün, editör ve ödeme kabuğunu incele |
| F02-A04 | Akış teslimi | `design/flows.md`; web, panel ve mobil akış bağlantıları | BA + Creative |
| F02-A05 | Editör ve AI ayrıntılı spec | `design/editor-spec.md`, `design/ai-spec.md` | Creative + FE + BE |
| F02-A06 | Handoff paketi | `design/handoff.md`, medya/lisans, ölçü ve API alan eşlemesi | Creative → FE; BE/DBA/Full Stack incelemesi |
| F02-A07 | Erişilebilirlik tutanağı | `design/a11y-audit.md`; kontrast, odak, reduced-motion ve manuel sonuçlar | FE |
| F02-A08 | Düzenlenebilir ekran kaynakları/çıktıları | `design/screens/` altında web, panel ve mobil kaynak/PNG/PDF | Creative |
| F02-A09 | Yönetim paneli yüksek doğruluk ekranları | ADM-001–012 durumları; yetki/boş/hata/yeniden dene | Creative + FE; Faz03–04 sözleşmeleriyle hizala |
| F02-A10 | Flutter iOS/Android referans ekranları | MOB-001–007 iOS/Android; güvenli alan/geri/klavye/düşük bağlantı | Creative + Flutter geliştirici |

## Müşteri kararına bağlı blokajlar

- **D02:** gerçek ürün/varyant/fiyat/stok kaynağı; varyantın sepet ve sipariş boyunca gerçek veriyle korunması.
- **D03:** ödeme, rezervasyon, havale, iptal/iade ve kargo iş kuralları.
- **D04:** fiziksel baskı alanı, teknik, ölçü, taşma ve kalite kabulü.
- **D05:** ödeme, kargo, mesajlaşma ve AI sağlayıcı erişimleri.
- **D08:** AI alternatif, limit, maliyet ve içerik politikası.
- **D09:** mobil editör eşliği, push ve mağaza süreçleri.
- **D10:** yasal metinler, çerez envanteri, rıza ve saklama kuralları.

Bu kararlar kapanmadan ilgili prototipler yalnız güvenli demo olarak kabul edilir; gerçek entegrasyon veya ticari işlem kabulü verilmez.

## Kapanış kapısı

Faz02 ancak aşağıdakilerin tümü gerçekleştiğinde `Tamamlandı` olabilir:

1. F02-A01–A10 teslimleri kanıtlarıyla kapanır.
2. D02–D10 kararlarının Faz02 kabulüne etkisi gerçek sahiplerce kaydedilir.
3. İş Analisti, Creative, FE, BE, DBA ve Full Stack ayrı uygulama incelemelerini gerçek kimlik/tarih/kanıtla verir.
4. PM, bu altı incelemeden sonra ayrı `PM-KAPI: KABUL` kararı verir.

Mevcut değerlendirme: web prototipi ve otomatik QA ilerlemiştir; panel, mobil, handoff ve gerçek onaylar eksik olduğu için **Faz02 = Devam**.
