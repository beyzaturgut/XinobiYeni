var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var api = app.MapGroup("/api/v1");

api.MapGet("/health", () => Results.Ok(new
    {
        service = "Xinobi.Api",
        status = "healthy",
        timestampUtc = DateTimeOffset.UtcNow
    }))
    .WithName("GetApiHealth")
    .WithTags("System");

app.Run();

public partial class Program;
