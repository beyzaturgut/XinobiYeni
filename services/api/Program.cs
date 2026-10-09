using System.Text.Json.Serialization;
using Microsoft.AspNetCore.WebUtilities;
using Xinobi.Api.LocalCommerce;
using Xinobi.Api.DesignStudio;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Xinobi.Api.Contracts;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Infrastructure.Readiness;
using Xinobi.Persistence;
using Xinobi.Api.Catalog;
using Xinobi.Api.XinobiU;
using Xinobi.Api.Identity;
using Microsoft.AspNetCore.Authentication;
using Xinobi.Api.EmailVerification;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Xinobi.Api.Features.ProductSurfaces.Development;
using Xinobi.Api.Infrastructure.Segmentation.Roboflow;

if (args.Contains(Cm101CandidateCommand.Mode, StringComparer.Ordinal))
{
    Environment.ExitCode = await Cm101CandidateCommand.RunAsync(args);
    return;
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
// Numbers travel as JSON numbers only, so the contract and generated clients type them as plain integers.
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
    builder.Services.AddSingleton<LocalCommerceStore>();
    builder.Services.AddSingleton(TimeProvider.System);
    if (builder.Configuration["Email:DeliveryMode"] == "Preview")
        builder.Services.AddSingleton<IVerificationEmailSender, PreviewVerificationEmailSender>();
    else if (builder.Configuration["Email:DeliveryMode"] == "Smtp")
        builder.Services.AddSingleton<IVerificationEmailSender, SmtpVerificationEmailSender>();
    else
        builder.Services.AddHttpClient<IVerificationEmailSender, ResendVerificationEmailSender>(client => client.Timeout = TimeSpan.FromSeconds(20));
    builder.Services.AddSingleton<EmailVerificationStore>();
    builder.Services.AddSingleton<IAccountStore, DevFileAccountStore>();
    builder.Services.AddSingleton<ICatalogSource, LocalCommerceCatalogSource>();
    // Per-variant surface masking (admin); Roboflow only on an explicit admin action, key from user-secrets.
    builder.Services.AddSingleton<Xinobi.Api.Features.ProductSurfaces.Catalog.ProductSurfaceWorkspace>();
    builder.Services.AddHttpClient("roboflow", client => client.Timeout = TimeSpan.FromSeconds(130))
        .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false, UseCookies = false });
    builder.Services.AddSingleton<QuestionBank>();
    builder.Services.AddHttpClient<IImageGenerationProvider, CloudflareImageProvider>(client => client.Timeout = TimeSpan.FromSeconds(120));
    builder.Services.AddSingleton<DesignSessionStore>();
    if (builder.Configuration.GetValue("DesignStudio:WorkerEnabled", true)) builder.Services.AddHostedService<DesignGenerationWorker>();
    builder.Services.AddRateLimiter(options => {
        options.RejectionStatusCode = 429;
        options.AddPolicy("EmailVerification", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "local", _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
        options.AddPolicy("Account", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "local", _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
        options.AddPolicy("DesignStudio", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "local", _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    });
    builder.Services.AddCors(options => options.AddPolicy("LocalCommerce", policy => policy
        .WithOrigins("http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5173")
        // Credentials let the web session cookie travel to the API; origins stay an explicit allow-list.
        .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
}
// ADR-002 Ek B: the test server may open XINOBI U (off by default). Cloudflare credentials come from server environment variables.
var xinobiUOnTestServer = !builder.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("XinobiU:Enabled");
if (xinobiUOnTestServer)
{
    builder.Services.AddSingleton<QuestionBank>();
    builder.Services.AddHttpClient<IImageGenerationProvider, CloudflareImageProvider>(client => client.Timeout = TimeSpan.FromSeconds(120));
    builder.Services.AddSingleton<DesignSessionStore>();
    builder.Services.AddHostedService<DesignGenerationWorker>();
    builder.Services.AddRateLimiter(options => {
        options.RejectionStatusCode = 429;
        options.AddPolicy("DesignStudio", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    });
    builder.Services.AddCors(options => options.AddPolicy(DesignStudioAccess.CorsPolicy, policy => policy
        .WithOrigins(DesignStudioAccess.AllowedOrigins(builder.Configuration)).AllowAnyHeader().WithMethods("GET", "POST")));
}
builder.Services.AddXinobiPersistence(builder.Configuration.GetConnectionString("Xinobi"));
// Outside Development the catalog reads the published snapshot when one is configured, otherwise it answers 503
// until the SQL Server source exists (Faz03 03.11).
if (builder.Configuration["Catalog:SnapshotPath"] is { Length: > 0 } snapshotPath)
    builder.Services.TryAddSingleton<ICatalogSource>(new SnapshotCatalogSource(snapshotPath));
builder.Services.TryAddSingleton<ICatalogSource, UnavailableCatalogSource>();
builder.Services.TryAddSingleton<IAccountStore, UnavailableAccountStore>();
builder.Services.TryAddSingleton(TimeProvider.System);
builder.Services.AddAuthentication(AccountTokenHandler.SchemeName).AddScheme<AuthenticationSchemeOptions, AccountTokenHandler>(AccountTokenHandler.SchemeName, null);
// Default deny (Faz03 03.04): an endpoint without its own rule needs a signed-in account; public endpoints say AllowAnonymous.
builder.Services.AddAuthorization(options =>
{
    // Requests matching no endpoint stay a plain 404 instead of an authentication challenge.
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAssertion(context => context.User.Identity?.IsAuthenticated == true || context.Resource is HttpContext { } http && http.GetEndpoint() is null)
        .Build();
    options.AddPolicy(PermissionAuthorization.StaffPolicy, policy => policy.RequireAuthenticatedUser().RequireClaim(ClaimTypes.Role));
});
builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionAuthorization.PolicyProvider>();
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

if (args.Length >= 2 && args[0] == SuperAdminBootstrap.Command)
{
    Environment.ExitCode = await SuperAdminBootstrap.Run(app.Services.GetRequiredService<IAccountStore>(), args[1], Console.Out);
    return;
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
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
            ["timestampUtc"] = DateTimeOffset.UtcNow,
            ["code"] = httpContext.Response.StatusCode switch { 401 => "unauthorized", 403 => "forbidden", _ => null },
        });

    await problem.ExecuteAsync(httpContext);
});
if (app.Environment.IsDevelopment()) { app.UseCors("LocalCommerce"); app.UseRateLimiter(); }
else
{
    app.UseHttpsRedirection();
    if (xinobiUOnTestServer) { app.UseCors(DesignStudioAccess.CorsPolicy); app.UseRateLimiter(); }
}
app.UseAuthentication();
app.UseAuthorization();
app.MapLocalCommerce();
if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("ProductSurfaces:ExperimentalCatalogWorkspace:Enabled"))
    Xinobi.Api.Features.ProductSurfaces.Catalog.ProductSurfaceEndpoints.MapProductSurfaces(app);
app.MapEmailVerification();
app.MapDesignStudio();
app.MapCatalog();
app.MapXinobiU();
app.MapAccounts();

var api = app.MapGroup("/api/v1").AllowAnonymous();

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

if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("ProductSurfaces:DevelopmentReview:Enabled") && !app.Configuration.GetValue<bool>("ProductSurfaces:Cm101AdminAutomatic:Enabled"))
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

app.MapCm101AdminCandidate();
app.Run();

public partial class Program;
