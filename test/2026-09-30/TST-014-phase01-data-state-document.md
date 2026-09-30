# TST-014 — Faz01 veri sahipliği ve durum geçişi belge kontrolü

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `8e872a7`
- Faz/görev: Faz01 / D02, D03, D07 karar hazırlığı
- Seviye: DOCUMENT / CONTRACT
- Çalıştıran: Codex

## Amaç

Veri sahipliği ve durum geçişi taslağının Faz01 kapsamını karşılamasını; onaylanmamış iş kararlarını teknik önerilerden açıkça ayırmasını doğrulamak.

## Kontroller

- Alan bazlı sahiplik tablosunda ürün/varyant, fiyat, stok, müşteri/cari, sipariş, ödeme, fatura, kargo, iade, tasarım ve teklif kapsamı aranır.
- Sipariş, ödeme, stok rezervasyonu ve teklif durumlarının ayrı yaşam döngüleri olarak tanımlandığı doğrulanır.
- D02, D03 ve D07 karar sahipleri ile açık karar listesinin bulunduğu doğrulanır.
- Teklif talebinin otomatik ödeme/sipariş olmadığı ve tekrar güvenliği değişmezleri aranır.
- Karar defterindeki D02/D03/D07 satırlarının yeni belgeye bağlandığı kontrol edilir.
- `git diff --check` ile biçimsel diff hatası aranır.

## Beklenen sonuç

Tüm zorunlu bölümler bulunmalı, öneriler müşteri onayı gibi yazılmamalı ve diff kontrolü hatasız tamamlanmalıdır.

## Gerçek sonuç

- Durum: BAŞARILI
- Zorunlu kapsam ve yaşam döngüsü bölümleri bulundu.
- D02/D03/D07 satırları karar defterinde belgeye bağlandı ve `Girdi bekliyor` durumunda korundu.
- İş sahibi tarafından verilmemiş kararlar `öneri` veya `bekliyor` olarak işaretlendi.
- `git diff --check`: başarılı.

## Etki

Faz01'in `alan-sahipliği-ve-durum-geçişleri` teslim taslağı hazırdır. Fiziksel SQL şeması ve ilgili iş modülleri, gerçek iş sahibi kararları olmadan kesinleştirilmez.
