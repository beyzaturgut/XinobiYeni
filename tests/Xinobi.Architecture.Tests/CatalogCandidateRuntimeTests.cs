using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using SkiaSharp;
using Xinobi.Api.Catalog;
using Xinobi.Api.LocalCommerce;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;
namespace Xinobi.Architecture.Tests;
public sealed class CatalogCandidateRuntimeTests
{
 private static readonly string Root=Path.GetFullPath(Path.Combine(AppContext.BaseDirectory,"../../../../../"));
 private sealed class MockHttp(CatalogCandidateRequest expected,byte[] source):HttpMessageHandler
 {
  public int Calls;
  protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken token){
   Calls++;Assert.Equal(HttpVersion.Version11,request.Version);Assert.True(request.Headers.ConnectionClose);Assert.Equal("https://serverless.roboflow.com/sam3/concept_segment",request.RequestUri!.AbsoluteUri);
   using var payload=JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));Assert.Equal(expected.Target,payload.RootElement.GetProperty("prompts")[0].GetProperty("text").GetString());Assert.Equal(source,Convert.FromBase64String(payload.RootElement.GetProperty("image").GetProperty("value").GetString()!));
   var a=expected.Width/4;var b=expected.Width/2;var result=JsonSerializer.Serialize(new{prompt_results=new[]{new{prompt_index=0,predictions=new[]{new{format="rle",masks=new{size=new[]{expected.Height,expected.Width},counts=new[]{expected.Height*a,expected.Height*b,expected.Height*(expected.Width-a-b)}},confidence=.9}}}}});
   return new HttpResponseMessage(HttpStatusCode.OK){Content=new StringContent(result,Encoding.UTF8,"application/json")};
  }
 }

 private sealed class FakeCatalog(CommerceState state):ICatalogSource{public Task<CommerceState> ReadAsync()=>Task.FromResult(state);}
 [Fact]
 public async Task IneligibleMissingOrExternalImagesCannotClaimAttemptOrReadCredential()
 {
  var data=Path.Combine(Root,"services/api/App_Data/real-catalog-qa");var state=await new SnapshotCatalogSource(Path.Combine(data,"state.json")).ReadAsync();
  var p=state.Products.First(p=>p.Personalizable==true);var v=p.Variants.First();
  foreach(var invalid in new[]{p with{Active=false},p with{Personalizable=false},p with{Variants=[v with{Image="https://external.invalid/product.png"}]},p with{Variants=[v with{Image=""}]},p with{Variants=[v with{Image="/api/v1/local-commerce/media/"+new string('a',32)+".png"}]}}){
   var directory=Path.Combine(Root,"services/api/App_Data/integration-runtime/catalog-denied-"+Guid.NewGuid());
   var runtime=new CatalogCandidateRuntime(new FakeCatalog(state with{Products=[invalid]}),Path.Combine(data,"media"),directory);
   var request=new CatalogCandidateRequest(Guid.NewGuid(),p.Id,v.Id,new string('0',64),1,1,"body",true);
   await Assert.ThrowsAnyAsync<Exception>(()=>runtime.ExecuteAsync(request,()=>throw new Exception("Credential must not load"),()=>throw new Exception("HTTP must not load"),true));
   Assert.False(Directory.Exists(directory));
  }
 }
 [Fact]
 public async Task TwoRealCatalogVariantsMockProviderCreatesOnlyIsolatedPendingAndCannotRetry()
 {
  var data=Path.Combine(Root,"services/api/App_Data/real-catalog-qa");var catalog=new SnapshotCatalogSource(Path.Combine(data,"state.json"));var state=await catalog.ReadAsync();
  foreach(var product in state.Products.Where(p=>p.Active&&p.Personalizable==true)){
   var variant=product.Variants.First();var bytes=File.ReadAllBytes(Path.Combine(data,"media",Path.GetFileName(variant.Image)));using var info=SKBitmap.Decode(bytes);
   var request=new CatalogCandidateRequest(Guid.NewGuid(),product.Id,variant.Id,Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),info.Width,info.Height,"designable body",true);
   var directory=Path.Combine(Root,"services/api/App_Data/integration-runtime/catalog-mock-"+Guid.NewGuid());var runtime=new CatalogCandidateRuntime(catalog,Path.Combine(data,"media"),directory);var http=new MockHttp(request,bytes);
   var id=await runtime.ExecuteAsync(request,()=>"fake-test-only",()=>http,true);Assert.Equal(request.AttemptId,id);Assert.Equal(1,http.Calls);Assert.False(Directory.Exists(Path.Combine(directory,"accepted")));
   using var metadata=JsonDocument.Parse(File.ReadAllText(Path.Combine(directory,"pending",id.ToString(),"candidate.json")));Assert.Equal("pending",metadata.RootElement.GetProperty("status").GetString());Assert.False(metadata.RootElement.GetProperty("approved").GetBoolean());Assert.Equal(product.Id,metadata.RootElement.GetProperty("productId").GetString());
   var loads=0;await Assert.ThrowsAsync<SegmentationProviderException>(()=>runtime.ExecuteAsync(request,()=>{loads++;return "fake";},()=>throw new Exception(),true));Assert.Equal(0,loads);
   await Assert.ThrowsAsync<SegmentationProviderException>(()=>runtime.ExecuteAsync(request with{AttemptId=Guid.NewGuid(),VariantId="wrong"},()=>throw new Exception(),()=>throw new Exception(),true));
   await Assert.ThrowsAsync<SegmentationProviderException>(()=>runtime.ExecuteAsync(request with{AttemptId=Guid.NewGuid(),Sha256=new string('0',64)},()=>throw new Exception(),()=>throw new Exception(),true));
  }
 }

 private sealed class MultiHttp(string[] prompts,byte[] bytes,int w,int h):HttpMessageHandler {
  public int Calls;
  protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken token){
   Calls++;Assert.Equal(HttpVersion.Version11,request.Version);Assert.True(request.Headers.ConnectionClose);using var payload=JsonDocument.Parse(await request.Content!.ReadAsStringAsync(token));Assert.Equal(prompts,payload.RootElement.GetProperty("prompts").EnumerateArray().Select(p=>p.GetProperty("text").GetString()));Assert.Equal(bytes,Convert.FromBase64String(payload.RootElement.GetProperty("image").GetProperty("value").GetString()!));
   var prediction=new{format="rle",masks=new{size=new[]{h,w},counts=new[]{h*(w/4),h*(w/2),h*(w-w/4-w/2)}},confidence=.8};
   return new(HttpStatusCode.OK){Content=new StringContent(JsonSerializer.Serialize(new{prompt_results=prompts.Select((p,i)=>new{prompt_index=i,predictions=new[]{prediction,prediction}})}),Encoding.UTF8,"application/json")};
  }
 }
 [Fact]
 public async Task PresetsAndManualRetainAllBoundedChoicesAsPendingWithoutApproval()
 {
  var data=Path.Combine(Root,"services/api/App_Data/real-catalog-qa");var catalog=new SnapshotCatalogSource(Path.Combine(data,"state.json"));var p=(await catalog.ReadAsync()).Products.First(p=>p.Active&&p.Personalizable==true);var v=p.Variants.First();var bytes=File.ReadAllBytes(Path.Combine(data,"media",Path.GetFileName(v.Image)));using var info=SKBitmap.Decode(bytes);
  foreach(var mode in new[]{"upper","lower","both","manual"}){
   var prompts=mode switch{"upper"=>new[]{"upper teapot body"},"lower"=>new[]{"lower kettle body"},"both"=>new[]{"upper teapot body","lower kettle body"},_=>new[]{"coffee machine designable body"}};
   var request=new CatalogCandidateRequest(Guid.NewGuid(),p.Id,v.Id,Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant(),info.Width,info.Height,prompts[0],true,mode,true);var directory=Path.Combine(Root,"services/api/App_Data/integration-runtime/multi-runtime-"+Guid.NewGuid());var runtime=new CatalogCandidateRuntime(catalog,Path.Combine(data,"media"),directory);var handler=new MultiHttp(prompts,bytes,info.Width,info.Height);
   var id=await runtime.ExecuteAsync(request,()=>"fake-mock-only",()=>handler,true);Assert.Equal(1,handler.Calls);using var record=JsonDocument.Parse(File.ReadAllText(Path.Combine(directory,"pending",id.ToString(),"candidate.json")));var options=record.RootElement.GetProperty("options");Assert.Equal(prompts.Length*2,options.GetArrayLength());Assert.Equal(options.GetArrayLength(),options.EnumerateArray().Select(o=>o.GetProperty("id").GetGuid()).Distinct().Count());Assert.All(options.EnumerateArray(),o=>Assert.True(File.Exists(Path.Combine(directory,"pending",id.ToString(),o.GetProperty("file").GetString()!))));Assert.False(record.RootElement.GetProperty("approved").GetBoolean());Assert.False(Directory.Exists(Path.Combine(directory,"accepted")));await Assert.ThrowsAsync<SegmentationProviderException>(()=>runtime.ExecuteAsync(request,()=>throw new Exception("credential must not load twice"),()=>handler,true));Assert.Equal(1,handler.Calls);
  }
 }
}
