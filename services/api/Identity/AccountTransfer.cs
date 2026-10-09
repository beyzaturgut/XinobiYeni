using System.Text.Json;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.Identity;

/// <summary>
/// Which account store serves requests. Development keeps the file store until the one-time import writes the marker
/// (or <c>Accounts:StorageProvider</c> says otherwise); other environments use SQL only when it is configured explicitly.
/// </summary>
public static class AccountStorage
{
    public const string SqlServer = "SqlServer";
    public const string Marker = "accounts-sql.enabled";

    public static bool Configured(IConfiguration configuration) => configuration["Accounts:StorageProvider"] == SqlServer;

    public static bool UsesSql(IConfiguration configuration, string dataDirectory) =>
        Configured(configuration) || configuration["Accounts:StorageProvider"] is null && File.Exists(Path.Combine(dataDirectory, Marker));

    /// <summary>Account endpoints are rate limited wherever accounts are served (Development, or SQL accounts elsewhere).</summary>
    public static bool RateLimited(IHostEnvironment environment, IConfiguration configuration) => environment.IsDevelopment() || Configured(configuration);
}

/// <summary>Explicit offline operation: copies the Development account file into empty SQL tables, verifies, then switches.</summary>
public static class AccountTransfer
{
    public static async Task<int> Run(IServiceProvider services, bool activate)
    {
        var commerce = services.GetRequiredService<LocalCommerceStore>();
        var file = services.GetRequiredService<DevFileAccountStore>();
        var snapshot = await file.Export();
        var imported = await services.GetRequiredService<SqlAccountStore>().Import(snapshot);
        if (activate)
        {
            // A registration between export and switch would be lost; refuse instead of guessing.
            if (JsonSerializer.Serialize(await file.Export()) != JsonSerializer.Serialize(snapshot))
                throw new InvalidOperationException("Account file changed during import; SQL activation refused. Stop the API and review.");
            var marker = Path.Combine(commerce.DataDirectory, AccountStorage.Marker);
            await File.WriteAllTextAsync(marker + ".tmp", "SQL accounts imported and verified. identity/accounts.json is an archive.\n");
            File.Move(marker + ".tmp", marker, true);
        }
        // Counts only: no address, e-mail or token leaves this command.
        Console.WriteLine(JsonSerializer.Serialize(new { imported, verified = true, activated = activate }));
        return 0;
    }
}
