using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xinobi.Api.Infrastructure;

namespace Xinobi.Architecture.Tests;

public sealed class ApiContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiContractTests(WebApplicationFactory<Program> factory)
    {
        _client = factory
            .WithWebHostBuilder(builder => builder.UseEnvironment("Development"))
            .CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
    }

    [Fact]
    public async Task HealthEndpointReturnsContractAndPreservesRequestId()
    {
        const string requestId = "integration-health-001";
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/health");
        request.Headers.Add(RequestCorrelationMiddleware.HeaderName, requestId);

        using var response = await _client.SendAsync(request);
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(requestId, response.Headers.GetValues(RequestCorrelationMiddleware.HeaderName).Single());
        Assert.Equal("Xinobi.Api", payload.RootElement.GetProperty("service").GetString());
        Assert.Equal("healthy", payload.RootElement.GetProperty("status").GetString());
        Assert.Equal(requestId, payload.RootElement.GetProperty("requestId").GetString());
        Assert.True(payload.RootElement.TryGetProperty("timestampUtc", out _));
    }

    [Fact]
    public async Task UnknownEndpointReturnsProblemDetailsWithRequestId()
    {
        const string requestId = "integration-not-found-001";
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/unknown");
        request.Headers.Add(RequestCorrelationMiddleware.HeaderName, requestId);

        using var response = await _client.SendAsync(request);
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(404, payload.RootElement.GetProperty("status").GetInt32());
        Assert.Equal(requestId, payload.RootElement.GetProperty("requestId").GetString());
        Assert.True(payload.RootElement.TryGetProperty("timestampUtc", out _));
    }

    [Fact]
    public async Task OpenApiDocumentPublishesHealthEndpoint()
    {
        using var response = await _client.GetAsync("/openapi/v1.json");
        using var payload = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var healthOperation = payload.RootElement
            .GetProperty("paths")
            .GetProperty("/api/v1/health")
            .GetProperty("get");
        var responseSchema = healthOperation
            .GetProperty("responses")
            .GetProperty("200")
            .GetProperty("content")
            .GetProperty("application/json")
            .GetProperty("schema");

        Assert.Equal("#/components/schemas/HealthResponse", responseSchema.GetProperty("$ref").GetString());
        Assert.True(payload.RootElement
            .GetProperty("components")
            .GetProperty("schemas")
            .TryGetProperty("HealthResponse", out _));
    }
}
