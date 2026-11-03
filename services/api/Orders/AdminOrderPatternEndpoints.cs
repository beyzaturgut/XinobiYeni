using System.Text.RegularExpressions;
using Microsoft.OpenApi;
using Xinobi.Api.Designs;
using Xinobi.Api.Identity;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Api.Orders;

/// <summary>
/// SIP-TAS-04: the raw pattern copied into an order line, as its own download for staff with <c>orders.read</c>. The file is resolved
/// on the server from the order and line only (never from a client path), served byte for byte with its real type, and refused when
/// the copy no longer matches what the order recorded. Product photo and composition downloads are separate tasks.
/// </summary>
public static partial class AdminOrderPatternEndpoints
{
    public static void Map(RouteGroupBuilder admin)
    {
        admin.MapGet("/orders/{id}/lines/{line:int}/pattern", async (string id, int line, IAccountStore accounts, SavedDesignStore designs, HttpContext http) =>
        {
            var order = await Find(accounts, id);
            if (line < 0 || line >= order.Lines.Length || order.Lines[line].Personalization is not { } design)
                throw ProblemException.NotFound("order_line_design_not_found", "Bu sipariş satırında tasarım yok.");
            var file = await designs.OrderImage(order.Id, line, design.Mime, design.Files?.Pattern)
                ?? throw ProblemException.NotFound("order_pattern_not_found", "Bu sipariş satırının desen dosyası bulunamadı.");
            byte[] bytes;
            await using (file)
            {
                using var buffer = new MemoryStream();
                await file.Content.CopyToAsync(buffer);
                bytes = buffer.ToArray();
            }
            // The type comes from the bytes; a copy that disagrees with what the order recorded is not served under either name.
            string mime, extension;
            try { (mime, extension) = SavedDesignStore.DetectImage(bytes); }
            catch (ProblemException) { throw ProblemException.Unavailable("Sipariş desen dosyası"); }
            if (mime != design.Mime || design.Files is { } files && files.Pattern.Mime != mime)
                throw ProblemException.Unavailable("Sipariş desen dosyası");
            http.Response.Headers["X-Content-Type-Options"] = "nosniff";
            http.Response.Headers.CacheControl = "no-store";
            return Results.File(bytes, mime, FileName(order, line, design, extension));
        })
        .RequirePermission("orders.read").WithProblems().WithName("DownloadAdminOrderLinePattern")
        .WithSummary("Sipariş satırına kopyalanmış ham deseni özgün baytlarıyla indirir; ürün fotoğrafı veya giydirilmiş önizleme değildir.")
        .Produces(200, contentType: "image/png", additionalContentTypes: ["image/jpeg", "image/webp"])
        .AddOpenApiOperationTransformer((operation, _, _) =>
        {
            operation.Responses!["200"] = new OpenApiResponse
            {
                Description = "Ham desen dosyası (attachment)",
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

    /// <summary>The order as staff see it; SQL by key, the Development file store by id.</summary>
    private static async Task<CustomerOrder> Find(IAccountStore accounts, string id)
    {
        CustomerOrder? order;
        if (accounts is SqlAccountStore sql)
            order = Guid.TryParse(id, out var key) && key != Guid.Empty ? (await sql.StaffOrderById(key))?.Order : null;
        else
            order = (await accounts.AllOrders()).FirstOrDefault(item => item.Order.Id == id)?.Order;
        return order ?? throw ProblemException.NotFound("order_not_found", "Sipariş bulunamadı.");
    }

    /// <summary>e.g. <c>xinobi-XN-261103-1234-satir-1-desen-rev3.png</c>: order, 1-based line and placement revision when there is one.</summary>
    public static string FileName(CustomerOrder order, int line, OrderPersonalization design, string extension)
    {
        var number = UnsafeName().Replace(order.Number, "-").Trim('-');
        var revision = design.ConfigurationRevision is { } value ? $"-rev{value}" : "";
        return $"xinobi-{(number.Length > 0 ? number : order.Id)}-satir-{line + 1}-desen{revision}{extension}";
    }

    [GeneratedRegex("[^A-Za-z0-9-]+")]
    private static partial Regex UnsafeName();
}
