# TST-052 — Faz02 navigasyon smoke

- Tarih: 2026-10-01
- Başlangıç commit: `ed95092`
- Tarayıcı: Yerel Google Chrome, Playwright 1.55.1

## Kapsam

- `/`: header, CTA ve footer iç sayfa hedefleri ile dahili rotalar.
- `/xinobi/`: kurumsal menü anchor hedefleri, CTA ve alt menü rotaları.
- `/yasal/`: yasal menü anchor hedefleri ve geri dönüş rotaları.

Test her `#hedef` için aynı belgede tam bir hedef bulunduğunu, her dahili rota için HTTP yanıtının başarılı olduğunu doğrular.

## Sonuç

- `pnpm --filter web exec playwright test tests/e2e/navigation.spec.ts` — 3/3 başarılı, 2.6 saniye.
- Kırık iç hedef veya başarısız dahili rota bulunmadı.
- `pnpm --filter web lint && pnpm --filter web test:e2e` — lint başarılı; axe, klavye, etkileşim ve navigasyon dahil 43/43 test başarılı, 48.2 saniye.

## Faz02 değerlendirmesi

Plan-kod karşılaştırması `design/faz02-open-acceptance.md` içinde kaydedildi. Web prototip otomasyonu başarılı olsa da panel, Flutter mobil ekranları, ayrıntılı spec/handoff, gerçek cihaz ve gerçek rol/PM kabulü eksik olduğundan Faz02 kapatılmadı.

## Deployment

Yeni deploy paketi oluşturulmadı ve IIS yayını değiştirilmedi.
