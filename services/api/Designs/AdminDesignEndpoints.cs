using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;
using Microsoft.OpenApi;

namespace Xinobi.Api.Designs;

public record AdminDesignRow(string Id, string Kind, string ProductId, string ProductName, string? VariantId, string? Color, DateTimeOffset CreatedAt)
{
    internal static AdminDesignRow From(SavedDesign design) => new(design.Id, design.Kind, design.ProductId, design.ProductName, design.VariantId, design.Color, design.CreatedAt);
}
public record AdminDesignDetails(string Id, string Kind, string ProductId, string ProductName, string? VariantId, string? Color, DateTimeOffset CreatedAt, string Mime);
public record AdminDesignPage(AdminDesignRow[] Items, int Page, int PageSize, int Total, int TotalPages);

public static class AdminDesignEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        var designs = admin.MapGroup("/designs").RequirePermission("print.read").WithProblems();
        designs.MapGet("", async (string? page, string? pageSize, SavedDesignStore store) =>
            await store.AdminList(Number(page, 1), Number(pageSize, 20)))
            .WithName("ListAdminDesigns").Produces<AdminDesignPage>()
            .AddOpenApiOperationTransformer((operation, _, _) =>
            {
                foreach (var parameter in operation.Parameters ?? [])
                    if (parameter is OpenApiParameter query && query.Name is "page" or "pageSize")
                        query.Schema = new OpenApiSchema { Type = JsonSchemaType.Integer, Format = "int32" };
                return Task.CompletedTask;
            })
            .ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(503);
        designs.MapGet("/{id}", async (string id, SavedDesignStore store) => await store.AdminDetails(id))
            .WithName("GetAdminDesign").Produces<AdminDesignDetails>()
            .ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(503);
        designs.MapGet("/{id}/image", async (string id, SavedDesignStore store, HttpContext http) =>
            {
                var file = await store.AdminImage(id);
                http.Response.Headers["X-Content-Type-Options"] = "nosniff";
                return Results.Stream(file.Content, file.ContentType);
            })
            .WithName("GetAdminDesignImage")
            .Produces(200, contentType: "image/png", additionalContentTypes: ["image/jpeg", "image/webp"])
            .AddOpenApiOperationTransformer((operation, _, _) =>
            {
                operation.Responses!["200"] = new OpenApiResponse
                {
                    Description = "Kayıtlı tasarım görseli",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["image/png"] = new() { Schema = new OpenApiSchema { Type = JsonSchemaType.String, Format = "binary" } },
                        ["image/jpeg"] = new() { Schema = new OpenApiSchema { Type = JsonSchemaType.String, Format = "binary" } },
                        ["image/webp"] = new() { Schema = new OpenApiSchema { Type = JsonSchemaType.String, Format = "binary" } }
                    }
                };
                return Task.CompletedTask;
            })
            .ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(503);
    }

    private static int Number(string? value, int fallback) => value is null ? fallback
        : int.TryParse(value, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out var number) ? number
        : throw new ProblemException("invalid_page", "Sayfa ve sayfa boyutu tam sayı olmalı.");
}
