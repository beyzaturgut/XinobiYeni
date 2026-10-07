# TST-101 — Mobil favoriler

- Tarih/saat (Europe/Istanbul): 07.10.2026
- Commit/branch: `main` / `a216b1e` üzerinde çalışma ağacı
- Faz/görev: Faz11 erken hazırlık (mobil), web `/favoriler` ile eşdeğer
- Seviye: UNIT / WIDGET / E2E (emülatör, proje sahibinin dev API'si 5003)
- Çalıştıran: Claude Code

## Yapılanlar

- `features/favorites/favorites.dart`: web ile aynı anahtar (`xinobi-demo-favorites`) ve biçim (ürün kimliği listesi), cihazda; en çok 200, en yeni başta; yayından kalkan ürün listede açıklamayla kalır ve çıkarılabilir.
- Kalp düğmesi ürün kartında (ana sayfa, ürünler; XINOBI U seçim ızgarasında yok) ve ürün sayfasının üst çubuğunda; kartın birleşik ekran okuyucu etiketinden ayrı, kendi etiketiyle.
- `/favoriler` sayfası; Hesap sekmesinden giriş yapılmış veya yapılmamış her durumda erişilir.

## Komut ve sonuç

```text
flutter analyze                → temiz
flutter test                   → 30/30 (5 yeni: biçim, karttan ekle/listeden çıkar, ürün sayfası, yayından kalkan ürün, Hesap bağlantısı)
Emülatör (Pixel_8, API 5003)   → Ürünler'de kalp → "favorilerden çıkar" etiketi; Hesap "Favorilerim · 1 ürün" → listede ürün
```

- Durum: **BAŞARILI**. Sunucuya yazım yok.

## Açık

- Favoriler hesaba bağlı değil; web ve mobil arasında paylaşılmaz (web de yalnız tarayıcıda tutuyor). Hesaba taşıma SQL kimlik deposuyla (03.11).
