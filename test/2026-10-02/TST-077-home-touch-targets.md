# TST-077 — Ana sayfa dokunma alanları

02.10.2026 · Kaynak HEAD acc0c99; CSS/test değişiklikleri çalışma ağacında.

- Slider düğmeleri 44×44 px; görünen noktalar desktop 9 px, mobil 7 px pseudo-element ile korundu.
- Mobil arama/sepet ve menü summary hedefleri en az 44×44 px.
- Yeni beş Playwright senaryosu: 320/390/768/1024/1440 px, düğme kenarından seçim, doğru slide görseli, Enter/Tab/Space, mobil header ölçüsü ve yatay taşma.
- `pnpm --filter web build`: başarılı, 23/23 statik sayfa.
- `pnpm --filter web lint`: başarılı.
- `pnpm --filter web test:e2e`: 48/48 başarılı (1.1 dakika); mevcut 43 test dahil.
- `git diff --check`: başarılı.
- HND-02 kapsamında incelenen kontroller düzeltildi. Fiziksel telefon/VoiceOver/TalkBack kabulü açık.
- Deploy yapılmadı, paket yenilenmedi. acc0c99 ZIP bu son CSS değişikliğini içermez.
