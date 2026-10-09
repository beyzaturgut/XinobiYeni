using System.Text.Json;
using Microsoft.EntityFrameworkCore;
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
/// Chooses where feature documents live. Development keeps files beside the local commerce data until the one-time import
/// writes <c>features-sql.enabled</c>; <c>Features:StorageProvider=SqlServer</c> selects SQL in any environment. Without either,
/// non-Development environments answer 503.
/// </summary>
public sealed class FeatureDocuments(IWebHostEnvironment environment, IConfiguration configuration, IServiceScopeFactory scopes)
{
    public const string Marker = "features-sql.enabled";
    /// <summary>Every feature document, by its file under the data directory. The SQL name is the file name without extension.</summary>
    public static readonly string[] Files = ["notifications/notifications.json", "reviews/reviews.json", "quotes/quotes.json", "designs/designs.json", "assistant/assistant.json"];

    public string? DataDirectory { get; } = environment.IsDevelopment()
        ? configuration["LocalCommerce:DataDirectory"] ?? Path.Combine(environment.ContentRootPath, "App_Data", "local-commerce")
        : null;

    public bool UsesSql => configuration["Features:StorageProvider"] == "SqlServer"
        || configuration["Features:StorageProvider"] is null && DataDirectory is not null && File.Exists(Path.Combine(DataDirectory, Marker));

    public static string Name(string relativePath) => Path.GetFileNameWithoutExtension(relativePath);

    public DocumentStore<T> Open<T>(string relativePath, Func<T> empty, string feature) where T : class =>
        new(this, scopes, relativePath, empty, feature);
}

/// <summary>
/// One feature's state as a single JSON document: a file with an in-process lock and atomic replace (Development), or a row of
/// <c>ops.FeatureDocuments</c> replaced in a transaction under an application lock, so several API processes stay consistent.
/// </summary>
public sealed class DocumentStore<T>(FeatureDocuments documents, IServiceScopeFactory scopes, string relativePath, Func<T> empty, string feature) where T : class
{
    internal static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };
    private readonly SemaphoreSlim gate = new(1, 1);
    private readonly string name = FeatureDocuments.Name(relativePath);

    /// <summary>Folder for files that belong to the feature (Development file storage only).</summary>
    public string Folder => Path.GetDirectoryName(FilePath)!;
    private string FilePath => Path.Combine(documents.DataDirectory ?? throw ProblemException.Unavailable(feature), relativePath);

    private T Parse(string? json) => json is null ? empty() : JsonSerializer.Deserialize<T>(json, JsonOptions) ?? empty();

    private async Task<T> ReadFile() => Parse(File.Exists(FilePath) ? await File.ReadAllTextAsync(FilePath) : null);

    public async Task<T> Read()
    {
        if (documents.UsesSql) return await Sql(write: false, current => Task.FromResult((current, false)));
        await gate.WaitAsync();
        try { return await ReadFile(); }
        finally { gate.Release(); }
    }

    /// <summary>Runs <paramref name="change"/> on the current document under the lock and saves it unless it throws.</summary>
    public async Task<TResult> Update<TResult>(Func<T, TResult> change)
    {
        if (documents.UsesSql) return await Sql(write: true, current => Task.FromResult((change(current), true)));
        await gate.WaitAsync();
        try
        {
            var state = await ReadFile();
            var result = change(state);
            Directory.CreateDirectory(Folder);
            var temporary = FilePath + ".tmp";
            await File.WriteAllTextAsync(temporary, JsonSerializer.Serialize(state, JsonOptions));
            File.Move(temporary, FilePath, true);
            return result;
        }
        finally { gate.Release(); }
    }

    private async Task<TResult> Sql<TResult>(bool write, Func<T, Task<(TResult Result, bool Save)>> action)
    {
        try
        {
            await using var scope = scopes.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<Xinobi.Persistence.XinobiDbContext>();
            await using var transaction = await db.Database.BeginTransactionAsync();
            var mode = write ? "Exclusive" : "Shared";
            var resource = "Xinobi.Feature." + name;
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                DECLARE @result int;
                EXEC @result = sys.sp_getapplock @Resource={resource}, @LockMode={mode}, @LockOwner=N'Transaction', @LockTimeout=10000;
                IF @result < 0 THROW 51000, 'Feature lock unavailable', 1;
                """);
            var row = await db.FeatureDocuments.FirstOrDefaultAsync(x => x.Name == name);
            var state = Parse(row?.Json);
            var (result, save) = await action(state);
            if (save)
            {
                var json = JsonSerializer.Serialize(state, JsonOptions);
                if (row is null) db.FeatureDocuments.Add(new() { Name = name, Json = json, UpdatedAt = DateTimeOffset.UtcNow });
                else (row.Json, row.UpdatedAt) = (json, DateTimeOffset.UtcNow);
                await db.SaveChangesAsync();
            }
            await transaction.CommitAsync();
            return result;
        }
        catch (Exception error) when (error is Microsoft.Data.SqlClient.SqlException or DbUpdateException or InvalidOperationException { InnerException: Microsoft.Data.SqlClient.SqlException })
        {
            throw ProblemException.Unavailable(feature);
        }
    }
}
