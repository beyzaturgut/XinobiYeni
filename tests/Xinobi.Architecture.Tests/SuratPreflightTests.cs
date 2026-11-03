using System.Net;
using System.Net.Sockets;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.Shipping;

namespace Xinobi.Architecture.Tests;

public class SuratPreflightTests
{
    private sealed class Handler(Func<HttpRequestMessage, HttpResponseMessage> handle) : HttpMessageHandler
    {
        public readonly List<(HttpMethod Method, Uri Uri)> Requests = [];
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            lock(Requests) Requests.Add((request.Method, request.RequestUri!));
            return Task.FromResult(handle(request));
        }
    }
    private static IConfiguration Config(params (string Key,string Value)[] pairs) => new ConfigurationBuilder().AddInMemoryCollection(pairs.Select(p=>new KeyValuePair<string,string?>(p.Key,p.Value))).Build();
    private static HttpResponseMessage Reply(int status,string body,string? server=null)
    {
        var response=new HttpResponseMessage((HttpStatusCode)status){Content=new StringContent(body)};
        if(server!=null)response.Headers.TryAddWithoutValidation("Server",server);
        return response;
    }
    [Fact] public async Task Default_is_credential_free_GET_to_two_fixed_roots_only()
    {
        var handler=new Handler(_=>Reply(403,"Access denied by Cloudflare. request blocked","cloudflare"));
        var result=await SuratPreflightCommand.Check(new HttpClient(handler),Config(("Shipping:Surat:Production:Password","LIVE-SENTINEL")),false,false);
        Assert.Equal(2,handler.Requests.Count);Assert.All(handler.Requests,r=>{Assert.Equal(HttpMethod.Get,r.Method);Assert.Equal("/",r.Uri.AbsolutePath);Assert.Equal("",r.Uri.Query);});
        Assert.False(result.CreatedShipment);Assert.Null(result.SandboxAccountConfigured);
        Assert.All(result.Probes,p=>{Assert.Equal("http_forbidden",p.Result);Assert.True(p.CloudflareHeader);Assert.True(p.AccessDeniedMarker);});
        Assert.DoesNotContain("LIVE-SENTINEL",JsonSerializer.Serialize(result));
    }
    [Fact] public async Task Explicit_account_probe_uses_only_test_credentials_and_never_reports_queries_or_body()
    {
        var handler=new Handler(r=>r.RequestUri!.AbsolutePath=="/"?Reply(403,"blocked","cloudflare"):
            Reply(200,"{\"IsError\":false,\"Gonderiler\":[],\"debug\":\"TEST-PRIVATE-PASSWORD\"}"));
        var config=Config(("Shipping:Surat:Mode","Production"),("Shipping:Surat:Sandbox:Username","TEST-PRIVATE-USER"),("Shipping:Surat:Sandbox:Password","TEST-PRIVATE-PASSWORD"),
            ("Shipping:Surat:Production:Username","LIVE-PRIVATE-USER"),("Shipping:Surat:Production:Password","LIVE-PRIVATE-PASSWORD"));
        var result=await SuratPreflightCommand.Check(new HttpClient(handler),config,true,false);
        Assert.Equal(3,handler.Requests.Count);var account=Assert.Single(handler.Requests,r=>r.Method==HttpMethod.Post);
        Assert.Equal("api02.suratkargo.com.tr",account.Uri.Host);Assert.Equal("/api/KargoTakipHareketDetayi",account.Uri.AbsolutePath);
        Assert.Contains("TEST-PRIVATE-USER",account.Uri.Query);Assert.DoesNotContain("LIVE-PRIVATE",account.Uri.ToString());
        Assert.True(result.SandboxAccountConfigured);Assert.Equal("tracking_response_received",result.Probes[^1].Result);Assert.Equal(0,result.Probes[^1].ShipmentCount);
        var output=JsonSerializer.Serialize(result);Assert.DoesNotContain("PRIVATE",output);Assert.DoesNotContain("Sifre",output);Assert.DoesNotContain("?",output);Assert.DoesNotContain("debug",output);
    }
    [Fact] public async Task Exact_provider_not_found_is_diagnostic_success_not_auth_or_delivery_claim()
    {
        var h=new Handler(r=>r.RequestUri!.AbsolutePath=="/"?Reply(302,"redirect"):Reply(200,"{\"IsError\":true,\"errorMessage\":\"Sipariş bulunamadı.\",\"Gonderiler\":[]}"));
        var result=await SuratPreflightCommand.Check(new HttpClient(h),Config(("Shipping:Surat:Sandbox:Username","fixture-user"),("Shipping:Surat:Sandbox:Password","fixture-secret")),true,false);
        Assert.Equal("tracking_reference_not_found",result.Probes[^1].Result);Assert.True(result.Probes[^1].ProviderIsError);Assert.Equal(0,result.Probes[^1].ShipmentCount);
        Assert.False(result.CreatedShipment);
    }
    [Fact] public async Task Missing_test_account_skips_authenticated_request()
    {
        var h=new Handler(_=>Reply(200,"root"));var result=await SuratPreflightCommand.Check(new HttpClient(h),Config(),true,false);
        Assert.Equal(2,h.Requests.Count);Assert.False(result.SandboxAccountConfigured);Assert.Equal("not_configured",result.Probes[^1].Result);
    }
    [Fact] public async Task Optional_egress_lookup_is_explicit_and_validates_IP()
    {
        var h=new Handler(r=>r.RequestUri!.Host=="api.ipify.org"?Reply(200,"{\"ip\":\"192.0.2.10\"}"):Reply(200,"root"));
        var result=await SuratPreflightCommand.Check(new HttpClient(h),Config(),false,true);
        Assert.Equal(3,h.Requests.Count);Assert.Equal("192.0.2.10",result.Probes[^1].EgressIp);
    }
    [Theory] [InlineData(302,"redirect_blocked")] [InlineData(403,"http_forbidden")] [InlineData(500,"http_error")]
    public async Task Status_is_reported_without_echoing_secret_response(int status,string expected)
    {
        var h=new Handler(_=>Reply(status,"Sifre=DO-NOT-PRINT"));var result=await SuratPreflightCommand.Check(new HttpClient(h),Config(),false,false);
        Assert.All(result.Probes,p=>Assert.Equal(expected,p.Result));Assert.DoesNotContain("DO-NOT-PRINT",JsonSerializer.Serialize(result));
    }
    [Fact] public async Task Network_failure_never_echoes_exception_URL()
    {
        var h=new Handler(_=>throw new HttpRequestException("https://provider/?Sifre=DO-NOT-PRINT",new SocketException()));
        var result=await SuratPreflightCommand.Check(new HttpClient(h),Config(),false,false);
        Assert.All(result.Probes,p=>Assert.Equal("connection_failure",p.Result));Assert.DoesNotContain("DO-NOT-PRINT",JsonSerializer.Serialize(result));
    }
    [Fact] public async Task Invalid_options_exit_without_loading_settings_or_network()
    {
        using var writer=new StringWriter();Assert.Equal(2,await SuratPreflightCommand.RunAsync([SuratPreflightCommand.Command,"--unknown"],writer));
        Assert.Contains("invalid_preflight_option",writer.ToString());
    }
}
