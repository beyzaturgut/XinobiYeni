using Microsoft.AspNetCore.WebUtilities;
using Xinobi.Api.LocalCommerce;
using Xinobi.Api.DesignStudio;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Xinobi.Api.Contracts;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Infrastructure.Readiness;
using Xinobi.Api.Features.ProductSurfaces.Development;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
    builder.Services.AddSingleton<LocalCommerceStore>();
    builder.Services.AddSingleton<QuestionBank>();
    builder.Services.AddHttpClient<IImageGenerationProvider, CloudflareImageProvider>(client => client.Timeout = TimeSpan.FromSeconds(120));
    builder.Services.AddSingleton<DesignSessionStore>();
    if (builder.Configuration.GetValue("DesignStudio:WorkerEnabled", true)) builder.Services.AddHostedService<DesignGenerationWorker>();
    builder.Services.AddRateLimiter(options => {
        options.RejectionStatusCode = 429;
        options.AddPolicy("DesignStudio", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "local", _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    });
    builder.Services.AddCors(options => options.AddPolicy("LocalCommerce", policy => policy
        .WithOrigins("http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5173")
        .AllowAnyHeader().AllowAnyMethod()));
}
builder.Services.AddSingleton<ISqlServerReadinessProbe, SqlServerReadinessProbe>();
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Extensions["requestId"] = context.HttpContext.TraceIdentifier;
        context.ProblemDetails.Extensions["timestampUtc"] = DateTimeOffset.UtcNow;
    };
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<RequestCorrelationMiddleware>();
app.UseExceptionHandler();
app.UseStatusCodePages(async statusCodeContext =>
{
    var httpContext = statusCodeContext.HttpContext;
    var problem = Results.Problem(
        statusCode: httpContext.Response.StatusCode,
        title: ReasonPhrases.GetReasonPhrase(httpContext.Response.StatusCode),
        extensions: new Dictionary<string, object?>
        {
            ["requestId"] = httpContext.TraceIdentifier,
            ["timestampUtc"] = DateTimeOffset.UtcNow
        });

    await problem.ExecuteAsync(httpContext);
});
if (app.Environment.IsDevelopment()) { app.UseCors("LocalCommerce"); app.UseRateLimiter(); }
else app.UseHttpsRedirection();
app.MapLocalCommerce();
app.MapDesignStudio();

var api = app.MapGroup("/api/v1");

api.MapGet("/health", (HttpContext context) => TypedResults.Ok(new HealthResponse(
        Service: "Xinobi.Api",
        Status: "healthy",
        TimestampUtc: DateTimeOffset.UtcNow,
        RequestId: context.TraceIdentifier)))
    .WithName("GetApiHealth")
    .WithTags("System");

api.MapGet("/health/live", (HttpContext context) => TypedResults.Ok(new HealthResponse(
        Service: "Xinobi.Api",
        Status: "healthy",
        TimestampUtc: DateTimeOffset.UtcNow,
        RequestId: context.TraceIdentifier)))
    .WithName("GetApiLiveness")
    .WithTags("System");

api.MapGet("/health/ready", async (
        HttpContext context,
        ISqlServerReadinessProbe sqlServer,
        CancellationToken cancellationToken) =>
    {
        var check = await sqlServer.CheckAsync(cancellationToken);
        var response = new ReadinessResponse(
            Service: "Xinobi.Api",
            Status: check.IsReady ? "ready" : "not_ready",
            TimestampUtc: DateTimeOffset.UtcNow,
            RequestId: context.TraceIdentifier,
            Checks: [new DependencyHealth("sqlServer", check.IsReady, check.Code)]);

        return Results.Json(
            response,
            statusCode: check.IsReady
                ? StatusCodes.Status200OK
                : StatusCodes.Status503ServiceUnavailable);
    })
    .WithName("GetApiReadiness")
    .WithTags("System")
    .Produces<ReadinessResponse>(StatusCodes.Status200OK)
    .Produces<ReadinessResponse>(StatusCodes.Status503ServiceUnavailable);

if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("ProductSurfaces:DevelopmentReview:Enabled"))
{
    var root = app.Configuration["ProductSurfaces:DevelopmentReview:RepositoryRoot"]
        ?? Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "../.."));
    app.Services.GetRequiredService<Microsoft.Extensions.Options.IOptions<RouteHandlerOptions>>().Value.ThrowOnBadRequest = false;
    // Explicit single-call gate; startup and GET never invoke inference.
    var segmentation = new SurfaceSegmentationOptions
    {
        Provider = app.Configuration["ProductSurfaces:Segmentation:Provider"] ?? "reference",
        ExternalInferenceEnabled = app.Configuration.GetValue<bool>("ProductSurfaces:Segmentation:ExternalInferenceEnabled"),
        SingleAutomaticSmokeEnabled = app.Configuration.GetValue<bool>("ProductSurfaces:Segmentation:SingleAutomaticSmokeEnabled"),
        SingleInteractiveSmokeEnabled = app.Configuration.GetValue<bool>("ProductSurfaces:Segmentation:SingleInteractiveSmokeEnabled"),
        AutomaticSnapshotPath = app.Configuration["ProductSurfaces:Segmentation:AutomaticSnapshotPath"],
        AutomaticMaskPath = app.Configuration["ProductSurfaces:Segmentation:AutomaticMaskPath"],
        Roboflow = new RoboflowSegmentationOptions
        {
            BaseUrl = app.Configuration["ProductSurfaces:Segmentation:Roboflow:BaseUrl"] ?? "https://serverless.roboflow.com",
            TimeoutSeconds = app.Configuration.GetValue<int?>("ProductSurfaces:Segmentation:Roboflow:TimeoutSeconds") ?? 60
        }
    };
    var refinementEnabled = app.Configuration.GetValue<bool>("ProductSurfaces:DevelopmentReview:TeaMakerRefinementEnabled");
    if (refinementEnabled && (segmentation.Provider != "reference" || segmentation.ExternalInferenceEnabled || segmentation.SingleAutomaticSmokeEnabled || segmentation.SingleInteractiveSmokeEnabled))
        throw new InvalidOperationException("Local refinement cannot enable external inference.");
    if (segmentation.SingleAutomaticSmokeEnabled && segmentation.SingleInteractiveSmokeEnabled)
        throw new InvalidOperationException("Smoke operations must be mutually exclusive.");
    if (segmentation.SingleAutomaticSmokeEnabled || segmentation.SingleInteractiveSmokeEnabled)
        segmentation.Roboflow.ApiKey = app.Configuration["ProductSurfaces:Segmentation:Roboflow:ApiKey"];
    app.MapDevelopmentSurfaceReview(await DevelopmentSurfaceReview.CreateAsync(root, segmentation, teaMakerRefinementEnabled: refinementEnabled));
}

if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("ProductSurfaces:DevelopmentStorefrontPreview:Enabled"))
{
    var root = app.Configuration["ProductSurfaces:DevelopmentStorefrontPreview:RepositoryRoot"]
        ?? Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "../.."));
    app.MapDevelopmentAcceptedSurface(root);
}

app.Run();

public partial class Program;
