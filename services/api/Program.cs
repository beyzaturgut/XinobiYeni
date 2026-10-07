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
    builder.Services.AddSingleton<QuestionBank>();
    builder.Services.AddHttpClient<IImageGenerationProvider, CloudflareImageProvider>(client => client.Timeout = TimeSpan.FromSeconds(120));
    builder.Services.AddSingleton<DesignSessionStore>();
    builder.Services.AddHostedService<DesignGenerationWorker>();
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
builder.Services.AddXinobiPersistence(builder.Configuration.GetConnectionString("Xinobi"));
// Outside Development the catalog answers 503 until the SQL Server source exists (Faz03 03.11).
builder.Services.TryAddSingleton<ICatalogSource, UnavailableCatalogSource>();
builder.Services.TryAddSingleton<IAccountStore, UnavailableAccountStore>();
builder.Services.TryAddSingleton(TimeProvider.System);
builder.Services.AddAuthentication(AccountTokenHandler.SchemeName).AddScheme<AuthenticationSchemeOptions, AccountTokenHandler>(AccountTokenHandler.SchemeName, null);
builder.Services.AddAuthorization();
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
app.UseAuthentication();
app.UseAuthorization();
app.MapLocalCommerce();
app.MapEmailVerification();
app.MapDesignStudio();
app.MapCatalog();
app.MapXinobiU();
app.MapAccounts();

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

app.Run();

public partial class Program;
