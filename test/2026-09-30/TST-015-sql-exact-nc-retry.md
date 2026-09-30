# TST-015 — Bildirilen tam `nc` komutuyla SQL port tekrarı

- Tarih (Europe/Istanbul): 2026-09-30
- Commit/branch: `main` / `2abb59e`
- Faz/görev: Faz01 SQL ortam erişimi
- Seviye: CONNECTIVITY
- Ortam: macOS → `109.104.120.91:64019`
- Çalıştıran: Codex

## Amaç ve komut

Kullanıcının verdiği komutu seçenek eklemeden tekrar çalıştırmak:

```text
nc -vz 109.104.120.91 64019
```

## Beklenen sonuç

TCP bağlantısının hemen başarılı olması ve `succeeded` çıktısı.

## Gerçek sonuç

- Durum: BLOKE
- Komut 30 saniye içinde başarı veya ret yanıtı üretmedi.
- Önceki süre sınırlı aynı uç nokta testi `Operation timed out` vermişti.
- SQL oturumu, sorgu veya veritabanı yazımı yapılmadı.

## Etki ve sonraki adım

TST-012'de kanıtlanan SQL kullanıcı/veritabanı erişimi geçerlidir; mevcut sorun dış TCP erişiminin sürekliliğidir. Sunucu/NAT/firewall erişimi döndüğünde TST-013 salt okunur metadata sorgusu tekrarlanmalıdır.
