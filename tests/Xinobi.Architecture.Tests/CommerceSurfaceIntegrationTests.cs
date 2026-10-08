using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xinobi.Api.Features.ProductSurfaces.Development;
using Xinobi.Api.LocalCommerce;
namespace Xinobi.Architecture.Tests;
public sealed class CommerceSurfaceIntegrationTests : IDisposable
{
 private readonly string data = Path.Combine(Path.GetTempPath(), "xinobi-integration-"+Guid.NewGuid());
 private static string Repo() { var dir=new DirectoryInfo(AppContext.BaseDirectory); while(dir is not null && !File.Exists(Path.Combine(dir.FullName,"XinobiYeni.slnx")))dir=dir.Parent;return dir!.FullName; }
 private WebApplicationFactory<Program> Factory(bool enabled=true,string environment="Development") => new WebApplicationFactory<Program>().WithWebHostBuilder(b=>{
  b.UseEnvironment(environment);
  // Program reads this while building services, before ConfigureAppConfiguration sources apply; UseSetting is visible then.
  b.UseSetting("DesignStudio:WorkerEnabled","false");
  b.ConfigureAppConfiguration((_,c)=>c.AddInMemoryCollection(new Dictionary<string,string?>{
   ["LocalCommerce:DataDirectory"]=data,["DesignStudio:WorkerEnabled"]="false",["DesignStudio:ExternalInferenceEnabled"]="false",
   ["ProductSurfaces:DevelopmentStorefrontPreview:Enabled"]=enabled.ToString(),["ProductSurfaces:DevelopmentStorefrontPreview:RepositoryRoot"]=Repo(),
   ["ProductSurfaces:DevelopmentReview:Enabled"]="false",["ProductSurfaces:Segmentation:ExternalInferenceEnabled"]="false"
  }));
 });
 private static string Url(string product="DEMO-P101",string variant="DEMO-V101-B")=>DevelopmentAcceptedSurface.CommerceRoute.Replace("{productReference}",product).Replace("{variantReference}",variant);
 [Fact] public async Task ExactCommerceAssociationUsesAcceptedManualSourceAndBranding()
 {
  using var f=Factory();using var c=f.CreateClient();
  var bundle=(await c.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url()))!;
  Assert.True(bundle.PreviewAvailable);Assert.Equal("DEMO-P101",bundle.ProductReference);Assert.Equal("DEMO-V101-B",bundle.VariantReference);
  Assert.Equal(DevelopmentAcceptedSurface.SourceSha,bundle.Inputs!.Source.Sha256);
  Assert.Equal(DevelopmentAcceptedSurface.MaskSha,bundle.Inputs.Mask.Sha256);
  Assert.Equal((1066,1600),(bundle.Inputs.Width,bundle.Inputs.Height));
  Assert.True(bundle.Inputs.BrandingRequired);Assert.Equal(DevelopmentAcceptedSurface.BrandingSha,bundle.Inputs.Branding!.Sha256);
  Assert.DoesNotContain(f.Services.GetServices<Microsoft.Extensions.Hosting.IHostedService>(),s=>s is Xinobi.Api.DesignStudio.DesignGenerationWorker);
 }
 [Theory][InlineData("DEMO-P101","DEMO-V101-S")][InlineData("DEMO-P101","DEMO-V101-R")][InlineData("DEMO-P101","DEMO-V101-G")][InlineData("other","DEMO-V101-B")][InlineData("DEMO-P101","blue")]
 public async Task UnsupportedCommerceIdentityNeverAliasesBlue(string product,string variant)
 {using var f=Factory();using var c=f.CreateClient();var b=(await c.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url(product,variant)))!;Assert.False(b.PreviewAvailable);Assert.Null(b.Inputs);}
 [Theory][InlineData("/assets/products/tea-maker-101-red.webp")][InlineData("/api/v1/local-commerce/media/00000000000000000000000000000000.webp")]
 public async Task ChangedSelectedMediaFailsClosed(string image)
 {
  using var f=Factory();using var c=f.CreateClient();
  await f.Services.GetRequiredService<LocalCommerceStore>().Update(s=>s with {Products=s.Products.Select(p=>p.Id=="DEMO-P101"?p with {Variants=p.Variants.Select(v=>v.Id=="DEMO-V101-B"?v with {Image=image}:v).ToArray()}:p).ToArray()});
  Assert.False((await c.GetFromJsonAsync<DevelopmentSurfaceBundle>(Url()))!.PreviewAvailable);
 }
 [Theory][InlineData(false,"Development")][InlineData(true,"Production")]
 public async Task CommerceBridgeRequiresExistingDevelopmentGate(bool enabled,string environment)
 {using var f=Factory(enabled,environment);using var c=f.CreateClient(new(){AllowAutoRedirect=false});Assert.Equal(System.Net.HttpStatusCode.NotFound,(await c.GetAsync(Url())).StatusCode);}
 public void Dispose(){if(Directory.Exists(data))Directory.Delete(data,true);}
}
