using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Xinobi.Architecture.Tests;

/// <summary>Server-only settings outside the deployed api folder survive a redeploy and override the packaged defaults.</summary>
public sealed class ServerSettingsTests : IDisposable
{
    private readonly string file = Path.Combine(Path.GetTempPath(), "xinobi-server-settings-" + Guid.NewGuid() + ".json");

    [Fact]
    public void ProductionReadsTheServerSettingsFileButEnvironmentVariablesStillWin()
    {
        File.WriteAllText(file, """{ "ServerSettingsProbe": { "FromFile": "server", "Overridden": "server" } }""");
        Environment.SetEnvironmentVariable("XINOBI_SERVER_SETTINGS", file);
        Environment.SetEnvironmentVariable("ServerSettingsProbe__Overridden", "environment");
        try
        {
            using var factory = new IsolatedApiFactory().WithWebHostBuilder(builder => builder.UseEnvironment("Production"));
            var configuration = factory.Services.GetRequiredService<IConfiguration>();
            Assert.Equal("server", configuration["ServerSettingsProbe:FromFile"]);
            Assert.Equal("environment", configuration["ServerSettingsProbe:Overridden"]);
        }
        finally
        {
            Environment.SetEnvironmentVariable("XINOBI_SERVER_SETTINGS", null);
            Environment.SetEnvironmentVariable("ServerSettingsProbe__Overridden", null);
        }
    }

    public void Dispose()
    {
        if (File.Exists(file)) File.Delete(file);
    }
}
