using System.Net;
using System.Text;
using System.Xml.Linq;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Shipping;

namespace Xinobi.Architecture.Tests;

public sealed class SuratOperationsTests : IDisposable
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "xinobi-surat-operations-" + Guid.NewGuid());
    private static readonly SuratShipment Draft = new("Test <alıcı>", "Test & adres", "İstanbul", "Test ilçe", "5550000000", "DRAFT", 1, 3, 2, 1);
    private static readonly DateTimeOffset Now = new(2026, 11, 3, 10, 0, 0, TimeSpan.Zero);
    private IsolatedApiFactory Factory() => new(directory);
    private static async Task<SuratStoredShipment> Registered(SuratShipmentStore store) {
        var claim = await store.Claim(Guid.NewGuid().ToString("N"), "Sandbox", "1111111111", "fixture-staff", Draft, Now);
        return await store.Complete(claim.Shipment, SuratCreateState.Registered, Now);
    }
    private static SuratTrackingResult Tracking(string id = "1234567890123456789", int code = 6) {
        using var doc = System.Text.Json.JsonDocument.Parse("{\"Hareketler\":[{\"Aciklama\":\"Test\"}]}");
        return new(SuratTrackingState.Available, [new(id, code, "Test durum", "TEST-TRACK", "03/11/2026", null, SuratKargoClient.Normalize(code), doc.RootElement.Clone())]);
    }
    [Fact] public async Task Create_diagnostic_survives_restart_and_is_archived_on_controlled_retry()
    {
        var id = Guid.NewGuid().ToString("N");
        var diagnostic = new SuratCreateDiagnostic("authentication_or_access", 403);
        using (var f = Factory())
        {
            var store = f.Services.GetRequiredService<SuratShipmentStore>();
            var claim = await store.Claim(id, "Sandbox", "1111111111", "fixture-staff", Draft, Now);
            await store.Complete(claim.Shipment, SuratCreateState.ReconciliationRequired, Now, diagnostic);
        }
        using (var f = Factory())
        {
            var store = f.Services.GetRequiredService<SuratShipmentStore>();
            var row = (await store.Find(id, "Sandbox"))!;
            Assert.Equal(diagnostic, row.CreateDiagnostic);
            Assert.DoesNotContain("authentication_or_access", System.Text.Json.JsonSerializer.Serialize(SuratShipmentView.From(row)));
            await store.Reconcile(id, "Sandbox", "fixture-staff", "Fixture provider confirmed absent", Now.AddMinutes(3), "not_created");
            var retry = await store.Claim(id, "Sandbox", "1111111111", "fixture-staff", Draft, Now.AddMinutes(4));
            Assert.Null(retry.Shipment.CreateDiagnostic);
            Assert.Equal(diagnostic, Assert.Single(retry.Shipment.PreviousAttempts!).CreateDiagnostic);
            // An obsolete completion must not overwrite a newer attempt or its diagnostic.
            await Assert.ThrowsAsync<ProblemException>(() => store.Complete(row, SuratCreateState.Registered, Now.AddMinutes(5), new("accepted", 200)));
        }
    }

    [Fact] public async Task Tracking_failure_preserves_last_success_and_shared_lease_throttles_queries()
    {
        using var f = Factory(); var store = f.Services.GetRequiredService<SuratShipmentStore>(); var row = await Registered(store);
        var first = await store.ClaimTracking(row.OrderId, "Sandbox", "1111111111", Now);
        Assert.NotNull(first.Lease);
        Assert.Null((await store.ClaimTracking(row.OrderId, "Sandbox", "1111111111", Now)).Lease);
        row = await store.CompleteTracking(row, first.Lease!, Tracking(), Now, 300);
        Assert.Equal("available", row.Tracking!.Result);
        Assert.Null((await store.ClaimTracking(row.OrderId, "Sandbox", "1111111111", Now.AddSeconds(10))).Lease);
        var next = await store.ClaimTracking(row.OrderId, "Sandbox", "1111111111", Now.AddMinutes(6));
        row = await store.CompleteTracking(row, next.Lease!, new(SuratTrackingState.Unavailable, [], "provider_http"), Now.AddMinutes(6), 300);
        Assert.Equal("unavailable", row.Tracking!.Result); Assert.Equal("provider_http", row.Tracking.FailureKind); Assert.Equal(Now, row.Tracking.LastSuccess);
        Assert.Single(row.Tracking.Documents); Assert.True(row.Tracking.NextAttempt > Now.AddMinutes(15));
        Assert.Equal("1234567890123456789", row.Tracking.Documents[0].Id);
    }
    [Fact] public async Task Worker_due_selection_filters_pending_account_environment_and_backoff()
    {
        using var f=Factory();var store=f.Services.GetRequiredService<SuratShipmentStore>();var row=await Registered(store);
        await store.Claim("pending", "Sandbox", "1111111111", "staff", Draft, Now);
        Assert.Single(await store.DueTracking("Sandbox",Now,"1111111111"));
        Assert.Empty(await store.DueTracking("Production",Now,"1111111111"));
        Assert.Empty(await store.DueTracking("Sandbox",Now,"another-account"));
        var lease=await store.ClaimTracking(row.OrderId,"Sandbox","1111111111",Now);
        Assert.Empty(await store.DueTracking("Sandbox",Now,"1111111111"));
        row=await store.CompleteTracking(row,lease.Lease!,new(SuratTrackingState.Unavailable,[],"connection_failure"),Now,300);
        Assert.Empty(await store.DueTracking("Sandbox",Now.AddSeconds(599),"1111111111"));
        Assert.Single(await store.DueTracking("Sandbox",row.Tracking!.NextAttempt,"1111111111"));
    }
    [Fact] public async Task Expired_worker_cannot_overwrite_new_result_and_changed_account_is_blocked()
    {
        using var f = Factory(); var store = f.Services.GetRequiredService<SuratShipmentStore>(); var row = await Registered(store);
        var first = await store.ClaimTracking(row.OrderId, "Sandbox", "1111111111", Now);
        var second = await store.ClaimTracking(row.OrderId, "Sandbox", "1111111111", Now.AddMinutes(3));
        await store.CompleteTracking(row, second.Lease!, Tracking("new-id",12), Now.AddMinutes(3), 300);
        var stale = await store.CompleteTracking(row, first.Lease!, Tracking("old-id",6), Now.AddMinutes(4), 300);
        Assert.Equal("new-id", stale.Tracking!.Documents[0].Id); Assert.Equal("return_delivered", stale.Tracking.Documents[0].NormalizedState);
        Assert.Equal("shipment_account_changed", (await Assert.ThrowsAsync<ProblemException>(() => store.ClaimTracking(row.OrderId,"Sandbox","other-account",Now))).Code);
    }
    [Fact] public async Task Reconciliation_requires_evidence_never_resets_reference_or_active_attempt()
    {
        using var f = Factory(); var store = f.Services.GetRequiredService<SuratShipmentStore>();
        var claim = await store.Claim("fixture-order", "Sandbox", "1111111111", "staff", Draft, Now);
        await Assert.ThrowsAsync<ProblemException>(()=>store.Reconcile("fixture-order","Sandbox","staff","",Now.AddMinutes(3)));
        await Assert.ThrowsAsync<ProblemException>(()=>store.Reconcile("fixture-order","Sandbox","staff","Provider confirmed registration",Now));
        var row = await store.Reconcile("fixture-order","Sandbox","staff","Provider case FIXTURE confirmed registration",Now.AddMinutes(3));
        Assert.Equal(claim.Shipment.Reference,row.Reference);Assert.Equal("registered",row.State);
        Assert.Equal("staff",row.ReconciledBy);Assert.NotNull(row.ReconciliationEvidence);
    }
    [Fact] public async Task Label_is_test_only_XML_escaped_and_deterministic_without_write()
    {
        using var f = Factory(); var store=f.Services.GetRequiredService<SuratShipmentStore>(); var row=await Registered(store);
        var a=SuratLabel.Render(row);var b=SuratLabel.Render(row);Assert.Equal(a,b);
        var xml=XDocument.Parse(Encoding.UTF8.GetString(a));Assert.Equal("100mm",xml.Root!.Attribute("width")!.Value);
        Assert.Contains("Test &lt;alıcı&gt;",Encoding.UTF8.GetString(a));Assert.Contains("TEST - SEVK",Encoding.UTF8.GetString(a));
        Assert.Contains("Cari: " + row.SenderCode, Encoding.UTF8.GetString(a));
        Assert.Contains("Referans: " + row.Reference, Encoding.UTF8.GetString(a));
        Assert.Equal(104,SuratLabel.Symbols(row.Reference)[0]);Assert.Equal(106,SuratLabel.Symbols(row.Reference)[^1]);
        Assert.Throws<ArgumentException>(()=>SuratLabel.Symbols("özel"));
        Assert.Throws<ProblemException>(()=>SuratLabel.Render(row with { Environment="Production" }));
        Assert.Throws<ProblemException>(()=>SuratLabel.Render(row with { State="submitting" }));
        Assert.Throws<ProblemException>(()=>SuratLabel.Render(row with { Request=row.Request with { AliciAdresi=new string('A',400) } }));
        await File.WriteAllBytesAsync(Path.Combine(Path.GetTempPath(),"xinobi-surat-test-label.svg"),a);
        Assert.Equal(row,await store.Find(row.OrderId,"Sandbox"));
    }
    [Fact] public async Task All_operation_routes_deny_anonymous_requests()
    {
        using var f=Factory();using var http=f.CreateClient();var path="/api/v1/admin/orders/"+Guid.NewGuid().ToString("N")+"/surat-shipment";
        foreach(var tail in new[]{"/label","/tracking"})Assert.Equal(HttpStatusCode.Unauthorized,(await http.GetAsync(path+tail)).StatusCode);
        foreach(var tail in new[]{"/tracking","/reconcile"})Assert.Equal(HttpStatusCode.Unauthorized,(await http.PostAsync(path+tail,System.Net.Http.Json.JsonContent.Create(new{evidence="Fixture"}))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,(await http.GetAsync("/api/v1/me/orders/test/surat-tracking")).StatusCode);
    }
    [Fact] public async Task Customer_tracking_enforces_ownership_and_hides_test_records()
    {
        using var f = Factory(); var accounts=f.Services.GetRequiredService<Xinobi.Api.Identity.IAccountStore>();
        var owner=await accounts.Register("Fixture owner","owner@example.invalid","fixture-password-123");
        var other=await accounts.Register("Fixture other","other@example.invalid","fixture-password-123");
        var order=new Xinobi.Api.Identity.CustomerOrder(Guid.NewGuid().ToString("N"),"FIXTURE-OWNED",Now,"received",
            new("A","Test","Test alıcı","5550000000","İstanbul","Test","Test adres",null,true),[],new Xinobi.Api.Catalog.Money(100,"TRY"));
        await accounts.PlaceOrder(owner.Id,"fixture-request",()=>order);
        var store=f.Services.GetRequiredService<SuratShipmentStore>();
        var claim=await store.Claim(order.Id,"Sandbox","1111111111","fixture-staff",Draft,Now);
        await store.Complete(claim.Shipment,SuratCreateState.Registered,Now);
        using var http=f.CreateClient();
        http.DefaultRequestHeaders.Authorization=new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer",(await accounts.IssueTokens(other.Id)).AccessToken);
        Assert.Equal(HttpStatusCode.NotFound,(await http.GetAsync("/api/v1/me/orders/"+order.Id+"/surat-tracking")).StatusCode);
        http.DefaultRequestHeaders.Authorization=new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer",(await accounts.IssueTokens(owner.Id)).AccessToken);
        var response=await http.GetAsync("/api/v1/me/orders/"+order.Id+"/surat-tracking");
        Assert.True(response.StatusCode is HttpStatusCode.NoContent or HttpStatusCode.OK);
        Assert.DoesNotContain(claim.Shipment.Reference,await response.Content.ReadAsStringAsync());
    }
    [Fact] public void Code128_B_uses_standard_checksum_and_stop() => Assert.Equal(new[]{104,33,34,102,106},SuratLabel.Symbols("AB"));
    [Fact] public async Task Connection_status_reports_flags_without_credentials()
    {
        using var f = Factory().WithWebHostBuilder(b => b.ConfigureServices(services => services.PostConfigure<SuratKargoOptions>(o => {
            o.Enabled = true; o.Sandbox.Username = "fixture-private-user"; o.Sandbox.Password = "fixture-private-password";
        })));
        using var http = await TestStaff.Client(f);
        var response = await http.GetAsync("/api/v1/admin/shipping/surat/status"); response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("fixture-private",body);
        using var json=System.Text.Json.JsonDocument.Parse(body);
        Assert.True(json.RootElement.GetProperty("accountConfigured").GetBoolean());
        Assert.False(json.RootElement.GetProperty("liveOperationsAllowed").GetBoolean());
    }
    [Fact] public async Task Customer_reads_only_safe_production_snapshot_without_provider_calls()
    {
        using var f=Factory().WithWebHostBuilder(b=>b.ConfigureServices(services=>services.PostConfigure<SuratKargoOptions>(o=>o.Mode="Production")));
        var accounts=f.Services.GetRequiredService<Xinobi.Api.Identity.IAccountStore>();
        var owner=await accounts.Register("Fixture owner","production-snapshot@example.invalid","fixture-password-123");
        var order=new Xinobi.Api.Identity.CustomerOrder(Guid.NewGuid().ToString("N"),"FIXTURE-CACHED",Now,"received",
            new("A","Test","Test alıcı","5550000000","İstanbul","Test","Test adres",null,true),[],new Xinobi.Api.Catalog.Money(100,"TRY"));
        await accounts.PlaceOrder(owner.Id,"fixture-cached",()=>order);
        var store=f.Services.GetRequiredService<SuratShipmentStore>();
        var claim=await store.Claim(order.Id,"Production","1111111111","staff",Draft,Now);
        var row=await store.Complete(claim.Shipment,SuratCreateState.Registered,Now);
        var lease=await store.ClaimTracking(order.Id,"Production","1111111111",Now);
        await store.CompleteTracking(row,lease.Lease!,Tracking("1234567890123456789",12),Now,300);
        using var http=f.CreateClient();http.DefaultRequestHeaders.Authorization=new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer",(await accounts.IssueTokens(owner.Id)).AccessToken);
        var response=await http.GetAsync("/api/v1/me/orders/"+order.Id+"/surat-tracking");response.EnsureSuccessStatusCode();
        var body=await response.Content.ReadAsStringAsync();Assert.Contains("return_delivered",body);
        Assert.DoesNotContain("Hareketler",body);Assert.DoesNotContain("Test & adres",body);Assert.DoesNotContain("senderCode",body);Assert.DoesNotContain("1111111111",body);
    }
    [Fact] public async Task Empty_or_partial_tracking_keeps_prior_parcels_and_original_data_time()
    {
        using var f=Factory();var store=f.Services.GetRequiredService<SuratShipmentStore>();var row=await Registered(store);
        var first=await store.ClaimTracking(row.OrderId,"Sandbox","1111111111",Now);
        row=await store.CompleteTracking(row,first.Lease!,Tracking("parcel-1"),Now,300);
        var second=await store.ClaimTracking(row.OrderId,"Sandbox","1111111111",Now.AddMinutes(6));
        row=await store.CompleteTracking(row,second.Lease!,new(SuratTrackingState.AwaitingAcceptance,[]),Now.AddMinutes(6),300);
        Assert.Single(row.Tracking!.Documents);Assert.Equal(Now,row.Tracking.LastSuccess);
        var third=await store.ClaimTracking(row.OrderId,"Sandbox","1111111111",Now.AddMinutes(12));
        row=await store.CompleteTracking(row,third.Lease!,Tracking("parcel-2",3),Now.AddMinutes(12),300);
        Assert.Equal(2,row.Tracking!.Documents.Length);
        Assert.Contains(row.Tracking.Documents,d=>d.Id=="parcel-1");Assert.Contains(row.Tracking.Documents,d=>d.Id=="parcel-2");
    }
    [Fact] public async Task Only_explicit_not_created_evidence_allows_same_reference_retry_with_attempt_history()
    {
        using var f=Factory();var store=f.Services.GetRequiredService<SuratShipmentStore>();
        var claim=await store.Claim("retry-order","Sandbox","1111111111","staff",Draft,Now);
        await store.Complete(claim.Shipment,SuratCreateState.ReconciliationRequired,Now);
        var resolved=await store.Reconcile("retry-order","Sandbox","staff","Provider case FIXTURE: no record was created",Now.AddMinutes(3),"not_created");
        var retry=await store.Claim("retry-order","Sandbox","1111111111","staff",Draft with { Adet=2 },Now.AddMinutes(4));
        Assert.True(retry.IsNew);Assert.Equal(resolved.Reference,retry.Shipment.Reference);
        Assert.NotEqual(claim.Shipment.AttemptId,retry.Shipment.AttemptId);Assert.Single(retry.Shipment.PreviousAttempts!);
        Assert.NotNull(retry.Shipment.PreviousAttempts![0].Evidence);
        Assert.False((await store.Claim("retry-order","Sandbox","1111111111","staff",Draft with {Adet=2},Now.AddMinutes(4))).IsNew);
    }
    [Fact] public async Task Repeated_parcel_responses_archive_all_movement_versions()
    {
        using var f = Factory(); var store = f.Services.GetRequiredService<SuratShipmentStore>(); var row = await Registered(store);
        var first = await store.ClaimTracking(row.OrderId,"Sandbox","1111111111",Now);
        row = await store.CompleteTracking(row,first.Lease!,Tracking("same-parcel",3),Now,300);
        var second = await store.ClaimTracking(row.OrderId,"Sandbox","1111111111",Now.AddMinutes(6));
        row = await store.CompleteTracking(row,second.Lease!,Tracking("same-parcel",7),Now.AddMinutes(6),300);
        Assert.Single(row.Tracking!.Documents);
        Assert.Equal("needs_review", row.Tracking.Documents[0].NormalizedState);
        Assert.Equal(2,row.Tracking.History!.Length);
        Assert.Contains(row.Tracking.History,d=>d.StatusCode==3);
        Assert.Contains(row.Tracking.History,d=>d.StatusCode==7);
    }
    private sealed class FixtureCarrier : ISuratKargoClient
    {
        public int Creates;
        public Task<SuratCreateResult> CreateAsync(SuratShipment request,CancellationToken token=default)
        { Interlocked.Increment(ref Creates);return Task.FromResult(new SuratCreateResult(SuratCreateState.Registered)); }
        public Task<SuratTrackingResult> TrackAsync(string reference,CancellationToken token=default) => Task.FromResult(Tracking());
    }
    [Fact] public async Task Authorized_admin_completes_create_download_and_tracking_without_changing_order_lifecycle()
    {
        var carrier=new FixtureCarrier();
        using var f=Factory().WithWebHostBuilder(b=>b.ConfigureServices(services=>{
            services.RemoveAll<ISuratKargoClient>();services.AddSingleton<ISuratKargoClient>(carrier);
            services.PostConfigure<SuratKargoOptions>(o=>{o.Enabled=true;o.Mode="Sandbox";o.PollingEnabled=false;o.Sandbox=new(){Username="1111111111",Password="fixture-only"};});
        }));
        var accounts=f.Services.GetRequiredService<Xinobi.Api.Identity.IAccountStore>();
        var owner=await accounts.Register("Fixture customer","complete-flow@example.invalid","fixture-password-123");
        var order=new Xinobi.Api.Identity.CustomerOrder(Guid.NewGuid().ToString("N"),"FIXTURE-COMPLETE",Now,"received",
            new("A","Test","Test alıcı","+905550000000","İstanbul","Test","Test adres",null,true),[],new Xinobi.Api.Catalog.Money(100,"TRY"));
        await accounts.PlaceOrder(owner.Id,"fixture-complete",()=>order);
        using var http=await TestStaff.Client(f);var path="/api/v1/admin/orders/"+order.Id+"/surat-shipment";
        var input=new CreateSuratShipment(1,3,2,1);
        (await http.PostAsync(path,System.Net.Http.Json.JsonContent.Create(input))).EnsureSuccessStatusCode();
        (await http.PostAsync(path,System.Net.Http.Json.JsonContent.Create(input))).EnsureSuccessStatusCode();
        Assert.Equal(1,carrier.Creates);
        var label=await http.GetAsync(path+"/label");label.EnsureSuccessStatusCode();
        Assert.Equal("image/svg+xml",label.Content.Headers.ContentType!.MediaType);Assert.NotNull(label.Content.Headers.ContentDisposition);
        Assert.Contains("TEST - SEVK",await label.Content.ReadAsStringAsync());
        var refresh=await http.PostAsync(path+"/tracking",System.Net.Http.Json.JsonContent.Create(new{}));refresh.EnsureSuccessStatusCode();
        var body=await refresh.Content.ReadAsStringAsync();Assert.Contains("TEST-TRACK",body);Assert.DoesNotContain("Hareketler",body);
        Assert.Equal("received",Assert.Single(await accounts.Orders(owner.Id)).Status);
        Assert.Null(Assert.Single(await accounts.Orders(owner.Id)).Shipment);
    }
    public void Dispose(){if(Directory.Exists(directory))Directory.Delete(directory,true);}
}
