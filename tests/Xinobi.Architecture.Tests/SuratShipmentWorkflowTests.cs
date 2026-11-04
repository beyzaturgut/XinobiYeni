using System.Net;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Shipping;

namespace Xinobi.Architecture.Tests;

public sealed class SuratShipmentWorkflowTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-surat-workflow-" + Guid.NewGuid());
    private IsolatedApiFactory Factory() => new(directory);
    private static CustomerOrder Order() => new(Guid.NewGuid().ToString("N"), "FIXTURE-1", DateTimeOffset.UtcNow, OrderStatuses.Received,
        new("address", "Test", "Test Alıcı", "5550000000", "İstanbul", "Test ilçe", "Test sokak", null, true), [], default!);
    private static readonly CreateSuratShipment Input = new(1, 3, 2, 1);
    private sealed class Client : ISuratKargoClient
    {
        public int Calls;
        public bool Ambiguous;
        public readonly TaskCompletionSource Started = new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource? Release;
        public Func<SuratShipment, Task>? BeforeSend;
        public async Task<SuratCreateResult> CreateAsync(SuratShipment s, CancellationToken token = default)
        {
            Interlocked.Increment(ref Calls); if (BeforeSend is not null) await BeforeSend(s);
            Started.TrySetResult(); if (Release is not null) await Release.Task;
            return new(Ambiguous ? SuratCreateState.ReconciliationRequired : SuratCreateState.Registered);
        }
        public Task<SuratTrackingResult> TrackAsync(string reference, CancellationToken token = default) => throw new NotSupportedException();
    }
    private static IOptions<SuratKargoOptions> Options(string mode = "Sandbox") => Microsoft.Extensions.Options.Options.Create(new SuratKargoOptions
    { Enabled = true, Mode = mode, AllowProduction = true, Sandbox = new() { Username = "fixture-account", Password = "fixture-only" }, Production = new() { Username = "fixture-live", Password = "fixture-only" } });
    private static SuratShipmentWorkflow Workflow(SuratShipmentStore store, Client client, string mode = "Sandbox") => new(store, client, Options(mode), TimeProvider.System);

    [Fact] public async Task Concurrent_double_click_sends_once_and_persists_reference_before_network()
    {
        using var f = Factory(); var store = f.Services.GetRequiredService<SuratShipmentStore>(); var order = Order();
        var client = new Client { Release = new() };
        client.BeforeSend = async s => Assert.Equal(s.OzelKargoTakipNo, (await store.Find(order.Id, "Sandbox"))!.Reference);
        var flow = Workflow(store, client); var first = flow.Create(order, Input, "staff", default);
        await client.Started.Task;
        var duplicate = await flow.Create(order, Input, "staff", default);
        Assert.Equal("submitting", duplicate.State); Assert.Equal(1, client.Calls);
        client.Release.SetResult(); var result = await first;
        Assert.Equal(duplicate.Reference, result.Reference); Assert.Equal("registered", result.State);
        Assert.Null(order.Shipment); Assert.Equal(OrderStatuses.Received, order.Status);
    }
    [Fact] public async Task Restart_keeps_ambiguous_attempt_and_never_retries()
    {
        var order = Order(); string reference;
        using (var f = Factory())
        {
            var client = new Client { Ambiguous = true };
            var result = await Workflow(f.Services.GetRequiredService<SuratShipmentStore>(), client).Create(order, Input, "staff", default);
            reference = result.Reference; Assert.Equal("reconciliation_required", result.State);
        }
        using (var f = Factory())
        {
            var client = new Client();
            var result = await Workflow(f.Services.GetRequiredService<SuratShipmentStore>(), client).Create(order, Input, "staff", default);
            Assert.Equal(reference, result.Reference); Assert.Equal(0, client.Calls);
        }
    }
    [Fact] public async Task Crash_after_claim_is_not_replayed_and_changed_package_conflicts()
    {
        using var f = Factory(); var store = f.Services.GetRequiredService<SuratShipmentStore>(); var order = Order();
        var draft = new SuratShipment(order.Address.FullName, order.Address.Line, order.Address.City, order.Address.District, order.Address.Phone, "DRAFT", 1, 3, 2, 1);
        var claim = await store.Claim(order.Id, "Sandbox", "fixture-account", "staff", draft, DateTimeOffset.UtcNow);
        var client = new Client(); var flow = Workflow(store, client);
        var result = await flow.Create(order, Input, "staff", default);
        Assert.Equal(claim.Shipment.Reference, result.Reference); Assert.Equal("submitting", result.State); Assert.Equal(0, client.Calls);
        Assert.Equal("shipment_conflict", (await Assert.ThrowsAsync<ProblemException>(() => flow.Create(order, Input with { ParcelCount = 2 }, "staff", default))).Code);
    }
    [Theory]
    [InlineData("Production", "received")] [InlineData("Sandbox", "cancelled")] [InlineData("Sandbox", "delivered")]
    public async Task Unverified_live_or_ineligible_order_never_sends(string mode, string status)
    {
        using var f = Factory(); var store = f.Services.GetRequiredService<SuratShipmentStore>(); var client = new Client(); var order = Order() with { Status = status };
        await Assert.ThrowsAsync<ProblemException>(() => Workflow(store, client, mode).Create(order, Input, "staff", default));
        Assert.Null(await store.Find(order.Id, mode)); Assert.Equal(0, client.Calls);
    }
    [Fact] public async Task New_endpoints_require_authentication()
    {
        using var f = Factory(); using var http = f.CreateClient(); var path = "/api/v1/admin/orders/" + Guid.NewGuid().ToString("N") + "/surat-shipment";
        Assert.Equal(HttpStatusCode.Unauthorized, (await http.GetAsync(path)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await http.PostAsync(path, System.Net.Http.Json.JsonContent.Create(Input))).StatusCode);
    }
    [Fact] public async Task Customer_cannot_read_or_create_shipping_records()
    {
        using var f = Factory(); using var http = f.CreateClient();
        var accounts = f.Services.GetRequiredService<IAccountStore>();
        var account = await accounts.Register("Test müşteri", "fixture-customer@example.invalid", "fixture-password-123");
        var tokens = await accounts.IssueTokens(account.Id);
        http.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", tokens.AccessToken);
        var path = "/api/v1/admin/orders/" + Guid.NewGuid().ToString("N") + "/surat-shipment";
        Assert.Equal(HttpStatusCode.Forbidden, (await http.GetAsync(path)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await http.PostAsync(path, System.Net.Http.Json.JsonContent.Create(Input))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await http.PostAsync(path + "/reconcile", System.Net.Http.Json.JsonContent.Create(new { evidence = "Synthetic", resolution = "registered" }))).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await http.GetAsync(path + "/label")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await http.PostAsync(path + "/tracking", System.Net.Http.Json.JsonContent.Create(new { }))).StatusCode);
    }
    [Fact] public async Task Staff_gets_real_not_found_and_invalid_id_errors()
    {
        using var f = Factory(); using var http = await TestStaff.Client(f);
        Assert.Equal(HttpStatusCode.NotFound, (await http.GetAsync("/api/v1/admin/orders/" + Guid.NewGuid().ToString("N") + "/surat-shipment")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await http.GetAsync("/api/v1/admin/orders/not-an-id/surat-shipment")).StatusCode);
    }
    public void Dispose() { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
}
