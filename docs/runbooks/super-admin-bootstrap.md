# İlk süper yönetici kurulumu (Faz03 03.04)

Panelin ilk süper yöneticisi HTTP üzerinden değil, yalnız sunucu konsolundan atanır. Komut, hiç süper yönetici yokken bir kez çalışır; sonraki personel rolleri panelden, süper yönetici tarafından verilir (`settings.staff`).

1. Atanacak kişi web veya mobilde normal üyelik açar. Üyelik e-posta doğrulaması ister; böylece adresin sahibi olduğu kanıtlanır.
2. Sunucuda, API ile aynı ortam ve yapılandırmayla:

   ```bash
   # Geliştirme (repo kökünden)
   dotnet run --project services/api/Xinobi.Api.csproj --launch-profile http -- bootstrap-super-admin sahip@ornek.com
   # Yayınlanmış paket
   dotnet Xinobi.Api.dll bootstrap-super-admin sahip@ornek.com
   ```

3. Çıkış kodları: `0` atandı · `1` geçersiz e-posta · `2` zaten bir süper yönetici var, değişiklik yok · `3` bu e-postayla hesap yok · `4` bu ortamda hesap deposu yok (SQL Server kimlik deposu 03.11'e kadar yalnız Development).
4. Çıktıyı değişiklik kaydına ekle. Atama, mevcut oturumda bir sonraki istekte geçerli olur; yeniden giriş gerekmez.

Yetkiler sunucuda denetlenir: uç noktalar `RequirePermission("kaynak.işlem")` ile korunur; varsayılan kural oturum açmış hesap ister, herkese açık alanlar `AllowAnonymous` ile tek tek işaretlenir ve `AuthorizationTests.OnlyListedAreasArePublic` listesiyle denetlenir. Panelde menü gizlemek yetki sayılmaz.
