using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Xinobi.Api.Notifications;

namespace Xinobi.Architecture.Tests;

/// <summary>Keeps API tests on isolated files; no owner's catalog marker, accounts, notification worker or SQL queries.</summary>
public sealed class IsolatedApiFactory : WebApplicationFactory<Program>
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-isolated-api-" + Guid.NewGuid());

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["LocalCommerce:DataDirectory"] = directory,
            ["ConnectionStrings:Xinobi"] = "",
            ["Catalog:StorageProvider"] = "File",
            ["LocalCommerce:SeedFile"] = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../tests/fixtures/demo-commerce.json"))
        }));
        builder.ConfigureServices(services =>
        {
            foreach (var service in services.Where(x => x.ServiceType == typeof(IHostedService) && x.ImplementationType == typeof(NotificationWorker)).ToArray())
                services.Remove(service);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
