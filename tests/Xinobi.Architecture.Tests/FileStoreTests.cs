using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Architecture.Tests;

/// <summary>Local file storage: flat keys per area, atomic writes, and no storage (503) where none is configured.</summary>
public sealed class FileStoreTests : IDisposable
{
    private readonly string root = Path.Combine(Path.GetTempPath(), "xinobi-file-store-test-" + Guid.NewGuid());

    private sealed class Host(string name) : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = name;
        public string ApplicationName { get; set; } = "Xinobi.Api";
        public string ContentRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = Path.GetTempPath();
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    }

    [Fact]
    public async Task FilesAreSavedOpenedAndDeletedInTheirArea()
    {
        var store = new LocalFileStore(root);
        await store.Save(FileAreas.Designs, "abc.png", new MemoryStream([1, 2, 3]), "image/png");
        // Same layout as before the store existed, so earlier Development files are found.
        Assert.True(File.Exists(Path.Combine(root, "designs", "files", "abc.png")));
        Assert.Empty(Directory.GetFiles(Path.Combine(root, "designs", "files"), "*.tmp"));
        await using (var file = (await store.Open(FileAreas.Designs, "abc.png"))!)
        {
            Assert.Equal(("image/png", 3L), (file.ContentType, file.Length));
        }
        Assert.Null(await store.Open(FileAreas.Media, "abc.png"));
        await store.Delete(FileAreas.Designs, "abc.png");
        Assert.Null(await store.Open(FileAreas.Designs, "abc.png"));
    }

    [Theory]
    [InlineData("media", "../state.json")]
    [InlineData("media", "a/b.png")]
    [InlineData("media", "..png")]
    [InlineData("media", "")]
    [InlineData("other", "a.png")]
    public async Task KeysCannotLeaveTheirArea(string area, string key) =>
        await Assert.ThrowsAsync<ArgumentException>(() => new LocalFileStore(root).Save(area, key, new MemoryStream([1]), "image/png"));

    [Fact]
    public async Task OutsideDevelopmentStorageMustBeConfigured()
    {
        Assert.Null(FileStorage.LocalRoot(new Host(Environments.Production), new ConfigurationBuilder().Build()));
        var configured = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Storage:LocalRoot"] = root }).Build();
        Assert.Equal(Path.GetFullPath(root), FileStorage.LocalRoot(new Host(Environments.Production), configured));
        Assert.Equal(503, (await Assert.ThrowsAsync<ProblemException>(() => new UnavailableFileStore().Open(FileAreas.Media, "a.png"))).Status);
    }

    public void Dispose()
    {
        if (Directory.Exists(root)) Directory.Delete(root, true);
    }
}
