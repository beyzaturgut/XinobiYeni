# TST-046 — Faz02 Chrome uzun sayfa görsel QA grubu 04

- Tarih: 2026-10-01
- Kaynak commit: `3a37380`
- Ortam: Yerel statik export, Google Chrome headless, 500×2400 px

## Kontrol edilen rotalar

- `/studio/ai/`
- `/asistan/`
- `/xinobi/`
- `/yasal/`

## Sonuç

- AI tasarım formu/boş sonuç alanı, satış asistanı konuşma/composer alanı, kurumsal hikâye bölümleri ve yasal belge/haklar bölümleri dar uzun görünümde taşmadan render edildi.
- Global çerez paneli sabit alt konumda, kapatma ve üç tercih eylemi görünür biçimde render edildi.
- Mobil header düzeltmesi AI tasarım ve satış asistanında korundu.
- Bu turda uygulama kaynak kodu değişikliği gerekmedi.

## Tekrarlanan kontrol

İlk `/xinobi/` uzun ekran görüntüsünde hero ürünü boş göründü. `--run-all-compositor-stages-before-draw` ve 5 saniyelik sanal zaman bütçesiyle tekrarlandığında ürün doğru yüklendi. Bulguyla uygulama/asset hatası değil, headless çekim zamanlaması ayrıştırıldı.

## Açık kontroller

- AI/asistan seçimleri, form yazımı, temizleme ve durum geçişleri için gerçek tıklama/klavye testi.
- Yasal bağlantılar, çerez ayar kategorileri, kapatma/yeniden açma ve odak sırası.
- 390 px gerçek telefon, tablet ve ekran okuyucu QA.
- D05/D08/D10, CMS ve sağlayıcı bağlantıları sonrası gerçek veri/güvenlik senaryoları.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
