using Microsoft.AspNetCore.WebUtilities;
using Xinobi.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
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
app.UseHttpsRedirection();

var api = app.MapGroup("/api/v1");

api.MapGet("/health", (HttpContext context) => Results.Ok(new
    {
        service = "Xinobi.Api",
        status = "healthy",
        timestampUtc = DateTimeOffset.UtcNow,
        requestId = context.TraceIdentifier
    }))
    .WithName("GetApiHealth")
    .WithTags("System");

app.Run();

public partial class Program;
