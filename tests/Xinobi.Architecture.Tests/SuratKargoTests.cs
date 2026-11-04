using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Options;
using Xinobi.Api.Shipping;

namespace Xinobi.Architecture.Tests;

public class SuratKargoTests
{
    private static SuratShipment Shipment => new("Test alıcı", "Test adres", "İstanbul", "Test ilçe", "5550000000", "TEST-ORDER-1", 1, 2, 2, 1);
    private sealed class Handler(Func<HttpRequestMessage, Task<HttpResponseMessage>> send) : HttpMessageHandler
    {
        public int Calls;
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage r, CancellationToken ct) { Calls++; return send(r); }
    }
    private static SuratKargoClient Client(Handler h, bool enabled = true, string mode = "Sandbox", bool live = false) =>
        new(new HttpClient(h), Options.Create(new SuratKargoOptions { Enabled = enabled, Mode = mode, AllowProduction = live,
            Sandbox = new() { Username = "fixture-user", Password = "fixture-secret" }, Production = new() { Username = "live-fixture", Password = "live-fixture-secret" } }));
    private static HttpResponseMessage Response(string s) => new(HttpStatusCode.OK) { Content = new StringContent(s) };

    [Theory]
    [InlineData("Tamam", SuratCreateState.Registered)]
    [InlineData("\"Kayıt Edildi\"", SuratCreateState.Registered)]
    [InlineData("Tamam değil", SuratCreateState.ReconciliationRequired)]
    [InlineData("039 Kayıt edildi barkod oluşturulamadı", SuratCreateState.ReconciliationRequired)]
    [InlineData("{\"success\":true}", SuratCreateState.ReconciliationRequired)]
    public async Task Create_uses_exact_acceptance_without_retry(string reply, SuratCreateState expected)
    {
        var h = new Handler(async r => {
            Assert.Equal("api02.suratkargo.com.tr", r.RequestUri!.Host);
            Assert.Equal("/api/GonderiyiKargoyaGonder", r.RequestUri.AbsolutePath);
            using var j = JsonDocument.Parse(await r.Content!.ReadAsStringAsync());
            var g = j.RootElement.GetProperty("Gonderi");
            Assert.Equal(0, g.GetProperty("Pazaryerimi").GetInt32());
            Assert.Equal("", g.GetProperty("EntegrasyonFirmasi").GetString());
            Assert.Equal("TEST-ORDER-1", g.GetProperty("OzelKargoTakipNo").GetString());
            Assert.False(g.TryGetProperty("KapidanOdemeTutari", out _));
            return Response(reply);
        });
        Assert.Equal(expected, (await Client(h).CreateAsync(Shipment)).State); Assert.Equal(1, h.Calls);
    }
    [Theory]
    [InlineData(false,"Sandbox",false)] [InlineData(true,"Production",false)] [InlineData(true,"typo",true)]
    public async Task Invalid_configuration_never_sends(bool enabled,string mode,bool live)
    {
        var h = new Handler(_ => Task.FromResult(Response("Tamam")));
        await Assert.ThrowsAsync<SuratConfigurationException>(() => Client(h,enabled,mode,live).CreateAsync(Shipment));Assert.Equal(0,h.Calls);
    }
    [Fact] public async Task Timeout_is_uncertain_not_retried()
    {
        var h=new Handler(_=>throw new TaskCanceledException("URI may contain credentials"));
        Assert.Equal(SuratCreateState.ReconciliationRequired,(await Client(h).CreateAsync(Shipment)).State);Assert.Equal(1,h.Calls);
    }
    [Theory]
    [InlineData(401)] [InlineData(403)] [InlineData(500)]
    public async Task Http_errors_never_retry_or_become_success(int status)
    {
        var h = new Handler(_ => Task.FromResult(new HttpResponseMessage((HttpStatusCode)status)));
        Assert.Equal(SuratCreateState.ReconciliationRequired, (await Client(h).CreateAsync(Shipment)).State);
        Assert.Equal(SuratTrackingState.Unavailable, (await Client(h).TrackAsync("TEST-ORDER-1")).State);
        Assert.Equal(2, h.Calls);
    }
    [Fact] public async Task Connection_failure_is_uncertain_and_never_leaks_exception()
    {
        var h = new Handler(_ => throw new HttpRequestException("fixture-sensitive-uri"));
        Assert.Equal(SuratCreateState.ReconciliationRequired, (await Client(h).CreateAsync(Shipment)).State);
        Assert.Equal(SuratTrackingState.Unavailable, (await Client(h).TrackAsync("TEST-ORDER-1")).State);
        Assert.Equal(2, h.Calls);
    }
    [Fact] public async Task Missing_weight_blocks_write()
    {
        var h=new Handler(_=>Task.FromResult(Response("Tamam")));
        await Assert.ThrowsAsync<ArgumentException>(()=>Client(h).CreateAsync(Shipment with {BirimKg=0}));Assert.Equal(0,h.Calls);
    }
    [Fact] public async Task Tracking_preserves_large_ids_and_all_documents()
    {
        var h=new Handler(r=> {
            Assert.Equal(HttpMethod.Post,r.Method);Assert.Contains("WebSiparisKodu=TEST-ORDER-1",r.RequestUri!.Query);
            return Task.FromResult(Response("""{"IsError":false,"Gonderiler":[{"KargoObjId":1234567890123456789,"KargonunDurumuSayi":7},{"KargoObjId":"return-id","KargonunDurumuSayi":12}]}"""));
        });
        var result=await Client(h).TrackAsync("TEST-ORDER-1");Assert.Equal(2,result.Documents.Length);
        Assert.Equal("1234567890123456789",result.Documents[0].Id);Assert.Equal("needs_review",result.Documents[0].NormalizedState);Assert.Equal("return_delivered",result.Documents[1].NormalizedState);
    }
    [Theory]
    [InlineData("{\"IsError\":false,\"Gonderiler\":[]}",SuratTrackingState.AwaitingAcceptance)]
    [InlineData("{\"IsError\":true,\"Gonderiler\":[]}",SuratTrackingState.Unavailable)]
    [InlineData("{\"IsError\":true,\"errorMessage\":\"Sipariş bulunamadı.\",\"Gonderiler\":[]}",SuratTrackingState.AwaitingAcceptance)]
    [InlineData("{\"IsError\":true,\"errorMessage\":\"Kullanıcı bulunamadı.\",\"Gonderiler\":[]}",SuratTrackingState.Unavailable)]
    [InlineData("{\"IsError\":true,\"errorMessage\":\"Sipariş bulunamadı.\",\"Gonderiler\":[{}]}",SuratTrackingState.Unavailable)]
    [InlineData("{}",SuratTrackingState.Unavailable)] [InlineData("not json",SuratTrackingState.Unavailable)]
    public async Task Tracking_separates_empty_and_failure(string reply,SuratTrackingState expected)
    { var h=new Handler(_=>Task.FromResult(Response(reply)));Assert.Equal(expected,(await Client(h).TrackAsync("TEST-ORDER-1")).State); }
    [Theory]
    [InlineData(401,"authentication_or_access")]
    [InlineData(403,"authentication_or_access")]
    [InlineData(500,"provider_http")]
    public async Task Tracking_HTTP_failures_are_classified_without_provider_content(int status,string reason)
    {
        var h = new Handler(_=>Task.FromResult(new HttpResponseMessage((HttpStatusCode)status)));
        var result = await Client(h).TrackAsync("TEST-ORDER-1");
        Assert.Equal(SuratTrackingState.Unavailable,result.State); Assert.Equal(reason,result.FailureKind);
    }
    [Theory]
    [InlineData("""{"IsError":false,"Gonderiler":[{}]}""","invalid_response")]
    [InlineData("""{"IsError":false,"Gonderiler":[null]}""","invalid_response")]
    [InlineData("""{"IsError":true,"Gonderiler":[]}""","provider_error")]
    [InlineData("broken", "invalid_response")]
    public async Task Invalid_or_provider_error_tracking_never_becomes_available(string body,string reason)
    {
        var h = new Handler(_=>Task.FromResult(Response(body)));
        var result = await Client(h).TrackAsync("TEST-ORDER-1");
        Assert.Equal(SuratTrackingState.Unavailable,result.State); Assert.Equal(reason,result.FailureKind);
    }
    [Fact] public async Task Production_requires_explicit_gate_and_uses_separate_account()
    {
        var h=new Handler(async r=> {
            Assert.Equal("api01.suratkargo.com.tr",r.RequestUri!.Host);
            using var j=JsonDocument.Parse(await r.Content!.ReadAsStringAsync());
            Assert.Equal("live-fixture",j.RootElement.GetProperty("KullaniciAdi").GetString());
            return Response("Tamam");
        });
        Assert.Equal(SuratCreateState.Registered,(await Client(h,true,"Production",true).CreateAsync(Shipment)).State);
    }
    [Fact] public async Task Tracking_retains_raw_movements_after_document_disposal()
    {
        var h=new Handler(_=>Task.FromResult(Response("""{"IsError":false,"Gonderiler":[{"KargonunDurumuSayi":99,"Hareketler":[{"IslemTarihi":"2026-11-03T10:00:00"}]}]}""")));
        var result=await Client(h).TrackAsync("TEST-ORDER-1");
        Assert.Equal("unknown",result.Documents[0].NormalizedState);
        Assert.Equal("2026-11-03T10:00:00",result.Documents[0].Source.GetProperty("Hareketler")[0].GetProperty("IslemTarihi").GetString());
    }
}
