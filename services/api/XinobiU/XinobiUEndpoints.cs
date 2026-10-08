using System.Net;
using Microsoft.AspNetCore.Http.HttpResults;
using Xinobi.Api.Catalog;
using Xinobi.Api.DesignStudio;
using Xinobi.Api.LocalCommerce;

namespace Xinobi.Api.XinobiU;

// Public XINOBI U contract for web and mobile. `ClientId` is a random per-install (or per-browser) UUID; no personal data is collected.
public record XinobiUStatus(bool GenerationAvailable, string QuestionBankVersion, int QuestionCount);
/// <summary>Omit <c>VariantId</c> to let the server pick the product's first photographed variant (colour does not affect the design).</summary>
public record CreateXinobiUSession(string ProductId, string? VariantId, string ClientId);
public record XinobiUAnswer(string QuestionId, string OptionId);
public record XinobiUGenerationRequest(XinobiUAnswer[] Answers);
public record XinobiUOption(string Id, string Label);
public record XinobiUQuestion(string Id, string Axis, string AxisLabel, string Text, XinobiUOption[] Options);
public record XinobiUProduct(string Id, string Name, string Category);
public record XinobiUVariant(string Id, string Color, string? Hex, string? ImageUrl);
public record XinobiUSession(
    string Id,
    string Status,
    DateTimeOffset ExpiresAt,
    XinobiUProduct Product,
    XinobiUVariant Variant,
    string QuestionBankVersion,
    XinobiUQuestion[] Questions,
    XinobiUAnswer[] Answers,
    string? ImageUrl,
    string? ErrorCode,
    string? ErrorMessage);

public static class XinobiUSessionStatuses
{
    public const string Questionnaire = "questionnaire";
    public const string Queued = "queued";
    public const string Running = "running";
    public const string Ready = "ready";
    public const string Failed = "failed";
}

public static class XinobiUEndpoints
{
    /// <summary>
    /// Always mapped so the contract and generated clients include it. It shares the design store and safeguards of /api/v1/design-studio
    /// (<see cref="DesignStudioAccess"/>, rate limit, daily limit, idempotent generation). Development serves it to loopback callers (ADR-002 Ek A);
    /// the test server serves it when <c>XinobiU:Enabled</c> is set (ADR-002 Ek B); otherwise it answers 503 until user identity,
    /// moderation and retention land (Faz10).
    /// </summary>
    public static void MapXinobiU(this WebApplication app)
    {
        var group = app.MapGroup("/api/v1/xinobi-u").WithTags("XinobiU").AllowAnonymous();
        if (DesignStudioAccess.Enabled(app.Environment, app.Configuration)) group.RequireRateLimiting("DesignStudio");
        group.AddEndpointFilter(async (context, next) =>
        {
            var http = context.HttpContext;
            http.Response.Headers.CacheControl = "no-store";
            if (http.RequestServices.GetService<DesignSessionStore>() is null)
                return Problem(StatusCodes.Status503ServiceUnavailable, "xinobi_u_unavailable", "XINOBI U şu anda kullanılamıyor.");
            if (!DesignStudioAccess.Allowed(http)) return Results.StatusCode(StatusCodes.Status403Forbidden);
            try { return await next(context); }
            catch (ArgumentException error) { return Problem(StatusCodes.Status400BadRequest, "invalid_request", error.Message); }
            catch (KeyNotFoundException) { return SessionExpired(); }
            catch (DesignProviderException error) { return Problem(StatusFor(error.Code), error.Code, error.Message); }
        }).ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        group.MapGet("/status", (HttpContext http) =>
            {
                var bank = http.RequestServices.GetRequiredService<QuestionBank>();
                var provider = http.RequestServices.GetRequiredService<IImageGenerationProvider>();
                return TypedResults.Ok(new XinobiUStatus(provider.IsConfigured, bank.Data.Version, bank.Data.Questions.Length));
            })
            .WithName("GetXinobiUStatus");

        group.MapPost("/sessions", async Task<Results<Ok<XinobiUSession>, ProblemHttpResult>> (CreateXinobiUSession request, HttpContext http) =>
                TypedResults.Ok(ToContract(await Store(http).Create(new CreateDesignSession(request.ProductId, request.VariantId, request.ClientId)), http)))
            .WithName("CreateXinobiUSession")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapGet("/sessions/{id}", async Task<Results<Ok<XinobiUSession>, ProblemHttpResult>> (string id, HttpContext http) =>
                await Store(http).Get(id) is { } session ? TypedResults.Ok(ToContract(session, http)) : SessionExpired())
            .WithName("GetXinobiUSession");

        group.MapPost("/sessions/{id}/generation", async Task<Results<Ok<XinobiUSession>, ProblemHttpResult>> (string id, XinobiUGenerationRequest request, HttpContext http) =>
                TypedResults.Ok(ToContract(await Store(http).Generate(id, new GenerateDesignRequest(
                    request.Answers?.Select(answer => new DesignAnswer(answer.QuestionId, answer.OptionId)).ToArray()!)), http)))
            .WithName("StartXinobiUGeneration")
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapGet("/sessions/{id}/image", async (string id, HttpContext http) =>
                await Store(http).Asset(id) is { } asset && File.Exists(asset.Path) ? Results.File(asset.Path, asset.Mime) : SessionExpired())
            .WithName("GetXinobiUImage")
            .Produces(StatusCodes.Status200OK, typeof(Stream), "image/png", "image/jpeg")
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static DesignSessionStore Store(HttpContext http) => http.RequestServices.GetRequiredService<DesignSessionStore>();

    private static int StatusFor(string code) => code switch
    {
        "answers_locked" or "questionnaire_updated" => StatusCodes.Status409Conflict,
        _ when code.Contains("limit", StringComparison.Ordinal) => StatusCodes.Status429TooManyRequests,
        _ => StatusCodes.Status503ServiceUnavailable,
    };

    private static ProblemHttpResult Problem(int status, string code, string title) =>
        TypedResults.Problem(statusCode: status, title: title, extensions: new Dictionary<string, object?> { ["code"] = code });

    private static ProblemHttpResult SessionExpired() =>
        Problem(StatusCodes.Status404NotFound, "session_expired", "Tasarım oturumu bulunamadı veya süresi doldu.");

    private static XinobiUSession ToContract(SessionView session, HttpContext http)
    {
        var configuration = http.RequestServices.GetRequiredService<IConfiguration>();
        var development = http.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();
        string? Url(string? path) => CatalogEndpoints.ResolveUrl(path, http.Request, configuration["Catalog:AssetBaseUrl"], development);
        return new XinobiUSession(
            session.Id, session.Status, session.ExpiresAt,
            new XinobiUProduct(session.Product.Id, session.Product.Name, session.Product.Category),
            new XinobiUVariant(session.Variant.Id, session.Variant.Color, session.Variant.Hex, Url(session.Variant.Image)),
            session.BankVersion,
            session.Questions.Select(question => new XinobiUQuestion(question.Id, question.Axis, question.AxisLabel, question.Text,
                question.Options.Select(option => new XinobiUOption(option.Id, option.Label)).ToArray())).ToArray(),
            session.Answers.Select(answer => new XinobiUAnswer(answer.QuestionId, answer.OptionId)).ToArray(),
            session.Status == XinobiUSessionStatuses.Ready ? Url($"/api/v1/xinobi-u/sessions/{session.Id}/image") : null,
            session.ErrorCode, session.ErrorMessage);
    }
}
