using System.Text.Json;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Xinobi.Api.Infrastructure;

/// <summary>An API error with a stable <see cref="Code"/> for clients and a Turkish message for people.</summary>
public sealed class ProblemException(string code, string message, int status = StatusCodes.Status400BadRequest) : Exception(message)
{
    public string Code { get; } = code;
    public int Status { get; } = status;

    public static ProblemException Unavailable(string what) =>
        new("feature_unavailable", $"{what} şu anda kullanılamıyor.", StatusCodes.Status503ServiceUnavailable);

    public static ProblemException NotFound(string code, string message) => new(code, message, StatusCodes.Status404NotFound);
}

public static class ApiProblems
{
    public static ProblemHttpResult Problem(int status, string code, string title) =>
        TypedResults.Problem(statusCode: status, title: title, extensions: new Dictionary<string, object?> { ["code"] = code });

    /// <summary>Turns <see cref="ProblemException"/> into a problem response and marks the group no-store.</summary>
    public static TBuilder WithProblems<TBuilder>(this TBuilder builder) where TBuilder : IEndpointConventionBuilder
    {
        builder.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            try { return await next(context); }
            catch (ProblemException error) { return Problem(error.Status, error.Code, error.Message); }
        });
        return builder;
    }
}

/// <summary>
/// Development-only JSON document beside the local commerce data (ADR-003): one file, one lock, atomic replace.
/// Outside Development every access throws a 503 <see cref="ProblemException"/> until the SQL Server store lands (Faz03 03.11).
/// </summary>
public sealed class DevJsonStore<T>(string? directory, string relativePath, Func<T> empty, string feature) where T : class
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly SemaphoreSlim gate = new(1, 1);

    public static string? DataDirectory(IWebHostEnvironment environment, IConfiguration configuration) =>
        environment.IsDevelopment()
            ? configuration["LocalCommerce:DataDirectory"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "local-commerce")
            : null;

    public string Folder => Path.GetDirectoryName(FilePath)!;
    private string FilePath => Path.Combine(directory ?? throw ProblemException.Unavailable(feature), relativePath);

    private async Task<T> ReadCore() =>
        File.Exists(FilePath) ? JsonSerializer.Deserialize<T>(await File.ReadAllTextAsync(FilePath), JsonOptions) ?? empty() : empty();

    public async Task<T> Read()
    {
        await gate.WaitAsync();
        try { return await ReadCore(); }
        finally { gate.Release(); }
    }

    /// <summary>Runs <paramref name="change"/> on the current document under the lock and saves it unless it throws.</summary>
    public async Task<TResult> Update<TResult>(Func<T, TResult> change)
    {
        await gate.WaitAsync();
        try
        {
            var state = await ReadCore();
            var result = change(state);
            Directory.CreateDirectory(Folder);
            var temporary = FilePath + ".tmp";
            await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(state, JsonOptions));
            File.Move(temporary, FilePath, true);
            return result;
        }
        finally { gate.Release(); }
    }
}
