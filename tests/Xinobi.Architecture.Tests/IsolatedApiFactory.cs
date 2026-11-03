using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Xinobi.Api.Notifications;
using Xinobi.Api.Identity;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Xinobi.Architecture.Tests;

/// <summary>Keeps API tests on isolated files; no owner's catalog marker, accounts, notification worker or SQL queries.</summary>
public sealed class IsolatedApiFactory : WebApplicationFactory<Program>
{
    private readonly string? sharedDirectory;
    private readonly string directory;
    private readonly bool seedDemo;
    public IsolatedApiFactory() : this(null) { }
    internal IsolatedApiFactory(string? sharedDirectory, bool seedDemo = true)
    {
        this.sharedDirectory = sharedDirectory;
        this.seedDemo = seedDemo;
        directory = sharedDirectory ?? Path.Combine(Path.GetTempPath(), "xinobi-isolated-api-" + Guid.NewGuid());
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureLogging(logging => logging.ClearProviders());
        builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["LocalCommerce:DataDirectory"] = directory,
            ["ConnectionStrings:Xinobi"] = "",
            ["Catalog:StorageProvider"] = "File",
            ["LocalCommerce:SeedFile"] = seedDemo ? Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../tests/fixtures/demo-commerce.json")) : null
        }));
        builder.ConfigureServices((context, services) =>
        {
            // Program loads appsettings.Local.json after ConfigureAppConfiguration.
            // Reassert isolation after that load, before any stores/workers resolve.
            if (context.HostingEnvironment.IsDevelopment())
            {
                context.Configuration["LocalCommerce:DataDirectory"] = directory;
                context.Configuration["LocalCommerce:SeedFile"] = seedDemo ? Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../tests/fixtures/demo-commerce.json")) : null;
                context.Configuration["ConnectionStrings:Xinobi"] = "";
                context.Configuration["Catalog:StorageProvider"] = "File";
                context.Configuration["Accounts:StorageProvider"] = "File";
                context.Configuration["Features:StorageProvider"] = "File";
                services.RemoveAll<IAccountStore>();
                services.AddSingleton<IAccountStore>(provider => provider.GetRequiredService<DevFileAccountStore>());
            }
            foreach (var service in services.Where(x => x.ServiceType == typeof(IHostedService) && (x.ImplementationType == typeof(NotificationWorker) || x.ImplementationType == typeof(Xinobi.Api.Shipping.SuratTrackingWorker))).ToArray())
                services.Remove(service);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing && sharedDirectory is null && Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
