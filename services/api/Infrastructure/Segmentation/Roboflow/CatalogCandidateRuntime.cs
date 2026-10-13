using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Xinobi.Api.Catalog;
using Xinobi.Api.Features.ProductSurfaces;
using Xinobi.Api.Infrastructure.MediaValidation;
namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;
public sealed record CatalogCandidateRequest(Guid AttemptId,string ProductId,string VariantId,string Sha256,int Width,int Height,string Target,bool AcknowledgeCredits);
public sealed class CatalogCandidateRuntime(ICatalogSource catalog,string mediaDirectory,string directory)
{
 private static readonly JsonSerializerOptions Json=new(JsonSerializerDefaults.Web){WriteIndented=true};
 public async Task<(SourceMediaIdentity Identity,byte[] Bytes,string Image)> ResolveAsync(CatalogCandidateRequest request)
 {
  var state=await catalog.ReadAsync();var products=state.Products.Where(p=>p.Id==request.ProductId&&p.Active&&CatalogProjection.IsPersonalizable(p)).ToArray();
  var variants=products.Length==1?products[0].Variants.Where(v=>v.Id==request.VariantId).ToArray():[];
  if(variants.Length!=1)throw new SegmentationProviderException("catalog_variant_ineligible",409);
  var image=variants[0].Image??"";if(!System.Text.RegularExpressions.Regex.IsMatch(image,@"^/api/v1/local-commerce/media/[a-f0-9]{32}\.(png|jpg|webp)$"))throw new SegmentationProviderException("catalog_image_unavailable",409);
  var file=Path.Combine(mediaDirectory,Path.GetFileName(image));var info=new FileInfo(file);
  if(!info.Exists||info.Length is <=0 or >20*1024*1024||info.LinkTarget is not null)throw new SegmentationProviderException("catalog_image_unavailable",409);
  var bytes=await File.ReadAllBytesAsync(file);var sha=Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
  var version=Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(image+"\n"+sha))).ToLowerInvariant();
  var identity=new AlignedImageInspector().InspectSource(bytes,"dev:catalog:"+version);
  if(identity.Sha256!=request.Sha256||identity.Width!=request.Width||identity.Height!=request.Height||identity.Width>6000||identity.Height>6000||(long)identity.Width*identity.Height>20000000)throw new SegmentationProviderException("catalog_source_mismatch",409);
  return(identity,bytes,image);
 }
 public async Task<Guid> ExecuteAsync(CatalogCandidateRequest request,Func<string?> credential,Func<HttpMessageHandler> transport,bool mockTest=false,CancellationToken token=default)
 {
  if(request.AttemptId==Guid.Empty||!request.AcknowledgeCredits||string.IsNullOrWhiteSpace(request.Target)||request.Target.Length>160||request.Target.Any(char.IsControl))throw new SegmentationProviderException("catalog_explicit_consent_required",409);
  var source=await ResolveAsync(request);token.ThrowIfCancellationRequested();
  var attempts=Path.Combine(directory,"attempts");Directory.CreateDirectory(attempts);
  try{using var claim=new FileStream(Path.Combine(attempts,request.AttemptId+".json"),FileMode.CreateNew,FileAccess.Write,FileShare.None);JsonSerializer.Serialize(claim,new{request.AttemptId,request.ProductId,request.VariantId,sourceSha256=source.Identity.Sha256,request.Target,consent="Explicit third-party image transmission and potential credit usage",authorizedAtUtc=DateTimeOffset.UtcNow,state="claimed-no-refund",mockTest},Json);claim.Flush(true);}
  catch(IOException){throw new SegmentationProviderException("catalog_attempt_consumed_or_unknown",409);}
  var key=credential();if(string.IsNullOrWhiteSpace(key))throw new SegmentationProviderException("catalog_credential_missing",503);
  using var client=new HttpClient(new RestrictedCatalogHandler(transport())){Timeout=Timeout.InfiniteTimeSpan};var masks=new DevelopmentMaskBuffer();
  var provider=new RoboflowSurfaceSegmentationProvider(client,new(){ApiKey=key},true,identity=>identity==source.Identity?source.Bytes:throw new SegmentationProviderException("provider_source_mismatch",409),masks);
  var analysis=new SurfaceAnalysis(source.Identity,new SurfaceIntent("catalog-reviewed-target",request.Target));
  var revision=await new SurfaceSegmentationService(provider).GenerateAutomaticAsync(analysis,analysis.Source,token);
  var current=await ResolveAsync(request);if(current.Identity!=source.Identity||current.Image!=source.Image)throw new SegmentationProviderException("catalog_source_changed",409);
  var candidate=revision.Candidates.Single();if(candidate.ReviewStatus!=CandidateReviewStatus.Pending||analysis.ActiveApproval is not null)throw new SegmentationProviderException("catalog_candidate_not_pending",409);
  var mask=masks.Bytes(candidate.Mask.AssetReference);new AlignedImageInspector().ValidateMask(mask,candidate.Mask.AssetReference,source.Identity,source.Identity);
  var pending=Path.Combine(directory,"pending");Directory.CreateDirectory(pending);var staging=Path.Combine(pending,".pending-"+request.AttemptId);var dest=Path.Combine(pending,request.AttemptId.ToString());Directory.CreateDirectory(staging);
  await File.WriteAllBytesAsync(Path.Combine(staging,"candidate-mask.png"),mask,token);
  var sourceVersion=Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(source.Image+"\n"+source.Identity.Sha256))).ToLowerInvariant();
  await File.WriteAllTextAsync(Path.Combine(staging,"candidate.json"),JsonSerializer.Serialize(new{candidateId=request.AttemptId,request.ProductId,request.VariantId,sourceImage=source.Image,sourceSha256=source.Identity.Sha256,sourceVersion,width=source.Identity.Width,height=source.Identity.Height,maskSha256=Convert.ToHexString(SHA256.HashData(mask)).ToLowerInvariant(),target=request.Target,status="pending",provenance=mockTest?"MOCK TEST ONLY":"REAL ROBOFLOW OUTPUT",analysisId=analysis.Id,revisionId=revision.Id,providerCandidateId=candidate.Id,approved=false},Json),token);
  Directory.Move(staging,dest);return request.AttemptId;
 }
 public sealed class RestrictedCatalogHandler(HttpMessageHandler inner):DelegatingHandler(inner)
 {
  private int attempts;
  protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request,CancellationToken token){
   if(request.Method!=HttpMethod.Post||request.RequestUri?.AbsoluteUri!="https://serverless.roboflow.com/sam3/concept_segment"||Interlocked.CompareExchange(ref attempts,1,0)!=0)throw new SegmentationProviderException("catalog_transport_denied",403);
   request.Version=HttpVersion.Version11;request.VersionPolicy=HttpVersionPolicy.RequestVersionExact;request.Headers.ConnectionClose=true;return base.SendAsync(request,token);
  }
 }
}
public static class CatalogCandidateEndpoint
{
 public static void MapCatalogCandidate(this WebApplication app){
  if(!app.Environment.IsDevelopment()||!app.Configuration.GetValue<bool>("ProductSurfaces:CatalogCandidate:Enabled"))return;
  var busy=new SemaphoreSlim(1,1);
  app.MapPost("/api/v1/admin/dev/catalog-candidate",async(HttpContext context,CatalogCandidateRequest request,ICatalogSource catalog)=>{
   if(context.Connection.RemoteIpAddress is not {} ip||!IPAddress.IsLoopback(ip)||context.Request.Headers.Origin!="http://127.0.0.1:5176")return Results.StatusCode(403);
   var c=app.Configuration;if(!c.GetValue<bool>("ProductSurfaces:DevelopmentReview:Enabled")||!c.GetValue<bool>("ProductSurfaces:Segmentation:ExternalInferenceEnabled")||c["ProductSurfaces:Segmentation:Provider"]!="roboflow")return Results.StatusCode(503);
   if(!await busy.WaitAsync(0))return Results.StatusCode(409);
   try{var root=Cm101CandidateCommand.Workspace;var data=c["LocalCommerce:DataDirectory"]??throw new InvalidOperationException();
    using var timeout=new CancellationTokenSource(TimeSpan.FromSeconds(120));var id=await new CatalogCandidateRuntime(catalog,Path.Combine(data,"media"),Path.Combine(root,"services/api/App_Data/catalog-surface-review")).ExecuteAsync(request,()=>c["ProductSurfaces:Segmentation:Roboflow:ApiKey"],Cm101RestrictedRequestHandler.CreateTransport,token:timeout.Token);
    return Results.Ok(new{candidateId=id,status="pending",approved=false});
   }catch{ return Results.Json(new{message="Maske oluşturulamadı; görsel uygunluğunu ve sağlayıcı ayarlarını kontrol edin. İstek otomatik tekrarlanmadı.",retry=false},statusCode:409);}
   finally{busy.Release();}
  }).AllowAnonymous();
 }
}
