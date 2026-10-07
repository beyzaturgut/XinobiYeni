using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.DesignStudio;
namespace Xinobi.Architecture.Tests;
public sealed class CloudflareProviderTests
{
    private static IConfiguration Config => new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?> { ["Cloudflare:AccountId"] = new string('a',32), ["Cloudflare:ApiToken"] = "test-server-only-token" }).Build();
    private const string Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==";
    [Fact]
    public async Task AdapterUsesOfficialEndpointAndAcceptsVerifiedImageBytes()
    {
        var handler=new Handler(async request=>{
            Assert.Equal("api.cloudflare.com",request.RequestUri!.Host);
            Assert.EndsWith("/ai/run/@cf/black-forest-labs/flux-1-schnell",request.RequestUri.AbsolutePath);
            Assert.Equal("Bearer",request.Headers.Authorization!.Scheme);
            using var payload=JsonDocument.Parse(await request.Content!.ReadAsStringAsync());
            Assert.Equal("safe decorative artwork",payload.RootElement.GetProperty("prompt").GetString());
            Assert.Equal(4,payload.RootElement.GetProperty("steps").GetInt32());
            var response=new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(JsonSerializer.Serialize(new{success=true,result=new{image=Png}}),Encoding.UTF8,"application/json")};
            response.Headers.Add("cf-ray","test-ray");return response;
        });
        using var client=new HttpClient(handler);var provider=new CloudflareImageProvider(client,Config);
        var image=await provider.GenerateAsync("safe decorative artwork",CancellationToken.None);
        Assert.Equal("image/png",image.Mime);Assert.Equal(Convert.FromBase64String(Png),image.Bytes);Assert.Equal("test-ray",image.ProviderRequestId);
    }
    [Theory]
    [InlineData(403,"provider_credentials")]
    [InlineData(429,"provider_quota")]
    public async Task ProviderErrorsAreNormalizedWithoutLeakingResponseBody(int status,string code)
    {
        using var client=new HttpClient(new Handler(_=>Task.FromResult(new HttpResponseMessage((HttpStatusCode)status){Content=new StringContent("sensitive provider details")})));
        var provider=new CloudflareImageProvider(client,Config);
        var error=await Assert.ThrowsAsync<DesignProviderException>(()=>provider.GenerateAsync("safe artwork",CancellationToken.None));
        Assert.Equal(code,error.Code);Assert.DoesNotContain("sensitive",error.Message);
    }
    private sealed class Handler(Func<HttpRequestMessage,Task<HttpResponseMessage>> respond):HttpMessageHandler
    { protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken token)=>respond(request); }
}
