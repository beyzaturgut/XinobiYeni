using Microsoft.AspNetCore.Http;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Architecture.Tests;

public sealed class RequestCorrelationMiddlewareTests
{
    [Fact]
    public async Task PreservesValidClientRequestId()
    {
        var context = new DefaultHttpContext();
        context.Request.Headers[RequestCorrelationMiddleware.HeaderName] = "client-request-123";
        var middleware = new RequestCorrelationMiddleware(_ => Task.CompletedTask);

        await middleware.InvokeAsync(context);

        Assert.Equal("client-request-123", context.TraceIdentifier);
        Assert.Equal("client-request-123", context.Response.Headers[RequestCorrelationMiddleware.HeaderName]);
    }

    [Fact]
    public async Task ReplacesRequestIdThatExceedsTheSafeLength()
    {
        var context = new DefaultHttpContext();
        context.Request.Headers[RequestCorrelationMiddleware.HeaderName] = new string('x', 129);
        var middleware = new RequestCorrelationMiddleware(_ => Task.CompletedTask);

        await middleware.InvokeAsync(context);

        Assert.NotEqual(new string('x', 129), context.TraceIdentifier);
        Assert.Equal(context.TraceIdentifier, context.Response.Headers[RequestCorrelationMiddleware.HeaderName]);
    }
}

