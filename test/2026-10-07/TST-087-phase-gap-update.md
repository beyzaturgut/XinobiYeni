# TST-087 — Faz dosyalarına eksiklik maddelerinin işlenmesi

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `0a18bba` üzerinde çalışma ağacı
- Faz/görev: Faz00–Faz11 plan revizyonu (kapsam–faz eksiklik incelemesi)
- Seviye: DOCUMENT / CONTRACT
- Ortam: LOCAL
- Çalıştıran: Claude Code

## Amaç

Kapsam, Analiz1/Analiz2 ve repo karşılaştırmasında bulunan eksiklerin ilgili faz dosyalarına doğru yerde işlendiğini, işaretlerin tutarlı olduğunu ve uygulama kodunun değişmediğini doğrulamak.

## Önkoşullar ve test verisi

Yalnız `Prompts/` belgeleri değişti. Uygulama kodu, migration, deploy ve dış sağlayıcı çağrısı yok. Yeni maddeler karar verilmiş gibi değil, `Açık` / `Bekliyor` / `Belirlenmedi` olarak yazıldı.

## Komut

```text
git diff --check
grep -c "React Native" Prompts/Faz05*.md
grep -l -- "<işaret>" Prompts/*.md   # D11–D14, T-01, T-12, ADR-003, 03.11, 03.12, 10.09A, 10.09B, 11.13, 11.16, ek zorunlu rol satırları
git diff --stat
```

## Beklenen sonuç

Whitespace hatası yok; Faz05'te React Native kalmamış; her yeni karar/görev işareti hem tanımlandığı hem başvurulduğu dosyada bulunur; yalnız 12 faz dosyası değişir.

## Gerçek sonuç

- Durum: BAŞARILI
- Özet: `git diff --check` temiz. Faz05 React Native sayısı 0 (Flutter/Dart, ADR-001). D11 Faz00/01/05/07/08/09/11; D12 Faz00/01; D13 Faz00/01/02/04; D14 Faz00/01/11; T-01–T-12 Faz00 (T-12 Faz03'te de); ADR-003 ve 03.11 Faz00/03; 10.09A/B Faz10; 11.13–11.16 Faz11. Web Designer ek rol satırı Faz02/04/06/11, CTO Advisor ek rol satırı Faz01/03/10/11. 12 dosya, 137 ekleme / 25 silme.

## İşlenen maddeler

- Faz00: Analiz2 ve panel dokümanı kaynak sırası; Web Designer/CTO Advisor ek zorunlu rol ve §7 sütunları; §3.1 sabitlenecek teknik kararlar T-01–T-12; D11–D14 ve karar son tarihi kuralı; takvim tablosu; 37 commitlik kayıt açığı; ADR-003 ve ADR-002 istisnası; plan–kod sapma kaydı.
- Faz01: 15–19 (takvim/sprint, D11 mevzuat, mevcut veri/geçiş envanteri, kalite hedefleri/maliyet, K-13/Desenler/panel kapsam kararı); F01-T07/T08.
- Faz02: onay kaydı açığı, eksik ekran aileleri, `a11y-audit.md` eksikliği.
- Faz03: genişletilmiş izin listesi; 03.11 dosya deposundan SQL Server'a geçiş; 03.12 teknik ADR'ler; mevcut durum notu.
- Faz04: medya kütüphanesi, iletişim formu, Desenler (D13), ilk katalog yüklemesi, 301 haritası, kapsam sınırı.
- Faz05: React Native düzeltmesi; mesafeli satış/ön bilgilendirme onayı, İYS, ETBİS/e-Fatura bağı; 3DS, taksit, iade, banka hesabı; kargo ücret kuralları; push sunucu tarafı; tablolar ve testler.
- Faz06: kullanıcı yüklemesinde hak beyanı ve içerik moderasyonu.
- Faz07: kurumsal müşteri başvurusu; teklifsiz toplu sipariş modeli (D07 a/b); F07-T11/T12.
- Faz08: e-Fatura/e-Arşiv (D11); ilk yükleme ve geçiş mutabakatı.
- Faz09: mevcut ilan eşlemesi ve geçiş günü stok yazma devri.
- Faz10: erken Cloudflare entegrasyonu notu; soru havuzu veri modeli ve panel yönetimi (10.09A); özellik bayrağı (10.09B).
- Faz11: teknik dokümantasyon listesi, cutover planı, güvenlik/yük testi, bakım/destek devri, D11 UAT satırı.

## Kanıt

`git diff -- Prompts/` ve bu rapor.

## Etki ve sonraki adım

Plan belgeleri güncellendi; hiçbir faz durumu değişmedi. Sonraki tek adım: Faz00 kayıt açığındaki 37 commiti oturum kaydına ve `test/INDEX.md`'ye geri doldurmak, ardından ADR-003 ve ADR-002 istisnasını yazmak.
