# Faz01 — Faz bağımlılık ve UAT planı

Durum: Taslak · Tarihler ekip kapasitesi ve dış erişimle belirlenecek.

| Faz | Başlangıç kapısı | Paralel güvenli iş | Kabul/UAT sahibi | Zorunlu kanıt | Bloke eden karar |
|---|---|---|---|---|---|
| 01 | Kaynaklar erişilebilir | Matris, envanter, sözleşme taslağı | PM + iş sahipleri | D01–D10 sahip/karar veya açık blokaj | D01–D10 girdileri |
| 02 | Marka/ürün brief'i | Token ve düşük riskli akış çalışması | Creative + Frontend + PM | Prototip, durumlar, asset/lisans, handoff | D04,D08,D09,D10 girdileri |
| 03 | ADR-001 ve ortam | API/worker/mobil kabuk | Teknik roller + PM | Build/CI, OpenAPI, kimlik, SQL migration/restore | SQL erişimi,D01,D10 |
| 04 | Faz02–03 temel teslim | CMS/SEO ve katalog sözleşmeleri | Katalog/içerik sahibi | Gerçek çok varyantlı ürün, fiyat/stok ve yayın | D02,D10 |
| 05 | Faz03–04 kabulü | Sağlayıcı mock sözleşmeleri | Satış/operasyon | Sandbox ödeme, sipariş, stok, kargo, iade | D03,D05,D10 |
| 06 | Faz02–05 + üretim girdisi | DesignDocument ve geometri vektörleri | Üretim + Creative | Gerçek baskı örneği ve sürümlü sipariş bağı | D04 |
| 07 | Faz03–04 + satış süreci | Form ve taslak sözleşme | Kurumsal satış | Teklif yaşam döngüsü ve onaylı dönüşüm | D07 |
| 08 | Çekirdek sipariş/katalog | Mock adapter ve eşleme | Mikro/finans sahibi | Gerçek Mikro erişimiyle mutabakat ve tekrar | D02,D03,D06 |
| 09 | Çekirdek sipariş/katalog | Üç fixture adapterı | Kanal operasyonu | Her kanal ayrı gerçek erişim ve UAT | D02,D03,D06 |
| 10 | Katalog/editör/teklif | Provider adapter ve fake | Ürün/AI sahibi | Limit, moderasyon, maliyet, lead/devir | D05,D08,D10 |
| 11 | Önceki kabul kapıları | Erken mobil kabuk ve cihaz PoC | İş sahibi + PM | iOS/Android cihaz, bütünleşik UAT, restore/rollback, yayın/eğitim | D03–D10 |

## Test katmanları

- `UNIT`: Saf iş kuralı ve dönüşüm testleri.
- `INTEGRATION`: Gerçek SQL Server ve süreç içi kontrollü bağımlılıklar.
- `CONTRACT`: OpenAPI ve sağlayıcı fixture/sandbox sözleşmesi.
- `E2E`: Web/panel/API ve Flutter gerçek kullanıcı akışı.
- `UAT`: Yetkili Xinobi iş sahibinin gerçek senaryosu.
- `LIVE`: Kontrollü canlı smoke; mock/sandbox ile karıştırılmaz.

Her kabul kaydı komut, tarih, ortam, maskelenmiş kanıt, gerçek inceleyen ve PM'nin ayrı KABUL/RED kararını taşır.

