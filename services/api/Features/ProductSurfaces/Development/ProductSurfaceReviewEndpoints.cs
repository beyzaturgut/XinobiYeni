using System.Net;

namespace Xinobi.Api.Features.ProductSurfaces.Development;

public static class ProductSurfaceReviewEndpoints
{
    public static void MapDevelopmentSurfaceReview(this WebApplication app, DevelopmentSurfaceReview state)
    {
        // Development tooling under the default-deny policy (Faz03 03.04): open like local-commerce, guarded by Development + loopback below.
        var group = app.MapGroup(DevelopmentSurfaceReview.Route).WithTags("DevelopmentProductSurfaces").AllowAnonymous();
        group.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            var remote = http.Connection.RemoteIpAddress;
            if ((remote is not null && !IPAddress.IsLoopback(remote)) ||
                http.Request.Host.Host is not ("localhost" or "127.0.0.1" or "::1"))
                return Problem(http, 404, "development_local_only");
            if (HttpMethods.IsPost(http.Request.Method))
            {
                var origin = http.Request.Headers.Origin.ToString();
                if (origin != "http://localhost:5173" && origin != "http://127.0.0.1:5173" && origin != "http://127.0.0.1:5174" && origin != "http://127.0.0.1:5176")
                    return Problem(http, 403, "development_origin_required");
            }
            http.Response.Headers.CacheControl = "no-store";
            try { return await next(context); }
            catch (ReviewHttpException error) { return Problem(http, error.Status, error.Message); }
        });
        group.MapGet("/review", async () => Results.Ok(await state.GetAsync()));
        if (state.SmokeEvidence is not null)
            group.MapGet("/smoke-evidence", () => Results.Ok(state.SmokeEvidence));
        group.MapPost("/revisions", async (RevisionRequest request, CancellationToken cancellationToken) => Results.Ok(await state.GenerateAsync(request, cancellationToken)));
        group.MapPost("/revisions/{revisionId:guid}/candidates/{candidateId:guid}/review",
            async (Guid revisionId, Guid candidateId, DecisionRequest request) => Results.Ok(await state.ReviewAsync(revisionId, candidateId, request)));
        group.MapPost("/revisions/{revisionId:guid}/candidates/{candidateId:guid}/refine",
            async (Guid revisionId, Guid candidateId, RefinementRequest request) => Results.Ok(await state.RefineAsync(revisionId, candidateId, request)));
        group.MapGet("/source", async () => Results.Bytes(await state.SourceBytesAsync(), "image/webp"));
        group.MapPost("/revisions/{revisionId:guid}/candidates/{candidateId:guid}/correct",
            async (Guid revisionId, Guid candidateId, CorrectionRequest request) => Results.Ok(await state.CorrectAsync(revisionId, candidateId, request)));
        group.MapGet("/revisions/{revisionId:guid}/candidates/{candidateId:guid}/mask",
            async (Guid revisionId, Guid candidateId) => Results.Bytes(await state.MaskBytesAsync(revisionId, candidateId), "image/png"));
    }

    private static IResult Problem(HttpContext http, int status, string code) => Results.Problem(
        statusCode: status, title: "Ürün yüzeyi inceleme işlemi tamamlanamadı.", type: $"urn:xinobi:product-surfaces:{code}",
        extensions: new Dictionary<string, object?> { ["code"] = code, ["requestId"] = http.TraceIdentifier, ["timestampUtc"] = DateTimeOffset.UtcNow });
}
