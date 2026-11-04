using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Orders;
using Xinobi.Api.Shipping;

namespace Xinobi.Architecture.Tests;

public sealed class SuratCancellationTests
{
    [Theory]
    [InlineData("received")]
    [InlineData("preparing")]
    public async Task Atomic_reservation_and_cancellation_have_only_one_winner_and_survive_reload(string status)
    {
        var directory = Path.Combine(Path.GetTempPath(), "surat-cancel-" + Guid.NewGuid());
        try
        {
            string id, owner;
            using (var factory = new IsolatedApiFactory(directory))
            {
                var accounts = factory.Services.GetRequiredService<IAccountStore>();
                owner = (await accounts.Register("Fixture", "race@example.invalid", "fixture-password-123")).Id;
                var order = new CustomerOrder(Guid.NewGuid().ToString("N"), "FIXTURE", DateTimeOffset.UtcNow, status,
                    new("A", "Test", "Test alıcı", "5550000000", "İstanbul", "Test", "Test adres", null, true), [], new(100, "TRY"));
                id = order.Id;
                await accounts.PlaceOrder(owner, "race", () => order);
                async Task<bool> Attempt(Func<CustomerOrder, CustomerOrder> change)
                {
                    try { await accounts.ChangeOrder(null, id, change); return true; }
                    catch (ProblemException) { return false; }
                }
                var results = await Task.WhenAll(Task.Run(() => Attempt(o => SuratShipmentWorkflow.Reserve(o, new(1, 3, 2, 1), DateTimeOffset.UtcNow))),
                    Task.Run(() => Attempt(o => OrderLifecycle.Cancel(o, new("Fikrimi değiştirdim", null), DateTimeOffset.UtcNow))));
                Assert.Single(results, x => x);
                // A preparing order creates a pending cancellation instead of closing immediately.
                // Either outcome must reject a later shipment reservation.

            }
            using (var factory = new IsolatedApiFactory(directory))
            {
                var accounts = factory.Services.GetRequiredService<IAccountStore>();
                var order = Assert.Single(await accounts.Orders(owner));
                if (order.Status == OrderStatuses.Cancelled || order.Requests?.Any(r => r.Type == "cancel") == true)
                    Assert.Throws<ProblemException>(() => SuratShipmentWorkflow.Reserve(order, new(1, 3, 2, 1), DateTimeOffset.UtcNow));
                else
                {
                    Assert.Throws<ProblemException>(() => OrderLifecycle.Cancel(order, new("Fikrimi değiştirdim", null), DateTimeOffset.UtcNow));
                    Assert.Throws<ProblemException>(() => OrderLifecycle.Ship(order, "Sürat Kargo", "FIXTURE-TRACK", null, DateTimeOffset.UtcNow));
                    Assert.Throws<ProblemException>(() => OrderLifecycle.SetStatus(order, OrderStatuses.Cancelled, null, DateTimeOffset.UtcNow));
                }
            }
        }
        finally { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
    }
}
