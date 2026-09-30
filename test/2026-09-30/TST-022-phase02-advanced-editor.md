# TST-022 — Faz02 WEB-006 gelişmiş editör kabuğu

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `525d4fc` sonrası çalışma ağacı
- Faz/görev: Faz02 / WEB-006 gelişmiş editör
- Seviye: STATIC / BUILD / SMOKE / INTERACTION CONTRACT
- Ortam: Next.js 16.3.6, React 19.2.8, production build ve yerel HTTP
- Çalıştıran: Codex

## Amaç

D04 baskı standardı ve kalıcı API sözleşmeleri uydurulmadan gelişmiş editörün responsive araç, tuval, yüz seçimi, katman ve özellik paneli kabuğunu doğrulamak.

## Uygulanan kapsam

- `/urunler/cay-makinesi-101/editor` statik gelişmiş editör rotası.
- Metin ve şekil katmanı ekleme; seçme, görünürlük ve kilit durumları.
- Ön/arka yüz seçimi ve temsili tasarım alanı.
- Masaüstü üç kolon, tablet iki bölüm ve telefon sıralı araç düzeni.
- Demo taslak geri bildirimi ve açık D04/API kısıtları.
- Basit ve gelişmiş kişiselleştirme arasında çift yönlü gezinme.

## Komutlar

```text
pnpm --filter web lint
node node_modules/next/dist/bin/next build
node node_modules/next/dist/bin/next start -p 3010
curl http://127.0.0.1:3010/urunler/cay-makinesi-101/editor
```

## Gerçek sonuç

- İlk lint: BAŞARISIZ; `API'si` metnindeki kaçırılmamış apostrof `react/no-unescaped-entities` hatası üretti.
- Düzeltme: apostrof `&apos;` HTML varlığına çevrildi.
- İkinci lint: BAŞARILI.
- TypeScript ve production build: BAŞARILI; 8/8 statik sayfa üretildi.
- Editör route HTTP/metadata ve kritik güvenlik metinleri smoke test ile doğrulandı.

## Güvenli sınırlar

- Ürün fotoğrafındaki alan gerçek baskı koordinatı veya ölçüsü olarak sunulmaz.
- Görsel yükleme ve şablon eylemleri API/veri olmadan devre dışıdır.
- Konum/boyut değerleri D04 olmadan üretilmez.
- Sepete aktarım, baskı doğrulaması, fiyat ve stok olmadan devre dışıdır.
- Demo taslağı sunucuda kalıcı kayıt iddiasında bulunmaz.

## Açık testler

- Gerçek tarayıcıda klavye, ekran okuyucu, dokunma ve responsive görsel QA.
- API sonrası yükleme hata/yeniden deneme, kalıcı DesignVersion ve 409 çakışma davranışı.
- D04 sonrası gerçek baskı alanı, taşma, DPI ve çıktı karşılaştırması.

## Sonraki adım

WEB-007 sepet/ödeme tasarım kabuğu veya ekran envanterindeki sıraya göre eksik WEB-003 arama/karşılaştırma kabuğu ele alınmadan önce WEB-006 kullanıcı görsel geri bildirimi alınır.
