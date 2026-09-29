# TST-010 — Uzak sunucu TCP 64019 erişimi

- Tarih/saat (Europe/Istanbul): 2026-09-29
- Commit/branch: `main` / `3da1c41`
- Faz/görev: Faz01 erişim envanteri / uzak SQL Server aday portu
- Seviye: CONNECTIVITY
- Ortam: macOS; dış ağ
- Çalıştıran: Codex

## Amaç

`109.104.120.91` adresindeki TCP `64019` portunun bu geliştirme bilgisayarından erişilebilir olup olmadığını doğrulamak.

## Komut

```text
nc -vz -G 10 109.104.120.91 64019
```

## Beklenen sonuç

TCP bağlantısının kurulması ve komutun sıfır çıkış koduyla tamamlanması.

## Gerçek sonuç

- Durum: BAŞARILI
- Çıkış kodu: `0`
- Mesaj: `Connection to 109.104.120.91 port 64019 [tcp/*] succeeded!`

## Hata ve düzeltme

Hata oluşmadı. Bu test yalnız TCP portunun açık olduğunu kanıtlar; portun SQL Server protokolü sunduğunu, kullanıcının doğrulandığını veya `XinobiYeniDB` erişimini henüz kanıtlamaz.

## Kanıt

Bu rapordaki komut ve güvenli bağlantı sonucu.

## Etki ve sonraki adım

Proje sahibinin onayıyla SQL Server bağlantısı `tcp:109.104.120.91,64019` üzerinden Keychain parolası kullanılarak denenmeli; sunucu adı, seçili veritabanı ve sürüm güvenli bir sorguyla doğrulanmalıdır.
