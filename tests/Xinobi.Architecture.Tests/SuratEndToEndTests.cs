using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Xinobi.Api.Identity;
using Xinobi.Api.Shipping;

namespace Xinobi.Architecture.Tests;

// Real API -> workflow -> durable fixture store -> real carrier adapter -> in-memory HTTP handler.
// No socket, real identity, customer data or carrier account is used.
public sealed class SuratEndToEndTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "surat-e2e-" + Guid.NewGuid());
    private readonly Clock clock = new();
    private sealed class Clock : TimeProvider
    {
        public DateTimeOffset Now = DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow() => Now;
    }
    private sealed class Carrier : HttpMessageHandler
    {
        public int Creates, Tracks;
        public Func<HttpRequestMessage, Task<HttpResponseMessage>> Respond = _ => Task.FromResult(Reply("Tamam"));
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            Assert.Equal("api02.suratkargo.com.tr", request.RequestUri!.Host);
            if (request.RequestUri.AbsolutePath.EndsWith("GonderiyiKargoyaGonder")) Interlocked.Increment(ref Creates);
            else Interlocked.Increment(ref Tracks);
            return Respond(request);
        }
    }
    private static HttpResponseMessage Reply(string body) => new(HttpStatusCode.OK) { Content = new StringContent(body) };
    private WebApplicationFactory<Program> Factory(Carrier carrier) => new IsolatedApiFactory(directory).WithWebHostBuilder(b => b.ConfigureServices(s =>
    {
        s.RemoveAll<TimeProvider>(); s.AddSingleton<TimeProvider>(clock);
        s.RemoveAll<ISuratKargoClient>();
        s.AddSingleton<ISuratKargoClient>(p => new SuratKargoClient(new HttpClient(carrier, disposeHandler: false), p.GetRequiredService<IOptions<SuratKargoOptions>>()));
        s.PostConfigure<SuratKargoOptions>(o => { o.Enabled = true; o.Mode = "Sandbox"; o.PollingEnabled = false; o.Sandbox = new() { Username = "fixture-sender", Password = "fixture-secret" }; });
    }));
    private static readonly CreateSuratShipment Input = new(2, 3.5m, 2.25m, 2);
    private async Task<CustomerOrder> Seed(WebApplicationFactory<Program> f)
    {
        var a = f.Services.GetRequiredService<IAccountStore>();
        var owner = await a.Register("Sentetik", "fixture-" + Guid.NewGuid().ToString("N") + "@example.invalid", "fixture-password-123");
        var order = new CustomerOrder(Guid.NewGuid().ToString("N"), "FIXTURE-E2E", clock.Now, "received",
            new("A", "Test", "Sentetik Çığ Şükrü", "+905550000000", "İstanbul", "Üsküdar", "Sentetik Çiçek Sokağı", null, true), [], new(100, "TRY"));
        return await a.PlaceOrder(owner.Id, Guid.NewGuid().ToString("N"), () => order);
    }
    private static string PathFor(CustomerOrder order) => "/api/v1/admin/orders/" + order.Id + "/surat-shipment";
    private static async Task<SuratShipmentView> Create(HttpClient http, string path)
    {
        var response = await http.PostAsJsonAsync(path, Input); response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<SuratShipmentView>())!;
    }

    [Theory]
    [InlineData("Tamam")]
    [InlineData("\"Kayıt Edildi\"")]
    public async Task Full_API_adapter_create_label_tracking_matches_order_and_never_ships_commercial_order(string accepted)
    {
        using var carrier = new Carrier(); using var f = Factory(carrier); var order = await Seed(f);
        using var http = await TestStaff.Client(f); var path = PathFor(order); string? reference = null;
        carrier.Respond = async request =>
        {
            if (request.RequestUri!.AbsolutePath.EndsWith("GonderiyiKargoyaGonder"))
            {
                using var json = JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
                var g = json.RootElement.GetProperty("Gonderi");
                reference = g.GetProperty("OzelKargoTakipNo").GetString();
                var saved = await f.Services.GetRequiredService<SuratShipmentStore>().Find(order.Id, "Sandbox");
                Assert.Equal(reference, saved!.Reference); Assert.Equal("submitting", saved.State);
                Assert.Equal(order.Address.FullName, g.GetProperty("KisiKurum").GetString());
                Assert.Equal(order.Address.Line, g.GetProperty("AliciAdresi").GetString());
                Assert.Equal(order.Address.City, g.GetProperty("Il").GetString()); Assert.Equal(order.Address.District, g.GetProperty("Ilce").GetString());
                Assert.Equal("905550000000", g.GetProperty("TelefonCep").GetString());
                Assert.Equal(2, g.GetProperty("Adet").GetInt32()); Assert.Equal("3.5", g.GetProperty("BirimDesi").GetString());
                Assert.Equal("2.25", g.GetProperty("BirimKg").GetString()); Assert.Equal(2, g.GetProperty("OdemeTipi").GetInt32());
                Assert.Equal(0, g.GetProperty("Pazaryerimi").GetInt32()); Assert.Equal("", g.GetProperty("EntegrasyonFirmasi").GetString());
                return Reply(accepted);
            }
            Assert.Contains("WebSiparisKodu=" + reference, request.RequestUri.Query);
            return Reply("""{"IsError":false,"Gonderiler":[{"KargoObjId":1234567890123456789,"KargoTakipNo":"FIXTURE-A","KargonunDurumuSayi":6},{"KargoObjId":"return","KargonunDurumuSayi":12},{"KargoObjId":"review","KargonunDurumuSayi":7},{"KargoObjId":"unknown","KargonunDurumuSayi":99}]}""");
        };
        var created = await Create(http, path); Assert.Equal("registered", created.State);
        Assert.Contains("şube kabulü bekleniyor", created.Message); Assert.Equal(reference, created.Reference);
        Assert.Equal(created.Reference, (await Create(http, path)).Reference); Assert.Equal(1, carrier.Creates);
        var label1 = await http.GetAsync(path + "/label"); label1.EnsureSuccessStatusCode();
        var label2 = await http.GetAsync(path + "/label"); label2.EnsureSuccessStatusCode();
        Assert.Equal(await label1.Content.ReadAsByteArrayAsync(), await label2.Content.ReadAsByteArrayAsync());
        var svg = await label1.Content.ReadAsStringAsync(); Assert.Contains("Cari: fixture-sender", svg); Assert.Contains(created.Reference, svg);
        Assert.Contains("Çığ", svg); Assert.Contains("Paket: 2", svg); Assert.Contains("SEVK İÇİN KULLANILMAZ", svg);
        var tracking = await http.PostAsJsonAsync(path + "/tracking", new { }); tracking.EnsureSuccessStatusCode();
        var view = (await tracking.Content.ReadFromJsonAsync<SuratTrackingView>())!;
        Assert.Equal(4, view.Items.Length); Assert.Contains(view.Items, d => d.State == "needs_review");
        Assert.Contains(view.Items, d => d.State == "return_delivered"); Assert.Contains(view.Items, d => d.State == "unknown");
        (await http.PostAsJsonAsync(path + "/tracking", new { })).EnsureSuccessStatusCode(); Assert.Equal(1, carrier.Tracks);
        var stored = (await f.Services.GetRequiredService<SuratShipmentStore>().Find(order.Id, "Sandbox"))!;
        Assert.Equal("1234567890123456789", stored.Tracking!.Documents[0].Id);
        var commercial = (await f.Services.GetRequiredService<IAccountStore>().AllOrders()).Single(o => o.Order.Id == order.Id).Order;
        Assert.Equal("received", commercial.Status); Assert.Null(commercial.Shipment); Assert.Equal(1, carrier.Creates);
        Assert.DoesNotContain("fixture-secret", await tracking.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("lost-response")]
    [InlineData("connection")]
    [InlineData("broken-json")]
    [InlineData("http-error")]
    public async Task Ambiguous_provider_result_survives_restart_without_second_write_or_label(string fault)
    {
        using var carrier = new Carrier(); string reference; CustomerOrder order;
        carrier.Respond = _ => fault switch
        {
            "lost-response" => throw new TaskCanceledException("synthetic response lost after carrier commit"),
            "connection" => throw new HttpRequestException("synthetic connection loss"),
            "http-error" => Task.FromResult(new HttpResponseMessage(HttpStatusCode.Unauthorized)),
            _ => Task.FromResult(Reply("\"broken"))
        };
        using (var f = Factory(carrier))
        {
            order = await Seed(f); using var http = await TestStaff.Client(f); var path = PathFor(order);
            var created = await Create(http, path); reference = created.Reference; Assert.Equal("reconciliation_required", created.State);
            Assert.Equal(HttpStatusCode.Conflict, (await http.GetAsync(path + "/label")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await http.PostAsJsonAsync(path + "/reconcile", new { evidence = "", resolution = "not_created" })).StatusCode);
        }
        using (var f = Factory(carrier))
        {
            using var http = await TestStaff.Client(f); var retried = await Create(http, PathFor(order));
            Assert.Equal(reference, retried.Reference); Assert.Equal("reconciliation_required", retried.State); Assert.Equal(1, carrier.Creates);
            carrier.Respond = _ => Task.FromResult(Reply("""{"IsError":true,"errorMessage":"Sipariş bulunamadı.","Gonderiler":[]}"""));
            (await http.PostAsJsonAsync(PathFor(order) + "/tracking", new { })).EnsureSuccessStatusCode();
            Assert.Equal(reference, (await Create(http, PathFor(order))).Reference); Assert.Equal(1, carrier.Creates);
            (await http.PostAsJsonAsync(PathFor(order) + "/reconcile", new { evidence = "Synthetic provider case confirms no record", resolution = "not_created" })).EnsureSuccessStatusCode();
            carrier.Respond = _ => Task.FromResult(Reply("Tamam"));
            Assert.Equal(reference, (await Create(http, PathFor(order))).Reference); Assert.Equal(2, carrier.Creates);
            var saved = await f.Services.GetRequiredService<SuratShipmentStore>().Find(order.Id, "Sandbox");
            Assert.Single(saved!.PreviousAttempts!); Assert.NotNull(saved.PreviousAttempts![0].Evidence);
        }
    }

    [Fact]
    public async Task Lost_local_completion_keeps_submitting_after_restart_and_requires_reconciliation()
    {
        using var carrier = new Carrier(); CustomerOrder order; string reference;
        var blocker = Path.Combine(directory,"shipping","surat-shipments.json.tmp");
        using (var f = Factory(carrier))
        {
            order = await Seed(f); using var http = await TestStaff.Client(f);
            carrier.Respond = _ => { Directory.CreateDirectory(blocker); return Task.FromResult(Reply("Tamam")); };
            try
            {
                var failed = await http.PostAsJsonAsync(PathFor(order),Input);
                Assert.Equal(HttpStatusCode.InternalServerError,failed.StatusCode);
            }
            finally { Directory.Delete(blocker); }
            var pending = (await f.Services.GetRequiredService<SuratShipmentStore>().Find(order.Id,"Sandbox"))!;
            reference = pending.Reference; Assert.Equal("submitting",pending.State);
        }
        using (var f = Factory(carrier))
        {
            using var http = await TestStaff.Client(f);
            var pending = await Create(http,PathFor(order)); Assert.Equal(reference,pending.Reference); Assert.Equal("submitting",pending.State);
            Assert.Equal(1,carrier.Creates);
            clock.Now = clock.Now.AddMinutes(3);
            var reconciled = await http.PostAsJsonAsync(PathFor(order)+"/reconcile",new { evidence="Synthetic accepted carrier record verified",resolution="registered" });
            reconciled.EnsureSuccessStatusCode();
            (await http.GetAsync(PathFor(order)+"/label")).EnsureSuccessStatusCode(); Assert.Equal(1,carrier.Creates);
        }
    }

    [Fact]
    public async Task Different_orders_receive_unique_references_and_unapproved_labels_are_blocked()
    {
        using var carrier = new Carrier(); using var f = Factory(carrier); using var http = await TestStaff.Client(f);
        var a = await Seed(f); var b = await Seed(f);
        var first = await Create(http,PathFor(a)); var second = await Create(http,PathFor(b));
        Assert.NotEqual(first.Reference,second.Reference); Assert.Equal(2,carrier.Creates);
        var saved = (await f.Services.GetRequiredService<SuratShipmentStore>().Find(a.Id,"Sandbox"))!;
        Assert.Throws<Xinobi.Api.Infrastructure.ProblemException>(()=>SuratLabel.Render(saved with { Request=saved.Request with { AliciAdresi=new string('Ç',400) } }));
        Assert.Throws<Xinobi.Api.Infrastructure.ProblemException>(()=>SuratLabel.Render(saved with { Environment="Production" }));
    }

    [Fact]
    public async Task Concurrent_HTTP_requests_and_cancellation_during_provider_write_are_guarded()
    {
        using var carrier = new Carrier(); using var f = Factory(carrier); var order = await Seed(f);
        using var http = await TestStaff.Client(f); var path = PathFor(order);
        var started = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var release = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        carrier.Respond = async _ => { started.SetResult(); await release.Task; return Reply("Tamam"); };
        var first = Create(http, path);
        await started.Task.WaitAsync(TimeSpan.FromSeconds(10));
        try
        {
            var duplicates = await Task.WhenAll(Enumerable.Range(0, 6).Select(_ => Create(http, path)));
            Assert.All(duplicates, d => Assert.Equal("submitting", d.State)); Assert.Single(duplicates.Select(d => d.Reference).Distinct());
            var cancel = await http.PostAsJsonAsync("/api/v1/local-commerce/orders/" + order.Id + "/status", new { status = "cancelled" });
            Assert.Equal(HttpStatusCode.Conflict, cancel.StatusCode); Assert.Equal(1, carrier.Creates);
            Assert.Equal(HttpStatusCode.Conflict, (await http.PostAsJsonAsync(path + "/reconcile", new { evidence = "Synthetic", resolution = "not_created" })).StatusCode);
        }
        finally { release.TrySetResult(); }
        Assert.Equal("registered", (await first).State);
    }
    public void Dispose() { if (Directory.Exists(directory)) Directory.Delete(directory, true); }
}
