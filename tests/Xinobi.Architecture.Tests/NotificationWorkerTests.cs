using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Notifications;

namespace Xinobi.Architecture.Tests;

/// <summary>Outbox delivery claims items before sending, so overlapping workers never send one message twice. A fake sender; nothing leaves.</summary>
public sealed class NotificationWorkerTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-notification-worker-test-" + Guid.NewGuid());

    private sealed class Development(string root) : IWebHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Development;
        public string ApplicationName { get; set; } = "Xinobi.Api";
        public string ContentRootPath { get; set; } = root;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string WebRootPath { get; set; } = root;
        public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
    }

    private sealed class SlowEmail : INotificationChannelSender
    {
        public int Sent;
        public string Channel => NotificationChannels.Email;
        public bool IsConfigured => true;
        public async Task<NotificationResult> Send(NotificationItem item, string[] deviceTokens, CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref Sent);
            await Task.Delay(100, cancellationToken);
            return NotificationResult.Sent();
        }
    }

    [Fact]
    public async Task OverlappingRoundsSendEachMessageOnce()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["LocalCommerce:DataDirectory"] = directory }).Build();
        var documents = new FeatureDocuments(new Development(directory), configuration, new ServiceCollection().BuildServiceProvider().GetRequiredService<IServiceScopeFactory>());
        var email = new SlowEmail();
        var center = new NotificationCenter(documents, configuration, TimeProvider.System, [email]);
        var account = new AccountRecord(Guid.NewGuid().ToString("N"), "Ayşe", "ayse@xinobi.com.tr", "", DateTimeOffset.UtcNow);
        for (var i = 0; i < 5; i++) await center.Notify(account, "order_placed", "Siparişin alındı", "Teşekkürler", null);

        var attempted = await Task.WhenAll(Enumerable.Range(0, 4).Select(_ => center.DeliverDue(CancellationToken.None)));
        Assert.Equal(5, attempted.Sum());
        Assert.Equal(5, email.Sent);
        Assert.Equal(0, await center.DeliverDue(CancellationToken.None));
    }

    public void Dispose()
    {
        if (Directory.Exists(directory)) Directory.Delete(directory, true);
    }
}
