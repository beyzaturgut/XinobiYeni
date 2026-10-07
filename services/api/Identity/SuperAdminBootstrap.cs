namespace Xinobi.Api.Identity;

/// <summary>
/// First super administrator (Faz03 03.04). Runs only from the server console — never over HTTP — and only while no super
/// administrator exists; later staff roles are granted from the panel by a super administrator. The account must already
/// exist, which means its e-mail was verified at registration.
/// <code>dotnet Xinobi.Api.dll bootstrap-super-admin owner@example.com</code>
/// </summary>
public static class SuperAdminBootstrap
{
    public const string Command = "bootstrap-super-admin";

    public static async Task<int> Run(IAccountStore accounts, string email, TextWriter output)
    {
        try
        {
            var normalized = AccountRules.NormalizeEmail(email);
            if (await accounts.AnyWithRole(Roles.SuperAdmin))
            {
                output.WriteLine("Bir süper yönetici zaten var; yeni yetkiler panelden verilir. Değişiklik yapılmadı.");
                return 2;
            }
            if (await accounts.AssignRole(normalized, Roles.SuperAdmin) is null)
            {
                output.WriteLine($"{normalized} ile kayıtlı hesap yok. Önce bu e-postayla üye ol, sonra komutu tekrar çalıştır.");
                return 3;
            }
            output.WriteLine($"{normalized} süper yönetici yapıldı ({DateTimeOffset.UtcNow:O}).");
            return 0;
        }
        catch (AccountException error)
        {
            output.WriteLine(error.Message);
            return 1;
        }
        catch (AccountUnavailableException)
        {
            output.WriteLine("Bu ortamda hesap deposu yok (SQL Server kimlik deposu, Faz03 03.11).");
            return 4;
        }
    }
}
