# TST-013 — Uzak SQL Server erişilebilirlik tekrar kontrolü

- Tarih/saat (Europe/Istanbul): 2026-09-30 09:26
- Commit/branch: `main` / `8e872a7`
- Faz/görev: Faz01 ortam envanteri / SQL Server süreklilik kontrolü
- Seviye: CONNECTIVITY / INTEGRATION
- Ortam: macOS; Microsoft `sqlcmd`; uzak TCP `109.104.120.91:64019`
- Çalıştıran: Codex

## Amaç

TST-012'de başarıyla doğrulanan `xinobiyeni_app` bağlantısı üzerinden SQL Server sürümü, veritabanı durumu, mevcut şema ve uygulama hesabı yetkilerini salt okunur olarak envanterlemek.

## Güvenlik ve komut özeti

- Parola yalnız macOS Keychain'den süreç ortamına alındı; çıktıya veya rapora yazılmadı.
- İlk deneme salt okunur sunucu/veritabanı metadata sorgusuydu.
- Kimlik doğrulama hatası ile ağ erişim hatasını ayırmak için ardından yalnız TCP port kontrolü yapıldı.

```text
SQLCMDPASSWORD=<keychain> sqlcmd -S tcp:109.104.120.91,64019 -d XinobiYeniDB -U xinobiyeni_app -C -l 15 -Q <read-only-inventory-query>
nc -vz -G 10 109.104.120.91 64019
```

## Beklenen sonuç

SQL oturumunun açılması ve veritabanı metadata sorgularının dönmesi; TCP portunun erişilebilir olması.

## Gerçek sonuç

- Durum: BLOKE
- `sqlcmd`: login aşamasına ulaşmadan `Login timeout expired` ve TCP `0x102`.
- TCP kontrolü: `Operation timed out`.
- Parola reddi veya veritabanı yetki hatası alınmadı.
- Veritabanına yazma ve migration yapılmadı.

## Değerlendirme

TST-012, aynı uç nokta ve kullanıcıyla SQL Authentication ile `XinobiYeniDB` erişimini daha önce başarıyla kanıtlamıştır. Bu tekrarın sonucu hesabın geçersiz olduğunu değil, uzak TCP erişiminin şu anda kullanılamadığını veya süreksiz olduğunu gösterir. Sunucu/NAT/firewall çalışma süresi doğrulanmadan migration başlatılmamalıdır.

## Sonraki güvenli adım

Sunucu ve SQL Server servisi açıkken dış TCP 64019 yönlendirmesini tekrar doğrula; ardından aynı salt okunur envanter sorgusunu çalıştır. Başarıdan sonra mevcut tablo/migration geçmişi ve yetkiler incelenmeden şema yazımı yapma.
