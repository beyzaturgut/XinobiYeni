# TST-102 — Mobil header revizyonu ve haber/duyurular

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `9b07d43` üzerinde çalışma ağacı
- Faz/görev: Faz11 erken hazırlık (mobil); DES-MOB-01 rev.1 (proje sahibi talebi)
- Seviye: WIDGET / E2E (emülatör, proje sahibinin dev API'si 5003)
- Çalıştıran: Claude Code

## Yapılanlar

- Header: arama kutusu kaldırıldı; logo solda, sağda Favorilerim ve Haber ve duyurular düğmeleri. Arama Ürünler sekmesinde kaldı.
- Duyurular mevcut sözleşmeden (`GET /api/v1/content/announcements`, panelden yayımlanan) okunur; `/duyurular` sayfası en yeniden eskiye tür · tarih, başlık, metin gösterir. Sözleşme ve API değişmedi.
- Rozet okunmamış duyuru sayısıdır (web toplam sayıyı gösterir): görülen kimlikler cihazda (`xinobi-seen-announcements`) tutulur; sayfa açılınca hepsi okunmuş sayılır, "Yeni" etiketi o ziyaret boyunca kalır. API'ye ulaşılamazsa rozet gösterilmez, sayfada "Tekrar dene" çıkar.
- Erişilebilirlik: rozet sayısı düğmenin adını ("1") ezmesin diye ekran okuyucudan gizlendi; ad "Haber ve duyurular, 1 yeni". Emülatörde bulundu, testle korunuyor.

## Komut ve sonuç

```text
flutter analyze                 → temiz
flutter test                    → 34/34 (4 yeni: header düğmeleri, okunmamış rozeti + okundu, boş liste, API hatası)
Emülatör (Pixel_8, API 5003)    → header "Haber ve duyurular, 1 yeni" → sayfada panelden gelen duyuru "Yeni" etiketiyle → geri dönünce rozet yok
```

- Durum: **BAŞARILI**.
