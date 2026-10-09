using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Xinobi.Api.Infrastructure;
using Xinobi.Persistence;

namespace Xinobi.Architecture.Tests;

/// <summary>Feature documents in ops.FeatureDocuments: concurrent writers from separate store instances (as separate API processes) never lose updates.</summary>
public sealed class SqlFeatureDocumentTests
{
    private sealed record Counter(int Value, List<string> Marks);

    private sealed class Production : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Production;
        public string ApplicationName { get; set; } = "Xinobi.Api";
        public string ContentRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    }

    [Fact]
    public async Task WithoutSqlOutsideDevelopmentTheFeatureIsUnavailable()
    {
        var configuration = new ConfigurationBuilder().Build();
        var documents = new FeatureDocuments(new Production(), configuration, new ServiceCollection().BuildServiceProvider().GetRequiredService<IServiceScopeFactory>());
        var store = documents.Open("test/counter.json", () => new Counter(0, []), "Sayaç");
        Assert.Equal(503, (await Assert.ThrowsAsync<ProblemException>(() => store.Read())).Status);
    }

    [EmptySqlAccountsFact]
    public async Task ConcurrentWritersAreSerialised()
    {
        var services = new ServiceCollection();
        services.AddXinobiPersistence(Environment.GetEnvironmentVariable("XINOBI_TEST_SQL")!);
        await using var provider = services.BuildServiceProvider();
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Features:StorageProvider"] = "SqlServer" }).Build();
        var scopes = provider.GetRequiredService<IServiceScopeFactory>();
        FeatureDocuments Process() => new(new Production(), configuration, scopes);
        const string file = "test/xinobi-test-counter.json";
        await using var scope = provider.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<XinobiDbContext>();
        Assert.False(await db.FeatureDocuments.AnyAsync(x => x.Name == "xinobi-test-counter"));
        try
        {
            var stores = Enumerable.Range(0, 3).Select(_ => Process().Open(file, () => new Counter(0, []), "Sayaç")).ToArray();
            Assert.Equal(0, (await stores[0].Read()).Value);
            await Task.WhenAll(Enumerable.Range(0, 12).Select(i => stores[i % 3].Update(state => { state.Marks.Add("m" + i); return 0; })));
            Assert.Equal(12, (await stores[1].Read()).Marks.Distinct().Count());
            // A change that throws is not saved.
            await Assert.ThrowsAsync<InvalidOperationException>(() => stores[2].Update<int>(state => { state.Marks.Clear(); throw new InvalidOperationException("abort"); }));
            Assert.Equal(12, (await stores[0].Read()).Marks.Count);
        }
        finally
        {
            await db.FeatureDocuments.Where(x => x.Name == "xinobi-test-counter").ExecuteDeleteAsync();
        }
    }
}
