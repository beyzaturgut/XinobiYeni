using Microsoft.AspNetCore.WebUtilities;
using Xinobi.Api.LocalCommerce;
using Xinobi.Api.DesignStudio;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Xinobi.Api.Contracts;
using Xinobi.Api.Infrastructure;
using Xinobi.Api.Infrastructure.Readiness;
using Xinobi.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);
    builder.Services.AddSingleton<LocalCommerceStore>();
    builder.Services.AddSingleton<QuestionBank>();
    builder.Services.AddHttpClient<IImageGenerationProvider, CloudflareImageProvider>(client => client.Timeout = TimeSpan.FromSeconds(120));
    builder.Services.AddSingleton<DesignSessionStore>();
    builder.Services.AddHostedService<DesignGenerationWorker>();
    builder.Services.AddRateLimiter(options => {
        options.RejectionStatusCode = 429;
        options.AddPolicy("DesignStudio", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "local", _ => new FixedWindowRateLimiterOptions { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    });
    builder.Services.AddCors(options => options.AddPolicy("LocalCommerce", policy => policy
        .WithOrigins("http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5173")
        .AllowAnyHeader().AllowAnyMethod()));
}
builder.Services.AddXinobiPersistence(builder.Configuration.GetConnectionString("Xinobi"));
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

app.Run();

public partial class Program;
