using System.Net;
using Xinobi.Api.Catalog;
namespace Xinobi.Api.Infrastructure.Segmentation.Roboflow;
public sealed record Cm101AdminAttempt(Guid AttemptId, string ProductId, string VariantId, string Sha256, string Target, bool AcknowledgeCredits);
public static class Cm101AdminCandidateEndpoint
{
 public static void MapCm101AdminCandidate(this WebApplication app)
 {
  if (!app.Environment.IsDevelopment() || !app.Configuration.GetValue<bool>("ProductSurfaces:Cm101AdminAutomatic:Enabled")) return;
  var busy = new SemaphoreSlim(1, 1);
  app.MapPost("/api/v1/admin/dev/cm101-candidate", async (HttpContext context, Cm101AdminAttempt request) => {
   if (context.Connection.RemoteIpAddress is not { } address || !IPAddress.IsLoopback(address) ||
       context.Request.Headers.Origin != "http://127.0.0.1:5176") return Results.StatusCode(403);
   if (request.AttemptId == Guid.Empty || !request.AcknowledgeCredits || request.ProductId != Cm101CatalogSourceResolver.ProductId ||
       request.VariantId != Cm101CatalogSourceResolver.VariantId || request.Sha256 != Cm101CatalogSourceResolver.Source.Sha256 ||
       request.Target != Cm101CatalogSourceResolver.Target.AutomaticPrompt) return Results.StatusCode(409);
   var c = app.Configuration;
   var gates = new Cm101CandidateGates(true, c.GetValue<bool>("ProductSurfaces:DevelopmentReview:Enabled"),
       c.GetValue<bool>("ProductSurfaces:Cm101Candidate:Enabled"), c.GetValue<bool>("ProductSurfaces:Segmentation:ExternalInferenceEnabled"), c["ProductSurfaces:Segmentation:Provider"] ?? "reference");
   if (!gates.Allows) return Results.StatusCode(503);
   if (!await busy.WaitAsync(0)) return Results.StatusCode(409);
   try {
    var root = Cm101CandidateCommand.Workspace;
    var directory = Path.Combine(root, "services/api/App_Data/real-catalog-qa");
    var source = new Cm101CatalogSourceResolver(new SnapshotCatalogSource(Path.Combine(directory,"state.json")), Path.Combine(directory,"media"));
    using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(120));
    var result = await new Cm101PendingCandidateRunner(source, Path.Combine(root,"services/api/App_Data/cm101-sam3-review"))
      .ExecuteAsync(request.AttemptId, gates, () => c["ProductSurfaces:Segmentation:Roboflow:ApiKey"], Cm101RestrictedRequestHandler.CreateTransport, cancellationToken: timeout.Token);
    return Results.Ok(new { status="pending", attemptId=request.AttemptId, approved=false, directory=result });
   } catch (SegmentationProviderException error) { return Results.Json(new { error=error.Message, retry=false }, statusCode:409); }
     catch { return Results.Json(new { error="candidate_failed_or_uncertain", retry=false }, statusCode:502); }
   finally { busy.Release(); }
  }).AllowAnonymous();
 }
}
