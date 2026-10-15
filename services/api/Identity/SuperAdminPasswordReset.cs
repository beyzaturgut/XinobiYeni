using System.Security.Cryptography;
using System.Text;

namespace Xinobi.Api.Identity;

/// <summary>Emergency, console-only password recovery for an existing super administrator.</summary>
public static class SuperAdminPasswordReset
{
    public const string Command = "reset-super-admin-password";
    public const string RecoveryFlag = "Identity:SuperAdminRecoveryEnabled";

    public static async Task<int> Run(
        IAccountStore accounts,
        string email,
        bool isProduction,
        bool recoveryEnabled,
        TextReader confirmationInput,
        TextWriter output,
        Func<string> readHiddenPassword)
    {
        try
        {
            var normalized = AccountRules.NormalizeEmail(email);
            if (isProduction && !recoveryEnabled)
            {
                output.WriteLine($"Üretimde kurtarma kapalı. Geçici olarak {RecoveryFlag}=true ayarlanmalı.");
                return 5;
            }
            if (isProduction)
            {
                output.Write("Üretim hesabını sıfırlamak için RESET yazın: ");
                if (!string.Equals(await confirmationInput.ReadLineAsync(), "RESET", StringComparison.Ordinal))
                {
                    output.WriteLine("Onay verilmedi; değişiklik yapılmadı.");
                    return 6;
                }
            }

            output.Write("Yeni parola: ");
            var password = readHiddenPassword();
            output.WriteLine();
            output.Write("Yeni parolayı tekrar girin: ");
            var confirmation = readHiddenPassword();
            output.WriteLine();
            if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(password), Encoding.UTF8.GetBytes(confirmation)))
            {
                output.WriteLine("Parolalar eşleşmiyor; değişiklik yapılmadı.");
                return 7;
            }
            AccountRules.ValidatePassword(password);
            if (!await accounts.ResetPasswordForRole(normalized, Roles.SuperAdmin, password))
            {
                output.WriteLine("Bu e-postaya ait super_admin hesabı yok; değişiklik yapılmadı.");
                return 3;
            }
            output.WriteLine("Süper yönetici parolası sıfırlandı ve tüm aktif oturumlar iptal edildi.");
            return 0;
        }
        catch (AccountException error)
        {
            output.WriteLine(error.Message);
            return 1;
        }
        catch (AccountUnavailableException)
        {
            output.WriteLine("Bu ortamda hesap deposu kullanılamıyor.");
            return 4;
        }
    }

    public static string ReadHiddenPassword()
    {
        if (Console.IsInputRedirected) throw new InvalidOperationException("Parola etkileşimli konsoldan girilmelidir.");
        var value = new StringBuilder();
        while (Console.ReadKey(intercept: true) is var key && key.Key != ConsoleKey.Enter)
        {
            if (key.Key == ConsoleKey.Backspace)
            {
                if (value.Length > 0) value.Length--;
            }
            else if (!char.IsControl(key.KeyChar)) value.Append(key.KeyChar);
        }
        return value.ToString();
    }
}
