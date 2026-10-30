using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Xinobi.Api.Catalog;
using Xinobi.Api.DesignStudio;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Designs;

public static class SavedDesignEndpoints
{
    public static void MapCustomerDesigns(RouteGroupBuilder me)
    {
        me.MapGet("/designs", async (ClaimsPrincipal user, SavedDesignStore designs) => TypedResults.Ok(await designs.Mine(Id(user))))
            .WithName("ListMyDesigns");

        me.MapGet("/design-configurations", async (ClaimsPrincipal user, SavedDesignStore designs) => TypedResults.Ok(await designs.Configurations(Id(user))))
            .WithName("ListMyDesignConfigurations");
        me.MapPost("/designs/{id}/configurations", async (string id, SaveDesignConfiguration request, ClaimsPrincipal user, SavedDesignStore designs, DesignSurfaceValidator surfaces, Print.PrintProfileStore profiles) =>
        {
            var design = await designs.Find(Id(user), id) ?? throw ProblemException.NotFound("design_not_found", "Tasarım bulunamadı.");
            await surfaces.Validate(design.ProductId, request.VariantId, request.Placement);
            var printSetup = await profiles.Setup(design.ProductId, request.VariantId, request.Placement);
            return TypedResults.Ok(await designs.SaveConfiguration(Id(user), id, request, printSetup));
        }).WithName("SaveMyDesignConfiguration");
        me.MapGet("/design-configurations/{id}/revisions/{revision:int}", async (string id, int revision, ClaimsPrincipal user, SavedDesignStore designs) =>
            TypedResults.Ok(await designs.Configuration(Id(user), id, revision))).WithName("GetMyDesignConfiguration");
        me.MapPut("/design-configurations/{id}/favorite", async (string id, SetConfigurationFavorite request, ClaimsPrincipal user, SavedDesignStore designs) =>
        { await designs.SetFavorite(Id(user), id, request.Favorite); return TypedResults.NoContent(); }).WithName("SetMyDesignConfigurationFavorite");

        me.MapPut("/design-configurations/{id}/revisions/{revision:int}/preview", async (string id, int revision, [FromForm] IFormFile file, ClaimsPrincipal user, SavedDesignStore designs) =>
        {
            if (file.Length is 0 or > 2 * 1024 * 1024) throw new ProblemException("invalid_preview", "Tasarım önizlemesi hazırlanamadı.");
            using var buffer = new MemoryStream();
            await file.CopyToAsync(buffer);
            await designs.SavePreview(Id(user), id, revision, buffer.ToArray());
            return TypedResults.NoContent();
        }).DisableAntiforgery().WithName("SaveMyDesignConfigurationPreview");
        me.MapGet("/design-configurations/{id}/revisions/{revision:int}/preview", async Task<Results<FileStreamHttpResult, NotFound>> (string id, int revision, ClaimsPrincipal user, SavedDesignStore designs) =>
            await designs.Preview(Id(user), id, revision) is { } preview ? TypedResults.Stream(preview.Content, "image/jpeg") : TypedResults.NotFound())
            .WithName("GetMyDesignConfigurationPreview");

        // The XINOBI U session store exists only where XINOBI U runs; it is resolved per request so the contract does not depend on it.
        me.MapPost("/designs", async Task<Results<Created<MyDesign>, ProblemHttpResult>> (SaveDesignFromSession request, ClaimsPrincipal user, HttpContext http, SavedDesignStore designs) =>
            {
                var sessions = http.RequestServices.GetService<DesignSessionStore>() ?? throw ProblemException.Unavailable("XINOBI U");
                var session = await sessions.Get(request.SessionId ?? "") ?? throw ProblemException.NotFound("session_expired", "Tasarım oturumu bulunamadı veya süresi doldu.");
                if (session.Status != "ready" || await sessions.Asset(session.Id) is not { } asset || !File.Exists(asset.Path))
                    throw new ProblemException("design_not_ready", "Tasarım henüz hazır değil.", StatusCodes.Status409Conflict);
                var profile = session.Questions.Select(question => $"{question.AxisLabel}: {question.Options.FirstOrDefault(option => session.Answers.Any(answer => answer.QuestionId == question.Id && answer.OptionId == option.Id))?.Label}")
                    .Where(line => !line.EndsWith(": ", StringComparison.Ordinal)).ToArray();
                var name = SavedDesignStore.CleanName(request.Name, $"{session.Product.Name} · XINOBI U");
                var saved = await designs.Add(Id(user), "ai", name, session.Product.Id, session.Product.Name, session.Variant.Id, session.Variant.Color, profile, await File.ReadAllBytesAsync(asset.Path));
                return TypedResults.Created($"/api/v1/me/designs/{saved.Id}", saved);
            })
            .WithName("SaveMyDesign")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        // Own image (K-14): multipart with the image and the product it was tried on.
        me.MapPost("/designs/upload", async Task<Results<Created<MyDesign>, ProblemHttpResult>> ([FromForm] IFormFile file, [FromForm] string productId, [FromForm] string? variantId, [FromForm] string? name,
                ClaimsPrincipal user, ICatalogSource catalog, SavedDesignStore designs) =>
            {
                if (file.Length is 0 or > SavedDesignStore.MaxUploadBytes) throw new ProblemException("invalid_image", "Görsel en fazla 8 MB olabilir.");
                var product = (await catalog.ReadAsync()).Products.FirstOrDefault(item => item.Id == productId && item.Active)
                    ?? throw ProblemException.NotFound("product_not_found", "Ürün bulunamadı.");
                var variant = product.Variants.FirstOrDefault(item => item.Id == variantId);
                using var buffer = new MemoryStream();
                await file.CopyToAsync(buffer);
                var saved = await designs.Add(Id(user), "upload", SavedDesignStore.CleanName(name, $"{product.Name} · Kendi görselim"), product.Id, product.Name, variant?.Id, variant?.Color, [], buffer.ToArray());
                return TypedResults.Created($"/api/v1/me/designs/{saved.Id}", saved);
            })
            .DisableAntiforgery()
            .WithName("UploadMyDesign")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict);

        me.MapPatch("/designs/{id}", async (string id, RenameDesign request, ClaimsPrincipal user, SavedDesignStore designs) => TypedResults.Ok(await designs.Rename(Id(user), id, request.Name)))
            .WithName("RenameMyDesign")
            .ProducesProblem(StatusCodes.Status404NotFound);

        me.MapDelete("/designs/{id}", async Task<Results<NoContent, ProblemHttpResult>> (string id, ClaimsPrincipal user, SavedDesignStore designs) =>
                await designs.Delete(Id(user), id) ? TypedResults.NoContent() : ApiProblems.Problem(StatusCodes.Status404NotFound, "design_not_found", "Tasarım bulunamadı."))
            .WithName("DeleteMyDesign")
            .ProducesProblem(StatusCodes.Status404NotFound);

        me.MapGet("/designs/{id}/image", async Task<Results<FileStreamHttpResult, NotFound>> (string id, ClaimsPrincipal user, SavedDesignStore designs) =>
                await designs.Image(Id(user), id) is { } image ? TypedResults.Stream(image.Content, image.ContentType) : TypedResults.NotFound())
            .WithName("GetMyDesignImage");
    }

    private static string Id(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.NameIdentifier)!;
}
