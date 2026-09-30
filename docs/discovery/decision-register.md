# Faz01 — D01–D10 karar defteri

Durum: Açık kararlar mevcut · Son güncelleme: 30.09.2026

İzin verilen durumlar: `Açık`, `Girdi bekliyor`, `İncelemede`, `Karar verildi`, `Bloke`. Bir karar yalnız müşteri karar sahibi, tarih ve kanıtla `Karar verildi` olur.

| ID | Soru | Seçenek/öneri | Seçilen karar | Karar sahibi | Kanıt | Tarih | Etki | Geri dönüş | Durum |
|---|---|---|---|---|---|---|---|---|---|
| D01 | Mevcut kod/veri ve yeniden kullanım | Yeni monorepo / mevcut sistemi taşı / hibrit | Yeni monorepo; mevcut kod verilmedi | Proje sahibi + teknik ekip | `environment-inventory.md`, ADR-001 | 29.09.2026 | Faz01–03 | Mevcut kod sonradan gelirse ayrı değerlendirme | İncelemede |
| D02 | Ürün/varyant/fiyat/stok ana kaynak ve Mikro yönü | Merkezi platform / Mikro / alan bazlı hibrit | — | Operasyon + Mikro sahibi | `data-ownership-and-state-transitions.md` karar matrisi | — | Faz04,08,09 | Alan bazlı geri dönüş planı | Girdi bekliyor |
| D03 | Sipariş/ödeme/rezervasyon/havale/iptal/iade/kargo durumları | Durum makinesi ve süreler | — | Satış + operasyon | `data-ownership-and-state-transitions.md` öneri ve açık kararları | — | Faz05,08,09,11 | Sağlayıcı/operasyon mutabakatı | Girdi bekliyor |
| D04 | Baskı tekniği, alan, DPI, format, renk ve onay | Ürün/varyant bazlı fiziksel profil | — | Ürün + üretim | — | — | Faz06,11 | Sürümlü baskı profili | Girdi bekliyor |
| D05 | Ödeme, kargo, SMS/e-posta, AI ve destek sağlayıcıları | Adapter + sandbox + gerçek erişim | — | Proje sahibi + hesap sahipleri | — | — | Faz05,10,11 | Sağlayıcı adapterı değişimi | Girdi bekliyor |
| D06 | Mikro ve üç pazaryeri sürüm/API/test erişimleri | API / SDK-COM / ara katman | — | Entegrasyon sahipleri | — | — | Faz08,09 | Mock yalnız geliştirme için | Girdi bekliyor |
| D07 | Teklif fiyatlama/onay ve siparişe dönüşüm | Manuel onay / kural tabanlı dönüşüm | — | Kurumsal satış | `data-ownership-and-state-transitions.md` teklif yaşam döngüsü | — | Faz07 | Talep siparişten ayrı kalır | Girdi bekliyor |
| D08 | AI alternatif, kota, içerik, çıktı ve maliyet | Sağlayıcı bağımsız limit politikası | — | Ürün sahibi | — | — | Faz10 | Model/sağlayıcı değişimi | Girdi bekliyor |
| D09 | Mobil editör, push ve mağaza hesapları | Flutter Canvas, gerçek cihaz PoC | Flutter zorunlu; native Canvas yaklaşımı koşullu | Ürün + mobil sorumlusu | ADR-001 | 29.09.2026 | Faz06,11 | PoC başarısızsa ayrı ADR | İncelemede |
| D10 | Hukuki metin, rıza ve saklama | Hukuk/operasyon onaylı sürümlü politika | — | Hukuk + operasyon | — | — | Faz04,05,10,11 | Yayın/saklama blokeli kalır | Girdi bekliyor |

## Teknik kararlarla karıştırılmayacak noktalar

- Microsoft SQL Server, Flutter ve Docker kullanılmaması proje sahibinin teknik kararlarıdır; D02–D10 iş kararlarının yerine geçmez.
- Temsili CTO değerlendirmesi gerçek müşteri, hukuk, üretim veya sağlayıcı onayı değildir.
- SQL Server erişimi ve boş veritabanı envanteri TST-017'de doğrulandı. İlk migration Faz03 işidir; öncesinde migration/runtime hesap ayrımı, yedek/geri dönüş ve ilgili D kararlarının sınırı korunur.
