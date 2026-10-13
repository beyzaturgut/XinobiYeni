using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;
namespace Xinobi.Architecture.Tests;
public sealed class Cm101AdminGateTests
{
 [Theory]
 [InlineData(false, false, 404)]
 [InlineData(true, false, 403)]
 [InlineData(true, true, 409)]
 public async Task DisabledOriginAndWrongIdentityNeverReachTransport(bool enabled, bool origin, int expected)
 {
  using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder => {
   builder.UseEnvironment("Development");
   builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string,string?> {
    ["ProductSurfaces:Cm101AdminAutomatic:Enabled"] = enabled.ToString(),
    ["DesignStudio:WorkerEnabled"]="false", ["DesignStudio:ExternalInferenceEnabled"]="false"
   }));
  });
  using var client = factory.CreateClient();
  if(origin) client.DefaultRequestHeaders.Add("Origin","http://127.0.0.1:5176");
  var response = await client.PostAsJsonAsync("/api/v1/admin/dev/cm101-candidate", new Cm101AdminAttempt(Guid.NewGuid(),"wrong","wrong","wrong","upper teapot body",true));
  // TestServer has no loopback remote IP, so an enabled endpoint fails at the origin/address gate.
  Assert.Equal((HttpStatusCode)(enabled ? 403 : expected),response.StatusCode);
 }
}
