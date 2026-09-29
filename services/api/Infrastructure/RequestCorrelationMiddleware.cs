using System.Diagnostics;

namespace Xinobi.Api.Infrastructure;

public sealed class RequestCorrelationMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Request-Id";
    private const int MaximumRequestIdLength = 128;

    public async Task InvokeAsync(HttpContext context)
    {
        var suppliedRequestId = context.Request.Headers[HeaderName].FirstOrDefault();
        var requestId = IsValid(suppliedRequestId)
            ? suppliedRequestId!
            : Activity.Current?.TraceId.ToString() ?? context.TraceIdentifier;

        context.TraceIdentifier = requestId;
        context.Response.Headers[HeaderName] = requestId;

        await next(context);
    }

    private static bool IsValid(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= MaximumRequestIdLength &&
        value.All(character => character is >= (char)33 and <= (char)126);
}

